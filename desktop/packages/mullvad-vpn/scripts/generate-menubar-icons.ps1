# generate-menubar-icons.ps1
#
# PowerShell port of generate-menubar-icons.sh for Windows. Generates PNG/ICO
# menubar/tray icons from SVG sources in ../assets/images/menubar-icons/svg/.
#
# Output layout matches the bash version exactly:
#   - darwin/: lock-N.png, lock-N@2x.png, lock-NTemplate.png(@2x), _notification variants
#   - linux/:  lock-N.png, lock-N_white.png, _notification variants, lock-placeholder.png
#   - win32/:  lock-N.ico, lock-N_white.ico, lock-N_black.ico, _notification variants
#
# Requirements (Windows):
#   - ImageMagick 7+ (provides `magick`). Install: winget install ImageMagick.ImageMagick
#   - Optional: rsvg-convert (provides cleaner SVG rasterization than IM's MSVG).
#       Install: winget install GNOME.Librsvg     (or scoop install librsvg)
#     If rsvg-convert is missing, the script falls back to `magick` for SVG rendering.
#
# PowerShell 5.1 compatible. UTF-8 (no BOM) used for any text I/O.
#
# Usage (from desktop/packages/mullvad-vpn/):
#   powershell -ExecutionPolicy Bypass -File .\scripts\generate-menubar-icons.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# --- tool discovery ---
$magickCmd = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magickCmd) {
    Write-Error "ImageMagick (magick) is required. Install via: winget install ImageMagick.ImageMagick"
    exit 1
}
$magick = $magickCmd.Source

$rsvgCmd = Get-Command rsvg-convert -ErrorAction SilentlyContinue
$rsvg = if ($rsvgCmd) { $rsvgCmd.Source } else { $null }
if (-not $rsvg) {
    Write-Warning "rsvg-convert not found. Falling back to ImageMagick for SVG rasterization."
    Write-Warning "  For sharper SVG output install: winget install GNOME.Librsvg"
}

# --- paths ---
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MenubarIconsDir = Join-Path $ScriptDir '..\assets\images\menubar-icons'
$MenubarIconsDir = (Resolve-Path $MenubarIconsDir).Path

$SvgDir     = Join-Path $MenubarIconsDir 'svg'
$MacosDir   = Join-Path $MenubarIconsDir 'darwin'
$WindowsDir = Join-Path $MenubarIconsDir 'win32'
$LinuxDir   = Join-Path $MenubarIconsDir 'linux'

foreach ($d in @($MacosDir, $WindowsDir, $LinuxDir)) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

$TmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("menubar-icons-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

# Match the bash COMPRESSION_OPTIONS array
$CompressionOptions = @(
    '-define', 'png:compression-filter=5',
    '-define', 'png:compression-level=9',
    '-define', 'png:compression-strategy=1',
    '-define', 'png:exclude-chunk=all',
    '-strip'
)

# Run a native exe and fail loudly. Avoids the PS-5.1 stderr-wrapping trap.
function Invoke-Native {
    param([string]$Exe, [string[]]$Args)
    & $Exe @Args
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed (exit $LASTEXITCODE): $Exe $($Args -join ' ')"
    }
}

# Write a string to a file as UTF-8 without BOM.
function Write-Utf8NoBom {
    param([string]$Path, [string]$Content)
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

# Render an SVG file to a PNG of the requested width/height.
# Prefers rsvg-convert when available, falls back to ImageMagick.
function Convert-SvgToPng {
    param(
        [string]$SvgPath,
        [string]$PngPath,
        [int]$Width,
        [int]$Height,
        # Optional rsvg-convert layout args (used by the notification renderer)
        [int]$Left = -1,
        [int]$PageWidth = -1,
        [int]$PageHeight = -1
    )
    if ($rsvg) {
        $cmdArgs = @('-o', $PngPath, '-w', $Width, '-h', $Height)
        if ($Left -ge 0)       { $cmdArgs += @('--left', $Left) }
        if ($PageWidth -gt 0)  { $cmdArgs += @('--page-width', $PageWidth) }
        if ($PageHeight -gt 0) { $cmdArgs += @('--page-height', $PageHeight) }
        $cmdArgs += $SvgPath
        Invoke-Native -Exe $rsvg -Args $cmdArgs
    } else {
        # ImageMagick fallback. Note: IM uses Inkscape/RSVG if installed, otherwise its MSVG reader.
        $cmdArgs = @('-background', 'none', '-density', '384',
                     ('svg:' + $SvgPath), '-resize', ($Width.ToString() + 'x' + $Height.ToString()), $PngPath)
        Invoke-Native -Exe $magick -Args $cmdArgs
        if ($PageWidth -gt 0 -and ($PageWidth -ne $Width -or $PageHeight -ne $Height)) {
            # Emulate rsvg-convert's --left / --page-width by padding with transparent background.
            $left = if ($Left -ge 0) { $Left } else { 0 }
            $geom = "+$left+0"
            $extent = $PageWidth.ToString() + 'x' + $PageHeight.ToString()
            $cmdArgs = @($PngPath, '-background', 'none',
                         '-gravity', 'NorthWest', '-splice', $geom,
                         '-extent', $extent, $PngPath)
            Invoke-Native -Exe $magick -Args $cmdArgs
        }
    }
}

# Generates the lock png (mirror of bash `generate_lock_png`).
function New-LockPng {
    param([string]$SvgSourcePath, [string]$PngTargetPath, [int]$TargetSize, [int]$TargetPadding)
    $inner = $TargetSize - ($TargetPadding * 2)
    $tmp = Join-Path $TmpDir 'tmp.png'
    Convert-SvgToPng -SvgPath $SvgSourcePath -PngPath $tmp -Width $inner -Height $inner

    $extent = $TargetSize.ToString() + 'x' + $TargetSize.ToString()
    $cmdArgs = @('-background', 'transparent', $tmp, '-gravity', 'center', '-extent', $extent)
    $cmdArgs += $CompressionOptions
    $cmdArgs += $PngTargetPath
    Invoke-Native -Exe $magick -Args $cmdArgs
}

# Append notification icon to the right (rectangle layout). Mirrors bash `append_notification_icon`.
function Add-NotificationIconRight {
    param([string]$SourcePath, [string]$TargetPath, [int]$Width, [int]$Padding = 0)
    $size = $Width + 2
    $notifTmp = Join-Path $TmpDir 'notification.png'

    $svgNotif = Join-Path $SvgDir 'notification.svg'
    Convert-SvgToPng -SvgPath $svgNotif -PngPath $notifTmp -Width $size -Height $size `
        -Left $Padding -PageWidth ($size + $Padding) -PageHeight $size

    $cmdArgs = @('-strip', '-background', 'transparent', '-colorspace', 'sRGB', '-gravity', 'center',
                 '+append', $SourcePath, $notifTmp, $TargetPath)
    Invoke-Native -Exe $magick -Args $cmdArgs
    Remove-Item $notifTmp -Force
}

# Overlay notification icon in the bottom-right corner (square layout). Mirrors `overlay_notification_icon`.
function Add-NotificationIconOverlay {
    param([string]$SourcePath, [string]$TargetPath, [int]$Size)
    $notifTmp = Join-Path $TmpDir 'notification.png'

    $svgNotif = Join-Path $SvgDir 'notification.svg'
    Convert-SvgToPng -SvgPath $svgNotif -PngPath $notifTmp -Width $Size -Height $Size

    $cmdArgs = @('-strip', '-background', 'transparent', '-composite', '-colorspace', 'sRGB',
                 '-gravity', 'SouthEast', $SourcePath, $notifTmp, $TargetPath)
    Invoke-Native -Exe $magick -Args $cmdArgs
    Remove-Item $notifTmp -Force
}

function New-RectangleVariant {
    param(
        [string]$SvgSourcePath, [string]$PngTargetPath, [string]$PngNotificationTargetPath,
        [int]$TargetSize, [int]$TargetPadding, [int]$NotificationWidth
    )
    New-LockPng -SvgSourcePath $SvgSourcePath -PngTargetPath $PngTargetPath `
        -TargetSize $TargetSize -TargetPadding $TargetPadding
    Add-NotificationIconRight -SourcePath $PngTargetPath -TargetPath $PngNotificationTargetPath `
        -Width $NotificationWidth
}

function New-SquareVariant {
    param(
        [string]$SvgSourcePath, [string]$PngTargetPath, [string]$PngNotificationTargetPath,
        [int]$TargetSize, [int]$TargetPadding, [int]$NotificationWidth
    )
    New-LockPng -SvgSourcePath $SvgSourcePath -PngTargetPath $PngTargetPath `
        -TargetSize $TargetSize -TargetPadding $TargetPadding
    Add-NotificationIconOverlay -SourcePath $PngTargetPath -TargetPath $PngNotificationTargetPath `
        -Size $NotificationWidth
}

# Build a Windows ICO (16/32/48 with 4/8-bit RDP variants) plus matching _notification.ico.
function New-WindowsIco {
    param([string]$SvgSourcePath, [string]$IcoTargetBasePath)

    $tmpFiles = New-Object System.Collections.Generic.List[string]
    $tmpFilesNotif = New-Object System.Collections.Generic.List[string]

    foreach ($size in 16, 32, 48) {
        $padding = [int]($size / 16)
        $notifSize = [int]($size / 2)
        $base = Join-Path $TmpDir $size

        New-SquareVariant -SvgSourcePath $SvgSourcePath `
            -PngTargetPath ("$base.png") `
            -PngNotificationTargetPath ("${base}_notification.png") `
            -TargetSize $size -TargetPadding $padding -NotificationWidth $notifSize

        # 4- and 8-bit reduced palette versions for RDP rendering.
        Invoke-Native -Exe $magick -Args @('-colors', '256', '+dither', "$base.png", "png8:$base-8.png")
        Invoke-Native -Exe $magick -Args @('-colors', '16',  '+dither', "$base-8.png", "$base-4.png")

        Invoke-Native -Exe $magick -Args @('-colors', '256', '+dither',
            "${base}_notification.png", "png8:${base}_notification-8.png")
        Invoke-Native -Exe $magick -Args @('-colors', '16',  '+dither',
            "${base}_notification-8.png", "${base}_notification-4.png")

        $tmpFiles.Add("$base.png")
        $tmpFiles.Add("$base-8.png")
        $tmpFiles.Add("$base-4.png")
        $tmpFilesNotif.Add("${base}_notification.png")
        $tmpFilesNotif.Add("${base}_notification-8.png")
        $tmpFilesNotif.Add("${base}_notification-4.png")
    }

    $cmdArgs = @() + $tmpFiles + $CompressionOptions + @("$IcoTargetBasePath.ico")
    Invoke-Native -Exe $magick -Args $cmdArgs

    $cmdArgs = @() + $tmpFilesNotif + $CompressionOptions + @("${IcoTargetBasePath}_notification.ico")
    Invoke-Native -Exe $magick -Args $cmdArgs

    foreach ($f in $tmpFiles + $tmpFilesNotif) { Remove-Item $f -Force }
}

# Generates the placeholder icon used as the initial Linux tray icon.
function New-Placeholder {
    param([string]$IconName)
    $svg = Join-Path $SvgDir ($IconName + '.svg')
    $png = Join-Path $LinuxDir ($IconName + '.png')
    New-LockPng -SvgSourcePath $svg -PngTargetPath $png -TargetSize 48 -TargetPadding 4
}

# Generates all variants for one animation frame.
function New-Frame {
    param([string]$IconName, [string]$MonoSourceName)

    $svg = Join-Path $SvgDir ($IconName + '.svg')
    $monoSvg = Join-Path $SvgDir ($MonoSourceName + '.svg')

    $blackSvg = Join-Path $TmpDir 'black.svg'
    $whiteSvg = Join-Path $TmpDir 'white.svg'

    $macosBase   = Join-Path $MacosDir   $IconName
    $linuxBase   = Join-Path $LinuxDir   $IconName
    $windowsBase = Join-Path $WindowsDir $IconName

    # sed -E 's/#[0-9a-fA-F]{6}/#000000/g' / '#FFFFFF/g'
    $monoContent = [System.IO.File]::ReadAllText($monoSvg, [System.Text.UTF8Encoding]::new($false))
    $hexPattern = '#[0-9a-fA-F]{6}'
    $blackContent = [regex]::Replace($monoContent, $hexPattern, '#000000')
    $whiteContent = [regex]::Replace($monoContent, $hexPattern, '#FFFFFF')
    Write-Utf8NoBom -Path $blackSvg -Content $blackContent
    Write-Utf8NoBom -Path $whiteSvg -Content $whiteContent

    Write-Host "  [macOS] $IconName"
    New-RectangleVariant -SvgSourcePath $svg `
        -PngTargetPath "$macosBase.png" `
        -PngNotificationTargetPath "${macosBase}_notification.png" `
        -TargetSize 22 -TargetPadding 3 -NotificationWidth 4
    New-RectangleVariant -SvgSourcePath $svg `
        -PngTargetPath "${macosBase}@2x.png" `
        -PngNotificationTargetPath "${macosBase}_notification@2x.png" `
        -TargetSize 44 -TargetPadding 6 -NotificationWidth 8

    New-RectangleVariant -SvgSourcePath $blackSvg `
        -PngTargetPath "${macosBase}Template.png" `
        -PngNotificationTargetPath "${macosBase}_notificationTemplate.png" `
        -TargetSize 22 -TargetPadding 3 -NotificationWidth 4
    New-RectangleVariant -SvgSourcePath $blackSvg `
        -PngTargetPath "${macosBase}Template@2x.png" `
        -PngNotificationTargetPath "${macosBase}_notificationTemplate@2x.png" `
        -TargetSize 44 -TargetPadding 6 -NotificationWidth 8

    Write-Host "  [linux] $IconName"
    New-SquareVariant -SvgSourcePath $svg `
        -PngTargetPath "$linuxBase.png" `
        -PngNotificationTargetPath "${linuxBase}_notification.png" `
        -TargetSize 48 -TargetPadding 4 -NotificationWidth 24

    New-SquareVariant -SvgSourcePath $whiteSvg `
        -PngTargetPath "${linuxBase}_white.png" `
        -PngNotificationTargetPath "${linuxBase}_white_notification.png" `
        -TargetSize 48 -TargetPadding 4 -NotificationWidth 24

    Write-Host "  [win32] $IconName"
    New-WindowsIco -SvgSourcePath $svg          -IcoTargetBasePath $windowsBase
    New-WindowsIco -SvgSourcePath $whiteSvg     -IcoTargetBasePath "${windowsBase}_white"
    New-WindowsIco -SvgSourcePath $blackSvg     -IcoTargetBasePath "${windowsBase}_black"

    Remove-Item $blackSvg -Force
    Remove-Item $whiteSvg -Force
}

try {
    Write-Host "Generating menubar icons..."
    Write-Host "  source : $SvgDir"
    Write-Host "  darwin : $MacosDir"
    Write-Host "  linux  : $LinuxDir"
    Write-Host "  win32  : $WindowsDir"
    Write-Host "  tmp    : $TmpDir"
    Write-Host ""

    New-Placeholder -IconName 'lock-placeholder'

    foreach ($f in 1..9) {
        New-Frame -IconName "lock-$f" -MonoSourceName "lock-$f"
    }
    # The colored lock-10 has a red circle; the mono one is a hole, so lock-10_mono is used as
    # the source for the monochrome (white/black) variants.
    New-Frame -IconName 'lock-10' -MonoSourceName 'lock-10_mono'

    Write-Host ""
    Write-Host "Done."
}
finally {
    if (Test-Path $TmpDir) {
        Remove-Item $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

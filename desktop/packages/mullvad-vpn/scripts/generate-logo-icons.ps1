# generate-logo-icons.ps1
#
# PowerShell port of build-logo-icons.sh for Windows. Regenerates:
#   - dist-assets/icon-macos.icns       (macOS .icns from graphics/macOS/*.png)
#   - dist-assets/icon.icns             (Linux .icns from graphics/icon.svg)
#   - dist-assets/icon.ico              (Windows .ico from graphics/icon.svg)
#   - dist-assets/windows/installersidebar.bmp (NSIS sidebar)
#   - packages/mullvad-vpn/assets/images/icon-notification.png (128x128)
#   - packages/mullvad-vpn/assets/images/logo-icon.svg (copy of source)
#
# Notes for this fork:
#   The upstream bash script uses ../../graphics and ../../dist-assets from
#   gui/scripts. After the desktop/packages refactor those relative paths break.
#   This script auto-detects the real repo root and uses absolute paths.
#
# macOS .icns generation:
#   The upstream script uses macOS-only `iconutil`. On Windows we build the .icns
#   directly with ImageMagick (`magick ... icon.icns`). The resulting file is a
#   valid macOS .icns container provided ImageMagick >= 7 is installed.
#
# Requirements (Windows):
#   - ImageMagick 7+ (provides `magick`)
#       winget install ImageMagick.ImageMagick
#   - Optional: rsvg-convert (sharper SVG rendering than IM's MSVG)
#       winget install GNOME.Librsvg     (or scoop install librsvg)
#
# Usage (from desktop/packages/mullvad-vpn/):
#   powershell -ExecutionPolicy Bypass -File .\scripts\generate-logo-icons.ps1
#
# Skips the interactive "press enter" prompt from the bash version.

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

function Invoke-Native {
    param([string]$Exe, [string[]]$Args)
    & $Exe @Args
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed (exit $LASTEXITCODE): $Exe $($Args -join ' ')"
    }
}

# --- paths ---
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MullvadVpnDir = (Resolve-Path (Join-Path $ScriptDir '..')).Path
$AssetsImagesDir = Join-Path $MullvadVpnDir 'assets\images'

# Locate the repo root (containing graphics/ and dist-assets/) by walking up from
# the script directory. Falls back to the upstream "../../" location if found.
function Resolve-RepoDir {
    param([string]$Folder)
    # Check upstream-style location first (../../<Folder>) for legacy compat.
    $upstream = Join-Path $ScriptDir ("..\..\" + $Folder)
    if (Test-Path $upstream) { return (Resolve-Path $upstream).Path }
    # Walk up looking for a sibling that has the folder.
    $cur = $ScriptDir
    for ($i = 0; $i -lt 8; $i++) {
        $candidate = Join-Path $cur $Folder
        if (Test-Path $candidate) { return (Resolve-Path $candidate).Path }
        $parent = Split-Path -Parent $cur
        if (-not $parent -or $parent -eq $cur) { break }
        $cur = $parent
    }
    return $null
}

$GraphicsDir = Resolve-RepoDir 'graphics'
$DistAssetsDir = Resolve-RepoDir 'dist-assets'

if (-not $GraphicsDir) {
    Write-Error "Could not locate 'graphics/' directory. Expected at the repo root or at desktop/packages/graphics."
    exit 1
}
if (-not $DistAssetsDir) {
    Write-Error "Could not locate 'dist-assets/' directory. Expected at the repo root or at desktop/packages/dist-assets."
    exit 1
}

$SvgSource = Join-Path $GraphicsDir 'icon.svg'
if (-not (Test-Path $SvgSource)) {
    Write-Error "Source SVG not found: $SvgSource"
    exit 1
}

$DistWindowsDir = Join-Path $DistAssetsDir 'windows'
if (-not (Test-Path $DistWindowsDir)) {
    New-Item -ItemType Directory -Path $DistWindowsDir -Force | Out-Null
}

$TmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("logo-icons-" + [Guid]::NewGuid().ToString('N'))
$TmpIconsetDir = Join-Path $TmpDir 'icon.iconset'
$TmpIcoDir = Join-Path $TmpDir 'ico'
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null
New-Item -ItemType Directory -Path $TmpIconsetDir -Force | Out-Null
New-Item -ItemType Directory -Path $TmpIcoDir -Force | Out-Null

$CompressionOptions = @(
    '-define', 'png:compression-filter=5',
    '-define', 'png:compression-level=9',
    '-define', 'png:compression-strategy=1',
    '-define', 'png:exclude-chunk=all',
    '-strip'
)

function Convert-SvgToPng {
    param([string]$SvgPath, [string]$PngPath, [int]$Width, [int]$Height)
    if ($rsvg) {
        Invoke-Native -Exe $rsvg -Args @('-o', $PngPath, '-w', $Width, '-h', $Height, $SvgPath)
    } else {
        Invoke-Native -Exe $magick -Args @(
            '-background', 'none', '-density', '512',
            ('svg:' + $SvgPath),
            '-resize', ($Width.ToString() + 'x' + $Height.ToString()),
            $PngPath
        )
    }
}

try {
    Write-Host "Repo root resolved:"
    Write-Host "  graphics/   -> $GraphicsDir"
    Write-Host "  dist-assets/-> $DistAssetsDir"
    Write-Host ""

    # ---- macOS .icns (icon-macos.icns) from pre-rendered graphics/macOS/*.png ----
    $macosSrcDir = Join-Path $GraphicsDir 'macOS'
    if (Test-Path $macosSrcDir) {
        Write-Host "Building icon-macos.icns from graphics/macOS/ ..."
        Get-ChildItem -Path $macosSrcDir -File | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $TmpIconsetDir -Force
        }

        # ImageMagick can build a multi-image .icns directly. List PNGs in size order.
        $icnsTarget = Join-Path $DistAssetsDir 'icon-macos.icns'
        $pngs = Get-ChildItem -Path $TmpIconsetDir -File -Filter '*.png' | Sort-Object Name
        $cmdArgs = @() + ($pngs | ForEach-Object { $_.FullName }) + @('-strip', $icnsTarget)
        Invoke-Native -Exe $magick -Args $cmdArgs

        Get-ChildItem -Path $TmpIconsetDir -File | Remove-Item -Force
    } else {
        Write-Warning "graphics/macOS/ not found; skipping icon-macos.icns"
    }

    # ---- Linux .icns (icon.icns) generated from graphics/icon.svg ----
    Write-Host "Building icon.icns from graphics/icon.svg ..."
    foreach ($size in 16, 32, 128, 256, 512) {
        $double = $size * 2
        Convert-SvgToPng -SvgPath $SvgSource `
            -PngPath (Join-Path $TmpIconsetDir ("icon-$size.png")) `
            -Width $size -Height $size
        Convert-SvgToPng -SvgPath $SvgSource `
            -PngPath (Join-Path $TmpIconsetDir ("icon-$size@2x.png")) `
            -Width $double -Height $double
    }
    $icnsTarget = Join-Path $DistAssetsDir 'icon.icns'
    $pngs = Get-ChildItem -Path $TmpIconsetDir -File -Filter '*.png' | Sort-Object Name
    $cmdArgs = @() + ($pngs | ForEach-Object { $_.FullName }) + @('-strip', $icnsTarget)
    Invoke-Native -Exe $magick -Args $cmdArgs
    Remove-Item -Path $TmpIconsetDir -Recurse -Force

    # ---- Windows .ico (icon.ico) from graphics/icon.svg ----
    Write-Host "Building icon.ico from graphics/icon.svg ..."
    foreach ($size in 16, 20, 24, 30, 32, 36, 40, 48, 60, 64, 72, 80, 96, 256, 512) {
        Convert-SvgToPng -SvgPath $SvgSource `
            -PngPath (Join-Path $TmpIcoDir ($size.ToString() + '.png')) `
            -Width $size -Height $size
    }
    $icoTarget = Join-Path $DistAssetsDir 'icon.ico'
    # Numeric sort so resolutions are ordered correctly inside the .ico container.
    $icoPngs = Get-ChildItem -Path $TmpIcoDir -File -Filter '*.png' |
        Sort-Object { [int]([System.IO.Path]::GetFileNameWithoutExtension($_.Name)) }
    $cmdArgs = @() + ($icoPngs | ForEach-Object { $_.FullName }) + $CompressionOptions + @($icoTarget)
    Invoke-Native -Exe $magick -Args $cmdArgs
    Remove-Item -Path $TmpIcoDir -Recurse -Force

    # ---- Windows installer sidebar (bmp3) ----
    Write-Host "Building installersidebar.bmp ..."
    $sidebarPath = Join-Path $TmpDir 'sidebar.png'
    $sidebarLogoSize = 234
    Convert-SvgToPng -SvgPath $SvgSource -PngPath $sidebarPath `
        -Width $sidebarLogoSize -Height $sidebarLogoSize

    $sidebarBmp = Join-Path $DistWindowsDir 'installersidebar.bmp'
    $extent = $sidebarLogoSize.ToString() + 'x314'
    Invoke-Native -Exe $magick -Args @(
        '-background', '#294D73', $sidebarPath,
        '-gravity', 'center', '-extent', $extent,
        '-gravity', 'west', '-crop', '164x314+10+0',
        ('bmp3:' + $sidebarBmp)
    )
    Remove-Item $sidebarPath -Force

    # ---- GUI notification icon (128x128) ----
    Write-Host "Building assets/images/icon-notification.png ..."
    $notifTarget = Join-Path $AssetsImagesDir 'icon-notification.png'
    Convert-SvgToPng -SvgPath $SvgSource -PngPath $notifTarget -Width 128 -Height 128

    # ---- GUI in-app icon (raw SVG copy) ----
    Write-Host "Copying logo-icon.svg ..."
    Copy-Item -Path $SvgSource -Destination (Join-Path $AssetsImagesDir 'logo-icon.svg') -Force

    Write-Host ""
    Write-Host "Done."
}
finally {
    if (Test-Path $TmpDir) {
        Remove-Item -Path $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

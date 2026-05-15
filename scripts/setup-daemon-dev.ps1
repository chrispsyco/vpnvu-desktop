# =============================================================================
# setup-daemon-dev.ps1
# -----------------------------------------------------------------------------
# Setup helper for running the Mullvad / VPN.vu daemon in development mode
# on Windows. Verifies binaries, copies the auxiliary DLLs the daemon loads
# at runtime, checks resource files, and prints a ready-to-copy command for
# launching the daemon under the SYSTEM account (via PsExec) or as a Windows
# service.
#
# Usage:
#     # Default (standalone run via PsExec)
#     .\scripts\setup-daemon-dev.ps1
#
#     # Register the daemon as a Windows Service (MullvadVPN)
#     .\scripts\setup-daemon-dev.ps1 -RegisterAsService
#
#     # Dry-run (show what would happen without copying)
#     .\scripts\setup-daemon-dev.ps1 -WhatIf
# =============================================================================

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [switch]$RegisterAsService
)

$ErrorActionPreference = 'Stop'

# -----------------------------------------------------------------------------
# Paths
# -----------------------------------------------------------------------------
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = (Resolve-Path (Join-Path $scriptDir '..')).Path
$distDir   = Join-Path $repoRoot 'dist-assets'
$debugDir  = Join-Path $repoRoot 'target\debug'

# -----------------------------------------------------------------------------
# Pretty printers (ASCII only, PowerShell 5.1 safe)
# -----------------------------------------------------------------------------
function Write-Section($title) {
    Write-Host ''
    Write-Host ('== ' + $title + ' ' + ('=' * [Math]::Max(0, 70 - $title.Length))) -ForegroundColor Cyan
}

function Write-Ok($msg)   { Write-Host ('[OK]   ' + $msg) -ForegroundColor Green }
function Write-Miss($msg) { Write-Host ('[MISS] ' + $msg) -ForegroundColor Red }
function Write-Info($msg) { Write-Host ('[..]   ' + $msg) -ForegroundColor Yellow }
function Write-Skip($msg) { Write-Host ('[SKIP] ' + $msg) -ForegroundColor DarkGray }

$issues = New-Object System.Collections.Generic.List[string]

# -----------------------------------------------------------------------------
# 1. Prerequisites
# -----------------------------------------------------------------------------
Write-Section 'Prerequisites'

# Daemon binary
$daemonCandidates = @(
    (Join-Path $debugDir  'mullvad-daemon.exe'),
    (Join-Path $distDir   'mullvad-daemon.exe')
)
$daemonPath = $null
foreach ($candidate in $daemonCandidates) {
    if (Test-Path $candidate) {
        $daemonPath = $candidate
        Write-Ok ("mullvad-daemon.exe found at: $candidate")
        break
    }
}
if (-not $daemonPath) {
    Write-Miss 'mullvad-daemon.exe NOT found in target\debug or dist-assets.'
    Write-Host '       Build it first:  cargo build -p mullvad-daemon' -ForegroundColor DarkYellow
    $issues.Add('Daemon binary missing. Run `cargo build -p mullvad-daemon`.')
}

# PsExec (only relevant when not registering as service)
$psexecCmd = Get-Command psexec.exe -ErrorAction SilentlyContinue
if (-not $psexecCmd) { $psexecCmd = Get-Command psexec -ErrorAction SilentlyContinue }
if ($psexecCmd) {
    Write-Ok ("PsExec found at: " + $psexecCmd.Source)
} else {
    if ($RegisterAsService) {
        Write-Skip 'PsExec not installed (not required for -RegisterAsService mode).'
    } else {
        Write-Miss 'PsExec not found on PATH.'
        Write-Host '       Install via:  winget install Microsoft.Sysinternals.PsTools' -ForegroundColor DarkYellow
        Write-Host '       Or download:  https://learn.microsoft.com/sysinternals/downloads/psexec' -ForegroundColor DarkYellow
        $issues.Add('PsExec missing. Install with winget or extract from Sysinternals zip.')
    }
}

# BFE (Base Filtering Engine) service. winfw depends on it.
try {
    $bfe = Get-Service -Name 'BFE' -ErrorAction Stop
    if ($bfe.Status -eq 'Running') {
        Write-Ok ('BFE service is Running (required by winfw).')
    } else {
        Write-Miss ('BFE service status: ' + $bfe.Status + '. Start with:  sc start BFE')
        $issues.Add('Base Filtering Engine (BFE) is not running.')
    }
} catch {
    Write-Miss 'Could not query BFE service. Run as admin or check Windows install.'
    $issues.Add('Unable to query BFE service status.')
}

# -----------------------------------------------------------------------------
# 2. Copy auxiliary DLLs into dist-assets/
# -----------------------------------------------------------------------------
Write-Section 'Auxiliary DLLs -> dist-assets/'

# source -> destination map
$dllMap = @(
    [pscustomobject]@{
        Name = 'wintun.dll'
        Src  = (Join-Path $repoRoot 'dist-assets\binaries\x86_64-pc-windows-msvc\wintun\wintun.dll')
        Dst  = (Join-Path $distDir 'wintun.dll')
    },
    [pscustomobject]@{
        Name = 'wireguard.dll'
        Src  = (Join-Path $repoRoot 'dist-assets\binaries\x86_64-pc-windows-msvc\wireguard-nt\wireguard.dll')
        Dst  = (Join-Path $distDir 'wireguard.dll')
    },
    [pscustomobject]@{
        Name = 'winfw.dll'
        Src  = (Join-Path $repoRoot 'windows\winfw\bin\x64-Debug\winfw.dll')
        Dst  = (Join-Path $distDir 'winfw.dll')
    }
)

$copied   = New-Object System.Collections.Generic.List[string]
$existing = New-Object System.Collections.Generic.List[string]
$missing  = New-Object System.Collections.Generic.List[string]

foreach ($dll in $dllMap) {
    if (-not (Test-Path $dll.Src)) {
        Write-Miss ("Source not found for " + $dll.Name + " : " + $dll.Src)
        $missing.Add($dll.Name)
        $issues.Add(($dll.Name + ' source missing at ' + $dll.Src))
        continue
    }

    if (Test-Path $dll.Dst) {
        $srcInfo = Get-Item $dll.Src
        $dstInfo = Get-Item $dll.Dst
        if ($srcInfo.Length -eq $dstInfo.Length) {
            Write-Skip ($dll.Name + ' already present (same size) -> ' + $dll.Dst)
            $existing.Add($dll.Name)
            continue
        } else {
            Write-Info ($dll.Name + ' exists but size differs (src=' + $srcInfo.Length + ', dst=' + $dstInfo.Length + '). Re-copying.')
        }
    }

    if ($PSCmdlet.ShouldProcess($dll.Dst, ('Copy ' + $dll.Name))) {
        Copy-Item -Path $dll.Src -Destination $dll.Dst -Force
        Write-Ok ('Copied ' + $dll.Name + ' -> ' + $dll.Dst)
        $copied.Add($dll.Name)
    } else {
        Write-Info ('Would copy ' + $dll.Name + ' -> ' + $dll.Dst + ' (WhatIf)')
    }
}

# -----------------------------------------------------------------------------
# 3. Resource files
# -----------------------------------------------------------------------------
Write-Section 'Resource files'

$resources = @(
    [pscustomobject]@{ Name = 'ca.crt';                Path = (Join-Path $distDir 'ca.crt') },
    [pscustomobject]@{ Name = 'relays/relays.json';    Path = (Join-Path $distDir 'relays\relays.json') },
    [pscustomobject]@{ Name = 'maybenot_machines';     Path = (Join-Path $distDir 'maybenot_machines') },
    [pscustomobject]@{ Name = 'api-ip-address.txt';    Path = (Join-Path $distDir 'api-ip-address.txt') }
)

foreach ($res in $resources) {
    if (Test-Path $res.Path) {
        $size = (Get-Item $res.Path).Length
        if ($size -eq 0) {
            Write-Info ($res.Name + ' present but EMPTY (size=0). Daemon may need this populated.')
        } else {
            Write-Ok ($res.Name + ' present (' + $size + ' bytes).')
        }
    } else {
        # api-ip-address.txt is optional. Only warn for the rest.
        if ($res.Name -eq 'api-ip-address.txt') {
            Write-Skip ($res.Name + ' not present (optional).')
        } else {
            Write-Miss ($res.Name + ' MISSING at ' + $res.Path)
            $issues.Add(($res.Name + ' missing from dist-assets.'))
        }
    }
}

# -----------------------------------------------------------------------------
# 4. Summary + ready-to-copy command
# -----------------------------------------------------------------------------
Write-Section 'Summary'

Write-Host ('Copied this run : ' + ($copied.Count))   -ForegroundColor Green
foreach ($n in $copied)   { Write-Host ('   + ' + $n) -ForegroundColor Green }

Write-Host ('Already present : ' + ($existing.Count)) -ForegroundColor DarkGray
foreach ($n in $existing) { Write-Host ('   = ' + $n) -ForegroundColor DarkGray }

Write-Host ('Missing sources : ' + ($missing.Count))  -ForegroundColor Red
foreach ($n in $missing)  { Write-Host ('   - ' + $n) -ForegroundColor Red }

Write-Section 'Run the daemon'

$daemonForRun = $daemonPath
if (-not $daemonForRun) { $daemonForRun = (Join-Path $debugDir 'mullvad-daemon.exe') }

if ($RegisterAsService) {
    Write-Host 'Register + start the daemon as a Windows Service (run from an elevated shell):' -ForegroundColor White
    Write-Host ''
    Write-Host ('   "' + $daemonForRun + '" --register-service') -ForegroundColor Yellow
    Write-Host  '   sc start MullvadVPN'                          -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Stop / remove later with:' -ForegroundColor White
    Write-Host  '   sc stop MullvadVPN'                           -ForegroundColor DarkYellow
    Write-Host  '   sc delete MullvadVPN'                         -ForegroundColor DarkYellow
} else {
    Write-Host 'Run interactively as SYSTEM (verbose). From an admin PowerShell:' -ForegroundColor White
    Write-Host ''
    Write-Host  '   psexec.exe -i -s cmd.exe'                                              -ForegroundColor Yellow
    Write-Host  '   :: inside the new SYSTEM cmd.exe window:'                              -ForegroundColor DarkGray
    Write-Host ('   set MULLVAD_RESOURCE_DIR=' + $distDir)                                 -ForegroundColor Yellow
    Write-Host ('   "' + $daemonForRun + '" -vv')                                          -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Tip: PsExec needs to accept its EULA on first launch. Add -accepteula:' -ForegroundColor DarkGray
    Write-Host  '   psexec.exe -accepteula -i -s cmd.exe'                                  -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 5. Caveats
# -----------------------------------------------------------------------------
Write-Section 'Caveats'

Write-Host '* The daemon MUST run with Administrator or SYSTEM privileges. It manages'  -ForegroundColor Gray
Write-Host '  WFP filters, routes, and the WireGuard/Wintun virtual adapters.'           -ForegroundColor Gray
Write-Host ''
Write-Host '* Base Filtering Engine (BFE) service must be running:'                      -ForegroundColor Gray
Write-Host '     sc query BFE'                                                            -ForegroundColor DarkGray
Write-Host '     sc start BFE     (if not running)'                                       -ForegroundColor DarkGray
Write-Host ''
Write-Host '* When the daemon runs as SYSTEM, settings live under:'                       -ForegroundColor Gray
Write-Host '     C:\Windows\System32\config\systemprofile\AppData\Local\Mullvad VPN\'     -ForegroundColor DarkGray
Write-Host '  NOT under your user profile. Delete that folder to reset state.'           -ForegroundColor Gray
Write-Host ''
Write-Host '* Daemon log:'                                                                -ForegroundColor Gray
Write-Host '     C:\ProgramData\Mullvad VPN\daemon.log'                                   -ForegroundColor DarkGray
Write-Host ''
Write-Host '* MULLVAD_RESOURCE_DIR tells the daemon where to find ca.crt, relays.json,'   -ForegroundColor Gray
Write-Host '  maybenot_machines and the wintun/wireguard/winfw DLLs. Without it the'     -ForegroundColor Gray
Write-Host '  daemon falls back to the install dir (which does not exist in dev).'       -ForegroundColor Gray
Write-Host ''

if ($issues.Count -gt 0) {
    Write-Section ('Issues to fix (' + $issues.Count + ')')
    foreach ($i in $issues) { Write-Host ('  ! ' + $i) -ForegroundColor Red }
    exit 1
} else {
    Write-Host ''
    Write-Host '[DONE] Setup looks clean. Daemon is ready to launch.' -ForegroundColor Green
    exit 0
}

# Open IPTV Pro Rust Lab v4.23.17 / Tauri 2
# Windows bootstrap + test + NSIS. Scoped to experiment/rust-tauri-v2.
# Installs Node/Rust only if missing. MSVC install is NEVER silently retried;
# Visual Studio organization policy errors require interactive resolution.
# Does NOT touch the Electron main application, Git branches, or user IPTV data.
# Windows PowerShell 5.1+; run from an Administrator PowerShell to install missing VS C++ tools.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$root = $PSScriptRoot
$logDir = Join-Path $root 'build-logs'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$logPath = Join-Path $logDir 'WINDOWS_TAURI_LAST.log'
$transcriptStarted = $false

function Refresh-ToolPath {
  $paths = @(
    [Environment]::GetEnvironmentVariable('Path', 'Machine'),
    [Environment]::GetEnvironmentVariable('Path', 'User'),
    $env:Path,
    (Join-Path $env:ProgramFiles 'nodejs'),
    (Join-Path $env:APPDATA 'npm'),
    (Join-Path $env:USERPROFILE '.cargo\bin'),
    (Join-Path $env:LOCALAPPDATA 'Programs\nodejs')
  ) | Where-Object { $_ }
  # Avoid repeatedly duplicating PATH entries after each installer refresh.
  $uniqueParts = @($paths | ForEach-Object { $_ -split ';' } | Where-Object { $_ -and $_.Trim() } | Select-Object -Unique)
  $env:Path = ($uniqueParts -join ';')
}

function Has-Tool([string]$tool) {
  return [bool](Get-Command $tool -ErrorAction SilentlyContinue)
}

function Install-WingetPackage([string]$packageId, [string]$extraOverride = '') {
  if (-not (Has-Tool 'winget.exe')) {
    throw "Khong tim thay WinGet. Cai/App Installer: https://aka.ms/getwinget ; sau do chay lai script."
  }
  Write-Host "Dang cai $packageId bang WinGet ..." -ForegroundColor Cyan
  $args = @('install','--id',$packageId,'--exact','--source','winget','--accept-package-agreements','--accept-source-agreements','--disable-interactivity')
  if ($extraOverride) { $args += @('--override',$extraOverride) }
  & winget.exe @args
  $exit = $LASTEXITCODE
  Refresh-ToolPath
  if ($exit -ne 0) {
    Write-Warning "WinGet bao ma $exit cho $packageId. Kiem tra lai thanh phan da co truoc khi tiep tuc."
  }
}

# Read Node's native --version output (e.g. v26.13.1). Do NOT use
# node -p with nested quote escaping through Windows PowerShell 5.1:
# it may transform split(".") into split(.) and incorrectly flag Node as missing.
function Get-NodeMajor {
  if (-not (Has-Tool 'node.exe')) { return $null }
  try {
    $versionText = [string]((& node.exe --version | Select-Object -First 1))
    if ($LASTEXITCODE -ne 0) { return $null }
    if ($versionText.Trim() -match '^v([0-9]+)\.') {
      return [int]$Matches[1]
    }
  } catch {
    return $null
  }
  return $null
}

function Assert-Node {
  Refresh-ToolPath
  $major = Get-NodeMajor
  $npmPresent = Has-Tool 'npm.cmd'
  if ($null -eq $major -or $major -lt 22 -or -not $npmPresent) {
    Write-Host '[1/6] Node.js 22+ / npm chua san sang, cai Node LTS neu can ...' -ForegroundColor Yellow
    Install-WingetPackage 'OpenJS.NodeJS.LTS'
    Refresh-ToolPath
    $major = Get-NodeMajor
    $npmPresent = Has-Tool 'npm.cmd'
    if ($null -eq $major -or $major -lt 22 -or -not $npmPresent) {
      throw 'Khong tim thay Node.js 22+ hoac npm sau cai dat. Mo PowerShell moi, kiem tra node --version va npm --version, sau do thu lai.'
    }
  }
  Write-Host "Node: $(& node.exe --version)  | npm: $(& npm.cmd --version)" -ForegroundColor Green
}

function Assert-Rust {
  Refresh-ToolPath
  if (-not (Has-Tool 'rustup.exe')) {
    Write-Host '[2/6] Chua co Rustup; se cai Rust ...' -ForegroundColor Yellow
    Install-WingetPackage 'Rustlang.Rustup'
    Refresh-ToolPath
  }
  if (-not (Has-Tool 'rustup.exe')) {
    throw 'Khong tim thay rustup sau khi cai. Mo PowerShell moi va chay lai.'
  }
  # A successful installation should not download/synchronize the toolchain on
  # every subsequent build. This is especially important on slow connections.
  $installed = [string]((& rustup.exe toolchain list 2>$null) -join "`n")
  if ($installed -notmatch 'stable-x86_64-pc-windows-msvc') {
    & rustup.exe toolchain install stable-x86_64-pc-windows-msvc --profile minimal
    if ($LASTEXITCODE -ne 0) { throw 'Cai MSVC Rust toolchain that bai.' }
  }
  $active = [string]((& rustup.exe show active-toolchain 2>$null) -join "`n")
  if ($active -notmatch '^stable-x86_64-pc-windows-msvc') {
    & rustup.exe default stable-x86_64-pc-windows-msvc
    if ($LASTEXITCODE -ne 0) { throw 'Dat MSVC Rust toolchain that bai.' }
  }
  Refresh-ToolPath
  if (-not ((Has-Tool 'cargo.exe') -and (Has-Tool 'rustc.exe'))) {
    throw 'Khong tim thay Cargo/Rustc. Mo PowerShell moi va chay lai.'
  }
  Write-Host "Rust: $(& rustc.exe --version)  | $(& cargo.exe --version)" -ForegroundColor Green
}

function Get-VSWhere {
  $candidates = @()
  if (${env:ProgramFiles(x86)}) { $candidates += (Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe') }
  if ($env:ProgramFiles) { $candidates += (Join-Path $env:ProgramFiles 'Microsoft Visual Studio\Installer\vswhere.exe') }
  foreach ($p in ($candidates | Select-Object -Unique)) {
    if (Test-Path -LiteralPath $p -PathType Leaf) { return $p }
  }
  $discovered = Get-Command 'vswhere.exe' -ErrorAction SilentlyContinue
  if ($discovered) { return $discovered.Source }
  return $null
}

function Get-VSInstall {
  $vswhere = Get-VSWhere
  if (-not $vswhere) { return $null }
  # -products * includes Build Tools, Community, Professional and Enterprise.
  # -all supports Visual Studio 2022/2026 rather than assuming an edition/year.
  $paths = @(& $vswhere -all -products '*' -requires 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64' -property installationPath 2>$null)
  foreach ($p in $paths) {
    if (-not $p) { continue }
    $folder = [string]$p
    $dev = Join-Path $folder.Trim() 'Common7\Tools\VsDevCmd.bat'
    if (Test-Path -LiteralPath $dev -PathType Leaf) { return $folder.Trim() }
  }
  return $null
}

function Show-MSVCInstallHelp([string]$explanation) {
  $hint = Join-Path $logDir 'MSVC_INSTALL_REQUIRED.txt'
  $message = @"
WINDOWS BUILD BLOCKED: MSVC C++ and Windows SDK

$explanation

Node.js and Rust are installed; do NOT reinstall them.
Visual Studio Installer/WinGet previously returned policy code 8008:
  Organization policies are preventing installation.
A project script cannot override a Windows organizational policy.

SAFE ACTIONS:
1. Open Visual Studio Installer from Start menu, or:
   C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe
2. If Visual Studio / Build Tools already exists: Modify.
   Otherwise download official Microsoft Build Tools:
   https://visualstudio.microsoft.com/visual-cpp-build-tools/
3. Select: Desktop development with C++
   Keep MSVC x64/x86 build tools and Windows 10/11 SDK selected.
4. If installation is refused with the same organization-policy warning,
   an administrator/device owner must allow the official installer.
   Do not repeatedly run WinGet or disable security controls.
5. After successful installation, run BUILD_WINDOWS_TAURI.ps1 again.

Tauri Windows requirements: https://v2.tauri.app/start/prerequisites/
"@
  $message | Set-Content -LiteralPath $hint -Encoding UTF8
  Write-Host ''
  Write-Host '================ C++ TOOLCHAIN REQUIRED ================' -ForegroundColor Yellow
  Write-Host $message -ForegroundColor Yellow
  Write-Host "Saved: $hint" -ForegroundColor Cyan
}

function Assert-VSTools {
  Write-Host '[3/6] Kiem tra MSVC, linker va Windows SDK (khong auto-cai lai) ...' -ForegroundColor Cyan
  $present = (Has-Tool 'cl.exe') -and (Has-Tool 'link.exe') -and (Has-Tool 'rc.exe')
  if ($present) {
    Write-Host 'MSVC + SDK da duoc nap san (Developer PowerShell): OK' -ForegroundColor Green
    return
  }
  $vs = Get-VSInstall
  if (-not $vs) {
    Show-MSVCInstallHelp 'Khong tim thay installation co C++ workload qua vswhere.'
    throw 'MSVC x64 khong san sang. Xem build-logs\MSVC_INSTALL_REQUIRED.txt; can cai C++ workload thu cong.'
  }
  $vsDev = Join-Path $vs 'Common7\Tools\VsDevCmd.bat'
  $command = '"' + $vsDev + '" -arch=amd64 -host_arch=amd64 >nul && set'
  $vars = @(& $env:ComSpec /d /s /c $command)
  if ($LASTEXITCODE -ne 0) {
    Show-MSVCInstallHelp "VsDevCmd bi loi: $vsDev"
    throw 'Khong khoi tao duoc VS x64 Developer environment.'
  }
  foreach ($line in $vars) {
    if ($line -match '^([A-Za-z_][A-Za-z0-9_()]*)=(.*)$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
  }
  foreach ($tool in @('cl.exe','link.exe','rc.exe')) {
    if (-not (Has-Tool $tool)) {
      Show-MSVCInstallHelp "Da tim thay $vs nhung thieu $tool sau VsDevCmd."
      throw "Thieu $tool. Mo Visual Studio Installer > Modify > Desktop development with C++."
    }
  }
  Write-Host "MSVC + Windows SDK: OK ($vs)" -ForegroundColor Green
}

function Check-WebView2 {
  # WebView2 ships with most supported Windows 10/11 installs; the NSIS package
  # can bootstrap the Runtime on machines that do not already have it.
  Write-Host 'WebView2: dung runtime cua Windows; neu app cai xong khong mo, kiem tra https://developer.microsoft.com/microsoft-edge/webview2/'
}

try {
  Start-Transcript -Path $logPath -Force | Out-Null
  $transcriptStarted = $true
  Write-Host '==================================================' -ForegroundColor Cyan
  Write-Host ' OPEN IPTV PRO - RUST LAB / WINDOWS AUTO BUILDER' -ForegroundColor Cyan
  Write-Host ' experiment/rust-tauri-v2 (khong thay main/Electron)' -ForegroundColor Cyan
  Write-Host '==================================================' -ForegroundColor Cyan
  if (-not [Environment]::Is64BitOperatingSystem) { throw 'Can Windows x64.' }
  $packagePath = Join-Path $root 'package.json'
  if (-not (Test-Path -LiteralPath $packagePath)) { throw "Khong tim thay package.json trong $root" }
  $pkg = Get-Content -LiteralPath $packagePath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($pkg.name -ne 'open-iptv-pro-tauri-experiment') { throw 'Day khong phai ma nguon Rust Lab. Dung thu muc.' }
  Assert-Node
  Assert-Rust
  Assert-VSTools
  Check-WebView2
  # Avoid overloading machines with ~24 GB RAM during Rust compilation.
  $env:CARGO_BUILD_JOBS = '2'
  $env:CARGO_INCREMENTAL = '0'
  Write-Host '[4/6] Cai JS dependencies ...' -ForegroundColor Cyan
  if (Test-Path -LiteralPath (Join-Path $root 'package-lock.json')) {
    & npm.cmd ci --no-audit --no-fund
  } else {
    & npm.cmd install --no-audit --no-fund
  }
  if ($LASTEXITCODE -ne 0) { throw "npm install that bai (exit=$LASTEXITCODE)" }
  Write-Host '[5/6] Kiem thu JS / renderer / Rust ...' -ForegroundColor Cyan
  & npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "npm test that bai (exit=$LASTEXITCODE)" }
  & npm.cmd run prepare:renderer
  if ($LASTEXITCODE -ne 0) { throw "prepare:renderer that bai (exit=$LASTEXITCODE)" }
  & cargo.exe test --manifest-path 'src-tauri\Cargo.toml'
  if ($LASTEXITCODE -ne 0) { throw "cargo test that bai (exit=$LASTEXITCODE)" }
  Write-Host '[6/6] Build bo cai Tauri NSIS x64 ...' -ForegroundColor Cyan
  $startedAt = [DateTime]::UtcNow
  & npm.cmd run build -- --bundles nsis
  if ($LASTEXITCODE -ne 0) { throw "Tauri build that bai (exit=$LASTEXITCODE)" }
  $outDir = Join-Path $root 'src-tauri\target\release\bundle\nsis'
  if (-not (Test-Path -LiteralPath $outDir)) { throw 'Build khong tao thu muc NSIS.' }
  $files = @(Get-ChildItem -LiteralPath $outDir -Filter '*.exe' -File | Where-Object { $_.Length -gt 1000000 -and $_.LastWriteTimeUtc -ge $startedAt.AddSeconds(-5) })
  if ($files.Count -lt 1) { throw 'Khong tim thay EXE moi sau khi build.' }
  Write-Host 'BUILD WINDOWS THANH CONG:' -ForegroundColor Green
  $files | ForEach-Object { Write-Host $_.FullName -ForegroundColor Green }
  Write-Host "Log: $logPath" -ForegroundColor DarkCyan
  Start-Process explorer.exe -ArgumentList ('"' + $outDir + '"')
} catch {
  Write-Host ('BUILD DUNG: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host "Log: $logPath" -ForegroundColor Yellow
  throw
} finally {
  if ($transcriptStarted) { try { Stop-Transcript | Out-Null } catch {} }
}

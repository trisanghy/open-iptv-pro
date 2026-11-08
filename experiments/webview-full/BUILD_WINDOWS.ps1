$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host 'Open IPTV Pro v4.19 WebView FULL - Windows x64'
$disk = Get-PSDrive -Name (Get-Location).Drive.Name
if ($disk.Free -lt 10GB) { throw 'Can it nhat 10GB trong de build Windows. Khong tu dong xoa tep.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
 if (Get-Command winget -ErrorAction SilentlyContinue) { winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements }
 else { throw 'May build can Node.js LTS; khong tim thay winget de cai tu dong.' }
}
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
 Write-Host 'Tu dong cai Rust profile minimal...'
 $installer = Join-Path $env:TEMP 'rustup-init.exe'
 Invoke-WebRequest -UseBasicParsing 'https://win.rustup.rs/x86_64' -OutFile $installer
 & $installer -y --profile minimal
 $env:PATH="$env:USERPROFILE\.cargo\bin;"+$env:PATH
}
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) { throw 'Rust khong kha dung. Can Visual Studio C++ Build Tools (MSVC) de dong goi.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm chua nam tren PATH. Mo lai PowerShell.' }
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install loi' }
npm run test:original
if ($LASTEXITCODE -ne 0) { throw 'Test goc loi' }
npm run test:bridge
if ($LASTEXITCODE -ne 0) { throw 'Test bridge loi' }
npm run prepare
if ($LASTEXITCODE -ne 0) { throw 'Thieu FFmpeg / FFprobe / Node runtime' }
npx tauri build --bundles nsis
if ($LASTEXITCODE -ne 0) { throw 'Tauri build loi. Can Visual Studio C++ Build Tools va WebView2 SDK.' }
$out=Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads\OpenIPTV_WebView_FULL_Setup'
New-Item -ItemType Directory -Force -Path $out | Out-Null
Get-ChildItem 'src-tauri\target\release\bundle\nsis\*.exe' | Copy-Item -Destination $out -Force
Write-Host "DONE: $out"

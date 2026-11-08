# Open IPTV Pro v4.22.2 Full Windows x64: local Node downloader and NSIS build.
# No admin rights, no global installs. Node binary is verified with pinned SHA-256.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) '..')).Path
Set-Location $root
$version = '22.16.0'
$arch = 'win-x64'
$expected = '21c2d9735c80b8f86dab19305aa6a9f6f59bbc808f68de3eef09d5832e3bfbbd'
$filename = "node-v${version}-${arch}.zip"
$tools = Join-Path $root '.open-iptv-tools'
$nodeDir = Join-Path $tools "node-v$version-$arch"
$nodeExe = Join-Path $nodeDir 'node.exe'
$npmCmd = Join-Path $nodeDir 'npm.cmd'
$npxCmd = Join-Path $nodeDir 'npx.cmd'

# A user-installed Node.js 22+ is preferred; do not download another copy when it works.
$availableNode = Get-Command node.exe -ErrorAction SilentlyContinue
$availableNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
$availableNpx = Get-Command npx.cmd -ErrorAction SilentlyContinue
if ($availableNode -and $availableNpm -and $availableNpx) {
  try {
    $systemMajor = [int]((& $availableNode.Source -p "process.versions.node.split('.')[0]").Trim())
    if ($systemMajor -ge 22) {
      $nodeExe = $availableNode.Source
      $npmCmd = $availableNpm.Source
      $npxCmd = $availableNpx.Source
      Write-Host "Su dung Node.js co san tren Windows: $(& $nodeExe -v)"
    }
  } catch { Write-Host 'Khong the dung Node.js co san, se dung ban local da xac minh.' }
}

try {
  if (-not [Environment]::Is64BitOperatingSystem) { throw 'Chi ho tro Windows 64-bit.' }
  if ((-not (Test-Path $nodeExe)) -or (-not (Test-Path $npmCmd))) {
    New-Item -ItemType Directory -Force -Path $tools | Out-Null
    $file = Join-Path $tools $filename
    $url = "https://nodejs.org/dist/v$version/$filename"
    Write-Host "[1/4] Tai Node.js tu nguon chinh thuc: $url"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing
    $actual = (Get-FileHash -Algorithm SHA256 -Path $file).Hash.ToLowerInvariant()
    if ($actual -ne $expected) {
      Remove-Item -Force $file
      throw 'SHA-256 sai! Da huy bo file tai ve.'
    }
    Write-Host 'SHA-256 chinh xac. Dang giai nen...'
    Expand-Archive -Path $file -DestinationPath $tools -Force
  } else {
    Write-Host '[1/4] Su dung Node.js da tai trong thu muc rieng.'
  }
  if (-not (Test-Path $nodeExe)) { throw 'Khong the giai nen Node.js.' }
  $env:Path = "$nodeDir;$env:Path"
  Write-Host "Node: $(& $nodeExe --version)"

  Write-Host '[2/4] Tai Electron, HLS, FFmpeg, electron-updater va cong cu build...'
  if (Test-Path (Join-Path $root 'package-lock.json')) {
    & $npmCmd ci --no-audit --no-fund
  } else {
    & $npmCmd install --no-audit --no-fund
  }
  if ($LASTEXITCODE -ne 0) { throw "npm install/ci loi: $LASTEXITCODE" }

  Write-Host '[3/4] Kiem tra ma nguon...'
  & $npmCmd test
  if ($LASTEXITCODE -ne 0) { throw "Kiem thu loi: $LASTEXITCODE" }

  Write-Host '[4/4] Tao EXE Setup va Portable Day Du FFmpeg...'
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  & $npxCmd --no-install electron-builder --win --x64 --publish never
  if ($LASTEXITCODE -ne 0) { throw "Dong goi loi: $LASTEXITCODE" }
  $dist = Join-Path $root 'dist'
  # Verify the actual files: successful process exit is not proof of a usable installer.
  $appVersion = (Get-Content -Raw (Join-Path $root 'package.json') | ConvertFrom-Json).version
  $setupFile = Join-Path $dist "Open-IPTV-Pro-Setup-$appVersion-x64.exe"
  $portableFile = Join-Path $dist "Open-IPTV-Pro-$appVersion-x64.exe"
  foreach ($item in @($setupFile, $portableFile)) {
    if (-not (Test-Path -LiteralPath $item -PathType Leaf)) { throw "Khong tim thay EXE: $item" }
    if ((Get-Item -LiteralPath $item).Length -lt 1000000) { throw "File EXE bat thuong, qua nho: $item" }
  }
  Write-Host "THANH CONG. Setup: $setupFile; Portable: $portableFile"
  Start-Process explorer.exe -ArgumentList "`"$dist`""
  exit 0
} catch {
  Write-Host ('LOI: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Neu build loi, xem lai Node/npm, quyen truy cap Internet va log o tren.'
  exit 1
}

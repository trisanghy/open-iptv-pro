# Open IPTV Pro IPTV v3.1 Windows x64: portable Node downloader & installer builder.
# No admin rights, no global installs. Node binary is verified with pinned SHA-256.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
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

  Write-Host '[2/4] Tai Electron, HLS, FFmpeg, electron-builder...'
  if (Test-Path (Join-Path $root 'package-lock.json')) {
    & $npmCmd ci --no-audit --no-fund
  } else {
    & $npmCmd install --no-audit --no-fund
  }
  if ($LASTEXITCODE -ne 0) { throw "npm install/ci loi: $LASTEXITCODE" }

  Write-Host '[3/4] Kiem tra ma nguon...'
  & $npmCmd test
  if ($LASTEXITCODE -ne 0) { throw "Kiem thu loi: $LASTEXITCODE" }

  Write-Host '[4/4] Tao EXE Setup & portable...'
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  & $npxCmd --no-install electron-builder --win nsis portable --x64 --publish never
  if ($LASTEXITCODE -ne 0) { throw "Dong goi loi: $LASTEXITCODE" }
  $dist = Join-Path $root 'dist'
  Write-Host "THANH CONG. File EXE o: $dist"
  Start-Process explorer.exe -ArgumentList "`"$dist`""
  exit 0
} catch {
  Write-Host ('LOI: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Ban van co the mo phan mem bang MO_OPEN IPTV PRO_WINDOWS.bat'
  exit 1
}

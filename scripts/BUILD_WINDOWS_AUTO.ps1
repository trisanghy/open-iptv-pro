# Open IPTV Pro v4.23.299 Full Desktop - Windows build (Setup + Portable).
# This script always builds from its own project root, never from the caller's folder.
# Windows symlink permissions are checked before downloading any dependencies.
# No signing, release publishing, or system-wide installs are performed.
$ErrorActionPreference = 'Stop'
$expectedVersion = '4.23.299'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$projectFile = Join-Path $root 'package.json'
$logDir = Join-Path $root 'build-logs'
$hasTranscript = $false

function Assert-ProjectRoot {
  if (-not (Test-Path -LiteralPath $projectFile -PathType Leaf)) {
    throw "Khong tim thay package.json trong: $root. Giai nen dung ZIP v$expectedVersion, chay BUILD_WINDOWS.bat o thu muc goc (khong chay trong scripts hay ban experiment)."
  }
  $info = Get-Content -LiteralPath $projectFile -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($info.name -ne 'open-iptv-pro' -or $info.version -ne $expectedVersion) {
    throw "Sai ma nguon: can open-iptv-pro v$expectedVersion, hien co $($info.name) v$($info.version). Khong ghi de du an cu."
  }
  if (-not (Test-Path -LiteralPath (Join-Path $root 'src\main.cjs'))) {
    throw 'Thieu src/main.cjs. Tep ZIP co the bi giai nen thieu.'
  }
  if (-not (Test-Path -LiteralPath (Join-Path $root 'scripts\BUILD_WINDOWS_AUTO.ps1'))) {
    throw 'Thieu script build trong thu muc scripts.'
  }
}

function Test-SymlinkPrivilege {
  $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('OpenIPTV-Symlink-' + [guid]::NewGuid().ToString('N'))
  try {
    New-Item -Path $tempRoot -ItemType Directory -Force | Out-Null
    $source = Join-Path $tempRoot 'original.txt'
    $link = Join-Path $tempRoot 'link.txt'
    [System.IO.File]::WriteAllText($source, 'Open IPTV Pro test')
    New-Item -Path $link -ItemType SymbolicLink -Target $source -ErrorAction Stop | Out-Null
    return (Test-Path -LiteralPath $link)
  } catch {
    return $false
  } finally {
    if (Test-Path -LiteralPath $tempRoot) {
      Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
}

try {
  Write-Host '====================================================='
  Write-Host " OPEN IPTV PRO $expectedVersion - WINDOWS 64-BIT / BUILD FIX"
  Write-Host '====================================================='
  if (-not [Environment]::Is64BitOperatingSystem) { throw 'Can Windows 64-bit (x64).' }
  Assert-ProjectRoot
  Set-Location -LiteralPath $root
  Write-Host "PROJECT: $root"
  Write-Host "TEST: package.json v$expectedVersion - OK"

  New-Item -Path $logDir -ItemType Directory -Force | Out-Null
  try {
    Start-Transcript -Path (Join-Path $logDir 'BUILD_WINDOWS_LAST.log') -Force -ErrorAction Stop | Out-Null
    $hasTranscript = $true
  } catch { Write-Host 'Khong tao duoc transcript; van tiep tuc va in loi tren man hinh.' }

  # winCodeSign 2.6.0 includes macOS dylib symlinks. 7-Zip extraction fails without
  # Developer Mode or Administrator rights, even when the app is not code-signed.
  Write-Host '[0/4] Kiem tra quyen tao symbolic link (winCodeSign)...'
  if (-not (Test-SymlinkPrivilege)) {
    Write-Host 'KHONG DU QUYEN SYMBOLIC LINK: Windows se chan giai nen winCodeSign.' -ForegroundColor Yellow
    Write-Host 'Cach 1 (nen dung): Windows Settings > System > For developers > Developer Mode ON.'
    Write-Host 'Sau khi bat Developer Mode, dong Terminal nay va chay lai BUILD_WINDOWS.bat.'
    Write-Host 'Cach 2: chon A de dong y cho chay LAI script nay bang quyen Administrator (UAC).'
    $choice = Read-Host 'Nhap D (mo Settings), A (chay bang Administrator), hoac Enter (dung)'
    if ($choice -match '^[dD]$') {
      Start-Process 'ms-settings:developers' | Out-Null
      throw 'Hay bat Developer Mode va chay lai BUILD_WINDOWS.bat.'
    }
    if ($choice -match '^[aA]$') {
      if ($hasTranscript) { Stop-Transcript | Out-Null; $hasTranscript = $false }
      $elevated = Start-Process -FilePath 'powershell.exe' -Verb RunAs -Wait -PassThru -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $PSCommandPath + '"'))
      exit $elevated.ExitCode
    }
    throw 'Da dung build, chua thay doi ma nguon. Hay bat Developer Mode.'
  }
  Write-Host 'Symlink privilege: OK'

  $version = '22.16.0'
  $arch = 'win-x64'
  $sha256 = '21c2d9735c80b8f86dab19305aa6a9f6f59bbc808f68de3eef09d5832e3bfbbd'
  $tools = Join-Path $root '.open-iptv-tools'
  $nodeDir = Join-Path $tools "node-v${version}-${arch}"
  $nodeExe = Join-Path $nodeDir 'node.exe'
  $npmCmd = Join-Path $nodeDir 'npm.cmd'
  $npxCmd = Join-Path $nodeDir 'npx.cmd'
  $usingSystemNode = $false

  $existingNode = Get-Command node.exe -ErrorAction SilentlyContinue
  $existingNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  $existingNpx = Get-Command npx.cmd -ErrorAction SilentlyContinue
  if ($existingNode -and $existingNpm -and $existingNpx) {
    try {
      $major = [int]((& $existingNode.Source -p 'process.versions.node.split(".")[0]').Trim())
      if ($major -ge 22) {
        $nodeExe = $existingNode.Source
        $npmCmd = $existingNpm.Source
        $npxCmd = $existingNpx.Source
        $usingSystemNode = $true
      }
    } catch { Write-Host 'Node he thong khong dung duoc, chuyen sang local.' }
  }

  if (-not $usingSystemNode) {
    if ((-not (Test-Path -LiteralPath $nodeExe)) -or (-not (Test-Path -LiteralPath $npmCmd))) {
      New-Item -Path $tools -ItemType Directory -Force | Out-Null
      $archive = Join-Path $tools "node-v${version}-${arch}.zip"
      $url = "https://nodejs.org/dist/v$version/node-v${version}-${arch}.zip"
      Write-Host "[1/4] Tai Node.js tu $url"
      [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
      Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
      $actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($actual -ne $sha256) {
        Remove-Item -LiteralPath $archive -Force
        throw 'Node ZIP SHA256 khong khop. Da xoa file tai ve.'
      }
      Expand-Archive -LiteralPath $archive -DestinationPath $tools -Force
    }
    $env:Path = "$nodeDir;$env:Path"
  } else {
    Write-Host '[1/4] Dung Node.js da cai tren Windows.'
  }
  if (-not (Test-Path -LiteralPath $nodeExe)) { throw 'Khong tim thay Node.js sau khi cai.' }
  Write-Host "Node version: $(& $nodeExe --version)"

  Write-Host '[2/4] Cai npm dependencies trong THU MUC GOC DU AN...'
  Set-Location -LiteralPath $root
  if (Test-Path -LiteralPath (Join-Path $root 'package-lock.json')) {
    & $npmCmd ci --no-audit --no-fund
  } else {
    & $npmCmd install --no-audit --no-fund
  }
  if ($LASTEXITCODE -ne 0) { throw "npm ci/install fail: $LASTEXITCODE" }

  Write-Host '[3/4] Chay npm test...'
  & $npmCmd test
  if ($LASTEXITCODE -ne 0) { throw "npm test fail: $LASTEXITCODE" }

  Write-Host '[4/4] Dong goi NSIS Setup va Portable (khong phat hanh GitHub)...'
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  $buildStarted = [DateTime]::UtcNow
  Set-Location -LiteralPath $root
  # Explicit project dir prevents 'Cannot find package.json' in scripts/other folders.
  & $npxCmd --no-install electron-builder --projectDir "$root" --win --x64 --publish never
  if ($LASTEXITCODE -ne 0) { throw "electron-builder fail: $LASTEXITCODE" }

  $dist = Join-Path $root 'dist'
  $setupFile = Join-Path $dist "Open-IPTV-Pro-Setup-${expectedVersion}-x64.exe"
  $portableFile = Join-Path $dist "Open-IPTV-Pro-${expectedVersion}-x64.exe"
  foreach ($item in @($setupFile, $portableFile)) {
    if (-not (Test-Path -LiteralPath $item -PathType Leaf)) { throw "Thieu file EXE: $item" }
    $file = Get-Item -LiteralPath $item
    if ($file.Length -lt 1000000) { throw "EXE bat thuong (nho hon 1 MB): $item" }
    if ($file.LastWriteTimeUtc -lt $buildStarted.AddSeconds(-5)) {
      throw "EXE da ton tai tu ban build cu, chua duoc tao lai: $item"
    }
  }
  Write-Host '=====================================================' -ForegroundColor Green
  Write-Host 'BUILD WINDOWS THANH CONG - Open IPTV Pro v$expectedVersion' -ForegroundColor Green
  Write-Host "Setup:    $setupFile" -ForegroundColor Green
  Write-Host "Portable: $portableFile" -ForegroundColor Green
  Write-Host 'Luu y: EXE chua ky so; Windows SmartScreen co the hien canh bao.'
  Write-Host '====================================================='
  Start-Process explorer.exe -ArgumentList ('"' + $dist + '"')
  if ($hasTranscript) { Stop-Transcript | Out-Null; $hasTranscript = $false }
  exit 0
} catch {
  Write-Host ("BUILD THAT BAI: " + $_.Exception.Message) -ForegroundColor Red
  Write-Host "Log (neu co): $logDir\BUILD_WINDOWS_LAST.log" -ForegroundColor Yellow
  if ($hasTranscript) { try { Stop-Transcript | Out-Null } catch {} }
  exit 1
}

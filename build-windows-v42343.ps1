# Open IPTV Pro v4.23.43 — one-command Windows 64-bit Setup + Portable build.
$ErrorActionPreference = 'Stop'
if (-not [Environment]::Is64BitOperatingSystem) { throw 'Requires Windows 64-bit.' }
$sourceName = 'OpenIPTVPro_Source_v4.23.43.zip'
$sha256 = '9a35559fe0e35108311afe3c7c966c54444812df15ec90397e6de77a66e1f8e5'
$url = 'https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source/source/' + $sourceName
$downloads = Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads'
New-Item -ItemType Directory -Path $downloads -Force | Out-Null
$work = Join-Path $downloads ('.openiptv-42343-windows-' + [Guid]::NewGuid().ToString('N'))
$output = Join-Path $downloads 'OpenIPTVPro_Build_v4.23.43_Windows'
New-Item -ItemType Directory -Path $work -Force | Out-Null
$success = $false
$project = $null
try {
  Write-Host '[1/4] Downloading ONE v4.23.43 source ZIP...'
  $archive = Join-Path $work $sourceName
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing -ErrorAction Stop
  if (-not (Test-Path -LiteralPath $archive -PathType Leaf)) { throw 'Source ZIP was not downloaded.' }
  $actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $sha256) { throw 'Source ZIP SHA-256 mismatch. Stopping.' }

  Write-Host '[2/4] Extracting verified full Windows/macOS source...'
  Expand-Archive -LiteralPath $archive -DestinationPath $work -Force
  $project = Join-Path $work 'Open-IPTV-Pro-v4_23_43_Full_Desktop'
  $package = Join-Path $project 'package.json'
  if (-not (Test-Path -LiteralPath $package -PathType Leaf)) { throw 'Missing package.json in ZIP.' }
  $manifest = Get-Content -LiteralPath $package -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($manifest.name -ne 'open-iptv-pro' -or $manifest.version -ne '4.23.43') {
    throw 'Wrong source version. Expected 4.23.43.'
  }

  Write-Host '[3/4] Building Windows Setup + Portable (includes tests)...'
  $builder = Join-Path $project 'scripts\BUILD_WINDOWS_AUTO.ps1'
  if (-not (Test-Path -LiteralPath $builder -PathType Leaf)) { throw 'Missing Windows build script.' }
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $builder
  if ($LASTEXITCODE -ne 0) { throw "Windows build returned error $LASTEXITCODE. Enable Developer Mode or run elevated if symbolic-link privileges are missing." }

  $dist = Join-Path $project 'dist'
  $setup = Join-Path $dist 'Open-IPTV-Pro-Setup-4.23.43-x64.exe'
  $portable = Join-Path $dist 'Open-IPTV-Pro-4.23.43-x64.exe'
  foreach ($file in @($setup, $portable)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing build output: $file" }
    if ((Get-Item -LiteralPath $file).Length -lt 1MB) { throw "Invalid build output size: $file" }
  }

  Write-Host '[4/4] Copying only Setup, Portable and matching source ZIP...'
  if (Test-Path -LiteralPath $output -PathType Leaf) { throw 'Output destination exists as a file.' }
  New-Item -ItemType Directory -Path $output -Force | Out-Null
  foreach ($file in @($setup, $portable, $archive)) {
    Copy-Item -LiteralPath $file -Destination (Join-Path $output ([IO.Path]::GetFileName($file))) -Force
  }
  $success = $true
  Write-Host "WINDOWS BUILD COMPLETE: $output" -ForegroundColor Green
  Get-ChildItem -LiteralPath $output -File | Select-Object Name,Length
  Start-Process explorer.exe -ArgumentList ('"' + $output + '"')
} catch {
  Write-Host ('BUILD FAILED: ' + $_.Exception.Message) -ForegroundColor Red
  $log = if ($project) { Join-Path $project 'build-logs\BUILD_WINDOWS_LAST.log' } else { $null }
  if ($log -and (Test-Path -LiteralPath $log -PathType Leaf)) {
    Copy-Item -LiteralPath $log -Destination (Join-Path $downloads 'OpenIPTVPro_Build_v4.23.43_Windows_ERROR.log') -Force -ErrorAction SilentlyContinue
  }
  throw
} finally {
  if (Test-Path -LiteralPath $work) {
    Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
  }
}

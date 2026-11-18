# Creates a SEPARATE clone and local experiment/rust-tauri-v2 branch.
# Does not commit or push without a separate user action.
$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot
$target = Join-Path $env:USERPROFILE 'Downloads\OpenIPTVPro_Rust_Tauri_Git_Experiment'
$branch = 'experiment/rust-tauri-v2'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is not installed' }
if (Test-Path $target) { throw "Target already exists; no changes were made: $target" }
git clone --no-tags https://github.com/trisanghy/open-iptv-pro.git $target
if ($LASTEXITCODE -ne 0) { throw 'Git clone failed' }
git -C $target switch -c $branch
if ($LASTEXITCODE -ne 0) { throw 'Unable to create experiment branch' }
# Never mirror the source into the existing working repository.
robocopy $source $target /E /XD .git node_modules target dist /XF *.dmg *.exe *.msi /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw 'Copy failed' }
foreach ($file in @('release-desktop.yml','tao-bo-cai.yml','test.yml')) {
  $old = Join-Path $target ".github\workflows\$file"
  if (Test-Path $old) { Remove-Item $old -Force }
}
Write-Host "Local branch ready: $branch" -ForegroundColor Green
Write-Host "Repository directory: $target"
Write-Host 'No commit, push, tag or release has been created.'
Write-Host 'Inspect changes: git status --short'
Write-Host 'When ready: git add -A; git commit -m "Experiment: Tauri 2 Rust Lab"; git push -u origin experiment/rust-tauri-v2'

# Open IPTV Pro: publish only allowlisted files to NEW GitHub public repository
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Host 'OPEN IPTV PRO 4.1 — CONG KHAI MA NGUON (KHONG DANG PLAYLIST CA NHAN)'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Chua co Git: https://git-scm.com/download/win' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Chua co GitHub CLI: https://cli.github.com. Cai xong chay lai.' }
if (Test-Path '.git') { throw 'Thu muc da co .git, dung lai de tranh ghi de' }
& gh auth status 2>$null
if ($LASTEXITCODE -ne 0) { & gh auth login --hostname github.com --git-protocol https --web; if ($LASTEXITCODE -ne 0) { throw 'Dang nhap that bai' } }
$owner = (& gh api user -q .login).Trim()
if ($owner -notmatch '^[A-Za-z0-9-]+$') { throw 'Khong xac dinh duoc tai khoan' }
$repo = Read-Host 'Ten repository PUBLIC moi [open-iptv-pro]'
if (-not $repo) { $repo = 'open-iptv-pro' }
if ($repo -notmatch '^[A-Za-z0-9._-]+$' -or $repo -in @('.', '..')) { throw 'Ten repository khong hop le' }
& gh repo view "$owner/$repo" 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { throw 'Repository da ton tai: khong ghi de' }
$files = @((Get-Content -LiteralPath 'PUBLISH_FILES.txt' -Encoding UTF8) | Where-Object { $_ -and (-not $_.StartsWith('#')) })
if ($files.Count -lt 20) { throw 'Danh sach file bat thuong' }
foreach ($f in $files) {
  if ($f -match '\.\.' -or $f.StartsWith('/') -or $f.StartsWith('\\') -or -not (Test-Path -LiteralPath $f -PathType Leaf)) { throw "File thieu/khong an toan: $f" }
  if ((Get-Item -LiteralPath $f).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "File link khong an toan: $f" }
}
Write-Host "`nFILES WILL BE PUBLIC ($($files.Count))" -ForegroundColor Yellow
$files | ForEach-Object { Write-Host "  $_" }
Write-Host "Du kien: https://github.com/$owner/$repo"
$ok = Read-Host 'Nhap chinh xac PUBLIC de tao repository public moi'
if ($ok -cne 'PUBLIC') { Write-Host 'Da huy'; exit 0 }
& git init -b main
if ($LASTEXITCODE -ne 0) { throw 'git init loi' }
if (-not (& git config --local user.name)) { & git config --local user.name $owner }
if (-not (& git config --local user.email)) { $id = (& gh api user -q .id).Trim(); & git config --local user.email "${id}+${owner}@users.noreply.github.com" }
foreach ($f in $files) { & git add -- $f; if ($LASTEXITCODE -ne 0) { throw "git add that bai: $f" } }
$staged = @(& git diff --cached --name-only)
if ($staged.Count -ne $files.Count) { throw 'So file staged khong khop PUBLISH_FILES.txt' }
& git commit -m 'Initial public release: Open IPTV Pro v4.1.0'
if ($LASTEXITCODE -ne 0) { throw 'Commit that bai' }
& gh repo create "$owner/$repo" --public --source=. --remote=origin --push --description 'Open-source IPTV app for macOS and Windows'
if ($LASTEXITCODE -ne 0) { throw 'Github repository tao/push that bai' }
Write-Host "DA TAO: https://github.com/$owner/$repo" -ForegroundColor Green

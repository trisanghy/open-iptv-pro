#!/bin/bash
# Update the existing trisanghy/open-iptv-pro GitHub repository with v4.22 FULL desktop source.
# No force-push, no tag/release, no android/ios changes.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$ROOT"
REPO='trisanghy/open-iptv-pro'
LOG="$ROOT/CAP_NHAT_GITHUB_v4_22.log"
TMP=''
cleanup() {
  local result=$?
  trap - EXIT
  if [[ -n "$TMP" && -d "$TMP" ]]; then rm -rf "$TMP"; fi
  echo ''
  if [[ $result -eq 0 ]]; then
    echo 'Da ket thuc. Kiem tra dong PUSH THANH CONG o tren de xac nhan.'
  else
    echo "CHUA CAP NHAT DUOC. Ma loi: $result. Xem log: $LOG"
  fi
  printf 'Nhan Enter de dong Terminal... '
  read -r _ || true
  exit "$result"
}
trap cleanup EXIT
trap 'echo "LOI o dong $LINENO"' ERR
exec > >(tee -a "$LOG") 2>&1

echo '============================================================'
echo ' OPEN IPTV PRO v4.22 FULL - CAP NHAT GITHUB (MAC)'
echo ' Repo: https://github.com/trisanghy/open-iptv-pro'
echo ' Fixed updater + macOS SVG icons, FFmpeg/Timeshift Full'
echo ' Khong xoa Android/iOS. Khong force-push. Khong tao Release.'
echo '============================================================'

[[ -f "$SOURCE/package.json" && -f "$SOURCE/src/update-check.cjs" && -f "$SOURCE/renderer/app-icons.js" ]] || {
  echo 'Khong thay day du ma nguon v4.22 trong thu muc Open-IPTV-Pro.'; exit 1;
}
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4\.22\.0"' "$SOURCE/package.json" || {
  echo 'Sai phien ban. File package.json phai la 4.22.0.'; exit 1;
}
grep -Eq '"ffmpeg-static"[[:space:]]*:' "$SOURCE/package.json" || {
  echo 'THIEU ffmpeg-static; dung de tranh thay ban Full bang Lite.'; exit 1;
}
for cmd in git rsync; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "Thieu $cmd. Thu cai Xcode Command Line Tools: xcode-select --install"; exit 1;
  }
done
if ! command -v gh >/dev/null 2>&1; then
  echo 'Chua cai GitHub CLI (gh).'
  if command -v brew >/dev/null 2>&1; then
    read -r -p 'Cai gh bang Homebrew? [y/N]: ' choose
    if [[ "$choose" == 'y' || "$choose" == 'Y' ]]; then
      brew install gh
    fi
  fi
  command -v gh >/dev/null 2>&1 || {
    echo 'Hay cai GitHub CLI tai https://cli.github.com/ roi chay lai.'; exit 1;
  }
fi

if ! gh auth status >/dev/null 2>&1; then
  echo 'Can dang nhap GitHub. Khong gui token hay mat khau cho ai.'
  gh auth login --web --git-protocol https
fi
gh auth setup-git
LOGIN="$(gh api user --jq .login)"
CAN_PUSH="$(gh api "repos/$REPO" --jq '.permissions.push // false')"
[[ "$CAN_PUSH" == 'true' ]] || {
  echo "Tai khoan $LOGIN khong co quyen push vao $REPO. Dung."; exit 1;
}
BRANCH="$(gh repo view "$REPO" --json defaultBranchRef --jq '.defaultBranchRef.name')"
[[ -n "$BRANCH" && "$BRANCH" != 'null' ]] || { echo 'Khong tim thay nhanh mac dinh.'; exit 1; }

echo "Tai khoan: $LOGIN | Repo: $REPO | Nhanh: $BRANCH"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/open-iptv-github-4220.XXXXXX")"
git clone --quiet --single-branch --branch "$BRANCH" "https://github.com/$REPO.git" "$TMP/repo"
cd "$TMP/repo"
[[ "$(git remote get-url origin)" == "https://github.com/$REPO.git" ]] || { echo 'Sai remote; dung.'; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Working tree khong sach; dung.'; exit 1; }

# Never downgrade a repository already containing a later desktop version.
if [[ -f package.json ]]; then
  REMOTE_VERSION="$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)".*/\1/p' package.json | head -n 1)"
  if [[ "$REMOTE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    IFS='.' read -r rmaj rmin rpat <<< "$REMOTE_VERSION"
    if (( 10#$rmaj > 4 || (10#$rmaj == 4 && 10#$rmin > 22) || (10#$rmaj == 4 && 10#$rmin == 22 && 10#$rpat > 0) )); then
      echo "Repo dang o v$REMOTE_VERSION (cao hon 4.22.0). Khong ha cap."; exit 1
    fi
  fi
fi

# Copy only desktop application content. Deliberately do not delete unknown files.
for d in src renderer assets tests docs scripts .github/workflows; do
  if [[ -d "$SOURCE/$d" ]]; then
    mkdir -p "$d"
    rsync -a --exclude='.DS_Store' --exclude='node_modules/' --exclude='dist/' \
      --exclude='__pycache__/' --exclude='*.log' --exclude='*.m3u' --exclude='*.m3u8' \
      --exclude='.env*' --exclude='*.pem' --exclude='*.key' --exclude='*.p12' --exclude='*.token' \
      --exclude='mobile/' --exclude='android/' --exclude='ios/' \
      "$SOURCE/$d/" "$d/"
  fi
done
mkdir -p examples
cp "$SOURCE/examples/demo.m3u" examples/demo.m3u
FILES=(package.json .gitignore LICENSE README.md CHANGELOG.md CHANGELOG_V4_15_EN.md CONTRIBUTING.md SECURITY.md THIRD_PARTY_NOTICES.md TEST_RESULTS.md TEST_RESULTS_V4_18.md TEST_RESULTS_V4_20.md TEST_RESULTS_V4_21.md TEST_RESULTS_V4_21_1.md UPDATE_V4_22_VI_EN.md FULL_FEATURES_CHECKLIST.md MIGRATION_4_7.md AIRPLAY_FIX_V4_21_1_VI_EN.md BUILD_GUIDE_CAST_V4_21.md BUILD_MAC.command BUILD_WINDOWS.bat CAP_NHAT_GITHUB_V4_22_MAC.command BAT_DAU_O_DAY.txt GITHUB_ABOUT_VI_EN.txt)
for f in "${FILES[@]}"; do
  [[ ! -f "$SOURCE/$f" ]] || cp -p "$SOURCE/$f" "$f"
done

git add -A -- src renderer assets tests docs scripts .github/workflows
for f in "${FILES[@]}"; do [[ ! -f "$f" ]] || git add -- "$f"; done
git add -f -- examples/demo.m3u

# Defense-in-depth: never publish private, user-specific or mobile files.
while IFS= read -r file; do
  case "/$file/" in
    */android/*|*/ios/*|*/mobile/*|*/node_modules/*|*/dist/*|*/userData/*|*/private/*|*/snapshots/*)
      echo "File cam trong staged changes: $file"; exit 1;;
  esac
  case "$file" in
    *.m3u|*.m3u8) [[ "$file" == 'examples/demo.m3u' ]] || { echo "File playlist ca nhan: $file"; exit 1; };;
    *.pem|*.p12|*.key|*.token|.env|.env.*|*/.env|*/.env.*)
      echo "File nhay cam: $file"; exit 1;;
  esac
done < <(git diff --cached --name-only)

if git diff --cached --quiet; then
  echo 'Repo da co cung ma nguon v4.22, khong can tao commit.'
else
  echo ''; echo '==== DANH SACH FILE SE CAP NHAT ===='
  git diff --cached --stat
  echo ''; git diff --cached --name-status
fi

echo ''
echo "Repository: https://github.com/$REPO"
echo "Nhanh: $BRANCH | Dang nhap: $LOGIN"
echo 'Ban v4.22: Sua cap nhat, icon macOS SVG; GIU FFmpeg & Timeshift Full.'
echo 'Khong force push, khong xoa Android/iOS, khong tao tag hay Release.'
read -r -p 'Nhap CAP NHAT de day len GitHub (nhap khac de huy): ' CONFIRM
if [[ "$CONFIRM" != 'CAP NHAT' ]]; then
  echo 'Da huy, KHONG push.'; exit 0
fi
if ! git diff --cached --quiet; then
  USER_ID="$(gh api user --jq .id)"
  git -c user.name="$LOGIN" -c user.email="${USER_ID}+${LOGIN}@users.noreply.github.com" \
    commit -m 'Fix release detection and modernize desktop icons (v4.22)'
  git push origin "HEAD:$BRANCH"
  echo 'PUSH THANH CONG - ma nguon v4.22 da len GitHub.'
else
  echo 'Khong co thay doi file can push.'
fi

ABOUT='Trình phát IPTV Windows/macOS: M3U, Cast/AirPlay, FFmpeg, Timeshift, MultiView và 8 ngôn ngữ. | IPTV player for Windows/macOS with M3U, Cast/AirPlay, FFmpeg, Timeshift, MultiView & 8 languages.'
echo ''
echo 'Mo ta About: Tieng Viet truoc, English sau.'
read -r -p 'Cap nhat About (khong bat buoc)? [y/N]: ' ANS
if [[ "$ANS" == 'y' || "$ANS" == 'Y' ]]; then
  if gh repo edit "$REPO" --description "$ABOUT"; then
    echo 'Da cap nhat About song ngu.'
  else
    echo 'Chua doi duoc About; commit ma nguon (neu co) van da push.'
  fi
fi
echo ''
echo "Xem ma nguon: https://github.com/$REPO"
echo 'CHUA tao tag/Release hoac bo cai DMG/EXE. Day la buoc rieng.'

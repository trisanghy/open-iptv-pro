#!/bin/bash
# Open IPTV Pro v4.22.2 — push tested desktop sources to the existing GitHub repository.
# Keeps remote-only files (including iOS/Android); never force-pushes or creates a release tag.
set -Eeuo pipefail
# FIX: prevent Git / GitHub CLI from opening the interactive `less` pager.
# When the command displays "(END)", the original installer cannot reach the push prompt.
export GIT_PAGER=cat
export PAGER=cat
export GH_PAGER=cat
SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"

REPO='trisanghy/open-iptv-pro'
VERSION='4.22.2'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP=''
cleanup() {
  local status=$?
  trap - EXIT
  if [[ -n "$TMP" && -d "$TMP" ]]; then rm -rf "$TMP"; fi
  echo
  if [[ "$status" -eq 0 ]]; then
    echo 'Hoan tat. Hay xem cac dong PUSH MA NGUON / GITHUB ABOUT / HOAN TAT ben tren.'
  else
    echo "DUNG: chua cap nhat GitHub (ma loi: $status). Khong co force-push."
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'echo "Loi tai dong $LINENO" >&2' ERR

printf '\n%s\n' '==============================================================='
printf '%s\n' ' OPEN IPTV PRO v4.22.2 - CAP NHAT MA NGUON GITHUB (MAC)'
printf '%s\n' " Repo: https://github.com/$REPO"
printf '%s\n' ' Desktop Win/Mac | GIU NGUYEN mobile | KHONG force-push'
printf '%s\n' ' Khong tao tag/Release va khong phat hanh bo cai tu dong'
printf '%s\n' '==============================================================='

for cmd in git rsync unzip; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Thieu $cmd. Cai Xcode Command Line Tools: xcode-select --install" >&2
    exit 1
  fi
done
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo 'Thieu Node.js/npm, can de chay test. Hay cai Node.js LTS roi chay lai.' >&2
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo 'Chua co GitHub CLI (gh). Thu cai bang Homebrew, bo qua auto-update cho nhanh...'
    HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew install gh || {
      echo 'Khong cai duoc gh. Thu: HOMEBREW_NO_AUTO_UPDATE=1 brew install gh' >&2
      exit 1
    }
  else
    echo 'Thieu GitHub CLI (gh). Cai tu https://cli.github.com/ hoac cai Homebrew va brew install gh.' >&2
    exit 1
  fi
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/open-iptv-push-4222.XXXXXX")"
SOURCE=''
SOURCE_ZIP=''

# Accept a source folder/ZIP as first argument; otherwise detect a local source folder
# (when script is inside the archive) or find the downloaded source ZIP.
if [[ $# -ge 1 ]]; then
  if [[ -d "$1" ]]; then SOURCE="$1";
  elif [[ -f "$1" ]]; then SOURCE_ZIP="$1";
  else echo "Khong tim thay: $1" >&2; exit 1; fi
elif [[ -f "$SCRIPT_DIR/package.json" ]]; then
  SOURCE="$SCRIPT_DIR"
else
  for dir in "$SCRIPT_DIR" "$HOME/Downloads"; do
    for pattern in \
      "$dir"/Open_IPTV_Pro_v4_22_2_Full_Desktop_Backup_Restore_GitReady_Source*.zip \
      "$dir"/Open_IPTV_Pro_v4_22_2_Full_Desktop_Backup_Restore_Source*.zip; do
      if [[ -f "$pattern" ]]; then SOURCE_ZIP="$pattern"; break 2; fi
    done
  done
fi

if [[ -n "$SOURCE_ZIP" ]]; then
  echo "Doc ma nguon tu file: $SOURCE_ZIP"
  mkdir -p "$TMP/source-unzip"
  unzip -q "$SOURCE_ZIP" -d "$TMP/source-unzip"
  if [[ -f "$TMP/source-unzip/package.json" ]]; then
    SOURCE="$TMP/source-unzip"
  else
    for candidate in "$TMP/source-unzip"/*; do
      if [[ -f "$candidate/package.json" ]]; then SOURCE="$candidate"; break; fi
    done
  fi
fi

if [[ -z "$SOURCE" || ! -f "$SOURCE/package.json" ]]; then
  echo 'Chua tim thay ma nguon v4.22.2 trong Downloads.' >&2
  echo 'Dat ZIP Open_IPTV_Pro_v4_22_2_Full_Desktop_Backup_Restore_Source.zip vao Downloads roi chay lai.' >&2
  exit 1
fi
if ! grep -Eq '"version"[[:space:]]*:[[:space:]]*"4\.22\.2"' "$SOURCE/package.json"; then
  echo 'DUNG: ma nguon khong phai 4.22.2.' >&2; exit 1
fi
for f in src/main.cjs src/backup-service.cjs src/preload.cjs renderer/app.js \
  renderer/index.html tests/backup.test.cjs tests/backup-ui.test.cjs \
  docs/RELEASE_NOTES_V4_22_2_VI_EN.md; do
  [[ -f "$SOURCE/$f" ]] || { echo "Thieu file bat buoc: $f" >&2; exit 1; }
done
if ! grep -Eq '"ffmpeg-static"[[:space:]]*:' "$SOURCE/package.json"; then
  echo 'DUNG: thieu ffmpeg-static, nguy co thay ban Full bang ban Lite.' >&2; exit 1
fi

printf '\n--- Chay test 4.22.2 ---\n'
(cd "$SOURCE" && npm test) || { echo 'TEST LOI: Khong cap nhat GitHub.' >&2; exit 1; }

if ! gh auth status >/dev/null 2>&1; then
  echo '\nGitHub chua dang nhap. Trinh duyet se mo de xac nhan tai khoan.'
  gh auth login --web --git-protocol https
fi
gh auth setup-git
LOGIN="$(gh api user --jq .login)"
USER_ID="$(gh api user --jq .id)"
CAN_PUSH="$(gh api "repos/$REPO" --jq '.permissions.push // false')"
CAN_EDIT_ABOUT="$(gh api "repos/$REPO" --jq '.permissions.admin // false')"
if [[ "$CAN_PUSH" != 'true' ]]; then
  echo "Tai khoan $LOGIN khong co quyen push vao $REPO. Dung." >&2
  exit 1
fi
if [[ "$CAN_EDIT_ABOUT" != 'true' ]]; then
  echo "Tai khoan $LOGIN khong co quyen quan tri de sua GitHub About cho $REPO." >&2
  echo 'Dung truoc khi push: hay dang nhap tai khoan so huu repo (kiem tra: gh auth status).' >&2
  exit 1
fi
BRANCH="$(gh repo view "$REPO" --json defaultBranchRef --jq '.defaultBranchRef.name')"
if [[ -z "$BRANCH" || "$BRANCH" == 'null' ]]; then
  echo 'Khong tim thay nhanh mac dinh tren GitHub.' >&2; exit 1
fi

echo "\nTai khoan: $LOGIN | Repo: $REPO | Nhanh: $BRANCH"
git clone --quiet --single-branch --branch "$BRANCH" "https://github.com/$REPO.git" "$TMP/repo"
cd "$TMP/repo"
[[ -z "$(git status --porcelain)" ]] || { echo 'Git clone khong sach, dung.' >&2; exit 1; }

# Prevent accidental downgrade when the existing repository has newer code.
REMOTE_VERSION=''
if [[ -f package.json ]]; then
  REMOTE_VERSION="$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)".*/\1/p' package.json | head -n 1)"
fi
if [[ "$REMOTE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  IFS='.' read -r rmaj rmin rpat <<< "$REMOTE_VERSION"
  if (( 10#$rmaj > 4 || (10#$rmaj == 4 && 10#$rmin > 22) || (10#$rmaj == 4 && 10#$rmin == 22 && 10#$rpat > 2) )); then
    echo "DUNG: GitHub dang co phien ban v$REMOTE_VERSION, cao hon v4.22.2. Khong ha cap." >&2
    exit 1
  fi
fi

# Copy the desktop source ON TOP of the latest default branch. No --delete.
# Unknown files or directories already on GitHub are preserved.
for d in src renderer assets tests docs scripts .github/workflows; do
  if [[ -d "$SOURCE/$d" ]]; then
    mkdir -p "$d"
    rsync -a \
      --exclude='.DS_Store' --exclude='.git/' --exclude='node_modules/' --exclude='dist/' \
      --exclude='__pycache__/' --exclude='*.log' --exclude='*.tmp' \
      --exclude='.env*' --exclude='*.pem' --exclude='*.p12' --exclude='*.key' \
      --exclude='*.m3u' --exclude='*.m3u8' --exclude='*.token' \
      --exclude='android/' --exclude='ios/' --exclude='mobile/' \
      --exclude='userData/' --exclude='snapshots/' --exclude='private/' \
      "$SOURCE/$d/" "$d/"
  fi
done

ROOT_FILES=(
 package.json package-lock.json .gitignore LICENSE README.md CHANGELOG.md
 CONTRIBUTING.md SECURITY.md THIRD_PARTY_NOTICES.md
 TEST_RESULTS.md TEST_RESULTS_V4_18.md TEST_RESULTS_V4_20.md
 TEST_RESULTS_V4_21.md TEST_RESULTS_V4_21_1.md TEST_RESULTS_V4_22.md
 TEST_RESULTS_V4_22_1.md DESKTOP_AUDIT_V4_22_1.md
 FULL_FEATURES_CHECKLIST.md MIGRATION_4_7.md
 AIRPLAY_FIX_V4_21_1_VI_EN.md BUILD_GUIDE_CAST_V4_21.md
 UPDATE_V4_22_VI_EN.md CHANGELOG_V4_15_EN.md
 BUILD_MAC.command BUILD_WINDOWS.bat BAT_DAU_O_DAY.txt
 GITHUB_ABOUT_EN.txt GITHUB_ABOUT_VI_EN.txt
 HUONG_DAN_BACKUP_RESTORE_V4_22_2.md
 CAP_NHAT_GITHUB_V4_22_2_MAC.command
)
for f in "${ROOT_FILES[@]}"; do
  if [[ -f "$SOURCE/$f" ]]; then cp -p "$SOURCE/$f" "$f"; fi
done
# Keep the latest script in Git even if user still has the older source ZIP.
# Publish THIS fixed command, not the old source version that still invokes `less`.
cp -p "$SELF" CAP_NHAT_GITHUB_V4_22_2_MAC.command
if [[ -f "$SOURCE/examples/demo.m3u" ]]; then
  mkdir -p examples
  cp -p "$SOURCE/examples/demo.m3u" examples/demo.m3u
fi

git add -A -- src renderer assets tests docs scripts .github/workflows
for f in "${ROOT_FILES[@]}"; do
  [[ -f "$f" ]] && git add -- "$f" || true
done
[[ -f examples/demo.m3u ]] && git add -f -- examples/demo.m3u || true

# Never stage personal sources or mobile files. A clean diff is mandatory.
while IFS= read -r file; do
  case "/$file/" in
    */android/*|*/ios/*|*/mobile/*|*/node_modules/*|*/dist/*|*/private/*|*/userData/*|*/snapshots/*)
      echo "DUNG: du lieu khong duoc push: $file" >&2; exit 1;;
  esac
  case "$file" in
    *.m3u|*.m3u8)
      [[ "$file" == 'examples/demo.m3u' ]] || { echo "Playlist ca nhan: $file" >&2; exit 1; };;
    *.pem|*.p12|*.key|*.token|.env|.env.*|*/.env|*/.env.*|settings.json|*/settings.json)
      echo "DUNG: file nhay cam: $file" >&2; exit 1;;
  esac
done < <(git --no-pager diff --cached --name-only)
git --no-pager diff --cached --check

# GitHub's About/Description is not README.md and must be updated via API.
ABOUT='Open IPTV Pro v4.22.2 | IPTV Windows/macOS (Electron/Chromium): M3U, EPG, FFmpeg, Timeshift, MultiView, Snapshot, Cast/AirPlay, Backup/Restore | 8 languages'
CURRENT_ABOUT="$(gh api "repos/$REPO" --jq '.description // ""')"
SOURCE_CHANGED=0
ABOUT_CHANGED=0
if ! git --no-pager diff --cached --quiet; then SOURCE_CHANGED=1; fi
if [[ "$CURRENT_ABOUT" != "$ABOUT" ]]; then ABOUT_CHANGED=1; fi

if [[ "$SOURCE_CHANGED" -eq 0 && "$ABOUT_CHANGED" -eq 0 ]]; then
  echo 'DA CAP NHAT DAY DU: ma nguon va GitHub About hien tai da trung voi v4.22.2.'
  echo "https://github.com/$REPO"
  exit 0
fi

if [[ "$SOURCE_CHANGED" -eq 1 ]]; then
  echo
  echo '===== CAC FILE MA NGUON SE CAP NHAT (KHONG DUNG LESS) ====='
  git --no-pager diff --cached --stat
  echo
  # Run regression tests once more on the merged repo tree before committing.
  npm test || { echo 'TEST tren noi dung GitHub sau khi ghep bi loi. Khong push.' >&2; exit 1; }
else
  echo 'Ma nguon tren repo da giong v4.22.2, khong can push code.'
fi
if [[ "$ABOUT_CHANGED" -eq 1 ]]; then
  echo
  echo '===== GITHUB ABOUT / DESCRIPTION MOI ====='
  echo "$ABOUT"
fi

echo
printf 'Tai khoan: %s\nRepo: %s\nNhanh: %s\n' "$LOGIN" "$REPO" "$BRANCH"
echo 'Khong ghi de file mobile, khong xoa file khac, khong tao tag/Release.'
printf 'Nhap CAP NHAT de cap nhat GitHub, nhap bat ky de huy: '
read -r CONFIRM
if [[ "$CONFIRM" != 'CAP NHAT' ]]; then
  echo 'Da huy. Chua cap nhat bat ky thay doi nao.'
  exit 0
fi

if [[ "$SOURCE_CHANGED" -eq 1 ]]; then
  git -c user.name="$LOGIN" -c user.email="${USER_ID}+${LOGIN}@users.noreply.github.com" \
    commit -m 'Add desktop Backup/Restore and safety checks (v4.22.2)'
  git push origin "HEAD:$BRANCH"
  echo "PUSH MA NGUON THANH CONG: $(git rev-parse --short HEAD)"
fi
if [[ "$ABOUT_CHANGED" -eq 1 ]]; then
  if ! gh api --method PATCH "repos/$REPO" -f "description=$ABOUT" --jq .description; then
    echo 'CANH BAO: Push ma nguon (neu co) da hoan tat, nhung cap nhat About that bai.' >&2
    echo 'Hay mo GitHub > Settings (repo) hoac muc About > Edit de sua thu cong.' >&2
    exit 1
  fi
  echo 'CAP NHAT GITHUB ABOUT THANH CONG.'
fi

echo
printf 'HOAN TAT: %s\n' "https://github.com/$REPO"
echo 'Da xu ly ma nguon README va GitHub About theo noi dung tren.'
echo 'Chua tao tag/Release hoac file cai dat.'

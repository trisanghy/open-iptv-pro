#!/usr/bin/env bash
# Safely publish Windows/macOS desktop sources to the existing upstream repo.
# No force push, no history rewrite, no tag/release, no modifications to mobile branches.
set -Eeuo pipefail
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO='trisanghy/open-iptv-pro'
TARGET_VERSION='4.23.60'
COMMIT_MESSAGE='feat(desktop): release v4.23.60 with collapsible channel list and player UI fixes'

printf '\n=== OPEN IPTV PRO %s — CAP NHAT GITHUB AN TOAN ===\n' "$TARGET_VERSION"
printf 'Ma nguon: %s\nRepository: %s\n\n' "$SOURCE_DIR" "$REPO"
for cmd in git gh rsync; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf 'THIEU %s.\n' "$cmd"
    if [ "$cmd" = gh ]; then
      echo 'Cai GitHub CLI tren Mac: brew install gh'
      echo 'Neu chua cai Homebrew, xem https://cli.github.com/'
    fi
    exit 1
  fi
done
if [ "$(uname -s)" != 'Darwin' ]; then
  echo 'Script nay danh cho macOS. Khong thay doi repository.';exit 1
fi
if [ ! -f "$SOURCE_DIR/package.json" ] || [ ! -f "$SOURCE_DIR/renderer/index.html" ]; then
  echo 'Thieu ma nguon Electron trong thu muc script.';exit 1
fi
SOURCE_VERSION="$(sed -nE 's/^[[:space:]]*"version":[[:space:]]*"([^"]+)".*/\1/p' "$SOURCE_DIR/package.json" | head -1)"
if [ "$SOURCE_VERSION" != "$TARGET_VERSION" ]; then
  printf 'SAI BAN NGUON: %s, can %s. DUNG de khong day nham.\n' "$SOURCE_VERSION" "$TARGET_VERSION";exit 1
fi

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo 'Chua dang nhap GitHub CLI. Mo dang nhap qua trinh duyet...'
  gh auth login --hostname github.com --git-protocol https --web
fi
gh auth setup-git >/dev/null
LOGIN="$(gh api user --jq '.login')"
ACCOUNT_ID="$(gh api user --jq '.id')"
CAN_PUSH="$(gh api "repos/$REPO" --jq '.permissions.push')"
if [ "$CAN_PUSH" != 'true' ]; then
  printf 'Tai khoan %s KHONG CO quyen push vao %s.\n' "$LOGIN" "$REPO"
  echo 'Dung tai day; khong thay doi repository.';exit 1
fi
printf 'GitHub account: %s (co quyen push)\n' "$LOGIN"

TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/openiptv-publish-42335.XXXXXXXX")"
FINISHED=0
cleanup(){
  if [ "$FINISHED" -eq 1 ]; then rm -rf "$TEMP_DIR";else printf '\nDa dung. Ban sao git tam (neu clone thanh cong): %s\n' "$TEMP_DIR";fi
}
trap cleanup EXIT
CLONE="$TEMP_DIR/repo"
echo '[1/5] Clone repository hien tai: khong xoa lich su...'
gh repo clone "$REPO" "$CLONE" -- --single-branch
if [ ! -d "$CLONE/.git" ]; then echo 'Khong clone duoc Git repository.';exit 1;fi
UPSTREAM="$(git -C "$CLONE" remote get-url origin)"
case "$UPSTREAM" in
  "https://github.com/$REPO"|"https://github.com/$REPO.git"|"git@github.com:$REPO"|"git@github.com:$REPO.git") ;;
  *) printf 'Remote bat thuong: %s\n' "$UPSTREAM";exit 1;;
esac
DEFAULT_BRANCH="$(git -C "$CLONE" symbolic-ref --quiet --short HEAD)"
if [ -z "$DEFAULT_BRANCH" ] || [ -n "$(git -C "$CLONE" status --porcelain)" ]; then
  echo 'Khong xac dinh duoc nhanh sach. Khong day len GitHub.';exit 1
fi
ORIGINAL_SHA="$(git -C "$CLONE" rev-parse HEAD)"
if [ ! -f "$CLONE/package.json" ]; then
  echo 'Repository tren GitHub chua co package.json; can doi chieu thu cong de tranh ghi de nham du an.';exit 1
fi
REMOTE_VERSION="$(sed -nE 's/^[[:space:]]*"version":[[:space:]]*"([^"]+)".*/\1/p' "$CLONE/package.json" | head -1)"
if [[ ! "$REMOTE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf 'Khong doc duoc version tren remote: %s. Dung de kiem tra thu cong.\n' "$REMOTE_VERSION";exit 1
fi
REMOTE_MAJ="${REMOTE_VERSION%%.*}"; REMOTE_REST="${REMOTE_VERSION#*.}"
REMOTE_MIN="${REMOTE_REST%%.*}"; REMOTE_PATCH="${REMOTE_REST##*.}"
IFS='.' read -r TARGET_MAJ TARGET_MIN TARGET_PATCH <<< "$TARGET_VERSION"
TARGET_VALUE=$((10#$TARGET_MAJ*1000000 + 10#$TARGET_MIN*1000 + 10#$TARGET_PATCH))
REMOTE_VALUE=$((10#$REMOTE_MAJ*1000000 + 10#$REMOTE_MIN*1000 + 10#$REMOTE_PATCH))
printf 'Nhanh: %s | Commit goc: %s | Version remote: %s\n' "$DEFAULT_BRANCH" "${ORIGINAL_SHA:0:12}" "$REMOTE_VERSION"
if [ "$REMOTE_VALUE" -ge "$TARGET_VALUE" ]; then
  echo 'GitHub da co phien ban 4.23.60 hoac moi hon. Khong tu ghi de. Hay xem lai repo truoc.';exit 1
fi

# Synchronize desktop code without --delete; never touch iOS/Android,
# .github workflows, or any remote-only files.
echo '[2/5] Dong bo ma nguon Windows/macOS, KHONG xoa file GitHub dang co...'
for dir in src renderer assets scripts tests docs examples; do
  if [ -d "$SOURCE_DIR/$dir" ]; then
    mkdir -p "$CLONE/$dir"
    rsync -a \
      --exclude '*.m3u' --exclude '*.m3u8' --exclude '.env' --exclude '.env.*' \
      --exclude '*.pem' --exclude '*.p12' --exclude '*.key' --exclude '*.token' \
      --exclude 'node_modules/' --exclude 'dist/' --exclude '.open-iptv-tools/' \
      --exclude '.streamleaf-tools/' --exclude 'snapshots/' --exclude 'userData/' \
      "$SOURCE_DIR/$dir/" "$CLONE/$dir/"
  fi
done
for path in "$SOURCE_DIR"/*.md "$SOURCE_DIR"/*.txt "$SOURCE_DIR"/*.command \
            "$SOURCE_DIR"/*.bat "$SOURCE_DIR"/package.json "$SOURCE_DIR"/LICENSE \
            "$SOURCE_DIR"/CONTRIBUTING.md "$SOURCE_DIR"/SECURITY.md \
            "$SOURCE_DIR"/THIRD_PARTY_NOTICES.md; do
  [ -f "$path" ] || continue
  cp -p "$path" "$CLONE/$(basename "$path")"
done
# Keep any upstream ignore rules; supply ours only to repositories missing the file.
if [ ! -f "$CLONE/.gitignore" ]; then cp -p "$SOURCE_DIR/.gitignore" "$CLONE/.gitignore"; fi

# Work on a local clone of the *actual remote* instead of initializing
# a new repository, to retain the upstream commit ancestry safely.
git -C "$CLONE" add -A
if git -C "$CLONE" diff --cached --quiet; then
  echo 'Khong co file thay doi de commit.';FINISHED=1;exit 0
fi
# Extra sanity gate: prevent any personal playlist or credentials in staged set.
if git -C "$CLONE" diff --cached --name-only | grep -Ei '(^|/)(\.env|private|userData|snapshots)(/|$)|\.(m3u8?|pem|p12|key|token)$' >/dev/null; then
  echo 'PHAT HIEN FILE NHAY CAM trong staged changes. DUNG TRUOC KHI PUSH.'
  git -C "$CLONE" diff --cached --name-only | grep -Ei '(^|/)(\.env|private|userData|snapshots)(/|$)|\.(m3u8?|pem|p12|key|token)$' || true
  exit 1
fi
printf '\n[3/5] Danh sach file se thay doi:\n'
git -C "$CLONE" status --short
printf '\nThong ke: \n'
git -C "$CLONE" diff --cached --stat
printf '\nCHI PUBLISH KHI DA XEM KY. KHONG force-push, KHONG tao tag/release.\n'
read -r -p 'Nhap dung CAP NHAT 4.23.60 de commit va push (Enter de huy): ' APPROVAL
if [ "$APPROVAL" != 'CAP NHAT 4.23.60' ]; then echo 'Da huy; chua push.';exit 1;fi

# Use GitHub's private no-reply address for this single clone, not machine-global settings.
git -C "$CLONE" config user.name "$LOGIN"
git -C "$CLONE" config user.email "${ACCOUNT_ID}+${LOGIN}@users.noreply.github.com"
echo '[4/5] Commit cac thay doi Desktop tren nhanh goc...'
git -C "$CLONE" commit -m "$COMMIT_MESSAGE"
echo '[5/5] Push fast-forward toi remote; tu choi neu nhanh da thay doi...'
git -C "$CLONE" push origin "HEAD:refs/heads/$DEFAULT_BRANCH"
NEW_SHA="$(git -C "$CLONE" rev-parse HEAD)"
FINISHED=1
printf '\nTHANH CONG: %s\n' "$COMMIT_MESSAGE"
printf 'Commit: https://github.com/%s/commit/%s\n' "$REPO" "$NEW_SHA"
printf 'Repository: https://github.com/%s\n' "$REPO"

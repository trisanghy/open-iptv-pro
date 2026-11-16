#!/usr/bin/env bash
set -Eeuo pipefail

# Publish ONLY the isolated Rust Lab branch. Never touch the user's original Electron checkout.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OWNER_REPO='trisanghy/open-iptv-pro'
BRANCH='experiment/rust-tauri-v2'
REMOTE="https://github.com/${OWNER_REPO}.git"

die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

command -v git >/dev/null 2>&1 || die 'Git khong co tren Mac (cai Xcode Command Line Tools).'
command -v node >/dev/null 2>&1 || die 'Khong tim thay Node.js (can de kiem thu truoc khi publish).'
[ -f "$SCRIPT_DIR/package.json" ] || die 'Thieu package.json trong bo ma nguon.'
[ -f "$SCRIPT_DIR/src-tauri/Cargo.toml" ] || die 'Thieu Rust Core (src-tauri/Cargo.toml).'
[ -f "$SCRIPT_DIR/CHANGELOG_RUSTLAB_V8.md" ] || die 'Khong tim thay changelog organizer v8.'
node -e 'const p=require(process.argv[1]); if(p.name!=="open-iptv-pro-tauri-experiment" || p.version!=="4.23.17-tauri.8") process.exit(2)' "$SCRIPT_DIR/package.json" || die 'Ten / phien ban project khong khop Rust Lab v8.'

# No user playlists, access tokens, certificates, recordings, or private app data can be published.
for forbidden in '.env' '.env.local' 'secrets.json' 'settings.json'; do
  [ ! -e "$SCRIPT_DIR/$forbidden" ] || die "Phat hien file rieng tu $forbidden; khong publish."
done

info 'Chay kiem thu JS + soat bridge ngay tren bo nguon v8...'
(cd "$SCRIPT_DIR" && npm test && npm run audit:bridge)

if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    info 'Chua co GitHub CLI; cai tu Homebrew.'
    brew install gh
  else
    die 'Can GitHub CLI. Tai https://cli.github.com/ hoac cai Homebrew truoc.'
  fi
fi

if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  info 'Xac thuc GitHub 1 lan trong trinh duyet (can nguoi dung cho phep).'
  gh auth login --hostname github.com --web --git-protocol https
fi
# GitHub CLI registers a credential helper for HTTPS Git operations.
gh auth setup-git
ACCOUNT="$(gh api user --jq '.login')" || die 'Khong doc duoc tai khoan GitHub.'
CAN_PUSH="$(gh api "repos/$OWNER_REPO" --jq '.permissions.push')" || die 'Khong truy cap duoc repo GitHub.'
[ "$CAN_PUSH" = 'true' ] || die "Tai khoan $ACCOUNT khong co quyen push vao $OWNER_REPO."
info "Tai khoan: $ACCOUNT | repo: $OWNER_REPO | chi nhanh: $BRANCH"

# Always clone into a NEW disposable folder; no local worktrees or main are modified.
mkdir -p "$HOME/Downloads"
WORK="$(mktemp -d "$HOME/Downloads/OpenIPTVPro_RustLab_Git_v8_XXXXXX")"
info "Clone vao thu muc rieng: $WORK"
git clone --no-tags "$REMOTE" "$WORK/repo"
DEST="$WORK/repo"
[ -d "$DEST/.git" ] || die 'Khong tim thay Git clone moi.'

if git -C "$DEST" show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  git -C "$DEST" switch --track -c "$BRANCH" "origin/$BRANCH"
  BRANCH_ALREADY_EXISTS=1
  OLD_NAME="$(git -C "$DEST" show "HEAD:package.json" 2>/dev/null | node -e 'let s="";process.stdin.on("data",x=>s+=x);process.stdin.on("end",()=>{try{process.stdout.write(JSON.parse(s).name || "")}catch(e){}})')"
  [ "$OLD_NAME" = 'open-iptv-pro-tauri-experiment' ] || die "Remote branch $BRANCH da ton tai nhung khong giong Rust Lab. Khong ghi de noi dung la."
else
  git -C "$DEST" show-ref --verify --quiet 'refs/remotes/origin/main' || die 'Khong tim thay origin/main. Da dung de khong tao sai nhanh.'
  git -C "$DEST" switch --create "$BRANCH" origin/main
  BRANCH_ALREADY_EXISTS=0
fi

info 'Cap nhat bo ma nguon v8 chi trong nhanh thu nghiem (main khong thay doi).'
# All file deletions occur in the newly cloned experiment checkout only.
if [ "$BRANCH_ALREADY_EXISTS" -eq 0 ]; then
  git -C "$DEST" rm -r -q -f -- .
fi
rsync -a \
  --exclude='.git/' --exclude='node_modules/' --exclude='dist/' --exclude='target/' \
  --exclude='build-logs/' --exclude='*.dmg' --exclude='*.exe' --exclude='*.msi' \
  --exclude='*.log' --exclude='.env*' --exclude='*.pem' --exclude='*.key' \
  --exclude='*.p12' --exclude='*.m3u8' --exclude='userData/' --exclude='snapshots/' \
  "$SCRIPT_DIR/" "$DEST/"
git -C "$DEST" add --all

# The source bundle contains only the synthetic, intentionally public playlist example.
if git -C "$DEST" ls-files | grep -E '(^|/)(\.env(\.|$)|settings\.json$|userData/|snapshots/)|\.(pem|p12|key|m3u8)$' >/dev/null; then
  die 'Git index contains a private/credential-like file; commit aborted.'
fi

git -C "$DEST" -c core.whitespace=-blank-at-eol diff --cached --check || die 'Git detected whitespace/patch errors; commit aborted.'
if git -C "$DEST" diff --cached --quiet; then
  info 'Khong co thay doi moi de commit (nhanh da giong bo nguon).'
else
  # Set identity only in this fresh cloned experiment repository when missing.
  if ! git -C "$DEST" config user.name >/dev/null; then
    git -C "$DEST" config user.name "$ACCOUNT"
  fi
  if ! git -C "$DEST" config user.email >/dev/null; then
    ACCOUNT_ID="$(gh api user --jq '.id')"
    git -C "$DEST" config user.email "${ACCOUNT_ID}+${ACCOUNT}@users.noreply.github.com"
  fi
  git -C "$DEST" commit -m 'feat(rust-lab): v8 folder organizer and compact sidebar' \
    -m 'Independent Rust Lab branch with 104 JS tests, channel ordering by folder, persistent grouping, multi-select drag/drop, compact navigation, and existing v7 playback fixes.'
fi

info "Push DUY NHAT $BRANCH (khong --force, khong tag, khong release)."
git -C "$DEST" push --set-upstream origin "HEAD:refs/heads/$BRANCH"
info 'Push hoan tat. GitHub Actions (neu duoc bat) se tu chay build Windows/macOS.'
printf '\nGithub: https://github.com/%s/tree/%s\n' "$OWNER_REPO" "$BRANCH"
printf 'Actions: https://github.com/%s/actions/workflows/rust-tauri-lab.yml\n' "$OWNER_REPO"
printf 'Git clone local: %s\n' "$DEST"

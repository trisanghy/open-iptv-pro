#!/bin/bash
set -Eeuo pipefail
VERSION="4.23.17-tauri.18"
REPO="trisanghy/open-iptv-pro"
BRANCH="experiment/rust-tauri-v2"
NAME="OpenIPTVPro_RustLab_v18"
DEST="$HOME/Downloads/${NAME}_Build"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/rustlab-v18.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
err(){ echo "LỖI: $*" >&2; exit 1; }
echo "Open IPTV Pro Rust Lab v18 — one ZIP / fast build"
# One archive download; no git clone, no per-file download.
curl -fLsS --retry 2 --connect-timeout 20 "https://github.com/${REPO}/archive/refs/heads/${BRANCH}.zip" -o "$TMP/source.zip" || err "Không tải được ZIP từ GitHub"
mkdir -p "$TMP/extract"
ditto -x -k "$TMP/source.zip" "$TMP/extract" || err "ZIP bị hỏng hoặc tải chưa hoàn tất"
SOURCE="$(find "$TMP/extract" -maxdepth 1 -type d -name 'open-iptv-pro-*' -print -quit)"
[[ -n "$SOURCE" && -f "$SOURCE/package.json" ]] || err "Không tìm thấy mã nguồn Rust Lab"
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4\.23\.17-tauri\.18"' "$SOURCE/package.json" || err "GitHub chưa có đúng v18; dừng để tránh build nhầm bản cũ"
if ! xcode-select -p >/dev/null 2>&1; then
 xcode-select --install 2>/dev/null || true
 err "Cần hoàn tất Xcode Command Line Tools do macOS yêu cầu rồi chạy lại"
fi
if ! command -v brew >/dev/null; then
 NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || err "Cài Homebrew thất bại"
fi
[[ -x /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
[[ -x /usr/local/bin/brew ]] && eval "$(/usr/local/bin/brew shellenv)"
if ! command -v node >/dev/null || ! node -e 'process.exit(+process.versions.node.split(".")[0]>=22?0:1)' 2>/dev/null; then
 brew install node || err "Cài Node thất bại"
fi
if ! command -v cargo >/dev/null; then
 curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal || err "Cài Rust thất bại"
 [[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"
fi
cd "$SOURCE"
npm install --no-audit --no-fund --prefer-offline || err "npm install thất bại"
# No repeated scans or full test suites. Release app, DMG only.
npm run build -- --bundles dmg || err "Build Tauri DMG thất bại"
DMG="$(find src-tauri/target/release/bundle/dmg -maxdepth 1 -name '*.dmg' -type f -print -quit)"
[[ -n "$DMG" && -s "$DMG" ]] || err "Không tạo được DMG"
mkdir -p "$DEST"
find "$DEST" -maxdepth 1 -type f \( -name '*.dmg' -o -name '*_Source.zip' \) -delete
cp "$DMG" "$DEST/${NAME}.dmg"
# Preserve the exact GitHub archive downloaded above (no second zip pass).
cp "$TMP/source.zip" "$DEST/${NAME}_Source.zip"
echo "THÀNH CÔNG: $DEST"
open "$DEST"
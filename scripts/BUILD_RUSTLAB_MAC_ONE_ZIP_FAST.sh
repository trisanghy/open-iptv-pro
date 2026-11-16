#!/bin/bash
set -Eeuo pipefail
VERSION="4.23.17-tauri.16"
REPO="trisanghy/open-iptv-pro"
BRANCH="experiment/rust-tauri-v2"
NAME="OpenIPTVPro_RustLab_v16"
DEST="$HOME/Downloads/${NAME}_Build"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/rustlab-v16.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
err(){ echo "LOI: $*" >&2; exit 1; }
echo "Open IPTV Pro Rust Lab v16 — single ZIP / fast build"
# Exactly one source archive download; no git clone or per-file transfer.
curl -fLsS --retry 2 --connect-timeout 20 "https://github.com/${REPO}/archive/refs/heads/${BRANCH}.zip" -o "$TMP/source.zip" || err "Khong tai duoc ZIP tu GitHub"
mkdir -p "$TMP/extract"
ditto -x -k "$TMP/source.zip" "$TMP/extract" || err "ZIP bi hong hoac chua tai xong"
SOURCE="$(find "$TMP/extract" -maxdepth 1 -type d -name 'open-iptv-pro-*' -print -quit)"
[[ -n "$SOURCE" && -f "$SOURCE/package.json" ]] || err "Khong tim thay ma nguon Rust Lab"
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4\.23\.17-tauri\.16"' "$SOURCE/package.json" || err "Nhanh GitHub chua co v16; dung de tranh build nham ban cu"
if ! xcode-select -p >/dev/null 2>&1; then
 xcode-select --install 2>/dev/null || true
 err "Can hoan tat Xcode Command Line Tools do macOS yeu cau, roi chay lai"
fi
if ! command -v brew >/dev/null; then
 NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || err "Homebrew install failed"
fi
[[ -x /opt/homebrew/bin/brew ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
[[ -x /usr/local/bin/brew ]] && eval "$(/usr/local/bin/brew shellenv)"
if ! command -v node >/dev/null || ! node -e 'process.exit(+process.versions.node.split(".")[0]>=22?0:1)' 2>/dev/null; then
 brew install node || err "Node install failed"
fi
if ! command -v cargo >/dev/null; then
 curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal || err "Rust install failed"
 [[ -f "$HOME/.cargo/env" ]] && source "$HOME/.cargo/env"
fi
cd "$SOURCE"
npm install --no-audit --no-fund --prefer-offline || err "npm install failed"
# Skip repeated validation, npm tests and redundant ZIP scans for speed.
npm run build -- --bundles dmg || err "Tauri build DMG failed"
DMG="$(find src-tauri/target/release/bundle/dmg -maxdepth 1 -name '*.dmg' -type f -print -quit)"
[[ -n "$DMG" && -s "$DMG" ]] || err "No DMG produced"
mkdir -p "$DEST"
find "$DEST" -maxdepth 1 -type f \( -name '*.dmg' -o -name '*_Source.zip' \) -delete
cp "$DMG" "$DEST/${NAME}.dmg"
# ZIP the exact built sources, excluding all caches and build intermediates.
cd "$TMP/extract"
ditto -c -k --norsrc --keepParent "$SOURCE" "$TMP/output-source.zip" || err "Cannot pack sources"
cp "$TMP/output-source.zip" "$DEST/${NAME}_Source.zip"
echo "THANH CONG: $DEST"
open "$DEST"

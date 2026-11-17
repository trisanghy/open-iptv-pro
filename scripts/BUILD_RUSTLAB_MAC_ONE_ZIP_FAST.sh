#!/bin/bash
set -Eeuo pipefail
VERSION="4.23.17-tauri.23.8.7"
REPO="trisanghy/open-iptv-pro"
BRANCH="experiment/rust-tauri-v2"
TAG="rust-lab/v23.8.7" # Immutable release tag; previous versions remain unchanged
NAME="OpenIPTVPro_RustLab_v23_8_7"
DEST_BASE="$HOME/Downloads/${NAME}_Build"
DEST="$DEST_BASE"
INDEX=2
while [[ -e "$DEST" ]]; do
  DEST="${DEST_BASE}_${INDEX}"
  INDEX=$((INDEX + 1))
done
TMP="$(mktemp -d "${TMPDIR:-/tmp}/rustlab-v23-8-7.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
err(){ echo "LỖI: $*" >&2; exit 1; }
echo "Open IPTV Pro Rust Lab v23.8.7 — Mac build .app only / keep GitHub Release DMG + ZIP"
# Download the immutable v23.8.7 source tag into a TEMPORARY ZIP; never retain source archive in Downloads.
curl -fLsS --retry 2 --connect-timeout 20 "https://github.com/${REPO}/archive/refs/tags/${TAG}.zip" -o "$TMP/source.zip" || err "Không tải được ZIP từ GitHub"
mkdir -p "$TMP/extract"
ditto -x -k "$TMP/source.zip" "$TMP/extract" || err "ZIP bị hỏng hoặc tải chưa hoàn tất"
SOURCE="$(find "$TMP/extract" -maxdepth 1 -type d -name 'open-iptv-pro-*' -print -quit)"
[[ -n "$SOURCE" && -f "$SOURCE/package.json" ]] || err "Không tìm thấy mã nguồn Rust Lab"
# Verify the archive version against VERSION above; do not pin a stale regex.
# macOS BSD sed is available before any Node or Rust bootstrap.
ACTUAL_VERSION="$(sed -nE 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$SOURCE/package.json" | head -n 1)"
[[ -n "$ACTUAL_VERSION" && "$ACTUAL_VERSION" == "$VERSION" ]] || err "Sai phiên bản source: cần $VERSION, tìm thấy ${ACTUAL_VERSION:-không rõ}. Không build nhầm."
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
# Local Mac: build ONLY a native .app. GitHub Actions independently retains DMG + source ZIP.
npm run build -- --bundles app || err "Build Tauri .app thất bại"
APP_DIR="src-tauri/target/release/bundle/macos"
[[ -d "$APP_DIR" ]] || err "Không tìm thấy thư mục .app của Tauri"
APP="$(find "$APP_DIR" -maxdepth 1 -type d -name '*.app' -print -quit)"
[[ -n "$APP" && -f "$APP/Contents/Info.plist" && -d "$APP/Contents/MacOS" ]] || err "Không tạo được gói ứng dụng .app hợp lệ"
EXECUTABLE="$(find "$APP/Contents/MacOS" -maxdepth 1 -type f -print -quit)"
[[ -n "$EXECUTABLE" && -s "$EXECUTABLE" ]] || err ".app thiếu tệp thực thi"
mkdir -p "$DEST"
APP_TARGET="$DEST/$(basename "$APP")"
ditto "$APP" "$APP_TARGET" || err "Không sao chép được ứng dụng .app"
[[ -f "$APP_TARGET/Contents/Info.plist" && -s "$APP_TARGET/Contents/MacOS/$(basename "$EXECUTABLE")" ]] || err "Sao chép .app không hoàn chỉnh"
# Exactly one top-level item in the resulting Downloads folder: the .app bundle.
OUTPUT_COUNT="$(find "$DEST" -mindepth 1 -maxdepth 1 -print | wc -l | tr -d '[:space:]')"
[[ "$OUTPUT_COUNT" == 1 ]] || err "Thư mục đầu ra không chỉ chứa một ứng dụng .app"
echo "THÀNH CÔNG: $APP_TARGET"
open "$DEST"
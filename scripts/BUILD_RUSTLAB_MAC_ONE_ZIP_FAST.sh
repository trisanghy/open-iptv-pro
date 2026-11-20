#!/bin/bash
set -Eeuo pipefail
VERSION="" # Resolve package version from the checked-out branch archive
REPO="trisanghy/open-iptv-pro"
BRANCH="experiment/rust-tauri-v2"
SOURCE_REF="refs/heads/${BRANCH}" # Track latest existing Rust Lab branch HEAD; never rewrite release tags
DEST="$HOME/Downloads/OpenIPTVPro_RustLab_Build"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/rustlab-current.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
err(){ echo "LỖI: $*" >&2; exit 1; }
echo "Open IPTV Pro Rust Lab — build current branch HEAD to one Mac .app"
# Download the HEAD of the existing Rust Lab branch, not an older immutable release tag.
# Release tags remain unchanged; this script builds fresh source independently of Releases.
curl -fLsS --retry 2 --connect-timeout 20 "https://github.com/${REPO}/archive/${SOURCE_REF}.zip" -o "$TMP/source.zip" || err "Không tải được ZIP nhánh Rust Lab từ GitHub"
mkdir -p "$TMP/extract"
ditto -x -k "$TMP/source.zip" "$TMP/extract" || err "ZIP bị hỏng hoặc tải chưa hoàn tất"
SOURCE="$(find "$TMP/extract" -maxdepth 1 -type d -name 'open-iptv-pro-*' -print -quit)"
[[ -n "$SOURCE" && -f "$SOURCE/package.json" ]] || err "Không tìm thấy mã nguồn Rust Lab"
# Read the actual source version without a stale hard-coded release assertion.
# macOS BSD sed is available before any Node or Rust bootstrap.
ACTUAL_VERSION="$(sed -nE 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$SOURCE/package.json" | head -n 1)"
[[ -n "$ACTUAL_VERSION" ]] || err "Không đọc được phiên bản trong package.json"
VERSION="$ACTUAL_VERSION"
[[ -f "$SOURCE/renderer/unified-ai-inline-v1.js" && -f "$SOURCE/renderer/unified-ai-inline-v1.css" ]] || err "Mã nguồn tải về chưa chứa giao diện Phụ đề · Dịch · Giọng nói mới"
echo "Đã tải Rust Lab ${VERSION} với giao diện AI hợp nhất"
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
STAGED="$TMP/output"
mkdir -p "$STAGED"
APP_TARGET="$STAGED/$(basename "$APP")"
ditto "$APP" "$APP_TARGET" || err "Không sao chép được ứng dụng .app"
# Replace only the dedicated build output directory after successful compilation.
# Keep existing installed apps and other Downloads folders untouched.
# Only the dedicated Rust Lab build folder may be emptied.
# This intentionally deletes ALL old entries, including hidden .DS_Store and old .app bundles.
[[ "$DEST" == "$HOME/Downloads/OpenIPTVPro_RustLab_Build" ]] || err "Từ chối dọn ngoài thư mục build Rust Lab: $DEST"
[[ ! -L "$DEST" ]] || err "Từ chối dọn thư mục build dạng symlink: $DEST"
if [[ -e "$DEST" && ! -d "$DEST" ]]; then err "Đường dẫn build tồn tại nhưng không phải thư mục: $DEST"; fi
mkdir -p "$DEST"
find "$DEST" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + || err "Không thể dọn sạch thư mục build"
FINAL_APP="$DEST/$(basename "$APP")"
ditto "$APP_TARGET" "$FINAL_APP" || err "Không chép được .app mới vào Downloads"
APP_TARGET="$FINAL_APP"
[[ -f "$APP_TARGET/Contents/Info.plist" && -s "$APP_TARGET/Contents/MacOS/$(basename "$EXECUTABLE")" ]] || err "Sao chép .app không hoàn chỉnh"
# Exactly one top-level item in the resulting Downloads folder: the .app bundle.
# Finder can write .DS_Store while copying the app; remove it before final validation.
find "$DEST" -mindepth 1 -maxdepth 1 -name '.DS_Store' -exec rm -f -- {} +
OUTPUT_COUNT="$(find "$DEST" -mindepth 1 -maxdepth 1 -print | wc -l | tr -d '[:space:]')"
[[ "$OUTPUT_COUNT" == 1 ]] || err "Thư mục đầu ra không chỉ chứa một ứng dụng .app"
echo "THÀNH CÔNG: $APP_TARGET"
open "$DEST"
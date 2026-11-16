#!/usr/bin/env bash
set -Eeuo pipefail
ARCHIVE='OpenIPTVPro_RustNative_C3_v4.23.17_UREQFIX_Source.zip'
BRANCH='experiment/rust-native-slint-libmpv-c3-autobuild'
SHA256='21d67fa25035d1f432fb5280f8b795d377dad890d684737b8459269209c502ff'
URL="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/refs/heads/$BRANCH/source/$ARCHIVE"
OUT="$HOME/Downloads/OpenIPTVPro_C3_v4.23.17_BUILD"
DMG='OpenIPTVPro_C3_v4.23.17.dmg'
SRC='OpenIPTVPro_C3_v4.23.17_Source.zip'
WORK="$(mktemp -d -t openiptv-c3-build)"
trap 'rc=$?; rm -rf "$WORK"; exit "$rc"' EXIT
fail(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }
msg(){ printf '\n==> %s\n' "$*"; }
[ "$(uname -s)" = Darwin ] || fail 'macOS is required'
msg 'Downloading exact Rust Native C3 source from isolated GitHub branch'
curl -fL --retry 3 --connect-timeout 20 "$URL" -o "$WORK/source.zip" || fail "Source archive not published: $URL"
[ "$(shasum -a 256 "$WORK/source.zip" | awk '{print $1}')" = "$SHA256" ] || fail 'Source checksum mismatch'
unzip -tq "$WORK/source.zip" >/dev/null || fail 'Invalid ZIP'
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install || true
  fail 'Finish Apple Command Line Tools installation, then rerun'
fi
if ! command -v brew >/dev/null; then
  msg 'Installing Homebrew'
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || fail 'Homebrew installer failed or needs system approval'
fi
if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
if [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
command -v brew >/dev/null || fail 'Homebrew missing'
if ! command -v cargo >/dev/null || ! command -v rustc >/dev/null; then HOMEBREW_NO_AUTO_UPDATE=1 brew install rust; fi
if ! brew list --versions mpv | grep -q .; then HOMEBREW_NO_AUTO_UPDATE=1 brew install mpv; fi
if ! command -v ffmpeg >/dev/null; then HOMEBREW_NO_AUTO_UPDATE=1 brew install ffmpeg; fi
msg 'Unpacking, testing and compiling'
unzip -qo "$WORK/source.zip" -d "$WORK/src"
ROOT="$WORK/src/OpenIPTVPro_RustNative_C3_v4.23.17"
NATIVE="$ROOT/native-rust"
[ -f "$NATIVE/Cargo.toml" ] && [ -f "$NATIVE/ui/app.slint" ] || fail 'Incorrect source layout'
(cd "$NATIVE" && cargo test && cargo build --release)
BIN="$NATIVE/target/release/open-iptv-pro-native"
[ -x "$BIN" ] || fail 'Release binary missing'
APP="$WORK/Open IPTV Pro Rust Native C3.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
install -m 755 "$BIN" "$APP/Contents/MacOS/OpenIPTVProRustNative"
cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleIdentifier</key><string>com.trisanghy.openiptvpro.rustnative.c3</string>
<key>CFBundleName</key><string>Open IPTV Pro Rust Native C3</string>
<key>CFBundleExecutable</key><string>OpenIPTVProRustNative</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>4.23.17</string>
<key>CFBundleVersion</key><string>3</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
cp "$ROOT/assets/icon.png" "$APP/Contents/Resources/icon.png"
codesign --force --sign - "$APP" || fail 'Local ad-hoc signing failed'
msg 'Creating DMG'
hdiutil create -volname 'Open IPTV Pro Rust Native C3' -srcfolder "$APP" -ov -format UDZO "$WORK/$DMG" >/dev/null
hdiutil imageinfo "$WORK/$DMG" >/dev/null || fail 'Invalid DMG'
msg 'Keeping only DMG and matching source ZIP'
mkdir -p "$OUT"
for item in "$OUT"/* "$OUT"/.[!.]*; do
  [ -e "$item" ] || continue
  case "$(basename "$item")" in "$DMG"|"$SRC"|'.DS_Store') ;; *) fail "Unrelated file found: $item";; esac
done
rm -f "$OUT/$DMG" "$OUT/$SRC" "$OUT/.DS_Store"
cp "$WORK/source.zip" "$OUT/$SRC"
mv "$WORK/$DMG" "$OUT/$DMG"
msg "Build completed: $OUT"
ls -lah "$OUT"
open "$OUT"

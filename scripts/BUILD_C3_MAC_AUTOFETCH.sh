#!/usr/bin/env bash
# Build the *editable* Rust Native C3 sources on this isolated branch.
set -Eeuo pipefail
BRANCH='experiment/rust-native-slint-libmpv-c3-autobuild'
REPO='https://github.com/trisanghy/open-iptv-pro.git'
OUT="$HOME/Downloads/OpenIPTVPro_C3_v4.23.17_BUILD"
DMG='OpenIPTVPro_C3_v4.23.17.dmg'
SRC='OpenIPTVPro_C3_v4.23.17_Source.zip'
WORK="$(mktemp -d -t openiptv-c3-native-build)"
trap 'rc=$?; rm -rf "$WORK"; exit "$rc"' EXIT
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[ "$(uname -s)" = Darwin ] || fail 'macOS is required'
command -v git >/dev/null || fail 'Git is required (install Apple Command Line Tools)'
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install || true
  fail 'Install Apple Command Line Tools and rerun'
fi
if ! command -v brew >/dev/null; then
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || fail 'Homebrew install failed'
fi
if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
if [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
command -v brew >/dev/null || fail 'Homebrew is missing'
if ! command -v cargo >/dev/null || ! command -v rustc >/dev/null; then HOMEBREW_NO_AUTO_UPDATE=1 brew install rust; fi
if ! brew list --versions mpv | grep -q .; then HOMEBREW_NO_AUTO_UPDATE=1 brew install mpv; fi
if ! command -v ffmpeg >/dev/null; then HOMEBREW_NO_AUTO_UPDATE=1 brew install ffmpeg; fi
printf 'Checking out Rust Native source from %s\n' "$BRANCH"
git clone --quiet --depth 1 --single-branch --branch "$BRANCH" "$REPO" "$WORK/project" || fail 'Cannot clone Rust Native branch'
NATIVE="$WORK/project/native-rust"
[ -f "$NATIVE/Cargo.toml" ] && [ -f "$NATIVE/ui/app.slint" ] || fail 'Missing editable Slint/Rust source'
echo "Rust Native HEAD: $(git -C "$WORK/project" rev-parse HEAD)"
cargo test --manifest-path "$NATIVE/Cargo.toml" || fail 'Native Rust tests failed'
cargo build --release --manifest-path "$NATIVE/Cargo.toml" || fail 'Native Rust build failed'
BIN="$NATIVE/target/release/open-iptv-pro-native"
[ -x "$BIN" ] || fail 'Native executable missing'
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
<key>CFBundleVersion</key><string>4</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
cp "$WORK/project/assets/icon.png" "$APP/Contents/Resources/icon.png"
codesign --force --sign - "$APP" || fail 'Ad-hoc code signing failed'
hdiutil create -volname 'Open IPTV Pro Rust Native C3' -srcfolder "$APP" -ov -format UDZO "$WORK/$DMG" >/dev/null || fail 'DMG build failed'
hdiutil imageinfo "$WORK/$DMG" >/dev/null || fail 'DMG verification failed'
(cd "$WORK/project" && zip -qr "$WORK/$SRC" native-rust scripts/BUILD_C3_MAC_AUTOFETCH.sh assets/icon.png)
mkdir -p "$OUT"
for file in "$OUT"/* "$OUT"/.[!.]*; do
  [ -e "$file" ] || continue
  case "$(basename "$file")" in "$DMG"|"$SRC"|'.DS_Store') ;; *) fail "Unrelated file in output: $file";; esac
done
rm -f "$OUT/$DMG" "$OUT/$SRC" "$OUT/.DS_Store"
cp "$WORK/$DMG" "$OUT/$DMG"
cp "$WORK/$SRC" "$OUT/$SRC"
printf 'Build OK — %s\n' "$OUT"
ls -lah "$OUT"
open "$OUT"

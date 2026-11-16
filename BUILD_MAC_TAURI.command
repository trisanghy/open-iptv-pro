#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
echo '===================================='
echo 'OPEN IPTV PRO • RUST LAB (TAURI 2)'
echo 'Independent from Electron stable app'
echo '===================================='
for program in node npm cargo rustc xcode-select; do
  if ! command -v "$program" >/dev/null 2>&1; then
    echo "Missing $program. See README_TAURI_RUST_V42317.md" >&2;exit 1
  fi
done
xcode-select -p >/dev/null || { echo 'Install Xcode command line tools';exit 1; }
echo 'Installing project dependencies...'
npm install --no-audit --no-fund
npm test
npm run prepare:renderer
echo 'Checking Rust core...'
cargo test --manifest-path src-tauri/Cargo.toml
echo 'Building unsigned macOS DMG...'
npm run build -- --bundles dmg
printf '\nNative bundles:\n'
find src-tauri/target/release/bundle -type f \( -name '*.dmg' -o -name '*.app' \) -print || true

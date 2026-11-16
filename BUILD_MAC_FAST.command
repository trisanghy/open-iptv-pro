#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
echo 'Rust Lab v16: FAST BUILD (only targeted JS regressions + native release build)'
for tool in node npm cargo rustc xcode-select; do command -v "$tool" >/dev/null || { echo "Missing $tool" >&2; exit 1; }; done
xcode-select -p >/dev/null
npm install --no-audit --no-fund
npm run test:quick
npm run prepare:renderer
npm run build -- --bundles dmg
open src-tauri/target/release/bundle/dmg

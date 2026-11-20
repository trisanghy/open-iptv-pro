#!/usr/bin/env bash
# Output only the macOS .app; no DMG or ZIP files.
set -Eeuo pipefail
curl -fsSL 'https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-native-slint-libmpv-c3-autobuild/scripts/BUILD_C3_MAC_AUTOFETCH.sh' | APP_ONLY=1 bash

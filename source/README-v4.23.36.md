# Open IPTV Pro 4.23.36 - isolated build sources

This source is published on branch `iptv-build-source`, separate from `main`.

Run on macOS:
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source/build-mac.sh | bash'
```

The script fetches 11 base64 parts in order, verifies the reconstructed source ZIP's SHA256 (`ba1c9f35cb5dabbcf8bf73c4eca5a048ce3ad3b4ef7487633d4d4ba0246084ce`), runs tests/build, and retains only the architecture-specific DMG and source ZIP in Downloads/OpenIPTVPro_Build_v4.23.36. It does not modify main.

Updates: check/Snapshot/replay settings are dropdown selectors; Mac updater opens verified DMG and quits when approved. Windows behavior unchanged.

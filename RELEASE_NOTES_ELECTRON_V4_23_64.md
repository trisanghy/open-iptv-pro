# Open IPTV Pro v4.23.64 · VietVoice FFprobe hotfix

Branch: experiment/electron-v42364-ffprobe-bundled (separate from main and Rust/Tauri).

Root cause: existing VietVoice model loads successfully, but pydub calls an FFprobe executable
which was not bundled in v4.23.63. A Finder-launched app does not inherit Homebrew PATH.

Fix: bundles @ffprobe-installer/ffprobe@2.1.2 plus the existing FFmpeg binary;
unpacks executable binaries from Electron ASAR; verifies they run; prepends their
directories to offline, isolated Python TTS subprocesses without modifying global PATH.
Provides a localized diagnostic if the bundled native binaries cannot be resolved.
The existing voice models, F5 references, IPTV data and PiP preferences are preserved.

Private Mac .app-only auto-opening builder:
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/electron-v42364-ffprobe-bundled/build-mac-v42364.sh | bash'
Output: ~/Downloads/Open_IPTV_Pro_APP_v4.23.64/Open IPTV Pro.app

Public DMG plus matching source archive:
build-mac-v42364-public.sh

Licensing: FFprobe executable is supplied via an LGPL-2.1 package; comply with
its distribution obligations for public releases.

CI validates native executable inside packaged Mac app. End-to-end voice inference
with downloaded multi-GB model weights needs a separate on-device smoke test.
# Open IPTV Pro Electron v4.23.76 — GPU benchmark / storage
- Automatic discovery of the FFmpeg binary bundled with the Mac/Windows full installers. No manual FFmpeg install needed.
- GPU hardware H.264 encoder probe supports VideoToolbox on macOS and NVENC/AMF/QSV/Media Foundation on Windows, depending on device, OS and compiled FFmpeg.
- Real on-device synthetic encoding benchmarks at 720p/60 and 1080p/30; pop-up recommends a conservative GPU encoding profile based on measured processing throughput.
- Opt-in save of recommendation without changing channel playback or pretending that GPU AI super-resolution or frame interpolation are available.
- Safe memory manager for app-owned video GPU model/runtime/cache storage only, with explicit deletion confirmation and symlink guards.
- AI super-resolution model installation and live playback integration **are not available yet**; no unverified executable downloads, proprietary driver installation, or false 4K promises.
- Regression tests preserve all existing caption/translation/TTS, playlist, PiP, DVR and application settings.

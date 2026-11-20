# Rust Lab v23.8.71 — Correct stale build assertions after v23.8.70

- Preserve the video-enhancement panel and synthetic FFmpeg motion benchmark from v23.8.70.
- Fix 25 outdated regression assertions that assumed the Mac one-command builder downloads an immutable tag. The current approved builder intentionally downloads the latest HEAD of experiment/rust-tauri-v2 and leaves release tags immutable.
- Continue saving per-device FPS / AI upscale configuration without activating unsupported live inference.
- No change to playback, native PiP, captions, TTS, or any previous releases.

Known limitation: live frame interpolation and AI upscaling inference are not yet implemented. The benchmark measures synthetic 320x180 CPU FFmpeg interpolation only.

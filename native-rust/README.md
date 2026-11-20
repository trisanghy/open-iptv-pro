# Rust Native C3 — Slint + libmpv

This is the standalone native Rust app, not the Electron app at the repository root or the Tauri HTML webview. It was restored from the original C3 archive in `source/`. All native changes belong in `native-rust/`.

## Build (Rust 1.88+)

```bash
cargo test --manifest-path native-rust/Cargo.toml
cargo run --manifest-path native-rust/Cargo.toml
```

Use `brew install mpv ffmpeg` on macOS. The Mac auto-build script checks the shared libmpv dylib and decodes a locally generated video clip using the actual native frame path before packaging; it fails if playback initialization cannot be verified. `libmpv` is loaded dynamically at runtime. Use `bash scripts/BUILD_C3_MAC_AUTOFETCH.sh` to build the current isolated branch into a locally ad-hoc-signed DMG and source ZIP. Artifacts are named with the current Rust package version and exact commit prefix in a unique folder under Downloads, without overwriting previous commits' builds. The helper never updates Electron, Tauri, Mobile or main.

For exact feature availability and outstanding native rewrite work, see [TAURI_PORT_MATRIX.md](TAURI_PORT_MATRIX.md).

## Current port status

- Implemented in C3: native Slint shell, M3U file/URL import, source management, search and pagination, favourites/recent, EPG current programmes, URL backups/failover, FFmpeg snapshots, health checks, basic backup, limited recording, multiple mpv windows and simple theme controls.
- Video: native Slint now uses the libmpv **software render API** to display real frames in its own player canvas, with app fullscreen and playback telemetry. This is a portable CPU-based preview (640×360, ~11fps); optimized GPU-backed texture embedding is still outstanding. An explicit native mpv window is used if the installed library cannot create a software render context; set `OPEN_IPTV_VIDEO_BACKEND=native` to force the fallback.
- Still not equivalent to Tauri: MultiView is four separate windows; Whisper/translation/TTS, Doctor 3.0, scheduling, all translations, Cast/PiP need further OS integration and real-device testing.
- The imported EPG uses bounded XMLTV parsing rather than dropping entries after a fixed 12,000-programme limit. The Slint EPG page now provides searchable daily listings (up to seven days, 250 rendered rows at once). Current/next remains cached for 10 minutes; complete listings are cached atomically for up to 24 hours and reused offline, then refreshed in the background when the source reloads. Source metadata reliability depends on provider data.
- New changes must pass `.github/workflows/native-rust-ci.yml` before they can be called built. Existing user state remains in its own native application directory.

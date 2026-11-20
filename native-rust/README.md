# Rust Native C3 — Slint + libmpv

This is the standalone native Rust app, not the Electron app at the repository root or the Tauri HTML webview. It was restored from the original C3 archive in `source/`. All native changes belong in `native-rust/`.

## Build (Rust 1.88+)

```bash
cargo test --manifest-path native-rust/Cargo.toml
cargo run --manifest-path native-rust/Cargo.toml
```

Use `brew install mpv ffmpeg` on macOS. `libmpv` is loaded dynamically at runtime. Use `bash scripts/BUILD_C3_MAC_AUTOFETCH.sh` to build the current isolated branch into an unsigned local DMG and accompanying source ZIP. The helper never updates Electron, Tauri, Mobile or main.

For exact feature availability and outstanding native rewrite work, see [TAURI_PORT_MATRIX.md](TAURI_PORT_MATRIX.md).

## Current port status

- Implemented in C3: native Slint shell, M3U file/URL import, source management, search and pagination, favourites/recent, EPG current programmes, URL backups/failover, FFmpeg snapshots, health checks, basic backup, limited recording, multiple mpv windows and simple theme controls.
- Not equivalent to Tauri yet: video is in a separate mpv window (no libmpv texture embedded into Slint); MultiView remains four separate windows; Live AI caption/Whisper/translate/TTS, full Doctor 3.0, scheduling and advanced settings, all Tauri translations, cast/PiP require native implementations and OS validation.
- The imported EPG uses bounded XMLTV parsing rather than dropping entries after a fixed 12,000-programme limit. Source metadata reliability depends on provider data.
- New changes must pass `.github/workflows/native-rust-ci.yml` before they can be called built. Existing user state remains in its own native application directory.

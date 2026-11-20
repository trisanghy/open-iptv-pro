# Rust Native C3 — restored editable source

The original Slint + Rust + dynamically loaded libmpv client was restored from `source/OpenIPTVPro_RustNative_C3_v4.23.17_UREQFIX_Source.zip.base64` into this directory. The archived C3 snapshot and legacy Electron code remain unchanged for historical compatibility.

Run the native project from `native-rust/` with Rust 1.88+:

```bash
cargo fmt --check
cargo test
cargo run
```

libmpv is dynamically loaded at runtime (for macOS use `brew install mpv`). This client now has a persisted, configurable EPG refresh every 10 minutes during active sessions (without wiping a usable guide on network failure). It also has the Tauri-style source rights gate (confirmation for each M3U import and each Discovery request), XMLTV gzip as new-profile default, episode title enrichment and EPG URL presets. It is **not yet fully equivalent to Tauri**: HTML renderer source cannot be used as proof of Slint layout parity; native video embedding, recording and AI captions need separate integration and validation.

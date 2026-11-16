# Rust Lab: macOS Cargo E0502 fix

Based on Open IPTV Pro v4.23.17 Tauri 2 Rust Lab. This is the same independent experiment branch `experiment/rust-tauri-v2`; the Electron mainline is untouched.

## Compiler error resolved at source

`src-tauri/src/recordings.rs` in `dvr_monitor` held an immutable reference to `store.jobs[index]`, then changed the same vector element after starting FFmpeg. Rust reports E0502. Now it clones the scheduled job's metadata before it mutates `store.jobs[index]`. The DVR job model already implements `Clone`; no behavior or persisted job format changes.

Minor lint cleanup: unused sha2 imports, std::fs import and unnecessary `mut` in GZip decoder.

## Build and verify on Mac

`bash BUILD_MAC_TAURI.command`

The script runs JavaScript migration tests, prepares renderer assets, `cargo test`, and then builds the unsigned DMG. For a quick Rust-only check, run `cargo test --manifest-path src-tauri/Cargo.toml`.

The original failure log confirms E0502 at compile time. Rust compilation/build has NOT been executed in the generation environment because Cargo is not installed here. Do not assume that this patch guarantees there are no subsequent Rust errors.

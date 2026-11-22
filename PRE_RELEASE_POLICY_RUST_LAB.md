# Rust Lab: All edits, builds and releases are PRE-RELEASE ONLY

This permanent project rule applies to every future fix, feature, demo and screenshot commit on `experiment/rust-tauri-v2`.

- Never create or publish Rust Lab Stable or change repository Latest/main/Electron.
- Immutable `rust-lab/v*` version tags for each source-changing release; no tag overwrites or force pushes.
- Regular Rust Lab release workflow: `prerelease: true`, `make_latest: false`.
- Standalone Windows EXE release workflow: `gh release create ... --prerelease --latest=false`.
- Confirm Windows x64 EXE and Portable assets have actually built before announcing success.
- AI model sizes must distinguish code/on-device weights from optional downloads; don't claim generative inference without a verified backend.

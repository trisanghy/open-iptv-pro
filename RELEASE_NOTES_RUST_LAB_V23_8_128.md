# Rust Lab v23.8.128 — Model delete confirmation + build-first packaging test repair

- Keeps all v23.8.127 improvements: native AI model deletion uses in-panel **Hủy** / **Xác nhận xóa** buttons rather than unreliable WebView `window.confirm`, calls allowlisted Rust removal only after the second explicit click, and shows actual failure/saved bytes.
- Automatic Rust Lab Windows/macOS CI jobs now run tests, **compile Tauri binary without bundling**, verify its existence (and both Mac Universal architectures), and **then** generate Windows NSIS EXE or Mac DMG using Tauri `bundle`, stage, and upload verified Actions Artifacts.
- Corrects a false-negative cross-platform test from v23.8.127: Windows Git checkout can normalize GitHub YAML line endings from LF to CRLF. The build-order test now normalizes line endings before checking the Windows job structure; it no longer mistakes valid steps for missing ones.
- No modifications to Stable Releases, main or other product branches; experimental output is only a GitHub Actions artifact.

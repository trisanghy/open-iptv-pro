# Rust Lab v23.8.129 — Smart “Tải” click repaired; Standard availability made explicit

- **Smart download button fixed:** clicking ↓ Tải Multilingual MiniLM or E5 now calls the actual ONNX installer immediately. The previous confirmation via `window.confirm()` could fail silently under a macOS Tauri WebView. Selection alone never downloads weights.
- Immediate status displays start/progress/completion, or detailed error explaining missing ONNX runtime, WebView CacheStorage support, network, or model initialization failure. A 118 MB model is **not** declared installed until a real ONNX inference smoke test succeeds and the local marker is saved. No claim of on-device success without device testing.
- **Standard is already on-device:** Naive Bayes has no separate download weights. **▶ Kiểm tra** performs real offline topic prediction and reports the result. The theoretical fastText ~18 MB classifying model remains disabled until proven compatible Vietnamese topic weights and an inference runtime are available.
- **Smart delete is in-panel** with Hủy/Xác nhận xóa, not unreliable browser confirmation. The model detection accepts ONNX filenames variants while preserving per-model CacheStorage isolation.
- Regression tests cover direct download click when WebView confirm is broken, visible installer errors, real Standard classification, and cache/runtime wiring.
- Immediately provide one-line Mac terminal command after the commit; GitHub Actions starts Windows EXE/macOS DMG builds in parallel via push workflows. Experimental artifacts remain under Actions, never Stable/Latest Releases.
- No updates to `main` or any non-Rust branch; no playlist, stream, video player, EPG source or model-weight changes.

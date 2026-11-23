# Rust Lab v23.8.130 — Smart download click fix with updated regression expectations

- Retains all v23.8.129 functionality: clicking **↓ Tải** immediately begins Smart multilingual MiniLM or E5 ONNX installation, without the unreliable `window.confirm` WebView prompt. Network, CacheStorage, model/runtime and inference failures are reported visibly instead of silently returning.
- Standard Naive Bayes is already installed and available offline; **▶ Kiểm tra** performs an actual local prediction. The proposed fastText 18 MB remains unavailable pending verified Vietnamese programme-classification model weights and inference runtime; no fake download action is shown.
- Smart **Xóa** now uses an explicit in-panel `Hủy` / `Xác nhận xóa`, avoiding broken browser confirmation dialogs.
- Updated three old regression tests that still expected v23.8.108's “Smart has no inference” status, the removed browser confirm dialog, and the pre-v23.8.129 async Smart delete handler. The new tests require installed ONNX/Standard status, direct user-initiated download, and in-panel confirmed deletion.
- v23.8.129 Windows CI had 335 regression tests, with 332 passing and 3 failing solely on those obsolete expectations; v23.8.130 reruns CI. Actual Mac/WebView ONNX weight download is not considered verified until tested on a real device.
- Experimental Rust branch and immutable tags only; GitHub Actions builds Windows x64 EXE and macOS DMG in parallel with user-side Mac build command. Main/Stable and other branches untouched.

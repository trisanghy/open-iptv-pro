# Rust Lab v23.8.135 — Fix Smart WebAssembly CSP failure (PRE-RELEASE)

## Root cause
The packaged Rust Lab renderer includes `<meta http-equiv="Content-Security-Policy">` restricting `script-src`. ONNX Runtime WebAssembly compilation was blocked because `'wasm-unsafe-eval'` was not allowed. Tauri `app.security.csp: null` does **not** override or disable the HTML meta CSP. This caused the user-observed `no available backend found / RuntimeError Aborted(CompileError: Refused to create a WebAssembly object because unsafe-eval or wasm-unsafe-eval...)`.

## Change
- Add `'wasm-unsafe-eval'` to the single existing HTML `script-src`, without allowing general JavaScript `'unsafe-eval'`.
- Smart ONNX WASM preflight runs before loading Transformers.js or downloading model weights and reports actionable Vietnamese CSP diagnostics.
- Static Node regressions plus a real Chromium/browser smoke compile the minimal WASM module and the packaged `ort-wasm-simd-threaded.jsep.wasm` under actual CSP; assert that `new Function()` is still blocked.
- Preserve one-click Smart install and locally cached weights. This is a prerelease; no main, Stable, Latest, or Electron changes.

## Verification required
GitHub Actions test/build success alone does not establish WebView2/native Mac ONNX inference. Retest Smart on actual installed v23.8.135 (old installer retains old CSP) and ensure model download + inference complete, cached result reuse, no CSP error.

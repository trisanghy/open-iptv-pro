# Rust Lab v23.8.88 — Windows x64 Whisper install hotfix

- Inherit real Windows executable detection (`whisper-cpp-win32-x64-cpu.exe` in ZIP), DLL co-location, SHA-256 verification, real download percent, full TTS/Whisper error diagnostics from v23.8.87.
- Update one obsolete assertion in `tauri-local-ai-v20.test.cjs` to accept detailed `normalize_whisper_binary(...).map_err(...)` instead of requiring `?`; the new operation is still covered by Windows nested-executable tests.
- Builds remain isolated to experiment/rust-tauri-v2. No changes to Electron, main or prior immutable tags/releases.

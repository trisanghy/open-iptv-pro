# Rust Lab v23.8.87 — Windows x64 Whisper and local voice installer diagnostics

- Fix the Windows asset mismatch: archive name is `whisper-cpp-win32-x64-cpu.zip`, binary inside is `whisper-cpp-win32-x64-cpu.exe`; normalize to `whisper-cli.exe`. Preserve nested location and sibling DLLs, exactly as existing working Electron logic does.
- Check the CLI via `--help` before claiming successful install, with errors explaining possible missing Windows runtime / DLLs.
- Stream verified SHA-256 download progress including received and total bytes, real percent when Content-Length exists; otherwise show indeterminate bytes rather than invented percent.
- Add installer diagnostics for Whisper and Piper/Argos/VieNeu, including failed stage, exit code, stderr and expandable full text. Do not override the original CC/TTS UI or settings.
- Add regression checks for naming, DLL co-location, UI percent/events and executable validation.
- **Verification required**: Rust/JS regression, Windows x64 NSIS build and actual device test. Retain immutable earlier tags, do not modify main or Electron.

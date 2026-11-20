# Rust Lab v23.8.89 — Hide ALL subprocess console windows on Windows x64

- Root cause: console-subsystem executables (FFmpeg, Whisper, Python/uv, Piper, Tar, GPU benchmark helpers) were spawned using default Windows process creation, which opened **many visible black terminal windows** while streaming, installing dependencies or speaking.
- Centralized both Tokio and standard process creation in `src-tauri/src/hidden_process.rs`. On Windows each helper sets **CREATE_NO_WINDOW (0x08000000)**. On macOS/Linux the same commands use native default creation without changing behavior. No `cmd.exe` or PowerShell wrapper is introduced.
- Replaced **all direct process launches across native Rust Lab** (local AI, MLX, FFmpeg snapshot, live playback compatibility, recording, benchmark and startup FFmpeg probing). Preserve stdin/stdout/stderr, lifetimes, cancellation and full error diagnostics.
- New regression test recursively scans every native Rust source and fails if anyone adds `Command::new` outside the central helper, preventing console windows from silently returning.
- Retains the Windows Whisper filename/DLL and percent-progress fixes from v23.8.88, including voice install messages. No changes to Electron, main, channel lists, TTS voice data, overlays, native PiP or historical releases.
- Verify Windows NSIS x64 CI, then run installer and test Whisper/Piper/live playback on a real Windows desktop before claiming visual success.

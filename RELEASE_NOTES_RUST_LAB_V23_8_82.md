# Rust Lab v23.8.82 — Correct obsolete four-second regression test

- Preserve Rust Lab Whisper's 10-second mono 16 kHz audio sample from v23.8.81.
- Update legacy `tauri-tts-realtime-v23-8-8.test.cjs` to check 10-second FFmpeg audio and separate Whisper `-t 4` CPU threads. The prior test was the sole failure (233/234 passed) in v23.8.81 CI.
- No behavioral changes to video, TTS, PiP or other branches. Preserve old tags and releases.

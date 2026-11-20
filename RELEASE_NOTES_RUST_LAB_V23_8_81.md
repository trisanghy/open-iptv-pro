# Rust Lab v23.8.81 — 10-second Whisper audio capture

- Capture exactly 10 seconds per FFmpeg audio sampling cycle (previously 4s), mono PCM WAV at 16 kHz.
- Preserve Whisper `-t 4` CPU threads. It is **not** a sample-duration argument.
- Preserve hard cancellation on pause, stop, ended, seeking, channel change; no stale TTS catch-up.
- Add regression tests for sample duration and cancellation logic. No other branches changed by this Rust commit.
- Latency note: a 10s audio sample necessarily adds up to 10s of sampling time before Whisper can transcribe, plus decoding/translation/TTS processing. This change prioritizes context, not lower first-subtitle latency.

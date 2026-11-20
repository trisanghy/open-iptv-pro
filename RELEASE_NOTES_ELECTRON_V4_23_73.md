# Electron v4.23.73 — 10-second Whisper windows and unbroken real-time subtitles

- Continuous FFmpeg WAV capture now produces **10-second windows**, up from 8 seconds. Clamp supports up to 10 seconds; the alternate one-shot capture path is also updated to 10 seconds to avoid inconsistent behavior.
- Keep Whisper `-t 4` as CPU thread count. Do not interpret as sample duration.
- Fix the original root cause of sentence truncation in `renderer/local-tts-v42344.js`: new translated captions no longer cause the currently audible sentence's **remaining WAV chunks** to be skipped. The current full sentence finishes even when a newer one is waiting.
- Preserve one-slot latest-only pending queue, so no buildup of dozens of stale subtitles. Pending age raised from 5 to 14 seconds and synthesis age from 7 to 12 seconds to account for 10-second recognition windows, without preventing Pause/Stop/Seek from immediately canceling.
- Prefetch the next audio chunk while the current chunk is playing; keep original-video volume ducking and natural TTS speed / voice settings.
- Add regression tests including a mock audio player that checks all chunks play even when a newer subtitle is pending.
- Preserve old tags, main, Rust Lab, source/channel data and Electron UI except for the status string.

Tradeoff: a full 10-second sample takes at least 10 seconds before first recognition and translation can begin; strict sub-second real-time dubbing is not achievable with this strategy. Tests/build/release should be verified in CI and on real devices.

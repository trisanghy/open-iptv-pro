# Electron v4.23.74 — 10-second Whisper sampling / complete TTS playback, CI regression fixes

- Inherit v4.23.73 implementation: continuous ten-second FFmpeg audio sampling; synthetic thread `-t 4` is unchanged; full current subtitle WAV chunks finish before next subtitle begins.
- Only latest pending untranslated/subtitle line stays queued to minimize delay; no cutting audible phrases. Pause/Stop/Ended/channel switch still stop TTS immediately.
- Fix three failed CI tests after v4.23.73: old segment duration assertion 8s (now 10s), old max pending/synthesis ages (now 14s/12s), and new runtime WAV test reading the callback with an incorrect whitespace-sensitive string anchor.
- Previous v4.23.72 and other released tags remain unchanged. New immutable tag electron-v4.23.74; mark pre-release, do not change latest or main.
- First caption cannot arrive before Whisper gathers a full 10s sample; this is not subsecond streaming ASR.

# Electron v4.23.75 — Fix collapsed sidebar gutter and restore Video Enhancement button

- Fix persistent 52px empty gutter after collapsing the channel list, by removing the reserved grid padding. Place the list-reopen button as a small accessible overlay without taking a column.
- Add **Nâng cao video bằng AI** beside existing subtitle/translate/voice control. Toggle expands its own inline panel only on click, no outer purple frame or duplicate header.
- Panel offers stored per-device motion 60/90/120 FPS, 1080p/2K/4K AI resolution preferences, benchmark and auto-select controls.
- **Limitations:** Electron does not yet implement a verified GPU AI super-resolution/FFmpeg optical flow pipeline. Its controls store preferences only, cannot claim to change video; the panel reports unsupported benchmark/inference truthfully. Existing playback, PiP, TTS, Whisper 10-second chunks, cloud sync and data unaffected.
- Adds asynchronous CC trigger mount regression tests, no-gap responsive layout tests, and explicitly avoids overwriting earlier tags/releases or changing main.

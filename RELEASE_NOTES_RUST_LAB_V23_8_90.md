# Rust Lab v23.8.90 — Web SVG player icon parity

- Imported original offline Web icon assets from `web/online` into the Rust Lab renderer (`web-player-icons.css` and `web-player-icons.js`), preserving the Web SVG paths, CSS masks and live play/pause state model.
- Removed legacy decorative Unicode playback glyphs in the fullscreen and parity controls; restored crisp aligned vector icons for previous, play/pause, stop, next, volume/mute, calendar/EPG, cast, PiP, fullscreen/exit, favorite, recording, display fit, source link, settings and quick actions.
- Fullscreen menus, source selection, TTS/AI, subtitle controls and native event handlers remain the same. No video element is replaced or duplicated. Volume and mute sync from the original video element.
- Added `tests/rustlab-web-player-icons.test.cjs` to the fast regression suite. Windows and macOS build pipelines must pass before claiming an installer is verified.
- Retains v23.8.89's Windows helper process `CREATE_NO_WINDOW` protection for Whisper, Python, Piper, FFmpeg, MLX and recording. Historical tags/releases are unchanged.
- Real-device icon appearance and playback still require on-device visual checks, separately from CI build success.

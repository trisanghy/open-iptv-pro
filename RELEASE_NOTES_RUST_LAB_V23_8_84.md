# Rust Lab v23.8.84 — Regression test correction after sidebar layout fix

- Keep collapsed-sidebar gutter repair from v23.8.83 and existing AI toggle.
- Fix the only failed CI assertion: AI enhancement renderer is loaded dynamically by `renderer/app-entry.js`, not a script tag in `renderer/index.html`.
- No functional changes to streaming, native PiP, Live Caption/Translate/TTS, 10-second Whisper, saved settings, previous releases or other branches.

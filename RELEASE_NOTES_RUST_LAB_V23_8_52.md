# Rust Lab v23.8.52 — English accessibility regression repair

- Fixed the actual Windows CI failure in v23.8.51: 69 formerly Vietnamese English title/placeholder/ARIA labels lacked translations.
- Added 70 English accessibility labels covering navigation, fullscreen playback, AI/Whisper/TTS, PiP, DVR, EPG, stream sources and input hints.
- Verified the complete 101/101 audited accessibility labels now translate in all 17 supported UI languages without untranslated Vietnamese or English fallback.
- Preserved existing strict CI tests instead of weakening coverage requirements.
- No other branches or media behavior were changed. New immutable version/tag; preceding releases remain untouched.

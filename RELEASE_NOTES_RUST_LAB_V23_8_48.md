# Rust Lab v23.8.48 — AI / PiP translations for all locales

- Completed 16 previously missing native-language AI, Whisper/Argos, TTS, PiP and M3U initialization strings in Spanish, Brazilian Portuguese, Thai, Khmer, French, German, Italian, Japanese, Indonesian, Hindi and Arabic.
- Existing Chinese, Lao, Korean and Russian translations are preserved.
- Added regression checks for interface language switching. No changes to native PiP semantics, Whisper processing, TTS runtime, playback or user data.
- Localization coverage is still tracked by the static audit; this release does not claim 100% until unresolved labels and dynamically-generated dialogs have been audited.

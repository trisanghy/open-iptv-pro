# Open IPTV Pro Rust Lab v23.8.43 — multilingual coverage and regression fix

- Restored 228 Rust Lab English-specific labels (AI, captions, DVR, PiP and playlist controls) lost during a concurrent i18n update, without removing newer translations.
- Repaired locale-specific compound channel health/snapshot counters instead of hardcoded English messages; retained the existing English "Using" worker label expected by users and tests.
- Expanded another 120 settings/Doctor/DVR/EPG/appearance/backup labels into French, German, Italian, Japanese, Korean, Russian, Indonesian, Hindi and Arabic, alongside existing Simplified Chinese, Lao, Thai, Khmer, Spanish and Portuguese dictionaries.
- Repaired outdated exact-match Japanese and German regression tests to verify actual native translation rather than one frozen wording.
- Added offline multilingual regression tests, preserving imported channel/EPG names, playlist URLs, language persistence, native PiP, AI/TTS and source-use consent.
- Some secondary long explanations and dynamic errors still fall back to English. This does not assert 100% localization or a tested native UI run.
- This release is immutable and restricted to the Rust Lab branch. macOS and Windows release assets require successful CI to verify.

# Open IPTV Pro Rust Lab v23.8.40 — additional offline language coverage

- Added 120 localized core UI keys to French, German, Italian, Japanese, Korean, Russian, Indonesian, Hindi and Arabic, also filling Simplified Chinese/Lao gaps while preserving existing Spanish, Portuguese, Thai and Khmer dictionaries.
- Added 39 specialized Chinese, Lao, Korean and Russian translations across Live AI, EPG, PiP, recording and legal M3U/Discovery consent; localized 12 legal-use messages for the seven other expanded locales.
- Localized dynamic channel counts, worker counts, durations and status counters in all 16 non-Vietnamese languages instead of hard-coded English fallback.
- Added exact English UI-label reverse lookup, keeping user-provided channel names, EPG, URLs, saved content and legal confirmation logic unchanged.
- Added all-language regression tests to the quick build pipeline. The work expands localized coverage but long secondary help/error messages may still fall back to English pending translation review.
- All changes scoped to Rust Lab. New immutable tag, previous releases intact.

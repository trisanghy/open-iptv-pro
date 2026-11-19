# Open IPTV Pro Rust Lab v23.8.45 — measured localization milestone

- Expanded 58 common interface labels and explanations across all 15 supported non-Vietnamese/non-English languages, including Chinese, Lao, Korean and Russian.
- Added an offline localization audit (npm run audit:i18n) that reports exact native translation coverage and remaining English/Vietnamese fallbacks for static interface labels, with a --details or --strict option.
- Added regression tests to require native-language labels, preserve user-supplied channel names, and fail CI if translation coverage falls below the verified baseline.
- This is a measurable milestone, not completion: baseline static UI coverage after the new translations is about 68–80% depending on locale; popups, attributes, dynamic errors and real-device visuals are not yet exhaustively audited.
- No changes to media playback, AI translation/TTS processing, native PiP, source permissions or user data. Previous immutable releases remain untouched.

# Rust Lab v23.8.54 — native dynamic dialog localization

- Translated 21 native alert/confirm/prompt patterns into all 16 non-Vietnamese supported languages, including folder/source deletion, merging and undo, snapshot captures, EPG replacement, recorded program scheduling, update installs, PIN unlock, Doctor suggestions, and sensitive restore confirmation.
- The runtime bridge now reads the currently selected locale for each dialog. Placeholders preserve channel names, filenames, dates, counts and schedule times without altering user data.
- The core i18n translator can also recognize those specific app-owned dynamic messages displayed in text nodes, instead of converting all non-Vietnamese dialogs to English.
- Added regression tests for 21 templates × 16 locales, native confirm/prompt interception, source-data preservation, and script load order.
- This is dialog-pattern coverage, not a claim of complete localization of all toasts, background status messages and provider/server errors. Missing dynamic dictionaries remain tracked separately.

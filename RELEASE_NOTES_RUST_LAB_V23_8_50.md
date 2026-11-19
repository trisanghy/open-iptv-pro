# Rust Lab v23.8.50 — all audited static UI labels localized

- Finished all 359 audited, app-authored, Vietnamese-origin static UI text nodes in 16 non-Vietnamese languages (including English), excluding provider/user channel names and other non-UI content.
- Added 27 advanced instructions in nine languages, 54 DVR/Doctor/settings controls in six languages, plus 11 last-mile strings for seven languages.
- Fixed dictionary precedence where legacy i18n code overwrote native labels such as "minutes" and country headings.
- Strict regression test requires 100% **of the 359 audited static text nodes** in each language. This is not a claim about dynamically-created messages, JavaScript templates, accessibility attributes or native Tauri dialogs.
- Content rights, backups, streaming, native PiP, AI/TTS, existing data and other branches are untouched.

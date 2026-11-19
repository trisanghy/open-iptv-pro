# Rust Lab v23.8.51 — accessible UI localization and three-tier coverage audit

- Added native translations for 70 previously missing title/placeholder/ARIA labels across 15 locales, plus 11 further tooltip labels in nine locales and final wording corrections.
- Required 101/101 audited Vietnamese-origin HTML accessibility attributes and 359/359 static text nodes to be localized in all 17 supported languages.
- Added explicit 1,299+ app-owned English-dictionary coverage reporting so remaining dynamically generated messages are visible: `npm run audit:i18n -- --details`. `--strict` checks static text and accessibility; `--strict-all` additionally checks the complete dictionary.
- Current status: static and accessibility coverage is fully audited, but dynamic UI and native error dialogs are not yet 100% translated. This release is a measurable milestone, not a false complete-translation claim.
- No changes to streaming, AI processing, native PiP, consent, saved user data or other branches.

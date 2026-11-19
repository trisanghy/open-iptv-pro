# Open IPTV Pro Rust Lab v23.8.46 — expanded native settings and CI repair

- Added 42 native UI translations for nine previously sparse locales: French, German, Italian, Japanese, Korean, Russian, Indonesian, Hindi and Arabic.
- Covered Discovery, channel collection, source checks, screenshots, AirPlay, app updates, theme variants and source management.
- Changed the ambiguous generic label "Status" to native equivalents in German, Brazilian Portuguese and Indonesian, fixing the previous regression check.
- Updated the offline localization audit to include the new dictionary and added dedicated tests.
- Localization remains incomplete across longer help/error messages and dynamically generated dialogs. No 100% claim until the whole visible UI is audited.
- Only Rust Lab branch changed. Playback, AI and PiP remain untouched. New immutable release tag.

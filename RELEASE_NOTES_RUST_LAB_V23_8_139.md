# Rust Lab v23.8.139 — Make the three-source audit visible for 560-channel playlists (PRE-RELEASE)

- Fix the audit action appearing to do nothing when a real playlist contains 560 channels. Show a large native browser dialog immediately on click, above model manager and page scrolling. Close with button/Escape.
- Populate the first 50 channels and existing EPG evidence immediately from background cache, before the potentially lengthy full EPG scan and Wikidata metadata lookup; update rows after each phase.
- Preserve full real playlist, current-channel highlight, 5 evidence columns, sort/filter, 50-per-page and existing lookup privacy/rate limits.
- Add 560-channel Chromium renderer regression with injected synthetic fixture (NOT real user playlist), verify the dialog is onscreen, that 50 rows render, that channel 0560 can be filtered; capture screenshot artifacts.
- Preserve Standard/Smart/Intelligence, WebAssembly CSP fix v23.8.135, media playback, PiP, EPG import, release prerelease-only and immutable tags.

Note: The 560-channel browser fixture validates UI behavior, not the user's imported source or accuracy of live Wikidata results. Native Mac/Windows hardware verification is still necessary.

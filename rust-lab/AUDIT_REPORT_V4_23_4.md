# Open IPTV Pro v4.23.4 — DVR quick access & task status placement

## Implemented
- Schedule current live channel directly from the Timeshift panel, with explicit start/end and DVR confirmation.
- Live recording status for scheduled and currently recording items, read from existing Electron DVR backend.
- Quick link to existing full EPG recording jobs list (cancel, stop, open file).
- Task dock moved from fixed overlay to a collapsible panel between content and footer (no overlay of controls).
- Existing Windows build fix maintained and version-matched to v4.23.4.
- Updated 8 translation dictionaries, README and CHANGELOG.

## Tests completed
- `npm test`: 134 test cases; 132 passed, 2 skipped (opt-in FFmpeg integration), 0 failed.
- UI smoke `python tests/ui_dvr_v4233.py`: 1360px and 1000px passed.
- UI smoke `python tests/ui_dvr_quick_v4234.py`: 1360px and 1000px passed; verifies quick schedule, record state, non-overlapping task dock.
- `node --check`: 40 JavaScript/CJS renderer, native and script files; 0 syntax errors.
- 261 HTML IDs, 0 duplicates; 8 translation JSONs parse successfully.

## Not verified
- Native Windows/Mac packaged installer and real HLS recording from user's provider were not tested in this environment.
- FFmpeg tests are opt-in; the 2 skipped in default suite were not rerun this turn.
- This source was not pushed to GitHub; iOS/Android unchanged.

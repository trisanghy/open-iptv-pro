# Positron — New 20-round issue register

Baseline P5.1.105: `937db5120885efefe32c62fe3a9476601e76955c`. Only the `Positron` branch is in scope. No force-push.

## Round 01/20 — P5.1.106 / v4.23.190 — VERIFIED
- Input: actual P5.1.105 Electron `positron-watchflow-1360-night-real.png` with compact WatchFlow horizontal scrollbar.
- Root: -18px sticky header margin mismatched 15px empty dialog padding.
- Fix & test: scoped margin/padding correction; strict `scrollWidth <= clientWidth+1` Electron assertion.
- Before: P5.1.105 `positron-watchflow-1360-night-real.png`. After: P5.1.106 `positron-p51106-empty-watchflow-no-horizontal-scroll-real.png`, directly visually inspected; scrollbar removed.
- Version release `positron/v4.23.190-p5.1.106`, final SHA `19746909a874bdcc659f6948319cee86f0eec1da`; Actions #44924483487 6/6 success; full EXE/DMG assets verified.
- Node 700 pass, 5 skip, 0 fail (705 total). **One actual repair round**, not the 70 older screenshot scenarios.

## Round 02/20 — P5.1.107 / v4.23.191 — CANDIDATE
- Input: actual P5.1.106 screenshots `positron-p5-08-real.png` (540px) and `positron-p5-09-real.png` (450px).
- Symptom: chooser tabs and grid/list controls still show font-dependent text glyphs in tiny/ambiguous squares.
- Root: five buttons in `renderer/web-channel-chooser-v42371.js` use ▣/☆/◷/▦/☷ directly.
- Fix: deterministic inline SVG in those 5 controls with readable text/ARIA labels, without altering any channel data or player behavior.
- Regression: Node source test; REAL Electron 450px DOM checks and screenshot `positron-p51107-chooser-native-svg-450-real.png`.
- Status: **not complete until CI, screenshot visual review and immutable Release succeed**.

## Future rounds
Evaluate defects revealed by real screenshot of previous build before making changes; prioritize video controls, keyboard accessibility, channel library, Watch Later, Cast/PiP, EPG/Sources, and small-screen layout. Remaining 18 are NOT yet completed.

## New upload — 22/11/2026
- Verified P5.1.128 HEAD 7003357116d97ec3d98c76af54071fd4e81b717d, Actions #44948172418 success.
- Opened genuine Electron baseline `p5-20-rounds/positron-p51128-dropdown-chip-450-real.png`.
- Defect: clipped neighbour-group letter visible to RIGHT of sticky "Tất cả" after selecting "Tin tức" on 450px.
- Proposed P5.1.129: conditional right-hand mask and real screenshot regression; count only after verified release and manual after-image review.

## Follow-up round 02 — input P5.1.129
- Directly opened P5.1.129 real screenshot `positron-p51129-right-mask-450-real.png` and enlarged the category rail. The text ghost is fixed, but a detached curved border still appears to the right of pinned "Tất cả".
- Planned P5.1.130 v4.23.214: widen conditional right mask to 30px; check "Thiếu nhi" remains independently hit-testable; genuine 450px Electron after PNG, Node test and immutable release required for completion.

## Planned round 03 — input P5.1.130 screenshot
- Genuine Electron `positron-p51130-border-mask-450-real.png`: previous curled-border defect no longer visible; native channel search clearly accessible.
- Source-grounded functional defect: normalize(NFD)+combining mark removal does not map Vietnamese đ/Đ to ASCII d.
- P5.1.131 v4.23.215: map đ→d in native chooser, real QA fixture `TH địa phương` queried as `dia phuong`, screenshot/keyboard/focus, clear restored; no playback.

# Positron P5 · 20 scoped upgrades (v4.23.84)

This release preserves all P4.1 source data/feature logic. It adds **20 independent CSS/UX upgrade gates** in `renderer/positron-twenty.css`, a small accessibility companion, and **20 new actual Electron screenshot scenarios** (not AI-generated screenshots). Legacy P4 50-round audit remains in place. The screenshot checks are not a claim of 20 independent AI self-repair cycles.

01. Increase keyboard target legibility.
02. Improve channel-list scrolling.
03. Prevent long channel labels breaking shelves.
04. Clarify secondary-filter disclosure.
05. Show player-tool disclosure selection.
06. Polish narrow-navigation hit areas.
07. Unify source-hub row surfaces.
08. Keep EPG search clear on dark themes.
09. Improve Doctor diagnostic readability.
10. Make Settings controls easier to navigate.
11. Keep Favorite cards within viewport.
12. Refine player control focus and grouping.
13. Distinguish disabled actions safely.
14. Make volume navigation keyboard-friendly.
15. Avoid caption toolbar clipping.
16. Keep status and subtitles readable.
17. Unify popup and modal keyboard focus.
18. Prevent advanced tools horizontal overflow.
19. Adapt forms at tablet widths.
20. Protect compact viewports without hiding features.

## Verification
- npm test and JavaScript syntax checks including Positron P5.
- Real Electron Xvfb/CDP: existing P4 50-stage audit plus 20 P5 page/theme/viewport scenarios.
- Windows x64 Setup + Portable, macOS Intel + Apple Silicon installers, separate immutable `positron/v4.23.84-p5.1` tag.
- Streaming with authorized live M3U, GPU decoding, PiP/AirPlay/Cast, DVR and Timeshift require physical-device validation; successful CI is not that validation.

## P5.1 real screenshot repair
- Inspected real Electron screenshots 14 and 15 and found bright white strips around Smart Discovery.
- The underlying `.source-hub-section` retained legacy light-theme background. Override only in Positron and test the computed surface luminance in both Sources screenshot rounds.

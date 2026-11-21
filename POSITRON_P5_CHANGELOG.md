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

- Repaired screenshot workflow artifact filename assertions for P5.1 without renaming the real PNG files.
- Replaced OS-dependent orange emoji in Prev/Stop/Next (and fullscreen Prev/Next) with accessible monochrome inline SVG on the existing native buttons.
- Hid the duplicate brand icon under the sidebar toggle in the 54px icon rail; added real Electron screenshot assertions for both fixes.

## P5.1.1 — v4.23.85
- Correct the stale `P4 · 50 VÒNG` sidebar badge visible in the real P5.1 Electron Settings screenshot. Keep the current product label aligned with `P5.1.1`.
- Bump package and document title; update the immutable CI release tag and Windows/macOS installer checks for v4.23.85. The baseline P5.1 screenshot evidence remains historical and does not count as a newly captured repair round.
- Add a regression assertion for the sidebar badge. Actual Electron after-screenshots and CI must be independently reviewed before this is counted as a complete 20-round iteration.

## P5.1.2 — v4.23.86
- P5.1.1 screenshot `positron-p5-18-real.png` Settings revealed the replacement P5.1.1 badge partly hidden under the hamburger button. Fix with a compact release badge `P5.1.2`.
- Extend real Electron screenshot audit with badge clipping and menu intersection checks on desktop widths; preserve all IPTV state and playback.

## P5.1.3 — v4.23.87
- From real P5.1.2 Electron TV screenshot at 450px: the fullscreen control appeared as a tiny unclear glyph beside Cast/PiP.
- Replace its content with a clear stroke SVG while retaining the original button node and playback/fullscreen event handlers.
- Add real-Electron audit assertion that fullscreen button carries its SVG, and a source regression test. Maintain independent version/build/release tag and unchanged user data.

## NEW 20-round series · round 01/20 · P5.1.4 / v4.23.88
- Baseline is immutable P5.1.3, verified HEAD `d654707cd3b8440f6218814fd1b9dff6333c8da6` and real Electron screenshots from release.
- Issue: TV header at 450px rendered `Xem tr...`; root cause is desktop page name being shortened via CSS ellipsis in narrow heading container.
- Add semantic short page titles at narrow viewport while retaining the full title as text; add screenshot audit assertions and unit regression. No data or playback routines touched.
- Round completion pending actual GitHub Actions test/capture, visual after-screenshot inspection, and independent release verification.

## NEW 20-round series · round 02/20 · P5.1.5 / v4.23.89
- Input is real Electron `positron-p5-15-real.png` from P5.1.4 Sources at width 720px; toolbar page label `Nguồn...` was cut.
- Extend the original accessible full-text page title + short visible caption treatment to 760px (icon-rail breakpoint), preserving all page actions and native player controls.
- Add screenshot audit checks for Sources at 720px and the existing compact TV view. Release pending independent test, visual screenshot review, and CI results.

## NEW 20-round series · round 03/20 · P5.1.6 / v4.23.90
- Input from real P5.1.5 Sources 720 screenshot: Smart IPTV Discovery header section formed a near-black rectangular band RGB(9,15,30) against source navigation RGB(20,33,56).
- Correct root cause `.p20-07 #page-sources .source-hub-section` legacy `var(--po-bg)` override to consistent `var(--po-card)`; preserve dark contrast from P5.1 and add computed-background parity check in actual Electron screenshots.
- Round pending fresh screenshot validation, source tests, builds and immutable release.

- P5.1.6 in-round screenshot follow-up: parent section matched color, but `renderer/positron-fifty.css` forced `.source-hub-heading` back to `--po-bg`. Overridden with same card color and added real computed-style screenshot assertion for child.

## P5.1.7 · v4.23.91 – P5.1.6 incomplete screenshot-repair follow-up
- P5.1.6 real Electron screenshot proved that the Discovery parent background was fixed but `.source-hub-heading` remained a black band due to a separate P4 override. This version carries the verified child override and explicit screenshot regression for both child and parent.
- Version bumped to avoid overwriting an immutable P5.1.6 tag if its earlier concurrent workflow publishes; neither the old release nor its history are changed. Count as continuation of NEW round 03, not a new independent bugfix cycle.

## NEW screenshot-feedback series · Round 01/20 · P5.1.8 / 4.23.92
- Input: P5.1.7 real Electron `positron-p5-20-real.png` (Favorites 600px) and `positron-p5-09-real.png` (TV 450px), from successful run 44847464628.
- Problem: duplicated theme diamond and full label persist in compact toolbar. Root cause: P4 icon-only font-size selector loses CSS specificity to topbar button styling.
- P5-only fix: force 36px monochrome icon-only theme button below 600px without replacing listeners or accessibility labels. Adds Node test and Electron screenshot computed-style checks at 600/540/450.
- Evidence requires a new successful workflow, real after-image visual inspection, and immutable release asset verification. Do not count this round merely from a commit.

## NEW screenshot-feedback series · Round 02/20 · P5.1.9 / 4.23.93
- Input: real P5.1.8 / 600px Favorites screenshot `positron-p5-20-real.png`, reviewed after successful CI. Empty list has no action to add or reactivate an IPTV source, forcing users to hunt through the rail.
- Fix: additive `Quản lý nguồn IPTV` button inside the native empty state; uses the existing `IPTVState.setPage('sources')` without changing favorites storage, source data or playback.
- Regression: Node source assertions and a real Electron screenshot test that the action is visible and navigates to Sources; return to Favorites for screenshot.
- CI/release/manual after-image review must be separately confirmed.

## Screenshot-feedback series · Round 03/20 · P5.1.10 / 4.23.94
- Input: actual P5.1.9 600px Favorites screenshot after round 02 (successful Actions 44851699538): the previous generic empty-state copy says "when adding a source again" despite exactly zero sources; a new user gets misleading advice.
- Fix: text-only, non-destructive guidance based on live `#sourceCount` (0 vs active sources). Observe source changes, retain native Favorites list and the functional Sources CTA from P5.1.9.
- Regression: Node source test plus real Electron screenshot computed-text validation in Favorites, with the 70-scenario capture suite and full macOS/Windows CI.
- Pending after screenshot manual inspection, green jobs, and independent release confirmation.

## Screenshot-feedback series · Round 04/20 · P5.1.11 / 4.23.95
- Input: verified actual P5.1.10 Electron TV screenshot `positron-p5-09-real.png` at 450px. In the playback toolbar, next-program label is rendered as `Chưa có lịch tiếp ...`, losing the full EPG status.
- Root cause: strong inherited toolbar `white-space:nowrap!important;text-overflow:ellipsis!important` on EPG programme names, even when the mobile card has available vertical height.
- Fix: narrow-width (<=540px) Positron-only two-line-capable labels using normal whitespace/word wrapping, preserving programme IDs and original EPG navigation.
- Regression: source-level assertion plus actual Electron computed whiteSpace/textOverflow/scroll metrics for TV at 540 and 450; no programme or playback state changed.
- Await fresh screenshot manually reviewed and 6-job immutable release.

## Screenshot-feedback series · Round 05/20 · P5.1.12 / 4.23.96
- Input: actual P5.1.11 Settings screenshot at 1360px (`positron-p5-18-real.png`) shows command search label clipped with ellipsis ("Tìm kênh, trang, công cu..."). Real TV 450px shows the old tiny hard-to-recognize `⌕` glyph.
- Fix: concise visible label `Tìm kênh / trang`, dedicated monochrome scalable SVG magnifier and full accessible name. Preserve existing click, keyboard shortcut and original search modal.
- Regression: real Electron screenshot detects SVG, exact visible label, no desktop truncation, and checks button still opens/closes the command palette in Settings; Node source test.
- Await completed screenshot review, full CI and immutable release before certifying.

## Screenshot-feedback series · Round 06/20 · P5.1.13 / 4.23.97
- Input: actual P5.1.12 screenshot `positron-p5-18-real.png` Settings at 1360px. Native status text in 206px sidebar is visibly truncated as `Sẵn sàng • FFmpeg tích hợp: đ...`.
- Root cause: older P4 sidebar CSS `white-space:nowrap!important; overflow:hidden; text-overflow:ellipsis` despite enough vertical space for two lines.
- Fix: scope P5-only compact status to natural text wrap at desktop widths, minimum footer height and live full-value tooltip; preserve the real status updates and storage.
- Regression: real Electron computed whiteSpace, scroll/client height and text/title synchronization in settings; Node test. Pending manually inspecting new PNG and verifying immutable CI release.

## NEW user-file series · Round 01/20 · P5.1.14 / v4.23.98
- Baseline: P5.1.13, commit `bae4512d54c468daa2c57501494342eccb252704`, real Electron screenshot `p5-20-rounds/positron-p5-15-real.png` from Actions run 44853659787 and artifact 14686940738. The real image was opened and shows the native Smart Discovery scan-limit option truncated at 720px.
- Root cause: the text `Kiểm tra tất cả (không giới hạn)` is longer than the responsive native select width; page-level overflow checks miss internal select clipping.
- Fix: Positron-only presentation change of `option[value=all]` to `Tất cả kênh`, retaining selected value, source consent, channel limit semantics and a full native option tooltip; the help paragraph still clarifies unlimited scanning.
- Regression: Node source assertion, actual Electron Sources 720px screenshot assertion for unchanged `value=all`, new label and measured text width with space for the native arrow.
- Completion depends on independent CI, manual inspection of new real after-screenshot and all immutable release assets; no round should count from commit alone.

## Screenshot-feedback series · Round 07/20 · P5.1.15 / 4.23.99
- Input: latest externally updated P5.1.14 actual Doctor screenshot `positron-p5-19-real.png` at 1360px, CI run 44853954573. Six zero metrics give no actionable route to import a playlist. P5.1.14's unrelated Smart Discovery scan-limit fix is preserved.
- Fix: show theme-aware `Quản lý nguồn IPTV` button and explanatory message only when `#navCount` is zero, hide reactively when channels become available; preserve Doctor diagnostics.
- Regression: Node checks and real Electron Doctor screenshot/action click routes to Sources and back. QA/release verification must be separate.
- **Version coordination:** Previous attempt on P5.1.13 was discarded because a separate safe P5.1.14 commit advanced HEAD. This repair builds on latest HEAD, not force-pushed.

## New user-file series · Round 02/20 · P5.1.16 / 4.23.100
- Input: P5.1.15 actual Electron TV screenshot at 450px, `p5-20-rounds/positron-p5-09-real.png` from Actions 44854248390/artifact 14686737277, opened and reviewed.
- Finding: volume speaker is still `◖))` platform-specific Unicode, visually inconsistent with the existing SVG prev/stop/next and fullscreen icons.
- Root cause: the original HTML `label.volume-icon[for=volume]` has literal sound text rather than a vector. Make an SVG speaker icon in the existing Positron JS without changing label or range input nodes, volume listeners, playback or persistence.
- Regression: Electron screenshots for all TV viewports assert volume SVG exists, >=16px, and original `for=volume` link; Node source test checks structure and CSS.
- Completion must await green test, actual after screenshot opened, installers and release status. Do not call GitHub Release available if Actions token is denied HTTP 403.

## New user-file series · Round 03/20 · P5.1.17 / v4.23.101
- Input: actual P5.1.16 Electron TV screenshot at 450px `p5-20-rounds/positron-p5-09-real.png`, Actions 44854598346, capture artifact 14686174338, opened and reviewed.
- Visual defect: the existing Cast/AirPlay and PiP controls still show small OS-dependent square glyphs, inconsistent with SVG playback, volume, and fullscreen icons.
- Root cause: literal `▣` prefixes in native button contents. Replace *only* contents of existing `#castBtn` and `#pipBtn` with monochrome line SVG plus the readable original labels; preserve the exact buttons, listeners, aria labels, source/playback and user settings.
- New regression: Node source test plus Electron 20-case TV screenshot assertions for SVG presence, >=14px icon width, labels and ARIA on both buttons across width/theme variants. No hardware Cast or actual PiP operation is claimed from UI tests.
- Certification pending fresh Node tests, opened real after screenshot, CI installers and Release status (GitHub Actions token currently has 403 Release rights error).

## New user-file series · Round 04/20 · P5.1.18 / v4.23.102
- Input: P5.1.17 real Electron screenshot `p5-20-rounds/positron-p5-20-real.png`, Favorites at 600px, artifact 14687865062, opened and reviewed. Also examined the 450px TV screenshot.
- Defect: bottom live status text is very dim and ellipsized even though there is unused footer width. It obscures readiness/FFmpeg state on smaller windows.
- Root cause: legacy `.footer #footerText` enforces nowrap/ellipsis plus a multi-column footer grid even when its task dock is hidden. The original foreground is low contrast.
- Fix Positron-only CSS: readable 12px high-contrast status color, normal wrapping, and a 1-column footer only for <=760px while task dock is hidden. Leave footer text, live updates and task dock logic untouched.
- QA: add Electron screenshot computed-style, contrast ratio >=4.5:1, and text scroll dimension assertions at 600/540/450. Node regression test asserts scoping. Do not claim video-stream tests.
- Await Node and Electron screenshot, opened after-image, installers and immutable release evidence before marking completed.

### P5.1.18 follow-up: QA test parser root-cause correction
- Initial Node tests were green but Electron audit stopped at TV 600px with contrast ratio 0. Inspecting the audit source showed the new regexp written as `/\\d+/` in JavaScript source, which matches literal backslash instead of numeric RGB channels; no valid foreground/background luminance could be parsed.
- Correct the **test parser** to `/\d+(?:\.\d+)?/g` and add source regression. Keep the UI contrast CSS and SemVer exactly P5.1.18 / 4.23.102; rerun real Electron screenshots and determine success with actual computed contrast. No assertion is disabled or weakened.

## New user-file series · Round 05/20 · P5.1.19 / v4.23.103
- Input: P5.1.18 actual Electron TV 1360px screenshot `p5-20-rounds/positron-p5-01-real.png` (visible channel finder), plus keyboard QA of two existing keydown listeners.
- Found root cause: `renderer/positron.js` handles unmodified `/` first and opens global command palette. Later `renderer/positron-twenty.js` documents and handles `/` as a channel search shortcut on TV, but never receives an unconsumed event after the first handler opens the palette.
- Fix only the original Positron keyboard routing: when on TV and a visible channel search control exists, let the later listener focus it. Preserve command palette shortcut `Ctrl/⌘+K`, Escape closing, and slash-to-palette fallback when channel finder is hidden. Do not change player/source data or keyboard handling on other branches.
- Actual Electron regression: synthesize keydowns in desktop TV to verify slash focus, palette remains closed, Ctrl+K opens it and Escape closes; capture extra real image `positron-p5-19-slash-search-real.png` and maintain the 20 standard screenshot cases.
- Completion pending CI tests, screenshot image inspection and builder/release evidence.

## New user-file series · Round 06/20 · P5.1.20 / v4.23.104
- Input: P5.1.19 real Electron screenshot `p5-20-rounds/positron-p5-01-real.png`, TV desktop (Linux GitHub runner) opened and reviewed. Top command-palette toolbar still displays Mac-specific `⌘ K` even on Linux and Windows.
- Root cause: hard-coded `<kbd>⌘ K</kbd>` in the original Positron toolbar. The implementation already supports Ctrl+K and Meta+K but misleadingly labels every platform as Mac.
- Fix: set only the displayed shortcut hint and tooltip from the renderer platform. Keep the actual key handler, command palette, controls and `aria-keyshortcuts=Control+K Meta+K` unchanged. Mac gets `⌘ K`; Windows/Linux get `Ctrl K`.
- New regression: Node source check and actual Electron screenshots/DOM assertions for platform-appropriate label and full ARIA shortcuts on all P5 cases. No external data touched.
- Completion pending real after-screenshot review, CI and installer checks.

## P5.1.21 / v4.23.105 — independent screenshot repair round 01/20
- Input: actual P5.1.20 Electron TV screenshot positron-p5-09-real.png at 450px. The selected native fallback stream link is visibly truncated to Chua c....
- Root cause: the video-fit selector, fallback-link selector and Favorite button share a constrained narrow row.
- Fix: make the native stream select full width in its own row at <=540px; preserve original events, stream values, Favorites and persisted data.
- Tests: Node source regression, actual Electron option-text width and viewport-boundary checks. Post-patch screenshot/CI/release must be verified before completion.
- External release blocker: P5.1.18 and P5.1.19 Actions release jobs failed HTTP 403 Resource not accessible by integration despite successful tests, screenshots and installers.

## P5.1.22 — v4.23.106 (independent screenshot repair round 02/20)
- Input: real P5.1.21 Electron TV 450px after-image, toolbar Focus button displays an ambiguous square glyph.
- Root cause: P4 compact CSS paints a static square pseudo-element while native focus state changes only textual glyphs; the compact toolbar hides those glyphs.
- Fix: replace the icon with a monochrome SVG on the existing button; toggle paths for focus/restore, maintain native event and aria-pressed with descriptive label.
- Tests: Electron UI test clicks Focus twice at 450px, verifies aria-pressed, changed SVG path and recovery; Node source regression; screenshot visual review and installers/release pending verification.

## P5.1.23 — v4.23.107 (independent screenshot repair round 03/20)
- Input: actual P5.1.22 Electron 720px Sources screenshot positron-p5-15-real.png: the no-playlist empty guidance occupies excessive vertical space and pushes Smart Discovery down.
- Root cause: legacy .empty-list has 30px vertical padding and the following source section has 24px top margin, regardless of available viewport.
- Fix: on <=800px only when #sourcesList contains the empty-list, reduce the guidance padding to 12px and the subsequent Discovery margin to 12px. Existing source card layouts and IPTV data untouched.
- Tests: real Electron screenshot audit measures empty guidance height/padding and gap; Node source regression; release/after-screenshot review pending.

## P5.1.24 — v4.23.108 (independent screenshot repair round 04/20)
- Input: actual P5.1.23 Electron EPG 720px screenshot positron-p5-17-real.png shows an orange OS emoji before scheduled DVR heading while other Positron icons are monochrome.
- Root cause: hard-coded Unicode record glyph in the static DVR heading has platform-specific emoji rendering.
- Fix: use scoped inline recording SVG preserving heading text and dynamic localization, without altering DVR form, data, listeners or scheduling.
- Regression: real Electron EPG screenshots assert SVG presence/size/aria and unchanged DVR heading; Node source test; after-image/release pending.

## P5.1.25 — v4.23.109 (independent screenshot repair round 05/20)
- Input: P5.1.24 actual Electron EPG 720px screenshot shows a blank but enabled DVR channel select below the recording folder even though the user has zero sources.
- Root cause: dvr-ui.js updateChannels replaces options with an empty list and leaves the native selection enabled; no useful empty state is displayed.
- Fix in Positron UI layer: add a disabled clear no-channel placeholder, preserve native channel selection/listeners and re-enable automatically whenever real options appear; do not alter DVR storage or scheduling.
- Tests: Electron asserts disabled + placeholder on EPG 1360/720 and injects only an ephemeral DOM option to prove re-enable/re-disable; Node source regression. After-image and release pending.

## New screenshot-driven batch · Round 01/20 · P5.1.26 / v4.23.110
- Baseline P5.1.25 HEAD `f6243b50bb641e408d72201854f3ab129ec51b6b`, P5.1.24 real Electron Doctor 1360px screenshot from Actions artifact 14688244941. P5.1.25 changes DVR only, so Doctor screenshot shows unchanged before-state.
- Visual defect: while six channel metrics show zero, Doctor exposes live 'Chẩn đoán ngay', 'Phân tích' and 'Kiểm tra theo phạm vi' actions next to an existing source-management message.
- Fix: disable these analysis actions only when no channels exist, describe the disabled state with the existing source hint, and restore their native buttons whenever channels appear. Preserve previous reports, exports, sources, listeners and streaming state.
- Validation: source regression plus real Electron screenshot/DOM lifecycle assertion; this round is provisional until a successful CI run, opened after-image and release assets are verified. One independent fix/version, not twenty renamed tests.

## Screenshot-driven batch · Round 02/20 · P5.1.27 / v4.23.111
- Input: visually opened real P5.1.26 Electron Doctor 1360px screenshot, capture artifact 14688743177; prior version correctly disables Doctor Run/Analyze/Verify with zero sources, but top 'Kiểm tra link sâu' remains enabled.
- Root cause: P5.1.26 dynamic zero-channel guard omitted the original `#doctorDeepCheck` action.
- Repair: extend the existing state-preserving guard, including ARIA hint and automatic restoration on channel availability. Keep export and source-management CTA usable and preserve native diagnostics on loaded channels.
- Regression: Node/source assertions and real Electron screenshot lifecycle assertions now cover four actions. This round requires successful capture, opened after-image and actual build/release state to certify.

## Screenshot-driven batch · Round 03/20 · P5.1.28 / v4.23.112
- Input: actual P5.1.27 Electron Sources 1360px image from capture artifact 14689552049, opened and reviewed; empty-source guidance measured 83px high with 30px top/bottom padding and 24px gap to Smart Discovery.
- Root cause: existing P5.1.23 compact no-playlist CSS is limited to max-width 800px; desktop retains oversized legacy empty-state spacing.
- Fix: add a desktop-only min-width 801px no-source selector using the same compact layout (12px padding and margin), preserving populated lists, source data and Discovery navigation.
- Regression: Electron Sources 1360px geometry assertions (height <=57, padding <=14px, gap <=20px) and Node source check; require actual next screenshot review, CI and immutable release before confirming completion.

## Screenshot-driven batch · Round 04/20 · P5.1.29 / v4.23.113
- Input: actual P5.1.28 Electron Sources 1360px screenshot from capture artifact 14689292042, opened; the 'Trạng thái' status-filter label wraps onto two short lines while adjacent search stretches to fill the row.
- Root cause: base .smart-result-filters flex container allows label to shrink despite available room; search input claims flexible width.
- Fix: P5-only, no-storage-change no-wrap and non-shrinking status filter label with search input flexible width; preserve select and search listeners and full keyboard navigation.
- Regression: Node source assertion and real Electron screenshot audit count text line rects, white-space and flexShrink across Sources views, plus UI overflow checks. Completion requires full CI, visual after-image and release evidence.

## Screenshot-driven batch · Round 05/20 · P5.1.30 / v4.23.114
- Input: actual P5.1.29 Electron EPG 1360px image from capture artifact 14689795888, opened; DVR channel select is disabled showing 'Chưa có kênh để ghi hình' but the green 'Đặt lịch ghi' submit remains visibly clickable.
- Root cause: P5.1.25 guarded `#dvrChannel` only, not the native `#dvrAdd` form submit.
- Repair: reuse same channel observer to disable the native DVR submission when no channel options exist, link its ARIA description to the channel selector, restore exactly when channels return, preserve all scheduled jobs, title/date fields, callbacks, recordings and data.
- Regression: real Electron EPG 1360/720 screenshots, DOM assertions and lifecycle simulation (empty → populated → empty) for both selector and submit; Node source assertions. Version and release require full CI and manual screenshot review.

## Screenshot-driven batch · Round 06/20 · P5.1.31 / v4.23.115
- Input: actual P5.1.30 Electron TV 450px screenshot from capture artifact 14690060103, opened; compact disclosure displays English 'Timeshift · Ghi hình · Công cụ' even though the app calls the feature 'Tua lại' elsewhere.
- Root cause: `renderer/positron-fifty.js` hardcoded the old mixed-language label and tooltip in `syncTools`.
- Repair: use 'Tua lại' in the closed disclosure and tooltip, preserving the native open/close state machine, ARIA expanded state and content visibility; do not touch streaming logic.
- Regression: real Electron TV 450px screenshot after reopening/closing the tools disclosure, assert tooltip, visible Vietnamese wording and click transitions. Node source regression. Tag/build only after full verification.

## Screenshot-driven batch · Round 07/20 · P5.1.32 / v4.23.116
- Input: real P5.1.31 Electron TV 450px screenshot, actual capture artifact 14690160671, opened; header Studio theme selection appears as a tiny font-dependent diamond. Audit confirms the old `::before` uses content `"◈"`.
- Root cause: P5.1.8 compact button emulates an icon with font glyph despite the other toolbar controls using theme-aware SVG.
- Fix: give the existing native Studio button a monochrome half-circle SVG + readable desktop label; hide previous pseudo glyph at compact breakpoints, preserving aria-label, title, expanded state, click listener and palette persistence.
- Regression: Node syntax/source; real Electron 450/600 screenshots assert vector dimensions, no pseudo-glyph and open/close Studio menu lifecycle. Require CI success, opened PNG and release validation.

## Screenshot-driven batch · Round 08/20 · P5.1.33 / v4.23.117
- Input: P5.1.32 Electron TV 450px real screenshot from capture artifact 14689029565, opened; right-hand favorite star is active-looking even when 'Chưa chọn kênh' is shown.
- Root cause: native `updatePlayerFavorite()` updates pressed style but does not disable the action when current channel is null.
- Repair: a nonintrusive Positron guard references `window.IPTVState.getCurrent()` (native selection), disables only the no-channel star, supplies accessible description via playingTitle, and re-enables on native title/pressed state changes; leaves Favorites store, events, current channel and playback untouched.
- Regression: static tests and real Electron 450px screenshot/DOM assertions for no-channel disabled icon and accessibility. Requires after-screenshot inspection and full CI validation before certification.

## File (8) batch · Round 01/20 · P5.1.34 / v4.23.118
- Direct visual input: opened real P5.1.32 Electron EPG 1360px screenshot (capture artifact 14689029565). The following P5.1.33 commit only altered TV Favorites, leaving this EPG state unchanged.
- Observed: disabled no-channel `Đặt lịch ghi` retains a vivid teal active-action appearance; P5.1.30 CSS only changed opacity.
- Repair: neutral theme-aware disabled background, text and border, grayscale and not-allowed cursor, only when `[data-positron-no-channels=true]` is set. Native scheduling form/re-enable logic and all M3U data untouched.
- Validate: Node source regression and Electron screenshots with style assertions on both EPG viewports. New screenshot must be opened and checked before certifying the round.

## File (8) batch · Round 02/20 · P5.1.35 / v4.23.119
- Input: actually opened P5.1.34 EPG 1360px screenshot from GitHub Actions artifact 14690910182. The disabled DVR action is now neutral, but its small square recording glyph remains font/platform-dependent.
- Repair: insert currentColor recording SVG inside existing `#dvrAdd` button and keep original button/form listeners. The label remains `Đặt lịch ghi`, the vector is aria-hidden, and P5.1.34 neutral disabled style still applies.
- Regression: Node source test and actual Electron EPG screenshot assertions for vector presence, accessible button caption, disabled guard and color at 1360/720; complete only after visual review and release check.

## File (8) batch · Round 03/20 · P5.1.36 / v4.23.120
- Baseline: opened real P5.1.35 Electron EPG 1360px / 720px screenshots from captured artifact 14690880372; program search guidance text is very faint on a dark background.
- Fix `#epgSearchResults` foreground and typography with a narrowly scoped Positron theme-aware rule, without modifying EPG parsing, searches, schedules, channels, or persistent data.
- Regression: real Electron screenshot audit at both widths asserts computed luma >= 140, font 13px, full opacity and zero horizontal overflow; Node source tests. Must visually review after captures before counting the round.

## File (8) batch · Round 04/20 · P5.1.37 / v4.23.121
- Input: opened P5.1.36 real Electron TV 450px screenshot from artifact 14690358283; main purple Play appears enabled although zero playlists/channels are loaded.
- Native Play normally auto-starts first enabled channel. Disable it only when no channels exist and no current playing channel can resume. Use a MutationObserver on channel counter and current-title state to restore native action when channels become available; never replace button listeners.
- Regression: real Electron TV 450px screenshot and Node assertion for disabled guard, opacity, cursor, dynamic 0→1→0 restoration; do not count until screenshot review and release verification.

P5.1.37 same-round screenshot feedback: Electron capture failed TV 450px at computed Play opacity after a native legacy selector forced 1 with `!important`. Corrected exact selector specificity on Positron disabled Play, preserving real active-play theme styling. Re-run full test+screenshots before release; do not count failed first attempt.

## File (8) batch · Round 05/20 · P5.1.38 / v4.23.122
- Input: inspected P5.1.37 corrected actual Electron TV 450px capture artifact 14690836496; Play now has `opacity=0.5` when no channel, but adjacent Prev / Stop / Next still look enabled with zero channels.
- Repair: scope a stateful disabled guard to the native three transport buttons; Prev/Next reactivate with channels while Stop requires a current selected channel. Keep all original listeners and the current playback state intact.
- Verify: Node source tests and actual TV Electron audit at 450px check disabled styling, dynamic simulated 0→1→0 channel counter lifecycle, zero overflow. Capture/release must succeed before the round counts.

## File (8) batch · Round 06/20 · P5.1.39 / v4.23.123
- Input: opened P5.1.38 actual Electron TV at 450px (artifact 14690444645); main and navigation controls correctly disabled with no channel, while Cast/AirPlay and PiP still look available.
- Confirmed root cause: native Cast click handler in `renderer/app.js` only emits 'Chọn kênh trước' warning with no current channel; PiP requires a selected video. Keep native button nodes, SVG icons and event handlers, guard only missing-current case and restore when a channel is selected.
- Regression: Electron 450px real screenshot computed disabled status, SVG retained and contrast for Cast/PiP, with Node source tests; playback/Cast discovery with actual legal streams remains untested.

## File (8) batch · Round 07/20 · P5.1.40 / v4.23.124
- Input: opened actual P5.1.39 Electron TV 450px screenshot artifact 14690383363; main controls and Cast/PiP are now appropriately disabled with zero channels, but the large `▶` in the empty-video panel remains bright and looks clickable although it has no event handler.
- Repair: replace only the original `.empty-icon` text with a simple currentColor television SVG (`aria-hidden`, non-interactive), retain real import buttons, video DOM and native logic. Theme-aware muted color reduces false button affordance.
- Regression: full Node tests and real TV 450px Electron screenshot asserts vector, aria-hidden, no leftover glyph and 28px sizing; version and immutable release metadata advanced. Requires screenshot review, CI and release verification.

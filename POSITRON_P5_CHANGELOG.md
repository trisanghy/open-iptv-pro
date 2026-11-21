## P5.1.107 — Replace font-dependent compact channel chooser icons with SVG / Electron v4.23.191

- Actual P5.1.106 native Electron TV screenshots at 450px/540px: channel chooser tabs and grid/list toggles still use platform text-glyph symbols (▣, ☆, ◷, ▦, ☷) rather than a coherent icon set. Some appear like isolated small squares.
- Root cause: old renderer/web-channel-chooser-v42371.js hardcodes text glyphs into the chooser's button HTML.
- Fix inside Positron branch only: render five deterministic SVG icons, preserve all existing click listeners, role/tab selection, channel playlist data, and no-autoplay semantics. Give grid/list toggles explicit accessible names.
- Regression: real Electron 450px QA validates exactly 5 icons, icon visibility, full readable tab labels, grid/list accessibility and zero header overflow, and captures `positron-p51107-chooser-native-svg-450-real.png`.
- Candidate until CI, actual image review, and immutable release asset verification.

## P5.1.106 — Empty WatchFlow without a horizontal scrollbar / Electron v4.23.190

- Real screenshot P5.1.105 `positron-watchflow-1360-night-real.png` reveals a horizontal scrollbar in compact no-source WatchFlow.
- Root cause: P5.1.100 sticky header has -18px horizontal margins, but compact empty playlist uses 15px padding.
- Scoped fix matches the 15px padding, preserving playback, saved bookmarks, other modal modes and user data.
- Strict CDP/Electron proof: `panel.scrollWidth <= panel.clientWidth+1`; screenshot `positron-p51106-empty-watchflow-no-horizontal-scroll-real.png`.
- Do not count complete before CI and screenshot visual inspection.

## P5.1.101 — Search within all privately saved Watch Later channels / Electron v4.23.185

- Evidence from actual P5.1.100 Electron screenshot and source: saved Watch Later entries are accessible in batches but up to 80 entries require many manual scroll/reveal actions to find a particular channel.
- Provide a persistent accessible search field on the Continue screen. Filter locally resolved saved channel titles or group names, with Vietnamese accent-insensitive matching, and show result counts. No URL search, network requests, data upload, playlist changes or automatic playback. The local-only bookmark schema remains unchanged.
- Keep the search input separate from re-rendered cards to preserve keyboard focus as results change. Retain the existing eight-at-a-time paging for the unfiltered list.
- Pure Node regression test covers matching title/group, diacritics, never searching stream URLs or unsaved channels. Real Electron CDP QA searches the twelfth item in a synthetic local 12-channel bookmark list, checks no autoplay / no storage changes, and takes screenshot `positron-p51101-watch-later-search-552-real.png`.
- Candidate until all tests, screenshot review and immutable release assets have actually been verified.

## P5.1.100 — WatchFlow header and mode tabs remain visible in long saved lists / Electron v4.23.184

- Real P5.1.98 Electron screenshots of 12 saved bookmarks demonstrate that the close icon and mode tabs disappear after scrolling to the end, even with accessible bookmark pagination.
- Keep header and mode selector sticky in the existing WatchFlow dialog, using compact typography and dark background while preserving the native TV transport, EPG, and local-only saved state.
- Test with 12 synthetic metadata-only saved channels on actual Electron CDP. Assert scrollability, header/nav position, hit-testable close icon, non-obstruction of native player, no autoplay, and close/reopen. Capture `positron-p51100-watch-later-sticky-552-real.png`.
- Node regression guards CSS and real Electron QA setup. This is a new source revision, not a relabel of 70 historic screenshot scenarios. Release verification is independent and may be blocked by GitHub token HTTP 403.

## P5.1.99 — Upcoming programme in WatchFlow directly from XMLTV / Electron v4.23.183

- Feature: extend actual Now cards with the first Next XMLTV programme and its local start time. Reuse `IPTVGuide.current()` and existing channel/manual mappings, EPG offset and user's device time zone. Never infer a programme title from a channel or network search.
- Show Next only if its schedule starts after the present instant, has valid end time, an actual title and starts within 12 hours. Avoid misleading 'up next tomorrow' from incomplete guides. Do not load extra sources, auto-play a channel or alter native playlists.
- UI stays inside existing WatchFlow cards, beneath true Now (if any), truncates long metadata but exposes full title in tooltip. Native Lưu / Xem controls preserved.
- Tests: pure unit cases for active future, finished, missing/stale, invalid metadata; Electron 552-channel metadata-only scenario temporarily provides synthetic current+next XMLTV on one actual QA channel, verifies exactly one Next row, no auto-play and captures `positron-p5199-next-epg-watchflow-552-real.png`.
- Inherits the P5.1.98 follow-up correction resetting WatchFlow scroll on mode change, preventing lower cards obscuring title/navigation. Complete only after reading real screenshot and CI installers/release.

## P5.1.98 — On-air XMLTV programme titles in WatchFlow recommendations / Electron v4.23.182

- Research basis: the imported XMLTV guide already backs native EPG search and reminders, but WatchFlow cards show only channel names and source health. IPTVnator's channel list offers Now/Next EPG inline; copy no external assets/code.
- Enhancement: add only the **currently airing** actual XMLTV programme title under relevant WatchFlow card names, using the existing guide from `IPTVExtras.getGuide()`, `IPTVGuide.current()`, manual channel mapping and saved EPG offset. One line of readable text with full title in a tooltip. No programme title is shown without matching, currently active guide data; no guessed programme info.
- Security/privacy: no external URL/EPG fetch, automatic discovery, AI guessing, playlist mutation, history logging or autoplay. Labels use `textContent` instead of HTML. Works with local-only data and still works when EPG is not installed.
- Tests: new pure metadata adapter `renderer/positron-onair-core.js`; Node tests for start/end boundary, timezone-adjusted offset, no guide and malformed metadata; real Electron 552-channel synthetic metadata QA temporarily injects exactly one XMLTV programme title and checks one card shows it without autoplay, then restores original guide. New screenshot `positron-p5198-live-epg-watchflow-552-real.png`.
- A future phase may offer programme explanations, filter by current programmes, and guide-based recommendation ordering after independent consent and quality tests. Current release implements only verified Now UI, not semantic AI.

## P5.1.97 — Watch Later pagination: all saved channels reachable / Electron v4.23.181

- Fixed a confirmed accessibility and functionality gap: Watch Later retained up to 80 bookmarks but Continue displayed only the first eight, making entries 9–80 unreachable.
- Continue now shows the count of available saved channels, initially renders eight, and offers an accessible "Xem thêm" control in groups of eight. Native playback remains explicit and does not start on saving or expanding.
- The private local bookmark store is unchanged, with no added URLs, credentials, or playlists.
- Added Node regression and real Electron CDP QA with 12 synthetic metadata-only bookmarked channels, expanding 8 to 12, testing their actions and no automatic playback; `positron-p5197-watch-later-many-552-real.png` is the visual evidence.
- Prior P5.1.96 and its release remain immutable. CI result and assets require independent verification.

## P5.1.96 — WatchFlow Xem sau: private local channel bookmarks / Electron v4.23.180

- Feature motivation: real open-source IPTV ecosystem increasingly has favorites, history and quick-return interfaces; the existing native history intentionally records only decoded playback, so a separate deliberate 'Xem sau' saves a choice even when the user has not played it. Related research: `POSITRON_FEATURE_RESEARCH_NEXT20_20261121.md`.
- Implementation: from the original WatchFlow Mix/Similar/Continue cards, add keyboard-accessible `Lưu` / `Bỏ lưu` beside the existing native `Xem`. In the existing Tiếp tab, saved channels appear in a `Để xem sau` section above native successfully played history; no new sixth tab crowds the modal. Save toggle never starts playback; playback remains explicit `IPTVState.playChannel(id)` click.
- Local-only privacy: `positron.watch-later.v1` stores only a deterministic fingerprint of source ID (never raw source ID), normalized non-URL channel key and timestamp; does not save playlist, stream URL, token, credentials or EPG. 80 entry cap; malformed/untrusted storage filtered; matches only the original source after ID/URL refresh; dead/inactive channels are not recommended or silently deleted from storage. localStorage failure reports failure rather than false success.
- Tests: native `tests/positron-watch-later.test.cjs` covers privacy, source isolation, URL refresh, redaction, invalid input, cap and no autoplay. Real Electron screenshot QA inserts 552 synthetic metadata channels, clicks Save, confirms local-only persisted fields, opens Tiếp, sees saved card, checks no stream, captures `positron-p5196-watch-later-552-real.png`, then removes synthetic entry. Existing Similar test retains exactly 5 real play actions after a separate Save button was added.
- **Not verified until full Node, screenshot visual review, Windows/macOS packaging and immutable Release pass.** No other branches modified.

## P5.1.95 — Correct visible overlay of WatchFlow scroll cue / v4.23.179

- Direct manual review of the REAL P5.1.94 Electron screenshot `positron-p5194-watchflow-scroll-cue-552-real.png` revealed an important new defect: the indicator `↓ Cuộn xuống để xem thêm kênh` sat over the third Mix card's `Xem` button. Pointer-events:none made the button technically clickable, but visual occlusion is unacceptable. P5.1.94 was therefore not counted as a fully reviewed round.
- Cause: indicator was an absolute-positioned child at the bottom of a 390px, scroll-clipped dialog.
- Fix: mount scroll indicator inside the actual dynamic Mix heading and use relative inline layout, not absolute overlap; keep the existing geometry-based visibility, hide at bottom/close/when not needed and preserve native player transport and no-autoplay.
- New Node regression verifies inline DOM hierarchy and no overlay style. Real Electron 1360×820 QA asserts all five buttons exist and indicator rectangle has zero overlap with every card button, remains visible when needed and no IPTV stream starts. New authentic screenshot: `positron-p5195-watchflow-inline-scroll-cue-552-real.png`.
- Distinct P5.1.95 SemVer/tag preserves immutable P5.1.94 records while delivering screenshot-grounded correction. This correction belongs to the same uploaded batch round 02; count only after after-image manually opened, tests and release assets verified.

## P5.1.94 — Expose hidden WatchFlow Mix suggestions when desktop panel scrolls / v4.23.178

- Input: manually opened genuine P5.1.93 Electron screenshot `positron-p5193-group-balanced-mix-552-real.png` at 1360×820. The 390px bounded dialog displays just 2–3 of the five Mix results and its small native scrollbar does not clearly signal that the remaining channels can be reached. The 450px screenshot shows all five cards without this problem.
- Root cause: the fixed-height desktop popup protects native playback controls but has no scroll-affordance state tied to card visibility.
- Fix: preserve the current 390px max-height and native playback, source files, and user preferences; add a passive on-panel visual cue `↓ Cuộn xuống để xem thêm kênh` only when the final recommendation card is actually outside the panel bounds. Recompute on scroll, resize, mode switch and reopen; hide when the last card becomes visible or panel closes, prevent pointer interception.
- Regression: Node assertions for cue presence, geometry, aria and pointer-safe style; real Electron QA at 1360×820 checks cue visible, hides after scrolling to end, no autoplay and dialog clears player controls; screenshot `positron-p5194-watchflow-scroll-cue-552-real.png` for direct inspection. Not counted complete until after-image/release verified.

## P5.1.93 — Balance daily Mix source groups with equal playback evidence / v4.23.177

- Baseline: opened genuine Electron P5.1.92 `positron-p5192-local-calendar-mix-552-real.png` from run `44910897473`, screenshot artifact `14709677582`. The five Mix suggestions had Main=3, Regional=1, Other=1, even though all QA streams were equally unverified; current Mix promised variety.
- Root cause: the final alphabetical `dailyMix` filler did not account for groups already selected. Keep source status/playback evidence as the first ranking criterion, and balance source-group counts only among channels with the same evidence score. A local-day hash supplies stable but rotating ties.
- New regression tests: 3 groups × 14 channels, 5 picks with [1,2,2] group counts on four dates, no duplicates, different dates rotate, and an actually proven stream remains included. Native Electron 552-channel QA measures rendered card group counts, no autoplay and generates `positron-p5193-group-balanced-mix-552-real.png`.
- This version is a candidate until test, native screenshot opening, CI and immutable installer assets are verified. No playlist/history modifications and no network or streaming during QA.

## P5.1.92 — Correct daily Mix and Smart Zap calendar day / v4.23.176

- Input: opened *real Electron* P5.1.91 `positron-watchflow-plus-mix-552-metadata-qa-real.png`: user-facing heading promises `Mix 5 kênh hôm nay`. The existing implementation used `new Date().toISOString().slice(0,10)` in both WatchFlow UI and underlying smart suggestion engine, incorrectly rotating daily recommendations at **07:00 local time in Vietnam (UTC+7)** instead of local midnight.
- Added pure `localDay(date)` helper using the device Date local year/month/day. The Mix UI and engine defaults now use the local day consistently, including Smart Zap. Explicit date arguments remain supported, and recommendation health/dedup/privacy continue unchanged.
- New Node regression launches child processes in `TZ=Asia/Bangkok` and `TZ=UTC` for the **same instant** 2026-11-20T18:30:00Z and confirms Nov21 in Bangkok but Nov20 UTC. Real Electron QA asserts five Mix recommendations remain clickable, mode selected, never autoplay, and local date key; captures `positron-p5192-local-calendar-mix-552-real.png`.
- No network, automatic playlist import, recording/stream access, or personal time-zone data storage.

## P5.1.91 — Match native Play/Pause glyphs to Web original SVG / v4.23.175

- Input: actual P5.1.90 Electron screenshot `positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png`. The legacy Electron Play triangle was made with CSS `clip-path:polygon(...)` and pause using `linear-gradient`, unlike the modern verified SVG icon set from `web/online/web-player-icons.css`.
- Read the **Web branch only** and bring its exact SVG data URI masks for Play and Pause into the Positron-specific media CSS. Restore 22×22 consistent stroke geometry. Preserve the existing original Play button, click handlers, MutationObserver deriving state from native app glyph, disabled style, current theme colors, player and media IPC; no other branch changed.
- Native Electron CDP QA temporarily updates only decorative Play text (without clicks, playback or network requests), asserts CSS SVG mask, 22px sizing, proper switch to Pause and restoration, then captures `positron-p5191-web-play-svg-552-metadata-real.png`.
- Node regression asserts masks, Web-origin geometry and native handler wiring. Do not claim feature tested until QA screenshot is opened and CI passes.

## P5.1.90 — Hide experimental Video Lab when nothing is selected / v4.23.174

- Input: actual P5.1.89 Electron 1360×820 screenshot `positron-p5189-player-ready-subtitle-552-metadata-real.png` shows an active-looking `Video Lab · Beta` control while the player has no selected channel. Source `renderer/video-enhancement-electron-v42375.js` confirms its AI enhancement pipeline is not connected; original button opens a UI-only experimental panel and saves settings but does not enable live AI upscaling.
- Remove that dead-end from the **unselected** player UI only. Keep button and settings in DOM, restore it when native selected channel exists, and collapse its panel when selection ends. Monitor native title and component initialization rather than mutating playlists or media pipeline.
- Node tests and real Electron metadata-only QA assert the button is hidden and not taking space with no current channel; with a temporarily stubbed channel selection it becomes visible, and after restoring native state it hides again, all without starting video. Screenshot `positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png`.
- No model installation, upscaling, autoplay, user preferences deletion, or changes to other branches.

## P5.1.89 — Native player status reflects available channels / v4.23.173

- Input: actual P5.1.88 Electron 1360×820 screenshot `positron-p5188-player-ready-552-metadata-real.png` shows 552 imported native channels and a useful explicit start action, yet the status under the video still says `Nhập danh sách để bắt đầu` (import a playlist to begin).
- Synchronize only the native *default* `#playingSubtitle` hint with native enabled-channel count. Change the default to `Chọn kênh để bắt đầu` when channels are present, restore the original import hint when none are. Never overwrite status labels after a user stops video or when a channel is already selected or playing.
- Add Node assertion and real Electron metadata screenshot `positron-p5189-player-ready-subtitle-552-metadata-real.png`, including a CDP check that UI state and caption agree and playback remains stopped.
- No playlist changes, imports, autoplay, caption, DVR or stream requests.

## P5.1.88 — Real playlist-aware TV onboarding / v4.23.172

- Input: opened actual P5.1.87 Electron 1360×820 screenshot `positron-p5-visual-only-552-channels.png`. Although 552 native channels were already in the sidebar, the video's empty state still misleadingly asked the user to import a playlist, and offered only `Mở file M3U` and `Thêm URL`.
- Keep the native no-playlist onboarding intact. When enabled native channels are available, show `Chọn kênh để xem` and accurate channel count, preserve the file/URL buttons in DOM but hide them, and offer `Xem kênh đầu tiên` which invokes the existing `IPTVState.playChannel(first.id)` **only after a real user click**. The first eligible enabled source is used; dead and missing-link channels are not selected. No autoplay, playlist mutation or network lookup.
- Observe native `channelMeta` for source import/removal updates; restore original import actions when there are zero enabled channels. Preserve the existing player, playback and source data.
- New Node regression and actual Electron screenshot `positron-p5188-player-ready-552-metadata-real.png` inspect the imported 552-channel state and assert original import controls remain in DOM, new action visible, text accurate, and playback never starts during QA.
- Counts as complete only after UI screenshot opened and full CI/release success.

## P5.1.87 — WatchFlow tabs stay readable / v4.23.171

- Input: manually opened real Electron P5.1.86 screenshot `positron-watchflow-plus-similar-552-metadata-qa-real.png` at 1360×820. The navigation tab formerly labeled “Xem tiếp” rendered as visibly truncated “Xem ti…”.
- Replace the short visible label with “Tiếp”; the accessible `aria-label` and `title` remain the complete “Tiếp tục xem”. No watch-history, stream, channel, or EPG behavior changes.
- Add regression assertions and **real Electron DOM geometry checks** for five mode-label widths (span.scrollWidth <= span.clientWidth) in the same populated WatchFlow screenshot, retaining existing nav overflow and button-width validations.
- Only count the round after Node tests, real Electron screenshot/manual review, all platform builds, and immutable release verification succeed.

## P5.1.86 — Prevent WatchFlow dialog from covering native player / v4.23.170

- Visual input is the actual Electron 1360×820 screenshot from P5.1.85 at `p5-20-rounds/positron-watchflow-plus-similar-552-metadata-qa-real.png`; popup (top ~72, bottom ~680) covered the entire right part of native player controls (top ~487).
- Fix desktop-short viewport WatchFlow popup to a 390px *border-box* maximum with an internal scroll bar. Keep five clickable native metadata suggestions and keyboard-accessible controls; don't alter native playback, playlists, history, or recommendations.
- New real Electron CDP assertion requires 12px clearance above native player controls, internal vertical scrolling, and all five recommendation buttons; captures the same Similar state for before/after comparison. No streaming or automatic playback is performed.
- P5.1.86 round will only count complete after CI build/release and manual inspection of new screenshot.

## P5.1.85 — WatchFlow Plus Similar ranking / v4.23.169

- Inspected the actual P5.1.84 Electron WatchFlow screenshots. The Similar code first sorted by exact source group but then resorted all matches by playback score and alphabetical name, erasing group ordering for equally proven streams.
- Fixed evidence-first ordering with same-group as the next tie-breaker. Proven streams retain priority over unverified streams. Input playlists and watch history remain untouched.
- Added unit regression for same-group order and non-mutation, plus metadata-only Electron Similar screenshot assertion/capture. Never starts IPTV playback.
- This is one new patch cycle, not an assertion of 20 completed rounds; inspect CI and image before marking it complete.

## P5.1.80 — WatchFlow Plus / v4.23.164

- **Smart Zap**: một nút chuyển sang kênh khác theo tình trạng nguồn, bỏ kênh đã chết, tránh kênh đang phát và kênh vừa chuyển; chỉ phát sau thao tác người dùng.
- **Tiếp tục xem**: đọc lịch sử phát đã xác minh khung hình, sử dụng native Recent Channels, không ghi nhận việc phát không thành công.
- **Cùng gu**: đề xuất kênh cùng nhóm hay cùng thể loại với kênh hiện tại hoặc đã xem, không yêu cầu API/EPG bên ngoài.
- **Mix 5 hôm nay**: gợi ý năm kênh thuộc nhiều thể loại/nhóm, danh sách theo ngày; không tự chạy bất kỳ kênh nào.
- **QA**: Node regression tests, ảnh screenshot UI thật với 552 kênh giả lập metadata-only; không truy cập các luồng từ bộ QA.

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

## File (8) batch · Round 08/20 · P5.1.41 / v4.23.125
- Input: opened actual P5.1.40 Electron Settings 1360px screenshot from artifact 14691385846; logged-out Supabase account panel is >300px tall before any PiP/Theme/Backup setting accordions.
- Repair: Positron-only desktop CSS compresses logged-out card padding, header, status, help link and footer spacing; preserves OTP/email input and submit button native min-height 44px, no auth logic or data changes. Logged-in/mobile unaffected by `:has(#portableCloudEmailForm:not([hidden]))` and `@media(min-width:900px)`.
- Regression: real Electron Settings screenshot checks card height 200–290px, input/button >=42px, status visible; Node CSS source test. Must inspect after image and verify CI/release before counting.

## File (8) batch · Round 09/20 · P5.1.43 / v4.23.127
- Input: opened P5.1.41 actual Electron Doctor at 1360px, artifact 14691221839. Zero-channel guard correctly disables analyses, but primary buttons `Chẩn đoán ngay` and `Phân tích` still show light beige, unlike disabled secondary actions.
- Cause: legacy primary button palette has greater visual emphasis, not overridden by empty-source guard.
- Repair: state-specific Positron Doctor CSS enforces neutral background/text, grayscale and disabled pointer only for four buttons with `:disabled[data-positron-no-channels=true]`. Native analysis, source data, report/export untouched.
- Regression: Node source test; real Electron screenshot check each Doctor button is disabled, guarded and neutral with background luma <140. Await direct screenshot review/CI/release before certifying.


## File (9) · New repair round 01/20 · P5.1.43 / v4.23.127
- Baseline verified: P5.1.43 HEAD ef5eae4e54bf; actual screenshot P5.1.41 Sources at 720px showed the source catalog already set to iptv-org/country/VN, but the initial status still said to select a catalog first; P5.1.43 only adjusted Doctor, so this Sources issue persisted.
- Correct only Smart Discovery initial source guidance in Positron renderer; leave default catalog, network fetch, consent, playlists, streaming and existing event handlers untouched.
- Add Node assertion and real Electron Sources screenshot audit of select value and status. Screenshot review, CI and Release assets must be checked before marking the new round complete.

P5.1.43 same-round regression repair: first CI run 44864848127 failed 2/606 Node tests (native i18n audit) because the edited default Source instruction had no translations. Added full offline translations for 16 non-Vietnamese locales in `renderer/i18n.js`, kept original dictionaries/streams untouched, added localization coverage test. Retest CI and actual Electron screenshot before certification.\n
## File (8) batch · Round 10/20 · P5.1.44 / v4.23.128
- Read actual P5.1.43 Electron Favorites 600x820 screenshot (artifact 14691567509): no-source instructions/CTA stranded near y230–320, large unused empty region below.
- Center the existing empty Favorites CTA within compact viewport via scoped CSS without touching channel data, source button listeners or nonempty/desktop lists; geometry audit checks top>=300 and button above status footer.
- Correct P5.1.43 workflow tag mismatch: new version's tag is `positron/v4.23.128-p5.1.44`, matching displayed version, instead of carrying prior p5.1.42 suffix. Retain historical tags/commits.
- Real Electron screenshot and full Node CI pending, do not mark complete before opening image and verification.

## File (9), screenshot-driven round 02/20 — P5.1.45 / v4.23.129
- Input: actual P5.1.44 Electron screenshot positron-p5-17-real.png (720px). EPG missing-data text asks users to open Settings and find 'Cập nhật EPG ngay', while visible action is 'Nguồn EPG'.
- Root cause: renderer/features.js EPG empty fallback text did not match existing epgSettingsBtn, which opens the EPG settings section.
- Fix only default missing-data prose and translate all 17 native locales. Do not change EPG fetch, XMLTV, reminders, recordings or playlist data.
- Add Node regression and Electron audit checks at EPG 1360px and 720px, synchronize build version and stale CI artifact naming.
- Await CI, actual after screenshot, build and release verification; release token HTTP 403 remains a blocker.

## File (9) screenshot-driven repair round 03/20 — Positron P5.1.46 / v4.23.130
- Evidence: opened P5.1.45 genuine Electron EPG screenshots at 720px / 1360px. Unavailable DVR recording form, date fields, and disabled Add Schedule consume substantial viewport space when there are zero channels.
- Preserve native form and saved schedules. Only hide unusable form/help for zero source channels; retain recording directory, history, actions. Display existing localized no-channel status and Quản lý nguồn IPTV shortcut, automatically restore form if a channel becomes selectable.
- Add Node regression and actual Electron screenshot audits of both sizes, plus live DOM simulation of channel arrival/removal proving reversibility.
- Release consistency correction: P5.1.45 / v4.23.129 CI succeeded but produced a GitHub Release with INCONSISTENT tag positron/v4.23.129-p5.1.44. Preserve that immutable tag; P5.1.46 workflow explicitly uses positron/v4.23.130-p5.1.46, with test verifying package.json SemVer + P-label. Do not claim P5.1.45 was correctly tagged.
- Test, capture, Windows and macOS builds, Release asset verification remain prerequisites for certification.

P5.1.46 same-version CI repair: run 44866650681 failed 2/611 because historical Positron test assertions still expected P5.1.44 release tag and P5.1.45 badge while actual manifest, workflow and badge correctly specify P5.1.46. Correct these assertions to dynamically derive the P-label from package.json description; never suppress mismatch. New test/capture/build/release required.

## File (9) round 04/20 — P5.1.47 / 4.23.131
- Observed in actual P5.1.46 Electron 720px/1360px EPG screenshots: no channels, DVR schedule form correctly hidden, but native status still displays "Sẵn sàng đặt lịch ghi..." despite scheduling impossible.
- Cause: renderer/dvr-ui.js originally sets an unconditional idle-ready status on first load; Positron P5.1.46 suppressed the form only.
- Repair strictly Positron-local: while no schedulable channel and native text equals its known idle-ready message (including offline locale translation), hide only that specific status. Keep native message in DOM and show it again if a channel arrives. Never suppress actual DVR errors, ongoing recording statuses, saved schedules, or folder controls.
- Add Node and real Electron 720px/1360px screenshot checks, including synthetic selectable channel/rollback to verify restoration and no phantom readiness.
- Continue SemVer/P-label increment and immutable release tag validation.

## File (9), round 05/20 — P5.1.48 / v4.23.132
- Input: visually opened P5.1.47 actual Electron EPG 1360px screenshot. It shows zero channels yet guide footer blames unmatched XMLTV/tvg-id in an existing playlist, which cannot be accurate when there is no playlist.
- Root cause: renderer/features.js renderEPG() uses the same empty-guide text regardless of channels.length.
- Repair: branch on actual channel count. When there are zero channels, instruct to add an M3U playlist through Quản lý nguồn. When channels exist but EPG has no matches, preserve the original matching/tvg-id guidance.
- Build the empty node using textContent rather than innerHTML; add all 16 non-Vietnamese offline translations and Electron screenshot assertion for 720px and 1360px guide.
- Preserve EPG data/offset/cache, source import, existing programmes and favorites. Await individual CI/release proof.

## File (9) round 06/20 — P5.1.51 / v4.23.135
- Real screenshot P5.1.48 EPG 1360px/720px shows 0 channels but ↻ Tải lại EPG is highlighted and clickable; native refreshEPG() only warns instead of loading because no M3U playlist.
- Root cause: no-channel UI state omitted from reload button guard; native EPG data and service are not modified.
- Positron only: disable the reload CTA while zero channels, mark precisely when Positron owns this disabled state, style muted, restore only own state once navCount changes. Do not override native in-flight load (`epgLoadBtn.disabled`).
- Add real Electron snapshot assertion at 1360px/720px and synthetic nav-count 0→1→0 transition proving reversible control. Keep the Nguồn EPG button enabled and playlist/cached guide/EPG data intact.
- Check separate CI/test/screenshots/build and immutable tag before certification.

## P5.1.51 — Screenshot-reviewed DVR empty-state repair
- Inspected actual P5.1.49 Electron EPG screenshot at 720px (`positron-p5-17-real.png`): empty DVR history offered manual scheduling while no IPTV channels exist.
- `renderer/dvr-ui.js` now provides source-import guidance when there are no recordable HTTP(S) channels, while preserving EPG/manual-schedule instructions when channels are available. Existing jobs and DVR APIs unchanged.
- Added Node source regression test and version-synchronized Windows scripts. Require fresh Electron screenshot and full CI/build before certification.

## P5.1.51 — Real EPG screenshot review: no-data search guidance
- P5.1.50 inherits the verified real Electron P5.1.49 EPG 720px screenshot showing no EPG guide alongside an active programme-search control.
- When the user searches without any EPG programmes, `renderer/advanced.js` now explains that guide data must be loaded through Nguồn EPG instead of presenting the misleading no-match result. Normal EPG searching and reminders are untouched once programmes exist.
- Add regression tests; require GitHub CI, real Electron screenshots, Windows and Mac builds and immutable release verification before marking complete.

## Positron P5.1.52 (Electron 4.23.136) — remove nonfunctional EPG clutter in empty state
- Reference: P5.1.51 actual Electron screenshot `positron-p5-17-real.png` (EPG 720px) and `positron-p5-16-real.png` (EPG 1360px), verified from workflow 44869443462.
- Root cause: programme-search, manual XMLTV mapping and offset controls were rendered unconditionally even when there were zero loaded EPG programmes. This used screen space but those operations could not produce useful results.
- New Positron-only UI state hides the EPG channel filter and advanced search/mapping/offset row **only** when the current guide contains no programmes. Original DOM, handlers and saved values are unchanged, and a native EPG summary mutation automatically restores controls when XMLTV programmes appear.
- The visible Nguồn EPG button, empty-guide explanation, cached guide, DVR and all playback settings remain intact. No features or user data are deleted.
- Regression: assert real Electron empty state at 1360px and 720px; emulate a temporary in-memory guide entry to verify controls reappear and disappear again; assert all native controls still exist. No synthetic screenshot is accepted as a real streaming test.
- Requires new GitHub Actions test, screenshots, both Windows x64 EXE installers and macOS builds before release is verified.

## Positron P5.1.53 (Electron 4.23.137) — remove duplicate empty EPG search copy; refresh live guide search
- Input: actual P5.1.52 Electron 720px EPG screenshot `positron-p5-17-real.png` from workflow 44870313583, visually opened and compared with P5.1.51.
- Found: after the P5.1.52 no-guide filters are hidden, `#epgSearchResults` still repeats an almost identical no-guide message already supplied by the native `#epgSummary`.
- Also found potential runtime stale text: after an asynchronous EPG load, previously rendered search results could keep the no-data message even though programme controls are restored.
- Repair: Positron-only empty-state CSS hides just redundant search status while guide is empty; original native EPG summary and Nguồn EPG remain visible. When programme data first becomes available on the active EPG page, reuse existing `IPTVProAdvanced.onPage('epg')` to refresh search-result text; user inputs, saved mappings and guide are preserved.
- Tests: real Electron audit at EPG 1360px/720px checks suppression plus reversible show/hide and verifies search text updates when temporary in-memory QA programme appears. Screenshot audit is not proof of live TV playback.
- Release condition: full tests + actual before/after Electron screenshots + Windows/macOS packaging + non-overwriting tag P5.1.53.

## Positron P5.1.54 / Electron 4.23.138 — TV and media controls overhaul
- User-provided real Windows 1536x960 screenshot of a populated IPTV playlist revealed visual clutter: oversized gold round Pause, weak icon consistency, harsh multi-layer cards and tight channel/transport/player columns.
- Redesign the TV workspace as a calmer flat dark layout with 188px app navigation, 244px max channel list, reduced header/padding, gentle selection and uncluttered cards. Media transport is now a compact 44px rounded-square Play/Pause surface and consistent 20px outline SVG icons for navigation, Cast, PiP and fullscreen.
- Preserve actual DOM button identities and native Electron playback handlers; CSS pseudo icon mirrors native '▶' / 'Ⅱ' via data-po-playing without changing player internals or stream URLs. Keyboard aria-label and tooltips track native state.
- Reference local user playlist `iptv.m3u` inspected offline only: 552 entries in 52 groups, 552 logo attributes, 515 HTTPS / 37 HTTP stream URLs; 226 entries have no tvg-id. The user playlist, its potentially sensitive URLs and access credentials are NOT committed or uploaded. No live URL playback or network access was asserted; verify stream usage rights before testing playback.
- New files: `renderer/positron-media-v2.css` and `renderer/positron-media-v2.js`, loaded last to safely outrank the accumulated legacy player/theme CSS, without changing Mac/Windows media pipeline or EPG.
- Regression: JS syntax, source-preserving static tests, real Electron 20-screen P5/50-screen P4 screenshot audit (compact Play size, vector output, native pause/play state transitions) plus macOS and Windows EXE builders. Do not report installer success until artifacts exist.

## Positron P5.1.55 / Electron 4.23.139 — TV-first layout architecture
- Trigger: user's real Windows screenshot and candid review of P5.1.54. Cosmetic recoloring cannot fix the three-competing-panel hierarchy, oversized sidebar, stacked media and redundant tool strips.
- Adds a **default 76px navigation rail** with original full navigation always reachable via a reversible Expand button (210px). Reuses all original page controls, commands, persistence, roles and keyboard handlers. Additional tool icons are real inlined outline SVGs; every native nav button gets a descriptive tooltip and ARIA name.
- Reclaims the extra full-width tools bar: moves existing `#positronToolsToggle` into transport output controls without replacing the native handler; the original P4 advanced tools remain in their collapsible region and fully functional. Moves the existing secondary filter button into the channel search field. No controls or settings are deleted.
- Focuses the main video: narrower channel list, neutral slate surfaces without shiny gradients, compact 51px header, calm channel selection, single media row where space permits, and retaining EPG/alternate-link selectors below. The known P4 high-specificity 52px rounded Play CSS is explicitly overridden by the current 43px square media control. The video element, fullscreen overlay, live captions, playback pipeline and source data are never restyled or rewritten.
- Metadata-only visual QA: after the existing 70 real-Electron empty-state screenshots, import an **ephemeral synthetic 552-channel M3U** with nonresolving example.invalid media URLs to verify a populated channel list at desktop width. This is not a live stream playback test. No content, tokens or stream URLs from the user-supplied M3U are published to CI or GitHub.
- Adds static regression tests for navigation affordances, non-destructive tools/filter relocation and compatibility with native playback; Electron screenshots also assert the rail expands and collapses, Play stays square, and hidden secondary actions remain reachable.
- Follow-up acceptance must rely on actual screenshots, 0-test-failure CI and confirmed Windows x64 EXE installers, not version numbers alone.


## P5.1.56 / v4.23.140 · HORIZON — full-product redesign + WatchFlow
- Source: reviewed actual P5.1.55 Electron TV 1360×823 capture, Actions #44872760322 (artifact #14694268911). The latest capture had 50 successful P4 screenshot iterations but failed the P5 audit because a persisted intentionally expanded navigation rail was incorrectly required to be <=90px. P5.1.55 has NOT been certified/released.
- Product-level redesign: new final stylesheet `positron-horizon-v4.css` unifies navigation, top command bar, channel library, cinematic stage, player docking, EPG strip and the visuals of Sources, Doctor, Settings, Health and other secondary pages. Removes excessive panel chrome, introduces one restrained mint accent, increases hierarchy, restores a larger video area and keeps responsive/accessible controls. The original playback/video-fit, captions, network, DRM, source-consent, backend and data functions are untouched.
- New functional workflow: WatchFlow. On-demand recommendations from actual enabled native channels, modes News/Sports/Movies/Music/Kids/All, verified-status priority, recently played boost, explainable evidence, skip suggestions without repeats until exhausted, one-click native play, and a rights-conscious no-playlist setup path. Fully local: no generated channel URLs, remote AI claims, EPG fabrications, network requests or silent autoplay/imports.
- Real testing: new pure `positron-watchflow-core.js` plus `positron-horizon-v4.js`, Node fixtures in `tests/positron-watchflow.test.cjs`; Electron capture audit adds WatchFlow open/close + topic count and recognizes intentional rail expanded/compact states rather than failing valid preferences.
- Explicit verification requirement: do not claim release, successful Windows EXE, or full visual approval until this commit's Actions tests, 70 real Electron captures, image review, builds and release assets are inspected. No previous source branch is modified.

### P5.1.56 follow-up · screenshot-found sidebar conflict
- First Horizon Node tests passed, but Electron capture run #44873746200 failed: P4's `.p50-01 #appShell > #appSidebar` specificity still forced 206px even while the new Horizon compact rail state was selected.
- Root-cause fix adds a more specific compact 68px / explicit expanded 206px layout rule; native hidden-sidebar preference remains respected, removes the duplicate legacy burger and gives empty-player onboarding the actual full stage instead of a nested inset rectangle.
- Electron audit now **clicks** expand/compact twice and checks measured widths plus restoration, and captures an additional real WatchFlow panel screenshot. No version bump: same P5.1.56 round; build release remains pending fresh CI confirmation.

### P5.1.56 screenshot follow-up #2
- CI attempt #44874090231 reached the redesigned TV 1360 screenshot and the interactive WatchFlow capture. It detected a second inherited P50 style conflict at 1250px: search label max-width:110px clipped visible text.
- The 1360px screenshot also showed overflowing native sidebar labels after the width issue was fixed. Horizon now explicitly hides only rail text in compact mode (keeping SVG and full tooltip/ARIA) and restores it in expanded mode. At 1000–1280px the command button allows its actual text width, avoiding ellipsis. These are substantive visual regressions found in actual Electron captures, not simulated placeholders.
- Retest same immutable P5.1.56 target until UI audit and CI succeed; no misleading release claim.


## P5.1.57 / v4.23.141 · Horizon visual QA and WatchFlow native integration
- Baseline: P5.1.56 v4.23.140, git SHA 38a28739b8e003f59cb3b863bc8df4a0ddb10e2b, all six GitHub Actions jobs successful and actual Setup/Portable Windows x64 and Mac DMGs published. Do not change or overwrite that immutable release.
- Actual Electron WatchFlow 1360 screenshot review discovered dark/low-contrast heading on the panel from legacy Studio theme cascade. The final Horizon layer now uses high-specificity accessible pale title, and the Electron audit asserts computed RGB > 200.
- WatchFlow integration QA now opens the actual Electron panel after importing the existing 552 strictly metadata-only synthetic QA channels into native IPTVState: confirms 552 eligible channels, 3 native action cards, three *different* suggestions after 'Gợi ý khác', captures a populated WatchFlow PNG, and asserts no channel was played or URL accessed.
- No changes to M3U ownership, streaming, Favorites, EPG, encrypted sources, Supabase, platform integrations or media pipeline. Reverify Node, 70 real Electron screenshot cases, Windows/macOS builds, and immutable new tag before certifying.


## P5.1.58 / v4.23.142 — Compact Favorites title duplication from real Electron screenshot
- Previous release: P5.1.57 / v4.23.141 HEAD 3a8bd1b6c80b5bb6165db1990915f61c47074f6f, successful CI 44874945170.
- Opened actual Electron screenshot at 600px: `p5-20-rounds/positron-p5-20-real.png`. Top header displayed "Kênh yêu thíchYêu thích" simultaneously.
- Root cause: Horizon later style `#positronBar .p-heading strong{font-size:13px!important}` overrides compact P5 `font-size:0` while short `::after` text remains visible.
- Fix: scoped Horizon-only responsive strong/::after rules; keep full accessible native text and render one short visual label. Add native Electron computed font-size/pseudo assertions and Node regression.
- Verification gate: native CI capture and post-change PNG review, full Node tests, Windows/macOS artifacts, immutable release check. No playback/source code changed.


## P5.1.59 / v4.23.143 — Horizon scrollbar contrast consistency, screen-based follow-up
- Input: Genuine P5.1.58 TV 600px, TV 1360px and populated 552-channel WatchFlow screenshots: legacy bright purple scrollbars persist despite muted-teal Horizon transport palette.
- Root cause: ui-polish global scroll style derives thumb from legacy --ui-primary, while Horizon only set --po-accent.
- Scope correction: set --iptv-scroll-thumb / --iptv-scroll-track only under .po-v3.po-horizon. Preserve scrollbar functionality, user playlists and other themes, add real Electron computed-style tests at 600px and 1360px, leave stream playback unchanged.
- Gate: full Node test, actual Electron before/after PNG review, Mac/Windows CI and unique release tag. No claim until checks pass.


## P5.1.60 / v4.23.144 — WatchFlow diversified recommendations by native playlist group
- Genuine prior P5.1.59 WatchFlow QA screenshot with 552 metadata-only channels displays three adjacent QA Channel 004/005/006 recommendations all within "01 Main channels" although there are three source groups.
- Root cause: deterministic score/name sort returned the first 3 without source-group diversity.
- Change: retain score-based evidence priority; for same/nearly equal score (within 18 points), pick one per distinct native group before filling remaining slots. Refresh still excludes already-seen items, never changes native data, never requests or plays streams.
- Regression: two Node tests ensure 3 distinct groups, preservation of proven live preference, immutability; Electron metadata QA asserts first three and refreshed three cover 3 native groups; re-open real PNG to confirm.
- CI/release: pending validation. No claim of testing actual IPTV playback; local metadata only.


## P5.1.61 / v4.23.145 — Channel group header dark contrast from native 552-channel screenshot
- Input: P5.1.60 actual Electron 552-channel WatchFlow QA PNG shows bright lavender/white folder header "01 Main channels" with purple text in an otherwise dark/turquoise Horizon UI.
- Root cause: legacy theme and UI-preset CSS styles for .folder-header are applied after native metadata imports and are not overridden by the Horizon layer.
- Fix: scope the populated folder header background/foreground (and arrow/count) to Horizon dark teal; preserve folder click/drag events and source data. Test computed dark RGB background and teal ink in native Electron after importing 552 metadata-only QA channels.
- Before/after real PNG manual review, Node, multi-platform build and immutable release required to certify.


## P5.1.62 / v4.23.146 — Legacy AI/CC toolbar purple color persists inside Horizon
- Input: P5.1.61 native Electron TV 600px PNG p5-20-rounds/positron-p5-07-real.png, personally opened. Visually purple "CC Phụ đề · Dịch · Giọng nói" chip amongst teal Horizon controls.
- Root cause: legacy renderer/unified-ai-inline-v1.css declares #bd83ec border, #322044 background, #c587f2 CC badge !important. Positron previous palettes also leave global --ui-primary / --accent inconsistent.
- Repair: only Horizon skin explicitly defines coherent root accent variables and scoped AI toggle/button/mark/hover colors, retaining existing native control listeners, keyboard interaction, playlist, caption, translate and TTS behavior.
- Proof gate: full Node unit, screenshot Electron TV 600/1360 computed palette/assertions, manually opened AFTER PNG; six-job Mac/Win immutable release.


## P5.1.63 / v4.23.147 — Empty WatchFlow must not hide playlist import
- Input: P5.1.62 real Electron 1360px `positron-watchflow-1360-night-real.png`, run 44894869647, personally reviewed; the 440px fixed panel intersects the main player URL-import action.
- Cause: WatchFlow's popup never differentiated zero native channels from available recommendations, showing six unusable genre filters and a wide overlay.
- Code: mark empty playlist at render, narrow the popup to 310px above 1280px, hide unused category filters and keep the native sources entry in its empty state. Populated channel recommendations and playback code remain unchanged.
- Evidence gate: Node regression, three-theme 1360px real Electron geometry assertions for non-overlap with #emptyUrlBtn, new after PNG screenshot review, multi-platform CI release verification. Do not certify before those checks.


## P5.1.64 / v4.23.148 — Empty WatchFlow overlaps primary player heading
- Input: P5.1.63 real Electron screenshots `positron-watchflow-1360-night-real.png` and Aurora counterpart from Actions run 44896009698, personally reviewed. The smaller panel stopped obscuring the M3U and URL buttons but still covered the far-right portion of the native "Sẵn sàng xem truyền hình" heading.
- Root cause: the no-source panel redundantly repeats intro help above its empty-state card, extending from y72 to roughly y370 over the heading. The empty card already contains the source-access explanation and call to action.
- Fix: hide only the redundant WatchFlow intro paragraph when there are zero native channels; do not change populated recommendations, button listeners or playlist data.
- Regression: three real Electron 1360px themes calculate two-dimensional overlay intersection against both the native `#emptyPlayer h2` and Add URL. Reopen after screenshots and confirm build/release before counting the round.


## P5.1.65 / v4.23.149 — Restore keyboard navigation inside WatchFlow
- Input: Actual P5.1.64 Electron 1360px open WatchFlow screenshot and source-level interaction review: the floating dialog's `openPanel()` leaves active keyboard focus on the topbar trigger because the dialog is appended at end of `<body>`; Tab cannot immediately reach its useful actions.
- Fix: Focus the native Add IPTV source action in the empty-playlist state, or the selected genre button when channels exist. Restore focus to the WatchFlow topbar trigger when closing from within dialog. Add visible focus ring. Preserve Escape to close and underlying playlist behavior.
- Verification gate: new native Electron three-theme DOM focus in/out tests, Node regression and screenshot comparisons, no invented streams or autoplay; build/release only after screenshots have been opened.


## P5.1.66 / v4.23.150 — WatchFlow close button too small and platform-dependent
- Input: actual P5.1.65 Electron 1360px WatchFlow screenshot, downloaded from run 44896707674 and visually reviewed. The upper-right close button uses a generic × glyph in a 30×30 px target, unlike new native monochrome line icons.
- Fix: replace glyph with 20px currentColor inline SVG in same original button; raise close target to 42×42px without changing native close, Escape or focus behavior, keep source playlists untouched.
- Proof gate: real Electron screenshot and DOM check actual target >=40px + SVG across 3 themes, plus Node test, Windows+Mac CI, explicit separate release validation.


## P5.1.67 / v4.23.151 — WatchFlow persists over other pages on keyboard navigation
- Input: native Electron P5.1.66 screenshots showed overlay anchored to the global topbar. Source inspection confirmed dismissal only on document pointerdown and Escape; keyboard-triggered navigation does not emit pointerdown, so popup can remain over Sources/Settings.
- Fix: observe only real TV page active class. If user navigates away, close WatchFlow without mutating current playlist, selected channel or any source. Preserve existing pointer/Escape pathways.
- Regression: native Electron in three themes opens WatchFlow, invokes real IPTVState.setPage('sources'), checks hidden/aria-expanded, restores TV page and verifies active; Node guards source wiring. Build/screenshots/immutable release separately required.


## P5.1.68 / v4.23.152 — Compact advanced-menu button renders overlapping icons
- Input: personally opened P5.1.67 actual Electron 600px TV screenshot `positron-p5-07-real.png`, run 44897365785. Sidebar control around y245 shows extra teal grid protruding left of a three-dot glyph inside a big selected pill.
- Root cause: `renderer/positron-fifty.js` writes a legacy text icon via `syncMore()` while P4 compact styles add a `::before` glyph and `::first-letter` override. Competing pseudo/text icons overlap and overflow the intended 49px rail width.
- Fix: create exactly one four-tile inline SVG in the existing native disclosure button, preserve JS event, aria-expanded, local storage and label in expanded rail; suppress legacy pseudo glyphs under scoped Horizon CSS.
- Regression: actual Electron 600px TV screenshot audit checks one SVG with 4 tiles, pseudo content none, no text spill/overflow, visible icon ~20px; Node test guards replacement DOM and styles. Build+Release pending.


## P5.1.69 / v4.23.153 — Fifth Sources jump tool wraps on its own row
- Input: P5.1.68 real Electron 720px Sources screenshot from CI run 44897915228, personally inspected. Source navigation displays Smart Discovery, Nguồn hiện có, Thu thập and Gộp kênh on the first row, with Kiểm tra & sửa stranded on a second row, wasting vertical space.
- Cause: legacy `.sources-hub-nav{flex-wrap:wrap}` with button 16px horizontal padding forces an orphan fifth tab at 720px.
- Fix: in Horizon Sources at <=900px, use compact 10px button padding, nowrap flex, accessible horizontal overflow scroll on narrower viewports. Preserve native data-source-jump and input behaviors.
- Regression: native Electron 720px Sources assert five buttons, same y for first/last, nowrap, overflow-x auto and no whole-document scroll spill. Node guard and visual before/after. Build+release pending.


## P5.1.70 / v4.23.154 — Sources tool navigation lacks active section feedback
- Input: real P5.1.69 720px Sources screenshot from run 44898216081 (read after single-row fix): five equal dark tabs offer no clue which in-page tool section is selected.
- Root cause: original data-source-jump native buttons scroll but do not indicate selection with ARIA/current styling. This makes section navigation hard to orient when the sources view contains long tools.
- Fix: existing buttons now expose exactly one `aria-current=location` and high-contrast teal selection; clicking each native button updates visual and screen-reader feedback without replacing source jump listeners or mutating IPTV data.
- Regression: real Electron 720px Sources verifies exactly one active destination `smartDiscoverySection` by default and its computed border color, preserving previous no-wrap/overflow checks. Node regression guards event and ARIA wiring, pending screenshots/build.

## P5.1.71 — WatchFlow contextual to TV (new 20-round batch 01)
- Actual P5.1.70 Sources screenshots at 1360 and 720px show TV-specific WatchFlow in source management.
- Opening is now guarded to TV; changing tabs hides the button and dialog, keeps focus accessible, and restores WatchFlow on return. Native channel rank, play events, playlists, preferences and rights consent are untouched.
- New regression + real Electron UI assertions. CI/screenshot/release pending verification.

## P5.1.72 — Smart Discovery with ordered, usable filters (new 20-round batch 02)
- P5.1.71 real Electron Sources screenshots show the primary Discover button between Country and Scan scope, and Cancel separated onto a new row at 1360px.
- Reorder actual native DOM fields so keyboard tab order matches display; use Horizon-only responsive 4-column desktop, 2-column tablet and 1-column narrow Discovery layout. Keep catalog, country, unlimited scope, concurrency, Verify and Cancel IDs/events intact.
- Node regression plus actual Electron geometry assertions validate four fields above Find, paired Verify/Cancel and no horizontal overflow. CI and after-images pending.

## P5.1.73 — labeled and safe DVR recording path (new batch 03/20)
- P5.1.72 real Electron EPG 720 screenshot revealed an unlabeled absolute path beside the folder control. It will wrap badly for long localized user profiles.
- Added a labeled path field while retaining native `#dvrDirectory` and `#dvrChooseDir`, responsive grid and complete hover tooltip mirrored from the actual native path via MutationObserver. No filesystem calls or data mutations.
- Added real Electron QA simulating a very long directory and checking path clipping, full title, visible button, row placement and horizontal overflow, plus Node guard.
- Build and screenshot reviews to be verified from P5.1.73 Actions before marking round complete.

## P5.1.74 — no-source TV workspace uses laptop height intelligently (new batch 04/20)
- P5.1.73 actual Electron TV at 1360x820 displayed a 538px empty video stage, pushing useful controls below the fold.
- On desktop viewports shorter than 900px, only the no-video stage is shortened to provide access to controls. It retains a fluid floor of 280px and bypasses fullscreen. When the player starts video, the original native 16:9 frame remains unchanged.
- Node and real-Electron regression intentionally toggle the empty illustration to verify the live aspect ratio is preserved and the original empty state is restored before screenshots.
- Actual CI and screenshot comparison to be verified before release credit.

## P5.1.75 — truthful Video Lab beta (new batch 05/20)
- P5.1.74 real TV screenshot shows a prominent ‘Nâng cao video bằng AI’ control even though Electron implementation explicitly lacks any live upscale backend; its Apply button does not affect streams.
- Renamed to ‘Video Lab · Beta’, added honest warning tooltip, renamed fake Apply to capability status, and de-emphasized beta visual chrome. Preserved experimental benchmark, settings, data and real playback.
- Added Node mock-browser regression and actual Electron interactions for open/close, beta label, backend warning and non-fake action.
- Screenshot/CI/build/release pending verification.

## P5.1.76 — Smart Doctor zero-source onboarding (new batch 06/20)
- Real P5.1.75 Electron Doctor with 0 playlist channels shows a large noninteractive V3 diagnostics page after the native message to add sources.
- Keep the native import action, safety report and six counters but collapse unused V3/V2 analytics until native channels exist. Observe channel count and automatically restore all original controls on import, without modifying user preferences/history.
- Node regression plus real Electron zero-source and 552 metadata-only source tests confirm both phases; screenshot capture and CI release require verification.

## P5.1.77 — Doctor source CTA screenshot smoke regression (new batch 01/20)
- P5.1.76 capture failed: screenshot shows the native `#positronDoctorSources` source-import action, but added QA mistakenly looked for an element inside `#doctorReport`.
- Check the actual native action's visibility and text, simulate its click and assert successful navigation to the native Sources page, then restore Doctor. Preserve empty V2/V3 hiding and full restoration when channels exist.
- Add regression for the correct selector; new CI screenshot/build/release remain unverified until Actions completes.

## P5.1.78 — Focused empty Doctor onboarding (new batch 02/20)
- P5.1.77 actual no-source Electron Doctor screenshot still had six zero-value metrics taking an entire horizontal row, despite advanced diagnostic panels being correctly hidden.
- While native channel count is zero, hide only `.doctor-metrics` and render a purposeful, labeled introduction with direct access to native source manager; keep both original Doctor V2/V3 sections, all report DOM, and preferences untouched. Restore the complete metric dashboard automatically when actual native channels are added.
- Add Node regression and Electron screenshot assertions for zero-source metrics being hidden and restored after 552 metadata-only channels. No real playback claimed. CI/build/release pending.

## P5.1.79 — Understandable player tools disclosure (new batch 03/20)
- P5.1.78 real Electron TV shows a trailing `•••` icon that does not communicate the Timeshift/recording/tool collection and looks out-of-place against the other monochrome player icons.
- Render a monochrome sliders SVG as part of the existing native toggle in `positron-fifty.js`, overriding only the legacy pseudo-element dots; retain the actual button, its localized text, click handler, aria-expanded, tooltip and saved open/closed state.
- Extend real Electron CDP checks for vector presence, pseudo removal and icon survival across open/close transitions. Add Node regression. CI/release pending.

## P5.1.81 — Single-row WatchFlow Plus toolbar (this batch round 04/20)
- Actual P5.1.80 Electron mix screenshot showed the new five modes wrapped awkwardly into two rows, covering player content and reducing the visible card list.
- Shorten only the visual button captions and preserve complete localized names via aria-label/title. Force one logical row at desktop and allow horizontal scrolling for very narrow screens; maintain all five mode buttons, Smart Zap manual-only playback and keyboard controls.
- Add CDP actual layout assertions and a 450px Electron screenshot, plus Node regression; version tag/CI prerelease remain subject to Actions verification.

P5.1.81 follow-up: real Electron capture found nav overflow; replace flexible nowrap with five measured grid tracks, shorter text plus full aria, and richer screenshot/overflow assertions. Preserve the same version while retrying.

## P5.1.82 — Single-row mobile channel chooser (new batch round 05/20)
- The freshly reviewed P5.1.81 real 450px Electron screenshot revealed that the native `webChannelChooser` beneath the overlay wraps its three filter tabs into two rows, pushing the Recent tab down and wasting scarce height.
- Under 600px, retain all three native tabs and both layout toggles in a 3-column CSS grid + compact two-button view control, with readable focus states and theme-aware selected color. Do not remove controls or alter filtering behavior.
- Add actual 450px TV screenshot and CDP geometry regression on tab count, one-row alignment, no horizontal overflow and both view controls; CI/build/release pending.

## P5.1.83 — Compact player secondary controls under 600px (batch round 06/20)
- P5.1.82 actual 450px TV screenshot had a tiny 200px video and 160px secondary control panel, with two select dropdowns needlessly stacked despite room for them side by side.
- Grid layout now keeps EPG on its own row, fit + manual backup URL + favorite in a common row. All native controls remain addressable, no state or playlist changes.
- CDP validates same row, usable widths, no overflow and reduced height at actual 450px Electron. Screenshot in `positron-p5-chooser-450-metadata-qa-real.png`; full CI/release pending.

## P5.1.84 — Actionable empty channel sidebar (new batch round 07/20)
- Actual P5.1.83 TV Electron screenshot shows the channel sidebar occupying substantial space with passive no-channel text and no direct action, in contrast to the functional main player CTA.
- When native IPTVState.getChannels() has zero channels, replace only the native no-channel description with a compact title, explanation and real source-management CTA. The existing channel list and all metadata/favorites are untouched. MutationObserver tracks native list re-renders; after importing a playlist, the native list appears normally.
- Add regression and Electron CDP click-to-Sources + restore; screenshots and CI/installer remain pending.

## P5.1.102 — Watch Later multi-word, group and quality-aware search (new 20-round batch 01/20)
- Opened real P5.1.101 screenshot `positron-p51101-watch-later-search-552-real.png`: searching only a contiguous substring cannot find saved `QA Channel 001` with cross-field `main 001`, although native group metadata is present.
- Keep personal bookmarks local; search accent-insensitively across multiple title/group terms, in any order. Do not strip HD, FHD or 4K query tokens as bookmark fingerprints do; punctuation-only input must not accidentally reveal all saved channels.
- Add Node regression for cross-field queries, non-saved exclusions and URL privacy. Add actual Electron screenshot and DOM checks for `main 001`, preserved focus, no auto playback, unchanged local bookmark data.
- Do not count the round complete until the updated CI screenshot is opened and inspected, tests pass, and an immutable P5.1.102 release is verified.

## P5.1.103 — Stop silent Watch Later bookmark eviction at 80 (new batch 02/20)
- Followed the P5.1.102 real `positron-p51102-watch-later-multiterm-552-real.png` screenshot and its saved-list status back into `toggle()`: with 80 saved channels, the 81st was inserted at the front and `compact()` discarded the oldest without warning.
- Preserve all prior bookmarks: refuse a new save at capacity with `{ok:false,reason:'full'}`; existing saved channels may still be removed, and a new channel may be saved after freeing a slot.
- Present a clear local toast and capacity hint, without changing playlist, playback, URLs, or account data.
- Add Node regression for 80-to-81 attempt and removal/retry. Extend native Electron QA with real before/after shots of the 80-bookmark state, checking the 81st 'Lưu' button cannot mutate storage or auto-start video. Release only after screenshot review and all six CI jobs.

## P5.1.104 — Inform about dormant Watch Later bookmarks without deleting them (new batch 03/20)
- Reviewed actual P5.1.103 Electron screenshot `positron-p51103-watchlater-cap-after-real.png`, inspected the strict 80-entry limit and found stored bookmarks for dead/removed channels are silently hidden by `visible()`; users may think saved data vanished.
- Add `unavailable(rows,channels)` to count fingerprints with no currently playable matching native channel, source-scoped and without checking stream URLs externally. UI shows a quiet privacy-preserving note while keeping all bookmarks in localStorage for source recovery. No auto-delete, autoplay or network fetch.
- Add Node regression for dead, missing, wrong-source and blank-URL channels, and native Electron QA under a 552-channel metadata-only dataset. Capture `positron-p51104-watchlater-unavailable-552-real.png`, audit note geometry, unchanged bookmarks and idle player.
- Pending: verify screenshot by opening real PNG and CI release Windows Setup/Portable + Mac DMG before counting.

## P5.1.105 — Explicit two-step cleanup of unavailable bookmarks (new batch 04/20)
- Opened P5.1.104 actual Electron screenshot `positron-p51104-watchlater-unavailable-552-real.png`: status notice tells users a source is unavailable but gives no way to free dormant saved slots while retaining healthy bookmarks.
- Add opt-in details manager. Display only sanitized normalized bookmark keys, never source URL, token or full M3U. On first click change the action to `Xác nhận bỏ` without any data write; on second confirm revalidate that the selected fingerprint is still unavailable before removing only that bookmark from localStorage. Never auto-remove when source is offline.
- Node regression ensures source restored between clicks cannot be mistakenly deleted; native Electron QA checks first-click no deletion, second click exactly one deletion, original available card survives and no stream plays. Screenshot `positron-p51105-dormant-manage-before-real.png` and `-after-real.png`.
- No claim completed until screenshots reviewed and prerelease asset checks pass.


## P5.1.108 / v4.23.192 — Native quota notification clears compact sidebar (new batch 01/20)
- Input: directly opened real P5.1.107 450px Electron screenshot `positron-p51107-chooser-native-svg-450-real.png`: Watch Later quota toast begins near x46 and crosses the 54px icon rail.
- Cause: the shared native `.toast-area` uses right:24px/max-width:380px with no left constraint for the compact sidebar.
- Fix: Positron-only <=600px notification lane left:66px/right:12px; text wraps safely and the visual toast does not intercept taps. Native toast content, timers, IPTV data and playback remain untouched.
- Regression: Node source assertion and real Electron 450px measured sidebar clearance, viewport bounds, overflow and message height. Capture `positron-p51108-toast-clear-of-sidebar-450-real.png`. CI/release/screenshot review must be checked before marking this round complete.


## P5.1.109 / v4.23.193 — Avoid repeated identical native toast notifications (new batch round 02/20)
- Input: P5.1.108 real 450px Electron `positron-p51108-toast-clear-of-sidebar-450-real.png`, directly inspected: two identical quota banners cover the lower channel list during QA. The second banner was introduced by an audit fixture, but the underlying native toast function was independently confirmed to append every identical notification without deduplication.
- Root: native `renderer/app.js` `toast()` creates a new DOM node on every call, with no active-notification key. Repeated user clicks can stack the same error.
- Fix: coalesce only the same text + severity while the previous toast is still mounted. Different messages or severity remain visible; timeout still removes existing toast after 5.5 seconds. Existing IPTV data, local playlist, player, source and accessibility live region are unchanged.
- Regression: Node executes extracted native toast function with a DOM stub to verify same/different messages, severity and expiry, plus native Electron 450px invokes IPTVState.toast twice and captures `positron-p51109-native-toast-dedupe-450-real.png` after asserting exactly one message.
- Status: candidate until GitHub Actions, native screenshot review, immutable release and installers are verified.


## P5.1.110 / v4.23.194 — Unplayed 450px player no longer hides the channel library (new batch round 03/20)
- Input: directly viewed native Electron P5.1.109 screenshot `positron-p51109-native-toast-dedupe-450-real.png`: 552 synthetic metadata-only channels exist, but the empty player consumes a full 203px, pushing their chooser almost below the 820px viewport.
- Root: the 16:9 ratio is applied to the video stage even in idle mode, when no picture must be preserved. P5.1.74 compacted desktop idle stage only above 900px viewport width.
- Fix: when viewport <=600x900 only, compact idle onboarding canvas to 164px, remove decorative empty TV icon on narrow view, tighten text/CTA spacing. Native playback retains original 16:9 stage immediately as soon as the empty illustration hides, and remains untouched at fullscreen or larger screens. No playlist or stream changes.
- Regression: Node guard + real Electron 450px frame height, CTA bounds, channel heading access, aspect after temporarily hiding empty state and restoration; actual image `positron-p51110-compact-idle-player-450-real.png` must be opened and reviewed.
- Status: candidate; full CI, image review and immutable release pending verification.


## P5.1.111 / v4.23.195 — Real one-row channel groups and sticky horizontal position (new batch round 04/20)
- Input: manually inspected P5.1.110 genuine Electron 450x820 screenshot `positron-p51110-compact-idle-player-450-real.png`: 11 popular group buttons spill across three rows above search, making the first channel tiles hard to reach above the fold.
- Root: the native `.web-chooser-chips` flex container wraps under 600px, and `renderGroups()` replaces all buttons (resetting scrollLeft) after every selection.
- Fix: Positron <=600px horizontal overflow strip with native buttons all present + focus accessible; `renderGroups()` saves/restores scrollLeft to prevent jumping to the start after selecting a chip near the right side. Group filtering and playlist never altered.
- QA: Node regression and real Electron 450px single row, scrollable, rightmost selection position retained, search and channel grid higher in viewport, no horizontal document overflow/autoplay. Screenshot `positron-p51111-single-row-chips-450-real.png` must be opened before counting completion.
- Status: candidate until CI/installer assets and screenshot reviewed.


## P5.1.112 / v4.23.196 — Two readable channel cards per row on 450px (new batch round 05/20)
- Input: genuine manually opened P5.1.111 Electron `positron-p51111-compact-filters-450-real.png`: at 450px the grid renders three 100px cards across the content column, each with large generic TV art and a channel name forced onto one truncated line.
- Cause: legacy `web-channel-chooser-v42371.css` uses 80px minimum columns at <=650px and single-line ellipsis for labels, making channel titles hard to identify.
- Fix: narrow <=500x900 unplayed/regular grid (not list mode) uses 2 equal columns with min 145px card width and two-line names; original native channel button, click, logo, pagination, stream logic and responsive desktop layout stay untouched.
- Tests: Node source/assertion + actual Electron 450px measured two-column placement, label wrap, keyboard buttons, no document overflow, no autoplay and real screenshot `positron-p51112-readable-channel-cards-450-real.png` to open/review.
- Release status: candidate until verified full CI, screenshot review and immutable installers.


## P5.1.113 / v4.23.197 — Keyboard-accessible native channel chooser (new batch round 01/20)
- Baseline: manually opened real P5.1.112 Electron 450px screenshot containing three native chooser tabs. Static inspection found role=tablist but no ArrowLeft/ArrowRight/Home/End handler or roving tabindex.
- Fix: preserve original native click-to-select, add directional/Home/End keyboard focus, selected tab only in Tab sequence, aria-controls; Favorites/Recent/channel playback and stored data unchanged.
- Regression: Node assertions + real Electron CDP key presses, focus/selected states, wraparound, no autoplay/overflow, actual screenshot positron-p51113-keyboard-favorites-tab-450-real.png. CANDIDATE until CI, manual review, installer assets verified.

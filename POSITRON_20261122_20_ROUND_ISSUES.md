# Positron — 20 NEW consecutive repair rounds initiated 22 November 2026

Baseline: verified Positron P5.1.107 / v4.23.191 / HEAD `ac4670a51959aef9a9e6917c85495184c460bf1a`, Actions `44925408257` completed. The previous 20-round issues document records a different earlier batch; do not count that batch as work here.

## New round 01/20 — P5.1.108 / v4.23.192 — VERIFIED
- Baseline image: real Electron `positron-p51107-chooser-native-svg-450-real.png` downloaded from the verified CI screenshot artifact and opened for manual examination.
- Symptom: quota error toast extends over the 54px compact icon rail (left around 46px on a 450px window).
- Root cause: inherited `.toast-area` right-aligned 380px width without a left sidebar clearance constraint.
- Source change: `renderer/positron-horizon-v4.css`, Positron <=600px lane, no user-data or stream changes.
- Tests: `tests/positron-p5.test.cjs`, plus measured native Electron QA and `positron-p51108-toast-clear-of-sidebar-450-real.png` after-image in `scripts/positron-20-extension.cjs`.
- Complete only after real CI, user-visible before/after review, immutable release/tag, and artifact verification.

## Rounds 02–20
Not started. Select the next defect only after viewing the current round's after-image and QA output, commit independently and do not count old screenshots as new work.

### CI regression checkpoint (same round 01)
- Run `44928014375`: 693 pass, 9 fail, 5 skipped. All nine failures were stale hardcoded version references in UI labels, tests, and Windows scripts following the version bump; capture/build skipped.
- Second corrective commit updates UI/version labels and Windows expected version without weakening any assertions. Await full CI and real after-image review before counting round 01.

### Completed round 01 evidence
- Final commit `a19d24c9858fba65cabc17c0ef478a861e44b0f1`; immutable release `positron/v4.23.192-p5.1.108`.
- Actions `44928243485` completed 6/6 jobs successfully; Node 702 pass, 5 skipped, 0 fail. Windows x64 Setup/Portable and Mac ARM64/Intel DMG assets verified through Release API.
- Real after-image opened: sidebarRight=56, toastLeft=66, toastRight=438, window width 450. No horizontal overflow and message remains readable. The screenshot revealed duplicate banners in the QA scenario.

## New round 02/20 — P5.1.109 / v4.23.193 — CANDIDATE
- Input: directly opened actual P5.1.108 screenshot `positron-p51108-toast-clear-of-sidebar-450-real.png` with two identical quota banners; one was native and one was QA injected. Native `app.js` also lacks duplicate suppression, verified independently from source.
- Root: `toast(message,type)` always appends a new node, even when same message/type remains visible.
- Fix: suppress same active text+kind, keep independent types and normal 5.5s expiry; no playlist/player changes.
- Acceptance: Node behavior regression, native Electron screenshot `positron-p51109-native-toast-dedupe-450-real.png`, manual opened after-image, unique P5.1.109 version/commit/release and installers.
- NOT VERIFIED: do not count until full workflow and image review succeed.

## New rounds 03–20
Not yet started. Choose each new repair from the preceding real screenshot, with its own tests, version, evidence and immutable release.

## New round 03/20 — P5.1.110 / v4.23.194 — CANDIDATE
- Input: actual manually inspected P5.1.109 450px Electron screenshot `positron-p51109-native-toast-dedupe-450-real.png` (552 synthetic channel metadata, no stream playback); oversized idle video stage pushes channel list down.
- Root: 16:9 video layout still applied when only onboarding illustration is present; desktop-only compact rule does not apply at 450px.
- Fix: narrow <600x900 unplayed stage 174px and scaled onboarding text/CTA; live stage remains original ratio, data untouched.
- Regression Node and native Electron QA + screenshot `positron-p51110-compact-idle-player-450-real.png` with visual review. NOT complete until CI/release verified.

### Completed round 02 evidence
- P5.1.109 commit `1b2c5d4d55f3d60a9ff64f45529aa181d3a9454e`; immutable tag `positron/v4.23.193-p5.1.109`.
- CI Actions `44928941637` succeeded 6/6 jobs; 708 tests (703 pass, 5 skipped, 0 failed). Screenshot manually opened, one error toast displayed. Windows EXE and macOS DMG assets independently verified.

### Same-round CI repair — P5.1.110 (not a new cycle)
- Run `44929563935`: 708 Node tests passed/5 skipped, but native capture failed at the existing P5 450px vector-size test (expected visible SVG width 28px, received 0), caused by initially hiding the decorative icon. No test assertion deleted or relaxed.
- Correction restores visible native 28px SVG in a 44x34px compact container, sets idle stage to 174px to fit title + button, and adds a dedicated Node source regression which was missing from first candidate commit. Repeat CI and real screenshot review; P5.1.110 remains unfinished until immutable release succeeds.

### Completed round 03 evidence
- Positron P5.1.110 / v4.23.194 final commit `75d4acb5bf940eb46ecb868476aca6bda33e99f4`, tag `positron/v4.23.194-p5.1.110`, Actions `44929904122` six green jobs, real after-image opened: idle 174px, live 362x204px (16:9), CTA and original 28px vector intact. Node 709 total/704 pass/5 skipped/0 fail; four Windows/Mac installer assets API-verified.

## New round 04/20 — P5.1.111 / v4.23.195 — CANDIDATE
- Baseline screenshot: actual P5.1.110 native Electron `positron-p51110-compact-idle-player-450-real.png` at 450x820: three rows of category chips push search/channel rows below fold.
- Cause: flex-wrap chips and native renderGroups replaces buttons without saving scrollLeft.
- Planned+implemented candidate: native full set of 11 categories in a single horizontal scroll row and preserve scroll offset across group selection, with no deletion of channels/favorites/TV playback. Test by native 450px screenshot `positron-p51111-single-row-chips-450-real.png`, Node source guard, CI/full release before marking round done.

### Same-round correction for P5.1.111 (do not count as another cycle)
- Run `44930713949`: Node passed and 50 P4 + 20 P5 Electron scenarios passed, but new 450px QA failed `channelGridEarlier`. Single-row chip lane and horizontal position preservation all passed. The native Group/Sort selects were still adding vertical rows under search.
- Correction: keep Group and Sort select elements and behavior intact inside native keyboard-accessible details disclosure, default collapsed <=600px but expanded on larger windows; mobile search and 'Bộ lọc' share one row. Adds real Electron open/collapse checks and additional screenshot `positron-p51111-compact-filters-450-real.png`. No test removed. Repeat CI/review before releasing P5.1.111.

### Completed round 04 evidence
- Positron P5.1.111 / v4.23.195 final commit `ba5a3f4b282ad68a4d5c270fe523935dbf35b00e`, immutable tag `positron/v4.23.195-p5.1.111`, Actions `44931301124` 6/6 success and four EXE/DMG assets API-verified.
- Actual Electron after-image `positron-p51111-compact-filters-450-real.png` manually opened: all category buttons remain horizontal and scrollable, native group/sort disclosure intact, search and first channel row visible, no overflow. Earlier capture failure was corrected in the same round.

## New round 05/20 — P5.1.112 / v4.23.196 — CANDIDATE
- Baseline: genuine manually opened P5.1.111 450px screenshot: channel cards are three very narrow tiles, with title truncation.
- Cause: original 80px grid min size + one-line ellipsis under 650px.
- Fix candidate: two readable columns, two-line names at <=500px width, only grid display; preserves list mode and playback. Require real Electron screenshot review and own immutable release/CI before counting round.


## Separate file-triggered new 20-round batch, round 01/20 — P5.1.113 / v4.23.197 — CANDIDATE
- Baseline: directly opened real P5.1.112 Electron 450px screenshot positron-p51111-compact-filters-450-real.png; three tabs visible.
- Root: role=tablist uses mouse click only, lacks standard keyboard arrows/Home/End and roving tabindex.
- Fix: keyboard navigation and accessible focus/selected state, original data and stream behavior untouched.
- Before: P5.1.112 real screenshot above. After: pending native Electron screenshot positron-p51113-keyboard-favorites-tab-450-real.png and manual review.
- Pre-baseline correction: workflow-only commit 50a2f2e24710e1727b7fe6a31273cc2808bc30d0 corrected P5.1.112 photo filename typo; not a separate version/round.
- Status: P5.1.113 CANDIDATE, count only once real CI, screenshot review and release succeed. Earlier rounds from prior batches are not counted.


## Separate file-triggered batch round 02/20 — P5.1.114 / v4.23.198 — CANDIDATE
- Input: actual P5.1.113 Electron 450px screenshot manually opened; Favorites selected, 552 channels present, generic incorrect no-results text and useless 1/1 pager.
- Root in renderer/web-channel-chooser-v42371.js: no results do not differentiate no favorites/no recent from search mismatch; unconditional pager.
- Fix: contextual empty states, action back to all channels, hide unneeded pager and maintain screen-reader keyboard focus; no playlist edits or autoplay.
- Before: positron-p51113-keyboard-favorites-tab-450-real.png. After candidate: positron-p51114-favorite-empty-action-450-real.png.
- Status: count after successful real Electron screenshot QA and release. Preserve prior version as immutable.


## Separate file-triggered batch round 03/20 — P5.1.115 / v4.23.199 — CANDIDATE
- Input: manually opened actual P5.1.114 Electron 450px screenshot, redundant empty Favorites description in right side stack below contextual main empty state.
- Root in renderer/web-channel-chooser-v42371.js: renderSide() always appends empty mini list on active same tab even with zero items.
- Fix: hide only duplicate empty mini sidebar for compact <=650px view while active in Favorites/Recent; always retain on All and when nonempty.
- Before: positron-p51114-favorite-empty-action-450-real.png. Candidate after: positron-p51115-no-duplicate-favorite-450-real.png; direct image review mandatory.
- Status: CANDIDATE, cannot count unless real Electron QA and release success.


## Separate file-triggered batch round 04/20 — P5.1.116 / v4.23.200 — CANDIDATE
- Input: manually opened real P5.1.115 screenshot 450px with category chips VTV/VTC/HTV/K+ despite no matching category in original 552 QA channel group titles.
- Root: renderer/web-channel-chooser-v42371.js renderGroups() displays every preset whenever any channels exist, clicking missing one resets to All; click rerenders and loses keyboard focus.
- Fix: show only imported groups, no phantom K+, preserve quick-chip focus and aria pressed, TH specific matching. Metadata-only QA category fixture preserves older horizontal scrollbar tests without licensed streams.
- Before P115: positron-p51115-no-duplicate-favorite-450-real.png. Candidate after P116: positron-p51116-real-category-filter-450-real.png.
- Status: CANDIDATE pending tests/image/release, prior releases unchanged.


## Separate file-triggered batch round 05/20 — P5.1.117 / v4.23.201 — CANDIDATE
- Input: directly opened P5.1.116 screenshot at 450px, a single filtered VTV channel occupies a short, narrow card in the left half of a two-column library.
- Root in renderer/positron-horizon-v4.css: responsive 2-column grid does not adapt for one result/page.
- Fix: :only-child channel fills full row and aligns logo/title horizontally at <=500px; preserves many-result grid, list mode and play button.
- Before: positron-p51116-real-category-filter-450-real.png; candidate after: positron-p51117-single-result-wide-card-450-real.png.
- Status: CANDIDATE until independently checked screenshot/CI/release.


### Verified previous round P5.1.116
- P5.1.116 / v4.23.200 final HEAD `68bf5505bc72a73853284574dc3106bfad7e9973`; immutable release `positron/v4.23.200-p5.1.116` and GitHub Actions `44934384750` with 6/6 jobs success.
- Node 716 tests: 711 passed, 5 skipped, zero failed. True Electron 450px screenshot `positron-p51116-real-category-filter-450-real.png` manually opened; 10/10 category checks passed with no playback and no horizontal overflow. Windows Setup/Portable x64 and Mac Intel/ARM64 release assets API-verified.


## Separate file-triggered batch round 06/20 — P5.1.118 / v4.23.202 — CANDIDATE
- Input: manually opened genuine P5.1.117 450px Electron screenshot: readable single VTV tile contains only click-to-play and no direct Favorite control; P114 Favorites empty state guides user to press star, but card has no star.
- Root: renderer/web-channel-chooser-v42371.js channelCard creates just one Play button; Favorites toggle only attached to active player in renderer/app.js.
- Fix: native sibling star button and semantic pressed state directly on main card with favorites-core toggle, store.save/rollback, app.render/notifications, no stream playback; retain mini-card native play, P117 full-width and multi-column layouts.
- Before: positron-p51117-single-result-wide-card-450-real.png; candidate after: positron-p51118-direct-favorite-channel-450-real.png.
- Status: CANDIDATE; validate Node+Electron+opened PNG+release before counting as 06/20.

### Round 05 verified
- P5.1.117 HEAD `15a29463a11da0679caa367515362c74bfec8029`, immutable tag `positron/v4.23.201-p5.1.117`, CI `44934939463` success 6/6. Node 717: 712 pass, 5 skipped, zero fail. Actual Electron image opened, 9/9 new layout assertions true; four binary assets verified.


## Separate file-triggered batch round 07/20 — P5.1.119 / v4.23.203 — CANDIDATE
- Input: genuine P5.1.118 Electron 450px screenshot manually opened; a starred VTV QA tile and toasts are shown, but the Favorites tab does not indicate saved count.
- Root: renderer/web-channel-chooser-v42371.js replaces tab icon children once at startup and never renders a Favorites count in native tab state.
- Fix: badge added after vector-icon pass, updated via favoritesList() each render, aria-label count and hidden at zero; scoped CSS pill overlay avoids narrowing mobile tabs.
- Before: positron-p51118-direct-favorite-channel-450-real.png; candidate after: positron-p51119-favorite-count-badge-450-real.png.
- Status: CANDIDATE, not countable without CI + real image inspection + binary release.

### Round 06 verified
- P5.1.118 HEAD `9751d3c02c2a293c63301f066b16b079a2d884ff`, release `positron/v4.23.202-p5.1.118`, Actions `44935525440` 6/6 success. Node 718 tests 713 pass/5 skipped/0 fail; real Electron screenshot opened and 13/13 new assertions pass. Windows Setup/Portable & macOS Intel/ARM assets present.

## File-triggered new batch 01/20 — P5.1.120 / v4.23.204 — CANDIDATE
- Directly opened real P5.1.119 450x820 Electron screenshot: three green success toasts overlap channel grid.
- Root: distinct notifications all stack on compact viewport; old native dedupe handles only identical messages.
- Fix: scoped <=600px success-toast selector; latest success visible; warnings/errors, native timers and persisted user data unchanged.
- Before: `positron-p51119-favorite-count-badge-450-real.png`; after candidate `positron-p51120-compact-toast-stack-450-real.png`.
- Acceptance: Node tests, actual Electron screenshot geometry, manual opening, independent version/commit and six CI jobs, verified release binaries.
- Not counted until all evidence is verified.

## File-triggered new batch 02/20 — P5.1.121 / v4.23.205 — CANDIDATE
- Input: directly opened actual P5.1.120 `positron-p51120-compact-toast-stack-450-real.png`, with latest single success notification still obscuring a card without manual dismissal.
- Root: native toast function removes notices only after 5.5 seconds, no close control. Do not alter native persistence or timers.
- Fix: separate Positron-only observer appends accessible 32px close buttons, focusable for keyboard users. Desktop and mobile both supported; warnings/errors retain their severity.
- Native 450px image and QA: `positron-p51121-toast-dismiss-visible-450-real.png`, button click and Enter dismiss, hit-target, focus/ARIA, no overflow. Node guard.
- Before: P5.1.120 Electron PNG; after pending real screenshot. Not countable without CI, image review, release assets.

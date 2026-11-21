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
- Fix: narrow <600x900 unplayed stage 164px and scaled onboarding text/CTA; live stage remains original ratio, data untouched.
- Regression Node and native Electron QA + screenshot `positron-p51110-compact-idle-player-450-real.png` with visual review. NOT complete until CI/release verified.

### Completed round 02 evidence
- P5.1.109 commit `1b2c5d4d55f3d60a9ff64f45529aa181d3a9454e`; immutable tag `positron/v4.23.193-p5.1.109`.
- CI Actions `44928941637` succeeded 6/6 jobs; 708 tests (703 pass, 5 skipped, 0 failed). Screenshot manually opened, one error toast displayed. Windows EXE and macOS DMG assets independently verified.

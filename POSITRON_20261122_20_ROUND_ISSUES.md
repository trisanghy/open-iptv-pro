# Positron — 20 NEW consecutive repair rounds initiated 22 November 2026

Baseline: verified Positron P5.1.107 / v4.23.191 / HEAD `ac4670a51959aef9a9e6917c85495184c460bf1a`, Actions `44925408257` completed. The previous 20-round issues document records a different earlier batch; do not count that batch as work here.

## New round 01/20 — P5.1.108 candidate; NOT VERIFIED until release + screenshot review
- Baseline image: real Electron `positron-p51107-chooser-native-svg-450-real.png` downloaded from the verified CI screenshot artifact and opened for manual examination.
- Symptom: quota error toast extends over the 54px compact icon rail (left around 46px on a 450px window).
- Root cause: inherited `.toast-area` right-aligned 380px width without a left sidebar clearance constraint.
- Source change: `renderer/positron-horizon-v4.css`, Positron <=600px lane, no user-data or stream changes.
- Tests: `tests/positron-p5.test.cjs`, plus measured native Electron QA and `positron-p51108-toast-clear-of-sidebar-450-real.png` after-image in `scripts/positron-20-extension.cjs`.
- Complete only after real CI, user-visible before/after review, immutable release/tag, and artifact verification.

## Rounds 02–20
Not started. Select the next defect only after viewing the current round's after-image and QA output, commit independently and do not count old screenshots as new work.

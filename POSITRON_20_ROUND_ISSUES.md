# Positron — New 20-round issue register

Baseline: `Positron` SHA `937db5120885efefe32c62fe3a9476601e76955c`, P5.1.105 / app 4.23.189; Actions #44921869316 success. Read P5.1.105 genuine Electron screenshot ZIP.

## Round 01 — P5.1.106 (candidate)
- Before: `p5-20-rounds/positron-watchflow-1360-night-real.png` from P5.1.105.
- Symptom: compact empty-source WatchFlow has a horizontal scrollbar.
- Code root cause: -18px sticky header side margins differ from 15px compact-dialog padding.
- Fix: match header inset, add strict DOM overflow assertion and real screenshot.
- After: `positron-p51106-empty-watchflow-no-horizontal-scroll-real.png` required from new CI.
- State: awaiting CI pass, screenshot opening and verification.

## Discovery backlog (not yet verified bugs)
- WatchFlow modal and actual video playback overlap; narrow window card actions; keyboard focus; Favorites and Watch Later, Cast/PiP, Sources/EPG/Doctor responsive. Pick each future round from real previous screenshot and code evidence.

# POSITRON — CHECKPOINT P5.1.347, đợt 20 vòng mới

- Baseline: P5.1.346 / package 4.23.431, HEAD 8219f309f3a385295833f862fdca41a123ba4bf2; stable-only Release job disabled.
- Real baseline evidence: fast Electron workflow 45283577787, artifact 14870058226 (4 genuine screenshots, 1920×1080 and 720×900).
- Full workflow 45283577752 failed after P344: `scripts/positron-345-audit.cjs` awaited an AI panel that F6 intentionally would not open from the focused search editor. The full job failed; Windows/macOS build jobs succeeded but Release was skipped.
- P347 planned correction: focus real TV WatchFlow opener before F6 in P345; AI shortcut overlay closes when a mode is chosen; add independent Electron screenshots at 1920×1080 and 720×900, pointer and remote Enter checks.
- Acceptance: npm test green, P345→P346→P347 full serial capture, P347 before/after images directly reviewed, zero playlist/current channel/local model mutation.
- 20-round progress: do not count P347 until successful CI evidence and direct screenshot inspection. Never claim future rounds completed in advance.

- P347 first CI run 45285958995: 1061 pass, 8 fail, 5 skipped; stale version labels/changelog and evidence declarations must be corrected (assertions unchanged).
- P347 fast native Electron run 45285958935: expanded keyboard help intercepted mode pointer input; outside-pointer dismissal is now directly tested instead of using forced hidden clicks.

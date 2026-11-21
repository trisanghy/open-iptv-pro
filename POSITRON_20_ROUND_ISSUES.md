# Screenshot-driven Positron next 20 · 2026-11-21
Baseline: P5.1.7 (Electron 4.23.91), HEAD `72582484b91aca7c14f0e0665831c2d9b2be30e9`, Actions https://github.com/trisanghy/open-iptv-pro/actions/runs/44847464628, artifact 14683472397.
Do not confuse P5's historical 20 screenshot cases with new independent repair rounds.

| Round | Label | Real screenshot input | Symptom and root cause | QA evidence | Status |
| --- | --- | --- | --- | --- | --- |
| 01/20 | P5.1.8 / v4.23.92 | P5.1.7 `positron-p5-20-real.png` at 600px and `positron-p5-09-real.png` at 450px | Theme control duplicated ◈ and long label despite compact CSS; insufficient selector specificity | New computed font-size, width, pseudo content and accessibility assertions on actual Electron | CI/visual review pending |

Round is not certified until new screenshot has been opened and reviewed, tests and release assets succeed, and the user receives the before/after report. Continue next round using the actual P5.1.8 screenshot, not a synthetic preview.

### Round 01 verification follow-up
First P5.1.8 test run https://github.com/trisanghy/open-iptv-pro/actions/runs/44850968811 failed four **version synchronization regressions**: `tests/positron.test.cjs` expected 4.23.91, the visible `renderer/index.html` badge was stale, and `BUILD_WINDOWS.bat` plus `scripts/BUILD_WINDOWS_AUTO.ps1` still identified 4.23.91. Fixed all sources to actual 4.23.92 without relaxing test assertions. Must retest full CI and screenshot before marking the same round complete.

| 02/20 | P5.1.9 / v4.23.93 | P5.1.8 `positron-p5-20-real.png` Favorites 600px | Empty state offers no actionable route to manage or activate a source | Add keyboard-focusable native button, test actual Electron click destination | CI and after-image review pending |

| 03/20 | P5.1.10 / 4.23.94 | P5.1.9 `positron-p5-20-real.png` Favorites at 600px | Generic empty-state copy tells first-time users to "re-add" an old source when source count is zero | Source-aware text node with MutationObserver; screenshot text validation and regression test | CI/after-image review pending |

| 04/20 | P5.1.11 / 4.23.95 | P5.1.10 `positron-p5-09-real.png` TV at 450px | Next EPG title is visibly cut with `...`, from inherited nowrap/ellipsis | Mobile text wraps; computed-style + geometry checks in real Electron, screenshot review | CI/release pending |

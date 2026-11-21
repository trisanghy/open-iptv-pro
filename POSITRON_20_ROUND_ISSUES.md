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

| 05/20 | P5.1.12 / 4.23.96 | P5.1.11 real `positron-p5-18-real.png` Settings 1360px + TV 450px | Search command label ellipsized and icon glyph unclear | Concise label, real SVG, full ARIA and click regression in Electron | CI/after-image review pending |

| 06/20 | P5.1.13 / 4.23.97 | P5.1.12 `positron-p5-18-real.png` Settings 1360px | Sidebar status clips the FFmpeg readiness message after `đ...` | Scoped multiline status + tooltip; real screenshot and DOM height test | Screenshot/CI/release pending |

## NEW 20-round user-file batch · starts from P5.1.13

| Batch round | Version | Real prior screenshot issue | Root cause / code action | Validation |
|---|---|---|---|---|
| 01/20 | P5.1.14 / 4.23.98 | Sources 720px `positron-p5-15-real.png`, P5.1.13, unlimited scope name clipped | Native option text too long; short selected label preserving `value=all` | New real Electron metrics and screenshot, Node test, CI/release pending |

| 07/20 | P5.1.15 / 4.23.99 | Latest P5.1.14 `positron-p5-19-real.png` Doctor 1360px | Six zero metrics are dead end for users without playlists | Conditional Doctor hint, direct source button, real Electron click test | CI/release pending; external P5.1.14 preserved |
| 02/20 | P5.1.16 / 4.23.100 | P5.1.15 TV 450px screenshot retains OS glyph `◖))` | Replace label content with vector SVG; preserve input linkage | New screenshot/DOM assertion, Node test, CI pending |
| 03/20 | P5.1.17 / 4.23.101 | P5.1.16 real TV 450px screenshot: Cast/AirPlay and PiP use tiny square glyphs | Replace icon glyphs with inline SVG inside existing buttons, retain events and labels | Node + real Electron screenshot icon/label/ARIA assertions, CI pending |
| 04/20 | P5.1.18 / 4.23.102 | Real P5.1.17 Favorites 600px status text almost invisible and ellipsized | Fix footer low-contrast foreground and narrow hidden-dock grid, allow status wrapping | Real Electron 4.5:1 contrast + overflow tests; CI pending |
| 05/20 | P5.1.19 / 4.23.103 | P5.1.18 desktop TV screenshot shows channel search but keyboard handler steals `/` to global palette | Route `/` to visible TV channel search, preserve Ctrl/⌘+K palette | Actual Electron keydown test and focus screenshot; CI pending |
| 06/20 | P5.1.20 / 4.23.104 | P5.1.19 Linux Electron TV 1360px screenshot displays Mac-only `⌘ K` shortcut hint | OS-aware shortcut text and tooltip, keep actual Ctrl/Meta+K events | Electron screenshot computed platform + ARIA checks; CI pending |

## Independent new 20-round batch from P5.1.20
| Round | Version | Prior actual screenshot | Cause / change | Status |
|---|---|---|---|---|
| 01/20 | P5.1.21 / 4.23.105 | P5.1.20 Electron positron-p5-09-real.png TV 450px | Selected native stream link is clipped by three-control narrow row; make stream select full width below Fit / Favorites | Code and Node/real Electron assertions prepared, screenshot after / CI / release not yet verified |

Do not credit the round until the new Electron PNG has been opened and inspected and CI/release outcome reported. GitHub workflow release currently blocked by HTTP 403.

| 02/20 | P5.1.22 / 4.23.106 | P5.1.21 actual Electron TV 450px screenshot | Static square pseudo-element obscures focus mode state; replace with stateful SVG while retaining native click/ARIA | Code + Node + Electron state assertions staged; after-image/release pending |

Round 01 P5.1.21 verified: Node, Electron capture, mac x64/arm64, Windows x64 and GitHub Release 6/6 success; https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.105-p5.1.21

| 03/20 | P5.1.23 / 4.23.107 | P5.1.22 Sources 720px screenshot | 30px each-side empty-state padding plus 24px source section margin produce excessive empty gap; scope compact spacing to no-playlist state | Source-only responsive CSS plus Electron geometry assertions; CI/release pending |
Round 02 P5.1.22 verified: 6/6 Actions success and immutable Release https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.106-p5.1.22

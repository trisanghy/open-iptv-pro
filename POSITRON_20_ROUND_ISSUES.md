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

| 04/20 | P5.1.24 / 4.23.108 | P5.1.23 actual Electron EPG 720px | Orange OS DVR emoji inconsistent with Positron monochrome icons; replace decorative heading glyph with state-preserving SVG | Node + real Electron EPG assertions, after-image/CI/release pending |
Round 03 P5.1.23 real screenshot review: Sources 720px empty guidance measured 43px high and 12px gap to Smart Discovery, no-source-only CSS. Build/release outcome tracked in Actions run 44858148055.

| 05/20 | P5.1.25 / 4.23.109 | P5.1.24 real EPG 720px | DVR channel select blank and interactive with no playlist, no guidance | Auto disable with placeholder, re-enable on real option updates; Electron DOM lifecycle test; CI pending |
Round 04 verified in actual Electron: DVR heading is monochrome SVG 20px with aria-hidden true at EPG 720/1360, CI 6/6 succeeded and release https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.108-p5.1.24

## Batch opened by self-running file (7) · from P5.1.25
| Round | Next version | Real previous-screen input | Problem / repair | Evidence |
| --- | --- | --- | --- | --- |
| 01/20 | P5.1.26 / v4.23.110 | P5.1.24 Electron Doctor 1360px (same Doctor code/state at P5.1.25), artifact 14688244941 | Zero metrics but three analysis actions active; non-destructive disable/reenable on navCount | New Node tests and Electron lifecycle screenshot audit; pending CI and after-image review |

| 02/20 | P5.1.27 / v4.23.111 | P5.1.26 real Electron Doctor 1360px, artifact 14688743177 | 'Kiểm tra link sâu' still enabled with zero channels, omitted from first guard | Extend guard to fourth native action; test disabled, accessibly described, and re-enabled on channel change |

| 03/20 | P5.1.28 / v4.23.112 | P5.1.27 Sources 1360px PNG, artifact 14689552049 | Empty no-playlist region is 83px high with 30px padding and 24px Discovery gap; desktop omitted from P5.1.23 compact CSS | Desktop-only :has(>.empty-list) rule; Node + real Electron geometry assertions; CI/release pending |

| 04/20 | P5.1.29 / v4.23.113 | P5.1.28 Sources 1360px screenshot, artifact 14689292042 | 'Trạng thái' filter label wraps on desktop because flex shrink competes with search width | No-wrap/auto flex basis scoped to status filter; test real text range lineRects=1 at Sources views |

| 05/20 | P5.1.30 / v4.23.114 | P5.1.29 EPG 1360px real screenshot, artifact 14689795888 | DVR selector disabled at 0 channels while submit still bright/clickable; P5.1.25 disabled only selector | Disable button in same observer; reenable when channel option added; regression Electron 720/1360 |

| 06/20 | P5.1.31 / v4.23.115 | P5.1.30 real Electron TV 450px, artifact 14690060103 | Compact tools disclosure says English Timeshift while settings use Tua lại | Change hardcoded label+tooltip; test native toggle and screenshot 450px |

| 07/20 | P5.1.32 / v4.23.116 | P5.1.31 real TV 450px, artifact 14690160671 | Compact Studio button still relies on OS-specific '◈' pseudo-element | Replace with half-circle theme SVG, keep click/menu and verify real viewport, ARIA |

| 08/20 | P5.1.33 / v4.23.117 | P5.1.32 TV 450px screenshot, artifact 14689029565 | Favorite star appears enabled without selected channel | Guard via native IPTVState.getCurrent, reenable on selection changes; Electron 450 QA |

## New file (8) batch · resumes after P5.1.33
| Batch round | Version | Actual screenshot input | Observed issue | Scope and validation |
| --- | --- | --- | --- | --- |
| 01/20 | P5.1.34 / 4.23.118 | P5.1.32 real Electron Aurora EPG 1360px (`positron-p5-16-real.png`, artifact 14689029565); P5.1.33 only changed TV favorite control | No-channel `Đặt lịch ghi` disabled but vivid teal/looks enabled | Scope neutral disabled CSS; retain native logic; Node test and actual Electron computed color/opacity/cursor screenshot audit; pending CI/after-image review |

| 02/20 | P5.1.35 / 4.23.119 | P5.1.34 real Electron EPG Aurora 1360px `positron-p5-16-real.png`, artifact 14690910182 | Disabled DVR button is now neutral, but its leading record glyph still depends on OS emoji/font | Preserve native submit event; inject accessible currentColor SVG and assert real EPG 720/1360 screenshot + live DOM; CI/release pending |

| 03/20 | P5.1.36 / 4.23.120 | P5.1.35 Electron EPG 1360 and 720px screenshot, artifact 14690880372 | `Nhập tên chương trình...` guidance dim almost invisible on dark surface; legacy result text style | Scoped current theme ink for #epgSearchResults; real screenshot DOM computed color/luma/font tests and Node regression, awaiting CI/release |

| 04/20 | P5.1.37 / 4.23.121 | P5.1.36 actual Electron TV at 450px, `positron-p5-09-real.png` from artifact 14690358283 | Zero channels but native Play still vivid and clickable, leads only to no-playlist warning | Apply non-destructive empty guard to original Play button, re-enable via navCount observer; Electron click/state + computed disabled style tests, pending CI/release |

P5.1.37 capture run 44863007302: **FAILED at real TV 450px** after all 50 P4 cases and P5 rounds 1–8 passed. Assertion `empty Play still looks active`. Root cause is legacy `#page-tv .player-control-card .controls.transport-controls #playBtn { opacity:1!important }` winning the first lower-specificity disabled rule. In-round corrective commit increases only the Positron disabled-state selector specificity and adds regression; rerun current version before certifying.

| 05/20 | P5.1.38 / 4.23.122 | P5.1.37 corrected actual TV 450px `positron-p5-09-real.png` artifact 14690836496 | Prev, Stop and Next still look active in a zero-channel state while Play now correctly disabled | Guard zero-source navigation and no-current Stop; preserve native actions; dynamic count lifecycle and computed opacity assertions, CI/release pending |

| 06/20 | P5.1.39 / 4.23.123 | P5.1.38 actual Electron TV 450px screenshot `positron-p5-09-real.png` artifact 14690444645 | Cast/AirPlay and PiP still active with zero selected channels; Cast native handler only shows warning | Preserve original buttons and SVGs, disable only while `getCurrent()` is empty; restore on current title/media state update; real CSS/DOM checks, pending CI/release |

| 07/20 | P5.1.40 / 4.23.124 | Actual P5.1.39 Electron TV 450px screenshot, artifact 14690383363 | A large purple Play glyph is visually treated as an active button in the empty TV placeholder, contradicting disabled transport | Replace decorative glyph with neutral non-interactive monitor SVG, keep native import actions/player unchanged; screenshot and DOM regression pending |

| 08/20 | P5.1.41 / 4.23.125 | P5.1.40 real Settings Electron 1360px `positron-p5-18-real.png` artifact 14691385846 | Logged-out account card dominates 300+px screen height, pushing settings accordions out of view | Scope only desktop logged-out account card, compress spacing not field/button targets; real panel height and 44px target checks pending CI/release |

| 09/20 | P5.1.42 / 4.23.126 | P5.1.41 actual Electron Doctor 1360px `positron-p5-19-real.png`, capture artifact 14691221839 | `Chẩn đoán ngay` / `Phân tích` remain bright beige in no-source state though disabled; native btn-primary fill overrides intended state | Scope four guarded Doctor operations to neutral disabled skin; actual Electron DOM color/luma and Node regression pending CI/release |


## File (9) new repair batch from P5.1.43
| Round | Next version | Real screenshot input / observed issue | Changed behavior | Validation |
| --- | --- | --- | --- | --- |
| 01/20 | P5.1.43 / v4.23.127 | P5.1.41 Sources 720px (preserved in P5.1.43): iptv-org/country/VN preselected yet initial status says select collection | Honest first-use instruction with native selections intact | Node + real Electron audit to run; GitHub release 403 unresolved |

P5.1.43 same-round CI follow-up: Actions run 44864848127 failed native-language audit 2/606. Corrected all 16 translations in renderer/i18n.js and added regression. Round remains UNCERTIFIED until new test+capture+image review succeed; Release 403 is an independent blocking issue.\n
| 10/20 (file 8) | P5.1.44 / 4.23.128 | Actual P5.1.43 Electron Favorites 600px `positron-p5-20-real.png` artifact 14691567509 | Empty guidance/CTA at y230–320 with >450px unused below | Center only Favorites empty state on narrow windows, preserve original CTA/list; audit on screenshot position and footer clipping. Also rectify release tag P5.1.43 workflow inconsistency in new version. Await CI/capture/release. |

| File (9) round | Version | Real screenshot input | Problem | Fix | Validation |
|---|---|---|---|---|---|
| 02/20 (pending) | P5.1.45 / v4.23.129 | P5.1.44 EPG 720px, positron-p5-17-real.png | Empty EPG status points to Settings update instead of the visible Nguồn EPG button | Align fallback text, all 17 offline locales, snapshot assertion | Pending CI and after PNG; release 403 blocked |

| File (9) round | Version | Real screenshot input | Problem | Fix | Evidence status |
|---|---|---|---|---|---|
| 03/20 (pending) | P5.1.46 / v4.23.130 | P5.1.45 EPG 720px / 1360px, positron-p5-17-real.png / positron-p5-16-real.png | Disabled recording scheduler form occupies guide space when no sources | Conditional collapse and restore on channel option, keep folder/history; Source shortcut | Pending 17-locale Node regression, real screenshots, CI build/release |

Release integrity note: v4.23.129 was released under mismatched tag positron/v4.23.129-p5.1.44 (GitHub Actions run 44866076196). Never relabel or overwrite that immutable tag; P5.1.46 explicitly validates its own tag against SemVer and P-label.

P5.1.46 CI attempt 44866650681: 604 pass / 2 failed / 5 skipped; failures were stale hardcoded historical test expected tag/badge. Fixed test to derive P-label from package manifest (same version, new SHA), pending re-run.

| File (9) round | Version | Screenshot input | Observed bug | Source repair | Required evidence |
|---|---|---|---|---|---|
| 04/20 (pending) | P5.1.47 / v4.23.131 | P5.1.46 real Electron EPG 720px + 1360px | DVR says Ready to Schedule with no channels | Hide only idle-ready copy, restore when channels return; never hide error/active recording statuses | Node test, screenshot, live DOM transitions, build and correct Release |

| File (9) round | Version | Screenshot input | Actual root-cause issue | Fix | Required verification |
|---|---|---|---|---|---|
| 05/20 (pending) | P5.1.48 / v4.23.132 | P5.1.47 EPG 1360px guide footer | Zero-channel case wrongly asks users to repair M3U tvg-id and XMLTV mappings | Detect missing channel list and show correct import hint, preserving true mapping-error text | Node i18n/renderer test, real after PNG + release |

| File (9) round | Next version | Real screenshot | Defect | Repair | Verification status |
|---|---|---|---|---|---|
| 06/20 (pending) | P5.1.49 / v4.23.133 | P5.1.48 EPG 1360px + 720px | Reload EPG appears actionable with 0 IPTV channels and only yields a warning | Guard no-channel reload button; auto-reenable on channel arrival; leave EPG sources accessible | Pending CI + images + release |


| HORIZON redesign | P5.1.56 / v4.23.140 | Actual P5.1.55 TV 1360px screenshot and capture failure in run 44872760322 | Entire information hierarchy and visual token system fragmented across layered CSS, video competes with navigation and tools, no guided viewing; persisted expanded rail incorrectly rejected by QA | New last Horizon CSS, 6-mode local WatchFlow choosing real enabled channels with evidence, category and novelty; Node regression and real Electron screenshots, release pending verification |

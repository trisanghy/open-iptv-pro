# Screenshot-driven Positron next 20 · 2026-11-21
Baseline: P5.1.7 (Electron 4.23.91), HEAD `72582484b91aca7c14f0e0665831c2d9b2be30e9`, Actions https://github.com/trisanghy/open-iptv-pro/actions/runs/44847464628, artifact 14683472397.
Do not confuse P5's historical 20 screenshot cases with new independent repair rounds.

| Round | Label | Real screenshot input | Symptom and root cause | QA evidence | Status |
| --- | --- | --- | --- | --- | --- |
| 01/20 | P5.1.8 / v4.23.92 | P5.1.7 `positron-p5-20-real.png` at 600px and `positron-p5-09-real.png` at 450px | Theme control duplicated ◈ and long label despite compact CSS; insufficient selector specificity | New computed font-size, width, pseudo content and accessibility assertions on actual Electron | CI/visual review pending |

Round is not certified until new screenshot has been opened and reviewed, tests and release assets succeed, and the user receives the before/after report. Continue next round using the actual P5.1.8 screenshot, not a synthetic preview.

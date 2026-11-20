# Positron P3: 20 independent engineering iterations

Base: Positron P2 `fcd1b3b69a464ada1429654c32f9e2bf04a9023a`, originally derived from Electron v4.23.76. All 20 iterations are chained as independent commits and introduced only to the `Positron` branch.

| Iteration | Change |
|---|---|
| 01 | Introduce three semantic palette-token sets: Nebula, Aurora and Graphite |
| 02 | Increase toolbar hierarchy and simplify visual focus |
| 03 | Correct sidebar navigation states and keyboard focus indicators |
| 04 | Prioritize the real video pane and eliminate unused side space |
| 05 | Repair channel search contrast, filters and channel shelf |
| 06 | Unify transport controls, player state and secondary actions |
| 07 | Harmonize cards on settings, source, EPG and diagnostics pages |
| 08 | Improve command palette color, list selection and readable labels |
| 09 | Reflow the actual video above channels at narrow widths |
| 10 | Style Studio's palette menu and honor reduced-motion preferences |
| 11 | Build a functional three-option theme chooser |
| 12 | Persist and restore Positron palette in namespaced localStorage |
| 13 | Add escape, click-away, and arrow-key handling to theme chooser |
| 14 | Update workspace title based on actual active page |
| 15 | Add guarded Alt+1–5 shortcuts for core navigation |
| 16 | Trap keyboard focus inside the existing command-search dialog |
| 17 | Add ARIA combobox, active descendant and expanded semantics |
| 18 | Display actual channel and source counts (not mock values) |
| 19 | Add theme cycling shortcuts and a visible reset action |
| 20 | Close overlays on fullscreen, annotate focus mode hotkey |

## Validation
- Run all existing `npm test` regression tests and new Positron Studio tests.
- Run the **previous 20 real Electron UI rounds** plus **20 new rounds** covering palette changes, keyboard navigation, combobox state and non-overlapping video geometry.
- Verify persisted palette through actual renderer reload. Capture images for all three color palettes and a narrow viewport.
- Build three actual installer outputs: Mac ARM64, Mac x64 and Windows x64 (Setup and Portable), and check Release assets on GitHub.

## Out of scope
No network streams or protected broadcasts are injected into the QA environment. Network transport, GPU decoding quality and platform-specific video smoothness must still be verified using an authorized real playlist on target devices. These tests do not claim complete WCAG 2.2 conformance.

## References
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Dialog Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Electron security recommendations: https://www.electronjs.org/docs/latest/tutorial/security

## P3.1 follow-up fix
After visually inspecting screenshots from all three themes, corrected the inherited Electron high-specificity neon-green Play and volume styles, switched transport glyphs to monochrome, and added per-theme computed-style assertions in the actual Electron UI rounds. The 20 improvement commits above are preserved; this fix is a separate follow-up, not counted as one of those 20 iterations.

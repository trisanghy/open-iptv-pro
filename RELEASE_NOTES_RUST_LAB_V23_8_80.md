# Rust Lab v23.8.80 — Restore Video Enhancement toggle beside CC

## Fixed
- The enhancement script loaded before `unified-ai-inline-v1.js` created `#unifiedAiToggle`. On `DOMContentLoaded`, the enhancement initializer exited and never retried. Register both renderer-ready and unified-AI-ready lifecycle hooks, and dispatch a dedicated unified-AI-ready event after the original CC button is mounted.
- New AI toggle appears immediately beside **Phụ đề · Dịch · Giọng nói** (not inside its panel), with matching 32px height and responsive wrapping on narrow windows.
- Either section can be expanded via its own button. Expanding one collapses the other so controls do not pile up. By default both remain collapsed and the AI panel has no outer banner/border.

## Verification
- Regression test emulates DOMContentLoaded preceding the asynchronously emitted renderer-ready event, verifies button insertion order, idempotence, the two expand/collapse flows, and CSS panel border removal.
- Preserves native PiP and existing Caption / Translate / TTS logic without cloning or modifying their live DOM controls.

## Not implemented
- Live neural AI super-resolution (1080p/1440p/2160p) remains unavailable. Hardware capability query is informative only. Existing FFmpeg motion interpolation is unchanged by this patch.

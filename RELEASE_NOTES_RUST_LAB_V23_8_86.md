# Rust Lab v23.8.86 — Fix huge blank area after expanding CC

- Root cause: `compact-live-ai-controls-v42366.css` sets `.caption-third-controls {flex:1 1 920px!important}` for the **old horizontal toolbar**. After `unified-ai-inline-v1.js` moves the same DOM node into a **vertical** flex container, the 920px becomes a reserved **vertical flex basis**, leaving a huge blank area below two compact control rows.
- Fix only the new unified panel: override its reparented caption controls, setup section, and extra toolbar with `flex:0 0 auto!important; flex-basis:auto!important; height:auto!important; min-height:0!important`.
- Keep the advanced CC options panel inline, scrollable with max height `min(70vh,570px)`; avoid growing the whole page or clipping settings by the player. Do not remove any caption settings or native handlers.
- Add regression assertions for the historical 920px property, stronger CSS override, saved selectors, source ordering, and scrollability.
- Preserve independent Video Enhancement toggle, PiP, FFmpeg Motion processing, 10s Whisper capture, Live Translate/TTS dependencies, player, persistent preferences, Mac/Windows builds and every immutable historical release.
- CI validation and actual macOS UI screenshots are necessary before declaring the bug fixed in practice.

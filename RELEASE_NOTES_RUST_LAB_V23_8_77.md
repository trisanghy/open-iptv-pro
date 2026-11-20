# Rust Lab v23.8.77 — Single-row voice translation controls

- Fix the TTS controls incorrectly wrapping into two rows in medium-width Mac player panes. The legacy 740px container breakpoint previously forced speed and original-audio controls down even when there was enough space.
- Show all four selections (language, voice, speed and original audio) together on the first row with compact, proportional widths. Keep TTS status and optional actions on lower rows.
- For very narrow players, horizontally scroll the control row rather than losing access to the settings.
- Retain Live Caption, Live Translate, TTS dependencies, selected voices/rates, CC appearance, PiP and persisted user settings.
- Add regression assertions for all four select positions and narrow player widths; preserve immutable previous release tags.

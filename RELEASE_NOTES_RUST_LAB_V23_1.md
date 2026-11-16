# Open IPTV Pro Rush · Rust Lab v23.1
Independent Rust/Tauri experimental branch; Electron and main remain unchanged.

## Smart source-aware translation
- Whisper records the original spoken transcript and detects its language using the reliable `-oj` JSON output; no language inferred from channel country or subtitle label.
- No translation when spoken/source language matches selected caption or TTS voice language.
- Argos offline directly translates source→target if that model is installed. A verified two-hop installed Argos route may be used if necessary.
- Only when the direct model is absent: Whisper's English translation can be used as the fallback source for English→target Argos. Source language and route are included with the segment event.
- Model install is delayed until actual language detection so same-language requests do not download unneeded translation models.
- One-click on-demand installer queries the official Argos index; direct pair first, otherwise English fallback model.
- The original voice remains at the chosen duck percentage while TTS is enabled, and duplicate sentences are filtered (v22.2).

**Availability:** not all direct pairs exist in the Argos package index. At the time of change, Chinese→Vietnamese is unavailable as a direct Argos model; English fallback may still be required.

## Regression fix
- Legacy v20–v22 tests now check the source-aware captions/TTS paths instead of removed code and stale version labels. The original v23 tag remains unchanged.

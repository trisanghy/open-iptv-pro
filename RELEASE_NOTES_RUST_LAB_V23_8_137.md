# Rust Lab v23.8.137 — WatchFlow complete catalog regression follow-up (PRE-RELEASE)

- Fix two Windows CI tests that asserted the superseded Intelligence section label, updated by v23.8.136 to make the full model catalog visible while Standard is selected.
- No functional change to model download, inference, playback, PiP, CC, EPG or model availability.
- Real browser test now captures separate screenshots of Standard (2 entries), Smart (5 candidates, 2 installable), and Intelligence (native Qwen3/Hy-MT2 manager), in addition to the whole catalog.
- Preserve v23.8.135 strict CSP fix; unchanged prerelease-only policy and no Stable/Latest or other branch edits.

# Rust Lab v23.8.118 — WatchFlow multigenre & EPG folder test fix (PRE-RELEASE)

- Carries all v23.8.117 changes: automatic local channel + per-programme EPG classification, 17 multi-label topics and virtual folder browsing; installed Qwen3 automatically processes the full queue in Intelligence mode, no 8-channel cap, with offline cache; Internet Wikidata fallback prioritizes unknown channels.
- Aligns the legacy background EPG regression assertion with the new layer that preserves native Qwen3 category merges during rescan. The original test incorrectly expected an outdated direct assignment; all other renderer regression tests previously passed (297/298).
- Retains complete playlist/EPG integrity, source permission, privacy restrictions, local-only Qwen inference and existing playback.
- Rust Lab experimental branch only; immutable prerelease v23.8.118, no Stable/Latest/main modifications. EXE/DMG require successful GitHub Actions builds.

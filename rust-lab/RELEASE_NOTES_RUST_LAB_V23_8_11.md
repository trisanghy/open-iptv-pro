# Rust Lab v23.8.11 — CC & Live TTS sync

**Branch**: `experiment/rust-tauri-v2` · **Frozen release tag:** `rust-lab/v23.8.11`.

### New / Improved

- New polished CC options panel based on reference layout: show/hide, segmented original/translated/both, top/middle/bottom placement, four font sizes, six local fonts, text color/custom swatch, outline, dark/light/no background and opacity. Saves on device.
- Three Live Caption/Translate/TTS switches are independent: hiding original captions while translation plays does not restart Whisper or re-enable Caption.
- Video pause/end/source empty/seek immediately clears visible captions, halts Whisper and TTS, cancels audio/pending tasks. Sustained buffering >1.4 s cancels stale content; playback resumes processing on `playing`.
- Faster TTS: first utterance chunk limited to ~60 characters, VieNeu prewarming retained and next chunk synthesized while previous WAV plays. Pending latest subtitle takes precedence, no ghost narration after pause.
- Fix stale version assertions that previously blocked Windows/Mac CI; freeze with a new tag instead of overwriting v23.8.10.

### Limitations

- Local speech still depends on Whisper windowing, translation and model inference speed. True zero-latency TTS cannot be guaranteed with offline AI; short first chunk and pipeline reduce delay.
- macOS and Windows installers are unnotarized/unsigned testing builds, and model downloads remain separate.

### User builds

- Mac private build via `scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh`: exactly one `.app`, opens Downloads folder.
- GitHub prerelease: Windows x64 installer/portable and Mac DMG when the CI succeeds. Source ZIP and SHA256SUMS provided; does not change the Electron Stable Release.

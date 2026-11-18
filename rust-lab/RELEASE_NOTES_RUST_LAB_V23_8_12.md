# Rust Lab v23.8.12 — CC display + reliable low-latency TTS

**Development branch:** `experiment/rust-tauri-v2` · **Immutable tag:** `rust-lab/v23.8.12`

Supersedes failed v23.8.11 build without rewriting any historical commit/tag.

## Changes

- Full configurable on-video subtitle panel matching reference layout: CC on/off, original/translated/both segmented buttons, top/middle/bottom position, small/medium/large/extra-large type, six local fonts with CJK/Vietnamese fallbacks, seven presets/custom color, text outline, background and opacity, persisted per computer.
- The Live Caption switch controls original-text visibility only. Turning it off while Translate and TTS stay enabled no longer restarts Whisper or force-reenables Caption.
- Video pause/end/empty/seek immediately cancels displayed subtitles, recognition and spoken WAV; prolonged buffering (>1.4 sec) cancels old speech and recovers on playing. Stale asynchronous results cannot resume after cancellation.
- Faster TTS start: shorter first chunk (~60 characters), model prewarm, synthesize the next WAV while the current one plays, and latest-caption-wins backlog. Original audio ducking restored on pause.
- Corrects v23.8.11 CI failures (Rust Lab displayed version and regex assertion). No changes to Electron main or Web.

## Download / Build

Release workflow verifies the actual code and creates Mac Universal DMG + Windows Setup / Portable + source ZIP and SHA256SUMS when all stages pass. Local Mac one-command builder outputs **one `.app`** in Downloads and opens Finder.

## Technical limits

Offline Whisper/translation/VieNeu inference has nonzero computational latency, which varies by CPU/GPU and model. Chunking/prefetch reduces delays but cannot guarantee zero-lag TTS or identical sentence timing to native subtitles. Native macOS builds may not be notarized.

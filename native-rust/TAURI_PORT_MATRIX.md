# Rust Tauri → Rust Native C3 port matrix

This file documents **the actual native Slint + Rust + libmpv code** in `native-rust/`. The legacy Electron application under the repository root is not a native implementation and is excluded from parity claims.

**Reference:** Rust Lab Tauri v23.8.67 (experiment/rust-tauri-v2). **Target:** experiment/rust-native-slint-libmpv-c3-autobuild.

| Feature / UX | Native C3 status | Outstanding work for Tauri parity |
|---|---|---|
| Separate Slint desktop shell and channel sidebar | Implemented | Port responsive compact layouts, complete Tauri typography/icon system |
| M3U URL/file ingestion, refresh, removal and source editor | Native URL editor and rename implemented with transactional fetch-before-replace | Tauri advanced collector/merge operations, batch per-source editor, and web-specific sync |
| Rights notice and per-import M3U confirmation | Implemented | Legal review of all remote providers |
| Smart Discovery consent | Implemented gate | Consent storage/revocation and safe curated discovery; current provider still needs licence review |
| Favorites and recently watched | Implemented | Tauri cross-device sync and expanded filtering |
| Channel sort/reorder | Implemented native ↑/↓ with persistence | Pointer drag/drop parity, folder organization enhancements |
| Source-specific alternate URLs and auto failover | Implemented on explicit libmpv errors | Advanced health-based failover, per-source scoring |
| Video playback | Separate libmpv video window | **Critical:** embedded libmpv video texture in Slint window, no second player window |
| Fullscreen/playback transport | Basic libmpv controls | Integrated fullscreen transport, PiP, video aspect mode, keyboard/remote accessibility |
| MultiView four channels | Four separate libmpv windows | One Slint view with four embedded players, audio focus and tiling |
| EPG XMLTV sources | Gzip default, standard/localized presets | Full source selection/priority UI and transparent per-source status |
| EPG entries and episode titles | Beyond 12,000; generic-title detail parsing | Accurate tvg-id mapping across all channels and source verification |
| EPG current/next | Display on TV page | Full-day/week guide, history and search/reminders |
| EPG startup and periodic refresh | Startup + configurable 10-minute refresh | Better scheduled persistence beyond current/next |
| EPG local cache | 10-min native JSON cache, atomic writes | Compressed full-guide disk/indexed storage and live lifecycle |
| Snapshot | Basic FFmpeg capture and short batch | Parallel 32-worker UI, image grid, preview, high-volume throttling |
| DVR/recording | Basic 60-second MKV via FFmpeg | Timeshift 10-minute buffer, MP4, scheduling, state/progress |
| Health / Smart IPTV Doctor | Basic bounded 1,000-channel probes | Doctor 3.0 and advanced diagnostics/safe repair |
| Backup and restore | Native JSON; limited Electron backup import | Full compatible Tauri backup and screenshot/media data |
| App theme | 3 basic colors/themes | AMOLED, Apple HIG, Material 3, TV, spacing and desktop/mobile layouts |
| Internationalization | Vietnamese primary UI | Tauri's 17-locale runtime translations for Slint components |
| AI speech subtitles, translation, TTS | Not implemented | Whisper/model downloader, MLX, opt-in local AI pipeline, latency, privacy |
| Auto-update and packaged installers | Native Mac developer build script | Isolated Windows installer/release, signed/notarized macOS and updater |
| Security / SSRF | DNS-validated resolver with public-IP checks, redirect protection and proxy bypass for automatic M3U/EPG/health HTTP requests | Review local libmpv/FFmpeg stream URLs, OS-specific playback and Tauri-equivalent integration tests |
| Casting and AirPlay | Not implemented | OS-specific device discovery and supported-device playback |
| Supabase/cloud sync | Not implemented | Auth, consent, local conflict resolution, tests |

## Native-only implementation rules

1. All feature and UI code must be in `native-rust/`. Do not copy HTML, CSS or JavaScript and call it a Slint port.
2. Do not delete or migrate existing Electron/Tauri/Mobile/Web state; Rust Native uses its own data directory and backward-compatible serialized `NativeData`.
3. Every feature requires Rust regression tests and a successful `Rust Native C3 - Slint/libmpv checks` workflow for the same commit. Old Electron JS tests alone are insufficient.
4. Preserve all historical GitHub releases/tags, no force pushes and never write to other branches.
5. No automated third-party playlist use without explicit rights confirmation. Do not publicly mirror EPG data without permission.
6. A checkmark above only asserts functionality present in source and passing relevant CI; real stream playback and platform visuals require separate actual-device validation.

## Technical milestones for full port

- **Player:** Slint rendering notifier and libmpv render API, with a single embedded video texture across Win/macOS/Linux and retained GPU/audio path; then fullscreen/PiP/MultiView.
- **Media backend:** native adaptive HLS/FFmpeg timeshift, DVR scheduling, hardware decode and state restoration, preserving data and handling shutdown safely.
- **AI:** move Tauri local Whisper/translation/TTS flows into dedicated Rust modules with opt-in, cancellation, downloads checksums, and platform-specific inference.
- **UI:** Slint components for full guide, channel organizer, search/filters, source management, doctor, backup, recording and responsive themes.
- **Security and distribution:** pinned-DNS redirect-safe network layer, OS capabilities and permission gates, native CI snapshots, Win/macOS installers, immutable versioned releases.

**Current result is an incremental port, not a complete Tauri-to-Native replacement.**

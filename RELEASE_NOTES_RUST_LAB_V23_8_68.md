# Open IPTV Pro Rust Lab v23.8.68 — Supabase cross-platform sync

Release branch: `experiment/rust-tauri-v2`. Separate from Electron, Web, Mobile and Rust Native C3.

## Changes
- Add a bundled Supabase browser client and a cross-platform account panel to Rust Lab/Tauri.
- Sign in with email OTP or paste a fresh confirmation link; use the existing Open IPTV Pro Supabase project.
- Exchange compatible playlists, channels, favorites, channel/folder order and settings with Web, Electron and Mobile.
- Explicit first-time device pairing with upload/download choices; 60-second revision-first sync after pairing.
- Save a local recovery copy before replacing user data, use revision checks for concurrent changes.
- Keep screenshots, thumbnail binaries, EPG cache and video entirely on-device; retain URL-based channel logos.
- No Rust Native C3 changes. Native Rust/Tauri persistence remains the primary local store.
- Availability of emailed codes and external OAuth depends on Supabase Auth provider/template configuration; do not report real-device cross-login as verified until exercised.

## Release verification
Automated tests, Windows and macOS build artifacts and signature/checksum verification must pass before marking this release ready. Previous tags and assets are immutable.

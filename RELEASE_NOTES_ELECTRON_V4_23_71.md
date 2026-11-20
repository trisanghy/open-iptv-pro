# Open IPTV Pro Electron v4.23.71 — Unified Supabase cloud sync

Branch `build-sources/electron-desktop`. New immutable prerelease `electron-v4.23.71`.

## Highlights
- Cross-device Supabase account in desktop Settings, using the same isolated per-user table as Web, Tauri and Mobile.
- Sign in with verified email OTP (or paste an email confirmation link), choose local or cloud data on initial pairing.
- After pairing, check only cloud revision every 60 seconds; use optimistic CAS writes to avoid overwriting concurrent edits.
- Back up local data before cloud downloads; protect existing user files and channels.
- Only source lists, channel metadata, backup links, favorites, folder/order and compatible preferences are synced. Images, snapshots, thumbnails, EPG cache and video stay local.
- No service-role secrets; public Supabase publishable key only. Network availability and the Supabase Auth email template govern sign-in success.
- Rust Native C3 remains untouched.

## Downloads and verification
Builds: macOS Apple Silicon DMG, Intel DMG, Windows installer and portable EXE, full source ZIP with SHA256SUMS. Do not claim verified release availability before CI succeeds.

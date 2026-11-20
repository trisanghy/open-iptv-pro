# Rust Lab v23.8.69 — Supabase Sync (verified immutable tag policy)

- User-selectable account in desktop Settings; Supabase email OTP or confirmation-link fallback.
- Same database `openiptv_user_state` as Web, Electron and Mobile.
- Explicit cloud/device selection on first pairing, 60-second revision-first sync, CAS checking and local recovery before replacement.
- Sync channels, source lists, favorites, folder/order and compatible settings; no image/video/EPG caches.
- Keep native Rust persistence, offline use and previous release history. Rust Native C3 is excluded.
- Mac one-command builder pins `rust-lab/v23.8.69` and `4.23.17-tauri.23.8.69`; previous immutable tags remain untouched.
- GitHub Actions builds macOS Universal DMG, Windows Setup/Portable and source ZIP; never claim installable/verified until CI passes.

Known deployment requirements: real email OTP delivery depends on Supabase email provider/template ({{ .Token }}). This build is distinct from Electron main.

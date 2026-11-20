# Rust Lab v23.8.73 — Native-matched Supabase account login

- Redesign the Supabase sign-in section to match Rust Lab Settings colors, typography and borders.
- Responsive email/OTP input groups and buttons; avoid horizontal overflow and iOS WebView input zoom.
- Keep the OTP step hidden until an email is requested, with a separate optional confirmation-link section.
- Clear input focus, high-contrast caret and status announcements accessible to keyboard users.
- Preserve shared account synchronization, revision checks, offline data and guarded sign-out.
- Continue excluding photos, channel screenshots, thumbnails, video, and EPG cache from cloud backup.
- Regression tests cover input hierarchy, narrow-screen CSS, and the same data safeguards used by Electron and Mobile.

Scope: `experiment/rust-tauri-v2` only. Electron, Mobile, Web and Rust Native C3 are not changed by this Rust Lab release commit.

Limitations: Supabase email delivery requires a valid Email OTP template/SMTP setup. Device-level login and media compatibility remain subject to local testing. Existing immutable tags/releases are never overwritten.

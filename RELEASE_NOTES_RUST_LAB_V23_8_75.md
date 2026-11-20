# Rust Lab v23.8.75 — Validate Mac build-folder cleanup on all CI platforms

- Preserve the v23.8.74 cleanup behavior: after the new .app is compiled and staged, remove all stale entries inside `~/Downloads/OpenIPTVPro_RustLab_Build`, including `.DS_Store`, old .app bundles and other files.
- Fix the Mac builder cleanup regression test to declare its script input in the same test scope.
- Check the cleanup command statically on all systems. Exercise deletion and symlink protection in a temporary sandbox on Unix systems; avoid Git Bash Windows-path/symlink-permission assumptions on Windows CI.
- No change to playback, PiP, captions, translations, TTS, UI settings, other folders in Downloads or old immutable releases.

User Mac build command remains `scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh`, which downloads the latest Rust Lab HEAD.

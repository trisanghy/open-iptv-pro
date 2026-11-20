# Rust Lab v23.8.74 — Mac build folder clean on every successful build

- Fix one-command Mac build failing after Tauri finished compiling due to hidden macOS Finder file `.DS_Store`.
- After the new app is built and staged, clear **all previous contents** (old apps, zips, logs, hidden files) only within `~/Downloads/OpenIPTVPro_RustLab_Build`. Keep all other Downloads files untouched.
- Refuse to delete a symlinked output directory or a different destination path. Ensure one valid `.app` remains after copy and remove stray `.DS_Store` immediately before verification.
- Add regression coverage using an isolated temporary Downloads sandbox for hidden files, obsolete archives, old apps, and symlink escape.
- Preserve unified compact CC / Caption / Translate / TTS controls, PiP native, user settings, Mac build source from current Rust Lab HEAD, and every old immutable tag and release.

Build note: macOS Finder may generate a new `.DS_Store` after the folder is later opened; it is safe for the next build to clean it.

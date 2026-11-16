# Open IPTV Pro Rust Lab – Channel Health + Storage Fix v4

Branch: `experiment/rust-tauri-v2` (experimental; original Electron app untouched)
Based on Tauri/Rust Lab v4.23.17 Stability Fix v3.

## What changed

1. `src-tauri/src/link_checker.rs` uses a bounded regular GET (no Range) and checks HLS media playlists and actual recent segments. HLS manifests alone remain **uncertain**, not automatically alive; a valid TS/MP4/AAC segment produces positive evidence. Two repeated regular 404/410 responses can classify dead, unless stronger evidence in the app overrides it. 403, 429, timeouts, expired HLS segments, and unsupported formats remain **uncertain**.
2. `renderer/health-evidence.js` prevents a scan result from overwriting recent successful playback or real FFmpeg snapshot. A newly captured frame marks the exact source channel alive (including duplicate source URLs); a saved old thumbnail alone does not imply live playback. Recent usable alternate playback keeps a channel playable even when primary is unavailable.
3. `renderer/app.js`, `collector.js`, `doctor-v3.js` use consistent evidence decisions. Version bump for checker resets old unreliable `Die` states to `Chưa rõ` once, without removing sources, channels or snapshots.
4. `src-tauri/src/primary_store.rs` saves main sources/channels/settings on disk in the separate Tauri app-data directory, with serialized writes and a previous-file fallback copy. Legacy `localStorage` is migrated only after successful disk write; large lists do not exhaust the 5MB WebView localStorage quota. Other small UI preferences stay in localStorage.
5. `renderer/primary-storage.js`, `app-entry.js`, `backup-ui.js` load native data *before* the app, flush pending changes before backup and restore the native primary store when importing an `.iptvbackup`.
6. Main scanner caps Tauri requests at 8 concurrent and flushes every 40 results instead of every 6. Historical health logs remain compact from v3.

## Verification performed here

- `npm test`: 52 passed, 0 failed (including evidence precedence, data migration and >5 MB mocked native storage).
- `npm run test:legacy`: 202 passed, 7 failed, 2 skipped. Seven tests are Electron-specific or expect static HTML script tags and Electron's original version/build files; they are not in the Tauri build gate. Three Doctor tests were fixed and now pass standalone.
- Rust source includes unit/integration fixtures for HLS nested playlist and segment, 404 and 403. **Cargo/Rust toolchain is unavailable in this environment. Cargo compilation and these Rust tests are NOT verified here.**
- Real streaming, snapshot, and backup/restore behavior in a packaged Mac/Windows app still require validation on the target machine.

## Safety and data

- Does not remove playlists, favorites, profiles, backups or saved Snapshot image files.
- Does not write to the Electron stable app's data directory.
- `primary-store-v1.json` and `primary-store-v1.previous.json` are under Tauri Rust Lab's private app-data directory.
- Previously failed unsaved writes from an old version cannot be recovered if no successful prior copy exists.
- Captured thumbnail is only recent evidence when FFmpeg actually creates it; old thumbnails are never presented as a current online check.

## Build on macOS

Use `BUILD_MAC_TAURI.command` from this folder after extracting the ZIP. It runs `npm test`, `npm run prepare:renderer`, `cargo test` and bundles the app if the tests pass.

If compilation fails, include the full `error[E...]` and the command output. Do not delete the previous working Rust Lab before the new build succeeds.

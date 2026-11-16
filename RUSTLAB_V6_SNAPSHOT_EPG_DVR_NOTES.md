# Open IPTV Pro Rust Lab — v4.23.17 Tauri v6

**Branch:** `experiment/rust-tauri-v2` (independent of stable Electron). No push to GitHub.

## Updates

1. **No full-screen flashing during snapshot capture:** FFmpeg snapshot completion no longer calls `renderShots()` or `renderList()` for every frame. The active channel row, favorites tile and snapshot tile are updated in place; each new frame is preloaded before replacing the previous `<img>`. The gallery card and group DOM nodes remain the same. Failed preloads keep the previous image visible.
2. **Automatic 6-hour refresh:** Existing snapshots older than six hours are eligible for new capture. Historic Vietnamese date formats are parsed, and new snapshots include a numeric `capturedAt`. Startup refresh begins after 45 seconds and repeats every four minutes while the window is visible, *not fullscreen*, and no check/manual capture task is active. Up to 18 stale channels are processed per pass with one background FFmpeg worker during video playback or two when paused. Failed captures retain the old photo and are retried after at least 30 minutes. The ordinary “skip existing snapshots” option now skips images **younger than six hours** rather than skipping old images forever.
3. **Disk cleanup:** Old RustLab JPEG files are retired only when the newer state has been flushed to the Rust-managed data store, and only if no snapshot still references the old file. Native IPC refuses paths and non-UUID-named JPEGs. No M3U, favorite, EPG or DVR data is intentionally deleted.
4. **Fullscreen controls:** Added **▤ EPG** and **⏺ Lịch ghi** buttons. The EPG drawer lists now/next programmes for the currently playing channel, and offers recording from EPG using the existing DVR confirmation. The recording drawer shows scheduled, active and finalizing jobs, with a link to manage them. Both panels appear over the existing player without creating an additional decoder. The drawer keeps controls visible and closes when exiting fullscreen.
5. **Adaptive snapshot source:** An already saved preferred backup URL is attempted before the canonical M3U URL. Successful capture is recorded as proof for the actual URL, without relaxing the previous false-Die detection rules.

## Verification

- `npm test`: **69 passed, 0 failed, 0 skipped** (7 new unit/contract cases).
- `node scripts/audit-tauri-bridge.cjs`: **46 preload-compatible methods / 50 Rust routes**. (No Electron runtime dependency used in Tauri.)
- JavaScript syntax checks: passed for all changed renderer modules.
- Chromium renderer DOM smoke on a fully mocked fixture (browser has no access to local web/files): old snapshot card and group nodes persisted while image changed; fullscreen entered successfully; EPG drawer and scheduled DVR job drawer displayed; no JS page errors. This is a **mocked** test, not real IPTV playback.
- **Not verified here:** Rust `cargo test`, macOS DMG compilation and real IPTV playback. This environment does not include Cargo/Rust toolchain. The Mac build script executes Cargo tests before packaging.

## Build on Mac

After downloading the v6 ZIP into `~/Downloads`, unzip into a *new* build folder and execute `BUILD_MAC_TAURI.command`. Requirements: Node/npm, Rust/Cargo, Apple Xcode Command Line Tools. The script installs dependencies, runs JS tests, bundles HLS.js, DASH.js and FFmpeg, runs `cargo test` and builds DMG. The DMG, if produced successfully, is under `src-tauri/target/release/bundle/dmg/`.

The Rust Lab app is intentionally separate from stable Open IPTV Pro Electron. Existing Rust Lab installations will be replaced on installing this same app ID, not stable Electron installations.

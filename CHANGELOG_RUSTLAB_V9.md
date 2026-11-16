# Open IPTV Pro Rust Lab — v4.23.17-tauri.9

**Branch:** `experiment/rust-tauri-v2` (independent from Electron `main`)

## Fixed: drag and drop in macOS Tauri WebView

- Replaced unreliable native HTML5 drag/drop interactions with pointer-driven mouse drag/drop using a **7 px movement threshold**; click-to-play and click-to-collapse still work.
- Drag a **folder header** above/below another header to reorder folders. Also works in the Folder manager.
- Drag a **channel row** above/below a different channel within a folder to change channel order.
- Drag one or more channels onto a target **folder header** to move there. Dropping onto an individual row inserts before/after that row.
- Hold **Shift and click individual channels** to select or deselect multiple channels (including non-adjacent channels), then drag one selected row to move them together.
- Removed **all checkboxes, bulk selection toolbar, “Move folder” buttons, and move modal** from the TV channel list.
- Press Esc to cancel a selection, normal click still plays the channel and clears old selection.
- A drop does not accidentally play a channel or collapse a folder; the subsequent click still works.
- Auto-scrolls a long channel list when dragging near its top/bottom.
- Added insertion highlights and drag indicator for clarity.
- Reuses v8's persisted `groupOrder` and `channelOrder`, and preserves source URLs, favorites, EPG, snapshots, and playback/failover changes from v7.

## Tested here

- **96/96 Node JavaScript tests passed**; bridge tests included.
- Chromium UI smoke test with real pointer events: Shift-select two nonadjacent channels, drag them to folder B, reorder a channel within B, reorder folder headers before/after, reorder folder cards in folder manager, then click to play normally; **no page errors**.
- `node --check` for both edited scripts and `bash -n BUILD_MAC_TAURI.command` passed.
- **Not verified**: native macOS Tauri/WebKit run or Rust Cargo/DMG build (requires macOS Rust toolchain). Test on Mac after building.

## Git safety

Only the experimental branch should be committed. Do not push/rebase/delete Electron `main`, and do not use `--force`.

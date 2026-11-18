# Rust Lab v9 — build / publish

## macOS build (independent DMG)

```bash
bash BUILD_MAC_TAURI.command
```

Requires Node.js, Rust/Cargo and Xcode Command Line Tools. The script runs JS and Cargo tests before making the macOS DMG. If successful, it is in `src-tauri/target/release/bundle/dmg/`.

## GitHub experimental branch only

```bash
bash PUBLISH_RUSTLAB_V9_GITHUB_MAC.command
```

The script requires Git/GitHub CLI access and confirmation. It clones a separate checkout and commits only to `experiment/rust-tauri-v2` on `trisanghy/open-iptv-pro`. No force-push, tags, releases or changes to Electron `main`.

## New behavior

- Drag a folder header to reorder it.
- Drag a channel row before/after another channel to reorder channels.
- Hold **Shift + click** on each channel for multiple selection (without checkboxes), then drag one of the selected channels to a folder header.
- Drag onto another channel row to insert at a precise position.
- Press **Esc** to clear selection.
- Selection is only visual, never deletes a channel and never edits media URLs.

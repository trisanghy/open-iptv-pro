# Open IPTV Pro Rust Lab · v4.23.17-tauri.12

Branch: `experiment/rust-tauri-v2` (independent of Electron `main`).

## Fix: Manual alternate-stream selector placement
- Move the **Nguồn phát (N)** selector out of the channel-title row and into the right side of the playing-channel information header, immediately **to the left of the Favorite star**.
- Keep the channel name and subtitle left-aligned; no artificial 45% truncation of the channel name.
- Open the backup URL menu toward the left of its toggle (right-aligned) to reduce overflow.
- Compact the selector label at narrow window widths.
- Keep current manual selection, preferred link logic, Auto Failover, and the "two or more links" visibility condition unchanged.
- No Rust core / FFmpeg / IPTV player behavior modified.

## Verification
Run targeted checks: `npm run test:quick` (includes the v12 placement regression).
Build on Mac: `bash BUILD_MAC_FAST.command`.
Native Tauri DMG and real IPTV playback must still be verified on the target Mac.

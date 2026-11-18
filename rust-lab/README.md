# Open IPTV Pro — Rust Lab v23.8.26 (Beta)

**Bản sao mã nguồn Tauri 2/Rust đã kiểm chứng tại thời điểm 18/11/2026.** Bản thử nghiệm độc lập, không thay thế Electron Stable.

- Nguồn gốc: [experiment/rust-tauri-v2](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2), commit `04b0fd2e6110e3165bef62fb9b7155651f9dd4c9`.
- [Release DMG/EXE/ZIP](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.26) · [Ghi chú phiên bản](RELEASE_NOTES_RUST_LAB_V23_8_26.md).
- Mã: `src-tauri/` (Rust backend), `src/` + `renderer/` (cầu nối/frontend), `scripts/`, `tests/`; `package.json`, `package-lock.json`.
- Công cụ: Tauri 2, Rust stable, Node.js 22+, FFmpeg bundled, WebView2 trên Windows.

Chức năng: M3U, EPG, yêu thích, backup, FFmpeg/tua lại/ghi hình theo nguồn, Live Caption/Translate/TTS offline, PiP; v23.8.26 tối ưu hàng nút responsive và tránh chồng nhau khi cửa sổ hẹp. Ba tùy chọn kiểm tra kênh/snapshot/bộ đệm lưu 1–32.

## Build

```bash
npm ci --no-audit --no-fund
npm run test:quick
npm run build
```

**Mac tự tải nguồn, xuất duy nhất một .app:**

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

Windows: `BUILD_WINDOWS_TAURI.bat` hoặc [hướng dẫn Windows](README_WINDOWS_AUTO_BUILD.md). Tham khảo `VERSIONING_RUST_LAB.md` về tag bất biến.

Tài liệu và ghi chú cũ vẫn xem được qua [Git history](https://github.com/trisanghy/open-iptv-pro/commits/experiment/rust-tauri-v2/), không còn phải giữ hàng trăm file mô tả từng lần sửa trong cây source tổng hợp trên main.

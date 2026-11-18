# Kiểm thử có thể xác minh — Rust Lab v4.23.17-tauri.1

Thời điểm đóng gói: 2026-11-11.

- `npm test`: 30 passed, 0 failed, 0 skipped. Gồm pure JS logic nguồn gốc và IPC shim test.
- `node scripts/audit-tauri-bridge.cjs`: 46 preload methods, 45 mapped Rust IPC operations (onUpdateStatus là listener shim đặc biệt).
- `node --check` cho JS nguồn UI và script: kiểm tra cú pháp, không thay thế E2E.
- `src-tauri/tauri.conf.json`, `package.json`: JSON hợp lệ, app ID độc lập.
- 3 workflow Electron (release, package, test) đã bị loại khỏi nhánh thử nghiệm; thay bằng workflow branch-scoped Rust CI.
- Rust source Rust modules có các unit test trong `#[cfg(test)]`; CHƯA chạy do host không có `cargo`/`rustc` và không tải được dependency registry.
- Chưa có bản `.exe`/`.dmg` biên dịch hoặc kiểm thử runtime trên Windows/macOS ở host tạo ZIP.
- Chromium headless UI smoke bị chính sách môi trường từ chối `file://` và `localhost` (`ERR_BLOCKED_BY_ADMINISTRATOR`); không ghi nhận là pass.
- Bản Electron v4.23.17 được dùng làm nguồn tham khảo; nhóm legacy Electron-only test `npm run test:legacy` không phải tiêu chuẩn pass Tauri.

## Giới hạn chức năng

Google Cast/LAN chưa được port, thông báo OS chưa triển khai, DASH MPD SegmentTemplate chưa đầy đủ,
EPG và proxy chưa được thử với nguồn IPTV thật, DRM/codec phụ thuộc WebView2/WKWebView,
Rust DVR/Timeshift cần E2E. Không báo đã sẵn sàng phát hành sản phẩm cho người dùng cuối.

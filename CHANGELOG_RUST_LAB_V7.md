# Rust Lab changelog — experiment/rust-tauri-v2

## [4.23.17-tauri.7] — 2026-11-16

### Fixed
- Chuyển kênh A → B → A nhanh không tái sử dụng bộ giải mã HLS/proxy manifest đã cũ.
- Chặn `error`, `waiting` và các promise đến muộn của phiên trước ghi đè phiên hiện tại.
- `timeupdate` chuyển đúng định danh phiên phát, giúp xác minh và ghi nhớ link dự phòng phát liên tục 12 giây.
- Chỉ một lần khởi tạo lại có giới hạn cho WebKit MediaError 3/4 sau lần phát thành công gần đây.
- Không sửa truy vấn/chữ ký của URL IPTV gốc khi gắn mã phiên vào proxy loopback.

### Added
- 6 bài kiểm thử hồi quy riêng cho playback re-entry; toàn bộ `npm test` đạt 81/81.
- Báo cáo phát hành v7, hướng dẫn GitHub Actions và script đẩy mã nguồn chỉ vào nhánh thử nghiệm.

### Preserved from v1–v6.3
- Rust/Tauri 2 backend; M3U/EPG/HLS, FFmpeg fallback, DVR, Snapshot, data storage riêng.
- Tự cập nhật playlist và học URL phát ưu tiên, Snapshot 6 giờ, EPG/DVR fullscreen.
- Phân loại sức khỏe kênh theo bằng chứng, hạn chế thông báo và kiểm soát bộ nhớ.

### Not yet verified here
- `cargo test` và biên dịch native Windows/macOS trên CI/thiết bị đích.
- Phát ổn định với mọi nguồn/codec IPTV; một số chức năng Cast/AirPlay/DASH chưa tương đương Electron.

> Nhánh này không tạo release cho Electron chính, không cập nhật hay thay đổi `main`.

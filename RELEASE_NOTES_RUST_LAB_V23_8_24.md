# Open IPTV Pro Rust Lab v23.8.24 — Công cụ nhanh luôn mở và kiểm thử CI

Giữ nguyên toàn bộ thay đổi giao diện v23.8.23:
- Xóa ô Âm lượng trống khỏi khu vực Công cụ nhanh. Thanh âm lượng thực nằm trên hàng điều khiển video.
- **Công cụ nhanh luôn hiển thị** (section cố định, không có nút thu gọn), với ba tác vụ Kiểm tra các kênh, Chụp toàn bộ kênh và Xuất playlist.
- Chụp ảnh kênh nằm trong menu Công cụ của hàng Live Caption, không trùng bản sao; giữ nguyên âm lượng đã lưu và TTS ducking.

Sửa lỗi phát hành:
- Test `tauri-player-layout-v19-1.test.cjs` cũ từ v19.1 bắt buộc volume + snapshot nằm dưới Công cụ nhanh, không còn đúng với bố cục theo Electron hiện hành. Cập nhật hồi quy để kiểm tra các nút duy nhất vẫn tồn tại trong staging và được chuyển sang toolbar, đồng thời Quick Tools không có volume rỗng.
- Tag bất biến `rust-lab/v23.8.24`, giữ lại mọi commit/tag/release cũ; không sửa main hoặc Electron.

Mac local build một lệnh chỉ cho một file .app trong Downloads, CI dựng Windows và macOS DMG/ZIP nguồn khi thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

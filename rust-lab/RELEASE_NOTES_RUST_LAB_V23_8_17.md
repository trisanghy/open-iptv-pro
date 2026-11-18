# Open IPTV Pro Rust Lab v23.8.17 — sửa popup CC không cuộn được

- Khắc phục nguyên nhân popup CC nằm trong khung video có `overflow: hidden`: chuyển popup ra lớp `document.body` để không bị cắt bên dưới khung phát. Trong fullscreen, popup được đưa trở lại khung fullscreen để vẫn hiển thị trong lớp toàn màn hình.
- Giới hạn popup trong viewport, tự đặt vị trí theo khung video và cập nhật khi đổi kích thước cửa sổ.
- Cả chuột, trackpad macOS, cuộn cảm ứng, bàn phím (↑/↓, Page Up/Down, Home/End) dùng được; cuộn riêng trong popup, không kéo trang phía sau.
- Hiển thị thanh cuộn ở mép phải, cố định tiêu đề và nút đóng, cuộn được tới màu, viền, nền, độ đậm nền.
- Giữ nguyên tất cả font, màu, kiểu phụ đề và lựa chọn đã lưu; không đổi engine Whisper, Live Translate, TTS.
- Giữ nguyên PiP gốc đã khôi phục v23.8.15 và logic ba nút v23.8.16, không can thiệp `main`.
- Commit/tag bất biến `rust-lab/v23.8.17`. Mac local build xuất một `.app`; GitHub Actions tiếp tục build Windows, DMG Universal, ZIP source nếu CI thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

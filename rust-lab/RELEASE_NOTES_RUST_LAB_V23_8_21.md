# Open IPTV Pro Rust Lab v23.8.21 — giao diện và chức năng theo Electron
Đã đối chiếu nhánh Electron `build-sources/electron-desktop` (4.23.68).

- Hàng 1: thông tin kênh, nút phát/dừng/chuyển kênh, âm lượng, Cast/PiP/toàn màn hình.
- Hàng 2: EPG hiện tại và tiếp theo xếp dọc, nút mở EPG, chọn khung hình, link phát/dự phòng và yêu thích.
- Hàng Live AI: CC · Tùy chỉnh, Live Caption, Live Translate, TTS, giọng/tốc độ/Gốc, menu Công cụ chứa nút chụp ảnh, FFmpeg dự phòng và nghe thử/cài giọng.
- Chuyển các điều khiển thật trong DOM, không tạo input volume/video mới, không thay các listeners đã được đăng ký.
- Link phát được hiển thị khi có ít nhất một link live, vẫn hỗ trợ chọn thủ công và Auto Failover.
- FFmpeg dùng lệnh Rust `compatStart` và bộ phát `tryPlayback` sẵn có; nếu lỗi sẽ thử khôi phục URL cũ.
- Giám sát Whisper sau HLS stall giới hạn 2,5 giây, không restart mỗi frame.
- Giữ PiP gốc, CC fullscreen/PiP, các model offline, cài đặt người dùng và các chức năng khác.

Tag mới bất biến `rust-lab/v23.8.21`. Chỉ sửa `experiment/rust-tauri-v2`, không thay đổi main/Electron.
Mac local build một file .app, GitHub CI tiếp tục build DMG Universal, Windows và ZIP source khi thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

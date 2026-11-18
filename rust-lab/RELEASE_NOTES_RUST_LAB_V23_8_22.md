# Open IPTV Pro Rust Lab v23.8.22 — Electron UI/function parity + CI correction

- Tiếp tục toàn bộ nâng cấp v23.8.21: hai hàng toolbar theo Electron, âm lượng nằm cạnh nút phát, EPG hai dòng + nút mở lịch, link nguồn phát, TTS/CC/giọng, menu Công cụ chứa nút Chụp ảnh, FFmpeg thực và nghe thử/cài giọng.
- Điều chỉnh kiểm thử v13 từng bắt buộc ẩn dropdown khi chỉ có một URL. Với giao diện Electron mới, dropdown hiển thị khi kênh có ít nhất một URL hợp lệ; chỉ ẩn khi không có nguồn. Giữ các bài kiểm thử đổi link, nhãn không lộ token và Auto Failover.
- Sửa kiểm thử v23.8.21 không ghim số phiên bản cụ thể để các đợt phát hành mới không lỗi tương tự.
- Không thay đổi engine Rust, PiP gốc, Whisper, TTS, cấu hình CC, các nhánh `main` hoặc `build-sources/electron-desktop`.
- Commit và tag riêng bất biến `rust-lab/v23.8.22`, giữ nguyên bản cũ.
- Mac build một lệnh tạo một `.app` trong Downloads; GitHub Actions tạo Windows Setup/Portable, macOS Universal DMG và ZIP source nếu build thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

# Open IPTV Pro Rust Lab v23.8.6 — sửa 3 nút Live AI độc lập

## Sửa lỗi
- Live Caption không còn tự bật lại khi Live Translate hoặc TTS vẫn bật. Tắt Caption chỉ tắt phần phụ đề gốc; Whisper tiếp tục nhận diện nội bộ để dịch và đọc TTS.
- Bật Live Translate không tự ép bật Caption. Bật TTS chỉ đảm bảo Live Translate có đầu vào, không đụng tới Caption.
- Tắt Translate sẽ tắt TTS phụ thuộc vào bản dịch (nếu đang bật), giữ nguyên Caption. Tắt TTS không tắt Caption hoặc Translate.
- Lưu chính xác từng trạng thái để sau khi mở lại ứng dụng không tự bật Caption ngoài ý muốn.
- Overlay CC chỉ hiển thị phụ đề gốc khi Live Caption được bật; nếu chỉ dùng Translate, vẫn hiển thị câu dịch mà không tự bật phụ đề gốc.

## Kiểm thử/Release
- Thêm kiểm thử hành vi bấm nút Caption/Translate/TTS và kiểm tra trạng thái phụ thuộc.
- Cập nhật hai kiểm thử cũ bị lỗi CI ở v23.8.5: TTS phải bỏ qua khi video tạm dừng, overlay chỉ có một renderer CC chính thức.
- Phiên bản `4.23.17-tauri.23.8.6`, tag bất biến `rust-lab/v23.8.6`, không thay đổi `main` và các tag cũ.
- GitHub Actions vẫn giữ Windows Setup, Portable, macOS Universal DMG, source ZIP và checksum; Mac build cục bộ chỉ xuất một ứng dụng `.app`.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

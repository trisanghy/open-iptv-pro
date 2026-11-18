# Open IPTV Pro Rust Lab v23.8.5 — CC subtitles + synchronized playback

- Nút CC bên cạnh cấu hình Whisper, mở bảng chỉnh trực tiếp trên video: hiện/ẩn, bản gốc / bản dịch / song ngữ, bốn kích thước, vị trí, bảng màu + chọn màu tùy chỉnh, màu viền và nền, độ đậm nền. Lưu ngay cấu hình trên thiết bị.
- Hiển thị phụ đề dạng overlay duy nhất tối đa 2 dòng mỗi ngôn ngữ, màu mặc định trắng (gốc), vàng (dịch), nền tối 50%. Xóa renderer phụ đề trùng lặp của v23.4, chỉ hiện cue VTT ở PiP.
- Video Pause, Stop hoặc Ended sẽ hủy luồng FFmpeg/Whisper và xóa nội dung phụ đề, hủy TTS đang tổng hợp/đang đọc, xóa hàng đợi, khôi phục âm lượng. Trạng thái bật/tắt vẫn được lưu và bắt đầu lại khi video có sự kiện playing.
- Loại bỏ các sự kiện nhận diện tới muộn nhờ kiểm tra session-id và generation token. Không tự phát phụ đề hoặc TTS khi video không phát.
- Không thể ẩn phụ đề đã được mã hoá trực tiếp vào hình ảnh của nguồn phát (burned-in subtitles).
- Bản Mac build cục bộ tạo duy nhất .app trong Downloads; GitHub CI giữ DMG Universal Intel/Apple Silicon, Windows Setup/Portable, ZIP source và SHA256.
- Tag bất biến rust-lab/v23.8.5; không đổi main.
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

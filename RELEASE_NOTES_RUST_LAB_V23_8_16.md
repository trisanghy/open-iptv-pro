# Open IPTV Pro Rust Lab v23.8.16 — liên kết ba nút Live AI

## Thao tác đã sửa
- Khi cả Live Caption, Live Translate và TTS đều tắt, chỉ cần nhấn **TTS**: cả ba bật và bắt đầu luồng nhận diện → dịch → đọc (nếu video đang phát và mô hình sẵn sàng).
- Khi cả ba đang bật, nhấn **Live Caption** để tắt: tắt cả Caption, Translate và TTS, dừng Whisper, giọng đang đọc và khôi phục tiếng gốc.
- Nhấn tắt **Live Translate** riêng vẫn tự tắt TTS phụ thuộc, giữ lại Caption.
- Nhấn tắt **TTS** riêng chỉ tắt giọng đọc, giữ nguyên Caption và Translate.
- Giữ nguyên ngôn ngữ, mô hình, giọng đọc, tốc độ, âm lượng nguồn, font và kiểu phụ đề đã lưu; tải lại ứng dụng khôi phục trạng thái đầy đủ khi TTS bật.
- Cập nhật kiểm thử hồi quy từ logic độc lập trước đây sang hai thao tác liên kết mới.

## PiP và phát hành
- Giữ **PiP gốc** được khôi phục trong v23.8.15; không tạo cửa sổ Mini Player riêng, không ảnh hưởng `main` và bản Electron.
- Commit và tag bất biến `rust-lab/v23.8.16`, giữ nguyên các bản cũ.
- Mac build cục bộ chỉ một `.app` trong Downloads. GitHub Actions vẫn tạo Windows Setup/Portable, Universal DMG, ZIP source và SHA256 nếu build thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

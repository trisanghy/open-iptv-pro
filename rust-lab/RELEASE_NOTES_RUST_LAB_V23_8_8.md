# Open IPTV Pro Rust Lab v23.8.8 — TTS ít trễ, đồng bộ phụ đề

## Thay đổi
- Rút ngắn lượt lấy âm thanh FFmpeg dành cho Whisper từ 8 giây xuống 4 giây. Câu ngắn có thể hiện phụ đề nhanh hơn, nhưng độ trễ thực tế vẫn tùy nguồn phát, tải CPU và tốc độ dịch.
- Khi bật giọng VieNeu đã cài, nạp sẵn worker offline trước khi câu đầu tiên được nhận diện (không tự tải thêm mô hình). Các câu tiếp theo tiếp tục dùng worker đang mở.
- Chia câu dài thành đoạn ngắn để phát WAV đầu tiên sớm hơn, không cần tổng hợp xong cả đoạn dài; ưu tiên câu phụ đề mới thay vì đọc hết phần văn bản cũ đang xếp hàng.
- Phụ đề trên video theo dõi chính xác đoạn TTS đang phát, sau khi TTS xong quay lại nội dung mới nhất. Ngắt ngay lời đọc khi Pause, Stop, Ended, đổi nguồn và không phát bù nội dung cũ.
- Giữ nguyên ngôn ngữ, giọng đọc, tốc độ, mức tiếng gốc, bật/tắt ba chế độ và cấu hình CC đã lưu.

## Giới hạn kỹ thuật
Không thể bảo đảm độ trễ bằng 0: Whisper phải gom âm thanh, nhận diện, Argos/MLX phải dịch và Piper/VieNeu phải tổng hợp WAV. 4 giây là khoảng lấy mẫu, không phải SLA về độ trễ đầu-cuối. Trong trường hợp máy yếu, cắt nhỏ quá mức có thể giảm độ chính xác nhận diện.

## Build và phát hành
- Tag bất biến `rust-lab/v23.8.8` trên nhánh thử nghiệm; các phiên bản cũ được giữ nguyên, không thay đổi main.
- GitHub Actions tạo Windows Setup/Portable, Mac Universal DMG, source ZIP và checksum SHA256 khi CI thành công; Mac tự build chỉ một file `.app` trong Downloads.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

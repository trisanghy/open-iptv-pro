# Open IPTV Pro Rust Lab v23.8.9 — Low Latency TTS Stable

## Cập nhật
- Giữ đầy đủ tối ưu tốc độ của v23.8.8: nhận diện Whisper cửa sổ 4 giây, nạp VieNeu sẵn khi TTS bật, tổng hợp từng đoạn ngắn và phụ đề đồng bộ với đoạn âm đang phát.
- Sửa kiểm thử cũ liên quan đến cấu trúc payload đã thay đổi (thêm originalText và thời điểm vào hàng đợi); giữ kiểm tra bắt buộc sourceLanguage và English fallback.
- Không làm mất phần cuối của câu dài khi chia nhỏ, vẫn ưu tiên bản dịch mới nếu lời đọc cũ chưa xong.
- Giữ các bản sửa trước: ba nút Live Caption/Live Translate/TTS độc lập, pause/stop ngắt phụ đề và giọng nói, cấu hình CC và TTS tự ghi nhớ.
- Không thay đổi main, giữ tag cũ và tạo tag bất biến `rust-lab/v23.8.9`.

## Phát hành
- GitHub Actions dựng Windows x64 Setup/Portable ZIP, macOS Universal DMG, Source ZIP và SHA-256 nếu CI thành công.
- Build cục bộ Mac: tải đúng tag v23.8.9, xuất đúng một file `.app` trong thư mục build ở Downloads.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

Giới hạn: không thể đạt trễ 0 ms với Whisper + Argos/MLX + Piper/VieNeu offline; độ trễ thực tế tùy kênh, loại model và phần cứng.

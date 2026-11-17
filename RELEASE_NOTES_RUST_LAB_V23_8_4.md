# Open IPTV Pro Rust Lab v23.8.4 — lưu cài đặt Live Caption / Translate / TTS

- Ghi nhớ và khôi phục bật/tắt Live Caption, Live Translate, Giọng dịch TTS; ngôn ngữ dịch; ngôn ngữ TTS; giọng Piper/VieNeu; tốc độ TTS và tỷ lệ âm lượng tiếng gốc.
- Khôi phục lựa chọn trước khi nạp tính năng AI; kích hoạt lại các chế độ đã bật sau khi nạp đầy đủ engine Argos/MLX, chỉ nhận diện khi có nguồn phát.
- Giữ tương thích với hai key lưu cũ (ngôn ngữ dịch, tốc độ đọc); bỏ qua lựa chọn lỗi/không có trong phiên bản mới.
- Không ảnh hưởng đến trình phát, các kênh và cài đặt khung hình vốn đã được ghi nhớ.
- Sửa kiểm thử CI macOS DMG v23.8.3 bị fail vì regex escape sai. DMG tiếp tục được kiểm tra sau khi mount ở chế độ readonly để xác nhận ARM64 + x86_64.
- GitHub Actions tự tạo Windows Setup/Portable, macOS Universal DMG (khi CI thành công), Source ZIP và checksum SHA256; giữ nguyên tag cũ, không chỉnh main.
- Mac cá nhân tiếp tục chỉ xuất một thư mục chứa duy nhất `.app`; tải source tạm từ tag bất biến `rust-lab/v23.8.4`.

### Lệnh build Mac
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

Cài đặt được lưu tại hồ sơ ứng dụng trên thiết bị hiện tại; chưa đồng bộ liên thiết bị. Khi thiếu mô hình đã cài, bật lại vẫn cần cài mô hình; trạng thái bật không đảm bảo mô hình luôn sẵn sàng.

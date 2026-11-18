# Open IPTV Pro Rust Lab v23.8.20 — Phụ đề CC trong fullscreen và PiP

- Sửa lớp CC bị thanh điều khiển che khi sử dụng fullscreen của khung video: đẩy lên trên thanh điều khiển khi thanh hiện, trở lại vị trí thông thường khi thanh ẩn.
- PiP gốc và native fullscreen của riêng phần tử video dùng một track WebVTT duy nhất, cập nhật phụ đề gốc/bản dịch/song ngữ theo chính lựa chọn CC đã lưu. Không tạo player, nguồn tải hay bộ giải mã thứ hai.
- Khi vào PiP/thoát PiP, WebKit đổi presentation mode, chuyển fullscreen hoặc trở lại, cập nhật chế độ track `showing/hidden` ngay, không cần đợi câu Whisper kế tiếp. Cập nhật cả khi TTS đang đọc đoạn tương ứng.
- Khi tắt CC, dừng video, đổi nguồn, hoặc hết phụ đề, xóa cue, không giữ đoạn cũ. Giữ tối đa một cue mỗi thời điểm.
- Loại bỏ code tạo track native khác ở module Live Caption để không bị hiện hai lớp phụ đề.
- Giữ nguyên các sửa lỗi phụ đề dài tự xuống dòng, menu CC, giọng TTS, tốc độ, nhóm 3 nút và **PiP gốc**.
- Native PiP/fullscreen của macOS sử dụng trình hiển thị captions do hệ điều hành/WebView quản lý; màu và font tuỳ chỉnh HTML không nhất thiết áp dụng cho native track. Cần kiểm thử trực tiếp trên WKWebView.
- Tag bất biến `rust-lab/v23.8.20`; chỉ cập nhật `experiment/rust-tauri-v2`, không thay đổi main/Electron.
- Mac tại máy xuất đúng một file `.app`; GitHub CI build DMG, Windows, ZIP source và checksum khi thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

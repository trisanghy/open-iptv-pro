# Open IPTV Pro Rust Lab v23.8.23 — Công cụ nhanh luôn mở

- Xóa hẳn ô **Âm lượng** thừa khỏi Công cụ nhanh; phần này trước đó rỗng vì input âm lượng đã được chuyển lên thanh phát.
- Giữ đúng một thanh âm lượng `#volume` và một nút `#shotBtn`, được chuyển sang vị trí hiện tại bởi module Electron player parity. Giữ nguyên mức đã lưu, TTS ducking, snapshot và toàn bộ listener.
- Chuyển `#quickTools` từ `details/summary` sang `section/header` để **luôn mở**, không thể vô tình thu gọn hoặc đóng khi khởi động.
- Hiển thị đúng ba nút Kiểm tra các kênh, Chụp toàn bộ kênh và Xuất playlist, bố cục thích ứng với chiều rộng.
- Bổ sung kiểm thử hồi quy cho tính năng luôn mở, tính duy nhất của nút/slider và các action hiện tại.
- Không thay đổi PiP, CC, TTS, mô hình, dữ liệu người dùng, Electron/main hay bản phát hành cũ.
- Bản phát hành bất biến: `rust-lab/v23.8.23`; Mac một lệnh chỉ xuất một `.app`, GitHub Actions tiếp tục tạo DMG/Windows/ZIP nguồn khi build thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

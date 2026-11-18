# Open IPTV Pro Rust Lab v23.8.18 — popup CC cuộn độc lập + sửa CI

- Giữ nguyên bản sửa popup CC v23.8.17: popover thoát khung video `overflow:hidden`, có thanh cuộn riêng bằng trackpad, chuột, cảm ứng và bàn phím; tiêu đề cố định; tự dịch chuyển trong viewport; khi fullscreen hiển thị như thành phần của video.
- Không thay đổi bất cứ tùy chọn phụ đề, giọng đọc, TTS, live translate hoặc PiP gốc nào.
- Sửa hai bài kiểm thử hồi quy từng ghim cứng số phiên bản cũ `v23.8.15` và `v23.8.17` làm Windows/macOS CI fail khi phát hành phiên bản mới. Kiểm thử nay đối chiếu phiên bản động trong `package.json` với tag dùng build.
- Tag riêng, bất biến `rust-lab/v23.8.18`, giữ bản cũ và không đổi `main`.
- Mac build cục bộ một file `.app` trong Downloads; GitHub CI tiếp tục xuất Windows Setup/Portable, DMG Universal và ZIP nguồn nếu thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

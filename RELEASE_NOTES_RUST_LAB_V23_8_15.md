# Open IPTV Pro Rust Lab v23.8.15 — trở lại PiP gốc

Theo phản hồi người dùng: sự cố PiP native WebView chỉ xảy ra một lần và sau đó hoạt động bình thường. Hoàn nguyên phần PiP thay đổi ở v23.8.13/v23.8.14, giữ nguyên các tính năng và sửa lỗi khác.

- Khôi phục nguyên trạng `renderer/auto-pip-v42363.js` trước khi có Mini Player.
- Nút PiP dùng lại trực tiếp `video.requestPictureInPicture()` hoặc `webkitSetPresentationMode`, không mở cửa sổ trình phát thứ hai, không pause hoặc tải lại video riêng.
- Ba tùy chọn PiP tự động và localStorage cũ không đổi.
- Xóa toàn bộ mã Mini Player Tauri dự phòng, Rust IPC, trang pip.html và bộ test tương ứng.
- Chỉ hoàn nguyên mã PiP. Giữ nguyên Live Caption, Live Translate, TTS ít trễ, font phụ đề, và mọi thay đổi khác.
- Git commit mới, tag bất biến `rust-lab/v23.8.15`; không thay đổi `main`, không ghi đè tag cũ.
- Mac build tại máy xuất duy nhất file `.app`; GitHub Actions vẫn tạo bản Windows, DMG, ZIP nguồn khi CI thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

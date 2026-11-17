# Open IPTV Pro Rust Lab v23.8.14 — PiP Release Fix

- Giữ bản sửa PiP v23.8.13: khi WKWebView từ chối PiP hệ thống, tự mở Mini Player Tauri luôn nổi trên các cửa sổ khác; ba tùy chọn tự động dùng cùng cơ chế.
- Cập nhật phần mô tả cài đặt PiP để giải thích rõ Mini Player dùng bộ phát riêng, tạm dừng trình phát chính sau khi phát thành công.
- Sửa bài kiểm thử v23.8.12 cố định số phiên bản khiến CI báo sai khi tăng version.
- Sửa kiểm thử PiP để dùng version tag hiện tại thay vì ghim cố định v23.8.13. Cải thiện mã Rust xử lý trạng thái session cho rõ kiểu dữ liệu.
- Giữ tag và các bản cũ, chỉ chỉnh `experiment/rust-tauri-v2`, không ảnh hưởng Electron main.
- GitHub Actions dựng Windows Setup/Portable, macOS Universal DMG, Source ZIP và SHA-256 khi thành công. Mac cá nhân chỉ xuất một ứng dụng `.app` trong Downloads.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

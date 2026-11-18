# Open IPTV Pro Rust Lab v23.8.7 — kiểm thử và phát hành bản sửa Live Caption

## Thay đổi
- Tiếp tục giữ bản sửa v23.8.6: Live Caption có thể tắt riêng ngay cả khi Live Translate và TTS đang bật; tắt Translate sẽ ngắt TTS phụ thuộc, giữ nguyên Caption.
- Sửa bộ giả lập DOM trong bài test thao tác ba nút: bổ sung `document.addEventListener` để chạy kiểm thử UI đúng trong Node.js.
- Bỏ các khẳng định hard-code phiên bản v23.8.5 và v23.8.6 ở bài kiểm thử release, đối chiếu trực tiếp với `package.json` và tag script Mac.
- Không thay đổi engine nhận diện/dịch/TTS ngoài bản sửa v23.8.6, giữ nguyên chỉnh CC v23.8.5.
- Tạo commit và tag riêng `rust-lab/v23.8.7`, giữ nguyên các phiên bản trước và không cập nhật `main`.

## Đóng gói
- GitHub Actions: Windows x64 Setup/Portable ZIP, macOS Universal DMG ARM64 + Intel, Source ZIP và SHA256 khi build thành công.
- Mac tại máy: một `.app` duy nhất, tự lấy nguồn từ tag bất biến.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

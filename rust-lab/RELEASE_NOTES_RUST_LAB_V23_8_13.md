# Open IPTV Pro Rust Lab v23.8.13 — PiP sửa lỗi WebView NotAllowedError

- Nút PiP kết nối chung với điều khiển PiP tự động; thử PiP hệ điều hành, khi WebView từ chối sẽ mở Mini Player native của Tauri.
- Cả ba chế độ (đổi trang, thu nhỏ, chuyển ứng dụng) dùng cửa sổ nổi Tauri luôn ở trên, tránh giới hạn thao tác người dùng của WebKit.
- Mini Player phát cùng URL nguồn kênh, dùng proxy của app và HLS native, hls.js hoặc DASH, có nút Phát/Trở lại.
- Khi Mini Player phát được, mới pause video gốc để tránh hai nguồn tiếng cùng lúc; đóng PiP sẽ khôi phục video chính nếu đang ở trang Xem truyền hình.
- Cửa sổ nổi là bộ phát riêng, không phải native AVKit PiP. Phụ đề/TTS trên trình phát chính ngắt khi chuyển video sang Mini Player; hiện chưa đồng bộ vào Mini Player.
- Mở Mini Player có thể cần nhấn Phát một lần nếu WebKit không cho phép autoplay. Link nguồn thất bại sẽ có thông báo lỗi, trình phát chính vẫn phát.
- Không can thiệp main, chỉ cập nhật `experiment/rust-tauri-v2`; giữ các tag cũ.
- GitHub Actions tạo Windows Setup/Portable, macOS Universal DMG, source ZIP khi build thành công; Mac local build chỉ tạo một `.app`.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

# Cài đặt — gói Open IPTV Pro v4.23.69

**Trang Release tổng hợp:** https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.69

| Bản thực tế | macOS | Windows x64 | Trình duyệt |
| --- | --- | --- | --- |
| **Electron v4.23.68 Stable** | `Open-IPTV-Pro-4.23.68-mac-arm64.dmg` hoặc `Open-IPTV-Pro-4.23.68-mac-x64.dmg` | `Open-IPTV-Pro-Setup-4.23.68-x64.exe` hoặc `Open-IPTV-Pro-4.23.68-x64.exe` (portable) | — |
| **Rust Lab v23.8.30 Beta** | `OpenIPTVPro-RustLab-v23.8.30-mac-universal.dmg` | `OpenIPTVPro-RustLab-v23.8.30-Windows-Setup-x64.exe` hoặc `OpenIPTVPro-RustLab-v23.8.30-Windows-Portable-x64.zip` | — |
| **Web Online** | — | — | https://trisanghy.github.io/open-iptv-pro/ |

**Mac:** Dùng ARM64 cho Apple Silicon, x64 cho Intel với Electron; Rust Universal chạy trên cả hai. Mở DMG, kéo ứng dụng vào Applications. Nếu hệ điều hành báo chưa được notarize, kiểm tra nguồn và mã SHA trước; sử dụng tính năng **Open Anyway** nếu bạn tin tưởng file, không tắt Gatekeeper toàn hệ thống.

**Windows:** Dùng Setup cho cài đặt thông thường hoặc Portable nếu không muốn cài. Rust Lab có thể yêu cầu WebView2 Runtime. Không ghi đè dữ liệu Electron bằng dữ liệu Rust, hãy sao lưu.

**Web:** Không cần cài; mở link trực tiếp. Những hạn chế CORS/codec/autoplay/fullscreen/DRM vẫn phụ thuộc trình duyệt.

**Nguồn:** `OpenIPTVPro_Full_Source_v4.23.69.zip` chứa cả ba codebase. `OpenIPTVPro_Web_Online_v4.23.69.zip` chứa source web.

**Kiểm tra tải xuống:** so sánh với `SHA256SUMS.txt`; trên Mac dùng `shasum -a 256 ten-file`, trên Windows dùng `Get-FileHash ten-file -Algorithm SHA256`.

**Cảnh báo nội dung:** Chỉ xem và nhập những nguồn IPTV mà bạn có quyền sử dụng. Hộp xác nhận quyền trong ứng dụng không phải giấy phép bản quyền.

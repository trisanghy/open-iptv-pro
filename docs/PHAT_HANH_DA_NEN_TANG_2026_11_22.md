# Open IPTV Pro — Giới thiệu và so sánh phiên bản ngày 22/11/2026

> Bản Electron là sản phẩm Desktop chính. Rust Lab, Web Online và Mobile dùng các nhánh/CI riêng; mọi phiên bản cũ và tag bất biến được giữ nguyên.

## Phiên bản và tệp phát hành có thật

- **Electron 4.23.76 (bản nguồn mới nhất):** [release Beta](https://github.com/trisanghy/open-iptv-pro/releases/tag/electron-v4.23.76) gồm `Open-IPTV-Pro-Setup-4.23.76-x64.exe`, `Open-IPTV-Pro-4.23.76-x64.exe`, DMG macOS `arm64`/`x64`, ZIP nguồn và `SHA256SUMS.txt`. Stable trước đó là [v4.23.71](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.71). Chỉ thông báo v4.23.76 Stable khi CI chạy trên `main` và [tag bất biến v4.23.76](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.76) có đủ asset.
- **Rust Lab 23.8.98 (Beta):** [release có đủ DMG Universal, Windows Setup/Portable, source và SHA256](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.98). Không tuyên bố công nghệ AI upscale 4K đã có pipeline xử lý thật; cần kiểm tra phát và PiP trên máy vật lý.
- **Mobile 4.23.17-mobile.35 (Beta):** [release APK debug, IPA unsigned, source và ảnh mô phỏng thiết bị](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.35). IPA chưa có chữ ký, phải ký bằng chứng chỉ Apple hợp lệ.
- **Web Online:** [mở web](https://trisanghy.github.io/open-iptv-pro/) trên trình duyệt; không cần APK/EXE/DMG. [Trang chọn tải và so sánh](https://trisanghy.github.io/open-iptv-pro/tai-ve.html).

## Tính năng mới đáng chú ý

| Nội dung | Electron 4.23.76 | Rust Lab 23.8.98 | Web Online mới | Mobile .35 |
|---|---|---|---|---|
| Xem M3U, quản lý nguồn/yêu thích, EPG | Có, tùy codec/nguồn | Có, đang thử nghiệm | Có, tùy CORS/codec | Có, giới hạn native |
| Giao diện Sáng/Tối/AMOLED | Tinh chỉnh tương phản Light và biểu tượng player | Đồng bộ Dark/AMOLED và bộ icon SVG Web | Kiểm thử 6 giao diện Desktop/Mobile | UI cảm ứng, đồng bộ đăng nhập |
| Đăng nhập và đồng bộ Supabase | Có, phụ thuộc cấu hình OTP | Có, cần test thiết bị | Có, phụ thuộc trình duyệt/OTP | Có, chọn dữ liệu cloud/local |
| GPU/AI | Benchmark encode GPU, quản lý cache; **chưa có upscale AI thực** | Phụ đề/dịch/TTS, bù chuyển động một phần; **chưa có upscale AI thực** | Không có pipeline AI Desktop | Không tương đương Desktop |
| PiP / phát nền | Khi OS hỗ trợ | Cần xác minh native theo thiết bị | Giới hạn trình duyệt/iOS | Beta, tùy OS |
| File tải | Windows Setup/Portable, Mac ARM/Intel | Windows Setup/Portable, Mac Universal | Truy cập URL, không cần cài | APK debug, IPA chưa ký |

**Lưu ý:** Tên nền tảng hoặc trạng thái CI thành công không đảm bảo mọi codec, phát nền, AirPlay, mô hình AI hoặc cơ chế chia sẻ dữ liệu sẽ hoạt động trên tất cả thiết bị.

## An toàn và quyền sử dụng

Chỉ nhập file/URL M3U mà người dùng được phép truy cập; ứng dụng không cung cấp nội dung hoặc bản quyền phát sóng. Nên sao lưu danh sách trước khi đổi phiên bản. Không công khai dữ liệu cá nhân, token hay danh sách nguồn riêng tư. Tag cũ không được ghi đè; chỉ phát hành bản Stable khi đủ test và checksum.

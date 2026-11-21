# Open IPTV Pro — Phát hành 4 nền tảng ngày 22/11/2026

## 1. Phiên bản và liên kết đã kiểm tra

| Nền tảng | Mã nguồn / phát hành | Trạng thái và bộ cài |
|---|---|---|
| Electron Desktop | **4.23.76 từ `main` — Stable** | [Release chính thức](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.76): Windows Setup/Portable EXE x64, Mac ARM64/Intel DMG, source ZIP, SHA256SUMS. [Workflow CI build thành công](https://github.com/trisanghy/open-iptv-pro/actions/runs/44960025189). |
| Rust Lab/Tauri | **23.8.98 Beta** từ `experiment/rust-tauri-v2` | [Windows Setup/Portable, macOS Universal DMG, Source, SHA256](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.98). Không gắn nhãn Stable khi phát, PiP, mô hình AI trên máy thật chưa được chứng nhận. |
| Mobile Capacitor | **4.23.17-mobile.35 Beta** | [APK debug và IPA unsigned, source, ảnh và SHA256](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.35). IPA chưa ký không thể cài thông thường như ứng dụng App Store. |
| Web Online | **Mã đang triển khai ở `web/online`** | [Mở Web](https://trisanghy.github.io/open-iptv-pro/) · [Tải về và so sánh 4 nền tảng](https://trisanghy.github.io/open-iptv-pro/tai-ve.html). Không cần bộ cài. |

## 2. File tải trực tiếp Electron Stable 4.23.76

- Windows x64 Setup: [Open-IPTV-Pro-Setup-4.23.76-x64.exe](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.76/Open-IPTV-Pro-Setup-4.23.76-x64.exe)
- Windows x64 Portable: [Open-IPTV-Pro-4.23.76-x64.exe](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.76/Open-IPTV-Pro-4.23.76-x64.exe)
- Mac Apple Silicon: [Open-IPTV-Pro-4.23.76-mac-arm64.dmg](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.76/Open-IPTV-Pro-4.23.76-mac-arm64.dmg)
- Mac Intel: [Open-IPTV-Pro-4.23.76-mac-x64.dmg](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.76/Open-IPTV-Pro-4.23.76-mac-x64.dmg)
- [Source ZIP](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.76/OpenIPTVPro_Source_v4.23.76.zip) · [SHA256SUMS.txt](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.76/SHA256SUMS.txt)

## 3. Tính năng mới và so sánh

| Khả năng | Electron Stable 4.23.76 | Rust Lab Beta 23.8.98 | Web mới nhất | Mobile Beta .35 |
|---|---|---|---|---|
| Playlist M3U hợp pháp, danh sách kênh, EPG | Có | Có, tùy nguồn/codec | Có, giới hạn CORS/codec | Có, giới hạn native |
| Chủ đề Sáng / Tối / AMOLED | Light được tinh chỉnh | Dark/AMOLED đồng bộ | 6 tổ hợp desktop/mobile đã kiểm thử | Tối ưu cảm ứng |
| Bộ biểu tượng player | SVG thống nhất | SVG theo Web | SVG | Theo Web |
| Cloud sync Supabase | Có, phụ thuộc OTP | Có, phụ thuộc OTP | Có, phụ thuộc OTP | Có, phụ thuộc OTP |
| AI phụ đề/dịch/TTS ngoại tuyến | Có khi mô hình hoạt động | Beta, cần kiểm tra thực tế | Không như Desktop | Không như Desktop |
| GPU / nâng cao video | Benchmark GPU encoder, lưu cache; chưa có upscale AI thực | Bù chuyển động giới hạn; chưa có upscale AI 4K thực | Không có AI pipeline | Không có AI pipeline |
| PiP, Cast/AirPlay và ghi hình | Phụ thuộc nền tảng, codec | Cần kiểm thử native | Giới hạn trình duyệt | Giới hạn OS |

**Giới hạn:** CI build thành công không đồng nghĩa mọi TV/luồng IPTV/FFmpeg/Whisper/PiP hoạt động đúng trên thiết bị thật. Electron 4.23.76 là bản phát hành Stable về quy trình build và regression, không phải chứng nhận mọi tính năng hay chất lượng luồng.

## 4. Cài đặt an toàn và bản quyền

- **MacOS:** tải DMG từ release chính thức và xác minh checksum. Khi Gatekeeper báo không mở được do ứng dụng chưa ký, có thể mở từ Cài đặt hệ thống → Quyền riêng tư & Bảo mật → Vẫn mở sau khi đã kiểm tra nguồn. Không khuyến nghị vô hiệu toàn bộ Gatekeeper.
- **iOS:** IPA Beta chưa ký; cần Apple Developer certificate/provisioning hoặc dùng Web Online và thêm vào màn hình chính.
- **Dữ liệu:** sao lưu playlist/yêu thích trước khi đổi bản. Không ghi đè user data khi đăng nhập Supabase hoặc nhập dữ liệu từ đám mây.
- **Quyền nội dung:** Open IPTV Pro không cung cấp kênh; chỉ nhập M3U/URL có quyền truy cập. Smart Discovery yêu cầu xác nhận điều khoản riêng.

Tag Stable cũ v4.23.71 và các Beta không bị sửa hay ghi đè.

# Open IPTV Pro v4.23.67 — Bảng so sánh Desktop / Web / Rust Lab

**Desktop Electron** là bản chính và được hỗ trợ qua tag `v4.23.67`. **Web Online** chạy trên GitHub Pages, còn **Rust Lab v23.4** là bản thử nghiệm có gói Windows x64; không nhầm lẫn giữa các bản.

| Tiêu chí | Electron Desktop v4.23.67 | Web Online | Rust Lab v23.4 |
| --- | --- | --- | --- |
| Kênh phát hành | Stable, `main` | GitHub Pages, `web/online` | Beta, `experiment/rust-tauri-v2` |
| Thiết bị | macOS Apple Silicon/Intel, Windows x64 | Trình duyệt thiết bị tương thích | Windows x64 tải trực tiếp; chưa có DMG Mac v23.4 |
| Cài đặt | DMG/EXE/Portable | Mở URL | Setup/Portable; mã nguồn Rust ZIP |
| M3U, nhiều nguồn, nhóm kênh | Có | Có, tùy tính năng được Web hỗ trợ | Có, còn thử nghiệm |
| XMLTV/EPG | Có | Có, khi dịch vụ/nguồn cho phép | Có, còn thử nghiệm |
| FFmpeg/ffprobe native | Đóng gói | Không, browser không có native binary | Có các đường code Rust/FFmpeg, kiểm thử tùy nền tảng |
| PiP/Chuyển trang | Có tùy chọn tự động | Phụ thuộc hỗ trợ Browser PiP | Có nguyên mẫu PiP |
| Timeshift, DVR, Snapshot hàng loạt | Có khi nguồn phát cho phép | Không tương đương Desktop | Một phần, đang thử nghiệm |
| Whisper Caption / MLX Translate | Có, cần cài mô hình; MLX Apple Silicon | Không chạy local native | Whisper/Argos source-aware thử nghiệm |
| TTS tiếng Việt | Piper, VieNeu, VietVoice, F5 mẫu giọng (tải thêm) | Không tương đương | TTS thử nghiệm, không ngang Electron |
| Kiểm tra/cài phiên bản | GitHub Releases + SHA-256 + xác nhận downgrade | Truy cập Web mới | Tag/Release Rust riêng |
| Đồng bộ/sao lưu | `.iptvbackup` | Browser/cloud tùy cấu hình | Dữ liệu riêng, nên backup |

## Chọn bản nào?

- **Muốn đầy đủ tính năng và ổn định:** dùng [Electron Desktop v4.23.67](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67).
- **Muốn mở ngay không cài:** [Web Online](https://trisanghy.github.io/open-iptv-pro/). Browser có thể chặn một số stream vì CORS/DRM/autoplay.
- **Muốn thử kiến trúc gọn Rust/Tauri:** [Rust Lab v23.4](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.4), ưu tiên Windows x64, giữ bản Electron để dự phòng.

## Lưu ý về gói Release kết hợp

File Desktop v4.23.67 và file Rust Lab v23.4 cùng có mặt trong Release ổn định nhằm tiện tải, nhưng **chúng là hai phần mềm khác nhau**. File Rust không được cấp phiên bản 4.23.67 và không được dùng để cập nhật đè bản Electron. Web Online là liên kết trực tuyến, không phải bộ cài trong Release.

Xem thêm [changelog chi tiết](../RELEASE_NOTES_V4_23_67.md).
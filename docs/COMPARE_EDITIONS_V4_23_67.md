# Open IPTV Pro v4.23.67 — Bảng so sánh Desktop / Web / Rust Lab

**File Rust Lab đính kèm Stable Release đã được thay từ v23.4 lên v23.8.2.** Rust Lab Windows Setup/Portable/Source đã được cập nhật và bổ sung **hai DMG Mac ARM64/Intel build native riêng**; bản Electron và Web giữ nguyên. Bảng checksum được cập nhật để đối chiếu file mới.

**Desktop Electron** là bản chính và được hỗ trợ qua tag `v4.23.67`. **Web Online** chạy trên GitHub Pages, còn **Rust Lab v23.8.2** là bản thử nghiệm có gói Mac ARM64, Mac Intel và Windows x64; không nhầm lẫn giữa các bản.

| Tiêu chí | Electron Desktop v4.23.67 | Web Online | Rust Lab v23.8.2 |
| --- | --- | --- | --- |
| Kênh phát hành | Stable, `main` | GitHub Pages, `web/online` | Beta, `experiment/rust-tauri-v2` |
| Thiết bị | macOS Apple Silicon/Intel, Windows x64 | Trình duyệt thiết bị tương thích | Mac ARM64/Intel DMG native + Windows x64 Setup/Portable |
| Cài đặt | DMG/EXE/Portable | Mở URL | Mac DMG; Windows Setup/Portable; mã nguồn Rust ZIP |
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
- **Muốn thử kiến trúc gọn Rust/Tauri:** [Rust Lab v23.8.2](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.2), chọn DMG Apple Silicon/Intel hoặc Windows x64 phù hợp; giữ Electron để dự phòng.

## Lưu ý về gói Release kết hợp

File Desktop v4.23.67 và file Rust Lab v23.8.2 cùng có mặt trong Release ổn định nhằm tiện tải, nhưng **chúng là hai phần mềm khác nhau**. File Rust vẫn mang phiên bản 23.8.2 (không phải bản Electron 4.23.67) và không được dùng để cập nhật đè Electron. Các DMG Mac đã được kiểm tra thực tế với kiến trúc ARM64 hoặc x64 tương ứng. Web Online là liên kết trực tuyến, không phải bộ cài trong Release.

Xem thêm [changelog chi tiết](../RELEASE_NOTES_V4_23_67.md).
## Rust Lab mới nhất trong Release Stable — v23.8.15

**Chỉ thay Rust Lab v23.8.2 bằng v23.8.15** (hai DMG native Mac, Windows Setup/Portable và ZIP mã nguồn Rust). Bộ cài Electron v4.23.67, mã nguồn Electron, bản Web Online và các tag phát hành lịch sử được giữ nguyên.

**Các thay đổi nổi bật của Rust Lab v23.8.15 so với v23.8.2:**

- **PiP:** khôi phục Picture-in-Picture gốc từ WebView, không mở Tauri Mini Player hay khởi động lại video; giữ nguyên ba chế độ PiP tự động và tùy chọn đã lưu.
- **Live Caption / Translate / TTS:** ba công tắc độc lập; tắt riêng Caption không tự bật lại trong lúc phiên dịch và giọng đọc vẫn hoạt động.
- **Đồng bộ phát:** khi video dừng, kết thúc, tua hoặc đứng tải lâu, xóa phụ đề cũ và hủy Whisper/TTS đang đọc; khi phát lại tạo phiên mới, không tiếp tục đọc câu cũ.
- **TTS tiếng Việt ít trễ hơn:** nạp sẵn VieNeu, chia đoạn đầu ngắn, chuẩn bị WAV tiếp theo trong lúc đang phát; ưu tiên lời mới thay vì kéo dài hàng đợi cũ. Tốc độ thực tế phụ thuộc máy và mô hình.
- **Phụ đề trên video:** bảng CC có bật/tắt, chỉ gốc/chỉ dịch/cả hai, vị trí, kích thước, sáu font hệ thống, màu/viền/nền/độ trong suốt; lưu lựa chọn giữa các lần mở.
- **MLX/Argos:** tiếp tục hỗ trợ các mô hình dịch offline Apple Silicon, Whisper và giọng đọc Piper/VieNeu; vẫn là bản Rust/Tauri Beta độc lập.

**Mã nguồn Rust:** tag bất biến [`rust-lab/v23.8.15`](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15). **File tải và SHA-256:** nằm trong [Stable v4.23.67](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67). File Rust không được dùng để cài đè ứng dụng Electron. Bộ cài thử nghiệm có thể chưa ký số/notarize.


## Rust Lab v23.8.15 — cập nhật bộ cài trong Stable v4.23.67

**Ngày 17/11/2026:** cập nhật gói Rust Lab đính kèm từ **v23.8.2 lên v23.8.15**. Đây là bản thử nghiệm Tauri 2 riêng, *không thay Electron v4.23.67 chính thức*; không thay bản Web Online hay các tag Git lịch sử.

### Danh sách file Rust Lab mới

| Thiết bị | File chính xác |
| --- | --- |
| Mac Apple Silicon (ARM64) | [`OpenIPTVPro-RustLab-v23.8.15-mac-arm64.dmg`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-mac-arm64.dmg) |
| Mac Intel (x64) | [`OpenIPTVPro-RustLab-v23.8.15-mac-x64.dmg`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-mac-x64.dmg) |
| Windows x64 Setup | [`OpenIPTVPro-RustLab-v23.8.15-Windows-Setup-x64.exe`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-Windows-Setup-x64.exe) |
| Windows x64 Portable | [`OpenIPTVPro-RustLab-v23.8.15-Windows-Portable-x64.zip`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-Windows-Portable-x64.zip) |
| Mã nguồn Rust đúng tag | [`OpenIPTVPro-RustLab-v23.8.15-Source.zip`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-Source.zip) |
| SHA-256 Rust Lab | [`SHA256SUMS_RUSTLAB_v23.8.15.txt`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/SHA256SUMS_RUSTLAB_v23.8.15.txt) |
| SHA-256 toàn Release | [`SHA256SUMS.txt`](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/SHA256SUMS.txt) |

**Quy trình kiểm tra:** giữ nguyên checksum Electron từng byte; kiểm tra SHA-256 nguồn Windows/ZIP Rust của Release gốc; build DMG ARM64 và Intel riêng từ tag `rust-lab/v23.8.15`, mở DMG xác minh kiến trúc app và FFmpeg trước khi đăng; xác thực SHA-256 sau tải lên. Xóa các file Rust v23.8.2 cũ khỏi Stable sau khi đủ file mới.

### Điểm mới Rust Lab v23.8.15 so với v23.8.2

- **PiP chuẩn:** khôi phục PiP gốc của WebView bằng `video.requestPictureInPicture()`/`webkitSetPresentationMode` thay cho Tauri Mini Player đã thử nghiệm ở v23.8.13–v23.8.14. Không khởi động lại luồng phát.
- **Live Caption/Translate/TTS độc lập:** tắt Caption gốc không làm tắt dịch/TTS hoặc tự bật lại Caption.
- **Đồng bộ video:** dừng, tua, hết video hoặc buffer đứng lâu ngắt nhận diện, xóa sub và hủy TTS cũ; câu phụ đề mới được ưu tiên.
- **TTS giảm trễ:** chuẩn bị giọng VieNeu, đọc đoạn đầu ngắn hơn và tổng hợp đoạn WAV kế tiếp khi đoạn trước đang phát.
- **CC trực quan:** chọn ẩn/hiện, gốc/dịch/cả hai, cỡ chữ, màu, font, viền, vị trí và nền; lưu cấu hình.
- **Giữ nguyên AI:** Whisper, Argos và MLX (Hy-MT2/Qwen3 trên Apple Silicon khi đủ mô hình), Piper/VieNeu, bố cục IPTV và lưu thiết lập.

**Lưu ý:** Rust Lab là Beta; thời gian đọc phụ thuộc mô hình và phần cứng, không cam kết TTS trễ bằng 0. Các gói DMG có thể chưa được ký số/notarize.

### So sánh phiên bản

| Phần | Trước cập nhật | Sau cập nhật |
| --- | --- | --- |
| Electron Stable | v4.23.67 | **Giữ nguyên v4.23.67** |
| Web Online | GitHub Pages | **Giữ nguyên** |
| Rust Lab đính kèm | v23.8.2 | **v23.8.15** |
| Mac Rust Lab | ARM64 và Intel v23.8.2 | DMG ARM64 và Intel v23.8.15 |
| Windows Rust Lab | Setup/Portable v23.8.2 | Setup/Portable v23.8.15 |
| Rust Source/Checksum | ZIP/SHA của v23.8.2 | ZIP/SHA của v23.8.15 |

**Release Rust gốc:** [https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15) · **Stable kết hợp:** [https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67)


# Open IPTV Pro v4.23.67 — Main Stable Release

**Ngày phát hành / Release:** 17-11-2026 · **Kênh:** Desktop Electron ổn định (`main`) · **Git tag:** `v4.23.67`.

**[TẢI BỘ CÀI CHÍNH THỨC](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67) | [MỞ WEB](https://trisanghy.github.io/open-iptv-pro/) | [RUST LAB v23.4](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.4)**

## Tổng quan / Summary

Bản phát hành này nâng Desktop chính từ **v4.23.60 → v4.23.67**, đưa các sửa lỗi Live Caption, Live Translate, TTS, PiP, ffprobe, tài nguyên AI và điều khiển/kiểm tra cập nhật đã thử nghiệm thành mã nguồn chính. Tài liệu có so sánh với bản cũ và cả ba sản phẩm. Bản Web vẫn mở riêng từ GitHub Pages; Rust Lab vẫn là nhánh thử nghiệm Tauri 2 độc lập.

## Changelog chi tiết theo nhóm

### A. Live Caption / Live Translate và âm thanh

1. Whisper nhận dạng lời từ luồng IPTV theo từng đoạn; bản dịch hiển thị trong lớp phụ đề do ứng dụng tạo, không thể xóa chữ đã nằm trong khung hình gốc.
2. Sửa crash Electron khi tiến trình Hy-MT2/MLX thoát với `null` thay vì exit code; giải phóng tác vụ và bộ đếm thời gian, thông báo lỗi thay vì làm sập ứng dụng.
3. Khi bộ dịch MLX lỗi, có thể dùng Argos đã cài nếu cặp ngôn ngữ hỗ trợ; không tự tải thêm mô hình hoặc giả vờ dịch được mọi ngôn ngữ.
4. TTS dùng bộ điều phối nghe thử riêng: không chồng âm, có thể hủy tác vụ đang tổng hợp, ngắt khi đổi model/bộ dịch, giới hạn thời gian; đọc lại phụ đề đang đến (giữ câu mới nhất còn chờ).
5. Chọn nhiều giọng tiếng Việt: Piper, VieNeu (48 kHz), VietVoice (6 giọng nam/nữ theo Bắc–Trung–Nam) và F5-TTS Vietnamese (cần WAV tham chiếu và câu nói đúng, có xác nhận quyền sử dụng).
6. Khi bật TTS, người dùng chỉnh tốc độ phát và tỷ lệ âm lượng nguồn gốc; năng lực, tốc độ và chất lượng phụ thuộc RAM/CPU/GPU/MLX.

### B. PiP / video / công cụ

1. Chuyển sang Quản lý nguồn, EPG, Yêu thích hoặc Cài đặt có thể bật PiP cho kênh đang phát; trở lại Xem truyền hình sẽ tắt PiP.
2. Có tùy chọn bật PiP khi thu nhỏ app hoặc đưa ứng dụng khác lên trên; nhận diện che cửa sổ phụ thuộc khả năng Electron/macOS/Windows nên không đảm bảo mọi tình huống.
3. Tích hợp ffprobe đi kèm ffmpeg để luồng và VietVoice không cần người dùng tự cài `ffprobe` vào PATH.
4. Thanh AI được sắp thành **hai hàng có nhóm logic**: Caption + Translate + cài đặt và menu Công cụ ở hàng trên; giọng TTS + ngôn ngữ + giọng + tốc độ + âm lượng gốc ở hàng dưới. Thu hẹp các nút, tránh dòng trống, tự đáp ứng màn hình nhỏ.

### C. Cập nhật & quản lý mô hình

1. Cài đặt → Cập nhật phiên bản: lấy danh sách Release từ repository chính thức, tách bản **Ổn định** và **Beta**; chọn bản cũ hoặc cài lại bản hiện tại.
2. Chỉ hiển thị bộ cài đúng hệ điều hành/kiến trúc, có digest SHA-256 của GitHub hoặc `SHA256SUMS.txt`. Nội dung tải được băm SHA-256 và kiểm tra trước khi mở file.
3. Hạ phiên bản/cài lại yêu cầu đồng ý và khuyến nghị backup; thao tác chọn bản không kích hoạt auto-installer cho bản cũ. Trên Mac mở DMG thủ công; Windows giữ cơ chế Setup/Portable hiện có.
4. Trang Bộ nhớ AI liệt kê mô hình đã tải, dung lượng, xóa riêng; gợi ý RAM/CPU/Apple Silicon/MLX/ổ đĩa theo từng model (ước tính, không phải yêu cầu cấu hình chính thức).
5. Sửa công cụ build Mac cá nhân: chỉ xuất `.app`, tự mở Finder, mã nguồn lấy từ nhánh cố định `build-sources/electron-desktop`. Phiên bản Release dùng tag bất biến.

### D. Tính năng giữ nguyên

- M3U file/URL, nhiều nguồn, gộp và sửa link, thư mục, yêu thích, tìm kiếm/khám phá.
- EPG XMLTV, MultiView 4 kênh, Snapshot, Smart IPTV Doctor, kiểm tra sức khỏe kênh/Failover, phát link dự phòng.
- Timeshift, DVR/ghi hình, Cast/Chromecast, AirPlay qua Safari khi hỗ trợ, tùy chỉnh màn hình/theme, cấu hình và Backup/Restore.
- Bản Web không bị thay thế, mã nguồn Rust/Tauri không được nhập vào Electron chính.

## So sánh v4.23.60 → v4.23.67

| Hạng mục | v4.23.60 | v4.23.67 |
| --- | --- | --- |
| Thanh Live Caption/Translate/TTS | Có chức năng, bố trí dài | Hai nhóm/hàng ngắn gọn, Công cụ nằm cùng hàng phụ đề |
| Giọng đọc tiếng Việt | Piper / VieNeu | Thêm VietVoice vùng miền / F5-TTS mẫu giọng (kèm lựa chọn cũ) |
| Nghe thử khi live subtitle liên tục | Có nguy cơ chiếm hàng đợi | Hủy được, timeout, phục hồi câu phụ đề mới nhất |
| Lỗi MLX exit-code null | Có thể ném lỗi main-process | Xử lý an toàn và dùng Argos đã cài khi phù hợp |
| PiP khi rời trang/thu nhỏ | Chủ yếu thao tác thủ công | Tùy chọn tự PiP theo điều hướng và trạng thái cửa sổ khi OS hỗ trợ |
| VietVoice ffprobe | Có thể báo thiếu binary | Có ffprobe được đóng gói cùng app |
| Gợi ý phần cứng AI | Không chi tiết theo model | RAM/CPU/GPU/MLX/ổ đĩa tham khảo trên từng model |
| Kiểm tra cập nhật | Kiểm tra bản mới | **Chọn bản ổn định, Beta và bản cũ**, SHA-256 và xác nhận downgrade |
| IPTV cơ bản/EPG/M3U/FFmpeg/DVR | Có | Giữ nguyên, tiếp tục hỗ trợ |

## Download / Release Assets: Electron Desktop stable

| Hệ điều hành | File chính xác |
| --- | --- |
| macOS Apple Silicon | `Open-IPTV-Pro-4.23.67-mac-arm64.dmg` |
| macOS Intel x64 | `Open-IPTV-Pro-4.23.67-mac-x64.dmg` |
| Windows x64 Setup | `Open-IPTV-Pro-Setup-4.23.67-x64.exe` |
| Windows x64 Portable | `Open-IPTV-Pro-4.23.67-x64.exe` |
| Source tại commit stable main | `OpenIPTVPro_Source_v4.23.67.zip` |
| Kiểm tra toàn bộ file tải | `SHA256SUMS.txt` |

Các bộ cài Electron đã được build và kiểm thử tại [Electron v4.23.67 Beta](https://github.com/trisanghy/open-iptv-pro/releases/tag/electron-v4.23.67); bản Main Release sao chép chính xác các binary đó sau khi xác minh SHA-256, còn **source ZIP được tạo từ commit stable main**, có cả tài liệu Web/Rust và bảng so sánh.

## Web Edition / Bản Web Online

**Mở trực tiếp:** https://trisanghy.github.io/open-iptv-pro/
**Hướng dẫn Web:** https://trisanghy.github.io/open-iptv-pro/huong-dan.html
**Mã nguồn Web:** https://github.com/trisanghy/open-iptv-pro/tree/web/online

Web không cần cài, thích hợp khi codec và bảo mật trình duyệt cho phép. Không có quyền truy cập native FFmpeg/Electron IPC/MLX/TTS offline như Desktop. Bản phát hành Desktop không thay đổi nhánh `web/online` hoặc dữ liệu Web đang được lưu.

## Rust/Tauri Lab v23.4 (bản thử nghiệm độc lập được giới thiệu trong Release)

**Release gốc Rust Lab:** https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.4

**Các file Rust Lab được đính kèm lại trong Release chính (không thay thế Electron):**

| Rust Lab 23.4 | File |
| --- | --- |
| Windows x64 Setup | `OpenIPTVPro-RustLab-v23.4-Windows-Setup-x64.exe` |
| Windows x64 Portable | `OpenIPTVPro-RustLab-v23.4-Windows-Portable-x64.zip` |
| Source Rust Lab | `OpenIPTVPro-RustLab-v23.4-Source.zip` |
| SHA-256 gốc Rust | `SHA256SUMS_RUSTLAB_v23.4.txt` |

Rust Lab v23.4 hướng tới backend Tauri 2/Rust gọn hơn, có thử nghiệm Whisper nhận diện ngôn ngữ gốc và dịch Argos offline theo tuyến phù hợp trước khi TTS. Đây là Beta, chức năng chưa đầy đủ/bảo đảm như Electron chính. **Release v23.4 hiện không có gói cài Mac**; không dùng DMG Rust đời cũ gắn tên v23.4.

## Kiểm thử / bảo mật / giới hạn

- Nhánh Electron v4.23.67: **399 kiểm thử tổng, 394 đạt, 0 lỗi, 5 bỏ qua**. Native `.app` Mac ARM64 đã được build xác minh; DMG/EXE của hai kiến trúc Mac/Windows đã được tạo và xuất bản trước đó.
- Kiểm tra checksum gốc của tất cả binary Electron và Rust trước khi tái xuất trong Release stable, sau đó phát hành bảng SHA-256 cho toàn bộ file.
- TTS F5 Vietnamese checkpoint có hạn chế thương mại **CC-BY-NC-4.0**; chỉ dùng giọng cá nhân với sự cho phép. Các mô hình AI nặng cài riêng, có thể gây tốn RAM/điện năng và không đảm bảo thời gian thực.
- Chưa cam kết chữ ký ứng dụng Apple/Windows; nếu hệ điều hành cảnh báo, chỉ mở khi đã kiểm chứng file tải chính thức. Nội dung IPTV phải thuộc nguồn được phép.
- Backup trước khi dùng bản cũ; dữ liệu định dạng mới có thể không tương thích ngược.

## English summary

Stable v4.23.67 promotes the verified Electron desktop improvements to main: cleaner Live Caption / Translate / TTS control groups; cancelable Vietnamese multi-voice preview and local MLX crash recovery; PiP automation; bundled ffprobe; per-model hardware hints; and a selectable, SHA-256-verified GitHub release history with explicit downgrade consent. This Release provides macOS ARM64/Intel and Windows x64 installers, an exact main-commit source ZIP and checksums; links to the browser Web Edition; and clearly labels the independently maintained Rust/Tauri Lab v23.4 Windows beta, with verified downloadable assets.

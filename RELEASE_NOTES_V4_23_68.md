# Open IPTV Pro v4.23.68 — Stable Electron + Rust Lab v23.8.26 Beta + Web Online
Ngày: 18/11/2026

## Thành phần phát hành và nguồn

| Gói | Phiên bản / nguồn | Asset sau khi phát hành |
|---|---|---|
| Electron Desktop — bản chính | 4.23.68 · commit c8a18e83f242246c7f93d4445765ee1f040b8f10 | DMG Mac ARM64/Intel, Windows Setup/Portable |
| Rust/Tauri Lab — Beta độc lập | 23.8.26 · commit 04b0fd2e6110e3165bef62fb9b7155651f9dd4c9 | DMG Universal, Windows Setup/Portable, ZIP source |
| Web Online | commit 787c73a00b1be51fd5970a204d50d8bc9fcfad91 | ZIP website + mã nguồn từ web/ |
| Mã nguồn đầy đủ | main tại tag v4.23.68 | ZIP chứa Electron + Rust + Web + tài liệu + kiểm thử |
| SHA-256 | Kiểm tra toàn vẹn file Release | SHA256SUMS.txt và checksum Rust gốc |

## Electron Desktop 4.23.68

**AI offline:** Live Caption, Live Translate, TTS và tùy chọn giọng/tốc độ/ngôn ngữ. Lưu ba công tắc và khôi phục khi chạy lại, bao gồm khởi tạo engine TTS. Khi cả ba đang tắt, bật TTS mở các thành phần phụ thuộc; tắt Caption khi cả ba đang bật áp dụng quy tắc tắt nhóm đã thiết kế. Mô hình AI cần cài và tài nguyên máy phù hợp.

**Hiển thị CC:** dòng dài xuống hàng thay vì cắt; màu/font/cỡ chữ/vị trí/viền/nền và hiển thị tiếng gốc/dịch/cả hai. Fullscreen dùng lớp phụ đề trong player; PiP ưu tiên ghép CC vào hình khi tương thích, còn luồng bị CORS/DRM có thể rơi về PiP gốc không có CC.

**Đồng bộ video:** Tạm dừng giữ nguyên khung hình và kênh, chặn auto-resume từ sự kiện cũ; ngừng tải HLS.js/DASH khi hỗ trợ. Dừng hẳn giải phóng luồng HLS/DASH/FFmpeg, đóng PiP, xóa video; Play mở lại kênh vừa chọn. Với HLS native, trình duyệt/Chromium vẫn có thể quản lý bộ đệm riêng.

**Giao diện:** Công cụ nhanh cố định; ảnh kênh ưu tiên snapshot, rồi logo, rồi ký hiệu tên; sửa Bento nền sáng sai và bỏ banner chào mừng; cải thiện màu Sáng/Tối/AMOLED qua 11 preset. Cinema TV/Glassmorphism/Broadcast có nút ẩn/hiện panel Kênh hiện tại, video giãn rộng và tự lưu trạng thái.

**IPTV:** giữ nhiều nguồn M3U, EPG, nhóm, yêu thích, link dự phòng và tự chuyển, MultiView, Cast/AirPlay, DVR/tua lại/snapshot/FFmpeg; khả dụng tùy codec, luồng và OS.

**Kiểm thử nguồn Electron:** workflow ngày 18/11/2026 ghi nhận 466 bài; 461 đạt, 0 lỗi, 5 bỏ qua; build app Mac đạt. Nguồn đã quảng bá sang main được kiểm thử và build installer lại riêng trước khi tạo Release.

## Rust Lab 23.8.26 — Beta

- Responsive thật theo container: player và hàng nút tự sắp 1/2/4 hàng ở các kích thước khác nhau, tránh chồng nút trong cửa sổ Mac nhỏ.
- TTS chuyển từ 8 cột sang 6/4/2 ở các ngưỡng 1120/685/455 px; giữ cặp nhãn và hộp chọn, dòng trạng thái tách riêng.
- Công cụ nhanh luôn mở, ba nút một hàng; ba hộp chọn Luồng kiểm tra/Snapshot/Thời lượng tua lại dùng 1–32.
- Tiếp tục giữ PiP/CC/Translate/TTS và engine Rust/Tauri. Đây là Beta, không được coi là tương đương hoặc thay thế ứng dụng Electron.
- Release hiện hữu: https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.26 . Ghi chú nguyên bản nằm tại rust-lab/RELEASE_NOTES_RUST_LAB_V23_8_26.md.

## Web Online

- Giao diện trình duyệt, playlist M3U, EPG, tự mở kênh gần nhất khi được trình duyệt cho phép; điều khiển âm lượng.
- Cloud Sync/Supabase (khi được cấu hình) có đăng nhập email/OTP/đường liên kết và dữ liệu riêng cho từng người dùng.
- Trình duyệt có thể chặn stream CORS, mixed content, autoplay hoặc codec; Web không thay thế chức năng native FFmpeg của desktop.
- Web chạy tại https://trisanghy.github.io/open-iptv-pro/ . Bản sao mã nguồn và static site nằm trong web/ trên main.

## Cài đặt, bản quyền và checksum

- Chọn DMG đúng Mac Apple Silicon/Intel hoặc Windows Setup/Portable; RustLab có tên file riêng.
- Sao lưu playlist/yêu thích/cài đặt trước khi đổi nền tảng; không cài Rust Lab đè Electron.
- File cài đặt có thể chưa ký/notarize, chỉ tải GitHub chính thức và so sánh SHA256SUMS.txt.
- Không cung cấp playlist IPTV bản quyền; quyền xem phụ thuộc nhà cung cấp.

Các tag, release và installer cũ giữ nguyên, không force-push.

**Tài liệu:** [Cài đặt](docs/INSTALL_V4_23_68.md) · [So sánh tính năng](docs/COMPARE_EDITIONS_V4_23_68.md) · [Nguồn và commit](docs/RELEASE_SOURCE_MAP_V4_23_68.md)

## English

Open IPTV Pro v4.23.68 consolidates the tested Electron desktop 4.23.68, the independent Rust Lab 23.8.26 Beta and the current Web Online source. The Release includes Windows and Mac installers, Rust Lab artifacts, Web ZIP, complete source, release notes, instructions, and SHA-256 checksums only after the build and verification gates succeed. Existing tags and releases are preserved.

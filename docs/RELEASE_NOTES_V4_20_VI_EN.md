# Open IPTV Pro v4.20.0 — Sửa cập nhật phiên bản / Update fix

## Tiếng Việt

- Sửa cơ chế kiểm tra GitHub Releases, tải bản mới và các thông báo lỗi.
- Nếu không thể tự cài qua Electron Updater, tự chuyển sang tải bộ cài DMG/EXE được xác minh SHA256.
- Không hiện nút tải khi Release không có bộ cài đúng nền tảng hoặc không thể xác minh file.
- Sửa GitHub Actions: build Mac Intel và Apple Silicon riêng để đóng gói FFmpeg đúng kiến trúc; tạo chung `latest-mac.yml` cho cả hai bản.
- Giữ nguyên FFmpeg nhúng, Timeshift, Snapshot 32 luồng, MultiView, Doctor 2.0 và tám ngôn ngữ.

**Lưu ý:** Để tính năng cập nhật hoạt động, Release phải chứa DMG/EXE, `SHA256SUMS.txt`, `latest.yml`, `latest-mac.yml` và ZIP Mac. Cập nhật cài trực tiếp trên macOS yêu cầu ký Apple Developer ID; bản chưa ký dùng mở DMG thủ công.

## English

- Fixed GitHub Releases version checks, download flow, and actionable error messages.
- Automatic installation failures fall back to a SHA256-verified DMG/EXE download.
- Missing installers or checksums are reported explicitly; unsafe downloads are blocked.
- Separate native Intel and Apple Silicon macOS builds bundle the correct FFmpeg executable and share a combined macOS updater manifest.
- All existing features, bundled FFmpeg, five-minute Timeshift and eight interface languages are retained.

**Note:** Signed macOS builds and proper Release assets are required for seamless in-app installation. Unsigned installations use a verified manual installer.

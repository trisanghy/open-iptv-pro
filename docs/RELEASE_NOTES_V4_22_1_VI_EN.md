# Open IPTV Pro v4.22.1 — Ổn định Windows và macOS

## Tiếng Việt

- Sửa quá trình tải bản cập nhật: xử lý an toàn giới hạn dung lượng và ngắt kết nối khi dữ liệu ngừng tải, tránh lỗi không được bắt.
- Kiểm tra bộ cài thực tế sau khi build: Mac phải có DMG/ZIP đúng kiến trúc; Windows phải có Setup và Portable.
- Cập nhật phiên bản hiển thị trên cửa sổ, ngăn điều hướng khỏi file giao diện chính và giới hạn bộ nhớ thông báo FFmpeg.
- Bảo toàn FFmpeg nhúng, Timeshift, Snapshot 32 luồng, MultiView, Cast/AirPlay, Doctor, EPG và 8 ngôn ngữ.
- Không thay đổi mã nguồn Android/iOS. Không cung cấp playlist hay nội dung truyền hình.

## English

- Make updater downloads resilient: safely enforce a size limit and stop stalled downloads without uncaught event-handler exceptions.
- Verify actual installer outputs: architecture-specific DMG and ZIP on macOS; Setup and Portable EXE on Windows.
- Fix stale window version, restrict renderer file navigation, and bound FFmpeg error output.
- Retain bundled FFmpeg, Timeshift, snapshots, MultiView, Cast/AirPlay, EPG, Doctor, and all eight languages.
- No changes to Android/iOS. No channels or playlists included.

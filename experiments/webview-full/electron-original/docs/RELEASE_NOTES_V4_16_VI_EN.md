## Tiếng Việt

**Open IPTV Pro v4.16.0** bổ sung kiểm tra cập nhật ngay trong ứng dụng, thông báo khi có bản mới, tải về có thanh tiến độ và xác minh checksum SHA256.

- Windows và macOS: tự cập nhật khi bộ cài đã được ký và có đủ metadata `latest.yml` / `latest-mac.yml`.
- Máy dùng bản chưa ký hoặc portable: tải bộ cài đã xác minh và yêu cầu mở cài đặt thủ công.
- Có nút tự kiểm tra khi mở ứng dụng, xem thông tin phát hành và thông báo lỗi rõ ràng.
- Không cập nhật Android/iOS; dữ liệu M3U, Yêu thích và Snapshot vẫn nằm trong dữ liệu ứng dụng.

**Lưu ý:** Muốn cập nhật tự cài trên macOS cần ứng dụng ký Developer ID và notarize; Windows nên ký mã số để cập nhật an toàn. Release chỉ chứa mã nguồn không thể tự cài.

## English

**Open IPTV Pro v4.16.0** introduces in-app release checking, update notifications, progress-aware downloads, SHA256 verification, and user-approved installation.

- Signed macOS and Windows installers with valid update manifests support automatic installation.
- Unsigned/portable installations use a verified installer download with manual install confirmation.
- Clear messages distinguish missing releases, incompatible installers and download errors.
- No Android/iOS changes. Local playlists, favorites and snapshots remain stored in user data.

**Important:** macOS automatic installation requires a Developer ID signed/notarized app; Windows code signing is recommended. Source-only releases cannot be installed automatically.

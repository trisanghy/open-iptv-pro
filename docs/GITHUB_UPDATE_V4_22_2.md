# Cập nhật mã nguồn GitHub v4.22.2

Repository: `trisanghy/open-iptv-pro` (nhánh mặc định).

- Bộ nguồn và README hiện ghi **v4.22.2**, có đầy đủ Backup/Restore.
- Phải đăng nhập `gh` bằng tài khoản có quyền push và chỉnh About.
- Script chỉ cập nhật desktop (Windows/macOS) và tài liệu, **không** `force-push`, không xóa nội dung iOS/Android, không tự tạo tag/Release.
- Script luôn hiển thị danh sách file và yêu cầu nhập `CAP NHAT` trước khi thay đổi GitHub.
- Sau push, script kiểm tra commit trên nhánh mặc định, so sánh hash remote `README.md`, `CHANGELOG.md`, `package.json`, `src/backup-service.cjs`, `docs/RELEASE_NOTES_V4_22_2_VI_EN.md`, và xác nhận mô tả About.
- Thông báo `XAC NHAN HOAN TAT` chỉ xuất hiện khi **cả ba** kết quả: mã nguồn, README/Changelog và About đều đã khớp.
- Không xuất hiện `XAC NHAN HOAN TAT` => xem dòng `LOI` hoặc `CANH BAO` trong Terminal. Không được coi đây là bản đã publish.

**Để build bộ cài**: phải chạy workflow phát hành riêng và cung cấp file đúng cấu trúc/kiến trúc trong GitHub Releases.

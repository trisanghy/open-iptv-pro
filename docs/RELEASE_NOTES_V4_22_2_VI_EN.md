# Open IPTV Pro 4.22.2 — Backup & Restore (desktop)

## Tiếng Việt

- Thêm **Sao lưu / Khôi phục** trong thanh công cụ và trang **Cài đặt** trên Windows/macOS.
- Xuất **một file `.iptvbackup`** gồm playlist M3U đã lưu, các kênh, yêu thích, thư mục, giao diện, EPG, cấu hình nâng cao, hồ sơ và thiết lập Doctor.
- Tùy chọn **kèm ảnh Snapshot** đang được lưu tại máy (ảnh được nhúng vào file sao lưu).
- Restore kiểm tra định dạng và checksum SHA-256 của từng ảnh, hiển thị số lượng nguồn, kênh và ảnh trước khi hỏi xác nhận.
- Khi khôi phục, ảnh được ghi với tên mới, tránh ghi đè ảnh cũ; dữ liệu localStorage được đổi theo một giao dịch có rollback nếu có lỗi ghi.
- File sao lưu không được mã hóa; ai có file có thể đọc nội dung. Hãy tự bảo vệ file khi lưu, gửi hoặc chia sẻ.
- Không sao lưu cache Timeshift tạm thời hoặc bộ cài ứng dụng. Tệp sao lưu tối đa 128 MB, có thể bỏ chọn Snapshot nếu file quá lớn.
- Chỉ tập trung bản desktop. Chưa thay đổi bản Android/iOS; chưa tự phát hành lên GitHub.

## English

- Added desktop Backup/Restore controls to the sidebar and Settings (Windows/macOS).
- Export a single `.iptvbackup` containing saved playlists, favorites, folders, profiles, advanced settings, EPG settings/cache, app appearance and Doctor preferences.
- Optional embedded channel snapshot JPEGs; restore validates snapshot SHA-256 and avoids overwriting existing images.
- Preview and confirm restore before replacing local data; localStorage restoration rolls back on failure.
- Backups are **not encrypted**. Protect the file; embedded URLs may contain credentials. Ephemeral Timeshift buffers and application installers are excluded.
- 128 MB maximum backup file size. Mobile builds are unchanged, and this source update is not published automatically.

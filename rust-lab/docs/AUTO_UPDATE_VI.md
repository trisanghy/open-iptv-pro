# Sửa chức năng cập nhật – v4.20.0 (Windows/macOS)

**Quan trọng:** Push mã nguồn lên nhánh `main` không tạo bản cập nhật. Cần phát hành GitHub Release **stable** có bộ cài chính thức.

1. Build bản v4.20.0 bằng workflow `.github/workflows/release-desktop.yml` trên GitHub Actions sau khi tạo tag `v4.20.0`. Workflow tạo bộ cài Windows Setup `.exe`, Mac `.dmg` + `.zip` theo ARM/Intel, `latest.yml`, `latest-mac.yml` và `SHA256SUMS.txt`.
2. Người dùng cài v4.20.0 lần đầu bằng DMG/EXE từ GitHub Releases. Sau đó mở **Cài đặt → Cập nhật phiên bản**; tự kiểm tra/tự tải có thể tắt riêng.
3. Nếu có Release phiên bản cao hơn, ứng dụng tải với thanh tiến độ. Nếu máy có chữ ký phù hợp và metadata đầy đủ, sẽ có nút **Cài đặt và khởi động lại**.
4. Với bản Mac chưa ký, Windows unsigned hoặc Portable, ứng dụng chỉ tải bộ cài DMG/EXE **sau khi xác minh SHA256**, rồi hiển thị **Mở bộ cài đã tải**. Không tự chạy file chưa ký.
5. Nếu Release chưa có bộ cài hoặc checksum, ứng dụng báo thiếu thành phần; không báo nhầm là đã cập nhật.

### Vì sao bản trước không cập nhật được?

- `/releases/latest` chỉ liệt kê **Release stable**. Commit mới ở `main` hoặc tag chưa có Release không được coi là bản phát hành.
- Để tự cập nhật macOS phải có ứng dụng đã ký Apple Developer ID; DMG chưa ký chỉ cài thủ công. Windows dùng Setup NSIS và chữ ký thích hợp; Portable mở bộ cài thủ công.
- `latest-mac.yml` phải chứa link ZIP cho **cả arm64 và x64**; nếu build riêng mà ghi đè metadata, một kiến trúc sẽ không cập nhật được.
- Release phải có `SHA256SUMS.txt` để bản chưa ký tải xuống an toàn.

### Chủ repository – phát hành v4.20

Sau khi push mã nguồn (có workflow mới) lên `main`, tạo tag `v4.20.0` và push tag lên GitHub. Theo dõi tab **Actions** đến khi job `release` thành công rồi kiểm tra tab **Releases**. Workflow sẽ bổ sung các bộ cài vào Release. Trường hợp workflow lỗi, không nên tạo một Release chỉ chứa source code và coi là cập nhật xong.

**Không đưa token, private key, playlist cá nhân lên GitHub.** Android/iOS không thay đổi. Giữ FFmpeg nhúng và Timeshift đầy đủ.

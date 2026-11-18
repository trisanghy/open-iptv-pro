# Hướng dẫn Backup / Restore — Open IPTV Pro 4.22.2

**Nền tảng:** Windows/macOS (Electron). Không thay đổi iOS/Android.

## Backup

1. Mở Open IPTV Pro → **Cài đặt** → **Sao lưu & Khôi phục dữ liệu**; hoặc nhấn **Sao lưu / Khôi phục** ở sidebar.
2. Đánh dấu **Kèm ảnh Snapshot đã lưu trên máy** nếu muốn giữ ảnh chụp kênh (mặc định bật).
3. Nhấn **Tạo file Backup**, chọn thư mục, đặt tên, lưu file `.iptvbackup`.
4. Ứng dụng thông báo số nguồn, kênh, ảnh đã đóng gói. Ảnh bị thiếu trong máy được bỏ qua để tránh lỗi khi phục hồi.

## Restore

1. Nên tạo một file Backup mới của dữ liệu hiện tại trước khi khôi phục.
2. Nhấn **Restore từ file**, chọn `.iptvbackup`.
3. Xem thông tin ngày tạo, phiên bản, số nguồn/kênh/ảnh và xác nhận nếu đồng ý thay **toàn bộ** dữ liệu ứng dụng hiện tại.
4. Ứng dụng khôi phục ảnh ở tên file mới, ghi cài đặt, rồi tải lại giao diện. Không cần cài lại ứng dụng.

## Lưu ý bảo mật và giới hạn

- **File `.iptvbackup` là JSON UTF-8 không mã hóa**: có thể chứa playlist, URL gồm token/tên đăng nhập, PIN hồ sơ ở dạng ứng dụng lưu; **đừng đăng công khai**.
- Khôi phục là **thay thế** chứ không gộp nguồn IPTV hiện có. Không bao gồm Timeshift đệm tạm, video đang phát hay chính chương trình Electron.
- Tệp có giới hạn 128 MB, tối đa 2.000 ảnh JPG / 96 MB dữ liệu ảnh. Nếu vượt quá, bỏ chọn ảnh Snapshot trước khi xuất.
- File mở được giữa Windows/macOS. URL file M3U cục bộ đã được nhập là dữ liệu kênh, không cần máy nhận còn file M3U gốc.
- Không có tự sao lưu định kỳ trong bản này. Chưa bao gồm mã hóa hoặc đồng bộ cloud.
- Code bảo vệ phiên nhập bằng token, xác minh SHA-256 ảnh, chống tên ảnh traversal và kiểm tra schema trước khi khôi phục.

## Build trên Mac

Giải nén nguồn, chạy `bash BUILD_MAC.command` hoặc theo `docs/BUILD.md` (máy phải có công cụ build tương thích). Trên Windows dùng `BUILD_WINDOWS.bat`.

## Kiểm thử

Chạy `npm test`, bao gồm bộ test `tests/backup.test.cjs`. Đây là kiểm thử logic nguồn; việc chạy và đóng gói app cần thực hiện trên máy macOS/Windows tương ứng.

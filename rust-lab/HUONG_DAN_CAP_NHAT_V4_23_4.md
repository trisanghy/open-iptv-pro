# Open IPTV Pro v4.23.4 — Hẹn giờ ghi hình trong Timeshift

## Tính năng
- **Xem truyền hình → Timeshift 5 phút → ⏺ Hẹn giờ ghi hình**: Chọn kênh đang xem, đặt giờ bắt đầu/kết thúc, lưu sau khi xác nhận.
- **Trạng thái ghi hình** luôn ở ngay thanh Timeshift: Chưa ghi, sắp ghi, đang ghi.
- **Xem lịch ghi** chuyển tới trang EPG để hủy, dừng hoặc mở bản ghi.
- Bảng **Tiến độ tác vụ** ở cuối vùng ứng dụng, trên footer, không còn phủ lên nút điều khiển.

## Lưu ý
DVR chỉ ghi được khi ứng dụng đang chạy và máy không ngủ; nguồn HLS/MPEG-TS hợp lệ và quyền truy cập là bắt buộc. Trạng thái được đọc từ DVR gốc trong Electron. Thay đổi giao diện này không tự ghi khi máy tắt.

## Kiểm tra
- `npm test`
- `python tests/ui_dvr_v4233.py`
- `python tests/ui_dvr_quick_v4234.py`

## Build
- Mac: `bash BUILD_MAC.command`
- Windows: `BUILD_WINDOWS.bat` từ thư mục gốc có `package.json`, dùng Developer Mode hoặc Administrator khi cần tạo symbolic link cho electron-builder.

Chưa push GitHub, chưa build DMG/EXE thực tế.

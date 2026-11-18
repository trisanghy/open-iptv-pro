# Rà soát desktop v4.22.1 / Desktop stability review

## Phạm vi
Chỉ Windows và macOS. Không thay đổi Android/iOS, không bỏ FFmpeg, Timeshift, MultiView, Snapshot, Cast, AirPlay hay 8 ngôn ngữ.

## Đã sửa
- `src/update-manager.cjs`: dùng `Transform` để phát hiện vượt 3 GB qua luồng lỗi đúng cách thay vì `throw` trong callback `data` (có thể làm tiến trình Electron kết thúc). Kết nối tải quá 90 giây không có dữ liệu sẽ bị hủy, không áp đặt thời gian tối đa lên toàn file.
- `BUILD_MAC.command` / `scripts/BUILD_WINDOWS_AUTO.ps1`: chỉ báo thành công nếu có các file build chính xác, dung lượng file Windows không bất thường.
- `src/main.cjs`: tiêu đề đồng bộ phiên bản ứng dụng, không cho điều hướng tùy ý sang các file `file://` khác, giới hạn stderr FFmpeg.
- Workflow tag release dùng đúng ghi chú phiên bản 4.22.1 (tiếng Việt trên, tiếng Anh dưới).

## Đã kiểm tra / Verified
- `npm test`: bài kiểm thử Node.js.
- Cú pháp `bash -n` cho Mac build/publish scripts, `node --check` cho JS, cú pháp YAML cơ bản.
- Kiểm tra file đóng gói bằng ZIP và mẫu danh sách file.

## Chưa thể kiểm tra / Not verified
- Không thể build DMG/EXE thật trong môi trường Linux hiện tại. Không thể thử playback trên Windows/Mac thật hay thiết bị AirPlay/Chromecast thật.
- npm registry không kết nối được, vì vậy **chưa tạo được `package-lock.json`**. Không tạo lockfile giả.
- Đẩy repository GitHub phải được thực hiện bằng tài khoản đã xác thực trên Mac hoặc GitHub connector. Chưa xác nhận push, CI, Release.

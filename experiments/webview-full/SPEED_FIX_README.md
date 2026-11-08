# Open IPTV Pro v4.19 WebView — Speed Fix (32 luồng thật)

## Lỗi cũ

Giao diện WebView thực hiện 32 lời gọi HTTP localhost riêng lẻ và giữ mỗi kết nối cho đến khi kiểm tra hoặc FFmpeg kết thúc. Một số phiên bản WKWebView/WebView2 giới hạn số kết nối song song tới cùng hostname, gây xếp hàng dù UI báo 32 luồng. Snapshot thất bại URL gốc có thể chờ 22 giây rồi lại chờ 22 giây qua proxy. Giao diện cũng thường xuyên lưu và vẽ lại toàn bộ danh sách ảnh. Chỗ sửa link dự phòng lưu cấu hình từng kênh thay vì từng lô.

## Đã sửa

1. Gửi cả **lô** vào Node backend bằng API `batch:start`; mỗi lần thăm tiến độ `batch:status` kết thúc nhanh và trả tối đa 250 kết quả. `batch:cancel` ngăn khởi động các việc còn nằm trong hàng; việc đang chạy kết thúc bình thường.
2. Bộ kiểm tra, snapshot và kiểm tra/thay URL dự phòng đều có **tối đa 32 worker trong backend** thật; không còn phụ thuộc trần kết nối HTTP trong trình duyệt của WebView.
3. Các URL trùng nhau trong một lượt kiểm tra dùng chung Promise. Khẳng định kênh sống sau bằng chứng media thật; các lỗi 404/410 cần nhiều lần để xác nhận, lỗi mơ hồ vẫn UNKNOWN.
4. Manifest HLS đã tải không bị tải lần thứ hai; nguồn `.m3u8` không gửi Range không cần thiết.
5. Snapshot FFmpeg sử dụng 1 luồng decode/filter mỗi process để giảm tranh chấp CPU khi chạy nhiều tiến trình; giảm `analyzeduration` / `probesize` và giới hạn thời gian chờ 11 giây nguồn gốc + 15 giây proxy (tối đa 26 giây, so với 44 giây cũ). **Không loại FFmpeg/FFprobe hoặc Timeshift.**
6. Snapshot/kiểm tra kênh cập nhật giao diện vài lần/giây, lưu dữ liệu định kỳ thay vì mỗi ảnh/kênh. Gộp và sửa link dự phòng lưu metadata theo lô.

## Kiểm thử

- 62/62 bài kiểm thử Electron gốc đạt.
- 15/15 bài kiểm thử WebView/FFmpeg/API đạt, gồm HTTP RPC thật và JPEG thật.
- Test tải mô phỏng: 96 kênh, mỗi kênh 75 ms, đạt đỉnh 32 worker và hoàn tất phần xử lý trong khoảng 0,25 giây. Đây **không phải phép đo tốc độ IPTV internet**; tốc độ thật còn tùy CPU, băng thông, timeout và nguồn kênh.
- Chưa chạy GUI Tauri trên Mac/Windows hoặc build DMG thật trong môi trường hiện tại.

## Cài trên Mac

Mở Terminal, tại `~/Downloads` chạy:

```bash
unzip -o OpenIPTV_WebView_SPEED_FIX_v4_19.zip
bash ~/Downloads/OpenIPTV_WebView_SPEED_FIX_v4_19/APPLY_SPEED_FIX_MAC.command
```

Script tìm source WebView gần nhất ở Downloads, sao lưu mã nguồn cũ ra `~/Downloads/OpenIPTV_SpeedFix_Backups/`, áp dụng các file thay đổi và chạy `BUILD_MAC.command` tạo DMG. Nếu mã nguồn không ở thư mục mặc định, truyền đường dẫn thư mục source làm đối số đầu tiên. Để chỉ vá mà không build, thêm đối số `--no-build` sau đường dẫn dự án.

Ví dụ: `bash ~/Downloads/OpenIPTV_WebView_SPEED_FIX_v4_19/APPLY_SPEED_FIX_MAC.command ~/Downloads/Open_IPTV_Pro_v4_19_WebView_SNAPSHOT_FIXED --no-build`

Máy cần tối thiểu 10 GB trống theo kiểm tra trong `BUILD_MAC.command`. Dữ liệu ứng dụng đã cài, playlist và snapshots gốc không bị xóa.

Muốn đẩy lên nhánh `experiment/native-webview-ffmpeg` của repo `trisanghy/open-iptv-pro`, dùng script `PUSH_GITHUB_MAC.command` trong ZIP mã nguồn đầy đủ (cần Git đã đăng nhập); không tự đẩy khi chạy bản vá.

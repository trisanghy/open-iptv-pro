# Open IPTV Pro v4.19 WebView — bản vá Gộp kênh

## Nguyên nhân
Nút `Gộp kênh đã chọn` phân tích 1.169 mục nhưng gọi `window.confirm()` trước khi áp dụng. Trên một số WKWebView, confirm không hiển thị và trả về false: trạng thái `Đã hủy áp dụng`, không có `collector_merged`, nên Check/Repair báo chưa gộp.

## Đã sửa
- Xác nhận **GỘP VÀ LƯU** trong cửa sổ HTML của chính ứng dụng; có nút Hủy, Escape, và hỗ trợ bàn phím.
- Chỉ hiện `Kênh gộp` sau khi lưu. Kết quả `Phân tích` được gắn nhãn **BẢN XEM TRƯỚC**.
- Sau Hủy, không đổi playlist gốc và không để thanh tiến độ giả 100%.
- Hoàn tác cũng dùng xác nhận trong app thay cho JavaScript `confirm()`.
- FFmpeg, FFprobe, Timeshift và các chức năng khác giữ nguyên (không thay đổi backend).

## Cách sử dụng
Mở Quản lý nguồn → chọn nguồn → **Gộp kênh đã chọn** → trên hộp thoại bấm **GỘP VÀ LƯU** → sau khi thấy `Đã gộp ...`, bấm `Kiểm tra & thay link dự phòng`.

Đây là mã nguồn, cần chạy `BUILD_MAC.command` để tạo DMG mới. Chưa có DMG đã biên dịch/ký trên Mac.

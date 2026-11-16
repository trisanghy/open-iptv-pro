# Open IPTV Pro v4.23.6 — EPG tự động và nhập bằng tay

1. Vào **Cài đặt > Nguồn lịch EPG**.
2. Chọn nguồn XMLTV cần dùng. Bật **Tự tải EPG khi khởi động ứng dụng** để mỗi lần mở ứng dụng tải một lần; tùy chọn **tắt mặc định**. Nếu không có kênh M3U hoặc không bật nguồn nào thì bỏ qua tự tải.
3. Muốn tải ngay qua URL, bấm **Tải EPG từ URL ngay** (hoặc nút tải ở trang Lịch phát sóng EPG).
4. Muốn nhập file có sẵn từ máy, bấm **Nhập file EPG thủ công**, chọn `.xml`, `.xmltv`, `.gz`. Sau khi kiểm tra, xác nhận thay dữ liệu EPG hiện tại.
5. File XMLTV tối đa 35 MB khi giải nén; file `.gz` không quá 12 MB. File không hợp lệ hoặc không có chương trình trong khoảng thời gian được hỗ trợ sẽ không ghi đè EPG cũ.

## Lưu ý
- Nhập file thủ công **không** tự tạo URL nguồn hoặc tải lại file vào lần mở sau. Nếu muốn tải tự động, phải cấu hình URL nguồn XMLTV.
- Ứng dụng phải đang mở và có mạng để tải EPG từ Internet. Tự tải EPG không có nghĩa là tự ghi hình. Các lịch DVR đã đặt không bị sửa.
- Giới hạn dữ liệu EPG: tối đa 12.000 chương trình, trong khoảng 7 ngày trước/sau ngày hiện tại.

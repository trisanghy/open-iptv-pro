# Open IPTV Pro TV · TizenBrew v0.1.3 (thử nghiệm)

## Cập nhật không cần USB

1. Mở ứng dụng **TizenBrew** (không phải TizenBrew Installer).
2. Vào **Module Manager → Add GitHub Module**, nhập `trisanghy/open-iptv-pro@tizenbrew`.
3. Mở/cập nhật module **Open IPTV Pro TV**. Nếu thấy giao diện cũ, tải lại module hoặc xóa cache.

## Thêm nguồn IPTV

- **Remote:** chọn **＋ Nguồn**, nhập **Tên nguồn**, nhấn **OK** hoặc **↓** để chuyển xuống URL. Có nút **↓ Chuyển xuống nhập đường dẫn** làm đường dự phòng khi bàn phím Samsung giữ phím điều hướng. Nhập URL, xác nhận quyền sử dụng và nhấn **Lưu và tải**.
- **Điện thoại:** chọn **＋ Nguồn**, quét **mã QR lớn** bên phải; trên điện thoại nhập tên và URL M3U/M3U8, xác nhận quyền sử dụng rồi **Gửi nguồn sang TV**. TV tải và lưu danh sách, điện thoại nhận kết quả.
- Mã QR được tạo **tại TV** từ token ngẫu nhiên 128-bit, hết hạn trong **10 phút** hoặc khi đóng hộp thoại/tạo QR mới. Mã chỉ cho phép gửi nguồn đến TV đang hiển thị mã.
- Trang biểu mẫu nằm trong nhánh `tizenbrew` tại `tizenbrew/phone.html`, hiển thị qua CDN HTML `raw.githack.com`. CDN có thể yêu cầu **xác nhận truy cập lần đầu** hoặc tạm thời không hoạt động. Khi đó dùng remote.
- Luồng nhập dùng **Supabase Realtime Broadcast tạm thời** (TLS). Không ghi danh sách nguồn vào database; TV lưu dữ liệu cục bộ. Dịch vụ chuyển tiếp vẫn xử lý dữ liệu truyền, nên không chia sẻ QR với người không được phép.

## Giới hạn và kiểm thử

- TV và điện thoại cần Internet/WebSocket; TV cần `crypto.getRandomValues`. Phần mềm phải tải được Supabase SDK từ nguồn lưu trữ công khai.
- Danh sách M3U phải có URL HTTP(S) và máy chủ cho phép CORS. HTML5 trên TizenBrew không dùng Samsung AVPlay; khả năng phát tùy codec/HTTPS.
- **Đã bỏ ô dán nội dung M3U** trong màn thêm nguồn. Danh sách đã lưu từ các phiên bản trước vẫn được giữ nguyên.
- Kiểm thử tự động: `node --test tizenbrew/tests/source-dialog.test.cjs`. Chưa xác minh thực tế trên TV Samsung.
- Nhánh tizenbrew độc lập, không sửa `main`, `web/online`, Electron, Rust hay Mobile.

Không cung cấp nguồn IPTV bản quyền mặc định. Chỉ sử dụng nội dung có quyền truy cập.

## Điều khiển Back / Thoát (v0.1.3)

- **Back** trong trình phát: trở lại danh sách kênh.
- **Back** trong hộp thêm nguồn, QR hoặc tìm kiếm: đóng hộp thoại và dừng ghép đôi.
- **Back** tại màn hình chính: trở về TizenBrew (trên phiên mở thông thường bằng lịch sử); nếu mở trực tiếp không có lịch sử, thoát TizenBrew về Samsung Home.
- Bổ sung nút **↶ Thoát** trên thanh công cụ để dự phòng.
- Xử lý cả phím 10009 (`keydown`) lẫn sự kiện `tizenhwkey`, không thêm `Back` vào `package.json.keys` vì phím hệ thống không được đăng ký theo cách đó.
- Kiểm thử logic với mô phỏng phím Back. Vẫn cần xác minh trên TV Samsung thật.

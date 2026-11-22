# Open IPTV Pro TV · TizenBrew v0.1.5 (thử nghiệm)

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

## Điều khiển Back / Thoát (v0.1.4)

- **Back** trong trình phát: trở lại danh sách kênh.
- **Back** trong hộp thêm nguồn, QR hoặc tìm kiếm: đóng hộp thoại và dừng ghép đôi.
- **Back** tại màn hình chính: trở về TizenBrew (trên phiên mở thông thường bằng lịch sử); nếu mở trực tiếp không có lịch sử, thoát TizenBrew về Samsung Home.
- Bổ sung nút **↶ Thoát** trên thanh công cụ để dự phòng.
- Xử lý cả phím 10009 (`keydown`) lẫn sự kiện `tizenhwkey`, không thêm `Back` vào `package.json.keys` vì phím hệ thống không được đăng ký theo cách đó.
- Kiểm thử logic với mô phỏng phím Back. Vẫn cần xác minh trên TV Samsung thật.

## Sửa lỗi v0.1.4 — ô xác nhận quyền trên Samsung TV

- Thay ô checkbox nhỏ không nhận OK bằng nút dạng checkbox có vùng bấm rộng, trạng thái ✓ hiển thị rõ và thuộc tính `aria-checked`.
- Remote: từ ô URL nhấn **↓** đến ô xác nhận, nhấn **OK** để bật/tắt dấu ✓, sau đó nhấn **↓** đến **Lưu và tải**; nhấn **↑** để quay lại.
- Chặn lặp phím OK giữ lâu; hỗ trợ click bằng chuột/remote và reset xác nhận mỗi khi mở hộp thoại mới.
- Điều kiện xác nhận vẫn bắt buộc, không tự tích và không bỏ qua quyền sử dụng nội dung.

## v0.1.5 — QR quản lý nguồn và kênh, sửa lỗi giao nhận

### Sửa lỗi cũ

- Fix **cơ chế nhận Supabase Broadcast**: handler phải đọc \`event.payload\`, không phải \`event.id\`. Trước đây điện thoại nhận ACK máy chủ nhưng TV đã bỏ qua yêu cầu do đọc sai cấu trúc bản tin.
- Điện thoại **chỉ cho thao tác khi TV xác nhận đang trực tuyến** bằng RPC \`hello\`. Sau khi gửi nguồn, TV phát sự kiện **đã nhận/đang tải**, cuối cùng phản hồi thành công hoặc lỗi.
- TV tải danh sách M3U có hạn mức chờ 25 giây cho kết nối và đọc nội dung; báo lỗi cụ thể khi hết thời gian hoặc CORS.
- Xác nhận thực sự lưu vào \`localStorage\`: nếu bộ nhớ TV đầy thì hoàn tác thay đổi và trả lỗi, không báo thành công giả.

### Trang quản lý qua một QR

- Tab **Quản lý danh sách**: xem nguồn hiện có trên TV, tên nguồn, URL gốc, số kênh, thứ tự nguồn; đổi tên, lên/xuống hoặc xóa nguồn.
- Danh sách kênh có **tìm kiếm**, phân trang 30 kênh, đổi tên/nhóm/URL, thêm kênh thủ công, xóa kênh, ẩn/hiện, lên/xuống, đánh dấu yêu thích.
- Tab **Thêm nguồn**: gửi tên và URL M3U, chỉ khi TV đã xác nhận kết nối. TV trả tiến độ, số kênh thực tế hoặc lỗi.
- Các thay đổi thực hiện tại TV rồi lưu cục bộ; trang điện thoại chỉ hiển thị trạng thái đã lưu khi nhận \`manager-result\`. Khi hết 10 phút, cần QR mới.
- **Giữ hộp thoại QR mở trên TV** trong lúc quản lý. Nếu TV không hiển thị trạng thái "TV đã trực tuyến" dưới QR, kết nối chưa hoạt động và điện thoại không thể gửi nguồn.
- Hiện đang dùng trang quản lý từ \`raw.githack.com\`; URL QR có \`?v=015\` để tránh cache giao diện trước.

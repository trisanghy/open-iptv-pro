# Rust Lab v23.8.30 Beta — M3U & Smart Discovery: xác nhận quyền sử dụng

Bản cập nhật riêng cho Rust Lab. Mọi tag phát hành v23.8.26–v23.8.29 được giữ bất biến, không tác động đến Electron Stable và Web.

- Trước khi nhập file M3U, link M3U, chỉnh sửa URL nguồn hoặc nhập playlist công khai từ repository: hiện hộp thoại trách nhiệm nội dung; **phải tích ô xác nhận** mới được tiếp tục.
- Smart Discovery chỉ được tải danh mục quốc gia/ngôn ngữ **sau** khi người dùng xác nhận điều khoản bên thứ ba và quyền sử dụng nội dung qua hai ô độc lập.
- Trước khi nhập các kênh từ Smart Discovery, hỏi lại hai ô xác nhận. Nguồn công khai hoặc hoạt động không chứng minh có giấy phép bản quyền.
- Đồng ý ban đầu ở Rust Lab lưu trong máy theo phiên bản điều khoản, có nút rút lại; xác nhận nhập kênh không lưu tự động.
- Tác giả phát triển trình phát cá nhân, không cung cấp nội dung IPTV; người dùng chịu trách nhiệm về nguồn, dữ liệu và nội dung xem, với miễn trừ của tác giả trong phạm vi pháp luật cho phép.
- Sửa kiểm thử hủy quét khi lượt kiểm tra đang thực hiện; bảo toàn tất cả bố cục responsive, TTS/Live Caption, FFmpeg, PiP và các tính năng cũ.

Tạo Release tại tag mới `rust-lab/v23.8.30` nếu build/kiểm thử CI đạt. Không đổi nhánh `main` hoặc Latest Electron.

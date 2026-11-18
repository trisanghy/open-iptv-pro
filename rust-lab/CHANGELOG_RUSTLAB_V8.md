# Open IPTV Pro Rust Lab v4.23.17-tauri.8

## Updated UI (v8)

- Xóa thanh header trên cùng (breadcrumb / số nguồn M3U / nhập file URL).
- Thêm nút thu gọn/mở rộng sidebar thành dải biểu tượng 72 px; trạng thái lưu riêng trong localStorage, không thay đổi playlist.
- Vẫn có thể thêm file M3U hoặc URL trong mục **Quản lý nguồn** và trong khung phát khi chưa có kênh.
- Hỗ trợ thu gọn ở mọi kiểu giao diện, kể cả Cinema, Swiss và Glass; giữ điều hướng bằng bàn phím và nhãn trợ năng.

## Added

- Kéo thả sắp xếp thứ tự thư mục trong danh sách TV và màn hình quản lý thư mục.
- Nút mũi tên lên/xuống trong quản lý thư mục.
- Kéo thả kênh để đổi vị trí trong cùng thư mục (thả phía trên hoặc dưới dòng đích).
- Chọn nhiều kênh bằng checkbox, Shift-range, Ctrl/Cmd-click; chọn tất cả kênh đang hiển thị và bỏ chọn.
- Chuyển nhiều kênh qua hộp chọn thư mục hoặc kéo một kênh đang chọn vào thư mục đích.
- Lưu thứ tự theo `channelOrder` độc lập với vị trí trong playlist nguồn; giữ nguyên thứ tự trong bản xuất M3U.

## Fixed / safety

- Giữ thứ tự tự chọn sau khi tự tải lại M3U với các kênh còn xác định được ID.
- Khi đổi tên/xóa thư mục, cập nhật dữ liệu thứ tự mà không xóa nguồn kênh, yêu thích hay Snapshot.
- Không cho phép các thao tác sắp xếp/chuyển kênh ở hồ sơ không có quyền sửa.
- Tránh thả selection vào chính một kênh đang chọn; giữ nguyên dữ liệu khi thao tác đích không hợp lệ.
- Bảo vệ thứ tự được lưu trước dữ liệu lỗi và tên nhóm đặc biệt.

## Verification

- 104/104 bài kiểm thử JavaScript đạt, bao gồm 20 bài hồi quy mới cho organizer.
- UI mô phỏng Chromium: chọn 2 kênh, chuyển nhóm, kéo đổi thứ tự, đổi thứ tự thư mục bằng nút và kéo một kênh sang thư mục khác. Kiểm tra sidebar mở/thu 72 px ở 5 phong cách giao diện. Không có lỗi JavaScript trong mô phỏng.
- Chưa xác minh biên dịch Tauri/Rust trên Windows/macOS trong môi trường này.

**Branch:** `experiment/rust-tauri-v2`. **Electron `main` không được chỉnh sửa.**

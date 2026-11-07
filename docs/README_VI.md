# Open IPTV Pro — Hướng dẫn tiếng Việt

## Phần mềm gồm những gì?

- Nhập file hoặc URL M3U/M3U8; quản lý nhiều nguồn.
- Thư mục theo `group-title` trong file M3U, có thể tạo/đổi tên/xóa và chuyển kênh.
- Trình phát HLS/MP4, chuyển kênh, tạm dừng khi luồng hỗ trợ, âm lượng, toàn màn hình.
- Chế độ **Vừa khung**, **Lấp đầy (cắt mép)**, **Kéo giãn**, **Kích thước gốc**.
- **Ảnh chụp gắn kênh**: ảnh chụp hiện ở bên cạnh tên kênh, nằm trong trang Snapshot và lưu qua lần mở ứng dụng.
- Kiểm tra link nhiều vòng và xuất file `iptv.m3u`; đăng GitHub/Gist là thao tác riêng, có xác nhận.
- Mac có xử lý safe-area khi toàn màn hình để giảm tình trạng thanh thông tin bị vùng notch che. Tùy cấu hình màn hình hệ điều hành có thể xử lý khác nhau.

## Tạo bộ cài từ nguồn

- Mac: nhấp đúp `BUILD_MAC.command` (script tự tải Node vào thư mục con nếu thiếu).
- Windows: nhấp đúp `BUILD_WINDOWS.bat`.
- Hoặc tạo repository public, vào GitHub **Actions → Build Open IPTV Pro → Run workflow**, lấy tệp trong Artifacts.

Bộ source ZIP **chưa phải bộ cài đã build**. Hai bản Mac Intel / Apple Silicon được build riêng để tránh xung đột FFmpeg. Bộ cài chưa ký có thể bị Gatekeeper/SmartScreen cảnh báo.

## Đăng GitHub public mới

Chạy `DANG_GITHUB_PUBLIC_MAC.command` (Mac) / `DANG_GITHUB_PUBLIC_WINDOWS.bat` (Win). Đăng nhập `gh` qua trình duyệt; nhập tên repo; kiểm tra danh sách tệp; gõ **PUBLIC** để xác nhận. Không ghi đè kho đã tồn tại.

Mã nguồn cấp phép MIT. FFmpeg, Electron, hls.js có điều khoản riêng; đọc `THIRD_PARTY_NOTICES.md` trước khi phát hành bộ cài.

**Quan trọng:** Không đưa playlist cá nhân, token, ảnh chụp nội dung truyền hình có bản quyền lên GitHub public. Chỉ dùng luồng mình có quyền truy cập.


## Tính năng mới trong v4.1

- **Lịch EPG:** Mở **Cài đặt → Nguồn lịch EPG**, bật nguồn Việt Nam hoặc quốc gia khác, bấm **Cập nhật EPG ngay**. Sau đó mở **Lịch phát sóng EPG**. Muốn khớp đúng kênh, nên dùng `tvg-id` chuẩn trong M3U. Có thể nhập URL `.xml`/`.xml.gz` khác; nguồn phải có HTTPS.
- **PiP:** Mở kênh, khi đã có hình thì nhấn **▣ PiP** cạnh nút toàn màn hình. PiP phụ thuộc hỗ trợ của video và hệ điều hành.
- **Màu giao diện:** Vào **Cài đặt → Màu giao diện**, chọn trên bánh xe hoặc color picker. Màu được lưu lại.
- **Kiểm tra cập nhật:** Vào **Cài đặt → Kiểm tra cập nhật**, nhập tên repo GitHub public dưới dạng `tai-khoan/open-iptv-pro`, bấm kiểm tra. Repo cần có GitHub Releases. App không tự cài bản cập nhật.
- Đã **bỏ hai nhãn LIVE IPTV và Đang phát** nằm đè trên video.

Nguồn dữ liệu EPG công khai có thể có điều khoản sử dụng riêng, không đồng nghĩa dữ liệu được phép phân phối lại dưới MIT. Các nguồn cài sẵn chỉ là đường dẫn, dữ liệu không được đóng gói cùng ứng dụng. Bản chạy thử bằng trình duyệt không giải nén `.gz`; chức năng này hỗ trợ trong bản desktop.

## Hướng dẫn và hình ảnh đầy đủ

- [Hướng dẫn sử dụng theo từng tính năng](HUONG_DAN_SU_DUNG.md)
- [Bộ ảnh minh họa](ANH_MINH_HOA.md)
- [Đăng dự án lên GitHub public](DANG_GITHUB.md)

# Open IPTV Pro — BẢN MÃ NGUỒN TỔNG HỢP v4.23.7

**Mục đích:** gom chức năng các bản 4.22.1–4.23.7 vào **một dự án có thể build**, không đưa từng ZIP cũ vào trong vì dễ build nhầm phiên bản hoặc ghi đè mã nguồn mới.

## Các mốc đã được tích hợp

- **v4.22.1:** Desktop ổn định, sửa updater, icon và cấu hình build.
- **v4.22.2:** Backup/Restore dữ liệu desktop.
- **v4.23.0:** Smart Discovery và Doctor 3.0.
- **v4.23.1:** Discovery trong Quản lý nguồn, đa dạng nguồn, ALL/1.000 kênh.
- **v4.23.2:** Kiểm tra hồi quy, xử lý nhập M3U/giới hạn nguồn/Doctor ALL.
- **v4.23.3:** DVR hẹn giờ theo EPG/thủ công và sửa build Windows.
- **v4.23.4:** DVR trong khung trình phát, trạng thái ghi và vị trí tác vụ.
- **v4.23.5:** MP4, tên theo EPG, Tua lại 10 phút, -10/-30s.
- **v4.23.6:** Tải EPG lúc khởi động (tùy chọn), nhập XMLTV thủ công.
- **v4.23.7:** Footer tiến độ gọn, quét kênh ngay tại trang, EPG preset.

## Cấu trúc bản này
- `package.json` — khai báo phiên bản **4.23.7**, Electron/FFmpeg và lệnh build.
- `src/` — chức năng Electron/Node (Discovery, EPG, DVR, Timeshift, Backup, Cast, kiểm tra luồng).
- `renderer/` — giao diện, đa ngôn ngữ, các màn chức năng và trạng thái tác vụ.
- `tests/` — bộ kiểm thử Node.js và giao diện Python/Chromium.
- `BUILD_WINDOWS.bat`, `BUILD_MAC.command` — lệnh build desktop tại thư mục gốc.
- `docs/`, `README.md`, `CHANGELOG.md` — tài liệu và lịch sử thay đổi.

## Cách sử dụng
**Windows:** Giải nén, mở thư mục `Open-IPTV-Pro-v4_23_7_Full_Desktop`, chạy `BUILD_WINDOWS.bat`. Windows có thể cần bật Developer Mode hoặc quyền quản trị do `winCodeSign` tạo symbolic link. Xem `HUONG_DAN_SUA_BUILD_WINDOWS.md`.
**macOS:** Giải nén và chạy `bash BUILD_MAC.command` ngay trong thư mục dự án (script tự tìm Node hoặc tải khi cần).
**Chạy test:** `npm test` tại thư mục dự án (cần Node.js phù hợp).

## Phạm vi xác minh
- Đã đối chiếu tập tên file: bản 4.23.7 có đầy đủ đường dẫn mã nguồn của tất cả các bản trước được cung cấp. Hai script **push GitHub phiên bản 4.22.x** đã cố ý không thêm vì có thể đẩy nhầm phiên bản.
- Trước khi đóng gói, `npm test` chạy **139 đạt, 2 bỏ qua, 0 lỗi**. Hai bài tích hợp bỏ qua mặc định chưa được xác minh trong lần tổng hợp này.
- Kiểm tra tĩnh mã nguồn và tính toàn vẹn ZIP được chạy khi đóng gói.

## Giới hạn
- Đây là **mã nguồn**, chưa có file cài `.exe`/`.dmg` được tạo hoặc chạy thử trong bước tổng hợp.
- **Chưa push GitHub** và **không thay đổi Android/iOS**.
- Lịch ghi hình cần ứng dụng đang mở và máy không ngủ, MP4 phụ thuộc codec và FFmpeg; file video đã ghi không nằm trong Backup.
- Các nguồn IPTV/EPG công khai có thể đổi địa chỉ, bị chặn địa lý hoặc có chất lượng khác nhau. Không có bảo đảm các kênh đều phát được.

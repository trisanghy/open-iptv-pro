# Rust Lab v19 — khôi phục thanh điều khiển ổn định

## Đã sửa

- Khôi phục thanh điều khiển v15: tên kênh, Link phát và Yêu thích ở hàng thông tin; Trước / Phát-Tạm dừng / Dừng / Sau, âm lượng, chụp ảnh, Khung hình, Cast/AirPlay, PiP và toàn màn hình tại hàng điều khiển.
- Loại bỏ `renderer/control-bar-v16.js`, `renderer/control-bar-v16.css` khỏi bản nguồn đang chạy; khôi phục thứ tự DOM gốc và tránh bị style phiên bản hai hàng ghi đè.
- EPG (`epgCurrent`), Tua lại và Hẹn ghi về khung độc lập.

## Tiếp tục giữ từ các bản trước

- v17: khung phát 16:9 mặc định, tự đổi theo `videoWidth/videoHeight` khi có metadata; không ảnh hưởng fullscreen và tuỳ chọn vừa/lấp đầy.
- v18: tab mở lại Danh sách kênh rộng **15 px**, cao **40 px**; không đè lên nút `☰`.
- Cơ chế phát lại khi chuyển kênh, chọn link thủ công, nguồn dự phòng và dữ liệu của Rust Lab vẫn giữ nguyên.

## Phân phối / kiểm thử

- Một lệnh tải một ZIP từ nhánh `experiment/rust-tauri-v2`, xác nhận v19, build DMG và dọn tạm; đầu ra chỉ chứa DMG + ZIP mã nguồn trong Downloads nếu thành công.
- Kiểm thử JavaScript được báo cáo ở lần khôi phục v19: **30/30 kiểm thử nhanh**, **96/96 kiểm thử chính**.
- Chưa xác nhận build DMG trên Mac thực tế, phát tất cả luồng IPTV hoặc DVR/Cast end-to-end.

Xem [README](README.md) và [ghi chú phát hành v19](RELEASE_NOTES_RUST_LAB_V19.md). Nhánh Electron `main` không thay đổi.

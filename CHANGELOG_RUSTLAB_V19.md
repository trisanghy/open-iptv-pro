# Rust Lab v19 — khôi phục thanh điều khiển ổn định

- Quay lại nguyên mẫu thanh điều khiển v15: thông tin kênh/Link phát/Yêu thích ở trên; Trước/Phát/Dừng/Sau, âm lượng, chụp ảnh, Khung hình, Cast/AirPlay, PiP, fullscreen ở dưới.
- Bỏ v16 JavaScript thay đổi vị trí các nút và các CSS bố cục hai hàng gây lỗi.
- Hiển thị trở lại thẻ EPG riêng (`epgCurrent`) và các nút Tua lại/Hẹn ghi riêng đúng bản cũ.
- Giữ v17 tự đổi tỷ lệ khung video theo nguồn (mặc định 16:9).
- Giữ v18 tab mở lại danh sách kênh rộng 15px, cao 40px.
- Giữ nguyên lõi phát, ID nút và nguồn link dự phòng; không ảnh hưởng main Electron.
- Một lệnh `curl` build Mac, tự tải một source ZIP, dọn tạm, lưu DMG + source ZIP trong Downloads.
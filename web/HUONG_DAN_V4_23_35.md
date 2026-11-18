# Open IPTV Pro v4.23.35 — Giao diện điều khiển hai hàng

## Đã thực hiện

- Hàng trên: thông tin kênh · Trước/Tạm dừng hoặc Phát/Dừng/Sau · Cast / AirPlay · PiP · Toàn màn hình.
- Hàng dưới: chương trình đang phát và chương trình tiếp theo (EPG thực tế), chế độ Khung hình, Link phát chính/dự phòng, Yêu thích.
- Âm lượng, Chụp ảnh, FFmpeg dự phòng nằm trong mục mở rộng dưới thanh điều khiển, không bị xóa.
- Giữ tính năng thu gọn sidebar, danh sách kênh, sắp xếp thư mục và kéo Shift chọn nhiều kênh.
- Thanh điều khiển vẫn ở ngoài khung hình; fullscreen dùng thanh điều khiển riêng, tự ẩn.
- CSS đáp ứng chiều rộng thực tế của khung điều khiển để không đẩy nút ra ngoài.

## Kiểm thử

- 256/258 bài tự động đạt, không lỗi, 2 bài kiểm thử FFmpeg thực tế được bỏ qua theo cấu hình mặc định.
- Kiểm tra hình học 220 tổ hợp (11 styles × 5 kích thước × 2 trạng thái sidebar × 2 trạng thái danh sách): không lỗi tràn nút hoặc chồng video.
- Kiểm thử trên Chromium headless; chưa build và chạy DMG/EXE thực tế trên macOS/Windows.

## Build macOS

```bash
cd ~/Downloads/Open-IPTV-Pro-v4_23_35_Full_Desktop
chmod +x BUILD_MAC.command
./BUILD_MAC.command
```

## Build Windows

Chạy `BUILD_WINDOWS.bat` trong thư mục mã nguồn (Windows x64).

## Lưu ý

Chức năng EPG chỉ hiện tên và giờ chương trình có trong dữ liệu XMLTV đã tải. Khi không có EPG, ứng dụng hiển thị trạng thái chưa có dữ liệu, không giả lập lịch phát sóng.

Chưa tự động push GitHub hay xuất bản release.

# Open IPTV Pro v4.23.3 — Windows Build Fix

## Nguyên nhân hai lỗi đã chụp

1. `Cannot find package.json in ...open-iptv-pro-experiment-native-webview-ffmpeg\scripts`: đang build từ nhánh thử nghiệm cũ/sai thư mục. Bản này bắt buộc có `package.json` và `src/main.cjs` ngay tại thư mục `Open-IPTV-Pro-v4_23_3_Full_Desktop`.
2. `Cannot create symbolic link: A required privilege is not held by the client` khi giải nén `winCodeSign`: quyền Windows bị thiếu. `winCodeSign` có các symbolic link dành cho macOS trong gói công cụ nên 7-Zip thất bại khi chạy trên Windows không có Developer Mode/quyền phù hợp. Đây không phải lỗi chương trình phát IPTV.

## Thực hiện

1. Giải nén toàn bộ ZIP vào thư mục riêng. Không chép đè vào nhánh `experiment/native-webview-ffmpeg`.
2. Nhấp đúp `BUILD_WINDOWS.bat` trong thư mục gốc.
3. Script kiểm tra quyền tạo symbolic link ngay trước khi cài thư viện. Nếu báo thiếu quyền, chọn `D` để mở Windows Settings, bật **Developer Mode** (Windows 11: Settings > System > For developers), đóng cửa sổ build và chạy lại. Nếu thiết bị không cho bật Developer Mode, có thể chọn `A` để **tự nguyện** chạy script với quyền Administrator sau hộp thoại UAC (chỉ khi tin tưởng mã nguồn).
4. Khi đủ quyền, script cài Node.js cục bộ nếu chưa có, chạy `npm install/ci`, `npm test`, `electron-builder --projectDir <thư mục gốc> --win --x64 --publish never`.
5. Chỉ khi `dist/Open-IPTV-Pro-Setup-4.23.3-x64.exe` và `dist/Open-IPTV-Pro-4.23.3-x64.exe` mới được tạo và kiểm tra kích thước, script mới báo thành công.

Không đụng đến iOS/Android, không sửa chức năng IPTV/DVR, không tự push GitHub hay tạo Release. Bản build chưa ký số, có thể gặp cảnh báo SmartScreen. Cần Internet khi cài thư viện.

## Nếu vẫn lỗi

Gửi toàn bộ file `build-logs/BUILD_WINDOWS_LAST.log` trong thư mục mã nguồn và tên thư mục đã giải nén. Không xóa các thư mục cache, node_modules hay dự án cũ trước khi có chẩn đoán cụ thể.

## Phạm vi xác minh

Kiểm tra đường dẫn project, kiểm tra trước quyền symlink, xác minh đầu ra EXE đã được thêm và kiểm thử mã nguồn trên môi trường Linux. Không thể chạy Windows UAC, 7-Zip winCodeSign hoặc kiểm chứng EXE thực sự ngay trong môi trường Linux.

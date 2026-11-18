# Open IPTV Pro v4.22 Full

## Tiếng Việt

1. Cài đặt → Cập nhật phiên bản: hiển thị nhà phát hành cố định **trisanghy/open-iptv-pro**, không phải nhập lại.
2. Kiểm tra Releases công khai; phiên bản mới được xác định bằng tên file cài/tên Release/tag. Bản cập nhật phải mới hơn bản đang cài và có file phù hợp với hệ điều hành và kiến trúc.
3. Tự tải bản mới khi tùy chọn được bật, hiển thị tiến độ. Vẫn kiểm tra SHA256 hoặc dùng cơ chế cập nhật có xác minh; không chạy file tải về chưa kiểm tra.
4. Với ứng dụng Windows hoặc macOS đã ký và đủ điều kiện, bấm xác nhận cài và khởi động lại. Nếu chưa ký/portable, mở Setup/DMG đã tải để cài thủ công.
5. Bộ icon sidebar và thanh thao tác cơ bản được đổi thành SVG nét bo tròn lấy cảm hứng từ giao diện macOS (không sao chép SF Symbols).
6. FFmpeg nhúng, Timeshift 5 phút, Snapshot 1–32 luồng, PiP, MultiView, Doctor 2.0, Cast/AirPlay, i18n còn nguyên.

### Lưu ý
- Push mã nguồn lên GitHub chưa tự tạo Release DMG/EXE. Để có cập nhật thực tế, người phát hành phải tạo Release chứa bộ cài đúng hệ điều hành cùng metadata/checksum.
- Chưa kiểm tra tự cập nhật bằng DMG/EXE trên máy thật; thử nghiệm hiện tại là unit test và Chromium mô phỏng.
- Không cập nhật Android/iOS.

## English

The publisher URL is now built in. The app accepts flexible Release tag conventions and matches a newer desktop installer to the current operating system/architecture. Downloads retain progress and integrity verification. Signed eligible desktop installations support automatic updates after approval; unsigned macOS and portable builds use a verified manual installer. A unified macOS-style SVG icon set replaces the old sidebar glyphs. All bundled Full features, including FFmpeg and Timeshift, remain untouched.

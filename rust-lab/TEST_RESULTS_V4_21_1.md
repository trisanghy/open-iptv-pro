# Open IPTV Pro v4.21.1 — Kiểm thử bản sửa AirPlay

- Node.js tests: **76/76 PASS** (`npm test`).
- UI mock Chromium: PASS (`python tests/ui_airplay_discovery_v4211.py`).
- Kết quả: ChromeCast không có thiết bị được báo riêng; AirPlay nhận hai thiết bị mô phỏng `TV Hưng Yên` và `Redmi K70E (AirPlay)`; nút Safari vẫn hoạt động trong mô phỏng.
- macOS Bonjour test: phân tích dữ liệu mô phỏng `dns-sd -B _airplay._tcp local.` đã đạt. Chưa có quyền truy cập Mac thật để kiểm tra kết quả từ mạng LAN của người dùng.
- Không thay đổi Android/iOS hoặc luồng FFmpeg/Timeshift; cấu hình build Full vẫn bao gồm FFmpeg.
- Chưa tạo DMG/EXE thực hoặc thử truyền media tới TV thật. Cách duy nhất lựa chọn đích AirPlay hiện tại vẫn là trong Safari.

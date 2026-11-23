# P5.1.345 — candidate vòng 02/20 (2026-11-24)
- Đầu vào: đã MỞ ảnh Electron P344 720/1920 before/after từ fast run 45279088385; gợi ý PageUp/Down chưa có hướng dẫn tại chỗ dù phím đã hoạt động.
- Sửa nguồn: renderer/positron-intelligence.js và .css, native details phím điều khiển AI, phím Enter mở/đóng 7 hướng dẫn, không chiếm sticky title.
- QA: scripts/positron-345-audit.cjs; tests/positron-345.test.cjs, bốn ảnh Electron thật 1920/720, kiểm tương phản/overflow/44px, playlist/model/current bất biến.
- CI: phải kiểm tra thành công, tải và MỞ ảnh mới trước khi tính vòng đã hoàn tất; chưa khẳng định EXE/DMG Release, không tạo tag.
- Đợt mới hiện mới có hai vòng được phát triển, các vòng 03–20 chưa hoàn tất.

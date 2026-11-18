# AUDIT v4.23.8 – Giao diện gọn, popup tiến độ, AMOLED

## Thay đổi
- Tiến độ tác vụ giữ trong footer cao 44px và mở thành popup giới hạn 510px rộng / 345px cao (có co giãn). Không còn giãn footer hay đẩy nội dung khi mở. Có đóng bằng click ngoài / Escape.
- Cài đặt chuyển thành nhóm thu gọn, chỉ một nhóm mở, EPG/Backup mở đúng mục từ thanh điều hướng. Các nút gốc và ID giữ nguyên.
- Chế độ Sáng, Tối, AMOLED (nền `#000000`), Tự động; vẫn tôn trọng lựa chọn đã lưu.
- Bánh xe màu tương tác: chọn hue trên vòng ngoài; chọn saturation/value ở trung tâm; kéo chuột; phím mũi tên; palette mở rộng.
- Tùy chọn tắt tự cập nhật EPG được tôn trọng sau nâng cấp.
- Nhãn Cài đặt mới hỗ trợ 8 ngôn ngữ (vi, en, es, pt-BR, zh-CN, th, lo, km).

## Kiểm thử trên môi trường mã nguồn
- `npm test`: 139 pass / 0 fail / 2 skip (bài FFmpeg tích hợp cần môi trường riêng).
- Playwright/Chromium ở 1000x850 và 1360x850: thu gọn, mở/tắt chế độ, chọn và điều chỉnh màu, popup không thay đổi chiều cao footer, Escape/click ngoài, deep-link EPG/Backup: đạt.
- Kiểm tra JS syntax và JSON từ các ngôn ngữ, kiểm tra ZIP cuối: đạt.

## Chưa kiểm chứng
- Chưa build/chạy EXE/DMG trên máy Windows/macOS thực; chưa thử mọi thiết bị Cast/AirPlay hoặc nguồn IPTV.
- Popup hiển thị phía trên footer khi được mở để người dùng xem chi tiết, nhưng đóng gọn mặc định.
- Không tự động push GitHub, không tạo Release và không chỉnh iOS/Android.

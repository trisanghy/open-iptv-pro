# Audit v4.23.13 – Scrollbar + Settings UX

- Nguồn gốc: v4.23.12 Full Desktop.
- Đồng bộ scrollbar ngang/dọc với màu nhấn (biến CSS `--ui-primary` / `--accent`), kể cả skin TV và chế độ AMOLED.
- Cài đặt một cột: mỗi phần là một `<details>` thu gọn; mở phần nào chỉ hiện nội dung phần đó.
- Bỏ nút Backup/Restore trong sidebar, giữ nguyên phần thao tác trong Cài đặt và các API Backup/Restore.
- Không chỉnh sửa các engine IPTV, Timeshift, DVR, Cast/AirPlay, EPG hoặc thư viện nguồn.
- Kết quả kiểm thử được tổng hợp ở phản hồi khi gửi ZIP. Chưa kiểm thử bản đã đóng gói trên máy thật.

## Kiểm thử vòng cuối

- `npm test`: 153 bài trong đó 151 đạt, 0 lỗi, 2 bài tích hợp bỏ qua theo cấu hình mặc định.
- `python tests/ui_settings_onecol_v42313.py`: đạt ở 1000 và 1360 px; 5 giao diện × 2 mật độ; kiểm tra màu thanh cuộn phản ứng với thay đổi màu.
- `python tests/ui_compact_amoled_v4238.py`: đạt ở 1000 và 1360 px, gồm deep link EPG, popup và các tùy chỉnh đã có.
- `python tests/ui_styles_v42310.py`: đạt ở 1000 và 1360 px cho các kiểu giao diện đã kiểm tra.
- `python tests/ui_fullsync_v42311.py`: đạt cho 11 giao diện × 2 mật độ ở 2 độ rộng cửa sổ (44 tổ hợp).
- Kiểm tra `node --check` toàn bộ JS/CJS trong renderer và src: không lỗi cú pháp.
- Chưa kiểm thử phần mềm đóng gói và luồng phát thật trên thiết bị Windows/macOS.

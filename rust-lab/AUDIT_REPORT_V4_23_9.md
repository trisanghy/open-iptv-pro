# Open IPTV Pro v4.23.9 – Kiểm thử Snapshot & Smart Discovery

## Phạm vi sửa đổi

- Ảnh Snapshot: khi nhấn ảnh tìm đúng kênh theo ID/URL hiện tại, kể cả kênh có URL trùng giữa nhiều nguồn.
- Với nguồn đang tắt: hiện xác nhận rõ tên nguồn trước khi bật; nếu người dùng từ chối, giữ nguyên trạng thái và trang hiện tại. Nếu lưu thất bại, hoàn tác trạng thái nguồn.
- Ảnh mồ côi có thể mở kênh cùng tên **duy nhất** sau xác nhận; nếu không xác định chính xác, hiển thị cảnh báo, không phát nhầm.
- Bấm Enter/Space trên ảnh Snapshot để mở; nút yêu thích được xử lý riêng.
- Smart Discovery: xem trước luồng bằng rê chuột sau 1,25 giây, tiếng tắt; kênh chưa được nhập vẫn có thể xem thử. Không nhập nguồn, không sửa trạng thái Sống/Die khi hover.
- Dừng video preview khi rời kênh, chuyển trang, lọc hoặc làm mới danh sách.

## Kết quả kiểm thử tại môi trường xây dựng nguồn

- `npm test`: 139 đạt, 0 lỗi, 2 bài tích hợp bị bỏ qua mặc định.
- Chromium Playwright `tests/ui_snapshot_discovery_v4239.py`: đạt ở chiều rộng 1000 và 1360 px, gồm chọn nguồn tắt (hủy và chấp nhận), click ảnh nguồn bật, phục hồi ảnh có URL cũ, yêu thích, xem trước Discovery chưa nhập và không tiếng.
- Chromium Playwright `tests/ui_smart_doctor_v4232.py`: đạt tại 1000 và 1360 px; quét ALL >1000 kênh và giới hạn luồng.
- JavaScript `node --check` chạy qua toàn bộ JS/CJS trong renderer và src.

Chưa chạy bộ cài EXE/DMG trên Windows/macOS thật; nguồn IPTV công khai có thể bị chặn địa lý, yêu cầu xác thực hoặc không hỗ trợ video xem trước.

Mọi thay đổi chỉ áp dụng bản desktop, không đụng tới iOS/Android, chưa push GitHub.

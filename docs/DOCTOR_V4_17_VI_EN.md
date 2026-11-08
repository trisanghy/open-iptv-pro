# Smart IPTV Doctor 2.0 / Visual Diagnostics — v4.17

## Tiếng Việt

### Cách dùng
1. Vào **Ảnh chụp kênh** và chụp một số kênh (có thể chạy Snapshot 1–32 luồng như trước).
2. Vào **Smart IPTV Doctor → Phân tích Snapshot trùng hình**, chọn giới hạn 100/250/400/600 ảnh mỗi lượt.
3. Ứng dụng tính dấu vân tay ảnh và so sánh cục bộ. Các ảnh quá tối, trơn hoặc lỗi bị bỏ qua. Nhấp **Đề xuất URL dự phòng** chỉ khi kênh nguồn đã được kiểm tra sống gần đây và metadata trùng; xác nhận thủ công.
4. Xem phần **Đề xuất sửa**: kênh bị báo Die nhưng có bằng chứng phát trong 24 giờ được khuyên chuyển về **Chưa rõ**, không tự nhận Sống.
5. Nhấn **Hoàn tác sửa gần nhất** để trả lại link dự phòng hoặc trạng thái trước khi sửa. Xuất báo cáo JSON để rà soát.

### Phát hiện đứng hình
Trong **Cài đặt → Giám sát hình ảnh đang phát**, bật/tắt cảnh báo và (tùy chọn) thử link dự phòng. Mỗi 3 giây ứng dụng quan sát kênh chính đang phát. Đứng hình chỉ được xác nhận khi khung hình, thời gian phát và số frame giải mã đồng thời không tiến triển đủ lâu; cảnh tĩnh hoặc cảnh đen chỉ là **cảnh báo**. Khi không thể đọc pixel do CORS/DRM, ứng dụng không đánh giá thay bằng phỏng đoán.

### Giới hạn
- Snapshot chỉ là **một khung hình**: hai kênh cùng phát bản tin, trận đấu hoặc ảnh quảng cáo có thể trông giống nhau. **Không tự gộp**, không đưa ra xác nhận AI về danh tính kênh.
- Không thể kiểm tra hình ảnh cho kênh chưa có Snapshot; phải chụp lại hoặc bổ sung ảnh.
- Giám sát hình ảnh chỉ chạy cho một kênh đang phát trong trình phát chính, không giám sát 32 luồng song song.
- Không thay thế kiểm tra link nhiều vòng; trạng thái Die/Sống cần chứng cứ riêng.
- Ảnh và báo cáo được xử lý tại thiết bị, không gửi ảnh lên dịch vụ AI.

## English

Take snapshots in **Channel Snapshots**, then open **Smart IPTV Doctor → Analyze visually similar snapshots**. Results are review suggestions, not verified duplicate identities. Low-information frames are ignored. Matching channel metadata and a recently verified live backup are required before offering to add a backup URL, with explicit user consent and undo.

The live frame monitor analyzes only the playing main channel every three seconds. A frozen/stalled playback timer plus stationary decoded frames can trigger an alert, while static scenes or dark pictures alone never prove a dead stream. If video frames cannot be read due to source protection/CORS, monitoring reports that limitation. Auto-failover on confirmed freezes is opt-in and disabled by default. No remote image-analysis service or subscription is used.

# Open IPTV Pro v4.23.5 – Hẹn ghi MP4 và Tua lại 10 phút

## Hẹn ghi hình

- Vào **Xem truyền hình → Hẹn giờ ghi hình** trong khung **Tua lại**, hoặc vào **Lịch phát sóng EPG → Hẹn giờ ghi hình chương trình**.
- Hẹn giờ bắt đầu và kết thúc; tên chương trình lấy theo EPG nếu có, hoặc từ tên do bạn nhập.
- Video sau khi ghi thành công nằm trong thư mục đã chọn, có đuôi **`.mp4`** và tên gồm kênh, thời gian bắt đầu/kết thúc (múi giờ máy), tên chương trình nếu có, mã nhận dạng để tránh trùng.
- FFmpeg ghi tạm `.part.ts` rồi đóng gói MP4 **sau khi kết thúc lịch** (không tái mã hóa). Trong lúc đóng gói hiển thị **Đang hoàn tất MP4**. Nếu đổi đuôi thành MP4 mà không remux thì file có thể không phát được, nên ứng dụng không làm vậy.
- Nếu kênh dùng codec không tương thích với MP4, hoặc ổ đĩa không đủ dung lượng để tạo bản MP4, tác vụ báo lỗi; `.partial.ts` hoặc `.interrupted.ts` được giữ để cứu dữ liệu. Không có MP4 giả thành công.
- Không tắt ứng dụng hoặc cho máy ngủ trong thời gian ghi/hoàn thiện MP4. Một thời điểm chỉ có một tác vụ ghi/hoàn thiện.
- Backup chỉ lưu lịch ghi tương lai, không lưu video.

## Tua lại

- Bấm **Bật bộ đệm** khi xem kênh LIVE (hoặc bật tự động trong Cài đặt). Bộ đệm bắt đầu rỗng và tăng dần tới khoảng 10 phút, không thể tua về trước khi bắt đầu lưu.
- Chỉ có các nút **−10 giây**, **−30 giây**, **Về LIVE**. Tua thực tế phụ thuộc dữ liệu HLS đã có và khả năng seek của trình phát.
- Bộ đệm cục bộ sử dụng FFmpeg độc lập, giới hạn khoảng 2 GiB và dừng nếu ổ đĩa gần đầy; không có chức năng lưu bộ đệm thành video MP4.

## Kiểm thử và phạm vi

- Test logic Node, test FFmpeg với luồng MPEG-TS/HLS nội bộ; kiểm tra file MP4 với ffprobe; kiểm thử giao diện Chromium giả lập.
- Chưa build và thử DMG/EXE thực tế trên Windows/macOS, chưa xác minh mọi nguồn IPTV thật; codec đặc biệt hoặc DRM có thể không hoạt động.

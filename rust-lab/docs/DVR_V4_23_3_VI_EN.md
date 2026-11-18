# Open IPTV Pro v4.23.3 — Hẹn giờ ghi hình / Scheduled DVR

## Cách dùng (Windows/macOS)

1. Trong ứng dụng chọn **Lịch phát sóng EPG**. Phần **Hẹn giờ ghi hình chương trình** cho phép chọn kênh, tiêu đề, giờ bắt đầu và kết thúc. Hoặc chọn **⏺ Ghi** cạnh một chương trình trong lịch đã tải.
2. Chọn **Thay đổi nơi lưu** để chọn ổ đĩa còn dung lượng; bấm **Đặt lịch ghi** và xác nhận.
3. Ứng dụng phải **đang chạy** vào thời điểm hẹn và máy không được ngủ. Không có tính năng bật máy tự động hoặc ghi khi đã thoát ứng dụng.
4. Xem tiến độ tại trang EPG, chọn **Hủy lịch** trước giờ bắt đầu hoặc **Dừng ghi** trong khi ghi. Dừng/hỏng sẽ giữ file chưa hoàn tất nếu có dữ liệu.
5. **Mở thư mục ghi** để tìm video `.ts` hoàn tất. `.partial.ts` hoặc `.interrupted.ts` là bản chưa hoàn chỉnh, có thể dùng VLC để kiểm tra nếu dữ liệu còn hợp lệ.

## Nguyên tắc bảo vệ dữ liệu

- FFmpeg hoạt động trong tiến trình riêng; không can thiệp video đang xem, Snapshot, Cast/AirPlay, Timeshift hoặc playlist.
- Một bản ghi chạy mỗi lần. Lịch giao nhau không được cho phép; không có chế độ ghi đa luồng hoặc tự ghi bù.
- Lịch dài 1 phút–8 giờ và tối đa 45 ngày trước giờ phát. Múi giờ máy tính được dùng để nhập thủ công; EPG sử dụng giá trị sau chỉnh lệch giờ của ứng dụng.
- Lưu lịch trong `userData/dvr-schedule-v1.json`. Có chọn thư mục lưu video. Nếu cấu hình lịch hỏng, bản hỏng được đổi tên để kiểm tra chứ không tự xóa.
- Kiểm tra dung lượng trống ban đầu khoảng 250 MB, tiếp tục kiểm tra trong lúc ghi; theo dõi luồng không có dữ liệu 60 giây để dừng khi gặp lỗi. Giới hạn này không đảm bảo chống hết dung lượng trong mọi trường hợp.
- File video được ghi `.part.ts`, chỉ hoàn thành sau khi FFmpeg thoát bình thường gần cuối khung giờ, đủ dữ liệu và đổi tên thành `.ts`.
- File Backup `.iptvbackup` v4.23.3 có kèm **lịch hẹn tương lai** nhưng không nhúng video; các Backup cũ không thay đổi lịch DVR hiện có khi Restore.
- Chỉ sử dụng với luồng mà bạn có quyền xem và ghi hình. Không hỗ trợ DRM.

## Test và giới hạn

- `npm test`: kiểm thử logic và hồi quy; `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs` dùng FFmpeg/FFprobe hệ thống để kiểm tra luồng MPEG-TS nội bộ. `python tests/ui_dvr_v4233.py` dùng Chromium/Playwright giả lập bridge.
- Các bài kiểm thử Linux không thay thế thử nghiệm build/cài đặt trên Windows/macOS thật. Nên thử ghi chương trình 1–3 phút trên máy trước khi tin dùng lịch quan trọng.

## English

Schedule from the XMLTV guide or manually on Windows/macOS. Recording is isolated from the player and Timeshift, uses native FFmpeg stream copy into TS with persisted schedules and incomplete-file handling. Keep Open IPTV Pro running and the computer awake at the scheduled time. Only one concurrent recording is allowed. Finished video files are excluded from application backup. Test a short recording on your own device first.

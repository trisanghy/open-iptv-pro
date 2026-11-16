# Open IPTV Pro v4.23.5 – Kiểm thử bản MP4 / Tua lại 10 phút

## Thay đổi chính

- Scheduled DVR: tên file chứa **tên kênh, thời điểm bắt đầu–kết thúc theo giờ máy và tên chương trình EPG nếu khớp**; ghi tạm TS, sau đó stream-copy remux MP4, kiểm tra cấu trúc `ftyp`, `moov`, `mdat` trước khi đổi tên thành file hoàn chỉnh.
- Thất bại xuất MP4, tắt ứng dụng hoặc hết ổ đĩa: giữ bản TS tạm/bị gián đoạn để cứu dữ liệu. Không đổi đuôi TS giả thành MP4. Thêm trạng thái `finalizing` và theo dõi khi đóng ứng dụng.
- Tua lại: HLS 5 giây/segment, tối đa 120 segment (~10 phút), nút −10 giây/−30 giây/Về LIVE; giới hạn dung lượng tạm 2 GiB và dừng nếu ổ đĩa quá ít dung lượng.
- Giữ nguyên ứng dụng desktop, Smart Discovery, Doctor 3.0, Backup/Restore, EPG, nguồn M3U, Timeshift nội bộ, Cast và AirPlay; không thay đổi bản iOS/Android.

## Kiểm thử đã chạy trong môi trường mã nguồn

- `npm test`: 138 bài, **136 pass / 0 fail / 2 skip** (hai bài tích hợp FFmpeg có cờ chạy riêng).
- `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs`: **2/2 pass** với nguồn MPEG-TS và HLS thử nghiệm trên HTTP cục bộ; kết quả là `.mp4` được `ffprobe` đọc đúng codec.
- `python tests/ui_replay_mp4_v4235.py`: **đạt ở 1360×850 và 1000×850**; kiểm tra nút tua, EPG tự điền tên khi đặt lịch nhanh, quản lý lịch và thanh tiến độ cuối màn hình.
- Kiểm tra cú pháp JS/CJS; 8 bộ JSON ngôn ngữ hợp lệ, 261 ID giao diện không trùng, không còn nút tua 5 phút.

## Các giới hạn chưa xác minh

- Chưa build/chạy EXE và DMG trên máy Windows/macOS thật; không cam kết tất cả codec/livestream tương thích MP4, đặc biệt codec đặc thù và DRM.
- File MP4 hoàn thiện **sau khi lịch ghi kết thúc**, không xuất tức thì khi mới bắt đầu ghi. Ứng dụng phải đang chạy và máy phải thức suốt quá trình ghi/hoàn tất MP4.
- Nếu không đủ ổ trống để tạo MP4 bên cạnh bản TS tạm, ứng dụng giữ TS bị lỗi/gián đoạn, không xóa dữ liệu hay tuyên bố ghi thành công.
- Timeshift chỉ có thể tua lại khoảng thời gian **đã đệm sau khi bật**; không tua được trước thời điểm bật, và khoảng tua có thể thay đổi theo segment/keyframe/bitrate nguồn.
- Chưa push lên GitHub, chưa tạo Release.

# Open IPTV Pro 4.23.0 — Release Notes / Ghi chú phát hành

**Desktop Windows/macOS only. Source package, not a prebuilt installer.**

## Tiếng Việt

- **Smart IPTV Discovery:** Tìm danh mục IPTV công khai theo quốc gia (mặc định Việt Nam) từ iptv-org, quét thử 10/25/50 kênh mỗi lượt, giới hạn 3 luồng, hủy tác vụ, báo trạng thái Sống/Die/Chưa rõ. URL nội bộ/IP riêng bị loại khỏi chế độ kiểm tra Discovery.
- **Nhập có xác nhận:** Có thể nhập kênh đã có bằng chứng video, hoặc toàn bộ playlist công khai với cảnh báo chưa xác minh. Dữ liệu M3U đã lưu được giữ nguyên.
- **Doctor 3.0:** Xếp hạng độ ưu tiên 0–100 theo lịch sử kiểm tra/phát, độ trễ và số lần khựng; kiểm tra lại kênh chưa rõ, hỗ trợ đề xuất link dự phòng chỉ khi đủ bằng chứng, xác nhận trước khi thêm và hoàn tác an toàn. Điểm không phải phần trăm uptime.
- Giữ toàn bộ tính năng của v4.22.2: Backup/Restore, FFmpeg, Timeshift, MultiView, Snapshot, EPG, Cast/AirPlay, Doctor 2.0, 8 ngôn ngữ. Không sửa iOS/Android.

## English

- **Smart IPTV Discovery:** Opt-in country catalog from iptv-org, bounded multi-round live stream checks, explicit import of verified or unverified content. Never silently overwrite existing playlists.
- **IPTV Doctor 3.0:** Evidence-based score, historical analysis, safe link ranking, manually confirmed backup link suggestions, undo and JSON report. Rankings do not estimate real uptime.
- **Preserved:** Existing M3U/EPG, FFmpeg, Timeshift, MultiView, Snapshot, Cast/AirPlay, Doctor 2.0, Backup/Restore. Windows and macOS only.

No streams, channel credentials, DRM tools, or paid content are included. Regional availability and network restrictions may apply.

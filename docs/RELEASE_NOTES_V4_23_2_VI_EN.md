# Open IPTV Pro v4.23.2 — Desktop Stability Release Notes

**Windows/macOS source code.** Installers are created separately; source changes do not publish a Release.

## Tiếng Việt

- Rà soát Smart Discovery và Doctor 3.0: kiểm tra toàn bộ kênh, kể cả trên 1.000 kênh; giữ giới hạn kết nối đồng thời, có hủy và tiến độ.
- Chỉ nhận kênh **Sống** khi có bằng chứng video thực sự; chỉ nhận **Die** khi checker xác nhận nhiều lần. Không tự xóa hay thay URL chính.
- Sửa xem trước Smart Discovery khi đổi danh mục, hiển thị kết quả theo từng đợt, hỗ trợ chạy tiếp các kênh chưa kiểm tra.
- Sửa nhập/sửa nguồn M3U bị lỗi lưu dung lượng: báo lỗi và hoàn tác. Nâng độ chính xác khi phân tích dấu phẩy trong thuộc tính `#EXTINF`.
- Giữ Backup/Restore, FFmpeg, Timeshift, Snapshot, MultiView, EPG, Cast/AirPlay, Doctor 2.0 và giao diện Windows/macOS; iOS/Android không thay đổi.

## English

- Full and selective bounded-concurrency scans, cancellation and progress in Doctor 3.0.
- Evidence-only Alive/confirmed Dead classification; safer catalog switching and incremental Smart Discovery results.
- Atomic M3U source import/refresh when local storage fails; more accurate quoted EXTINF parsing.
- All existing desktop features retained. Native installers and live-network functionality still require actual platform tests.

No paid streams, DRM bypassing, or licensed channel content is included.

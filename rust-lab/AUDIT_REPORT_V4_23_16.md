# Kiểm tra Open IPTV Pro v4.23.16 — Network/HLS

## Những gì đã thay đổi
- Ưu tiên `electron.net.fetch` của Chromium (cùng stack proxy/DNS/TLS hệ điều hành) để tải HLS manifest, segment và xác định media.
- Khi Chromium không kết nối được: thử Node fetch **một lần**; không chuyển đường tải khi nguồn trả HTTP 401/403, không bypass DRM hoặc yêu cầu quyền nhà cung cấp.
- Nguồn/import, kiểm tra link và Smart Discovery trên desktop cũng dùng transport mới, giữ bảo vệ URL nguồn.
- Script `CHUAN_DOAN_LIVE_EVENTS_MAC.command` có `--compare-curl` để chẩn đoán lỗi Node fetch và so sánh curl macOS; che URL/token trong log.
- Không đính kèm M3U do người dùng cung cấp.

## Kiểm thử đã chạy (11/11/2026)
- `npm test`: 181 bài, 179 đạt, 0 lỗi, 2 tích hợp mặc định bỏ qua.
- `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs`: 2/2 đạt.
- HLS/segment proxy loopback dùng transport mô phỏng Chromium: đạt. Kiểm tra thử cả nhận diện playlist, lỗi DNS mô phỏng, chặn HTTP 403, hủy yêu cầu.
- JS/CJS syntax check: đạt. Shell script build Mac và chẩn đoán: hợp lệ.

## Chưa thể kiểm chứng
- Không kết nối được CDN phim `s6.kkphimplayer6.com` từ môi trường thử, vì thế chưa xác nhận Doraemon Movie 44 phát thật trên macOS.
- Chưa chạy ứng dụng đã đóng gói DMG/EXE trên phần cứng người dùng.
- Một link DASH `.mpd` trong nhóm LIVE EVENTS vẫn cần bộ phát DASH riêng.

## Cách xác minh trên Mac
Sau khi build/cài v4.23.16, mở cùng kênh đã lỗi ở v4.23.15.
Nếu vẫn không phát, chạy:
`bash CHUAN_DOAN_LIVE_EVENTS_MAC.command "$HOME/Documents/live events iptv.m3u" --limit 3 --compare-curl`
Chỉ gửi phần kết quả không chứa URL/token riêng tư.

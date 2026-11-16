# Báo cáo kiểm tra v4.23.15

Ngày: 2026-11-11 · Open IPTV Pro Desktop (Windows/macOS)

## Cơ sở
- Đã đọc file M3U người dùng cung cấp (557 mục), xác định nhóm LIVE EVENTS: 72 mục, gồm 71 HLS và 1 DASH. Không đóng gói lại file M3U chứa URL bên thứ ba.
- Ảnh thực tế cho thấy `manifestLoadError` với video phim và thanh tua không mong muốn trên kênh LIVE.
- Kiểm tra mã nguồn v4.23.14 phát hiện `video.play()` gọi quá sớm sau `hls.attachMedia()`, kiểm tra seekable chấp nhận LIVE có window dài, và lỗi HLS qua proxy thiếu thông tin HTTP.

## Sửa đổi
- Relay HTTP/HLS được tách thành `src/stream-proxy.cjs` để kiểm thử end-to-end, giữ CORS của cổng loopback.
- Bỏ Range cho manifest, retry GET khi máy chủ từ chối Range của phân đoạn. Phân loại manifest bằng bytes/MIME và kiểm tra #EXT-X.
- HLS.js: đợi `MANIFEST_PARSED` mới gọi `video.play()`, chặn callback cũ sau khi đổi nguồn.
- UI: LIVE thuần luôn ẩn thanh tua VOD; EVENT và VOD hiện chỉ với khoảng seekable thực tế.
- Không phát DASH `.mpd` bằng HLS.js; báo rõ giới hạn.
- Công cụ `scripts/diagnose-m3u.cjs` giúp kiểm tra host trên máy người dùng, không in URL đầy đủ.

## Kiểm thử
- `npm test`: 175 trường hợp, 173 đạt, 2 FFmpeg tích hợp bỏ qua theo mặc định, 0 lỗi.
- `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs`: 2/2 đạt với nguồn TS và HLS nội bộ.
- Thử HTTP relay end-to-end: HLS VOD, URL không có đuôi m3u8, relative segments, nguồn trả 403, nguồn trả HTML, HTTP range.
- VM/UI: thử LIVE có vùng seekable 120 giây vẫn ẩn thanh tua, EVENT/VOD bật.

## Chưa thể kiểm chứng
- DNS và kết nối mạng ngoài trong môi trường này không truy cập được các CDN trong playlist; không thể xác nhận riêng Doraemon Movie 44, một số Rumble/kkphimplayer phát thành công.
- Chưa build/chạy thử DMG hoặc EXE trên máy thật.
- DRM, xác thực, geo-block và media codecs khác biệt tùy nhà cung cấp; không tuyên bố đã sửa các giới hạn đó.

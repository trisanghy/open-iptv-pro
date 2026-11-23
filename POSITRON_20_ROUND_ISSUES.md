# Positron — Đợt 20 vòng mới, bắt đầu sau P5.1.300

## Vòng 01 — P5.1.301: ĐẠT
- Sửa cảnh báo coverage bị đẩy dưới danh sách; cảnh báo hiển thị trước details và nút xác nhận có màu rủi ro, aria-describedby.
- Commit 8ec333440d559cd82b5169307f48b0b8015c8703, QA fix a1087f39a7a629895ef9954f31459b50e9901753.
- Actions https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150: test/capture/Windows x64/Mac x64/ARM64 success.
- Ảnh Electron đã mở: positron-p51301-coverage-warning-before-1920x1080-real.png, positron-p51301-coverage-warning-after-1920x1080-real.png.
- qa301 11/11 true; issue dẫn sang vòng 02 là đọc danh sách quá dài, các dòng cuối bị CTA sticky che.

## Vòng 02 — P5.1.302: ĐẠT
- Thêm “Mở ngay tên kênh có nguy cơ” từ cảnh báo nhóm, mở thông tin rủi ro và đưa ví dụ kênh vào vùng đọc rõ.
- Commit 5815ea6613d23ef610ccea6111bf88ab8bf724b5.
- Actions https://github.com/trisanghy/open-iptv-pro/actions/runs/45151303832: test/capture/Windows x64/Mac ARM64/x64 success.
- Ảnh Electron đã mở: positron-p51302-risk-jump-before-1920x1080-real.png và positron-p51302-risk-jump-after-1920x1080-real.png.
- qa302 10/10 true, model/playlist không đổi; screenshot sau cho thấy nhóm 0/15 không rủi ro vẫn chen trong danh sách.

## Vòng 03 — P5.1.303: CANDIDATE
- Thêm bộ lọc read-only chỉ nhóm có mất dự đoán, loại zero-loss khỏi danh sách và báo số nhóm; không giảm các đánh giá nguy cơ tổng, không thay đổi trọng số AI.
- Node test + Electron QA qa303 dự kiến tạo positron-p51303-risk-only-before-1920x1080-real.png và positron-p51303-risk-only-after-1920x1080-real.png.
- Chưa tính hoàn tất trước khi CI, tải và mở xem ảnh, kiểm tra artifact.

## Vòng 04–20
Chưa thực hiện. Mỗi vòng yêu cầu commit/version, test, ảnh Electron trước/sau, mở ảnh trực tiếp và báo cáo.

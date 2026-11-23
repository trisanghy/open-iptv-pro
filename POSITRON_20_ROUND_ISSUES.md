# Positron — Đợt 20 vòng mới từ P5.1.300

Baseline GitHub xác minh 2026-11-23: Positron P5.1.300 Electron 4.23.385 tại 70105a86a0fb9e7a69683f2cb94ce1fc0ffba4a2.

## Vòng 01/20 — P5.1.301 đã đạt và soát ảnh
- Sửa cảnh báo AI bị dồn xuống cuối danh sách dài, đưa coverage warning lên trước details; CTA xác nhận rủi ro chuyển hổ phách và aria-describedby.
- Commit chính: 8ec333440d559cd82b5169307f48b0b8015c8703; commit sửa CI: a1087f39a7a629895ef9954f31459b50e9901753.
- CI: https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150 — test/capture/Windows x64/Mac ARM64/x64 success, release skipped.
- Ảnh đã mở bằng mắt: positron-p51301-coverage-warning-before-1920x1080-real.png và positron-p51301-coverage-warning-after-1920x1080-real.png từ artifact 14806640607.
- Audit: qa301 11/11 true, model/playlist/current channel không đổi, không tràn, cảnh báo trên danh sách và không bị CTA che.
- Vấn đề nhìn từ ảnh SAU: Nút xác nhận sticky vẫn che các dòng trong chi tiết dưới cảnh báo khi cuộn; ưu tiên vòng 02.

## Vòng 02/20 — P5.1.302 (CANDIDATE)
- Mục tiêu: từ cảnh báo nhóm AI, thêm hành động “Mở ngay tên kênh có nguy cơ” tự mở nhóm và hiển thị mẫu thật trong vùng đọc rõ trên CTA cố định; keyboard/aria-controls.
- Nguyên nhân: cần cuộn nhiều qua danh sách mẫu, các dòng gần dưới bị nút sticky che.
- Test: Node regression P302; Electron CDP QA P302 sẽ lưu positron-p51302-risk-jump-before-1920x1080-real.png và positron-p51302-risk-jump-after-1920x1080-real.png, kiểm tra không đổi model/playlist/tự phát.
- Chưa tính hoàn tất trước khi CI, ảnh thật, soát ảnh đều đạt.

## Vòng 03–20
Chưa thực hiện. Mỗi vòng cần sửa/test/chụp/mở ảnh và version riêng, không đếm 70 screenshot checks thành 20 vòng.

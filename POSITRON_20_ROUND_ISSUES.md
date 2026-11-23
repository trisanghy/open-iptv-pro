# Positron — Đợt 20 vòng mới từ P5.1.300

Baseline GitHub xác minh 2026-11-23: nhánh Positron HEAD 70105a86a0fb9e7a69683f2cb94ce1fc0ffba4a2; Electron 4.23.385; Actions 45147223325 (test/capture/build Windows + Mac success, release skipped), screenshot artifact 14805755084 được tải và mở ảnh thật.

## Vòng 01/20 — P5.1.301 (CANDIDATE)
- Ảnh đầu vào: p5-20-rounds/positron-p51300-affected-names-after-1920x1080-real.png (Actions 45147223325).
- Lỗi thấy: cảnh báo 'độ bao phủ Naive Bayes' ở cuối danh sách dài, dễ bị che bởi nút xác nhận sticky khi cuộn.
- Nguyên nhân: importPreview.append(risk) đặt cảnh báo sau details mở rộng; #poAIImportConfirm position:sticky.
- Sửa: insertBefore(risk,details); nút xác nhận chuyển sang trạng thái hổ phách khi có role=alert; aria-describedby trỏ về cảnh báo.
- Test: Node P301 + Electron Playwright/CDP QA P301 (cần xác minh trên Actions); bảo toàn trọng số, playlist, không autoplay.
- Screenshot dự kiến: p5-20-rounds/positron-p51301-coverage-warning-after-1920x1080-real.png.
- Trạng thái: Chưa tính hoàn tất trước khi CI, test và mở ảnh sau.

## Vòng 02–20
Chưa thực hiện. Mỗi vòng bắt đầu từ HEAD mới nhất thật, không tính lại lịch sử và không tự nhận đủ vòng nếu thiếu bằng chứng.

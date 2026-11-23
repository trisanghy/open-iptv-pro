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


## Đợt mới sau P5.1.304 — 23/11/2026
- Vòng 01/20 — P5.1.305: ĐẠT. Khắc phục tỷ lệ 0/0 gây hiểu sai, chẩn đoán độ chắc chắn trước/sau; 1015 tests pass, 5 skip; 10/10 QA P305, Windows/macOS builds success, soát trực tiếp ảnh 1920×1080. GitHub Actions 45166821071.
- Vòng 02/20 — P5.1.306: CANDIDATE. Ảnh cuối P305 hiển thị lời khẳng định “Chưa phát hiện chuyển chủ đề” dù không có kênh chung đủ chắc chắn. Sửa thông báo thành “chưa thể kết luận”, thêm thống kê bốn nhóm độ chắc chắn và tên kênh mẫu theo yêu cầu người xem. Test/ảnh/build đang chờ; KHÔNG tính hoàn thành trước khi soát ảnh thật.

## P5.1.307 — CANDIDATE
- Bổ sung tên mẫu của nhóm kênh cả hai mô hình đều chưa đủ chắc chắn, bảo vệ URL, chỉ đọc, kèm regression và QA ảnh Electron trước/sau. Chỉ đánh dấu hoàn thành sau CI xanh và đã mở xem ảnh thật.

- Trực tiếp mở PNG Electron P5.1.306: thấy dòng ví dụ bị CTA khôi phục sticky che ở cạnh dưới. P5.1.307 bổ sung khoảng cuộn và QA kiểm tra hàng ví dụ nằm trên CTA; ảnh P5.1.307 vẫn cần xác minh.

## P5.1.308 — CANDIDATE
- Dựa trên ảnh thật P5.1.307: bổ sung nút dẫn tới hàng đợi dạy AI từ danh sách kênh chưa chắc chắn. Không tự bật quyền, không tự cập nhật mô hình hay phát kênh. CI Electron cần xác minh hàng đợi và focus sau điều hướng.

## P5.1.309 — CANDIDATE
- Từ ảnh Electron P5.1.308: CTA khôi phục vẫn nổi ở cuối khi đang chọn nhãn dạy AI. Bổ sung trạng thái nhập chưa xác nhận tách khỏi dạy AI, ẩn CTA trong trainer và nút quay về preview, giữ nguyên dữ liệu/đồng ý, QA bảo vệ việc phát kênh. Chờ ảnh P309 và kiểm thử.

## P5.1.310 — CANDIDATE
- Từ ảnh P5.1.309, WatchFlow AI hẹp ở desktop. Thêm Đọc rộng/Thu gọn tùy chọn; CI sẽ xác minh Electron ở 1920 và 720px; chỉ tính sau soát ảnh.

## QA repair P5.1.310 — CI 45177813399
- Job capture failed at P271: teacherVisible=false although labelCountOnScreen, learnedOnChoice, actualNB true. Opened real Electron P271 before: teacher select is cut by panel bottom.
- Scroll teacher into viewport before geometry verification, then align replacement after DOM rerender. Keep assertions, no autoplay or data mutation. Candidate until CI green and new screenshot opened.

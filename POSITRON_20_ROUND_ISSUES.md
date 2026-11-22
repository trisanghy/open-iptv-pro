# Positron — đợt 20 vòng mới, bắt đầu từ P5.1.229
Ngày 22/11/2026. Chỉ nhánh Positron. Không đếm 70 ảnh QA là 20 vòng tính năng.

## Vòng 01 — P5.1.230 / Electron 4.23.315 — ĐẠT
- Ảnh P5.1.229 mở soát: danh sách 561 kênh và kênh QA 412 đang focus.
- Vấn đề: duyệt theo hàng có, nhưng thiếu chuyển nhanh giữa các nhóm.
- Sửa: ArrowLeft/Right nhảy tới nhóm trước/sau; bảo toàn playback; 2 ảnh Electron thật đã xem.
- Bằng chứng: CI run 45043514719 success 6/6, Release positron/v4.23.315-p5.1.230, SHA phần sửa ef06c22c7cb84ec2ae62cbd8672dc0a79781cefc.
- Ảnh: positron-p51230-group-navigation-before-1920x1080-real.png / after.

## Vòng 02 — P5.1.231 / Electron 4.23.316 — CHƯA ĐẠT CHUẨN ẢNH
- Alt+G chọn trực tiếp nhóm có hoạt động; screenshot cho thấy nhãn Đến nhóm đè lên dropdown.
- Release đầu tiên của P231 đã phát hành từ commit trước sửa; không ghi đè tag, không tính vòng hoàn thành.
- Sửa CSS 58px nhãn và thêm regression geometry ở SHA 0b096c095021ea4d82e0dbda9ce1bfb88e83e829; phát hành corrected version kế tiếp dưới tag MỚI.

## Vòng 02 tiếp tục — P5.1.232 / Electron 4.23.317 — CANDIDATE
- Bổ sung tìm nhóm theo tên không dấu ngay trên Alt+G, giữ tính năng chọn nhóm.
- Bảo toàn CSS sửa P231, test thêm input/name filter/no autoplay/geometry, Electron screenshot trước/sau.
- Chưa ghi vòng đạt cho đến khi xem PNG và Release hoàn tất.

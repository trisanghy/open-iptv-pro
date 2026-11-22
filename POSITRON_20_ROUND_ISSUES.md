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

## Vòng 02 tiếp tục — P5.1.232 / Electron 4.23.317 — ĐẠT
- Bổ sung tìm nhóm theo tên không dấu ngay trên Alt+G, giữ tính năng chọn nhóm.
- Bảo toàn CSS sửa P231, test thêm input/name filter/no autoplay/geometry, Electron screenshot trước/sau.
- Chưa ghi vòng đạt cho đến khi xem PNG và Release hoàn tất.

- Kết quả P5.1.232: CI 45045467358 success 6/6; Release positron/v4.23.317-p5.1.232; Electron before/after đã mở, 1/12 nhóm tìm được và kênh 121 focus đúng.

## Vòng 03 — P5.1.233 / Electron 4.23.318 — CANDIDATE
- Input: ảnh P5.1.232 cho thấy đã nhảy tới nhóm 03 từ hộp chọn nhưng thiếu lối quay về nhóm 01 đã dùng.
- Feature: lịch sử nhóm focus trong phiên tối đa 10, nút ↶ Nhóm trước chỉ hiện khi có nơi để quay lại; không ảnh hưởng lịch sử xem video.
- QA mới: screenshot P5.1.233 before/after 1920×1080; kiểm chứng focus trả về nhóm 01, không autoplay, không tràn.
- Chưa tính đạt tới khi CI/ảnh/Release được xác minh.

## Đợt mới sau P5.1.233 — Vòng 01 / P5.1.234 (CANDIDATE)
- Lỗi phát hiện: viết hoa Đ trong tên nhóm không khớp tìm kiếm không dấu; nguyên nhân là thứ tự chuẩn hóa trong renderer/positron-channel-jump.js.
- Sửa helper normalizeGroup, thêm Node regression và Electron ảnh before/after trên dữ liệu QA. Không sửa URL nguồn hoặc logic phát.
- Chưa tính đạt tới khi xác minh Node test, ảnh Electron thật đã mở xem, build và Release.

## Đợt mới sau P5.1.233 — Vòng 02 / P5.1.235 (CANDIDATE)
- Ảnh Electron thật P233 cho thấy từ nhóm 03 quay về nhóm 01 nhưng nút ↶ Nhóm trước vẫn hiện 01 · Main channels.
- Nguyên nhân: lịch sử nhóm được push mà không deduplicate, khiến các nhóm trùng vẫn nằm trong stack và dẫn tới self-back.
- Khắc phục stack nhóm theo phiên, tự ẩn nút khi không còn đích hợp lệ, bổ sung Node regressions và hai PNG Electron 1920×1080.
- Chưa tính vòng đạt trước khi xác minh Node tests, QA Electron, mở và soát ảnh mới, build/Release.

## Đợt mới sau P5.1.233 — Vòng 03 / P5.1.236 (CANDIDATE)
- Từ ảnh Electron P5.1.235 sau Back: nút trước biến mất chính xác nhưng không có thao tác Tiến tới nhóm vừa rời, buộc dùng Alt+G chọn lại.
- Thêm lịch sử đi tới (Forward) tối đa 10 nhóm trong RAM, đi tiếp sau Back, xoá Forward khi nhảy nhóm mới; giữ playback, playlist, Favorites, EPG, dữ liệu.
- QA mới chụp Electron thật trước/sau 1920×1080 và kiểm tra trạng thái nút, focus, không autoplay/overflow.
- Chưa tính vòng đạt cho tới khi test và release hoàn tất.

## Đợt mới sau P5.1.233 — Vòng 04 / P5.1.237 (CANDIDATE)
- Ảnh P5.1.236: nút Nhóm trước/sau đã dễ hiểu và hoạt động, nhưng thiếu thao tác quay lại bằng bàn phím khi hàng kênh đang focus.
- Thêm phím tắt Alt+ArrowLeft/Alt+ArrowRight với aria-keyshortcuts; giữ nguyên ArrowLeft/Right duyệt nhóm và Enter phát.
- Cải thiện workflow CI: build phụ thuộc Node test, có thể chạy song song Electron capture; Release vẫn phụ thuộc cả test/capture/build.
- QA trước/sau Electron thật 1920×1080 và Node regression bắt buộc trước đánh dấu hoàn tất.

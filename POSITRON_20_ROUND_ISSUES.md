# POSITRON 20 ROUND ISSUES — đợt tiếp tục từ P5.1.257

## Baseline đã xác minh
- HEAD lúc mở đợt: `a58aa136f91ab36bc14e748743b8fd11e0f275ba`, phiên bản `P5.1.257 / 4.23.342`.
- Ảnh Electron thực P5.1.257 đã mở: source-details before/after 1920x1080, source-details 720px.
- Phát hiện: danh sách chi tiết chỉ hiển thị 30 nguồn, thiếu tìm kiếm xuyên toàn bộ danh sách.

## Vòng 01 — P5.1.258 / 4.23.343 — ĐÃ XÁC MINH
- Tìm nguồn theo tên không phân biệt dấu/chữ hoa, duyệt trên tất cả sources; không sửa M3U.
- Ảnh Electron đã tải và mở: `positron-p51258-source-search-before-1920x1080-real.png`, `positron-p51258-source-search-after-1920x1080-real.png`, `positron-p51258-source-search-720-real.png`.
- QA: 942 tests, 937 pass, 5 skipped, 0 fail; 6/6 CI jobs success. Release `positron/v4.23.343-p5.1.258`.
- Đánh giá ảnh: tìm cAtEgOrY còn đúng 1 nguồn; không tràn ngang desktop/720px. Phát hiện nhu cầu lọc trạng thái Bật/Tắt riêng biệt.

## Vòng 02 — P5.1.259 / 4.23.344 — ĐÃ XÁC MINH
- Thêm trạng thái Tất cả/Bật/Tắt và số kết quả, kết hợp tìm tên.
- QA: 944 tests, 939 pass, 5 skipped, 0 fail; 6/6 jobs success. Screenshot thật trước/sau và 720px đã tải/mở; không tràn ngang.
- Ảnh lọc "Đang tắt" có 0/2 nguồn vì cả 2 nguồn trong fixture đang bật. Cần bổ sung kiểm thử nguồn bị tắt thực trong vòng sau.
- Release: `positron/v4.23.344-p5.1.259`; source HEAD phát hành `fe4dd6a7eab43d3520a113317ddc3f655e46b4f8`.

## Vòng 03 — P5.1.260 / 4.23.345 — ĐÃ XÁC MINH
- Đã thêm sắp xếp bảng chi tiết theo nhiều/ít kênh và tên A–Z, dữ liệu/thứ tự M3U gốc bất biến.
- QA: 946 tests, 941 pass, 5 skipped, 0 fail; 6/6 CI jobs success. PNG trước/sau 1920x1080 và 720px đã tải/mở. Trước là nguồn 552 trước 9; sau là 9 trước 552.
- Release: `positron/v4.23.345-p5.1.260`; commit `6a34a041ba7f688e0f584dd90ec646f679b2124f`.
- Phát hiện từ ảnh: có thể thấy danh sách đã sắp xếp nhưng chưa điều hướng từ hàng trong bảng tới thẻ nguồn gốc.

## Vòng 04 — P5.1.261 / 4.23.346 — ĐANG XÁC MINH
- Thêm nút Đi tới, tìm native source card theo ID và focus/scroll/highlight đúng thẻ nguồn, không thay đổi thứ tự hay playback.
- Screenshot cần trực tiếp mở: `positron-p51261-source-jump-before-1920x1080-real.png`, `positron-p51261-source-jump-after-1920x1080-real.png`, `positron-p51261-source-jump-720-real.png`.
- Chỉ ghi đạt khi test/CI, ảnh thật và release đã xác minh.

## Các vòng kế
- Bám theo PNG và nhật ký của vòng gần nhất, không tự ghi 20/20 khi chưa có bằng chứng.
- Không sửa nhánh khác, không force push hay ghi đè tag.

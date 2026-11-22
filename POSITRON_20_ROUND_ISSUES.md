# POSITRON 20 ROUND ISSUES — Đợt từ P5.1.237

- HEAD gốc kiểm tra ngày 2026-11-23: `92086f1c4ba0124230a8388e76b53bf7dc0b58ef`.
- P5.1.237 / 4.23.322: release, test và 6/6 jobs xanh; screenshot Electron 1920x1080 được tải từ artifact `14765506102` và trực tiếp mở xem.
- Ưu tiên 1: Phím tắt Alt+J/Alt+G cướp focus trong input của trang TV; xác minh nguyên nhân trong `renderer/positron-channel-jump.js`; sửa trong P5.1.238, test bàn phím và ảnh QA trước/sau.
- Ưu tiên 2: kiểm tra khả năng đọc/chọn nhóm khi panel chỉ rộng ~230px, không được suy đoán nguyên nhân trước khi QA.
- Ưu tiên 3: rà soát vị trí toast nổi trên player từ ảnh baseline; phân biệt thông báo QA với lỗi thật trước khi sửa.

## Cách tính vòng

Chỉ đánh dấu hoàn tất khi sửa nguồn, node test pass, Electron screenshot mới đã trực tiếp mở để xem, HEAD/CI/release kiểm chứng; không đếm mỗi ảnh hay mỗi test như vòng riêng.

## Vòng 01 — P5.1.238 / 4.23.323 [HOÀN TẤT]
- Commit nguồn `6e2ce559ca45e8a4887a1f9913e2840a676fe573`; fix CI `636b484fe5fdec59aad8377e4b37532c688c6c08`.
- CI `45051988709`: 904 Node tests, 899 pass, 5 skipped; 6/6 jobs thành công; release `positron/v4.23.323-p5.1.238`.
- Mở ảnh Electron P238 trước/sau 1920x1080 trực tiếp, `shortcutGuardQA238` và `shortcutAfterQA238` đều true.
- Đầu vào vòng 02: ảnh sau khi bật bảng nhảy làm danh sách kênh bị đẩy xuống; cần cách đóng bảng nhanh khi đang focus hàng kênh.

## Vòng 02 — P5.1.239 [CANDIDATE]
- Escape đóng bảng nhảy khi đang focus hàng kênh, khôi phục focus và không tự phát; thêm screenshot regression trước/sau.

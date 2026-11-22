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

## Vòng 02 — P5.1.239 / 4.23.324 [HOÀN TẤT]
- CI `45052833628` 6/6 thành công; release `positron/v4.23.324-p5.1.239`.
- Electron: mở ảnh P239 before/after thật, Escape đóng bảng, focus vẫn ở QA Channel 001, không playback, không tràn và 561 kênh được giữ.
- Đầu vào vòng 03: focus đang ở hàng kênh yêu thích; trong nguồn, Shift+F hiện bị xử lý như F thường nên có nguy cơ đổi dấu sao khi người dùng muốn lọc.

## Vòng 03 — P5.1.240 [CANDIDATE]
- Shift+F đổi bộ lọc all/fav bằng control native, F thường vẫn đánh dấu sao; QA xác thực dữ liệu Favorites không đổi, screenshot mới trước/sau và 6/6 CI.

## Vòng 03 — P5.1.240 / 4.23.325 [HOÀN TẤT]
- CI `45053439491`: 908 tests / 903 pass / 5 skipped; 6/6 job thành công, release `positron/v4.23.325-p5.1.240`.
- Mở ảnh Electron before/after thật, 561 kênh xuống 20 kênh yêu thích; xác nhận dữ liệu Favorites vẫn bất biến và đảo về Tất cả được.
- Đầu vào vòng 04: ảnh SAU chỉ hiển thị 20/561 chứ không nói đã bật bộ lọc Yêu thích; có nguy cơ người dùng nghĩ danh sách bị mất kênh.

## Vòng 04 — P5.1.241 [CANDIDATE]
- Thêm chip nhắc lọc Yêu thích trong panel kênh và nút Xem tất cả, không mutate playlist; kiểm thử Electron screenshot trước/sau và QA kích thước.

## Vòng 04 — P5.1.241 / 4.23.326 [HOÀN TẤT]
- CI `45054237610`: 910 tests / 905 pass / 5 skipped; 6/6 jobs success; release `positron/v4.23.326-p5.1.241`.
- Mở ảnh Electron P241 trước/sau thật; chip hiển thị Yêu thích · 20 và Xem tất cả dưới ô tìm, không tràn cột; click khôi phục 561 kênh, Favorites không thay đổi.
- Đầu vào vòng 05: chip mới chỉ hỗ trợ Yêu thích; khi tab khác như Vừa xem được bật, vẫn có thể thấy danh sách rỗng mà không hiểu vì sao.

## Vòng 05 — P5.1.242 [CANDIDATE]
- Tổng quát chip mọi native filter, hiển thị tên, số lượng, hành động xóa; kiểm thử khi chọn Vừa xem, kể cả empty state.

## Vòng 05 — P5.1.242 / 4.23.327 [HOÀN TẤT]
- CI `45054829307`: 912 tests, 907 pass / 5 skipped; 6/6 jobs success, release `positron/v4.23.327-p5.1.242`.
- Mở ảnh thật: Vừa xem · 0 hiện chip màu xanh tại sidebar, người dùng biết lý do không thấy kênh; click Xem tất cả khôi phục 561.
- Đầu vào vòng 06: lịch sử vừa xem rỗng không có hàng kênh để sử dụng bàn phím quay về.

## Vòng 06 — P5.1.243 [CANDIDATE]
- Shift+R từ hàng kênh mở nhanh Vừa xem, từ chip khi empty quay All, không playback và không mutate Favorites.

## Đợt mới 23/11/2026 — P5.1.250 (CANDIDATE)
- Baseline P5.1.249 / Electron 4.23.334, HEAD `13d4fdd25bd74e587c11be5f285d8012c21f4279`, CI `45059996731` hoàn tất thành công.
- Đã mở ảnh Electron 1920×1080 P249 trang TV, Nguồn, Escape trước/sau; vị trí `Kênh 412/561` xuất hiện đúng khi focus vào hàng 412.
- Lỗi mã: `#poFocusedPosition` chỉ cập nhật khi `focusin`, không xóa khi focus rời danh sách, nên có thể tiếp tục báo vị trí không còn được chọn.
- P250: thêm `focusout` dọn trạng thái khi panel đóng, giữ origin lúc nhảy số; CI Electron sẽ kiểm tra và ghi ảnh riêng.

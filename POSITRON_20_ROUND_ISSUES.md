# Positron — 20 vòng mới từ P5.1.323

Baseline 24/11/2026: HEAD 557361b9ab74340ca0f2999f1e0912c2c43803db, P5.1.323 / 4.23.408; CI 45223486028 đạt test/capture/build Win/Mac; release skipped theo chính sách stable-only.
Đã tải artifact 14841828720 và mở ảnh Electron trước/sau P323 1920x1080, 720x900; Sources và EPG.

## Vòng 01 — P5.1.324 (CANDIDATE)
- Lỗi từ ảnh: năm nút chuyển chế độ WatchFlow tại 720px chỉ cao khoảng 35px, không đồng đều với nút AI 44px.
- Root cause: renderer/positron-watchflow-next.css đặt min-height 35px; P5.1.81 giữ năm cột nhưng không sửa hitbox.
- Mã: tăng năm nút lên 44px; giữ một hàng, kiểm tra keyboard focus và tránh tràn.
- Test: tests/positron-324.test.cjs và scripts/positron-324-audit.cjs, chạy trong Electron CDP thực.
- Ảnh trước 1920 do áp dụng tạm CSS cũ 35px lên Electron mới, không phải binary cũ; ảnh sau 1920 và 720 là CSS mới.
- CHƯA TÍNH HOÀN THÀNH cho tới khi CI xanh và đã mở ảnh sau.
- Vòng 02 ưu tiên: xem lỗi EPG notification che khu vực lọc ở 720px, bảo toàn thông báo qua Notification Archive.

## CI repair P324
- Actions 45230032964: 1033 pass / 7 fail / 5 skip; lỗi version trong HTML, sidebar, Windows scripts và bài test metadata screenshot không tìm thấy vị trí khai báo P324 trong P5 QA script.
- Repair: đồng bộ 4.23.409, Positron P5.1.324; gọi helper QA P324 trong vòng CDP P5 chính, thêm filename vào báo cáo, giữ các assertion nguyên vẹn. Chưa tính vòng đạt trước CI mới.

## Vòng 01 P5.1.324 — ĐÃ ĐẠT
- Final code commit cb28492137a419d7f464e80dd7aa546d8b0027c1 (sau repair 7 lỗi version CI).
- Actions 45230817039: Node 1.040 pass, 5 skipped, 0 fail; capture success; Windows Setup/Portable x64, mac ARM/x64 success; Release skipped do Stable-only.
- Real screenshot artifact 14847601479: before/after 1920 và after 720, đã tải và MỞ trực tiếp. QA 11/11: 35→44px, một hàng, không tràn, keyboardFocus, playlist/model giữ nguyên, noAutoplay.
- Kết luận: đạt đầy đủ vòng 01, có ảnh trước/sau và soát trực tiếp.

## Vòng 02 P5.1.325 — CANDIDATE
- Phát hiện từ ảnh thật P324: thanh năm chế độ WatchFlow có kích thước 44px nhưng chưa có điều hướng mũi tên/remote; phải tab qua hoặc bấm bằng chuột.
- Nguyên nhân: renderer/positron-watchflow-next.js chỉ gắn click, không có listener keydown trên thanh năm chế độ.
- Sửa có ích: ArrowLeft, ArrowRight, Home, End chỉ dịch focus qua năm nút; không click, không kích hoạt Zap, không làm thay đổi kênh/playlist/mô hình khi chỉ bấm mũi tên.
- Kịch bản Electron P325: focus trước/sau 1920 và focus 720; soát ảnh, geometry, không tràn, noAutoplay, mô hình không thay đổi.
- **Không coi vòng 02 đã đạt trước CI và ảnh thật đã được mở.**

## Vòng 02 P5.1.325 — ĐÃ ĐẠT
- Final CI code SHA 4e5008e885b7495ca205411ad0ed02cee7a6d6bc, thêm CI repair 42d8122... khi QA thiếu tham số page.
- Actions 45234509867: 1.041 Node pass, 5 skipped, 0 fail; capture success; Win/mac arm/mac Intel build success; Release skipped do Stable-only.
- Real screenshots 14849585829 tải và đã MỞ trước/sau 1920, sau 720; 17/17 QA đạt; focus Gợi ý → Tiếp có viền rõ, vòng Home/End không kích hoạt phát.
- Vòng 02 được chứng minh đầy đủ.

## Vòng 03 P5.1.326 — ĐÃ ĐẠT
- Lỗi từ ảnh sau P325: chỉ bốn phản hồi AI nhưng metric hiện “86% hợp gu” không ghi rõ độ bất định, có thể bị hiểu sai là độ chính xác đã đo.
- Mục tiêu: thêm nhãn “(sơ bộ)” khi học 2–9 phản hồi, cung cấp giải thích tooltip/aria-label; giữ nguyên thuật toán, điểm, không gửi dữ liệu.
- Test: Node static regression + Electron screenshot trước/sau 1920 và sau 720, kiểm tra nút Xem không bị đẩy khuất, không tràn và không tự phát.
- Actions 45236620519: Node 1.042 pass/5 skipped/0 fail, capture & Win x64/Mac arm64/Mac x64 success; public release skipped Stable-only.
- Real Electron artifact 14848624172: ảnh trước/sau 1920 và sau 720 đã tải và MỞ; 11/11 QA pass; 86% giữ nguyên, thêm nhãn (sơ bộ), nút Xem vẫn hiển thị.
- Chốt 03/20 vòng đủ bằng chứng. 17 vòng sau CHƯA thực hiện; cần tiếp tục dựa trên ảnh P326 và HEAD hiện hành.

## Đợt MỚI từ P5.1.326 — 01/20 P5.1.327 (CANDIDATE)
- Baseline P326: 1042 Node pass, 5 skipped, 11/11 Electron QA, Win/Mac builds pass; Release skipped stable-only. Đã MỞ ảnh after 1920 và 720.
- Lỗi quan sát: viền focus nằm tại nút WatchFlow trên topbar phía sau bảng AI đang mở. Nguyên nhân: opener cố focus một tab cũ bị AI ẩn.
- Sửa: khi bảng AI mở lại, chỉ chuyển focus từ ngoài hoặc từ control đã ẩn vào nút AI; không thay đổi tiêu điểm của control đang hiển thị bên trong.
- QA: Electron thực trước/sau 1920, sau 720, focus DOM, overflow, no autoplay và playlist/model giữ nguyên. Chỉ tính hoàn thành sau khi có CI/ảnh được MỞ xác nhận.

### Sửa kịch bản kiểm thử P327 sau CI capture thất bại
- CI 45239378274: Node 1043 pass/5 skip/0 fail; Capture thất bại ở assertion tự áp đặt "trạng thái lỗi cũ phải còn hiện diện". Với cơ chế mới, hệ thống đã chuyển focus vào AI tab trước khi screenshot; đây là dấu hiệu sửa thành công, không phải lỗi chức năng. Đã tải và MỞ Electron ảnh 1920/720 của capture thất bại, xác nhận focus viền nằm ở nút AI trong panel, không tràn.
- Repair: ảnh TRƯỚC chụp trạng thái WatchFlow đã đóng và focus ở toolbar; ảnh SAU chụp sau mở và mở lại WatchFlow AI thực. QA xác minh cả mở lần đầu/mở lại, không ép phần mềm quay về trạng thái lỗi sau sửa hoặc bỏ tiêu chí focus.
- Cần chạy lại CI, mở ảnh trước/sau mới và kiểm tra toàn bộ build trước khi công nhận vòng hoàn tất.

## Đợt mới — Vòng 01 P5.1.327: ĐÃ ĐẠT
- CI run 45240853457, SHA b23effd09311698475cb78225da04944812901c4: Node 1.043 pass, 5 skipped, 0 failed; Electron 9/9 QA true; capture, Windows x64, Mac arm64, Mac x64 build pass; Release skipped stable-only.
- Ảnh tải từ artifact 14852091202 đã MỞ: trước đóng WatchFlow, sau mở AI focus đúng nút tại 1920 và 720, không tràn. So sánh với ảnh P326 cho thấy focus không còn ở topbar. Không claim playback/GPU/Cast thực.

## Đợt mới — Vòng 02 P5.1.328: CANDIDATE
- Từ ảnh P327, WatchFlow AI chỉ mở bằng nút; người dùng điều khiển bàn phím không có phím tắt trực tiếp.
- Tính năng: F6 hoặc Alt+Shift+W mở AI ngay trang TV và focus vào AI tab; không chiếm nhập liệu, không chạy ở trang Sources, không phát kênh hoặc thay đổi nguồn/model.
- QA Electron: before/after 1920, after 720; F6/Alt+Shift+W thực, điền tìm kiếm, non-TV guard, aria-keyshortcuts, không tràn/dữ liệu bất biến. Không đánh dấu hoàn tất trước CI/soát ảnh.

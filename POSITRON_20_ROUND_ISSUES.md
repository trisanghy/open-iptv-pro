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

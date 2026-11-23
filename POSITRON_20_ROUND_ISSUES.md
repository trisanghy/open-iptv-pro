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

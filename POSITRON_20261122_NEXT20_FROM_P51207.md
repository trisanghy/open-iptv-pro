# Positron — vòng mới từ P5.1.207 (22/11/2026)

Phạm vi: chỉ `Positron`. Baseline HEAD `2e0d53a478a3361731e0f191e8b06c54a9436e42`, Electron 4.23.292, P5.1.207. Không liên quan các nhánh stable/web/rust/mobile.

## Vòng 01/20 — ứng viên P5.1.208 / Electron 4.23.293

- Bằng chứng nguồn: `renderer/positron-horizon-v4.js` nút `#poRandomCycleReset` xóa tập kênh rồi tự đặt `hidden=true`, nhưng không trả tiêu điểm cho nút điều khiển còn thấy được. Bàn phím/remote có thể mất vị trí tiếp tục.
- Baseline ảnh thực lấy từ Actions #45020339907: `p5-20-rounds/positron-p51207-random-reset-after-1920x1080-real.png` đã mở và nhìn, 1920×1080, nút Bất kỳ và Làm mới xuất hiện trên transport.
- Sửa: ghi trạng thái focus trước khi ẩn nút Reset; sau reset chuyển focus về `#poNextRandomChannel` khi nút đó còn hiển thị. Không phát video, không đụng playlist/favorites.
- Regression: `tests/positron-p5.test.cjs`; Electron test sẽ nhấn Enter thực ở nút Reset, soát focus/counter/current channel/playlist và chụp `positron-p51208-focus-return-before-1920x1080-real.png`, `positron-p51208-focus-return-after-1920x1080-real.png`.
- **Trạng thái tại commit: CANDIDATE / CHƯA TÍNH HOÀN THÀNH**. Phải đợi CI kiểm thử, tải và MỞ ảnh P208 rồi mới được kết luận. Nếu test/ảnh không đạt, sửa lại cùng vòng. Chỉ tăng số vòng khi đủ bằng chứng.
- Vòng 02–20: CHƯA LÀM; chọn lỗi từ ảnh P208 và tiếp tục phiên bản nối tiếp, không sửa hàng loạt không kiểm thử.

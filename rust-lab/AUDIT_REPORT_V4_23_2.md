# Open IPTV Pro v4.23.2 — Báo cáo rà soát desktop

Ngày: 2026-11-09. Nền mã nguồn: v4.23.1 Smart Discovery + Doctor 3.0.
Phạm vi: Windows/macOS Electron/Chromium. Không sửa iOS/Android và chưa push GitHub.

## Lỗi logic đã sửa

1. **Doctor 3.0 giới hạn cứng 40 kênh:** thay bằng phạm vi toàn bộ kênh không giới hạn, toàn bộ kênh cần xác minh và các tùy chọn nhanh 10–1.000. Quét theo hàng đợi 4 worker tối đa, có tiến độ/hủy và lưu kết quả từng đợt.
2. **Kết luận sai Sống/Die:** chỉ ghi Alive nếu kết quả có `positiveEvidence===true`, chỉ ghi Dead nếu `confirmedDead===true`; còn lại Chưa rõ. Áp dụng cho Doctor 3.0 và Smart Discovery.
3. **Smart Discovery xem trước:** đổi danh mục hủy hiệu lực bản xem trước cũ; quét ALL sau khi dừng ưu tiên các kênh chưa kiểm tra; có nút Hiển thị thêm 150 kết quả thay vì giấu kết quả ngoài 150 kênh đầu.
4. **M3U chứa dấu phẩy trong thuộc tính EXTINF:** cả parser nền (`src/core.cjs`) và parser giao diện (`renderer/core-browser.js`) giờ tách tại dấu phẩy không nằm trong dấu nháy; nhận metadata `#EXTINF` không phân biệt chữ hoa/thường.
5. **Nhập/sửa nguồn khi hết dung lượng lưu:** khôi phục dữ liệu trước đó nếu `localStorage` lưu thất bại, có thông báo rõ ràng thay vì báo thành công giả.
6. **Đọc M3U quá lớn:** kiểm tra kích thước 25 MB trước khi đọc file, dùng lệnh đọc không chặn giao diện. 
7. **Doctor link dự phòng:** chỉ tạo bản ghi Hoàn tác sau khi thao tác lưu hoàn tất; lỗi ghi nhật ký một kênh không làm dừng toàn bộ lượt quét.

## Lỗi giao diện đã sửa

- Thanh bên bị tràn nhãn tại 1000px; thu gọn/chặn tràn và thêm tooltip cho nhãn dài.
- Nới các ô chọn phạm vi quét ở cửa sổ nhỏ; Doctor 3.0 có thanh tiến độ rõ ràng.
- Cập nhật nhãn điều khiển mới trong 7 bản dịch (ngoài tiếng Việt), tạo lại bundle; không dịch nhầm tên kênh từ nguồn M3U.
- Cập nhật phiên bản hiển thị, mô tả dự án, CHANGELOG và Release Notes lên 4.23.2.

## Kiểm thử đã chạy

- **Node.js:** 115/115 đạt, 0 thất bại, 0 bỏ qua (`npm test`).
- **JavaScript:** 58 file kiểm tra cú pháp, không lỗi.
- **HTML:** 239 ID không trùng, 21 script tham chiếu nội bộ hợp lệ, 8 JSON ngôn ngữ hợp lệ.
- **Chromium giả lập:** nhập file M3U, nhóm/thư mục, kéo kênh, yêu thích, chế độ video, nguồn, Doctor, Cast, cập nhật tự động, và chuyển ngôn ngữ; các bài kiểm thử chính đạt.
- **Tích hợp giao diện mới:** kiểm tra 1.205 kênh ở cả Smart Discovery và Doctor 3.0, giới hạn concurrency, bộ lọc và nút Xem thêm; chạy ở 1360×850 và 1000×850, không phát sinh lỗi JavaScript.
- **Regression Doctor:** hoàn tác link dự phòng, chưa đủ bằng chứng Sống/Die, hủy tác vụ, cấu hình phạm vi quét.

## Giới hạn / cần thử trên thiết bị thật

- Chưa build và mở bộ cài `.dmg`/`.exe` trong macOS hoặc Windows thật tại phiên này; cần `npm install` với Internet và công cụ build trên từng hệ điều hành.
- Chưa thể kiểm tra luồng IPTV trực tiếp qua Internet với máy tại Việt Nam. Kênh công khai có thể chặn địa lý hoặc ngừng phát.
- Chưa kiểm chứng tất cả TV Cast/AirPlay, mọi codec/HDR, Timeshift liên tục hàng giờ, hoặc mọi workflow GUI/hệ điều hành. Bộ test giả lập không chứng minh được tương thích thiết bị thực tế.
- Chưa push/publish GitHub, chưa tạo Release; người dùng cần kiểm tra phiên bản cài đặt đã build trước khi thay thế bản đang dùng.
- Sao lưu `.iptvbackup` không được mã hóa: bảo quản riêng nếu chứa URL có token hoặc hồ sơ/PIN.

## Lệnh thử nghiệm

```bash
npm install
npm test
bash BUILD_MAC.command
```

Windows: chạy `BUILD_WINDOWS.bat` (Windows x64). Dự án không chứa bộ cài sẵn hoặc thư viện `node_modules`.

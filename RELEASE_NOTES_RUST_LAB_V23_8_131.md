# Open IPTV Pro Rust Lab v23.8.131 — Web Cast V2 parity

## Tính năng
- Giao diện Cast / AirPlay mới đồng bộ theo phiên bản Web Online với ba tab: **Ghép đôi TV**, **Google Cast** và **AirPlay**.
- Đồng bộ cấu trúc cửa sổ, bảng điều khiển TV, phím chuyển kênh, phát/tạm dừng/dừng, điều khiển âm lượng, nhãn trạng thái, SVG và ba bộ màu từ giao diện Web Cast V2.
- Giữ nguyên giao thức ghép đôi TV mã hóa ECDH P-256 / AES-GCM bằng mã sáu số; không tự tạo mã giả và không xác nhận TV đang phát khi chưa nhận phản hồi.
- Google Cast trên Rust tiếp tục dùng cầu nối native để tìm, chọn, phát và dừng Chromecast/Google TV qua LAN; AirPlay trên macOS mở trình phát Safari thay vì giả lập bộ chọn TV của Chrome.
- Bổ sung kiểm tra hồi quy `tests/cast-web-v2-parity.test.cjs`.

## Phạm vi và giới hạn
- Chỉ áp dụng trên nhánh thử nghiệm `experiment/rust-tauri-v2`, không sửa `main`, Web Online hoặc Electron.
- Các tính năng điều khiển từ xa native chưa có API (như tạm dừng Cast qua IPC) không bị giả lập là đang hoạt động; ghép đôi TV mã sáu số sử dụng điều khiển đầy đủ.
- Tag cũ không bị ghi đè; các bộ cài được xây dựng qua GitHub Actions để kiểm tra riêng.

## Kiểm tra
- Dùng `npm run test:quick`, `npm test` và chạy kiểm thử thực tế Chromecast / TV ghép đôi / AirPlay trên thiết bị.

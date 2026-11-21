# Rust Lab v23.8.97 — kiểm thử ảnh chuyên sâu và đồng nhất giao diện

**Phạm vi duy nhất:** `experiment/rust-tauri-v2`.

## Các sửa lỗi sau khi xem ảnh thực tế

- Sửa bảng **GPU / Tăng tốc video** đang dùng nền xanh đen cố định giữa các thẻ màu sáng, đồng bộ nút và chữ trong bảng với theme Light.
- Sửa cửa sổ khuyến nghị GPU theo màu theme sáng; giữ nguyên chức năng benchmark và cảnh báo không nhầm mã hóa GPU với AI upscale.
- Đồng bộ nền, viền, màu chữ trong ô chọn Live Caption / Live Translate / TTS.
- Sửa các trạng thái chọn tab, chip nhóm, nút lưới/danh sách và kênh được chọn ở Dark/AMOLED để dùng màu nhấn đã chọn, thay vì xanh neon cố định.
- Giữ nguyên video, chức năng phát, nguồn M3U, dữ liệu cũ, hồ sơ, EPG và cài đặt. Không tự nhận có AI upscale khi backend chưa có.

## Kiểm tra ảnh

- Chụp 11 trang chính cùng hơn 40 trạng thái trong các tính năng: phát TV, thanh điều khiển, tua lại, EPG, danh sách kênh, AI phụ đề/dịch/TTS, GPU, nhận dạng video, Smart Discovery, Collector, gộp và sửa nguồn, MultiView, Snapshot, Health, Doctor, hồ sơ và các nhóm Cài đặt.
- Kiểm tra theme Light, Dark và AMOLED bằng **renderer Rust thật chạy Chromium trên CI**; đây **không** phải ảnh chụp Tauri native.
- Cửa sổ xác nhận quyền sử dụng M3U được chụp và bấm **Hủy**, không tự đánh dấu chấp thuận; tránh ảnh hưởng các ảnh chụp trang tiếp theo.
- Kiểm tra CSS hồi quy; các chức năng đòi backend Tauri native, tải model hoặc playlist thực cần được xác minh thêm trong ứng dụng đã đóng gói.

## Phát hành

Tag mới `rust-lab/v23.8.97` bất biến; mọi tag và bản Rust Lab cũ được giữ nguyên. Chỉ đánh dấu Windows EXE x64 hoặc macOS DMG là có thể tải sau khi workflow thực sự tạo thành công artifact.

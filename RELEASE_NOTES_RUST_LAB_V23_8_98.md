# Rust Lab v23.8.98 — Đồng bộ Theme Tối và AMOLED

**Chỉ áp dụng trên nhánh:** `experiment/rust-tauri-v2`.

## Khắc phục sau khi chụp màn hình thực tế

- Theme **Dark**: đồng nhất các thành phần EPG, DVR, công cụ TV, GPU, bảng điều khiển phụ đề/dịch/TTS, nguồn IPTV, Smart Discovery, Collector, Health, Doctor, danh sách kênh và các nhóm Cài đặt bằng bảng màu tối của ứng dụng.
- Theme **AMOLED**: nền khung ứng dụng, sidebar và thanh điều hướng đen thật `#000000`; bảng nội dung `#080808`, nút/ô chọn `#151515` và viền xám `#303036`. Bỏ các bảng xanh đen dùng màu cố định; giữ nền video tối.
- Các tab/kênh được chọn, nút AI và kiểm tra phần cứng dùng **màu nhấn người dùng chọn** thay vì xanh neon cố định.
- Bảo toàn các thiết kế giao diện thay thế khi dùng Dark. AMOLED buộc vùng nền chung về đen thuần trong mọi thiết kế.
- Không thay đổi logic player, playlist, danh sách kênh, quyền sử dụng M3U, tính năng AI, EPG, dữ liệu hoặc cài đặt đã lưu.
- Không chỉnh Web Online, Electron, Mobile, hoặc `main`.

## Bằng chứng và giới hạn kiểm thử

- Bộ 11 trang Light cũ vẫn đạt hồi quy.
- Kiểm thử renderer Rust trong Chromium ở Dark/AMOLED chụp **66 ảnh riêng**: các trang, bảng chọn kênh, Video AI/GPU, nguồn, DVR, EPG, các nhóm Cài đặt. Kết quả đầu cho thấy canvas AMOLED RGB(0,0,0), các thẻ chính RGB(8,8,8), không phát hiện pha xanh trong thành phần đã đo.
- Một số popup AI/Whisper không mở được do cần backend Tauri native, không tuyên bố đã xác minh chức năng mô hình hoặc xem kênh thật.
- Bản Windows x64 được xem là sẵn sàng chỉ sau khi GitHub Actions build xong và xác minh có EXE thực tế.
- Ảnh này được chụp từ **renderer Rust chạy Chromium**, không phải Tauri native trên Windows/macOS.

## Lịch sử phát hành

Tag mới `rust-lab/v23.8.98` được tạo bất biến, không ghi đè hoặc force-push. Giữ nguyên mọi bản phát hành trước.

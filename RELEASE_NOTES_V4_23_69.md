# Open IPTV Pro v4.23.69 — Gói phát hành ba phiên bản

**Ngày:** 18/11/2026

Bản `v4.23.69` là **bộ phát hành tổng hợp**, KHÔNG phải phiên bản thực thi mới của Electron. Nó cung cấp đầy đủ bộ cài đã xác minh cho cả ba dòng:

| Dòng | Phiên bản chính xác | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| Electron Desktop | **v4.23.68** | **Stable** | `build-sources/electron-desktop`, commit `6ea66b51bd99e025db015dabfe0dbc44a1182565` |
| Rust Lab Tauri | **v23.8.30** (`4.23.17-tauri.23.8.30`) | **Beta độc lập** | `experiment/rust-tauri-v2`, commit `bfd03e86c64355c243974a9a91f12a44220af61c` |
| Web Online | Source commit `713509deab7bb4a7851f4db416949f67c7fb9f9f` | **Đang triển khai** | `web/online`; https://trisanghy.github.io/open-iptv-pro/ |

## Nội dung
- **Electron (Mac ARM64/Intel, Win x64):** bản Stable 4.23.68, trình phát, kênh yêu thích, EPG, AI phụ đề/dịch/TTS, FFmpeg, PiP, DVR, Snapshot, Smart Discovery. Bản chụp mã nguồn Electron trong `main` đã cập nhật phần xác nhận quyền sử dụng file/link M3U và Discovery từ nhánh phát triển; bộ cài kèm release vẫn là bản nhị phân 4.23.68 bất biến từ release gốc. Nếu cần nhị phân có đúng các sửa đổi mới nhất trong mã nguồn, phải phát hành phiên bản Electron riêng được build và kiểm chứng lại.
- **Rust Lab (Mac Universal, Win Setup/Portable):** v23.8.30 có cảnh báo quyền nội dung trước khi nhập file/link M3U, xác nhận hai ô trước khi dùng Smart Discovery, xác nhận lại trước khi nhập, lưu/rút xác nhận trên máy và lớp chặn SSRF qua DNS + redirect + playlist/segment.
- **Web Online:** bản mới nhất đã triển khai từ `web/online`, cập nhật giao diện mobile, đăng nhập/đồng bộ theo cấu hình Supabase và xác nhận quyền sử dụng nguồn. Giới hạn trình duyệt vẫn áp dụng.
- **Mã nguồn và hướng dẫn:** `renderer/` + `src/` Electron, `rust-lab/` Rust, `web/` Web, ZIP nguồn toàn bộ, website ZIP, hướng dẫn và SHA-256.

## Quyền sử dụng nội dung

Open IPTV Pro chỉ là dự án phần mềm trình phát; không cung cấp nội dung truyền hình hay giấy phép phát sóng. Người dùng cần có quyền truy cập hợp pháp đối với file/link M3U và kênh tự nhập/xem. Xác nhận trong ứng dụng là sự tự cam kết của người dùng, không phải chứng nhận bản quyền. Miễn trừ trách nhiệm của tác giả áp dụng trong phạm vi pháp luật cho phép, không thay thế các trách nhiệm luật định.

## Tải và kiểm tra

Xem `docs/INSTALL_V4_23_69.md`. Trong bản release có `SHA256SUMS.txt`; đối chiếu SHA-256 trước khi cài. Electron và Rust lưu dữ liệu riêng, không mặc định tương thích và nên sao lưu trước khi đổi ứng dụng.

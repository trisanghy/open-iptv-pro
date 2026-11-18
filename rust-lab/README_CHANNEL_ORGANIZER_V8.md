# Rust Lab v8 — Sắp xếp thư mục và kênh

Nhánh thử nghiệm: `experiment/rust-tauri-v2`. Bản Electron gốc không thay đổi.

## Các thao tác

- **Sắp xếp thư mục:** Kéo thả tiêu đề thư mục trong danh sách hoặc thẻ thư mục ở trang **Thư mục kênh**. Nút **↑/↓** ở trang Thư mục giúp điều chỉnh bằng chuột và bàn phím.
- **Sắp xếp vị trí kênh trong cùng thư mục:** Kéo một kênh lên/xuống và thả vào **nửa trên** hoặc **nửa dưới** của một kênh khác. Vạch tím đánh dấu vị trí được thả. Không cần phát kênh để sắp xếp.
- **Chuyển một kênh:** Kéo kênh thả lên **tên thư mục đích**, hoặc nhấn nút `▤` bên cạnh tên kênh rồi chọn thư mục.
- **Chuyển nhiều kênh:** Tích các ô vuông trước kênh, có thể chọn từ nhiều thư mục. Bấm **Chuyển thư mục** hoặc kéo một kênh đã chọn lên tiêu đề thư mục khác.
- **Chọn nhanh:** Nút **Chọn hiện có** chỉ chọn những kênh đang hiện sau khi lọc/tìm kiếm; nhấn **Bỏ chọn** để bỏ lựa chọn. Giữ **Shift** khi chọn ô vuông để chọn cả khoảng; Ctrl/Cmd + click vào dòng kênh để chọn mà không mở phát.
- **Lưu tự động:** Thứ tự thư mục nằm trong `groupOrder`, thứ tự kênh theo thư mục nằm trong `channelOrder`; đều lưu vào dữ liệu ứng dụng Tauri trên ổ đĩa. Không thay URL nguồn, Snapshot, yêu thích hoặc phát video.
- **Tự cập nhật M3U:** Kênh đã ghép lại cùng ID vẫn giữ thư mục/thứ tự cũ; kênh mới được thêm cuối thư mục tương ứng. Nếu playlist thay đổi danh tính kênh không thể đối chiếu, thứ tự của riêng kênh đó có thể cần sắp xếp lại.
- **Xuất M3U:** Thứ tự xuất tuân theo thứ tự thư mục/kênh đang lưu trong ứng dụng.

## Kiểm thử

Chạy: `npm test` (bao gồm `tests/tauri-channel-organizer-v8.test.cjs`). Các bài mô phỏng DnD trình duyệt dùng dữ liệu kênh giả, không cần IPTV thật. Chạy Rust Core: `cargo test --manifest-path src-tauri/Cargo.toml`.

## Build Mac

Trên Mac có Node.js, Rust và Xcode Command Line Tools: `bash BUILD_MAC_TAURI.command`. DMG được tạo tại `src-tauri/target/release/bundle/dmg/` khi thành công.

## Giới hạn

Các bài kiểm thử JS và giao diện mô phỏng không chứng minh DMG/EXE biên dịch hoặc phát IPTV thật. Chưa xác minh Cargo build trong môi trường tạo mã nguồn này.

## Giao diện gọn (v8)

- Thanh header ở đầu vùng nội dung được loại bỏ để video và danh sách kênh có thêm diện tích.
- Nút **☰** nằm ở phần đầu sidebar: nhấn một lần để thu gọn còn dải biểu tượng 72 px, nhấn lần nữa để mở.
- Chức năng điều hướng vẫn dùng được khi thu gọn. Di chuột lên biểu tượng để xem tên trang. Trạng thái thu gọn được ghi nhớ.
- Mở file / thêm URL M3U vẫn nằm trong **Quản lý nguồn** và màn hình chưa chọn kênh, không mất chức năng.
- Việc thu gọn sidebar không tác động đến trạng thái phát video, nhóm kênh hoặc dữ liệu nguồn.

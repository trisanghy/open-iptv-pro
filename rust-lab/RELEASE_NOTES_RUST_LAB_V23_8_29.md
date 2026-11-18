# Rust Lab v23.8.29 Beta — Quyền sử dụng M3U và điều khoản Smart Discovery

Bản phát hành bất biến mới, dựa trên v23.8.28 và sửa bài kiểm thử hủy Smart Discovery sau khi xác nhận điều khoản.

- Xác nhận quyền sử dụng khi mở M3U, nhập URL M3U, sửa URL hoặc thêm playlist từ GitHub. Ô xác nhận mặc định trống, Hủy không nhập nguồn.
- Smart Discovery phải xác nhận rõ hai điều kiện về điều khoản nhà cung cấp và trách nhiệm bản quyền/quyền xem trước khi khám phá.
- Trước khi nhập kênh tìm được cần xác nhận lại; nguồn mở hoặc kiểm tra phát thành công không tương đương nguồn có quyền sử dụng.
- Rust Lab lưu sự đồng ý ban đầu ở thiết bị với phiên bản điều khoản, cho phép **rút lại** từ Smart Discovery; mỗi lần nhập kênh vẫn cần xác nhận.
- Tác giả là người làm ứng dụng cá nhân, không cung cấp nội dung, không chịu trách nhiệm cho dữ liệu/ngồn xem do người dùng nhập trong phạm vi pháp luật cho phép.
- Giữ tính năng PiP, FFmpeg, TTS, CC và bố cục responsive.

Tag: `rust-lab/v23.8.29`. Không thay đổi main, Latest Electron, hoặc những tag/release trước.

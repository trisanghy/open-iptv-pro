# Open IPTV Pro Rust Lab v23.8.27 — Cảnh báo quyền sử dụng và điều khoản Smart Discovery

**Phiên bản thử nghiệm (Beta).** Bản này dựa trên Rust Lab v23.8.26, không thay đổi tag hoặc file của các bản trước.

## Thay đổi mới
- Hiển thị hộp cảnh báo trước khi người dùng mở file M3U, nhập URL M3U hoặc chỉnh sửa URL nguồn.
- Người dùng phải tự tích ô xác nhận mình có quyền hợp pháp truy cập và xem nội dung đã nhập; mặc định ô trống, bấm Hủy không thêm nguồn.
- Với **Smart Discovery**, trước lần sử dụng đầu tiên trong phiên phải tự xác nhận **hai điều kiện**: đã kiểm tra điều khoản của bên cung cấp và hiểu mình tự chịu trách nhiệm về quyền sử dụng kênh.
- Trước khi nhập những kênh tìm được từ Smart Discovery, yêu cầu xác nhận lại. **Việc có kênh công khai hoặc thử phát thành công không có nghĩa nguồn được cấp phép.**
- Việc thêm URL playlist từ repository công khai cũng được chặn bởi xác nhận quyền sử dụng.
- Xác nhận chỉ có hiệu lực cho lần nhập hoặc phiên Smart Discovery hiện tại, **không tự tích, không ghi nhớ sang lần chạy sau**.
- Tác giả là người phát triển phần mềm cá nhân, không cung cấp kênh hay bảo đảm bản quyền/dữ liệu do người dùng nhập. Trách nhiệm pháp lý chỉ được giới hạn **trong phạm vi pháp luật cho phép**.
- Giữ tính năng responsive, công cụ nhanh, tùy chọn 1–32, PiP, FFmpeg, Live Caption, Translate và TTS của v23.8.26.

## Phát hành
- Tag mới bất biến: `rust-lab/v23.8.27`, không ghi đè `rust-lab/v23.8.26`.
- GitHub Actions chỉ đính kèm installer Windows/Mac và ZIP mã nguồn sau khi build thành công.
- Xem thêm [README](README.md), [LICENSE](LICENSE) và tuyên bố trách nhiệm của [Open IPTV Pro](https://github.com/trisanghy/open-iptv-pro#readme).

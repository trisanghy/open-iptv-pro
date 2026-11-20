# Test report – Experiment C / 11-11-2026

## Đã thực thi trong môi trường chuẩn bị gói

| Hạng mục | Kết quả |
| --- | --- |
| Đọc và giải nén ZIP mã nguồn gốc v4.23.17 | Thành công (262 file) |
| Đối chiếu SHA-256 từng file gốc với file đưa vào gói mới | **262/262 nguyên vẹn** |
| `npm test` (bản Electron gốc) | **184 pass, 0 fail, 2 skip**, tổng 186 |
| `bash -n BUILD_RUST_NATIVE_MAC.command` | Pass (kiểm tra cú pháp shell) |
| `bash -n TAO_NHANH_RUST_NATIVE_MAC.command` | Pass (kiểm tra cú pháp shell) |
| Kiểm tra dấu ngoặc qua bộ tách cú pháp token Rust | Pass mức kiểm tra cấu trúc, **không thay thế rustc** |
| Khởi tạo nhánh thử nghiệm Git trên thư mục trống có test commit | Pass; nhánh `experiment/rust-native-slint-libmpv`; không có remote |

## Chưa được thực thi, không được coi là pass

- `cargo check`, `cargo test`, `cargo build --release` (môi trường hiện tại không có `cargo` hoặc `rustc` và không tải được Rust toolchain).
- Biên dịch Slint UI thực tế, kiểm thử UI native Windows/macOS.
- Link libmpv trên máy đích, kiểm tra codec/HLS/RTSP và cửa sổ mpv.
- Benchmarks RAM/CPU/GPU, MultiView, Timeshift, DVR.

**Cần chạy các script build trong ZIP trên máy macOS hoặc Windows thật, gửi lại log nếu báo lỗi.**

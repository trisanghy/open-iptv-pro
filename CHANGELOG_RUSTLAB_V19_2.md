# Changelog v19.2

- Bảo toàn layout tĩnh hai hàng v19.1 theo ảnh mẫu; không thay đổi lõi phát Rust.
- Sửa lỗi tham số `lipo <input_file> -verify_arch <arch>` của các job Mac Universal.
- Sửa test đã cố định version v19 và test DOM lỗi thời, thay bằng kiểm tra hồi quy có thể chạy qua các bản vá.
- Bảo toàn các tag v19 và v19.1, tạo tag mới `rust-lab/v19.2`.
- Build và chỉ xuất bản DMG Universal, Windows Setup, ZIP Portable, Source ZIP + SHA256SUMS khi GitHub Actions thực sự đạt.
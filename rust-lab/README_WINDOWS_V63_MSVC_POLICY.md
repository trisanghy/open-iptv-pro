# Open IPTV Pro Rust Lab v6.3 — Windows build preflight

## Kết luận từ log ngày 14/11/2026

- `node v26.13.1`, `npm 11.20.0`: đã cài.
- `rustc 1.100.0`, `cargo 1.100.0` (MSVC): đã cài.
- Visual Studio Build Tools bị Windows chặn với `Organization policies are preventing installation` (mã 8008).
- Không phải lỗi code Tauri/Rust; chưa chạy được `cargo test` hoặc `tauri build` trên Windows đó.

## Cách giải quyết **một lần**

1. Mở `OPEN_MSVC_INSTALLER_WINDOWS.ps1`, hoặc dùng trực tiếp Visual Studio Installer từ Start.
2. Chọn **Modify** nếu có Visual Studio/Build Tools đã cài. Nếu chưa có, tải Build Tools từ https://visualstudio.microsoft.com/visual-cpp-build-tools/ .
3. Chọn **Desktop development with C++**; giữ **MSVC x64/x86**, **Windows 10/11 SDK**.
4. Nếu Windows tiếp tục báo do chính sách tổ chức, cần quản trị viên hoặc chủ máy cho phép trình cài đặt; không nên tìm cách vô hiệu hóa chính sách bảo mật.
5. Sau khi cài xong, chạy `BUILD_WINDOWS_TAURI.ps1` trong bộ nguồn (không cần cài lại Node/Rust).

Script v6.3 **không tự chạy lại WinGet cài Visual Studio** khi chưa tìm thấy MSVC. Nó dò cả VS 2022/2026, bản Build Tools/Community và Developer PowerShell đã nạp sẵn; nếu thiếu thì dừng sớm, in hướng dẫn và ghi `build-logs/MSVC_INSTALL_REQUIRED.txt`.

Kết quả kiểm thử JavaScript không xác nhận build Rust/EXE.

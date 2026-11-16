# Build Open IPTV Pro Rust Lab v16 trên macOS

1. Giải nén mã nguồn (giữ nguyên cấu trúc).
2. Mở Terminal tại thư mục `OpenIPTVPro_v4.23.17_Rust_Tauri_Lab`.
3. Chạy `bash BUILD_MAC_FAST.command`.

Script sử dụng Node/npm, Rust/Cargo và Xcode Command Line Tools có sẵn; cài dependency npm, chạy hồi quy JS nhanh rồi build DMG Tauri 2.

Đường dẫn DMG sau build thành công: `src-tauri/target/release/bundle/dmg/`.

Đây chỉ là mã nguồn/nhánh thử nghiệm. Không ghi đè `main` hay ứng dụng Electron.

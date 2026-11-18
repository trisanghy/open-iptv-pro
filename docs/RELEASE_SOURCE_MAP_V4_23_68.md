# Bản đồ mã nguồn bất biến — 18/11/2026

| Thành phần | Nhánh phát triển (giữ nguyên) | HEAD đã xác minh | Vị trí trong main |
| --- | --- | --- | --- |
| Electron Desktop 4.23.68 | build-sources/electron-desktop | c8a18e83f242246c7f93d4445765ee1f040b8f10 | renderer/, src/, scripts/, tests/, package.json |
| Rust Lab 23.8.26 Beta | experiment/rust-tauri-v2 | 04b0fd2e6110e3165bef62fb9b7155651f9dd4c9 | rust-lab/ (cây source đầy đủ) |
| Web Online | web/online | 787c73a00b1be51fd5970a204d50d8bc9fcfad91 | web/ (cây source và site đầy đủ) |
| Main trước khi tập hợp | main | 86dcdea4a226e27ed6c4a5d879cbd12b84b0e684 | Giữ lịch sử, README, LICENSE, changelog và workflow |

**Cách tập hợp:** sử dụng Git-tree của từng HEAD cùng repository, không chép file ngẫu nhiên hay đổi nhãn bản Rust. Nhánh gốc vẫn độc lập. main dùng Electron v4.23.68 làm desktop chính, Rust và Web ở thư mục riêng.

**Phát hành:** source ZIP của main tại tag v4.23.68 bao gồm cả ba codebase; installer Electron được GitHub Actions build từ main; installer Rust lấy nguyên bản v23.8.26 với hai bảng checksum gốc và xác minh trước khi đính kèm.

**Không thay đổi:** Rust Lab vẫn Beta, Web Online vẫn được deploy từ nhánh web/online; không xóa bất kỳ release/tag nào đã tồn tại. Muốn khôi phục đúng bản cũ hãy checkout tag cũ.

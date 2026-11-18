# Bản đồ mã nguồn — gói tổng hợp v4.23.69 (18/11/2026)

| Thành phần | Nhánh độc lập | HEAD xác minh | Vị trí trong `main` |
| --- | --- | --- | --- |
| Electron Desktop v4.23.68 | `build-sources/electron-desktop` | `6ea66b51bd99e025db015dabfe0dbc44a1182565` | `renderer/`, `src/`, `scripts/`, `tests/`, `package.json` |
| Rust Lab v23.8.30 | `experiment/rust-tauri-v2` | `bfd03e86c64355c243974a9a91f12a44220af61c` | `rust-lab/` (Git-tree nguyên bản) |
| Web Online | `web/online` | `713509deab7bb4a7851f4db416949f67c7fb9f9f` | `web/` (website root và `web-online/` trừ file cache `.pyc`) |
| Main trước khi cập nhật | `main` | `d275883b825bb99daa3384bc790809aba146cc8e` | Lịch sử repo được giữ nguyên |

**Cơ chế đồng bộ:** Git blob/tree hashes từ đúng HEAD của ba nhánh; không force-push, không thay các nhánh nguồn. Mã nguồn `main` bao gồm Electron bản ổn định đã cập nhật UI/legal, Rust Beta và Web Online. Các bộ cài đã xác minh lấy từ release gốc `v4.23.68` (Electron) và `rust-lab/v23.8.30` (Rust).

**Phân biệt:** Bộ cài Electron là binary v4.23.68 đã phát hành, không tự nhận bao gồm mọi commit legal mới của nhánh Electron; snapshot nguồn trong main có các thay đổi mới được thêm vào sau build đó.

**Tính bất biến:** `v4.23.68`, `rust-lab/v23.8.30`, các tag Rust cũ và release cũ đều giữ nguyên. `v4.23.69` là gói phát hành mới.

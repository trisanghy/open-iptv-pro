# Mã nguồn và phiên bản phát hành v4.23.70

| Thành phần | Nguồn gốc | Phiên bản | Vị trí trong gói nguồn |
|---|---|---|---|
| Electron | `build-sources/electron-desktop`, commit `63058b8811335eb336a58772721649c89ec41b71` | **4.23.70** | `renderer/`, `src/`, `tests/`, `scripts/`, `package.json` |
| Rust Lab | tag bất biến `rust-lab/v23.8.30` | **23.8.30 Beta** | `rust-lab/` |
| Web | nhánh `web/online`, snapshot mới nhất khi chuẩn bị Release | Mã Web mới nhất tại commit trong cây Git | `web/` |
| README, hướng dẫn, cảnh báo | `main` tại tag `v4.23.70` | Tài liệu đồng bộ | `README.md`, `CHANGELOG.md`, `RELEASE_NOTES_V4_23_70.md`, `COPYRIGHT_NOTICE_V4_23_70.md`, `docs/` |

**Đóng gói:** Electron Mac ARM64/Intel và Windows x64 được **build từ mã v4.23.70 đã nạp hộp xác nhận quyền sử dụng** và kiểm tra file trong ASAR của ứng dụng đã build. Không được tái sử dụng bốn installer cũ của v4.23.68/v4.23.69. Rust Lab v23.8.30 được giữ nguyên đúng bản đã có tính năng xác nhận, kiểm tra bảng SHA-256 của Release gốc. Web là snapshot chứa cảnh báo phù hợp với trang đang phát hành.

**Toàn vẹn:** mọi asset đều có SHA-256 trong `SHA256SUMS.txt`. ZIP nguồn đầy đủ chứa cả ba codebase cùng tài liệu, trong đó có cảnh báo và các bài kiểm thử. Lịch sử tag/Release cũ không bị force-update hay xóa. Khi cần phân biệt binary đã được xác minh hộp cảnh báo, **chọn Electron v4.23.70** trong Release mới.

**Nguồn nội dung:** Các playlist, stream và kênh do người dùng nhập/chọn từ bên thứ ba. Smart Discovery không tự xác minh giấy phép. [Thông báo bản quyền](../COPYRIGHT_NOTICE_V4_23_70.md).

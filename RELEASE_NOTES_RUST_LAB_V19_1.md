# Open IPTV Pro Rust Lab v19.1 — Compact two-row TV controls

> Phiên bản thử nghiệm Tauri 2 + Rust, nhánh `experiment/rust-tauri-v2`. Không phải bản Electron chính và không thay đổi `main`.

## Giao diện và tính năng

- Khôi phục **bố cục chính xác theo hai hàng**: hàng trên gồm thông tin kênh, bốn nút điều khiển trước/phát/dừng/sau và Cast/AirPlay, PiP, toàn màn hình.
- Hàng dưới hiển thị **EPG hiện tại + chương trình tiếp theo** (tên và thời gian thực từ XMLTV của từng kênh), đồng thời giữ **dropdown Khung hình** và dropdown chọn Link phát chính/dự phòng, nút Yêu thích.
- **Không dùng JavaScript để chuyển vị trí nút** sau khi ứng dụng chạy. Các nút giữ nguyên ID và logic xử lý gốc.
- Đưa Âm lượng và Chụp ảnh vào Công cụ nhanh; các chức năng này vẫn truy cập được.
- Giữ tỷ lệ khung video theo metadata của nguồn (16:9 mặc định), tab mở danh sách kênh rộng 15 px, failover, DVR, EPG và dữ liệu riêng của Rust Lab.

## Tải và build

GitHub Actions được cấu hình để build và gắn vào **prerelease** `rust-lab/v19.1` khi các job thành công:

- `OpenIPTVPro-RustLab-v19.1-mac-universal.dmg` — Intel + Apple Silicon, đi kèm FFmpeg Universal.
- `OpenIPTVPro-RustLab-v19.1-Windows-Setup-x64.exe` — Windows Installer.
- `OpenIPTVPro-RustLab-v19.1-Windows-Portable-x64.zip` — Portable folder với FFmpeg.
- `OpenIPTVPro-RustLab-v19.1-Source.zip` — ZIP mã nguồn đúng tag.
- `SHA256SUMS.txt` — kiểm tra SHA-256 các file phát hành.

Nếu bất kỳ platform nào build lỗi, release **không được công bố**; kiểm tra [GitHub Actions](https://github.com/trisanghy/open-iptv-pro/actions) để xem log.

Build lại trên Mac bằng một dòng:
```bash
curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash
```

**Lưu ý:** Các installer không ký/notarize, có thể bị macOS Gatekeeper hoặc Windows SmartScreen cảnh báo. Tauri/Rust Lab chưa hỗ trợ mọi codec và Cast đầy đủ như Electron. Bản v19 gốc vẫn lưu dưới tag `rust-lab/v19`, không ghi đè.

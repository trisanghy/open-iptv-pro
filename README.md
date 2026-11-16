# Open IPTV Pro · Rust Lab

**Phiên bản nguồn: `4.23.17-tauri.19` · Nhánh thử nghiệm: `experiment/rust-tauri-v2`**

> Đây là phiên bản thử nghiệm chuyển ứng dụng Open IPTV Pro từ Electron sang **Tauri 2 + Rust** trên Windows/macOS. Nhánh này độc lập với `main`; không thay thế bản Electron và không tự xóa/chuyển dữ liệu của bản chính. Một số tính năng chưa tương đương hoặc chưa được kiểm chứng trên thiết bị thực.

## Giới thiệu

Open IPTV Pro Rust Lab là trình phát và quản lý danh sách truyền hình IPTV trên máy tính, dùng giao diện HTML/CSS/JavaScript và backend Rust. Dự án hướng tới ứng dụng gọn, điều khiển kênh linh hoạt, quản lý nhiều nguồn M3U và hỗ trợ lịch phát sóng.

### Điểm nổi bật của mã nguồn thử nghiệm

- **Nguồn & thư viện:** nhập danh sách M3U (URL/tệp), nhóm kênh, thư mục và yêu thích; kéo thả thay đổi thứ tự, hỗ trợ chọn nhiều kênh bằng Shift; sidebar và danh sách kênh có thể thu gọn độc lập.
- **Phát video:** hỗ trợ luồng HLS và một phần DASH qua WebView, chọn thủ công link chính/link dự phòng, xử lý phát lại khi chuyển kênh A → B → A và cơ chế thử nguồn dự phòng.
- **Khung hình:** mặc định 16:9 khi chờ nguồn; tự đổi tỷ lệ khung theo `videoWidth`/`videoHeight` sau khi có metadata, gồm 4:3 hoặc video dọc. Tùy chọn vừa khung/lấp đầy tiếp tục hoạt động độc lập.
- **Lịch & công cụ:** XMLTV/EPG, hiển thị chương trình hiện tại; khung EPG, chụp ảnh, Timeshift và hẹn ghi hình dựa trên FFmpeg (các chức năng phụ thuộc nguồn, codec và môi trường thực tế).
- **Giao diện:** nhiều chủ đề, danh sách kênh co giãn, trình phát có âm lượng, PiP, toàn màn hình và tùy chọn khung hình. Cast/AirPlay có giới hạn riêng của nhánh thử nghiệm.

## Thay đổi quan trọng trong v19

**v19 khôi phục thanh điều khiển ổn định trước v16**, sau khi bố cục hai hàng của v16–v18 gây lỗi hiển thị:

1. Hàng thông tin: tên kênh, **Link phát** và nút **Yêu thích**.
2. Hàng điều khiển: Trước / Phát-Tạm dừng / Dừng / Sau, **âm lượng**, chụp ảnh, **Khung hình**, Cast/AirPlay, PiP và toàn màn hình.
3. EPG, Tua lại và hẹn ghi hình quay lại các khung riêng thay vì bị trộn vào thanh phát.
4. Giữ cải tiến **v17** (khung video tự điều chỉnh theo tỷ lệ nguồn, mặc định 16:9) và **v18** (tab mở Danh sách kênh 15 px × 40 px ở cạnh sidebar).

Chi tiết: [Release notes v19](RELEASE_NOTES_RUST_LAB_V19.md) · [Changelog v19](CHANGELOG_RUSTLAB_V19.md).

## Build macOS — một lệnh, không cần tải source trước

Dán vào Terminal trên Mac:

```bash
curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash
```

Script hiện tại tự động:

1. Tải **một ZIP duy nhất** từ nhánh `experiment/rust-tauri-v2` trên GitHub; kiểm tra `package.json` đúng `4.23.17-tauri.19` để không build nhầm.
2. Kiểm tra/cài các công cụ còn thiếu khi có thể (Xcode Command Line Tools, Homebrew, Node.js, Rust). Một số bước cài đặt có thể cần quyền của người dùng hoặc yêu cầu chạy lại sau khi macOS cài xong công cụ.
3. Cài dependency, build ứng dụng Tauri thành DMG; bỏ qua các lượt kiểm thử dài trong quy trình build nhanh.
4. Xóa thư mục build tạm và giữ **DMG + ZIP mã nguồn đúng bản v19** tại `~/Downloads/OpenIPTVPro_RustLab_v19_Build/` khi build thành công.

**Lưu ý:** Lệnh `curl | bash` thực thi script từ GitHub. Có thể đọc trước script tại [đây](scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh). DMG thử nghiệm chưa được ký/notarize; macOS Gatekeeper có thể hiển thị cảnh báo.

### Windows

Đọc [hướng dẫn Tauri/Rust](README_TAURI_RUST_V42317.md) và `BUILD_WINDOWS_TAURI.ps1`. Windows cần Microsoft C++ Build Tools, Windows SDK, WebView2 và Rust; việc build Windows **không nằm trong lệnh Mac bên trên**.

## Kiến trúc & dữ liệu

- `renderer/`: giao diện JS/CSS/HTML, bộ điều khiển IPTV, chọn link và tỷ lệ khung hình.
- `src-tauri/`: ứng dụng Tauri 2, Rust backend, proxy luồng, FFmpeg, tác vụ dữ liệu.
- `tests/`: kiểm thử hồi quy cầu nối Tauri, phát lại kênh, dropdown link, thu danh sách kênh và bố cục.
- `.github/workflows/`: các workflow thử nghiệm dành cho nhánh Rust Lab, không tự phát hành vào `main`.

ID ứng dụng thử nghiệm: `org.openiptvpro.experiments.rustlab`. Để chuyển dữ liệu từ Electron, nên xuất `.iptvbackup` từ ứng dụng gốc rồi nhập vào Rust Lab; giữ file backup ban đầu.

## Kiểm thử & giới hạn

```bash
npm install
npm run test:quick
npm test
```

Ở lần khôi phục v19, bộ kiểm thử JavaScript được báo cáo đạt **30/30 kiểm thử nhanh** và **96/96 kiểm thử chính**. Đây **không phải** xác nhận build DMG/EXE, phát tất cả luồng IPTV, ghi DVR hoặc Cast thành công trên phần cứng thực.

Giới hạn đã biết của nhánh thử nghiệm: chưa hoàn thiện tương thích DASH phức tạp, chưa chuyển đầy đủ Google Cast/discovery sang Rust, AirPlay còn hạn chế, DRM/codec tùy WebView; tự động cập nhật tắt để không lẫn với Electron. Xem thêm [tài liệu kỹ thuật Tauri/Rust](README_TAURI_RUST_V42317.md).

---

**Chính sách nhánh:** chỉ làm việc trên `experiment/rust-tauri-v2`; không tự chỉnh sửa `main`, không tự thay thế bản Electron ổn định.

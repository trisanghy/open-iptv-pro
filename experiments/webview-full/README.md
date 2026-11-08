# Open IPTV Pro v4.19 — Native WebView FULL (source branch)

Đây là nhánh chuyển đổi từ **source Open IPTV Pro v4.19 gốc do người dùng cung cấp**, không phải prototype UI rút gọn.

## Giữ lại chức năng

- Toàn bộ `renderer/` v4.19 nguyên bản: TV / Favorites / EPG / MultiView 4 kênh / Snapshot hàng loạt / Folders / Sources / Health & Failover / Smart Doctor / Collector / Profiles & parental lock / Themes / Settings và 8 ngôn ngữ.
- Toàn bộ module Node backend gốc trong `backend/`: HTTP/HLS media proxy, Stream Checker, Timeshift 5 phút (FFmpeg), Snapshot bằng FFmpeg, EPG, GitHub public playlist discovery và update logic.
- Tách **Chromium/Electron runtime**, thay bằng Tauri 2 / WKWebView (Mac) / WebView2 (Windows).
- Đóng gói **Node.js runtime chính thức đã xác minh SHA256** cùng **FFmpeg + FFprobe** vào installer, không yêu cầu cài 3 chương trình này trên máy dùng app. Đây là lựa chọn đảm bảo giữ backend gốc, không phải bản cắt chức năng.
- Đọc file M3U và lưu xuất M3U qua hộp thoại native. Thao tác trong ứng dụng giữ tên API `window.streamleaf` như bản gốc.

## Build DMG trên Mac

1. Giải nén ZIP này trong Downloads.
2. Mở Terminal, chạy `bash ~/Downloads/Open_IPTV_Pro_v4_19_WebView_FULL_Source/BUILD_MAC.command` (đổi tên thư mục nếu đã đổi).
3. Chờ hoàn thành trên Mac, lấy DMG trong `~/Downloads/OpenIPTV_WebView_FULL_DMG/`.

Script tự cài Node từ Homebrew **nếu có Homebrew**, Rustup profile minimal nếu thiếu, giữ nguyên FFmpeg/FFprobe. Xcode Command Line Tools cần Apple cho phép cài. Phải có **ít nhất 10 GB trống**. Log `~/Downloads/OpenIPTV_WebView_FULL_build.log`.

## Build EXE trên Windows

Dùng PowerShell trong thư mục giải nén: `powershell -ExecutionPolicy Bypass -File .\BUILD_WINDOWS.ps1`.

Máy build cần Visual Studio C++ Build Tools. Script kiểm tra Node, Rust, tự cài khi có thể, sau đó xuất EXE NSIS.

Xem thêm `CHECKLIST_PARITY.md` để phân biệt chức năng giữ nguyên ở mã nguồn và chức năng đã chạy thử.

## Kiểm tra

`npm run test:original` — 62 bài test gốc, không cần Electron GUI.  
`npm run test:bridge` — đối chiếu API Electron và WebView.  
Với máy đã cài dependency, `npm run dev` để thử WebView trên máy build.

## Giới hạn xác minh hiện tại

**Chưa có DMG/EXE được biên dịch và chạy thử trên Mac/Windows** trong phiên này, vì môi trường build hiện tại không có macOS SDK/Rust. Các chức năng đều được giữ lại ở mức source, API map, chưa có chứng nhận tương đương hành vi ở runtime native. Đặc biệt:

- Native **auto-install update** của `electron-updater` không thể chuyển nguyên xi sang Tauri. Trong nhánh này chỉ kiểm tra/tải có xác minh SHA256 và mở **bộ cài WebView** thủ công, tránh tải nhầm gói Electron; cài tự động cần ký app và Tauri updater.
- Dữ liệu localStorage từ Electron **không tự chuyển** sang origin WebView mới. Không gỡ bản cũ. Các chức năng và cấu hình có thể tái thiết lập trên nhánh thử.
- DRM/codec phụ thuộc WebKit trên Mac và WebView2 Windows. FFmpeg tích hợp dùng cho Timeshift/Snapshot, không có nghĩa là tự động chuyển mọi codec sang video tag.
- App chưa ký Apple Developer ID / notarize. Mac có thể hiện Gatekeeper.
- Tên branch gợi ý: `experiment/webview-v419-full-ffmpeg`.

## Security / licensing

Backend binds to 127.0.0.1 port ngẫu nhiên, RPC dùng secret ngẫu nhiên và xác minh Origin. Ghi nhớ về bản quyền Node.js, FFmpeg/FFprobe, hls.js và các codec khi phân phối.

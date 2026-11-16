# Open IPTV Pro v4.23.17 — Tauri 2 + Rust Lab

## 0. Quan trọng

- Mã nguồn gốc: `OpenIPTVPro_FULL_v4.23.17_Settings_DASH_Sidebar_Replay_FIX(1).zip`.
- Nhánh thí nghiệm: `experiment/rust-tauri-v2`. **Không thay đổi `main`**.
- Tên phần mềm: **Open IPTV Pro Rust Lab**.
- app ID riêng: `org.openiptvpro.experiments.rustlab`.
- Thư mục dữ liệu/playlist và bộ cài tách khỏi bản Electron chính. Không tự động nhập/xóa dữ liệu phiên bản chính.
- Bộ giao diện HTML/CSS/JS và 10 style hiện hữu vẫn được sử dụng; `src-tauri` là backend Rust thay cho Electron IPC.
- Đây là **bản chuyển đổi thử nghiệm có chức năng còn thiếu**, chưa phải bản Rust tương đương 100% Electron v4.23.17.

## 1. Build Windows 10/11, x64 (khuyến nghị với i5 gen 10 / RAM 24GB)

Yêu cầu trước: Node.js 22 LTS hoặc tương đương; Rust stable 1.90+ qua https://rustup.rs;
**Microsoft Visual Studio Build Tools** với workload **Desktop development with C++** và Windows 10/11 SDK;
Microsoft Edge **WebView2 Runtime**. Tham khảo https://v2.tauri.app/start/prerequisites/ .

Sau khi giải nén ZIP thành thư mục dự án, mở **PowerShell** tại thư mục đó:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\BUILD_WINDOWS_TAURI.ps1
```

Hoặc nhấp đúp `BUILD_WINDOWS_TAURI.bat`.

Script sẽ chạy lần lượt: `npm install`, kiểm thử shim, chép HLS.js/DASH.js + FFmpeg đúng Windows
vào thư mục đóng gói, `cargo test`, rồi `tauri build --bundles nsis`.

Đầu ra nếu **build thành công**:

```
src-tauri/target/release/bundle/nsis/*.exe
```

Chạy thử không đóng gói: `npm install; npm run dev`.

## 2. Build macOS (Intel hoặc Apple Silicon)

Cần Xcode Command Line Tools (`xcode-select --install`), Node.js, Rust stable 1.90+ và mạng
để cài dependencies lần đầu. Mở Terminal ở thư mục đã giải nén:

```bash
bash BUILD_MAC_TAURI.command
```

Đầu ra nếu build thành công:

```
src-tauri/target/release/bundle/dmg/*.dmg
```

Tạo `.dmg` unsigned: Gatekeeper có thể yêu cầu xác nhận mở ứng dụng.
Không dùng bản `BUILD_MAC`/`BUILD_WINDOWS` Electron cũ — chúng chỉ còn trong `docs/` làm tham khảo.

## 3. Trạng thái tính năng

| Hạng mục | Trạng thái của nhánh Tauri/Rust |
|---|---|
| UI, bộ theme 10 kiểu, cài đặt, hồ sơ, yêu thích, kênh/thư mục | Reuse giao diện JS gốc; chưa test WebView thật |
| Đọc M3U file/URL, xuất M3U | Rust native; giới hạn tối đa 25MB |
| Đọc XMLTV qua HTTPS, nhập XML/GZ | Rust native; giới hạn 12MB gzip / 35MB XML |
| Proxy HTTP, HLS playlist/segment, Range cho MP4/TS | Rust loopback, token bí mật, streaming không buffer toàn bộ |
| Kiểm tra kênh | Rust, **bằng chứng đơn giản hơn** cơ chế kiểm tra HLS segment sâu của Electron; giữ kết luận thận trọng |
| Smart Discovery quốc gia/danh mục/ngôn ngữ | Rust qua catalog công khai |
| GitHub repo collector M3U | Rust qua GitHub API public |
| FFmpeg snapshot | Rust gọi FFmpeg đi kèm sau build |
| Timeshift 5/10/15/30 phút | Rust gọi FFmpeg, cần kiểm thử video thực tế |
| DVR hẹn ghi 1 kênh MP4 | Scheduler Rust, cần kiểm thử lịch ghi / codec / sleep-resume |
| Backup/Restore `.iptvbackup` | Rust, dùng cùng dạng JSON với Electron, nhập lịch DVR theo cấu trúc version=1 |
| HLS.js và dash.js | Copy thành file local khi build; không phụ thuộc CDN |
| DASH/MPD | Phát manifest đơn giản; **MPD dùng SegmentTemplate/đường dẫn tương đối chưa được chuyển đầy đủ** |
| Google Cast, discovery, LAN relay | **Chưa chuyển sang Rust** (trả lỗi minh bạch) |
| AirPlay | Chỉ mở URL trên Safari (macOS); chưa quét TV AirPlay |
| Notification / reminder desktop | **Chưa triển khai** (trả false) |
| Tự động cập nhật | **Chủ động tắt** để không tải nhầm release Electron vào Rust Lab |
| Full native GPU decode/MultiView 4 nguồn | Phụ thuộc WebView2/WKWebView, chưa được benchmark |

Các giao diện hiện hữu được giữ nguyên JS/CSS; một số chức năng như WebView video, DRM, codec đặc biệt
khác với Chromium của Electron. Không thể tuyên bố tương đương tính năng khi chưa test.

## 4. Kiến trúc

```
renderer/             HTML/CSS/JS kế thừa v4.23.17, HLS.js, dash.js
renderer/tauri-bridge.js   chuyển window.streamleaf.* -> Tauri invoke('bridge')
src-tauri/src/bridge.rs    45 mã lệnh IPC và các xử lý Rust
src-tauri/src/stream.rs    localhost proxy /stream /snapshot /buffer
src-tauri/src/smart.rs     khám phá catalog / repository
src-tauri/src/recordings.rs  FFmpeg rolling HLS, DVR
src-tauri/src/backup.rs    sao lưu / khôi phục theo JSON Electron
src/                  JS backend Electron cũ chỉ giữ để tham khảo / đối chiếu
```

Nguồn Rust dùng Tauri 2, reqwest, Tokio, axum. Tauri dùng WebView2 trên Windows, WKWebView trên macOS,
không đóng gói Electron/Chromium riêng. FFmpeg binary tải theo hệ điều hành nhờ `ffmpeg-static`
trong `npm install` và được copy vào Tauri resources (lưu ý nghĩa vụ giấy phép FFmpeg).

## 5. Kiểm thử đã thực hiện và chưa thực hiện

**Đã thực hiện trong môi trường soạn mã:**
- `npm test` (bộ JS chọn lọc phù hợp nhánh chuyển đổi).
- `node scripts/audit-tauri-bridge.cjs`: kiểm soát 46 preload API được map và không thiếu route tên gọi.
- JSON config hợp lệ, các đường dẫn thư viện script được chuyển vào `renderer/vendor`.
- Kiểm tra phân lập identifier, không có workflow publish release Electron.

**Chưa thể thực hiện tại đây:**
- `cargo test`, `cargo check`, compile Tauri, tạo EXE/DMG: không có Rust/Cargo và registry mạng bên trong container.
- Khởi chạy Tauri WebView2/WKWebView thực tế.
- E2E player trên luồng IPTV thực, kiểm tra DRM/codec, ghi DVR, Cast; Chromium sandbox trong môi trường kiểm thử từ chối truy cập localhost/file.

`npm run test:legacy` chạy bộ test cũ của Electron; một số bài kiểm tra các config electron-builder
sẽ fail **có chủ đích** trên nhánh Tauri, vì package không còn electron-builder.

## 6. Chạy CI trên GitHub sau khi đẩy nhánh

`.github/workflows/rust-tauri-lab.yml` chỉ trigger trên `experiment/rust-tauri-v2`, kiểm thử +
build unsigned Windows/macOS, upload artifact mà **không tạo release, không cập nhật main**.

## 7. Cấu hình dữ liệu riêng

Để chuyển dữ liệu từ bản Electron chính: vào Electron -> Cài đặt -> Backup -> xuất file `.iptvbackup`.
Sau đó mở bản Tauri Lab -> Cài đặt -> Backup/Restore -> nhập file đó. Hãy giữ bản backup gốc an toàn.
Không copy trực tiếp database thư mục app cũ và không xoá phiên bản Electron chính.

## 8. Nếu muốn tạo đúng Git branch từ repository chính mà vẫn không sửa main

Các script sau **clone repository vào thư mục mới** và tạo local branch `experiment/rust-tauri-v2`,
copy bộ mã nguồn thử nghiệm vào clone đó, **không commit, không push**:

- Windows: `powershell -NoProfile -ExecutionPolicy Bypass -File .\CREATE_GIT_EXPERIMENT_WINDOWS.ps1`
- macOS: `bash CREATE_GIT_EXPERIMENT_MAC.command`

Bạn có thể xem `git status` và quyết định commit/push riêng. Không dùng force-push;
không chạy script trên thư mục nguồn Electron đang phát triển.

## v8 — Folder/channel organizer

Xem `README_CHANNEL_ORGANIZER_V8.md` và `CHANGELOG_RUSTLAB_V8.md`.

UI v8: header trên đã bỏ, sidebar có nút thu gọn 72px; xem `README_CHANNEL_ORGANIZER_V8.md`.


- v15: Thu nhỏ nút mở lại Danh sách kênh khi panel đã thu gọn, hiển thị thành 1 icon nổi nhỏ ở góc trên trái, bỏ thanh rộng phía trên video.

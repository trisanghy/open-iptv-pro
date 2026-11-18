# Open IPTV Pro v4.23.68 — Electron Desktop, Web Online, Rust Lab

**Tổng hợp phát hành ngày 18/11/2026.** main chứa Electron 4.23.68 ở gốc, bản sao đầy đủ của Rust Lab 23.8.26 (Beta) tại rust-lab/ và Web Online tại web/. Các nhánh phát triển gốc và Release cũ không bị xóa hoặc force-update.

| Phiên bản | Nền tảng | Liên kết |
| --- | --- | --- |
| Electron Desktop 4.23.68 — bản chính | macOS ARM64 / Intel, Windows x64 | [Release và installer](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.68) |
| Rust Lab 23.8.26 — Beta độc lập | macOS Universal, Windows x64 | [Release Rust Lab](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.26) · [mã nguồn tại main](rust-lab/) |
| Web Online | Trình duyệt | [Mở trang Web](https://trisanghy.github.io/open-iptv-pro/) · [mã nguồn Web tại main](web/) |

**Chỉ coi bộ cài là đã phát hành khi Release đã xuất hiện đủ file và SHA-256 sau khi GitHub Actions hoàn thành.** Rust Lab vẫn là Beta, không cài đè lên ứng dụng Electron.

Tài liệu: [Nhật ký thay đổi](RELEASE_NOTES_V4_23_68.md) · [Tính năng và giới hạn](docs/COMPARE_EDITIONS_V4_23_68.md) · [Hướng dẫn cài đặt](docs/INSTALL_V4_23_68.md) · [Bản đồ nguồn và commit](docs/RELEASE_SOURCE_MAP_V4_23_68.md).

**Electron nổi bật:** M3U, EPG/XMLTV, link dự phòng, Timeshift/DVR, FFmpeg, snapshot, MultiView, Cast/AirPlay theo khả năng thiết bị; CC/Live Translate/TTS offline, lưu ba công tắc AI, CC nhiều dòng trong fullscreen/PiP khi cho phép; tạm dừng giữ hình, dừng hẳn ngắt stream, PiP tự đóng khi quay về video; 11 kiểu giao diện và panel Kênh hiện tại có thể ẩn/hiện.

**Rust Lab mới:** v23.8.26 cải thiện responsive thực tế trên cửa sổ Mac nhỏ, giữ Công cụ nhanh luôn mở và ba hộp chọn 1–32; vẫn là Tauri 2 thử nghiệm.

**Web:** Bản đang triển khai từ nhánh web/online, gồm trình phát web, EPG, Cloud Sync Supabase khi cấu hình và điều khiển âm lượng/autoplay. Trình duyệt có giới hạn riêng về CORS, codec, autoplay.

**Lệnh build Mac Electron** (một file .app, không cần tải source):

    bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'

**Lệnh build Mac Rust Lab** (một file .app, không cần tải source):

    bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'

---

## Tài liệu phiên bản v4.23.67 và trước đó

# Open IPTV Pro — v4.23.67

**Trình phát IPTV mã nguồn mở cho macOS, Windows và Web.** Chọn đúng phiên bản tùy thiết bị; Rust Lab là nhánh thử nghiệm độc lập.

**[TẢI DESKTOP v4.23.67](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67) · [MỞ WEB ONLINE](https://trisanghy.github.io/open-iptv-pro/) · [RUST/TAURI LAB v23.8.15](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15)**

**Latest stable:** Electron Desktop v4.23.67 (`main`) · **Web:** GitHub Pages (`web/online`) · **Rust Lab:** v23.8.15 (Beta, Mac Apple Silicon / Intel + Windows x64).

### Rust Lab được cập nhật trong Stable Release v4.23.67

**Gói Rust/Tauri đính kèm hiện là v23.8.15, thay toàn bộ bộ cài Rust Lab v23.8.2 cũ trong Release chính.** Đây vẫn là bản **Beta độc lập**; ứng dụng Electron Stable v4.23.67, bộ cài macOS/Windows Electron và mã nguồn Web không thay đổi.

Rust Lab v23.8.15 khôi phục PiP WebView gốc, cải thiện đồng bộ Live Caption/Translate/TTS với trạng thái video, giảm trễ giọng đọc và thêm bảng CC tùy chỉnh phông chữ, vị trí, màu và nền. MLX/Argos và các tính năng AI offline được giữ lại. **Đã có DMG macOS Apple Silicon (ARM64) và Mac Intel (x64) được build native, kiểm tra ứng dụng/FFmpeg trực tiếp trong DMG, cùng bản Windows x64 và ZIP mã nguồn.**

Đã đối chiếu checksum gốc; `SHA256SUMS.txt` của Stable Release sẽ được cập nhật theo các file Rust mới. Tag `rust-lab/v23.4` độc lập vẫn được bảo tồn trong lịch sử GitHub và có thể tải lại khi cần.

## Rust Lab mới nhất trong Release Stable — v23.8.15

**Chỉ thay Rust Lab v23.8.2 bằng v23.8.15** (hai DMG native Mac, Windows Setup/Portable và ZIP mã nguồn Rust). Bộ cài Electron v4.23.67, mã nguồn Electron, bản Web Online và các tag phát hành lịch sử được giữ nguyên.

**Các thay đổi nổi bật của Rust Lab v23.8.15 so với v23.8.2:**

- **PiP:** khôi phục Picture-in-Picture gốc từ WebView, không mở Tauri Mini Player hay khởi động lại video; giữ nguyên ba chế độ PiP tự động và tùy chọn đã lưu.
- **Live Caption / Translate / TTS:** ba công tắc độc lập; tắt riêng Caption không tự bật lại trong lúc phiên dịch và giọng đọc vẫn hoạt động.
- **Đồng bộ phát:** khi video dừng, kết thúc, tua hoặc đứng tải lâu, xóa phụ đề cũ và hủy Whisper/TTS đang đọc; khi phát lại tạo phiên mới, không tiếp tục đọc câu cũ.
- **TTS tiếng Việt ít trễ hơn:** nạp sẵn VieNeu, chia đoạn đầu ngắn, chuẩn bị WAV tiếp theo trong lúc đang phát; ưu tiên lời mới thay vì kéo dài hàng đợi cũ. Tốc độ thực tế phụ thuộc máy và mô hình.
- **Phụ đề trên video:** bảng CC có bật/tắt, chỉ gốc/chỉ dịch/cả hai, vị trí, kích thước, sáu font hệ thống, màu/viền/nền/độ trong suốt; lưu lựa chọn giữa các lần mở.
- **MLX/Argos:** tiếp tục hỗ trợ các mô hình dịch offline Apple Silicon, Whisper và giọng đọc Piper/VieNeu; vẫn là bản Rust/Tauri Beta độc lập.

**Mã nguồn Rust:** tag bất biến [`rust-lab/v23.8.15`](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15). **File tải và SHA-256:** nằm trong [Stable v4.23.67](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67). File Rust không được dùng để cài đè ứng dụng Electron. Bộ cài thử nghiệm có thể chưa ký số/notarize.

## 1. Chọn nền tảng

| Phiên bản | Dành cho | Dùng ngay / tải về |
| --- | --- | --- |
| **Desktop Electron v4.23.67 — bản chính** | Mac Apple Silicon, Mac Intel, Windows x64 | [Trang Release & bộ cài](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.67) |
| **Web Online — mở trong trình duyệt** | Máy tính/điện thoại với trình duyệt tương thích | [Mở Web](https://trisanghy.github.io/open-iptv-pro/) · [Hướng dẫn Web](https://trisanghy.github.io/open-iptv-pro/huong-dan.html) |
| **Rust/Tauri Lab v23.8.15 — thử nghiệm** | Mac Apple Silicon, Mac Intel, Windows x64 (Setup/Portable), mã nguồn Rust | [Release Rust Lab](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15) · [Nhánh mã nguồn](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2) |

### File cài đặt Desktop — bản chính

| Hệ điều hành | Tải file v4.23.67 |
| --- | --- |
| **Mac Apple Silicon** (M1/M2/M3/M4…) | [Open-IPTV-Pro-4.23.67-mac-arm64.dmg](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/Open-IPTV-Pro-4.23.67-mac-arm64.dmg) |
| **Mac Intel** | [Open-IPTV-Pro-4.23.67-mac-x64.dmg](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/Open-IPTV-Pro-4.23.67-mac-x64.dmg) |
| **Windows x64 — bộ cài** | [Open-IPTV-Pro-Setup-4.23.67-x64.exe](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/Open-IPTV-Pro-Setup-4.23.67-x64.exe) |
| **Windows x64 — Portable** | [Open-IPTV-Pro-4.23.67-x64.exe](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/Open-IPTV-Pro-4.23.67-x64.exe) |
| **Mã nguồn Desktop đúng bản chính** | [OpenIPTVPro_Source_v4.23.67.zip](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro_Source_v4.23.67.zip) |
| **Xác minh mã SHA-256** | [SHA256SUMS.txt](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/SHA256SUMS.txt) |

Trước khi cài: tải từ **GitHub chính thức**, chọn đúng CPU và đối chiếu `SHA256SUMS.txt`. Bộ cài có thể chưa được ký số/notarize nên hệ điều hành có thể hiện cảnh báo. Các mô hình AI tải riêng theo lựa chọn; DMG/EXE không bao gồm các checkpoint AI dung lượng lớn.

### Web Online (bản Web vẫn được duy trì riêng)

- **Mở trực tiếp:** https://trisanghy.github.io/open-iptv-pro/
- **Hướng dẫn:** https://trisanghy.github.io/open-iptv-pro/huong-dan.html
- **Mã nguồn Web:** [nhánh web/online](https://github.com/trisanghy/open-iptv-pro/tree/web/online); việc phát hành Desktop không ghi đè nhánh này.
- Phát HLS/DASH phụ thuộc codec, CORS, HTTPS, DRM và chính sách tự phát âm thanh của trình duyệt. Bản Web **không chạy** Electron IPC, FFmpeg native, Whisper/MLX hoặc TTS offline như bản Desktop.

### Rust/Tauri Lab v23.8.15 (Beta độc lập)

**[Tải Rust Lab v23.8.15](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.15)** — nhánh [experiment/rust-tauri-v2](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2), không thay thế bản Electron.

| Gói Rust Lab v23.8.15 | Đường dẫn |
| --- | --- |
| **Mac Apple Silicon (ARM64)** | [Rust Lab DMG ARM64](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-mac-arm64.dmg) |
| **Mac Intel (x64)** | [Rust Lab DMG Intel](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-mac-x64.dmg) |
| Windows x64 Setup | [OpenIPTVPro-RustLab-v23.8.15-Windows-Setup-x64.exe](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-Windows-Setup-x64.exe) |
| Windows x64 Portable | [OpenIPTVPro-RustLab-v23.8.15-Windows-Portable-x64.zip](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-Windows-Portable-x64.zip) |
| Mã nguồn Rust Lab | [OpenIPTVPro-RustLab-v23.8.15-Source.zip](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.67/OpenIPTVPro-RustLab-v23.8.15-Source.zip) |

**Hai bộ cài Mac Rust Lab v23.8.15 đã được build native riêng trên hai loại máy Mac và xác minh kiến trúc app/FFmpeg bên trong DMG;** file được đính kèm trong Release **v4.23.67 Stable** bên cạnh bản Electron. Rust Lab sử dụng Tauri 2 + Rust, có Whisper/Argos/MLX và TTS ngoại tuyến. PiP dùng cơ chế WebView gốc, Live Caption/Translate/TTS có xử lý pause/seek và CC tùy chỉnh. Một số tính năng vẫn chưa ngang Electron ổn định.

## 2. Desktop: những điểm mới từ v4.23.60 → v4.23.67

- **Phụ đề & giọng dịch:** hàng điều khiển gọn gồm Caption/Translate, nút AI/Công cụ; hàng tiếp theo gồm TTS, ngôn ngữ/giọng, tốc độ và % âm thanh gốc. Tự ngắt dòng khi cửa sổ hẹp.
- **TTS tiếng Việt:** thêm VietVoice (nam/nữ, Bắc/Trung/Nam), F5-TTS Vietnamese mẫu WAV và lời thoại, bên cạnh Piper/VieNeu; mô hình được cài riêng. F5 Vietnamese checkpoint được phân phối dưới giấy phép **CC-BY-NC-4.0 (phi thương mại)**; chỉ dùng giọng mẫu có sự đồng ý.
- **TTS ổn định hơn:** nghe thử có phiên riêng, timeout/hủy được, chuyển đổi mô hình không khiến hàng phụ đề mới bị kẹt; phát tiếp phụ đề mới nhất sau khi nghe thử kết thúc.
- **Dịch AI:** xử lý an toàn khi tiến trình Hy-MT2/MLX thoát mà không có mã lỗi, có thể dùng Argos đã cài làm đường lui khi phù hợp; MLX dành cho Apple Silicon.
- **PiP thông minh:** vào trang khác trong app sẽ chuyển video sang PiP khi có thể; quay lại Xem truyền hình đóng PiP. Có tùy chọn PiP khi thu nhỏ/chuyển ứng dụng; phụ thuộc nền tảng và WebView.
- **FFmpeg + ffprobe:** đi kèm Desktop để các tác vụ phát/giọng đọc tìm được công cụ; không yêu cầu người dùng tự cài ffprobe qua Homebrew.
- **AI gợi ý cấu hình:** RAM, CPU/GPU/MLX và dung lượng ổ đĩa tham khảo theo mô hình; hiển thị dung lượng AI đã tải và cho phép xóa riêng.
- **Chọn phiên bản khi kiểm tra cập nhật:** các bản ổn định/Beta/cũ phù hợp Mac/Windows, có SHA-256. Hạ phiên bản hoặc cài lại phải xác nhận; không tự động downgrade.
- **Giữ toàn bộ IPTV Full:** quản lý nguồn M3U, XMLTV/EPG, thư mục/yêu thích, MultiView, snapshot, kiểm tra sức khỏe/failover/Doctor, Timeshift, DVR, Cast/AirPlay, theme và Backup/Restore.

**[Changelog đầy đủ v4.23.67](RELEASE_NOTES_V4_23_67.md)** · **[So sánh tính năng/các nền tảng](docs/COMPARE_EDITIONS_V4_23_67.md)** · [Lịch sử Desktop v4.23.60](RELEASE_NOTES_V4_23_60.md)

## 3. So sánh ba phiên bản

| Khả năng | Desktop Electron (chính) | Web Online | Rust Lab v23.8.15 (Beta) |
| --- | --- | --- | --- |
| Không cần cài | Không | **Có** | Không |
| M3U, danh sách kênh, EPG | **Có** | Có, tùy nguồn/trình duyệt | Có, đang thử nghiệm |
| PiP / đa màn hình | Có, tùy nền tảng | Phụ thuộc trình duyệt | Đang thử nghiệm |
| FFmpeg, Timeshift, ghi hình native | **Có**, tùy codec/nguồn | Không tương đương | Một phần, cần kiểm thử |
| Whisper/MLX, nhiều giọng TTS offline | **Có**, khi cài mô hình | Không tương đương | Một phần, Argos/Whisper/TTS thử nghiệm |
| Chọn phiên bản và cập nhật | **Có** qua GitHub Release | Mở Web trực tiếp | Tag riêng của Rust Lab |
| Hệ điều hành có file cài đã xác minh | Mac ARM64/Intel, Windows x64 | Trình duyệt | **Mac ARM64/Intel**, Windows x64 (Rust Lab v23.8.15) |

## 4. Sử dụng và build từ mã nguồn

**Sử dụng:** cài Desktop → nhập M3U (file hoặc URL) → chọn kênh. Muốn dùng AI thì mở Cài đặt AI, chỉ tải mô hình cần thiết, bật Caption/Translate rồi bật giọng TTS nếu cần. Trong **Cài đặt → Cập nhật phiên bản**, xem/chọn bản phát hành và tải file đúng kiến trúc đã xác minh.

**Build Mac cá nhân (luôn tải nhánh Electron phát triển, chỉ tạo `.app` và tự mở thư mục Finder):**

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'
```

**Đối với nhà phát triển:** nhánh `main` là bản Desktop đã phát hành; thay đổi Electron tiếp theo thực hiện trên `build-sources/electron-desktop` rồi mới kiểm thử và đưa lên `main`. Web và Rust/Tauri giữ nhánh riêng. Chạy `npm install`, `npm test`, `npm start` với Node.js 22+.

**Kiểm thử trước khi công bố:** 394 bài đạt, 0 lỗi, 5 bài được bỏ qua trên nhánh Electron; đã build xác minh Mac `.app` và các installer tại Electron Beta v4.23.67. Release chính chỉ dùng bộ cài được so khớp checksum với bản đã kiểm thử.

**Giới hạn:** độ chính xác phụ đề/dịch và TTS phụ thuộc dữ liệu/thiết bị/mô hình; PiP và Cast có thể bị hạn chế bởi OS, nguồn phát, codec, DRM hoặc CORS. File `.iptvbackup` có thể chứa playlist/dữ liệu riêng và không được mã hóa; bảo quản cẩn thận. Chỉ dùng nguồn IPTV được phép.

---

**English:** Open IPTV Pro v4.23.67 is the main Electron Desktop release for macOS and Windows. Web Online remains separate, and Rust/Tauri Lab v23.8.15 is an independent beta with separate Mac Apple Silicon/Intel DMGs, Windows x64 installers and a distinct Rust source ZIP. Download verified installers and checksums in the official stable GitHub Release. Full notes: [v4.23.67](RELEASE_NOTES_V4_23_67.md).

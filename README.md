## Rust Lab v23.8.86 — sửa lỗi CC xổ ra vùng trống khổng lồ

Khi mở **Phụ đề · Dịch · Giọng nói**, layout flex dọc trước đây kế thừa `flex:1 1 920px` của kiểu bố cục ngang cũ. Trình duyệt hiểu 920px là **chiều cao tối thiểu dành cho điều khiển**, nên tạo khoảng trống rất lớn và đẩy toàn bộ công cụ xuống dưới. Phiên bản này đặt lại `flex-basis:auto`, `flex:0 0 auto`, `height:auto` trên các thành phần đã chuyển vào panel CC. Tùy chỉnh CC vẫn có cuộn riêng, tối đa 70vh/570px.

Không thay đổi nội dung điều khiển, native PiP, Whisper 10 giây, Live Caption/Translate/TTS, chức năng video, cài đặt đã lưu hoặc dữ liệu người dùng. Đã bổ sung kiểm thử hồi quy để phát hiện lại lỗi `920px`. [Ghi chú v23.8.86](RELEASE_NOTES_RUST_LAB_V23_8_86.md).

## Rust Lab v23.8.84 — Hoàn tất kiểm thử hồi quy sidebar

Giữ sửa lỗi khoảng trống sidebar từ v23.8.83. Sửa bài test để xác minh nút AI được nạp qua `renderer/app-entry.js` đúng như kiến trúc hiện hành, thay vì tìm file trực tiếp trong HTML. Không thay đổi logic phát video/Whisper/PiP/CC. [Ghi chú](RELEASE_NOTES_RUST_LAB_V23_8_84.md).

## Rust Lab v23.8.83 — Sửa khoảng trống sidebar khi thu gọn

Trong trang Xem truyền hình, khi thu gọn sidebar thành thanh icon, bỏ khoảng đệm trái không cần thiết của vùng nội dung và cho phép danh sách kênh, video tận dụng chiều rộng. Nút **Nâng cao video bằng AI** đã có từ v23.8.80, không thay đổi đường phát; giữ nguyên PiP gốc, Live Caption/Translate/TTS, Whisper 10 giây, bù chuyển động. Thêm kiểm thử hồi quy CSS. [Release notes](RELEASE_NOTES_RUST_LAB_V23_8_83.md).

## Rust Lab v23.8.82 — Whisper 10s, sửa kiểm thử build

Giữ thay đổi mẫu Whisper 10 giây của v23.8.81, cập nhật kiểm thử cũ từng cố định thời lượng 4 giây. Giữ TTS, PiP, Captions và tất cả bản phát hành trước. [Ghi chú v23.8.82](RELEASE_NOTES_RUST_LAB_V23_8_82.md).

## Rust Lab v23.8.81 — Whisper thu âm 10 giây

Đổi mỗi lượt lấy mẫu audio Whisper thành **10 giây**, chuẩn mono 16 kHz WAV, giữ nguyên 4 luồng CPU Whisper (tham số `-t 4`) và logic hủy nhận diện khi Pause/Stop/Ended hoặc đổi kênh. Không thay đổi TTS, PiP, phụ đề, lưu dữ liệu. Có kiểm thử hồi quy và giữ lệnh build Mac một lệnh.

[Release notes](RELEASE_NOTES_RUST_LAB_V23_8_81.md)

## Rust Lab v23.8.80 — sửa nút Nâng cao video không xuất hiện

Khởi tạo nút **Nâng cao video bằng AI** sau khi module **Phụ đề · Dịch · Giọng nói** sẵn sàng; giữ hai nút cạnh nhau, độ cao đồng bộ 32px và panel xổ không có khung/viền ngoài. Khi mở một nhóm, nhóm còn lại tự thu gọn để tiết kiệm diện tích. Thêm kiểm thử hồi quy thứ tự tải bất đồng bộ. Các tính năng video, PiP, CC và TTS không thay đổi. AI upscaling 1080p/2K/4K vẫn chưa có pipeline suy luận thực.

[Release notes v23.8.80](RELEASE_NOTES_RUST_LAB_V23_8_80.md)

## Rust Lab v23.8.79 — kiểm tra AI phần cứng và bảo vệ khung hình

- **Bù chuyển động:** FFmpeg nội suy 60/90/120 FPS khi người dùng bật và áp dụng trên kênh LIVE; đầu ra giới hạn tối đa 1280×720 trước nội suy. Khi WebView rớt nhiều khung hình trong hai chu kỳ giám sát, ứng dụng trở về luồng gốc nếu tùy chọn giảm tải được bật.
- **Kiểm tra AI trên thiết bị:** macOS truy vấn trực tiếp VideoToolbox VTLowLatencySuperResolutionScalerConfiguration.isSupported (macOS 26+ khi khả dụng); không dựa chỉ vào tên GPU.
- **Phân biệt:** VideoToolbox báo hỗ trợ phần cứng không có nghĩa AI Super Resolution đang chạy. Cấu hình AI 1080p/2K/4K được lưu, nhưng chưa nối model inference vào pipeline. Windows DirectML/Core ML/ONNX còn cần backend thực tế và benchmark.
- Không tải model tự động. Giữ nguyên video gốc, native PiP, Caption/Translate/TTS và các release cũ.

[Release notes v23.8.79](RELEASE_NOTES_RUST_LAB_V23_8_79.md)
## Cloud sync v23.8.73 (Tauri) — redesigned native login UI

The account panel now matches the current Tauri Settings theme, offers clear email/OTP fields with responsive widths, accessible focus/caret and a collapsed confirmation-link option. Cloud sync still excludes snapshots, images, video and EPG caches. [Release notes](RELEASE_NOTES_RUST_LAB_V23_8_73.md).


Sign in to the same Supabase account on Web/Electron/Tauri/Mobile. Open Settings → Account & Supabase Sync and select cloud or device data on first pairing; later changes sync with revision checks. Images/video/EPG caches remain local. Supabase email OTP requires Auth email templates configured with a code. See [release notes](RELEASE_NOTES_RUST_LAB_V23_8_68.md).

# Open IPTV Pro · Rust Lab

**Phiên bản nguồn: `4.23.17-tauri.23.8.12` · Nhánh thử nghiệm: `experiment/rust-tauri-v2`**

> Đây là phiên bản thử nghiệm chuyển ứng dụng Open IPTV Pro từ Electron sang **Tauri 2 + Rust** trên Windows/macOS. Nhánh này độc lập với `main`; không thay thế bản Electron và không tự xóa/chuyển dữ liệu của bản chính. Một số tính năng chưa tương đương hoặc chưa được kiểm chứng trên thiết bị thực.


## Rust Lab v23.8.12 · Bản sửa phụ đề và giọng đọc

**Bảng CC:** Nút CC cạnh cài đặt Whisper mở giao diện phụ đề ngay trên video, chọn hiển thị/tắt, gốc/dịch/cả hai, vị trí trên/giữa/dưới, 4 cỡ chữ, 6 font hệ thống có fallback tiếng Trung/Việt, màu chữ, viền, nền và độ đậm nền. Tùy chọn được lưu lại.

**Độc lập ba công tắc:** Live Caption chỉ bật/tắt dòng phụ đề gốc; tắt Caption trong khi Translate/TTS chạy không khởi động lại Whisper hoặc bật lại Caption.

**Bám video:** Pause, ended, seeking, emptied hủy ngay phụ đề và TTS; waiting/stalled kéo dài hơn 1,4 giây hủy nội dung cũ và đợi playing mới nhận diện lại. Đổi nguồn hoặc đổi mô hình làm vô hiệu hóa tác vụ đọc cũ.

**Giảm độ trễ TTS:** giọng VieNeu được prewarm, câu đầu chia khoảng 60 ký tự để đọc nhanh hơn, chuẩn bị WAV tiếp theo khi đang phát âm thanh đoạn trước; câu phụ đề mới được ưu tiên hơn nội dung cũ. Không đảm bảo độ trễ bằng 0 vì tốc độ phụ thuộc AI/hardware.

**Build Mac cá nhân:** script duy nhất vẫn xuất `.app` và mở Finder; GitHub Release của Rust Lab tạo DMG + Source, không ảnh hưởng `main` hay Release Electron.

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


## Lưu phiên bản Rust Lab (từ v19)

Mỗi lần đẩy thay đổi tạo commit mới; phiên bản chính thức có tag bất biến `rust-lab/v19`, `rust-lab/v20`, bản vá `rust-lab/v19.1`, `rust-lab/v19.2`. GitHub Actions chỉ tạo tag mới, không đổi tag cũ. Script build Mac tải ZIP theo tag cố định; nếu đã có bản build cùng tên, tự tạo thư mục `_2` để không ghi đè DMG/ZIP cũ. Xem [quy tắc phiên bản](VERSIONING_RUST_LAB.md).

## Bản vá v19.1 — thanh điều khiển hai hàng theo thiết kế

Khác với bố cục v16 được dựng lại bằng JavaScript di chuyển nút sau khi chạy, **v19.1 đặt các nút trực tiếp trong HTML**, giữ nguyên ID và hàm xử lý cũ:

- **Hàng trên:** tên kênh; 4 nút Trước / Phát-Tạm dừng / Dừng / Sau ở giữa; Cast/AirPlay, PiP và fullscreen bên phải.
- **Hàng dưới:** tên và thời gian của chương trình XMLTV hiện tại và kế tiếp; dropdown Khung hình (Vừa khung/Lấp đầy/...); dropdown Link phát và nút Yêu thích.
- Âm lượng và chụp ảnh chuyển vào **Công cụ nhanh**, không xóa chức năng.
- Video vẫn tự đổi tỷ lệ nguồn (mặc định 16:9); tab mở Danh sách kênh tiếp tục rộng 15 px.

### Tự tạo bộ cài và phát hành bằng GitHub Actions

Workflow riêng `.github/workflows/rust-lab-version-tags.yml` chạy sau mỗi lần đẩy bản mới lên `experiment/rust-tauri-v2`, tạo **tag bất biến** `rust-lab/v19.1`, kiểm thử nhanh và thực hiện:

- **macOS Universal:** đóng gói DMG cho Intel x86_64 + Apple Silicon arm64, bao gồm FFmpeg universal được ghép từ 2 kiến trúc.
- **Windows x64:** đóng gói NSIS Setup và ZIP portable có FFmpeg.
- **Nguồn:** đính kèm ZIP của tag cùng `SHA256SUMS.txt` từ các tệp đã build.
- **Release:** chỉ đăng nếu cả Mac và Windows đều build thành công; đặt **prerelease** và `make_latest: false` để không ảnh hưởng nhãn Latest của Electron chính. Không force-push hay ghi đè tag/bộ cài cũ.

**Lưu ý:** Đây là workflow đã cấu hình, không phải xác nhận hai bộ cài đã build thành công. Kiểm tra tab Actions và Release tag v19.1 để biết trạng thái.

Tải/build Mac một dòng (script tự lấy chính xác ZIP v19.1 từ tag):
```bash
curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash
```

Xem [changelog v19.1](CHANGELOG_RUSTLAB_V19_1.md) và [ghi chú phát hành v19.1](RELEASE_NOTES_RUST_LAB_V19_1.md).


### Bản vá v19.2 — tự động build sửa lỗi CI

Bản v19.2 giữ nguyên hai hàng điều khiển và EPG thực tế của v19.1, chỉ khắc phục bước kiểm tra kiến trúc macOS Universal (lệnh `lipo`) và các bài kiểm thử cũ từng đóng đinh phiên bản v19. Tag mới `rust-lab/v19.2`; không ghi đè tag v19/v19.1. Bộ cài Windows và macOS chỉ được công bố nếu workflow GitHub Actions thực sự build thành công.

## Rust Lab v20 — cập nhật theo Electron v4.23.45

**Nguồn đối chiếu:** ZIP mã nguồn Electron `OpenIPTVPro_Source_v4.23.45.zip` do người dùng cung cấp (các module `live-captions-v42343.js`, `local-tts-v42344.js`, `whisper-auto-v42345.js`, dịch vụ `src/live-caption-service.cjs`, `src/local-ai-autoinstall.cjs`, `src/local-tts-service.cjs` và `src/whisper-autoinstall.cjs`). Phần xử lý native được **viết lại bằng Rust** cho Tauri 2, không dùng IPC Electron hay yêu cầu cài Node ở máy đích.

- **Live Caption / Live Translate (beta):** Whisper.cpp nhận âm thanh luồng IPTV qua FFmpeg và phát sự kiện phụ đề trực tiếp. Translate tạo câu tiếng Anh; phụ đề trong PiP là best-effort.
- **TTS offline đa ngôn ngữ:** Piper đọc câu dịch, Argos dịch offline từ English sang `vi/en/es/fr/de/zh/pt/it/ru/id`; người dùng chọn mức âm lượng tiếng gốc 0–100% khi giọng dịch phát.
- **Cài mô hình một nút:** cài Whisper.cpp + mô hình GGML multilingual và cài uv Python 3.11 riêng, Piper/Argos/giọng đọc. Tải chỉ bắt đầu khi bấm cài, URL nguồn giới hạn HTTPS, xác thực SHA-256 cho Whisper/model và uv, không dùng quyền quản trị.
- **Giữ trình phát:** thanh điều khiển hai hàng v19.2 với EPG, chọn link thủ công, Khung hình, PiP, âm lượng và snapshot. Bảng AI riêng bên dưới hai hàng, không thay đổi các ID và sự kiện phát cũ.
- **Quy trình phát hành:** tag bất biến `rust-lab/v20`. Windows Setup + Portable và ZIP nguồn được phát hành ngay khi Windows build thành công; DMG macOS Universal đính kèm sau nếu job Mac hoàn tất. Không ảnh hưởng `main` hay nhãn Latest của Electron.

### Ranh giới và kiểm chứng

Mã nguồn, tương thích API và kiểm thử JavaScript chỉ chứng minh tính nhất quán ở mức mã nguồn. Cần chạy thử thực tế trên macOS/Windows để xác nhận FFmpeg giải mã audio nguồn, tải mô hình từ các máy chủ phát hành, các CLI Whisper/Argos/Piper có hoạt động trên từng kiến trúc và phụ đề có xuất hiện đúng trong PiP. Thiết lập một mô hình có thể tải hàng trăm MB và cần Internet một lần.

**Chưa đồng bộ hoàn toàn chức năng Electron:** Google Cast/mDNS + LAN relay của Electron và một số chức năng webview/codec chuyên biệt chưa chuyển đầy đủ thành backend Rust; Cast trong Rust Lab vẫn hạn chế. Không quảng cáo tính năng như đã tương đương chỉ vì có nút UI.

**Một lệnh build Mac từ tag v20:**
```bash
curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash
```
Xem [bảng đối chiếu chức năng](ELECTRON_V42345_PARITY_RUSTLAB_V20.md), [changelog v20](CHANGELOG_RUSTLAB_V20.md), [release notes v20](RELEASE_NOTES_RUST_LAB_V20.md).

# Open IPTV Pro Electron v4.23.65 — Ghi chú phát hành đầy đủ

**Loại:** Prerelease · **nhánh:** experiment/electron-v42365-ai-model-hardware-hints · **tag:** electron-v4.23.65. Đây không phải bản stable mới; không sửa main hoặc Rust/Tauri.

## 1. File tải

Trên [GitHub Release v4.23.65](https://github.com/trisanghy/open-iptv-pro/releases/tag/electron-v4.23.65) tải một trong:
- **Open-IPTV-Pro-4.23.65-mac-arm64.dmg** — Apple Silicon.
- **Open-IPTV-Pro-4.23.65-mac-x64.dmg** — Mac Intel.
- **Open-IPTV-Pro-Setup-4.23.65-x64.exe** — Windows x64 Setup.
- **Open-IPTV-Pro-4.23.65-x64.exe** — Windows x64 Portable.
- **OpenIPTVPro_Source_v4.23.65.zip** — mã nguồn đúng bản phát hành.
- **SHA256SUMS.txt** — kiểm tra tính toàn vẹn.

Các file chỉ được công bố khi build/kiểm tra hoàn tất và đã hiện trong Assets.

## 2. VietVoice và F5 — mở rộng giọng đọc tiếng Việt (v4.23.62)
Giữ Piper vi_VN và VieNeu 48 kHz. Thêm VietVoice-TTS có giọng nam/nữ theo vùng Bắc, Trung, Nam; thêm F5-TTS Vietnamese dùng WAV ngắn có lời thoại mẫu và sự đồng ý của người có giọng. Cài model bằng nút Cài mô hình tự động, không buộc người dùng cấu hình Python thủ công. Các bộ TTS chạy local sau khi cài, nhưng hiệu năng phụ thuộc thiết bị; F5 có thể chậm trên CPU. Trọng số F5 tiếng Việt được chọn có giấy phép CC-BY-NC-4.0, chỉ dành cho sử dụng phi thương mại. Không đính kèm file giọng mẫu hay trọng số trong bộ cài.

## 3. PiP khi điều hướng và đa nhiệm (v4.23.63)
Khi từ Xem truyền hình sang các mục khác, thử mở PiP từ cùng video đang phát; trở lại TV thì đóng PiP. Thêm cài đặt độc lập tự PiP khi thu nhỏ hoặc khi app mất tiêu điểm; hai chế độ này mặc định tắt. Không tạo thêm player. PiP vẫn phụ thuộc macOS/Windows, media backend và chính sách tự phát; chỉ phát hiện sự kiện mất tiêu điểm chứ không thể nhận diện mọi trường hợp bị che cửa sổ.

## 4. Sửa thiếu FFprobe của VietVoice (v4.23.64)
Xử lý lỗi synthesize: No such file or directory: ffprobe bằng cách tích hợp FFprobe và FFmpeg đúng kiến trúc, đặt executable bên ngoài app.asar và truyền PATH thích hợp vào Python worker. Giữ lại model đã tải, không yêu cầu cài Homebrew. Có test kiểm tra native FFprobe trong bundle Mac và kiểm tra cú pháp; test nguồn không thay thế thử tổng hợp giọng với hàng GB model trên máy người dùng.

## 5. Gợi ý cấu hình theo model (v4.23.65)
Trong Cài đặt AI → Bộ nhớ AI đã tải, tất cả mô hình Whisper, Argos, Piper, VieNeu, VietVoice, F5, Hy-MT2 và Qwen3 đều có khuyến nghị RAM, CPU/MLX, khoảng đĩa trống và đặc điểm sử dụng. Thông tin OS, kiến trúc và RAM máy dùng để hiển thị cảnh báo phù hợp; không tự cấm cài nếu RAM thấp. File cache, Python runtime và giọng mẫu được ghi rõ không phải model độc lập. Số đo là **ước lượng tham khảo**, không phải cấu hình tối thiểu được nhà phát triển xác minh.

## 6. Tính năng kế thừa
Đầy đủ IPTV M3U, EPG XMLTV, tìm kiếm, yêu thích, thư mục, MultiView, Snapshot, kiểm tra link, Doctor, Failover, Timeshift, DVR, Cast/AirPlay, cấu hình theme, Backup/Restore, Live Caption Whisper và Live Translate. Không thay đổi Android/iOS hoặc Web Edition.

## 7. Cài đặt, giới hạn và giấy phép
Mac mở DMG → kéo app vào Applications. Windows dùng Setup hoặc Portable từ GitHub Release. Tệp thử nghiệm có thể chưa ký số; kiểm tra SHA-256 và chỉ mở từ nguồn tin cậy. MLX Hy-MT2/Qwen3 chỉ có trên Mac Apple Silicon. Bộ dịch/giọng AI được tải riêng khi người dùng yêu cầu. Chỉ phát nguồn truyền hình bạn được quyền truy cập. FFmpeg/FFprobe, các mô hình và thư viện có giấy phép riêng, xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## 8. Kiểm thử, nguồn và hỗ trợ
Mã nguồn được chạy Node regression tests; các job phát hành kiểm tra native DMG ARM64/Intel, Windows Setup/Portable, kích cỡ, ZIP nguồn chính xác và tệp SHA256SUMS. Kiểm thử đóng gói không đồng nghĩa mọi codec/kênh/mô hình đã chạy được trên từng máy. Xem [Hướng dẫn sử dụng](docs/HUONG_DAN_V4_23_65.md), [README](README.md) và [bản stable v4.23.60](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.60).

### English changelog
Experimental Electron v4.23.65 for macOS Apple Silicon/Intel and Windows x64. Preserves IPTV features while adding optional offline VietVoice/F5 Vietnamese TTS, configurable automatic PiP, bundled FFprobe for VietVoice, and hardware/storage recommendations for every AI model. Weights are opt-in downloads; F5 Vietnamese selected checkpoint is noncommercial and cloning needs speaker consent. Verify SHA256SUMS, expect OS warnings on unsigned binaries, and note that MLX models require Mac Apple Silicon. Does not change stable main or Rust/Tauri.

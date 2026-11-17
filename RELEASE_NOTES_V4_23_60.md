# Open IPTV Pro v4.23.60 — Desktop AI Offline + Live Caption/Translate/TTS

Phát hành Electron cho macOS và Windows. Mã nguồn đầy đủ cùng phiên bản được công bố trên nhánh `main`, bản tải dựng sẵn có trong **GitHub Releases**.

## Điểm nổi bật / Highlights

- **Live Caption:** dùng Whisper nhận diện giọng nói ngay trên máy; FFmpeg thu âm liên tục và chia thành cửa sổ **8 giây** để giữ ngữ cảnh dài hơn. Có thể tăng độ trễ hiển thị và không đảm bảo câu dài hơn 8 giây không bị chia.
- **Live Translate:** chỉ hiển thị bản dịch **ngôn ngữ đích trên video**, không lặp dòng phụ đề nhận diện ở thanh điều khiển. Không hiển thị phụ đề trung gian; nội dung chữ gắn sẵn trong video của đài không thể xóa.
- **Dịch offline:** chế độ Tự động hoặc Argos, Hy-MT2 (1.8B/7B, 4/8-bit), Qwen3 (0.6B/1.7B/4B/8B, 4-bit). **MLX chỉ dùng trên Mac Apple Silicon**; một số model chưa được xác minh chất lượng trên mọi cặp ngôn ngữ. Model tải khi người dùng yêu cầu, không đóng gói sẵn nhiều GB.
- **Giọng dịch TTS:** Piper/VieNeu tùy ngôn ngữ và tình trạng bộ cài; điều chỉnh giọng đọc, tốc độ và mức âm lượng gốc. Hàng đợi chỉ giữ câu mới nhất **đang chờ** nhưng không ngắt giữa câu **đang phát**.
- **Quản lý AI:** trong cùng một nút ⚙, hiển thị bộ nhớ từng mô hình, tải/cài lại và xóa riêng; cảnh báo tải máy/nhiệt xuất hiện khoảng 10 giây.
- Giữ các tính năng desktop M3U, EPG/XMLTV, kiểm tra luồng, FFmpeg/HLS/DASH, lưu yêu thích, thư mục, PiP, Snapshot, MultiView, Timeshift, DVR, Cast/AirPlay (tùy nền tảng), Backup/Restore và theme.

## File tải / Downloads

| Nền tảng | Tên file trong Release |
| --- | --- |
| macOS Apple Silicon (M1/M2/M3/M4...) | `Open-IPTV-Pro-4.23.60-mac-arm64.dmg` |
| macOS Intel | `Open-IPTV-Pro-4.23.60-mac-x64.dmg` |
| Windows 10/11 64-bit — Setup | `Open-IPTV-Pro-Setup-4.23.60-x64.exe` |
| Windows 10/11 64-bit — Portable | `Open-IPTV-Pro-4.23.60-x64.exe` |
| Mã nguồn đầy đủ | `OpenIPTVPro_Source_v4.23.60.zip` |
| Kiểm tra tệp | `SHA256SUMS.txt` |

Các tên file chỉ là danh mục dự kiến; tải các nền tảng thực sự xuất hiện trong **Assets**. Chưa có chữ ký/notarization thì macOS có thể cảnh báo bảo mật, và Windows SmartScreen có thể hỏi xác nhận nhà phát hành.

## Hướng dẫn nhanh / Quick start

1. Tải đúng bộ cài từ [Release v4.23.60](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.60).
2. Mở ứng dụng, thêm danh sách M3U từ file hoặc URL, chọn kênh có quyền truy cập.
3. Bật **Live Caption** nếu muốn nhận diện tiếng nói; bật **Live Translate**, chọn đích như **Tiếng Việt**.
4. Mở ⚙ cạnh phụ đề để chọn bộ dịch AI offline và cài model nếu cần.
5. Bật **Giọng dịch TTS**, chọn ngôn ngữ/giọng, tốc độ và % âm lượng gốc. Thử Piper nếu VieNeu phản hồi quá chậm.
6. Để giải phóng bộ nhớ, mở ⚙ → **Bộ nhớ AI đã tải** → Xóa đúng mô hình (xác nhận hai lần).

Đọc [Hướng dẫn chi tiết Desktop](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/HUONG_DAN_V4_23_60.md).

## Bản web / Web Edition

**Dùng trực tiếp tại [https://trisanghy.github.io/open-iptv-pro/](https://trisanghy.github.io/open-iptv-pro/)**. Không cần cài đặt. Đây là ứng dụng trình duyệt **riêng** với desktop; hỗ trợ M3U, HLS/DASH khi tương thích codec, HTTPS/CORS, EPG, tìm kênh, yêu thích, Backup JSON, đăng nhập/đồng bộ nếu dịch vụ được cấu hình. Không quảng cáo khả năng Whisper/MLX/VieNeu offline hoặc FFmpeg thu âm native chạy ngay trên GitHub Pages.

Xem [Hướng dẫn Web](https://trisanghy.github.io/open-iptv-pro/huong-dan.html).

## Testing / Known limitations

CI Electron v4.23.60 trước khi phát hành: **363 test đạt, 0 lỗi, 5 bỏ qua**; Mac ARM64 DMG đã đóng gói thành công. Quy trình Release xây lại từng nền tảng từ mã nguồn đã đẩy lên `main`. Việc dịch và TTS chính xác, độ trễ trên luồng live vẫn phụ thuộc nguồn, CPU/GPU, mô hình và ngôn ngữ; chưa khẳng định đạt thời gian thực trên mọi máy. Bản web có thể bị CORS, DRM, codec hoặc autoplay policy chặn.

**English summary:** v4.23.60 delivers continuous 8-second Whisper windows, target-only on-video subtitles, selectable offline translation models and full-utterance TTS on the Electron desktop. macOS/Windows ready-built installers, exact source ZIP and checksums are published as Release assets when corresponding builds succeed. The hosted Web Edition is separate and browser-restricted. Use only legally accessible streams.

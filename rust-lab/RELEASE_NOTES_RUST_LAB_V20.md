# Open IPTV Pro Rust Lab v20 — Electron v4.23.45 offline AI parity (beta)

**Nhánh:** `experiment/rust-tauri-v2` · **tag:** `rust-lab/v20` · phiên bản mã nguồn `4.23.17-tauri.20`.

## Chức năng mới

1. **Live Caption và Live Translate** trong hàng công cụ phụ thứ 3: FFmpeg tách âm thanh IPTV theo đoạn 8 giây, Whisper.cpp cục bộ tạo văn bản và tùy chọn dịch sang English.
2. **Voice-over đa ngôn ngữ**: Piper TTS, Argos Translate offline, 10 ngôn ngữ; thay đổi giọng và giảm âm lượng gốc trong lúc đọc, khôi phục sau khi đọc/dừng/đổi kênh.
3. **Tự cài mô hình**: một nút cài Whisper và một nút cài giọng dịch. Công cụ và trọng số Whisper/uv được xác minh SHA-256 theo Electron v4.23.45; Piper/Argos/giọng đọc tải sau khi người dùng yêu cầu.
4. **Tauri 2 native bridge**: lệnh `caption:*`, `tts:*` và sự kiện `caption:event`, `tts:event`; audio tạm và WAV xóa sau sử dụng.
5. **Giữ nguyên UI đã duyệt v19.2:** hai hàng player + EPG, Link phát, video-fit, PiP, Cast button, tab danh sách kênh 15px và tỷ lệ video theo nguồn.

## Bộ cài tự động GitHub Actions

Workflow riêng tạo tag bất biến v20, build Windows x64 Setup/Portable (ZIP với FFmpeg) và ZIP nguồn, công bố **prerelease** ngay sau Windows thành công. macOS Universal chạy độc lập, khi hoàn tất mới bổ sung DMG và checksum riêng; không làm thay đổi Electron Latest.

**Chưa xác nhận chức năng AI end-to-end hoặc biên dịch native hoàn tất.** Chỉ coi bộ cài phát hành khi có GitHub Actions success và tải được Release assets. Mô hình tải lần đầu có thể lớn, cần nguồn mạng; không cần tài khoản cloud speech.

**Giới hạn:** Google Cast/mDNS và LAN streaming trong Rust Lab vẫn chưa tương đương bản Electron. Subtitle trong PiP phụ thuộc WebView; auto translate hiện chỉ sang English trước khi Argos chuyển ngôn ngữ cho TTS.

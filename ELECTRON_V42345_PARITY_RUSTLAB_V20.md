# Đối chiếu Electron 4.23.45 → Tauri/Rust Lab v20

Nguồn: mã nguồn Electron v4.23.45 do người dùng tải lên, so với mã nguồn `experiment/rust-tauri-v2`.

| Nhóm chức năng | Tình trạng trong Rust Lab v20 | Ghi chú |
|---|---|---|
| M3U URL/tệp, thư mục, yêu thích, nguồn dự phòng | Đã có từ Rust Lab trước v20 | Dùng backend Rust và giao diện hiện tại |
| HLS/DASH trong WebView, FFmpeg fallback, kiểm tra kênh | Đã có từ Rust Lab trước v20 | Không bảo đảm mọi codec/URL |
| Snapshot, Timeshift, EPG XMLTV, DVR | Đã có từ Rust Lab trước v20 | Tùy nguồn, FFmpeg, thời gian chạy |
| Tỷ lệ khung theo nguồn (16:9 mặc định), PiP, fullscreen | Đã có từ v17–v19.2 | Giữ bố cục hai hàng |
| Live Caption từ audio IPTV | **Đã bổ sung mã nguồn v20** | Whisper.cpp từ FFmpeg → text, cần kiểm thử luồng thật |
| Live Translate → English | **Đã bổ sung mã nguồn v20** | Whisper CLI `-tr`, không phải dịch hai chiều bất kỳ |
| TTS giọng dịch đa ngôn ngữ + volume ducking | **Đã bổ sung mã nguồn v20** | Argos en→đích, Piper tạo WAV, cần mô hình |
| Cài Whisper tự động | **Đã bổ sung mã nguồn v20** | SHA256 pinned, binary community release như Electron |
| Cài Piper/Argos/voices | **Đã bổ sung mã nguồn v20** | uv pinned, user-data riêng, Internet lần đầu |
| Phụ đề trong native PiP | Thử nghiệm, best-effort | Tùy WebView/VTTCue, không phải Chrome Live Caption |
| Google Cast/AirPlay LAN tự khám phá | **Chưa tương đương Electron** | Rust bridge còn giới hạn thiết bị discovery |
| Đồng bộ tính năng 100% & native end-to-end | **Chưa xác nhận** | Phải thử Mac/Windows với luồng và mô hình thật |

Các mô hình có giấy phép riêng; người dùng nên xem nguồn và chấp nhận trước khi tải. Rust Lab không gửi lời nói đến API transcription cloud, nhưng luồng IPTV có thể vẫn cần mạng.

# Rust Lab v20 — chuyển tính năng AI từ Electron v4.23.45

- Thêm `src-tauri/src/local_ai.rs`: phiên làm việc Whisper/FFmpeg, tải Whisper/model SHA-256, quản lý uv/Piper/Argos/voice, WAV TTS và giới hạn dữ liệu/số ký tự.
- Mở rộng `src-tauri/src/bridge.rs` và `renderer/tauri-bridge.js` với các lệnh Caption/TTS và sự kiện Tauri.
- Chuyển 3 module JavaScript và 3 tệp CSS Live Caption, Translate, TTS, Whisper installer từ Electron v4.23.43–45.
- Tạo hàng công cụ AI thứ 3, giữ hai hàng player v19.2 và các nút hiện có.
- Tạo test hồi quy, cập nhật version/tag `rust-lab/v20`, script build một ZIP.
- Tách đăng Release Windows và bổ sung macOS Universal sau; tránh Windows bị kẹt khi chờ runner Mac.
- Không đụng `main`, không ghi đè các tag v19/v19.1/v19.2.

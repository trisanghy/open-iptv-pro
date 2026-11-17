# Hướng dẫn Open IPTV Pro v4.23.60 — Windows / macOS

**Website:** https://trisanghy.github.io/open-iptv-pro/  
**Tải ứng dụng dựng sẵn:** https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.60  
**Mã nguồn:** https://github.com/trisanghy/open-iptv-pro/tree/main

## 1. Cài đặt

- **Mac M1–M4 (Apple Silicon):** tải `Open-IPTV-Pro-4.23.60-mac-arm64.dmg`, mở DMG rồi kéo ứng dụng vào Applications.
- **Mac Intel:** chọn `Open-IPTV-Pro-4.23.60-mac-x64.dmg`.
- **Windows x64:** chọn `Open-IPTV-Pro-Setup-4.23.60-x64.exe` để cài, hoặc bản `Open-IPTV-Pro-4.23.60-x64.exe` để dùng Portable.
- **Source ZIP:** giải nén mã nguồn đầy đủ, dùng Node.js 22+, `npm install`, `npm test` rồi `npm start` hoặc electron-builder.
- Đối chiếu tên, dung lượng và SHA-256 khi tải. Bản chưa ký số có thể xuất hiện cảnh báo hệ điều hành. Chỉ tải từ repository chính thức.

## 2. Mở danh sách M3U và xem TV

1. Mở **Quản lý nguồn** → Thêm nguồn từ tệp `.m3u/.m3u8` hoặc URL playlist hợp lệ.
2. Chọn kênh trong **Xem truyền hình**. Lựa chọn **Link chính / dự phòng** nếu kênh có nhiều nguồn.
3. Dùng các nút Phát/Tạm dừng, âm lượng, lựa chọn tỷ lệ hình, PiP, Fullscreen, yêu thích và Cast/AirPlay nếu thiết bị hỗ trợ.
4. Dùng **EPG**, **MultiView**, **Ảnh chụp kênh**, **Tua lại/Timeshift** hoặc **Ghi hình/DVR** khi nguồn phát và nền tảng cho phép.
5. **Smart IPTV Doctor** và tính năng kiểm tra luồng giúp chẩn đoán URL, CORS/codec và nguồn dự phòng.

## 3. Phụ đề tự nhận diện (Live Caption)

1. Chọn kênh đang có tiếng nói và bật **Live Caption**.
2. Nhấn ⚙ trong hàng điều khiển để cài Whisper tự động hoặc chọn `whisper-cli` + mô hình GGML nếu bạn đã có chúng.
3. Bản v4.23.60 thu âm liên tục qua FFmpeg, nhận diện theo **đoạn khoảng 8 giây**. Số `-t 4` trong Whisper là số luồng CPU, *không phải* độ dài đoạn.
4. Phụ đề nhận diện được hiển thị trực tiếp trên video. Âm thanh bị đứt, codec lạ hoặc nguồn không ổn định sẽ làm giảm độ chính xác.

## 4. Dịch phụ đề (Live Translate)

1. Bật cả **Live Caption** và **Live Translate**.
2. Chọn **ngôn ngữ đích** (ví dụ Tiếng Việt, English, Français).
3. Mở ⚙ → **Bộ dịch offline** → chọn Tự động, Argos hoặc một mô hình AI đã cài.
4. Bật Live Translate thì app chỉ vẽ **bản đích trên video**, không chiếu phụ đề gốc trung gian ở hàng dưới. Những chữ đã được đài ghép vào hình không thể tự xóa.
5. Nếu văn bản nguồn và đích cùng ngôn ngữ, ứng dụng có thể bỏ dịch; với cặp ngôn ngữ chưa có model phù hợp, hãy cài mô hình hoặc đổi bộ dịch.
6. Đoạn 8 giây cung cấp ngữ cảnh dài hơn nhưng **cũng tăng độ trễ**, và có thể chia câu quá dài thành hai đoạn. Không nên hiểu phụ đề đã dịch là bản tốc ký chính xác 100%.

### Chọn mô hình

| Bộ dịch | Đặc điểm | Hỗ trợ |
|---|---|---|
| Argos | Bộ dịch theo cặp nhẹ, chạy offline sau khi cài | macOS/Windows khi bộ cài hỗ trợ |
| Hy-MT2 1.8B 4/8-bit | AI chuyên dịch, ít RAM hơn bản 7B | Mac Apple Silicon (MLX) |
| Hy-MT2 7B 4/8-bit | Mô hình dịch nặng, có thể dùng nhiều RAM | Mac Apple Silicon (MLX) |
| Qwen3 0.6B/1.7B/4B/8B 4-bit | AI đa năng được hướng dẫn dịch, nên thử nghiệm trước | Mac Apple Silicon (MLX) |
| Tự động | Chọn trong các mô hình có sẵn, không tự tải vài GB | Tùy cấu hình |

Chỉ tải mô hình khi bạn bấm **Tải mô hình**. Cài quá nhiều mô hình sẽ chiếm dung lượng; dùng **Bộ nhớ AI đã tải** để xem dung lượng và xóa riêng từng model. Trong trường hợp xóa môi trường MLX nhưng giữ model, có thể chọn **Sửa bộ chạy MLX**.

## 5. Đọc phụ đề bằng giọng TTS

1. Bật **Giọng dịch TTS**, chọn ngôn ngữ đọc, giọng, **Tốc độ** (ví dụ 1.1×) và **Tiếng gốc** (ví dụ 25%).
2. Piper là lựa chọn nhẹ hơn; VieNeu có tùy chọn giọng Việt chất lượng cao nhưng yêu cầu thời gian tổng hợp và tài nguyên cao hơn.
3. Phiên bản này **đọc hết WAV đang phát**, không cắt ngang chỉ vì phụ đề mới đến. Hàng chờ chỉ giữ câu mới nhất chưa phát; phụ đề quá trễ có thể bị bỏ qua.
4. Đổi kênh, tắt TTS hoặc đổi giọng có thể dừng câu đang phát — đây là hành động thay đổi chế độ, không phải lỗi.
5. Bật Whisper + mô hình dịch nặng + TTS có thể làm tăng nhiệt, RAM và hao pin. Cảnh báo màu cam tự ẩn sau khoảng 10 giây.

## 6. Quản lý dữ liệu và sao lưu

- Dùng **Sao lưu/Khôi phục** để xuất/nhập cấu hình, playlist, yêu thích và dữ liệu hỗ trợ; lưu file sao lưu riêng vì có thể chứa URL/token.
- Mô hình AI lưu trong dữ liệu ứng dụng, tải/xóa độc lập với danh sách kênh.
- Sau khi có phiên bản mới, vào mục cập nhật hoặc tải bộ cài tương ứng từ **Releases**. Với macOS chưa ký, cài lại DMG theo cách thủ công.

## 7. Bản Web Online — khác bản cài

Mở trực tiếp **https://trisanghy.github.io/open-iptv-pro/**. Nhập danh sách M3U, chọn kênh, EPG, yêu thích, MultiView, chủ đề và Backup JSON khi trình duyệt hỗ trợ. Bản Web chạy trong trình duyệt và chịu giới hạn **HTTPS/CORS, autoplay, DRM, codec và quyền truy cập nguồn**. Nó **không** nhúng Whisper/MLX/VieNeu local, FFmpeg native, Timeshift hay DVR local như desktop. [Hướng dẫn Web](https://trisanghy.github.io/open-iptv-pro/huong-dan.html).

## 8. Khắc phục lỗi thường gặp

- **Không có kênh:** kiểm tra URL/file M3U, mạng, token, quyền truy cập và link dự phòng.
- **Web không phát nhưng app phát:** thường do CORS, HTTP hỗn hợp, codec hoặc yêu cầu native FFmpeg.
- **Whisper chưa sẵn sàng:** vào ⚙ → cài lại; kiểm tra dung lượng trống và mạng lần đầu.
- **Dịch báo thiếu model:** tải bộ dịch cần thiết cho ngôn ngữ và nền tảng; Windows không dùng MLX.
- **TTS đọc chậm:** thử Piper, giảm model đang chạy, chọn tốc độ hợp lý, đóng các tác vụ AI nặng khác.
- **Phụ đề lệch video:** kiểm tra độ trễ phát, chuyển model nhỏ hơn hoặc tạm tắt TTS để đối chiếu. Cửa sổ 8 giây tạo thêm độ trễ có chủ đích.

Dùng các playlist và luồng bạn được phép xem. Các chức năng và chất lượng dịch còn tùy nguồn phát, mô hình cài đặt và cấu hình phần cứng.

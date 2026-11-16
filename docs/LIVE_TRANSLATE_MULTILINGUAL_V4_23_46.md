# Open IPTV Pro v4.23.46 — Sửa Live Caption và Live Translate đa ngôn ngữ

Đây là **bản thử nghiệm desktop Windows/macOS**, giữ nguyên nhánh main.

## Các lỗi được sửa

1. **Live Caption không phát hiện chữ dù đã cài Whisper:** gỡ cờ `-np` (**no prints**) khỏi lệnh whisper-cli. Cờ này làm mất nội dung lời nói cần hiển thị.
2. **Live Caption/Translate bật rồi tự mất dấu chọn:** giữ trạng thái người dùng, hiển thị lỗi trong dòng 3 (bấm vào dòng trạng thái để đọc toàn bộ qua tooltip) và cung cấp nút **↻ Thử lại**.
3. **Chỉ có English:** chọn tối đa 15 ngôn ngữ mục tiêu, mặc định **Tiếng Việt**. Lựa chọn được lưu trên máy.
4. **Chọn ngôn ngữ nhưng không đổi chữ thực:** Whisper nhận diện và dịch lời nói sang tiếng Anh; gói Argos dịch tiếp sang ngôn ngữ đã chọn bằng mô hình offline. Mỗi cặp dịch được cài khi bật/đổi ngôn ngữ lần đầu (cần Internet một lần).
5. **Giọng đọc TTS bị dịch hai lần:** khi có phụ đề dịch sang tiếng Việt hoặc ngôn ngữ khác, TTS vẫn nhận bản tiếng Anh trung gian để dịch đúng sang ngôn ngữ **giọng đọc** đã chọn riêng. Tự giảm âm lượng gốc và khôi phục sau khi đọc giữ như v4.23.45.

## Cách dùng

- Chọn kênh IPTV đang phát và có tiếng.
- Bật **Live Caption** để nhận dạng lời nói. Nếu thiếu Whisper, ứng dụng sẽ tự chạy bước thiết lập mô hình đã có ở bản trước.
- Bật **Live Translate**, sau đó mở hộp chọn ngôn ngữ. Có: Tiếng Việt, English, Français, Español, Deutsch, 中文, 日本語, 한국어, Português, Italiano, Русский, Indonesia, العربية, हिन्दी, ไทย.
- Khi lần đầu chọn ngôn ngữ chưa có mô hình, ứng dụng sẽ tự tải/cài Argos (chỉ gói dịch, **không cần tải giọng Piper** nếu bạn không bật TTS).
- Đợi hiển thị phụ đề ở dòng điều khiển dưới video. Nếu xảy ra lỗi, nhìn trạng thái bên cạnh và nhấn **↻ Thử lại** sau khi sửa nguồn / kết nối.
- Nếu muốn đọc thành tiếng, bật **Giọng dịch TTS** và chọn ngôn ngữ đọc riêng cùng mức âm lượng tiếng gốc.

## Lưu ý kỹ thuật

- Whisper gốc chỉ có khả năng dịch tiếng nói **sang tiếng Anh**. Để dịch sang nhiều ngôn ngữ, ứng dụng phải có Argos Translate và cặp ngôn ngữ tương ứng. Các gói khả dụng thay đổi theo index Argos, nên có thể có ngôn ngữ trong danh sách chưa tải được; ứng dụng sẽ hiển thị thông báo lỗi thực tế.
- Một số luồng IPTV có DRM, xác thực bằng cookie hoặc bị chặn FFmpeg nên **phát được video nhưng không đọc được âm thanh để tạo phụ đề**. Bản sửa không cố tình bỏ qua lỗi bảo vệ nội dung.
- Gói Whisper/Argos cần Internet ở lần cài đầu; xử lý sau đó diễn ra trên máy. Độ trễ phụ đề tùy theo thời lượng đoạn âm thanh và CPU.
- Phụ đề hiển thị trong trình phát; phụ đề hệ thống trong cửa sổ **PiP có thể không khả dụng**, khác UI độc quyền của Chrome.
- Không thay đổi bố cục video 16:9, nút phát, âm lượng, Cast/AirPlay, PiP, EPG, link dự phòng, chế độ Intel/Apple Silicon/Windows, và không sửa main.

## Kiểm thử

- Bộ kiểm thử dự án trên GitHub Actions.
- Kiểm thử runtime bằng subprocess giả lập FFmpeg → Whisper → Argos, xác minh bản tiếng Anh trung gian và phụ đề tiếng Việt.
- Build thử ứng dụng đầy đủ trên runner macOS Apple Silicon và Windows x64.
- Chưa kiểm thử nhận dạng ngôn ngữ thực tế trên máy người dùng; đây vẫn là beta.

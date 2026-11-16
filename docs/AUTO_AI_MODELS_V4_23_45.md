# Open IPTV Pro v4.23.45 — AI phụ đề, dịch và giọng đọc offline

## Sử dụng đơn giản trong dòng 3

**1. Bật Live Caption / Live Translate:** vào phần ⚙ của hàng 3, nhấn **Cài Whisper tự động**. Ứng dụng tải **công cụ whisper.cpp và mô hình GGML base đa ngôn ngữ (~148 MB)** một lần, giải nén và đăng ký đường dẫn tự động. Không cần tải file `.bin` hay chọn đường dẫn thủ công.

**2. Bật giọng dịch TTS:** chọn ngôn ngữ, ví dụ **Tiếng Việt**, sau đó nhấn **Cài mô hình tự động**. Ứng dụng tự tải và thiết lập:
- `uv` đúng kiến trúc CPU, kiểm tra SHA-256
- Python 3.11 riêng trong thư mục dữ liệu ứng dụng
- Piper TTS 1.8.0 và Argos Translate 1.11.0
- Mô hình ONNX giọng đọc và gói dịch English → ngôn ngữ đã chọn

Không cần cài Python, pip hay công cụ Whisper thủ công. Việc tải chỉ bắt đầu khi bấm nút, yêu cầu Internet một lần và có thể tốn vài trăm MB. **Sau khi cài đủ**, nhận diện, dịch và đọc diễn ra trên máy, không cần thuê API cloud. Phần IPTV vẫn cần mạng để lấy chương trình trực tiếp.

**3. Giảm âm lượng tiếng gốc:** chọn 0%, 15%, 25% (mặc định), 50%, 75% hoặc 100%. Khi Piper đọc, video bị giảm âm lượng tạm thời; khi đọc xong, tắt TTS hoặc đổi kênh, mức trước đó được khôi phục.

## Các ngôn ngữ

Việt, Anh, Tây Ban Nha, Pháp, Đức, Trung, Bồ Đào Nha, Ý, Nga, Indonesia. Whisper dịch ngôn ngữ gốc sang tiếng Anh, Argos dịch sang ngôn ngữ đã chọn và Piper đọc. Các cặp dịch/giọng phải tồn tại trong kho mô hình tương ứng; nếu thiếu, ứng dụng báo lỗi thay vì tự nhận đã hỗ trợ.

## Giới hạn và bảo mật

- **Đây là bản beta**, chưa đảm bảo lồng tiếng khớp miệng hay tức thời. Thời gian trễ bao gồm thu đoạn âm thanh, Whisper, Argos và Piper.
- **Whisper binary:** được tải từ [OpenWhispr Binaries v1.0.0](https://github.com/sjoerdteunisse/whisper.cpp/releases/tag/v1.0.0), một build **cộng đồng, không phải bản chính thức** của ggml-org. URL và SHA-256 được ghim theo CPU (Mac ARM64, Mac Intel, Windows x64), tải sau khi người dùng bấm nút. Người dùng cần tin tưởng nguồn đó trước khi bật cài tự động.
- **Whisper weights:** lấy từ kho mô hình [ggerganov/whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp) chính chủ, model GGML base, kiểm tra SHA-256 (`60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe`).
- **Piper voice licenses:** có thể khác nhau theo từng giọng (đặc biệt quan trọng nếu phân phối app thương mại); xem [Piper Voices](https://huggingface.co/rhasspy/piper-voices) trước khi đưa mô hình vào gói cài.
- Âm lượng giảm cho phần tử video HTML5. Với bộ phát FFmpeg riêng hoặc Cast/AirPlay bên ngoài, mức giảm có thể không tác dụng.
- Cửa sổ PiP dùng trình phát hệ thống chưa chắc hiển thị chữ phụ đề như Chrome Native Live Caption.
- Không ghi âm thường trực. Bộ xử lý dùng audio ngắn rồi xóa; không có API nhận diện/giọng đọc trả phí.

### Mã nguồn và build

- Mã nguồn chạy trên Windows/macOS lưu thành một ZIP, **không kèm weights lớn** để giữ kích thước bộ cài nhỏ.
- Một lệnh `build-mac.sh` tự tải ZIP và chọn Mac Intel hoặc Apple Silicon, giữ riêng DMG và ZIP trong Downloads.
- Các mô hình tự cài trong **thư mục dữ liệu riêng của ứng dụng**, không phải tải/copy thủ công khi build.
- Nhánh phát triển: `iptv-build-source`. Không cập nhật nhánh `main` cho tới khi xác nhận chạy thực tế.

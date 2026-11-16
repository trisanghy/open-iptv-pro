# Open IPTV Pro v4.23.44 — Giọng đọc TTS đa ngôn ngữ (bản thử nghiệm)

## Sử dụng ngay trong ứng dụng

Trong **hàng điều khiển thứ 3** dưới video, bật **🔊 Giọng dịch TTS**. Chọn ngôn ngữ giọng đọc (mặc định **Tiếng Việt**) và mức **Tiếng gốc** (mặc định **25%**; 0% tắt tiếng gốc trong khi TTS phát).

Nếu máy chưa có mô hình, nhấn **Cài mô hình tự động** một lần. Ứng dụng tự tải:
- Bộ quản lý Python **uv** bản 0.12.24 đúng CPU Mac Intel / Apple Silicon hoặc Windows x64 và kiểm tra SHA-256 của gói uv
- Môi trường Python **3.11 riêng trong dữ liệu ứng dụng**
- **Piper TTS** mã nguồn mở, **Argos Translate** cho cặp dịch English → ngôn ngữ đã chọn
- Một giọng Piper tương ứng và cấu hình ONNX/JSON

Người dùng **không phải tải tay .onnx, .argosmodel, pip hoặc cài Python vào hệ thống**. Quá trình có thể mất dung lượng và cần kết nối Internet **lần đầu với từng ngôn ngữ**. Tiến độ / thông báo lỗi hiển thị cạnh nút cài đặt. Mô hình chỉ cài trong thư mục dữ liệu của ứng dụng, không đóng gói vào DMG.

Sau khi cài xong, phần dịch và giọng nói hoạt động **offline**. Nếu nguồn IPTV không thể phát offline thì vẫn cần Internet để xem kênh.

## Quy trình xử lý

`Tiếng nói kênh IPTV → Whisper (nhận diện và dịch sang English) → Argos (English sang ngôn ngữ đã chọn) → Piper TTS (WAV đọc trên máy)`.

Giọng đọc chỉ phát khi có văn bản dịch tiếng Anh mới từ Live Translate. Khi bắt đầu đọc, ứng dụng hạ âm lượng video gốc về **0/15/25/50/75/100%** mức trước đó. Sau khi TTS ngừng, kết thúc, tắt tính năng hoặc đổi kênh thì tự trả lại âm lượng. Đây là điều khiển mức âm lượng video HTML5; luồng âm thanh xuất ngoài player hoặc FFmpeg riêng có thể cần xử lý khác.

## Những ngôn ngữ hiển thị

**vi, en, es, fr, de, zh, pt, it, ru, id**. Mỗi ngôn ngữ dùng một giọng mặc định của Piper. Số gói dịch Argos thực tế khả dụng phụ thuộc kho mô hình; thiếu cặp dịch sẽ có lỗi rõ ràng, không tự phát tiếng Anh giả là giọng dịch.

## Giới hạn / yêu cầu còn lại

- **Whisper:** đây là phần Live Caption / Live Translate được giới thiệu từ v4.23.43. Bản v4.23.44 có thể cần thiết lập whisper-cli và mô hình GGML lần đầu trong mục ⚙ nếu trước đó chưa cài. Nút tự động trong bản này cài **Piper + Argos + giọng đọc**; chưa tự cài công cụ Whisper.
- **Độ trễ:** lấy âm thanh, nhận diện, dịch rồi tổng hợp giọng sẽ trễ so với lời nói trực tiếp, không phải lồng tiếng đồng bộ thời gian thực.
- **Công cụ cài trong môi trường riêng:** chỉ tải về khi nhấn **Cài mô hình tự động**. Không đưa lời nói / văn bản tới dịch vụ API trả phí; Argos/Piper chạy nội bộ, riêng nguồn model ban đầu tải từ internet.
- **Quyền và giấy phép:** phần mềm Piper có giấy phép GPL-3.0-or-later; từng giọng và bộ dữ liệu có điều khoản riêng. Người phát hành cần xem license riêng của mô hình trước khi phân phối công khai.
- **Trạng thái:** tính năng beta đã qua kiểm thử tự động mã nguồn, chưa xác thực chất lượng âm thanh và độ trễ trên tất cả nguồn IPTV thực tế.
- **macOS:** DMG chưa ký/notarize có thể bị macOS Gatekeeper chặn (xử lý riêng với mô hình giọng nói).

Các dự án gốc:
- [Piper TTS (OHF Voice)](https://github.com/OHF-Voice/piper1-gpl)
- [Piper voice models](https://huggingface.co/rhasspy/piper-voices)
- [Argos Translate](https://github.com/argosopentech/argos-translate)
- [uv](https://github.com/astral-sh/uv)
- [Whisper.cpp](https://github.com/ggml-org/whisper.cpp)

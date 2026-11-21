# POSITRON · 20 vòng nâng cấp tính năng có ích
Ngày rà soát: 21-11-2026. Phạm vi: repository `trisanghy/open-iptv-pro`, **chỉ nhánh Positron**.

## Nguyên tắc chấp nhận một vòng
- Mỗi vòng phải xác minh HEAD mới nhất, đọc mã có thật, giải quyết một nhu cầu thật, có test hồi quy, 1 commit mới, 1 version + immutable tag; không tính QA chụp lại giao diện cũ là chức năng mới.
- QA từ Electron thực và hình chụp màn hình ở kịch bản có dữ liệu; kiểm tra không che video/controls, không vượt viewport; build Windows x64 Setup + Portable, Mac ARM/x64, link release được kiểm chứng.
- Không tự nhập URL, tự bật stream, thu thập lịch sử xem mới, tìm nguồn bên ngoài, giả vờ AI hoặc EPG biết chương trình không có metadata; nguồn phát thuộc quyền sử dụng của người dùng. Các module gợi ý mặc định thuần local; đồng bộ tài khoản là **opt-in**.
- Không claim xong 20 vòng khi chưa có 20 kết quả test + ảnh + CI/release của từng version. Các mục bên dưới là **nghiên cứu/ưu tiên**, không phải báo cáo đã triển khai.

## Nghiên cứu thực tế
Đối chiếu cấu trúc Positron P5.1.95 với tính năng của các trình phát open-source:
- OpenTV: EPG tăng dần và nhắc chương trình; `https://github.com/opentvproject/opentv`
- IPTVnator: EPG timeline, archive/catch-up khi nguồn hỗ trợ, recently viewed; `https://github.com/4gray/iptvnator`
- Jellyfin Live TV: guide mapping và DVR dựa trên EPG thật; `https://jellyfin.org/docs/general/server/live-tv/setup-guide.html`
- Plasma: profile, history, favorites và resume; `https://github.com/gureetk/plasma`
- Tiviate: reconnect có backoff, fallback / lý do lỗi phân biệt, backup/restore; `https://github.com/Amitk2108/tiviate`
Các nguồn trên là định hướng so sánh, **không** chứng minh ứng dụng hiện tại đã hỗ trợ các tính năng đó.

| Vòng mục tiêu | Tính năng cần nghiên cứu/triển khai | Bài kiểm thử chấp nhận tối thiểu | Trạng thái |
|---|---|---|---|
| 01 | **Xem sau**: đánh dấu kênh từ WatchFlow; mục Tiếp hiển thị danh sách đã lưu; không lưu URL/mật khẩu | Thêm/xóa trên Electron, mở lại, lưu local, không phát tự động, nguồn khác không trộn | Đang triển khai P5.1.96 |
| 02 | **Đang phát gì?**: hiển thị chương trình từ XMLTV thật ngay trên thẻ WatchFlow, không đoán EPG | Đúng cửa sổ giờ và offset; không EPG không bịa, không tự phát | P5.1.98 đang triển khai |
| 03 | **Nhắc chương trình**: đặt/hủy nhắc từ EPG thực, thông báo khi app chạy | Hủy, trùng lịch, thay múi giờ, quyền notification | Nghiên cứu |
| 04 | **Tìm chương trình đa kênh**: tên/tập/thể loại EPG, dấu tiếng Việt | Kiểm chứng kết quả có nguồn+start/end, không bịa tên | Nghiên cứu |
| 05 | **Lịch phát cá nhân hôm nay**: danh sách chương trình quan tâm, chỉ với guide | Local-first, không tự đặt lịch ghi hình, không giả dữ liệu | Nghiên cứu |
| 06 | **Smart Zap 2.0**: giải thích vì sao kênh được đề xuất, đổi kênh chủ động | Không lặp ngay, loại nguồn dead, tôn trọng seen | Nghiên cứu |
| 07 | **Trở lại kênh trước** sau khi chuyển, có phím nóng | Chỉ lưu khi phát thành công, không lưu failed plays | Nghiên cứu |
| 08 | **Doctor giải thích lỗi phát**: DNS/403/404/timeout/codec | Phân biệt log lỗi có thật; không công khai URL có token | Nghiên cứu |
| 09 | **Kênh trùng & liên kết dự phòng**: phát hiện trùng có kiểm tra trước khi gộp | Không xóa kênh; các link chỉ gộp sau đồng ý | Nghiên cứu |
| 10 | **Dự phòng thông minh có giới hạn**: rõ URL đang dùng, quay lại nguồn chính | Không vòng lặp; không thử URL không được phép | Nghiên cứu |
| 11 | **So sánh cập nhật M3U**: trước/sau thêm, mất, đổi logo, đổi URL | Chỉ xem preview; không ghi đè trước xác nhận | Nghiên cứu |
| 12 | **Undo cấu hình nguồn**: khôi phục thao tác nguồn gần nhất | Backup tại máy, không mất dữ liệu vừa thêm | Nghiên cứu |
| 13 | **Danh sách kênh cần kiểm tra**: kênh lỗi nhiều lần, ưu tiên thủ công | Không tự ping hàng loạt; loại dữ liệu nhạy cảm | Nghiên cứu |
| 14 | **Gợi ý ghép EPG có độ tin cậy** và bước xác nhận | Không tự ghép sai kênh/EPG, hiển thị đối chiếu | Nghiên cứu |
| 15 | **DVR kiểm tra xung đột** giữa lịch ghi và giới hạn thiết bị | Phát hiện đụng giờ, báo quyền ghi và bộ nhớ | Nghiên cứu |
| 16 | **Tập đang chiếu** từ EPG thực: khám phá chương trình cùng series | Không suy diễn tập từ tên kênh | Nghiên cứu |
| 17 | **Điều khiển bằng bàn phím/remote**: bố cục phím, undo, phím được cá nhân hóa | Không trùng phím hệ điều hành, tương thích focus | Nghiên cứu |
| 18 | **Chẩn đoán tải máy khi xem**: FPS/drop frame/buffer đúng từ player | Tách đo thực và ước lượng, không tuyên bố AI upscale | Nghiên cứu |
| 19 | **Hồ sơ phụ đề/TTS**: chế độ lưu cho từng nhu cầu và ngôn ngữ | Tắt hoàn toàn khi tắt video, không đọc bù | Nghiên cứu |
| 20 | **Intelligence tùy chọn offline**: phân nhóm/gợi ý dùng mô hình cục bộ tải sẵn có | Chạy không AI ở Standard, tách tải model, chỉ dùng metadata nguồn hợp pháp | Nghiên cứu |

Ưu tiên: 01–07 trải nghiệm hàng ngày; 08–15 sự ổn định và kiểm soát nguồn; 16–20 nâng cao. Thứ tự chỉ là mục tiêu, có thể hoán đổi nếu kiểm tra mã chứng minh trùng chức năng, thiếu quyền hoặc rủi ro cao.

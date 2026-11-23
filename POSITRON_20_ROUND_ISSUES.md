# Positron — đợt mới 20 vòng, khởi động 23/11/2026

## Baseline và quy tắc
- Chỉ nhánh `Positron`; không sửa `main`, Web, Electron ổn định, Rust/Tauri, Mobile.
- Mốc P5.1.285 / Electron 4.23.370 đã kiểm tra trên GitHub, ảnh Electron thật từ Actions 45118018946.
- Trong phiên, một tác nhân khác phát hành P5.1.286 / Electron 4.23.371 nên đợt này tiếp nối từ P5.1.286.
- Tất cả bản thử nghiệm chỉ xuất hiện tại Actions Artifacts theo `AGENTS.md`, không tạo GitHub Release.

## Vòng 01/20 — P5.1.287 / Electron 4.23.372
- Lỗi/nhu cầu: sau khi nhập JSON mô hình AI người dùng chưa có thao tác đảo ngược an toàn.
- Thay đổi: thêm nút Hoàn tác lần khôi phục AI vừa rồi, snapshot trong RAM, từ chối hoàn tác nếu trọng số tiếp tục thay đổi.
- Test: 1000 bài, 995 pass, 5 skipped, 0 fail tại Actions 45120139618; Windows x64, mac arm64, mac x64 thành công.
- Ảnh thật: `positron-p51287-ai-undo-before-1920x1080-real.png`, `positron-p51287-ai-undo-after-1920x1080-real.png`; đã trực tiếp mở kiểm tra. QA: 5/5 điều kiện hoàn tác đạt.
- Phát hiện sau ảnh: trạng thái nút và thông báo hiển thị đúng, không tràn. Tuy nhiên màn khôi phục mới chỉ so sánh số mẫu; chưa cho người dùng xem tác động dự kiến lên đề xuất kênh.
- Ghi chú: chỉ chứng minh màn hình UI/test local; chưa đo playback/GPU trên thiết bị thực.

## Vòng 02/20 — P5.1.288 / Electron 4.23.373 (ĐÃ XÁC MINH)
- Mục tiêu từ ảnh vòng 01: trước khi khôi phục, mô phỏng thứ hạng ba gợi ý bằng Logistic ML hiện tại và trong JSON.
- Mã nguồn thực + unit tests với hai mô hình đối nghịch đã đảo hạng Thể thao/Tin tức; không đưa URL vào dữ liệu preview.
- GitHub Actions 45121216213 thành công; 1001 bài test, 996 pass, 5 skipped, 0 fail; build Windows x64, Mac ARM64, Mac x64 thành công.
- Trực tiếp mở ảnh thật `positron-p51288-ai-ranking-before-1920x1080-real.png` và `positron-p51288-ai-ranking-after-1920x1080-real.png`. Bảng mới hiển thị rõ, không tràn; toàn bộ 7/7 kiểm tra QA preview true.
- Phát hiện sau ảnh: phần gợi ý Logistic ML có nhưng chưa cho biết liệu bản sao Naive Bayes sẽ làm thay đổi nhãn chủ đề của các kênh đang nhập.

## Vòng 03/20 — P5.1.289 / Electron 4.23.374 (CANDIDATE)
- Mục tiêu mới: xem trước số kênh thay đổi nhãn Naive Bayes và ví dụ nhãn trước/sau, trong mục có thể mở rộng để giữ nút Xác nhận không bị đẩy khỏi khung.
- Test yêu cầu: 2 mô hình huấn luyện đối nghịch phải đổi nhãn Phim→Tin tức; Electron dùng danh sách QA thật, chứng minh preview chỉ đọc, không phát video, không lộ URL; ảnh `positron-p51289-ai-category-before-1920x1080-real.png` / `positron-p51289-ai-category-after-1920x1080-real.png`.
- Chưa đánh dấu hoàn thành cho đến khi build Actions, QA và mở ảnh Electron thật.

## Quy tắc bắt đầu vòng 04
- Bắt đầu từ HEAD mới nhất trên nhánh Positron; đọc ảnh P289 và QA trước, tìm vấn đề/tính năng mới có ý nghĩa.
- Mỗi vòng gồm mã sửa thật, test, chụp/mở ảnh Electron, QA, tăng version, commit, Windows/Mac artifacts và báo cáo. Không tăng bộ đếm khi chỉ đổi số version.

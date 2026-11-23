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

## Vòng 02/20 — P5.1.288 / Electron 4.23.373 (CANDIDATE)
- Mục tiêu dựa trên ảnh vòng trước: thử thứ hạng gợi ý kênh trước/sau khi nạp trọng số Logistic ML, không cần thay đổi mô hình hoặc playlist.
- Bộ test yêu cầu: hai mô hình đối nghịch phải đảo hạng Thể thao/Tin tức, không lộ URL, preview chỉ đọc; Electron phải chụp `positron-p51288-ai-ranking-before-1920x1080-real.png` và `positron-p51288-ai-ranking-after-1920x1080-real.png`, xác minh không phát luồng, không tràn.
- Chưa đánh dấu hoàn thành trước khi CI, ảnh thực và bộ cài được xác minh.

## Tiêu chí bắt đầu vòng 03
- Đọc ảnh và báo cáo QA thực tế P5.1.288; chọn một vấn đề AI/UX mới có ý nghĩa, không đếm đổi màu hay tăng version.
- Tính đầy đủ: một thay đổi mã hữu ích, test, Electron screenshot, trực tiếp mở ảnh, commit, Actions, installer và báo cáo.

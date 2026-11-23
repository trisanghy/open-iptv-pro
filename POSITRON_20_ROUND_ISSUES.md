# POSITRON 20 ROUND ISSUES — ĐỢT MỚI TỪ P5.1.336

- Baseline đã kiểm tra: P5.1.336, app 4.23.421, code commit 854c274c7796d8e35ac772c3afb57591c4dbebb3, HEAD tài liệu 5312f0d5342798621c904965d783bf559a1c8eb3.
- Bằng chứng baseline: GitHub Actions 45261280987, artifact positron-fast-round 14859314068; đã mở PNG Electron thật 1920x1080 và 720x900; audit P336 khẳng định focus J/K 2/3, không tràn, không autoplay; chỉ kênh synthetic QA.
- Vấn đề 01 [vừa, xác minh bằng đọc mã]: Badge Gợi ý N/M chỉ đổi khi Alt+Shift+J/K, không cập nhật khi di chuyển focus bằng Tab / chuột / remote; có thể công bố sai vị trí. Repro: nhấn J (1/3), chuyển focus sang nút Xem ở thẻ 2 bằng Tab, nhãn vẫn 1/3. Nguyên nhân: thiếu focusin delegation. Tiêu chí: focus/card badge đồng bộ, không phát kênh, không thay M3U/model; hình 1920 và 720.
- Bản sửa dự kiến P337: renderer/positron-intelligence.js, tests/positron-intelligence.test.cjs, scripts/positron-337-audit.cjs; trạng thái CANDIDATE chưa tính hoàn tất trước khi CI/ảnh.
- Đợt 20 vòng không được đánh dấu hoàn tất theo số commit; vòng tiếp theo chỉ được chọn từ lỗi/tính năng còn tồn và kết quả ảnh thực của P337.
- Hạn chế: chưa kiểm chứng stream IPTV, GPU, DVR, AirPlay/Cast trên thiết bị thật; tag và release Stable không tự động phát hành.

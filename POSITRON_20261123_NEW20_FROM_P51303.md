# Positron — Đợt 20 vòng MỚI từ P5.1.303 (23/11/2026)

- Scope: duy nhất nhánh `Positron`, không force-push, không sửa stable/main/Web/Rust/Mobile.
- HEAD baseline đã xác minh: `cdbd7afe51d5c6249d237cc9837182d708ff633b`, `4.23.388`, P5.1.303.
- Baseline Actions: https://github.com/trisanghy/open-iptv-pro/actions/runs/45152927137, test/capture/build Windows x64 & macOS arm64/x64 thành công, release bị skip.
- Ảnh P303 đã mở trực tiếp: `positron-p51303-risk-only-before-1920x1080-real.png` / `positron-p51303-risk-only-after-1920x1080-real.png`, từ artifact 14807797337. SHA256 sau: `aa670dd65217f0ad4dbeda95aa6e119b619972ed8ef8409bc88c396223900bea`.
- QA đã kiểm tra trong `audit-p5-20-rounds.json`: qa303 9/9 true. Đây là phiên bản cũ, không tính là vòng mới.

## Vòng 01 — P5.1.304 / Electron 4.23.389 — CANDIDATE
- Vấn đề: đánh giá độ bao phủ có thể vẫn cao nhưng một loạt kênh đổi sang CHỦ ĐỀ SAI khi khôi phục mô hình Naive Bayes, cần xem chuyển nhãn A → B trước khi áp dụng.
- Triển khai: `previewCategoryTopicShifts` (ma trận đổi chủ đề sau mô phỏng); hiển thị các cặp nhãn và tối đa 2 tên kênh mẫu/cặp; cảnh báo riêng khi >=5 kênh và >=20% số kênh cả hai mô hình còn chắc chắn, với mẫu tối thiểu 10. Không gửi URL, không sửa mô hình/playlist.
- Kiểm thử đã thêm: Node test hai mô hình huấn luyện ngược 18 kênh, vẫn có coverage nhưng 18 lần đổi chủ đề; UI/CDP mới `qa304`, ảnh Electron 1920×1080 `positron-p51304-topic-shifts-before-1920x1080-real.png` / `...after...`.
- CI run 45156986359: Node 1013 pass/5 skipped/0 fail, Windows/Mac ARM/x64 build success, nhưng Electron capture FAIL tại P289 `showForecast=false` vì thêm nested details làm khung dự báo vượt khỏi viewport. Ảnh P289 before/after trong artifact 14809132642 đã mở và đối chiếu P303.
- QA repair 1: tách ma trận thành sibling; chạy lại Actions 45158560556, P289–P303 PASS nhưng P304 không thể cuộn tới summary vì đặt sau phần chi tiết dài.
- QA repair 2: dời summary ma trận lên TRƯỚC các chi tiết P289 và thêm preflight đo DOM/computed style, giữ đầy đủ assertion.
- QA repair 3 (23/11): P303 đóng WatchFlow trước P304; CDP preflight xác minh phần tử P304 tồn tại nhưng rect 0×0 do cha `#poWatchFlowPanel[hidden]`. Giữ bảng mở đến sau ảnh/QA P304, thêm assert panelVisible + geometry và test hồi quy vòng đời. Chưa coi là vòng mới; chờ CI và mở ảnh.
- Điều kiện hoàn tất: CI mới xanh, mở xem trực tiếp hai PNG P304, kiểm tra QA, tính ổn định; chờ kết quả trước khi đánh dấu ĐẠT.
- Các vòng 02–20: chưa triển khai; không được tính vòng bằng ảnh QA sẵn có.

## Cảnh báo
- Release Positron có thể bị skip để giữ danh sách Release chỉ có Stable. Khi không có Release riêng, chỉ dẫn link Actions artifact có thật, không nói đã phát hành stable.
- Chưa xác minh live video, GPU, audio, DVR, Cast trên máy vật lý.

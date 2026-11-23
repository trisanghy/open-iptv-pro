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

## Vòng 03/20 — P5.1.289 / Electron 4.23.374 (ĐÃ KIỂM CHỨNG CI + MỞ ẢNH)
- Mục tiêu mới: xem trước số kênh thay đổi nhãn Naive Bayes và ví dụ nhãn trước/sau, trong mục có thể mở rộng để giữ nút Xác nhận không bị đẩy khỏi khung.
- Test yêu cầu: 2 mô hình huấn luyện đối nghịch phải đổi nhãn Phim→Tin tức; Electron dùng danh sách QA thật, chứng minh preview chỉ đọc, không phát video, không lộ URL; ảnh `positron-p51289-ai-category-before-1920x1080-real.png` / `positron-p51289-ai-category-after-1920x1080-real.png`.
- Chưa đánh dấu hoàn thành cho đến khi build Actions, QA và mở ảnh Electron thật.

## Quy tắc bắt đầu vòng 04
- Bắt đầu từ HEAD mới nhất trên nhánh Positron; đọc ảnh P289 và QA trước, tìm vấn đề/tính năng mới có ý nghĩa.
- Mỗi vòng gồm mã sửa thật, test, chụp/mở ảnh Electron, QA, tăng version, commit, Windows/Mac artifacts và báo cáo. Không tăng bộ đếm khi chỉ đổi số version.

## Vòng 04/20 — P5.1.290 / Electron 4.23.375 (ĐÃ XÁC MINH)
- Phát hiện qua ảnh Electron P289: mở rộng chi tiết Naive Bayes khiến nút Xác nhận khôi phục AI nằm ngoài vùng nhìn thấy của bảng WatchFlow.
- Sửa: nút xác nhận theo vùng cuộn bằng sticky, vẫn chỉ hiện sau khi chọn file hợp lệ. Không tự nhập trọng số.
- QA: ảnh trước/sau cùng trạng thái trên Electron thật, đo hình học nút, sự khác biệt PNG, dữ liệu AI, playlist và kênh phát không đổi.
- Bằng chứng dự kiến: `positron-p51290-confirm-sticky-before-1920x1080-real.png` / `positron-p51290-confirm-sticky-after-1920x1080-real.png`.
- Xác minh: GitHub Actions 45125073609 hoàn tất; test 998 pass, 5 skipped, 0 fail; Windows x64, Mac ARM64, Mac x64 và capture success. Đã tải và trực tiếp MỞ hai ảnh Electron P290; QA riêng 8/8 true; nút Xác nhận luôn hiện khi xem chi tiết.

## Vòng 05/20 — P5.1.291 / Electron 4.23.376 (ĐÃ XÁC MINH)
- Phát hiện từ ảnh P290: dự báo 167 kênh “đổi nhãn” nhưng thực chất phần lớn chuyển từ có nhãn đủ chắc chắn sang “Chưa đủ chắc chắn”; thuật ngữ cũ gộp đổi chủ đề với đổi độ chắc chắn, dễ gây hiểu sai.
- Tính năng AI mới: đếm riêng số kênh chuyển giữa hai chủ đề đủ chắc chắn, số kênh mới đạt ngưỡng dự báo, và số kênh mất ngưỡng dự báo; tổng thay đổi vẫn giữ tương thích với kết quả trước.
- Regression: unit đối chứng ba tình huống có nhãn→nhãn, chưa chắc chắn→có nhãn, có nhãn→chưa chắc chắn; Electron chụp trước/sau giao diện, đo tính nhất quán bộ đếm, nội dung và bảo toàn playlist, mô hình, playback.
- Ảnh dự kiến: `positron-p51291-confidence-before-1920x1080-real.png` / `positron-p51291-confidence-after-1920x1080-real.png`.
- Xác minh: Actions 45126649753 thành công; 999 test pass, 0 fail, 5 skipped; Windows x64, Mac ARM64, Mac x64 và Electron capture xanh. Đã tải/MỞ hai ảnh, QA riêng 10/10 true; số thực nghiệm 0 kênh đổi hai chủ đề, 2 mới đủ chắc chắn, 165 không còn đủ chắc chắn.

## Vòng 06/20 — P5.1.292 / Electron 4.23.377 (CANDIDATE)
- Đầu vào từ ảnh P291: một bản sao Naive Bayes khiến độ bao phủ phân loại đủ chắc chắn giảm mạnh từ 165/180 xuống 2/180, nhưng không có cảnh báo nổi bật trước khi người dùng xác nhận nhập mô hình.
- Tính năng mới: ước tính độ bao phủ trước/sau nhập mô hình theo mẫu tối đa 180 kênh; cảnh báo có ngữ nghĩa role=alert khi suy giảm ít nhất 20 điểm %, mẫu từ 10 kênh và phân loại hiện tại có ít nhất 5 kênh. Không coi số này là độ chính xác ML hay chất lượng stream.
- Node regression: so sánh mất bao phủ mạnh, không thay đổi, và tăng bao phủ; kiểm tra không làm lộ M3U/URL.
- Electron QA: chụp trước/sau cảnh báo thật, role và chữ có nghĩa, giữ nút xác nhận, playlist, model và playback bất biến.
- Ảnh dự kiến: `positron-p51292-ai-risk-before-1920x1080-real.png` / `positron-p51292-ai-risk-after-1920x1080-real.png`.
- Chưa hoàn thành đến khi CI + screenshot thực + mở soát ảnh đạt.

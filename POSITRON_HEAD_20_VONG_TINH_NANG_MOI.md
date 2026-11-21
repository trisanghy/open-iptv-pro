# HEAD BẤT BIẾN — POSITRON: 20 VÒNG / 20 TÍNH NĂNG MỚI / 20 PHIÊN BẢN

> **MỖI LẦN NGƯỜI DÙNG GỬI FILE KHỞI CHẠY = YÊU CẦU HOÀN THÀNH ĐỦ 20 VÒNG TÍNH NĂNG MỚI LIÊN TIẾP, MỖI VÒNG MỘT BẢN VÁ VÀ ẢNH ELECTRON THẬT.** Không hỏi lại quyền đã cấp. Quy định này được ưu tiên trước hồ sơ lịch sử và những hướng dẫn chỉ thiên về sửa lỗi hoặc chụp ảnh kiểm thử.

## Quy tắc cứng mỗi lần chạy

1. **Bắt đầu từ HEAD mới nhất** của repo `trisanghy/open-iptv-pro`, duy nhất nhánh `Positron`; xác minh `package.json`, phiên bản, Actions, release, ảnh Electron và các chức năng có thật. Không quay về nhãn phiên bản trong hồ sơ bàn giao.
2. **Mỗi đợt = 20 vòng mới** (01→20), mỗi vòng phải bổ sung **MỘT TÍNH NĂNG THỰC SỰ MỚI CÓ THỂ THAO TÁC ĐƯỢC** trong ứng dụng, không trùng tính năng hiện có. Đổi CSS, icon, màu, khoảng cách, chữ, phiên bản, báo cáo hoặc chỉ thêm test không đủ điều kiện tính một vòng.
3. **Mỗi vòng hoàn chỉnh tuần tự:** (a) đọc ảnh thật và QA của vòng trước; (b) nghiên cứu nhu cầu người xem; (c) sửa/viết mã thật; (d) thêm/chạy regression; (e) chạy Electron thật và thao tác chức năng; (f) chụp `round-NN-before-real.png` và `round-NN-after-real.png` cùng ảnh trạng thái chức năng khi cần; (g) **mở và xem ảnh sau bằng mắt**, phát hiện lỗi cho vòng sau; (h) tăng riêng phiên bản app, nhãn P, commit mới; (i) xác minh Actions + Release + EXE Windows x64 và macOS DMG; (j) báo cáo ảnh, SHA, link; **chuyển ngay sang NN+1**.
4. **Không nhầm 70 screenshot checks với 20 vòng tính năng.** Một workflow test 70 trạng thái vẫn chỉ có thể minh chứng một phiên bản. Không gộp 20 ý tưởng thành một commit hoặc nhảy 20 số version bằng script.
5. **Ảnh từng vòng phải là PNG từ ứng dụng Electron thật** (Playwright/CDP/Xvfb hoặc máy thật). Cấm lấy mockup/AI/ảnh vòng cũ để nhận là mới. Đối chiếu thật: focus, controls, layout, theme, 450/600/960/1360px khi thích hợp; xác nhận tính năng hoạt động, không chỉ xuất ảnh.
6. **Dữ liệu và quyền:** giữ playlist M3U, Favorites, EPG, DVR, Timeshift, Captions/TTS, Cast/PiP, lựa chọn, sự đồng ý truy cập nguồn; không tự tìm/đọc stream ngoài quyền; không đổi dữ liệu riêng, không giả AI/EPG. Mọi gợi ý local-first, đồng bộ tùy chọn.
7. **Ưu tiên tính năng mới trước sửa giao diện.** Chỉ ưu tiên sửa lỗi cấp bách khi làm hỏng playback/audio, quyền riêng tư, dữ liệu, chức năng vừa thêm hoặc đang chặn CI/release; sửa trong cùng vòng mà không đếm vòng đổi màu/bug vặt là một tính năng mới.
8. **Bảo toàn Git:** commit mới mỗi vòng trên `Positron`, kiểm tra HEAD trước push, `expected_sha`, `force:false`; không đụng `main`, Electron gốc, Web, Rust/Tauri, Mobile; không xóa/đổi tag đã tồn tại; không tạo nhánh thừa.
9. **Trạng thái:** `CANDIDATE` nếu thiếu ảnh Electron, ảnh chưa được mở kiểm tra, test lỗi, Actions chưa thành công, hay thiếu installer/release. Chỉ tính `HOÀN THÀNH` khi đủ chuỗi bằng chứng từng vòng.
10. **Không dừng sau vòng đầu** khi công cụ còn khả năng. Sau báo cáo 01/20 phải chạy 02/20 → 20/20 ngay trong phiên; không yêu cầu người dùng nhắn lệnh mới cho từng vòng. **Không chạy nền giả**: nếu giới hạn thực tế ngắt phiên, ghi checkpoint còn thiếu, HEAD cuối, ảnh/CI/commit và số vòng thật rồi tiếp tục từ đó trong lượt được giao. Không sử dụng số phút làm mục tiêu; 40 phút chạy không có 20 vòng vẫn là chưa đạt.
11. **Công bố tiếng Việt:** mỗi phiên bản một dòng trên `docs/positron-features/FEATURES.md`, bấm mở mô tả và ảnh thật của chính phiên bản; link commit, test, release thực đã xác minh; không can thiệp GitHub Pages nhánh `web/online`.
12. **Đích cuối:** báo cáo 20 dòng có tên tính năng, 20 commit riêng, 20 version riêng, 20 cặp ảnh trước/sau đã thực sự mở soát, QA và đường tải được xác minh. Nếu chỉ 01/20 thì phải nói rõ 01/20, không đổi cách đếm.

## Mẫu báo cáo áp dụng sau MỖI vòng

```text
VÒNG NN/20 — P5.1.xxx / Electron v4.23.xxx — [TÊN TÍNH NĂNG MỚI]
HEAD/ảnh trước đã xem: ...
Nhu cầu và hành động của người dùng: ...
Mã nguồn + kiểm thử hồi quy + kiểm thử UI: ...
Ảnh TRƯỚC: [PNG thật có tồn tại]
Ảnh SAU: [PNG thật đã mở xem, chứng minh chức năng]
Bài học từ ảnh SAU và đầu vào cho vòng tiếp theo: ...
Commit / Actions / Release / Windows EXE x64 / Mac DMG: ...
Trạng thái: CANDIDATE | HOÀN THÀNH
Tiến độ đợt: NN/20; vòng NN+1 tiếp tục ngay nếu có công cụ
```

## Checkpoint tham khảo ngày 22/11/2026 — KHÔNG phải HEAD hiện hành

- P5.1.136 / v4.23.220: tính năng Enter chọn nhanh kết quả tìm kiếm đã có Release, CI thành công và ảnh Electron trước/sau.
- P5.1.137 / v4.23.221: tính năng duyệt thẻ kênh bằng mũi tên đã có mã nguồn; cần xác minh CI/Release/ảnh trước khi tính hoàn thành.
- Khi **tiếp nối đợt trước** bắt đầu từ P5.1.135: 136 là vòng 01, 137 là vòng 02 nếu đủ bằng chứng; còn vòng 03–20 phải có tính năng thật. Khi **người dùng gửi file mới để tạo đợt mới**, lấy HEAD hoàn tất mới nhất và bắt đầu một đợt mới riêng, không lấy vòng lịch sử làm vòng mới.

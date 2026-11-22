# POSITRON — Nhật ký tiếp nối 20 vòng sau P5.1.150

**Lập từ kết quả đã kiểm tra trong phiên 22/11/2026.** Chỉ nhánh `Positron`; không sửa main hoặc các nhánh Electron/Rust/Web/Mobile. Không ghi đè tag, không force-push. Baseline P5.1.150 / Electron 4.23.234 (commit release `73ecdec3a25b805e791c2e8d48b5fc286fe72ac0`). Mỗi vòng cần thay đổi thực, regression, Electron screenshot trước/sau mở bằng mắt, commit riêng. Không lẫn nhãn P5.1.N với app SemVer.

| Vòng mới | Nhãn | Ứng dụng | Thay đổi chức năng | Ảnh thật & QA | CI/Release |
|---|---|---|---|---|---|
| 01 | P5.1.151 | 4.23.235 | Nhật ký 30 thông báo trong RAM, giữ cảnh báo/lỗi | 2 ảnh 1920×1080 mở; 14/14 QA | 6/6; Release `positron/v4.23.235-p5.1.151` đã xác minh |
| 02 | P5.1.152 | 4.23.236 | Lọc nhật ký theo tất cả/cảnh báo/lỗi/thành công | 2 ảnh mở; 12/12 QA | 6/6; Release `positron/v4.23.236-p5.1.152` đã xác minh |
| 03 | P5.1.153 | 4.23.237 | Tìm nhật ký tiếng Việt không dấu | 2 ảnh mở; 14/14 QA | Test+capture+build thành công; GitHub Release HTTP 403, chỉ Actions fallback |
| 04 | P5.1.154 | 4.23.238 | Không làm phiền chỉ ẩn banner thành công | 2 ảnh mở; 15/15 QA | Test+capture+build thành công; GitHub Release HTTP 403, chỉ Actions fallback |
| 05 | P5.1.155 | 4.23.239 | Dọn banner nổi mà vẫn giữ nhật ký | 2 ảnh mở; 10/10 QA | 6/6; Release `positron/v4.23.239-p5.1.155` đã xác minh |
| 06 | P5.1.156 | 4.23.240 | Bảng phân tích thư viện kênh cục bộ | 2 ảnh mở; 20/20 QA, 561 kênh QA, 2 nguồn, 12 nhóm | Test+capture+build thành công; GitHub Release HTTP 403 |
| 07 | P5.1.157 | 4.23.241 | Phân bố kênh theo nhóm trong Library Pulse | Mục tiêu chụp ảnh Electron thật `positron-p51157-groups-before/after-1920x1080-real.png` | Test pass sau sửa đồng bộ phiên bản; ảnh/Release phải kiểm tra trước khi kết luận |

## Bằng chứng
- P151: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.235-p5.1.151
- P152: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.236-p5.1.152
- P153: https://github.com/trisanghy/open-iptv-pro/actions/runs/44968623994/artifacts/14733550437 (fallback cài đặt/ảnh)
- P154: https://github.com/trisanghy/open-iptv-pro/actions/runs/44969051299/artifacts/14732529851 (fallback)
- P155: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.239-p5.1.155
- P156: https://github.com/trisanghy/open-iptv-pro/actions/runs/44970204577/artifacts/14733561649 (fallback)
- P157: https://github.com/trisanghy/open-iptv-pro/actions/runs/44970820752 (test/capture/build, xem trạng thái trước khi nhận đạt)

## Các vấn đề đang mở
1. **GitHub Release 403 (ưu tiên cao, phạm vi GitHub token):** `gh release create` đôi lúc trả `Resource not accessible by integration`; 153, 154, 156 chưa có Release, mặc dù bộ cài nằm trong artifact. Không coi CI xanh có fallback là phát hành thành công. Chủ repository cần xem quyền Actions token `contents: write` hoặc cấp credential phù hợp. Không tái sử dụng tag cũ khi chưa kiểm chứng.
2. **Kiểm thử thực tế luồng IPTV:** CI chỉ xác minh Electron UI và Node tests. Chưa kết luận được live stream, audio, GPU, Cast, Timeshift, DVR trên phần cứng thật.
3. **Đồng bộ phiên bản toàn bộ repo:** Khi tăng app SemVer phải sửa nhãn sidebar, `renderer/index.html`, `BUILD_WINDOWS.bat`, PowerShell, 5 test pin phiên bản và tag workflow; nếu thiếu sẽ gây test fail. Không giảm assert hoặc bỏ test.
4. **Tiếp tục từ P5.1.157 hoặc bản cao hơn thực tế:** Trước mọi commit đọc HEAD hiện tại, `package.json`, Actions, 2 ảnh Electron của bản mới nhất và lỗi QA. Nếu có commit đồng thời, làm trên HEAD mới, `expected_sha`, `force:false`.

## Quy tắc đếm
Không đánh dấu phát hành hoàn tất khi Release không tồn tại. **Vòng triển khai/QA** được ghi theo bằng chứng; **vòng đã phát hành đầy đủ** chỉ P151, P152, P155 tại thời điểm ghi. Các vòng còn lại giữ trạng thái chờ quyền công bố. Ảnh phải là Electron thật, tuyệt đối không dùng mockup/ảnh AI thay thế bằng chứng.

_(Checkpoint tĩnh; kiểm tra lại GitHub API để biết tiến độ sau khi file được tạo.)_

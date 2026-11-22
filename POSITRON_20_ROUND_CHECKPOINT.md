# CHECKPOINT POSITRON — 22/11/2026 — 03/20 VÒNG THẬT

**Repo:** `trisanghy/open-iptv-pro` — nhánh duy nhất được sửa `Positron`.
**Trạng thái được chứng minh:** 3 phiên bản mới, 3 sửa/thêm chức năng độc lập, mỗi vòng có Node test, real-Electron before/after, soát ảnh bằng mắt, commit và GitHub Release bất biến.
**Phiên bản cuối:** P5.1.170 / app `4.23.255`; tag `positron/v4.23.255-p5.1.170`; GitHub Actions **44986538072** 6/6 jobs success.
**Commit mã nguồn cuối:** `b577e4d1bfa84bab81209ca0fec6e5b1e295998c`. Nhánh HEAD khi lập tài liệu là `2cd8a55ee17006bf4f975a86cf50e6d7515e526a` (commit bot cập nhật tài liệu sau release); phải xác minh HEAD mới nhất trước mọi thao tác, không mặc định HEAD tài liệu này còn hiện hành.
**Vòng tiếp theo:** 04/20 → P5.1.171, SemVer có thể là 4.23.256 **nếu thật sự chưa sử dụng**. Còn 17 vòng chưa làm; tuyệt đối không coi là đã hoàn tất 20/20.

## Bàn giao kết quả đã đạt

| Vòng | Nội dung thay đổi thật | Node test | QA ảnh Electron | Commit phát hành | Workflow |
|---|---|---|---|---|---|
| 01 P5.1.168 | Sửa thanh phân trang cuối popup bị che, đưa lên trước danh sách cuộn | 808 pass/0 fail/5 skip | 7/7; trước P5.1.167 và sau P5.1.168 đã mở | `14265297ee9e49a053ec8e0440d9dfaddde59641` | [44985148784](https://github.com/trisanghy/open-iptv-pro/actions/runs/44985148784) |
| 02 P5.1.169 | Thêm bộ lọc tình trạng mã EPG cho kênh thiếu logo, CSV bám kết quả lọc | 809 pass/0 fail/5 skip | 13/13; P169 trước/sau đã mở | `c4ecb019b4eb7863a919491b8865666699e25d79` | [44986000752](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986000752) |
| 03 P5.1.170 | Thêm một nút xóa năm bộ lọc, không thay playlist và trả focus đúng | 810 pass/0 fail/5 skip | 13/13; P170 trước/sau đã mở | `b577e4d1bfa84bab81209ca0fec6e5b1e295998c` | [44986538072](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986538072) |

**Release mới nhất:** https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.255-p5.1.170
- Windows Setup: https://github.com/trisanghy/open-iptv-pro/releases/download/positron/v4.23.255-p5.1.170/Open-IPTV-Pro-Setup-4.23.255-x64.exe
- Windows Portable: https://github.com/trisanghy/open-iptv-pro/releases/download/positron/v4.23.255-p5.1.170/Open-IPTV-Pro-4.23.255-x64.exe
- Mac ARM: https://github.com/trisanghy/open-iptv-pro/releases/download/positron/v4.23.255-p5.1.170/Open-IPTV-Pro-4.23.255-mac-arm64.dmg
- Mac Intel: https://github.com/trisanghy/open-iptv-pro/releases/download/positron/v4.23.255-p5.1.170/Open-IPTV-Pro-4.23.255-mac-x64.dmg
- Release có `Positron-P51170-20-Real-Screenshots.zip`, 50 P4 snapshots, SHA256SUMS, source ZIP, audit JSON.

## Đầu vào vòng tiếp theo
Ảnh P170 sau sửa: `p5-20-rounds/positron-p51170-clear-filters-after-1920x1080-real.png` trong bộ ZIP screenshot của Release P5.1.170. Hình đã được xem trực tiếp, cho thấy popup Thư viện với tìm kiếm, nhóm, EPG, sắp xếp, 10 kênh/trang, nút Xuất CSV và phân trang `Trang 1 / 57`. Cơ hội tính năng P171: bổ sung nhãn phạm vi kết quả đang xem (ví dụ 1–10 / 561), hữu ích với kho kênh lớn; đây **chỉ là đề xuất để nghiên cứu**, không phải bug xác nhận trước khi xem lại HEAD/ảnh.
Nếu ảnh hay test mới cho thấy lỗi quan trọng hơn, ưu tiên sửa lỗi đó.

## Quy tắc bắt buộc để tiếp tục
1. Đọc lại file yêu cầu 20 vòng người dùng đính kèm, nhất là điều kiện mỗi vòng sửa mã/test/chụp/mở PNG/tăng phiên bản/commit và không nhầm vòng QA với vòng nâng cấp.
2. Xác minh HEAD Positron, `package.json`, tags/releases, Actions, screenshot artifact mới nhất. Không dùng mốc lịch sử P5.1.170 nếu nhánh đã tiến hơn.
3. **Chỉ sửa Positron**, không force push, kiểm soát expected_sha, không tạo nhánh mới; tag/release bất biến.
4. Vòng 04 phải đọc PNG P170 sau sửa, quyết định một cải tiến có ích, sửa nguồn và test regression, chụp PNG trước/sau từ Electron thật, mở ảnh sau để soát, push và CI build/release đủ EXE/DMG; chỉ khi đạt mới ghi 04/20.
5. Báo tiếng Việt; checkpoint sau mỗi vòng. Không bịa file build, ảnh, số vòng hay test trên thiết bị thực. Bảo toàn M3U, Favorites, EPG, Timeshift, DVR, AI phụ đề/TTS, Cast/PiP, các cài đặt.

Các báo cáo chi tiết: `POSITRON_20_ROUND_ISSUES.md` mục “Đợt mới 22/11/2026”; `POSITRON_P5_CHANGELOG.md` mục P5.1.168–P5.1.170. Chưa có kết quả cho vòng 04–20 và không có việc nền sau khi phiên chat kết thúc.

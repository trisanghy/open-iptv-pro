# CHECKPOINT — Đợt 20 vòng Positron mới, ngày 22/11/2026

**Tình trạng thực:** 01/20 vòng hoàn thành đủ điều kiện; 01 vòng mới P5.1.158 đã sửa/test/ảnh/build thành công nhưng **CHƯA phát hành do GitHub Actions HTTP 403**, không được tính. Không tự ghi 02/20 hoặc 20/20.

## Quy tắc
- Repository: `trisanghy/open-iptv-pro`; **chỉ** nhánh `Positron`. Không sửa main/nhánh Electron gốc/Web/Rust/Mobile; không force-push; không di chuyển tag/release cũ.
- Tại mỗi lần tiếp tục, xác minh HEAD, tag, Release, Actions hiện tại. Lấy bản tiến bộ nhất thực tế, không dùng version trong file làm giá trị mặc định.
- Mỗi vòng cần: ảnh Electron thật **mở nhìn**, lỗi/nhu cầu từ ảnh trước; sửa mã mới, regression, Electron UI QA/real before-after PNG 1920×1080, nhận xét ảnh, version/commit và kiểm tra Release/installer. Không dùng mockup, JSON hoặc CI xanh thay cho việc nhìn ảnh.
- Giữ dữ liệu playlist/Favorites/EPG/Cast/PiP/audio, không tự truyền URL stream lên mạng; không nhận các bài QA synthetic là thử playback thật.

## Baseline mở đầu
- HEAD P5.1.156 `e124df2c3230584f5642674051a4a6dda87f8837`, v4.23.240. Đã trực tiếp xem PNG Electron `positron-p51156-library-pulse-after-1920x1080-real.png`. Dữ liệu QA: 561 kênh, 2 nguồn, 12 nhóm, không logo, tất cả có tvgId, không có bằng chứng phát thử.
- Actions P156 `44970204577`: test, capture, 3 build pass, Release failed HTTP 403. Không tính vào đợt 20 vòng mới.

## Vòng 01/20 — P5.1.157 (HOÀN THÀNH)
- **Tính năng:** Phân bố kênh theo nhóm với số lượng, thanh tỷ lệ, mở thêm 5 nhóm mỗi lần trong Library Pulse.
- **Nguồn ảnh:** Ảnh P156 cho thấy chỉ có số nhóm tổng, thiếu phân bố trực quan.
- **Code:** `renderer/positron-library-pulse-core.js`, `.js`, `.css` và JS QA/tests tương ứng. Feature commit `c709ad40eb079ed9acc45420b9e60f7ca4b47a3e`; các commit sửa đồng bộ tag, nhãn, regression dẫn tới HEAD phát hành `ca549834c5d2cdee64ecc6b7a8feb75f1be0e51c`.
- **Test:** 790 tổng / 785 đạt / 5 bỏ qua / 0 lỗi.
- **Electron:** Ảnh thật đã trực tiếp mở ở 1920×1080, no overflow, nhóm 432/105/15 + nhóm con hiển thị; panel có thanh cuộn khi danh sách dài.
  - [Trước](docs/positron-features/screenshots/positron-p51157-groups-before-1920x1080-real.png)
  - [Sau](docs/positron-features/screenshots/positron-p51157-groups-after-1920x1080-real.png)
- **Build và Release:** 6/6 jobs success tại https://github.com/trisanghy/open-iptv-pro/actions/runs/44970820752; tag bất biến `positron/v4.23.241-p5.1.157`. Release xác minh có Windows Setup x64 + Portable x64, Mac arm64/x64, source, ảnh ZIP, SHA256SUMS: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.241-p5.1.157

## Vòng 02/20 — P5.1.158 (CHƯA HOÀN THÀNH, BLOCKER RELEASE)
- **Tính năng:** Đọc metadata 561 kênh QA thiếu logo qua danh sách 10 kênh/trang, có Trước/Tiếp, 57 trang; không quét mạng, không sửa playlist.
- **Nguồn ảnh:** P157 after cho thấy 0/561 logo metadata. Đây là vấn đề cần xử lý có ích.
- **Lỗi Electron thực được phát hiện và sửa:** QA ban đầu P158 fail `focusRestored=false` khi bấm Escape từ trang 2 danh sách. Đã sửa `hide(true)` trong `renderer/positron-library-pulse.js` và thêm regression. Commit sửa `2bc1e0ee731cf586b2832752c7ddec50c0600f72`.
- **Test đã xác minh:** Node 793 tổng / 788 pass / 5 skipped / 0 fail; Electron capture success; Windows Setup/Portable x64, macOS Intel/ARM build success.
- **Ảnh đã mở xem trực tiếp:** [Trước](docs/positron-features/screenshots/positron-p51158-missing-logos-before-1920x1080-real.png), [Sau](docs/positron-features/screenshots/positron-p51158-missing-logos-after-1920x1080-real.png). Ảnh sau thấy rõ nhãn Kênh thiếu logo: 561 và Trang 2/57, nút Trước/Tiếp, không tràn ngang. Cần cải thiện nút Đóng/tiêu đề vì có thể cuộn mất khỏi tầm nhìn.
- **CI:** https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937. Ba job build/test/capture đều thành công, **job release lỗi HTTP 403: Resource not accessible by integration**; đã thử chạy lại job Release, lần 2 và 3 vẫn lỗi tương tự. **Không có Release/tag được xác minh cho P5.1.158**, không tuyên bố đã phát hành.
- **Artifact tải thật đã xác minh (ZIP từ Actions):**
  - Windows x64: https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14733927084
  - macOS arm64: https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14734570130
  - macOS Intel: https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14734350521
  - Toàn bộ installer + QA fallback: https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14733923359
- **Cần xử lý:** Xác minh GitHub repository/organization workflow token policy. Mặc dù job ghi `contents: write`, GitHub từ chối tạo Release (403); cần owner cấp đúng quyền GitHub Actions / token hợp lệ, hoặc dùng phương án phát hành được ủy quyền khác. Không thay tag cũ, không đăng liên kết Release không tồn tại.

## Lượt tiếp theo và các ý tưởng chưa triển khai
1. Giải quyết blocker **Release P5.1.158**; xác minh bản Setup/Portable/DMG/SHA256 và ảnh trực tiếp, rồi mới cập nhật thành 02/20.
2. Sau đó đọc lại HEAD thực, triển khai P5.1.159 nếu chưa có bản mới: thêm **tìm kênh thiếu logo theo tên và nhóm, không phân biệt dấu**, reset nhanh tìm kiếm và giữ focus; lý do: P158 sau có 57 trang, quá nhiều để dò tuần tự.
3. Cải thiện header/nút Đóng luôn nhìn thấy khi cuộn panel P158; ảnh sau cho thấy header ngoài tầm nhìn. Thêm QA geometry trên Electron thật.
4. Các vòng kế tiếp dựa vào lỗi từ ảnh của vòng ngay trước, không lên sẵn 20 phiên bản hình thức; có thể thêm lọc theo nhóm, báo cáo metadata CSV không chứa URL stream và các công cụ quản lý hợp pháp khác.

## Điểm dừng và tính trung thực
- **Số vòng hoàn thành chắc chắn: 1/20.** P5.1.158 là ứng viên với mã/ảnh/test/build thật nhưng Release bị chặn; còn ít nhất 19 vòng yêu cầu chưa chứng minh đủ (bao gồm vòng 02 chưa hoàn thành).
- Ảnh chứa dữ liệu kiểm tra synthetic; chưa xác minh IPTV live, GPU thực, AirPlay/Cast, DVR, Timeshift hay audio/video trên thiết bị người dùng.
- File này là checkpoint, không phải lệnh tự chạy nền sau khi chat kết thúc.

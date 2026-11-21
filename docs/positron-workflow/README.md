# Site quản lý nâng cấp Positron — tiếng Việt

Trung tâm theo dõi riêng nhánh **Positron** của Open IPTV Pro, không ảnh hưởng Electron Stable, Rust/Tauri, Web và Mobile.

## Chạy Site

- Mở file docs/positron-workflow/index.html từ nhánh Positron hoặc dùng web server cục bộ.
- Trong terminal chạy: python3 -m http.server 8765 --directory docs/positron-workflow
- Mở địa chỉ http://localhost:8765.
- Site cũng được đóng gói vào artifact **positron-feature-website** của workflow Positron tại thư mục positron-workflow. Không thay đổi nguồn GitHub Pages đang phục vụ Web Online.

## Dữ liệu và quy tắc

Site đọc ba nguồn ở nhánh Positron: HEAD từ API GitHub, phiên bản trong package.json, và docs/positron-features/catalog.json. Nếu các nguồn này không đọc được hoặc không khớp nhau, Site hiện **Chưa xác minh**, không tự suy đoán.

Phiên bản từ catalog chỉ là dữ liệu đọc. Sổ theo dõi mới do người quản lý nhập bao gồm: đợt/vòng, phiên bản, app version, nền tảng, commit, tag, ưu tiên, trạng thái, mô tả lỗi, nguyên nhân, cách sửa, ảnh, báo cáo, log test, log build, artefact và ghi chú.

Trạng thái: **chưa làm / đang làm / đã kiểm thử / đã hoàn thành / chưa xác minh**.

Một mục chỉ được đánh dấu đã hoàn thành khi đã nhập commit SHA đủ 40 ký tự, tag thuộc namespace Positron, đủ năm URL HTTPS (ảnh thật, báo cáo, test, build, artefact) và năm dấu kiểm xác nhận đã đối chiếu bằng chứng. Nếu thiếu, nó tự trở về **chưa xác minh**. Trạng thái **đã kiểm thử** cần URL kiểm thử và dấu kiểm đạt. Đây là kiểm tra chứng cứ do người dùng khai báo, không phải tự động chạy Electron hay xác minh SHA256 của file.

## Lưu / tiếp nối

- Dữ liệu mặc định lưu trong localStorage của chính trình duyệt; có thể **Xuất JSON** và **Nhập JSON** để sao lưu hoặc dùng máy khác.
- Tùy chọn **Đồng bộ lên GitHub** dùng fine-grained Personal Access Token với quyền Contents: Read and write cho đúng repo. Token giữ trong RAM phiên trang, không gửi tới máy chủ khác ngoài api.github.com, không nằm trong JSON, repo hay localStorage.
- Chỉ nhập token trên bản Site mà bạn tin cậy, **không nhập token trên bất kỳ trang HTML preview trung gian**.
- Ghi dữ liệu chỉ cập nhật docs/positron-workflow/data.json trên nhánh Positron với file SHA, tạo commit mới, không force-push hay sửa tag.
- Nếu phát hiện bằng chứng sai hoặc kiểm thử không còn hợp lệ, bấm **Mở lại / chưa xác minh** và lưu nguyên lịch sử chỉnh sửa.

## Cách sử dụng

1. Bấm Làm mới GitHub để đối chiếu HEAD.
2. Mở bảng Vòng nâng cấp hoặc Sổ lỗi, nhập mục mới hoặc tạo hồ sơ quản lý từ phiên bản có trong catalog.
3. Lọc theo vòng, phiên bản, nền tảng, mức ưu tiên và trạng thái.
4. Xem ảnh, báo cáo, test, log và artefact; so sánh hai phiên bản.
5. Xuất JSON, hoặc lưu GitHub có kiểm soát để tiếp tục mà không phải nhập lại toàn bộ ngữ cảnh.

**Giới hạn:** Vì GitHub Pages của repository đã được sử dụng cho Web Online, nhánh Positron không tự động ghi đè hay thay đổi nguồn Pages. Site được cung cấp trong mã nguồn và gói artifact Actions. Để có URL website công khai riêng cần hosting riêng hoặc cấu hình được chủ sở hữu phê duyệt.

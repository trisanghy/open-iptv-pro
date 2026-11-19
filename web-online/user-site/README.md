# Open IPTV Pro — User Homepage (trisanghy.github.io)

Trang này là **trang giới thiệu**, không phải trình phát IPTV. Các địa chỉ chính:

- Trang chủ: https://trisanghy.github.io/
- Trình phát: https://trisanghy.github.io/open-iptv-pro/
- Hướng dẫn: https://trisanghy.github.io/open-iptv-pro/huong-dan.html
- Mã nguồn: https://github.com/trisanghy/open-iptv-pro/tree/web/online
- Bộ cài: https://github.com/trisanghy/open-iptv-pro/releases/latest

## Một nguồn mã duy nhất

Nội dung trang chủ, ảnh Web, robots và sitemap do repository
`trisanghy/open-iptv-pro`, nhánh `web/online` quản lý.
Workflow `.github/workflows/publish-home.yml` lấy bộ tệp từ
**cùng một SHA commit**, kiểm tra canonical, các mục chính và sơ đồ URL,
sau đó triển khai bằng GitHub Pages.

Workflow chạy khi đẩy lên `main` của repository này, chạy thủ công,
và theo lịch phút 07/37 mỗi giờ. GitHub có thể trì hoãn lịch; không đồng
bộ tức thì. Không cần PAT, không truy cập dữ liệu IPTV riêng tư.

## Khởi tạo một lần

Repository cần tồn tại tại `trisanghy/trisanghy.github.io`, là repository
**Public**, nhánh mặc định `main`. Gói `openiptv-user-homepage.zip`
do GitHub Actions nhánh `web/online` tạo có sẵn `index.html`,
`robots.txt`, `sitemap.xml`, `.github/workflows/publish-home.yml`.
Workflow cố gắng tự kích hoạt Pages bằng `enablement: true`; nếu chính
sách tài khoản từ chối, bật Pages Source = GitHub Actions trong Settings.

Dự án `trisanghy/open-iptv-pro` tiếp tục xuất bản trình phát ở
`/open-iptv-pro/` mà không thay thế `index.html` bằng trang giới thiệu.

Google có thể thu thập dữ liệu qua sitemap nhưng không bảo đảm lập chỉ mục.
Người dùng tự chịu trách nhiệm đối với playlist/nội dung mình có quyền xem.

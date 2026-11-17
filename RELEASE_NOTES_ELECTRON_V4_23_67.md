# Electron v4.23.67 — Thanh điều khiển gọn và chọn phiên bản cập nhật

**Nhánh duy nhất:** `build-sources/electron-desktop`. Không tạo nhánh mới, không tác động `main`, Rust/Tauri, Web hoặc Mobile.

## Giao diện điều khiển TV

- Hàng một: bật Live Caption, Live Translate, chọn ngôn ngữ, cài đặt AI, trạng thái và menu Công cụ (Chụp ảnh/FFmpeg).
- Hàng hai: bật Giọng dịch TTS, chọn ngôn ngữ/giọng, tốc độ, âm lượng gốc và trạng thái đọc.
- Giảm kích thước các ô chọn, khoảng cách và căn chỉnh; co giãn theo độ rộng cửa sổ, không ẩn chức năng.
- Menu Công cụ không rơi xuống hàng thứ ba khi đủ không gian.

## Kiểm tra cập nhật có lựa chọn phiên bản

- Trong Cài đặt → Cập nhật phiên bản, nhấn **Kiểm tra phiên bản mới** hoặc **Danh sách**, sau đó chọn một bản trong nhóm **Ổn định** hoặc **Beta**.
- Danh sách lấy từ GitHub Releases của repository chính thức. Chỉ hiển thị file cài phù hợp kiến trúc Mac ARM64/Intel hay Windows x64, kèm SHA-256 do GitHub cung cấp hoặc file SHA256SUMS.txt.
- Cho phép tải bản cũ hoặc cài lại cùng phiên bản. Việc hạ phiên bản yêu cầu xác nhận rõ ràng và khuyến nghị sao lưu dữ liệu.
- Bản được chọn chỉ được **tải và mở thủ công** sau khi xác minh SHA-256. Không tự động cài/hạ phiên bản do việc chọn danh sách.
- Kiểm tra cập nhật nền giữ cách hoạt động cũ: chỉ tìm phiên bản mới hơn; không tự động chọn bản cũ. Kiểm tra thủ công mở danh sách cho người dùng lựa chọn.
- Các URL và tag phải được đối chiếu với danh sách chính thức đã tải trong tiến trình chính; không nhận URL cài đặt bất kỳ từ giao diện.

## Build Mac cá nhân — chỉ `.app`

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'
```

Nhánh dùng đường dẫn cố định nên các lần cập nhật sau không cần sửa lệnh. Build đọc version trong package.json, chạy npm test, tạo duy nhất Open IPTV Pro.app trong Downloads rồi mở Finder.

## Kiểm thử và hạn chế

Kiểm tra đường dẫn an toàn, phân loại stable/Beta, tương thích kiến trúc, mẫu SHA-256, lựa chọn bản cũ và không tự động cài. Kiểm thử đóng gói bảo đảm tài nguyên UI và trình cập nhật có trong app Mac. Bản Beta công khai sẽ có DMG cho Mac Apple Silicon/Intel, Windows Setup/Portable, source ZIP và SHA256SUMS.txt; chỉ tải các tệp đã được xác minh trên GitHub Release.

## Tải bản Beta v4.23.67

**[GitHub Release chính thức](https://github.com/trisanghy/open-iptv-pro/releases/tag/electron-v4.23.67)** (đây là Beta, không phải bản stable). Chọn DMG Mac ARM64/Intel hoặc EXE Windows x64 tương ứng, kiểm tra file `SHA256SUMS.txt`. Phiên bản đã tải từ GitHub Release có thể chưa được ký số/notarize; chỉ cài khi xác minh nguồn. Các phiên bản cũ vẫn có tag và Release riêng.

# Open IPTV Pro Mobile — Android & iOS

**Trạng thái xác minh: 4.23.17-mobile.10 Beta (Capacitor 8)**

- Nhánh nguồn độc lập: [`experiment/mobile-capacitor-4211`](https://github.com/trisanghy/open-iptv-pro/tree/experiment/mobile-capacitor-4211)
- Snapshot mã nguồn đi kèm `main`: [`mobile/`](../mobile/) — từ commit `53f5c590fff4026eac06c249726c6b2e75f790b3`
- Release riêng, bất biến: [`mobile/v4.23.17.10`](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10)
- Không ghi đè hoặc thay thế mã Electron (`renderer/`/`src/`), Rust Lab (`rust-lab/`) hay website (`web/`).

## Phân biệt các bản Mobile

**Native Mobile Capacitor:** chạy trong ứng dụng Android/iOS có tích hợp native player tùy môi trường. Không đồng nhất với trang Web trên trình duyệt hoặc chế độ trình duyệt giả lập.

**Web Mobile:** dùng ngay tại https://trisanghy.github.io/open-iptv-pro/?view=mobile, không cần APK/IPA. Những ảnh Web được chụp bằng Chromium giả lập không chứng minh APK/iOS native hoạt động trên thiết bị thật.

## Cài đặt Mobile Beta

### Android

1. Mở [release mobile/v4.23.17.10](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10); tải [APK debug](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/OpenIPTVPro-Mobile-4.23.17-mobile.10-debug.apk).
2. Đối chiếu [SHA256SUMS.txt](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/SHA256SUMS.txt), chỉ tin tưởng tệp từ GitHub chính thức.
3. Nếu điện thoại cho phép cài từ nguồn ngoài, cài ứng dụng kiểm thử. APK **debug-signed**, không phải bản phát hành Play Store, không tự động cập nhật từ cửa hàng.
4. Sau khi mở, chỉ nhập file M3U hoặc URL M3U bạn được cấp phép sử dụng.

### iOS / iPhone

[IPA v4.23.17-mobile.10](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/OpenIPTVPro-Mobile-4.23.17-mobile.10-unsigned.ipa) là **IPA chưa ký**. Không phải bộ cài có thể cài trực tiếp trên mọi iPhone; yêu cầu ký bằng chứng chỉ Apple hợp lệ, hồ sơ provisioning và thiết bị tương ứng. Không có xác nhận App Store hoặc TestFlight cho release này. Nếu chưa ký, hãy sử dụng [Web Online](https://trisanghy.github.io/open-iptv-pro/) hoặc tự build bằng Xcode theo điều khoản của Apple.

## Chức năng trong mã Mobile và giới hạn

Mã nguồn có các thành phần quản lý M3U, nhóm và yêu thích, danh sách gần đây, hiển thị EPG, kiểm tra luồng, chọn link phát, giao diện mobile, tùy chọn PiP và các xác nhận quyền nội dung.

**Đừng hiểu tên chức năng là bảo đảm đã hoạt động trên thiết bị thực.** Một số thành phần PiP tự động trên iOS, điều khiển màn hình khóa, phát nền, Cast/AirPlay, DRM/codec, CORS và quyền hệ thống cần kiểm chứng trên từng thiết bị. Mobile chưa có bộ FFmpeg native tương đương desktop, không có đầy đủ ghi hình/DVR/Timeshift hay tất cả tính năng AI.

## Tải xuống chính thức

- [Android APK debug](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/OpenIPTVPro-Mobile-4.23.17-mobile.10-debug.apk)
- [iOS IPA unsigned](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/OpenIPTVPro-Mobile-4.23.17-mobile.10-unsigned.ipa)
- [Source ZIP](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/OpenIPTVPro-Mobile-4.23.17-mobile.10-Source.zip)
- [SHA256SUMS.txt](https://github.com/trisanghy/open-iptv-pro/releases/download/mobile/v4.23.17.10/SHA256SUMS.txt)
- [Ảnh Android từ emulator](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10)

## Build và kiểm thử từ mã nguồn

Yêu cầu **Node.js 22+**. Trong thư mục `mobile/`:

```bash
npm ci --no-audit --no-fund
npm test
npm run build
```

Để đóng gói Android cần Android SDK, JDK phù hợp và Gradle; để build iOS cần **macOS, Xcode và quyền signing hợp lệ**. Có thể xem các script trong `mobile/` và workflow của nhánh Mobile. Việc `npm run build` chạy thành công không đồng nghĩa đã build APK/IPA native hoặc kiểm tra được PiP trên điện thoại.

## Bản quyền và dữ liệu

Open IPTV Pro chỉ cung cấp công cụ, không cung cấp kênh, gói dịch vụ, tài khoản hay quyền nội dung. Người dùng phải có quyền đối với nguồn M3U, lịch EPG và nội dung mình xem hoặc lưu; chủ động sao lưu dữ liệu. Xem [thông báo quyền sử dụng](../COPYRIGHT_NOTICE_V4_23_70.md) và [MIT License](../LICENSE). Tuyên bố miễn trừ chỉ có hiệu lực trong phạm vi pháp luật cho phép.

[Quay lại README](../README.md) · [GitHub Mobile branch](https://github.com/trisanghy/open-iptv-pro/tree/experiment/mobile-capacitor-4211)

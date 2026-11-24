# Open IPTV Pro TV Native — AVPlay cho Samsung

Đây là **ứng dụng Tizen Web độc lập**, dùng cùng giao diện và mã quản lý kênh trên nhánh `tizenbrew`. Không phải module trong TizenBrew và không tự động thay thế module hiện có.

## Vì sao cần bản native

TizenBrew tải module qua máy chủ HTTP nội bộ, do đó `webapis.avplay` có thể không khả dụng trong trang module. HTML5 và HLS.js không xử lý được mọi luồng IPTV, nhất là manifest bị chặn CORS. Bản Tizen độc lập chạy trong **ngữ cảnh Tizen Web Application**, có thể sử dụng Samsung AVPlay trên TV tương thích.

Bản build đóng gói giao diện web TV toàn màn hình chạy cục bộ, ưu tiên bộ phát đã kiểm chứng hoặc AVPlay cho nguồn mới; HLS.js, DASH.js, MPEG-TS và HTML5 là các dự phòng, `supabase-sdk.js`, cả hai thư viện `hls.min.js` và `dash.all.min.js` tại máy, cùng màn hình QR và 5 kiểu giao diện. Không chứa bất kỳ nguồn M3U riêng tư hay đăng nhập đã lưu nào.

## Build source

```sh
python3 tizen-native/build.py
```

File tạo ra: `dist-tizen-native/Open-IPTV-Pro-TV-Native-UNSIGNED.wgt` — **chưa ký, không cài trực tiếp được lên TV Samsung thương mại**. GitHub Actions `package-tizen-native-avplay.yml` tạo file nguồn tương ứng và đính kèm theo workflow.

## Ký và cài bằng Wi-Fi (không dùng USB)

1. Cài Tizen Studio + Samsung TV Extension trên Mac/Windows. Cho TV vào Developer Mode và kết nối Device Manager qua cùng mạng Wi-Fi.
2. Trong **Tools → Certificate Manager**, tạo chứng chỉ Samsung (Author + Distributor); đăng nhập Samsung Developer, lấy **DUID của chính TV** và thêm vào distributor certificate. Không gửi mật khẩu hoặc file chứng chỉ lên GitHub hay chat.
3. Giải nén file WGT **UNSIGNED** vào thư mục mới và import thành **Tizen Web Project**, hoặc lấy cùng các file trong thư mục build; sau đó `tizen build-web -- <project>` và `tizen package -t wgt -s <PROFILE> -- <project>/.buildResult`. Thay `<PROFILE>` bằng tên security profile của bạn.
4. Dùng Tizen Studio **Run As → Tizen Web Application** để cài qua Wi-Fi, hoặc `tizen install -n <signed-package.wgt> -t <TV-target>`. Không cần USB.
5. Kiểm tra khả năng sử dụng `webapis.avplay` và xem các kênh VTV2–VTV5 trên chính thiết bị. Chưa có kết quả kiểm thử trên TV thật.

**Quan trọng:** OTA của module TizenBrew không áp dụng cho WGT native. Gói này cần ký lại bằng chứng chỉ đúng TV khi nâng cấp. Không xóa dữ liệu module TizenBrew vì hai ứng dụng lưu trữ riêng.

Nguồn: [Samsung — Playback Using AVPlay](https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html) · [Samsung — Creating Certificates](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html) · [Samsung — CLI](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html)


### v0.1.45

- Giao diện remote: Tối, Google TV, Apple TV, Minimalist và Glassmorphism. Nút Giao diện trên thanh công cụ luân phiên và ghi nhớ chế độ.
- HLS.js và DASH.js lấy từ nhánh Web, đóng gói **thực** trong WGT; không tải từ CDN trước khi phát. AVPlay vẫn là phương án cần thiết trên TV không hỗ trợ codec/MSE hoặc khi manifest báo lỗi.
- Không tự thêm hoặc cấu hình DRM/giấy phép nguồn, không phát luồng trái phép. Hạn chế cache bộ nhớ: nạp thư viện khi cần và hủy instance sau khi xem.

## Native variant trên nền v0.1.52

- Build riêng: chỉ chuyển đổi bản HTML đóng gói, không sửa module `tizenbrew/index.html`, bootstrap, relay hoặc manifest module GitHub. Không mở trang web từ xa trong ngữ cảnh có quyền hệ thống; giao diện web là mã cục bộ đáng tin cậy, dữ liệu online dùng cơ chế hiện có.
- AVPlay ưu tiên cho kênh chưa có bộ phát đã kiểm chứng; nếu lỗi trước khi phát, chuyển bộ phát theo loại nguồn rồi HTML5, không lặp AVPlay trong cùng chuỗi khởi tạo. Đăng ký phím CH+/−, media và phím màu theo khả năng TV. Không khởi động relay TizenBrew khi mở bản native.
- Module TizenBrew: `trisanghy/open-iptv-pro@tizenbrew` (không có AVPlay hệ thống). WGT độc lập: tải artifact GitHub Actions, ký bằng chứng chỉ phù hợp TV rồi cài qua Tizen Studio hoặc TizenBrew Installer tương thích. Mục Thêm Môđun GitHub không cài WGT native.
- Chưa thử phần cứng; bản WGT vẫn chưa ký. Giao diện native đóng gói cục bộ, chưa hỗ trợ tự cập nhật mã giao diện từ xa.

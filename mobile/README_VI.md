# Open IPTV Pro v4.21.1 — Mobile (Android / iOS)

Đây là **nhánh thử nghiệm mobile có mã nguồn thực**, dựa trên mô hình tính năng của Electron v4.21.1, **không phải** bản full parity với desktop. Một số tính năng cần viết native mới thay vì sao chép binary FFmpeg macOS/Windows sang điện thoại.

## Nền tảng

- **iOS 15+**: Capacitor 8 (WKWebView) + `@capgo/capacitor-video-player` (AVPlayer native). Build bằng macOS, Xcode đầy đủ và Apple signing.
- **Android 7+**: Capacitor 8 (Android System WebView) + `@capgo/capacitor-video-player` (ExoPlayer/Media3 native). Build bằng Gradle + Android SDK/JDK.
- Không đóng gói Chromium riêng. Không cần Node ở **thiết bị sử dụng**. Node chỉ dùng để **build**.

## ĐÃ TRIỂN KHAI TRONG MÃ NGUỒN

1. Phân tích M3U bằng **mã `core-browser.js` v4.21.1** (giữ metadata tên, group, logo, tvg-id, catchup).
2. Thêm URL/file M3U, làm mới nguồn, sửa URL nguồn, tắt/mở/xóa nguồn.
3. Danh mục kênh, tìm kiếm, lọc nhóm, danh sách yêu thích lưu cục bộ.
4. Phát HLS/MP4 ở trình phát native (AVPlayer / ExoPlayer); tích hợp plugin có PiP và Cast tùy hệ điều hành và cấu hình. Nguồn RTSP/UDP có thể không phát bằng native player.
5. Bộ kiểm tra HTTP/HLS manifest + segment tối đa 8/16/32 tác vụ; không đánh LIVE chỉ dựa trên HTTP 200 đối với URL video thường. Mạng/403/timeout → UNKNOWN.
6. URL dự phòng thủ công cho từng kênh.
7. XMLTV EPG cơ bản (XML không gzip) theo tvg-id, tối đa 200 chương trình mỗi lần hiển thị.
8. Xuất M3U đã gộp, nhóm 99 - KÊNH LỖI đặt cuối đối với các lỗi xác minh rõ ràng; chia sẻ/lưu bằng chức năng hệ điều hành.
9. MultiView bốn khung bằng WebView/HLS.js **thử nghiệm** (có thể lỗi CORS/codec trên một số nguồn; không phải bốn AVPlayer/ExoPlayer native).

## CHƯA ĐƯỢC CHUYỂN ĐẦY ĐỦ

- **FFmpeg/FFprobe mobile native**: chưa tích hợp binary cho Android/iOS. FFmpeg bản desktop không chạy nguyên xi trên iOS. Cần biên dịch thư viện native theo từng ABI và nối plugin Java/Kotlin + Swift. Xem `docs/FFMPEG_NATIVE_PLAN.md`.
- **Snapshot native, chụp hàng loạt và record**: chưa hoạt động cho player native. Không giả vờ đã xong. Nút Snapshot trả lỗi cụ thể.
- **Timeshift buffer 5 phút kiểu FFmpeg**: chưa có. Với nguồn DVR, tính năng tua phụ thuộc native player/luồng, không tương đương đệm ghi liên tục 5 phút.
- Smart Doctor nâng cao, tự tìm link thay thế, snapshot 32 FFmpeg processes, EPG nhắc lịch nền, trọn bộ cài update, quyền hồ sơ trẻ em và dịch vụ LAN relay server như Electron: chưa đạt parity.
- PiP/Cast/AirPlay cần kiểm tra trên thiết bị thật và có thể đòi thêm cấu hình native hoặc stream tương thích.

## BUILD APK TRÊN MAC

Cài **Node.js 22+**, **Android Studio + SDK + JDK 21**, sau đó chạy từ thư mục đã giải nén:

```bash
bash BUILD_ANDROID_APK_MAC.command
```

Khi thành công sẽ có `~/Downloads/OpenIPTVPro-Mobile-4.21.1-debug.apk`. Đây là **APK debug có chữ ký debug**, cài được trên máy cá nhân cho mục đích thử nghiệm (chưa phải APK phát hành Play Store).

Nếu muốn không cài Android Studio tại Mac, dùng GitHub Actions. Workflow mẫu ở `GITHUB_ACTIONS_ANDROID_APK.yml` và script `PUSH_MOBILE_GITHUB_MAC.command` có thể thêm workflow vào repo ở nhánh mobile. Khi push nhánh mobile, workflow sẽ chạy theo sự kiện `push`; vào tab Actions của repository để tải artifact. Nút `Run workflow` thủ công chỉ hiện nếu workflow cũng được đưa lên nhánh mặc định của repository.

## BUILD IOS TRÊN MAC

Cần **Xcode 26+ đầy đủ**, Apple ID trong Xcode, **Node 22+**, chữ ký/provisioning hợp lệ. Chạy:

```bash
bash BUILD_IOS_IPA_MAC.command
```

Nếu chưa có `APPLE_TEAM_ID`, script mở Xcode để chọn Team. Sau khi biết Team ID, chạy:

```bash
APPLE_TEAM_ID=XXXXXXXXXX bash BUILD_IOS_IPA_MAC.command
```

Nếu quyền ký của Apple cho phép xuất file IPA debug, script chép vào `~/Downloads/OpenIPTVPro-Mobile-4.21.1.ipa`.

**Lưu ý:** Apple ID miễn phí thường chỉ hỗ trợ Run lên iPhone từ Xcode với giới hạn provisioning, không bảo đảm xuất IPA có thể cài qua AltStore/SideStore. Khi export IPA thất bại, thử `npx cap open ios` → chọn iPhone → Run, hoặc cấu hình certificate/profile phù hợp. Không thể ký IPA hợp lệ khi không có Team và profile.

## Một số lưu ý khác

- Build iOS **chỉ trên Mac**; không có lệnh Windows CMD nào tạo IPA Xcode được. APK có thể build trên Mac, Windows hoặc GitHub Actions.
- Cấp quyền mạng HTTP không mã hóa và ATS vì các playlist IPTV có URL `http://`. Khi phát hành App Store/Play Store, cần giới hạn quyền mạng và rà lại bảo mật.
- Nội dung stream, EPG và truy cập phải có quyền hợp pháp từ nguồn phát.
- Các script build cần nhiều GB trống. **Không cài Rust**: lựa chọn Capacitor để tránh lỗi Rust/homebrew quá nặng từng gặp.
- Mã nguồn gốc thuộc giấy phép MIT và tài liệu của chủ dự án; các plugin đi kèm tuân theo giấy phép riêng.

## Kiểm thử hiện tại

`node --test tests/*.test.mjs` chạy unit-test parser, exporter, concurrency, URL, EPG. **Chưa biên dịch APK/IPA native trong môi trường hiện tại** (không có SDK Android/Xcode); không tuyên bố đã kiểm thử trên điện thoại.

### Build APK từ Windows CMD

Trên Windows đã cài Node 22+, Android Studio + SDK và JDK 21, nhấp đúp `BUILD_ANDROID_WINDOWS.cmd` hoặc chạy CMD:

```cmd
BUILD_ANDROID_WINDOWS.cmd
```

Sản phẩm ở `%USERPROFILE%\Downloads\OpenIPTVPro-Mobile-4.21.1-debug.apk`. **Không thể tạo IPA bằng Windows CMD** do Apple yêu cầu Xcode chạy trên macOS.

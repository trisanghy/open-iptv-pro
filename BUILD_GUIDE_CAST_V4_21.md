# Open IPTV Pro 4.21 – Full Desktop, Cast / AirPlay

## Mac / Windows

- Mac: `BUILD_MAC.command` (cần Node.js, Internet, Xcode tools).
- Windows: `BUILD_WINDOWS.bat` (cần Node.js, Internet).
- Các lệnh `npm install` sẽ thêm `bonjour-service` và `castv2-client`; FFmpeg nhúng vẫn được giữ như bản Full.
- Cast: TV/Google TV/Chromecast và máy tính phải cùng mạng LAN, bật multicast DNS (mDNS/Bonjour). Firewall có thể hỏi quyền cho phép truy cập từ mạng nội bộ.
- AirPlay: chỉ Mac, mở Safari và chọn thiết bị AirPlay bằng trình điều khiển của Safari hoặc Screen Mirroring.
- Bản đóng gói chưa được thử trên phần cứng TV/Chromecast/AirPlay thực; phải thử trước khi phát hành release chính thức.
- Bản nguồn này không sửa repo GitHub, không tạo release và không chứa APK/IPA.

## An toàn

- Luồng được relay qua cổng TCP LAN tạm thời, link gồm token ngẫu nhiên và chữ ký HMAC của URL nguồn. Ngừng truyền hoặc đóng app để đóng phiên.
- URL nguồn chứa thông tin xác thực vẫn có thể bị TV hoặc mạng LAN nhìn thấy qua link phát; không sử dụng trên Wi-Fi không tin cậy.
- DRM hoặc token dựa trên IP/headers có thể ngăn phát trên TV.

## English

- Google Cast uses local mDNS discovery and Cast V2 Default Media Receiver.
- AirPlay opens a Safari playback page on macOS; choose the AirPlay destination in Safari or use Screen Mirroring.
- LAN browser fallback serves HLS manifests and segments via a temporary signed local relay.
- Full FFmpeg/Timeshift remains bundled. Native devices have not yet been hardware-tested.

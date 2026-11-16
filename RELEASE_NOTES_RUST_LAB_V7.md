# Open IPTV Pro Rust Lab — v4.23.17-tauri.7

**Nhánh:** `experiment/rust-tauri-v2`  
**Nguồn gốc:** Open IPTV Pro Electron v4.23.17  
**Loại:** bản thử nghiệm độc lập sử dụng Tauri 2 + Rust, không phải bản cập nhật Electron.

## Điểm nổi bật của v7 — Playback Re-entry Fix

- Sửa vòng đời trình phát khi chuyển kênh nhanh (ví dụ **VTV3 → VTV4 → VTV3**): kết thúc phiên phát cũ trước khi khởi tạo phiên mới, ngăn lỗi đến muộn của lần phát trước tác động lên lần phát hiện tại.
- Thêm định danh riêng cho mỗi lần yêu cầu manifest HLS từ loopback; không sửa URL gốc hoặc chuỗi truy vấn/chữ ký của nhà cung cấp.
- Giới hạn cache ở proxy phát luồng (`no-store`) nhằm tránh sử dụng lại manifest cũ của phiên WebKit trước đó.
- Với kênh/URL vừa phát có tiến trình giải mã trong 90 giây gần nhất: cho phép **một lần** khởi tạo lại player có kiểm soát khi xảy ra MediaError 3/4, rồi mới chuyển URL dự phòng hay FFmpeg.
- Sửa việc xử lý sự kiện `timeupdate` để xác nhận 12 giây phát ổn định và ghi nhớ đúng URL dự phòng tốt.
- Bổ sung kiểm thử cho đổi kênh liên tiếp, sự kiện cũ đến muộn, URL HLS có chữ ký và các cơ chế thử lại có giới hạn.

## Các cải tiến tích lũy từ nhánh Rust Lab v1–v6.3

- Tách ứng dụng sang **Tauri 2 + Rust**, giữ bộ giao diện HTML/CSS/JavaScript và phần lớn tương tác IPTV; app ID và thư mục dữ liệu riêng với bản Electron.
- Cải tiến HLS/DASH proxy, xử lý đường dẫn manifest không chuẩn; bổ sung đường phát dự phòng FFmpeg H.264/AAC, ghi lại nguyên nhân thất bại và hạn chế vòng lặp.
- Chuyển dữ liệu kênh lớn ra tệp lưu trữ Rust thay vì nhồi vào `localStorage`; giữ nguồn M3U, yêu thích và thông tin kênh, giới hạn lịch sử chẩn đoán.
- Kiểm tra kênh dựa trên bằng chứng phát/chụp mới; không coi ảnh cũ là bằng chứng kênh vẫn sống, không kết luận Die chỉ vì lỗi HTTP tạm thời.
- Tự làm mới danh sách M3U URL khi khởi động (có thể tắt); giữ ID kênh/yêu thích khi nguồn thay đổi và ghi nhớ link dự phòng phát ổn định theo từng kênh.
- Snapshot tự làm mới sau 6 giờ, cập nhật đúng ô hình thay vì dựng lại toàn bộ danh sách; giới hạn chạy nền và dọn ảnh thay thế an toàn.
- Thêm EPG và lịch DVR trực tiếp trong thanh điều khiển fullscreen.
- Cải thiện script build Windows: nhận diện Node/Rust, kiểm tra MSVC và Windows SDK, không lặp lại cài đặt khi Windows chặn chính sách; hỗ trợ CI trên Windows/macOS.

## Thử nghiệm và giới hạn

- `npm test`: **81/81 đạt**, kiểm tra lại trong môi trường tạo bộ Git-ready.
- `node scripts/audit-tauri-bridge.cjs`: kiểm tra ánh xạ **46** phương thức shim sang bridge Tauri, có **50** route IPC của Rust.
- `bash -n BUILD_MAC_TAURI.command`: kiểm tra cú pháp shell đạt.
- Chưa thực hiện `cargo test` hoặc build DMG/EXE tại môi trường này (không có Rust/Cargo). Việc người dùng xác nhận bản v7 chạy tốt là kết quả trên máy người dùng, không thay cho CI của nhánh GitHub.
- Chưa chuyển hoàn chỉnh Google Cast/LAN relay, AirPlay discovery và một số trường hợp DASH phức tạp. Hiệu năng codec/hardware và các nguồn IPTV ngoài Internet phụ thuộc hệ điều hành, máy và nhà cung cấp.
- Không thực hiện release, tự cập nhật từ Electron, force-push hay thay đổi `main`.

## Build thử nghiệm

**macOS:** `bash BUILD_MAC_TAURI.command` → `src-tauri/target/release/bundle/dmg/*.dmg`  
**Windows:** `powershell -NoProfile -ExecutionPolicy Bypass -File .\BUILD_WINDOWS_TAURI.ps1` → `src-tauri/target/release/bundle/nsis/*.exe`

Yêu cầu của macOS: Node.js, Rust/Cargo, Xcode CLT. Windows cần MSVC C++ Build Tools + Windows SDK (hoặc build trên runner Windows của GitHub Actions).

## Triển khai GitHub

Chạy `bash PUBLISH_RUSTLAB_V7_GITHUB_MAC.command` từ thư mục này trên Mac đã có Git và GitHub CLI. Script tạo bản sao Git riêng, chỉ commit/push nhánh `experiment/rust-tauri-v2` theo kiểu fast-forward; nếu quyền truy cập hoặc kiểm tra nguồn không đạt sẽ dừng mà không sửa nhánh chính. GitHub Actions sẽ tự chạy trên nhánh mới sau khi push (nếu Actions được bật).

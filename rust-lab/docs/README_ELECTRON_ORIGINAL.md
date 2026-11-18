**Cập nhật v4.23.17:** Cài đặt có bộ chọn luồng kiểm tra/Snapshot và tua lại 5/10/15/30 phút; giao diện gộp chế độ hiển thị và chọn màu theo sidebar. Xem `HUONG_DAN_GIAO_DIEN_V4_23_17.md`.

> **v4.23.16:** Cải thiện tương thích HLS/Live Events qua mạng Chromium (`electron.net.fetch`), có fallback mạng và chẩn đoán DNS/TLS chi tiết. Chưa xác nhận mọi URL trong playlist phim bên ngoài có thể phát; cần thử trên thiết bị và mạng thực tế.

# Open IPTV Pro 4.23.17 – Cấu hình & MPEG-DASH (kế thừa Chromium Network v4.23.16)

**Desktop Windows/macOS · Electron/Chromium · Mã nguồn đầy đủ**

**Cải tiến giữ lại từ v4.23.13:** Thanh cuộn dọc/ngang theo màu giao diện, tự cập nhật khi chọn màu trên bánh xe; Cài đặt chỉ hiện một dòng toàn chiều rộng cho mỗi mục, nhấn mới mở chi tiết; bỏ lối tắt Sao lưu/Khôi phục trên sidebar vì thao tác này đã nằm trong Cài đặt. Toàn bộ API Backup/Restore và các chức năng IPTV vẫn được giữ nguyên.

**Cài đặt → Phong cách giao diện:** chọn trực tiếp **11 kiểu**: Giao diện hiện tại, Minimalism, Material Design 3, Apple HIG, Liquid Glass; thêm 6 thiết kế TV gồm **Cinema TV, Fluent 2, Glassmorphism, Broadcast Studio, Bento Dashboard, Swiss Editorial**. Các kiểu được đồng bộ khung ứng dụng, sidebar/topbar, danh sách kênh, trình phát, điều khiển, EPG, DVR, các trang công cụ, modal, menu, popup và footer. Không tạo trình phát riêng hoặc thay đổi dữ liệu.

**Mật độ hiển thị:** **Compact** (nhiều kênh hơn, điều khiển gọn) và **Comfort** (khoảng cách lớn, dễ bấm). Cả hai áp dụng ngay toàn bộ trang, lưu qua `open-iptv-pro-ui-density-v1`, được sao lưu cùng các khóa cấu hình tên miền ứng dụng. Kiểu giao diện lưu tại `open-iptv-pro-ui-style-v1`.

Các layout TV là **giao diện CSS/Electron** lấy ý tưởng từ hình tham khảo, không phải ứng dụng AppKit/SwiftUI/Fluent 2 hoặc Material chính thức. Preview video vẫn dùng chính bộ phát Electron của dự án. Đối với kiểu TV dạng top navigation (Cinema, Swiss), sidebar chuyển sang thanh ngang có thể cuộn. Hỗ trợ kích thước cửa sổ 1000 và 1360 px.

**Màu:** các kiểu có palette nhận diện riêng; màu người dùng đã chọn thủ công bằng bánh xe vẫn được ưu tiên. Sáng/Tối/AMOLED tiếp tục tồn tại; AMOLED đen #000000 được ưu tiên trên mọi kiểu. Khi thay đổi màu/giao diện, nguồn M3U, trạng thái kênh, EPG và lịch ghi **không thay đổi**.

## Build / Kiểm thử

- macOS: giải nén và chạy `bash BUILD_MAC.command` tại thư mục dự án.
- Windows: giải nén và chạy `BUILD_WINDOWS.bat`; nếu báo quyền symbolic link, làm theo chỉ dẫn trên màn hình.
- Kiểm thử mã nguồn: `npm test`.
- UI thử nghiệm với Playwright + Chromium (yêu cầu cài riêng): `python tests/ui_styles_v42310.py`.

**Giữ nguyên:** IPTV đa nguồn, Smart Discovery, Doctor 3.0, Backup/Restore, DVR MP4, Tua lại 10 phút, EPG, MultiView, Snapshot, Cast/AirPlay, PiP và 8 ngôn ngữ.

**Phạm vi kiểm chứng:** Node.js và Chromium headless; chưa chạy EXE/DMG đóng gói trên thiết bị Windows/macOS thật, chưa thể xác nhận mọi codec, GPU hay màn hình.

---

# Open IPTV Pro 4.23.9 – Snapshot & Discovery Preview

- Nhấn vào ảnh Snapshot để mở kênh; nếu nguồn đang tắt, ứng dụng sẽ hỏi trước khi bật.
- Rê chuột lên một kênh Smart Discovery để xem trước không tiếng, ngay cả khi chưa nhập vào thư viện.
- Chức năng còn lại từ 4.23.8 được giữ nguyên (DVR MP4, EPG, Doctor 3.0, AMOLED, Backup/Restore).

> **v4.23.9:** Giao diện Cài đặt thu gọn; tiến độ tác vụ mở bằng popup; bảng màu tương tác và AMOLED đen tuyệt đối.

> **Windows v4.23.7 Build Fix:** Dùng `BUILD_WINDOWS.bat` ngay ở thư mục gốc đã giải nén. Nếu thiếu quyền symbolic link của winCodeSign, script hướng dẫn bật Developer Mode hoặc chạy với quyền Administrator có xác nhận. Xem `HUONG_DAN_SUA_BUILD_WINDOWS.md`.

# Open IPTV Pro — v4.23.7 Full Desktop

**Windows + macOS · Electron / Chromium · Mã nguồn mở / Open source**

Trình phát và quản lý IPTV đa nguồn M3U/M3U8 với EPG, FFmpeg tích hợp,
Timeshift, MultiView, Snapshot, kiểm tra luồng, Cast/AirPlay và **Backup / Restore**.
Giao diện 8 ngôn ngữ, hỗ trợ Mac Apple Silicon, Mac Intel và Windows.

Open-source IPTV desktop player for Windows and macOS with M3U/M3U8, EPG,
bundled FFmpeg, Timeshift, MultiView, snapshots, diagnostics, Cast/AirPlay,
and **Backup / Restore** (8 UI languages).

> **Lưu ý:** Repository này là mã nguồn. `git push` không tự tạo bộ cài DMG/EXE hay GitHub Release.
> Dự án không kèm kênh trả phí, playlist cá nhân, hoặc quyền xem nội dung.

## Mới trong v4.23.7 · EPG tự động và thanh tiến độ gọn sát đáy

- **Tiến độ tác vụ** nằm gọn bên phải *thanh trạng thái dưới cùng*, không chiếm một hàng riêng phía trên nội dung. Bấm mở rộng để xem chi tiết/Hủy, nội dung ứng dụng co lại theo footer và không bị lớp nổi che nút.
- **Kiểm tra các kênh** ở trang Xem truyền hình bắt đầu quét ngay trên trang hiện tại, không chuyển tới Quản lý nguồn. Kiểm tra theo số luồng đã cấu hình, không thay link hay xóa kênh tự động.
- **EPG tự tải lúc khởi động được bật mặc định sau khi nâng cấp**; tùy chọn có thể tắt trong Cài đặt. Chỉ nguồn **Việt Nam EPGShare01** bật sẵn. Bổ sung nhiều preset EPG quốc tế từ EPGShare01 / IPTV-EPG.org, mặc định tắt để tránh tải ồ ạt và EPG không phù hợp.
- Nguồn EPG tùy chỉnh hiện có và trạng thái bật/tắt được giữ lại; tự thêm preset mới không làm mất nguồn cũ. Kết hợp nguồn EPG với một tập khóa chống trùng, giảm tải CPU khi nhiều nguồn cùng bật. Tải lỗi vẫn giữ cache EPG cũ.
- Nguồn cộng đồng có thể chậm, thiếu lịch, thay URL hoặc không trùng `tvg-id` với playlist; không cam kết luôn hoạt động. Chưa kiểm thử ứng dụng đóng gói trên Windows/macOS thật.

## Mới trong v4.23.5 · Ghi MP4 và Tua lại 10 phút

- **Hẹn giờ ghi MP4:** tiến trình FFmpeg ghi luồng vào file tạm `.part.ts` riêng, sau khi đủ giờ đóng gói sang `.part.mp4` bằng stream copy, xác nhận đúng định dạng MP4 rồi đổi tên `.mp4`; file `.ts` chỉ được xóa sau khi MP4 đã hoàn tất. Nếu gặp lỗi codec, hết ổ đĩa, tắt máy hoặc đóng ứng dụng, giữ lại phần ghi tạm; không báo thành công giả.
- **Tên MP4:** `Ten-kenh_YYYY-MM-DD_HH-mm_den_YYYY-MM-DD_HH-mm_Ten-chuong-trinh_ID.mp4`. Tên chương trình được tự lấy từ chương trình EPG khớp với lịch nếu có; lịch đặt thủ công cũng có thể tự đặt tên, không có EPG thì chỉ dùng tên kênh và thời gian.
- **Khung Tua lại:** tối đa khoảng **10 phút** kể từ khi bật bộ đệm, chỉ giữ nút **−10 giây**, **−30 giây**, **Về LIVE** và nút bật/tắt bộ đệm. Giới hạn lưu tạm 2 GiB và kiểm tra dung lượng ổ đĩa.
- Các lịch ghi v4.23.3/v4.23.4 vẫn đọc được; Backup/Restore chỉ lưu lịch hẹn tương lai, không chứa video. Giữ nguyên Smart Discovery, Doctor 3.0 và các chức năng Windows/macOS.
- Phạm vi kiểm thử: Node.js, FFmpeg thật trên luồng thử nghiệm MPEG-TS và HLS, ffprobe và Chromium mock UI. Chưa xác nhận EXE/DMG trên máy thật hoặc mọi codec/luồng IPTV.

## Mới trong v4.23.4 · Hẹn giờ nhanh trong Timeshift / DVR quick controls

- Ngay dưới trình phát, trong khung **Timeshift 5 phút**, có nút **⏺ Hẹn giờ ghi hình** đặt lịch thủ công cho kênh đang xem; **▤ Xem lịch ghi** mở danh sách ở EPG để quản lý, hủy hoặc mở file.
- Nhãn trạng thái ghi hình được cập nhật từ dịch vụ DVR thực (chưa ghi / đã hẹn / đang ghi), độc lập với kênh đang phát; lịch vẫn phải mở ứng dụng và máy không ngủ.
- **Tiến độ tác vụ** kiểm tra kênh/Snapshot được chuyển thành thanh cuối vùng ứng dụng, phía trên footer, có thu gọn/mở rộng. Thanh không nổi che các nút điều khiển nữa.
- Giữ nguyên bộ ghi nền FFmpeg và quy trình Windows Build Fix; không sửa thư mục video, lịch ghi cũ hoặc logic phát TV.
- Chạy test Node.js + Chromium giả lập DVR trên màn hình 1360px/1000px. Chưa kiểm thử installer trên máy thật hay ghi IPTV trả phí.

## Mới trong v4.23.3 · Hẹn giờ ghi hình (DVR) / Scheduled Recording

- **EPG → Hẹn giờ ghi hình**: chọn kênh, tên chương trình, giờ bắt đầu/kết thúc; hoặc bấm **⏺ Ghi** cạnh chương trình trong XMLTV EPG. Ngày giờ dùng múi giờ máy tính; EPG áp dụng độ lệch do người dùng đặt.
- **Windows/macOS**: ghi bằng tiến trình FFmpeg **riêng** (stream copy sang MPEG-TS `.ts`), không can thiệp player, Timeshift, Cast/AirPlay hay Snapshot. Mỗi lần chỉ ghi **một chương trình**, lịch trùng bị từ chối; mỗi lịch 1 phút–8 giờ, đặt trước tối đa 45 ngày.
- **An toàn**: lưu lịch bền vững trong thư mục dữ liệu ứng dụng trước khi chạy; kiểm tra dung lượng; không ghi đè file; dùng `.part.ts` khi ghi, đổi `.ts` khi hoàn tất; thất bại/hủy giữ `.partial.ts`; đóng app/sự cố giữ bản ghi bị gián đoạn, không tự báo thành công hoặc ghi bù lịch cũ.
- **Backup/Restore**: bản `.iptvbackup` mới có **lịch ghi trong tương lai** (không chứa video; file cũ không có lịch sẽ không xóa các lịch hiện hữu). Restore lịch yêu cầu ứng dụng không đang ghi.
- **Giới hạn quan trọng**: ứng dụng **phải còn chạy** và máy **không ngủ** khi đến giờ. Lịch không tự bật lại máy/tự khởi chạy ứng dụng; phụ thuộc nguồn phát, Internet, quyền ghi, dung lượng đĩa, FFmpeg và codec. Kênh DRM không hỗ trợ. Không cam kết ghi được tất cả các luồng IPTV.

**English:** Manual and EPG-based scheduled DVR, local MPEG-TS stream copy, dedicated FFmpeg process, persistent schedule, disk/timeout checks, conflict prevention, incomplete-file preservation and backup of future schedules. Keep the app running and the computer awake. Existing desktop player features remain untouched. No mobile changes and no GitHub release in this package.

[Hướng dẫn ghi hình / DVR guide](docs/DVR_V4_23_3_VI_EN.md) · [Changelog](CHANGELOG.md)

## Mới trong v4.23.2 · Kiểm thử tổng thể / Stability Audit

- **Doctor 3.0:** Có thêm phạm vi **tất cả kênh (không giới hạn tổng số)**, tất cả kênh chưa được xác minh và quét nhanh 10–1.000 kênh; tối đa 4 kết nối, tiến độ, hủy và giữ kết quả đã kiểm tra. Chỉ kết luận **Sống** khi checker trả bằng chứng video và **Die** khi có xác nhận chết nhiều vòng.
- **Smart Discovery:** Loại kết quả Sống thiếu bằng chứng video; chạy lại ALL sẽ ưu tiên các kênh chưa kiểm tra; phân trang hiển thị thêm 150 kết quả mỗi lượt; đổi danh mục sẽ vô hiệu kết quả xem trước trước đó.
- **Quản lý nguồn:** Nhập và sửa playlist được hoàn tác khi không thể lưu dữ liệu vào localStorage; cảnh báo hết dung lượng thay vì báo nhập thành công giả. Đọc file M3U trên desktop bất đồng bộ, từ chối file trên 25 MB trước khi đọc.
- **M3U parser:** Nhận `#EXTINF` không phân biệt chữ hoa/thường; tách tên kênh tại dấu phẩy ngoài dấu nháy, xử lý metadata chứa dấu phẩy chuẩn hơn.
- Đã chạy kiểm thử logic, giao diện mô phỏng Chromium và hồi quy. Chưa có kiểm thử DMG/EXE thực tế trên máy người dùng và **chưa push GitHub**. Giữ nguyên iOS/Android.

## Mới trong v4.23.1 · Smart Discovery tại Quản lý nguồn

- Smart Discovery đã được tích hợp vào **Quản lý nguồn**, không còn mục riêng trên thanh bên.
- Thêm các nguồn công khai được phép: **iptv-org theo quốc gia / thể loại / ngôn ngữ / toàn cầu** và **Free-TV/IPTV chọn lọc**. Các nguồn có thể bị giới hạn theo địa lý hoặc thay đổi.
- Kiểm tra **tất cả kênh không giới hạn** (mặc định), hoặc **10 / 25 / 50 / 100 / 250 / 500 / 1.000 kênh** mỗi lượt, chọn **2–8** tác vụ đồng thời, theo dõi tiến độ, có thể hủy và lọc kết quả. Không tự nhập/ghi đè playlist.
- Giữ nguyên **Doctor 3.0, Backup/Restore, FFmpeg, Timeshift và các chức năng Win/Mac**.

## Mới trong v4.23.0 · Smart Discovery + Doctor 3.0

- **Smart IPTV Discovery (thanh bên):** Chọn quốc gia (mặc định Việt Nam), tải M3U từ danh mục công khai iptv-org, kiểm tra luồng 10/25/50 kênh mỗi lượt (tối đa 3 yêu cầu song song), phân loại **Sống / Die / Chưa rõ** và xem trước tối đa 100 kết quả. Chỉ nhập kênh đã có bằng chứng phát được, hoặc chọn nhập playlist gốc với cảnh báo chưa kiểm chứng. Không tự nhập hay đổi nguồn cũ.
- **Doctor 3.0 (trong Smart IPTV Doctor):** Chấm điểm *ưu tiên chất lượng* 0–100 dựa trên bằng chứng lịch sử 7 ngày, trạng thái mới nhất, độ trễ, thời gian khởi phát và lần khựng hình; điểm **không phải phần trăm uptime**. Kiểm tra thực có giới hạn, xác nhận nhiều vòng trước khi đánh dấu Die, báo cáo JSON, đề xuất thêm URL dự phòng theo `tvg-id`/metadata và **Hoàn tác**. Không tự đổi URL phát chính, không tự xóa kênh.
- **Giữ nguyên:** Backup/Restore, Doctor 2.0, nguồn M3U cá nhân, EPG, FFmpeg, Timeshift, MultiView, Cast/AirPlay, Snapshot, giao diện 8 ngôn ngữ, Windows/macOS. **Không cập nhật iOS/Android.**
- **Giới hạn:** Kênh miễn phí có thể chặn vùng, gián đoạn hoặc yêu cầu xác thực; kết quả kiểm tra tại thời điểm chạy không cam kết phát mãi. Discovery cần Internet. Đây là **mã nguồn**, chưa phải DMG/EXE phát hành và chưa push GitHub.

**English:** Country-based opt-in public IPTV discovery (iptv-org), bounded live checks, explicit import; Doctor 3.0 ranks streams using recorded evidence and supports reversible backup-link suggestions. No automated source replacement or guaranteed uptime. Desktop only.

[Hướng dẫn Smart Discovery & Doctor 3.0](HUONG_DAN_SMART_V4_23.md) · [Changelog](CHANGELOG.md).

## v4.22.2 / Backup & Restore

| Thay đổi | Nội dung / Details |
| --- | --- |
| **Sao lưu / Backup** | Xuất file `.iptvbackup` lưu nguồn/kênh, nhóm, yêu thích, hồ sơ, giao diện, EPG và cấu hình; tùy chọn nhúng ảnh Snapshot. |
| **Khôi phục / Restore** | Chọn file, xem tóm tắt và xác nhận; kiểm tra định dạng và SHA-256 ảnh, tránh ghi đè ảnh cũ. |
| **An toàn dữ liệu** | Hoàn tác dữ liệu cấu hình nếu ghi thất bại. File sao lưu chưa mã hóa, tối đa 128 MB; không chứa bộ đệm Timeshift hay chương trình cài đặt. |
| **Tương thích** | Giữ FFmpeg, Timeshift 5 phút, MultiView, Snapshot, Cast/AirPlay, EPG, Doctor 2.0, 8 ngôn ngữ và kiểm tra tối đa 32 tác vụ. |
| **Phạm vi** | Chỉ cập nhật desktop Windows/macOS; không sửa mã Android/iOS. |

**Cách dùng:** Trong ứng dụng, vào **Cài đặt → Sao lưu / Khôi phục** (hoặc mục Sao lưu trên thanh bên), chọn **Tạo file Backup** hay **Restore từ file**. Khi khôi phục, ứng dụng hỏi xác nhận trước khi thay dữ liệu hiện có.

**English:** Export local playlists, favorites, groups, profiles, preferences, EPG and optionally Snapshot images to one `.iptvbackup` file. Review and confirm before restoring. Snapshot integrity is verified; existing image filenames are preserved. Backups are not encrypted, so protect files containing private stream URLs or profile data.

Đọc thêm: [Hướng dẫn Backup/Restore](HUONG_DAN_BACKUP_RESTORE_V4_22_2.md) · [Release notes VI/EN](docs/RELEASE_NOTES_V4_22_2_VI_EN.md) · [Changelog](CHANGELOG.md).

## Tải, build và kiểm thử / Build & test

- `npm test` — kiểm thử logic ứng dụng, Backup/Restore, Smart Discovery và Doctor 3.0.
- `BUILD_MAC.command` — build DMG/ZIP trên Mac với Node.js và các phụ thuộc cần thiết.
- `BUILD_WINDOWS.bat` — build Windows installer/portable trên Windows.
- File cài đặt sinh trong `dist/` trên máy build. Cần ký số/notarize phù hợp trước khi phân phối bản chính thức.
- **GitHub:** Chưa tự động push hoặc phát hành phiên bản mới. Dùng Git đã xác thực trên máy khi sẵn sàng; kiểm thử trên Mac/Windows thực tế trước khi tạo Release.

**Repository:** https://github.com/trisanghy/open-iptv-pro

---

## v4.22 Full – Cập nhật và bộ biểu tượng macOS

**Tiếng Việt:** Repository phát hành chính thức `trisanghy/open-iptv-pro` được cố định, không cần nhập lại. Ứng dụng đọc phiên bản từ tên bộ cài / tag / tên Release, tìm bản mới đúng hệ điều hành & kiến trúc (Mac Apple Silicon, Mac Intel hoặc Windows), tự tải khi bật tùy chọn, xác minh trước khi cài. Mac chưa ký dùng bộ cài DMG thủ công; ứng dụng ký đúng chuẩn có thể dùng trình tự cài tự động. Menu thay bằng 12 icon SVG nét bo tròn đồng nhất, giữ logo ứng dụng và toàn bộ FFmpeg/Timeshift Full.

**English:** The official release repository `trisanghy/open-iptv-pro` is built in. Version checks accept flexible release tag naming and locate a compatible newer installer for macOS ARM64, macOS Intel or Windows. Downloads are integrity-checked; signed eligible builds may install automatically after confirmation, while unsigned macOS builds open a verified DMG for manual installation. The sidebar now uses a consistent macOS-inspired SVG icon set. FFmpeg, Timeshift and all Full features remain included.

**Important:** Pushing source to GitHub does not publish installers. Release assets are required for updates. macOS automatic in-place installation requires a properly signed application. No Apple-owned SF Symbols files or fonts are bundled.

## Bản sửa v4.21.1: Phát hiện TV AirPlay trên macOS

Mục Google Cast chỉ phát hiện Chromecast/Google TV hỗ trợ Google Cast. Mục AirPlay trên Mac giờ có nút **Tìm thiết bị AirPlay**, dùng Bonjour (`dns-sd`) của macOS để hiển thị thiết bị tương thích. Để phát AirPlay, vẫn nhấn **Mở AirPlay trong Safari** và chọn TV trong Safari. Xem `AIRPLAY_FIX_V4_21_1_VI_EN.md` để biết chi tiết. Tất cả tính năng Full, FFmpeg và Timeshift được giữ nguyên.

## v4.21.1 AirPlay discovery fix (macOS)

Chromecast discovery and AirPlay discovery are separate. The AirPlay section now lists macOS Bonjour video AirPlay receivers. To start playback, open Safari from the app and select the receiver in Safari. All Full Edition features are retained.

---

## Mới trong v4.21 / New in v4.21

**Tiếng Việt**

- **Sửa link M3U đã nhập:** Quản lý nguồn → **Sửa link**. Ứng dụng tải và xác minh danh sách mới trước khi lưu; lỗi sẽ giữ nguyên URL cũ. Giữ nguồn, các kênh khớp, thư mục cá nhân và Yêu thích.
- **Google Cast / Chromecast / Google TV:** Chọn kênh → **Cast / AirPlay** → **Tìm TV** → **Phát trên TV đã chọn**. TV và máy tính phải chung mạng LAN, mDNS không bị chặn. Một số video cần codec/DRM mà TV không hỗ trợ sẽ không phát được.
- **AirPlay (Mac):** Chọn **Mở AirPlay trong Safari**, sau đó chọn AirPlay trong Safari hoặc dùng **Phản chiếu màn hình** trên macOS. Đây không phải cơ chế tự bắt tay AirPlay trong Electron; Windows không có lựa chọn này.
- **TV có trình duyệt:** Chọn **Tạo liên kết xem**, mở địa chỉ LAN trên TV. Liên kết có mã ngẫu nhiên, hết hiệu lực khi dừng truyền hoặc đóng app. Máy phát và TV phải kết nối cùng LAN và tường lửa cho phép.
- **Giữ bản Full:** FFmpeg nhúng, Timeshift, Snapshot 32 luồng, MultiView, Doctor, EPG và cập nhật vẫn có. Không thay Android/iOS.

**English**

- **Edit saved M3U URLs** under Manage Sources → Edit URL. Fetch and validate the replacement first; an error preserves the original source. Matching channel identities, favorites and custom folders are retained.
- **Google Cast:** Select a channel → Cast / AirPlay → Find TVs → Cast. Devices must be on the same LAN with mDNS enabled. DRM, unsupported codecs, authentication and firewall rules may prevent playback.
- **AirPlay on macOS:** Opens the current stream in Safari, where the user chooses an AirPlay destination or macOS Screen Mirroring. This is not automatic native AirPlay pairing in Electron; Windows does not offer Safari AirPlay.
- **Browser on another device:** Generate a temporary signed LAN video page URL and open it on a TV browser. Same-network access required.
- **Full features maintained:** bundled FFmpeg, Timeshift, 32-worker Snapshot, MultiView, Doctor, EPG and the updater. Android/iOS unchanged.

---

> **Open IPTV Pro v4.20 Full / Sửa cập nhật** — FFmpeg được tích hợp vào ứng dụng; giữ nguyên Timeshift 5 phút, Snapshot hàng loạt, kiểm tra 32 luồng, MultiView, Doctor 2.0, EPG, PiP, Failover và cập nhật phiên bản. Giao diện được thu gọn, không cắt chức năng.
> **English:** Full edition bundles FFmpeg and retains every desktop function; only the interface is simplified. macOS and Windows source; Android/iOS unchanged.

> **v4.20 Full (Windows/macOS):** FFmpeg tích hợp trong bộ cài, Timeshift 5 phút và Snapshot 32 luồng đầy đủ. Cập nhật bằng GitHub Releases sẽ tải bộ cài đã xác minh hoặc tự cài khi có chữ ký phù hợp. Mac Apple Silicon và Intel được build riêng để FFmpeg đúng kiến trúc.

## Giới thiệu chi tiết / Details

## 🇻🇳 Tiếng Việt

**Open IPTV Pro** là phần mềm xem và quản lý IPTV mã nguồn mở dành cho **Windows và macOS**. Ứng dụng hỗ trợ 8 ngôn ngữ, danh sách M3U, lịch phát sóng EPG, MultiView 4 kênh, ảnh xem trước, kiểm tra nhiều vòng và sửa link dự phòng.

![Giao diện Open IPTV Pro](docs/images/interface-v4-1.png)

### Tính năng chính

- **Nguồn IPTV:** nhập file hoặc URL M3U, quản lý nhiều nguồn, thu thập M3U công khai, gộp kênh trùng và giữ link dự phòng.
- **Xem truyền hình:** tìm kiếm, thư mục, kéo thả kênh, đồng bộ Yêu thích giữa các màn hình, chế độ cửa sổ nổi PiP khi được hỗ trợ.
- **EPG:** lịch phát sóng XMLTV, ghép kênh, tìm chương trình và nhắc lịch khi ứng dụng đang chạy.
- **MultiView:** xem 4 kênh cùng lúc; rê chuột vào ô nào thì ô đó phát tiếng.
- **Snapshot:** chụp và hiển thị ảnh theo kênh, có thể chạy nhiều tác vụ cùng lúc bằng FFmpeg.
- **Kiểm tra & sửa link:** phân loại Sống / Die / Chưa rõ, kiểm tra nhiều vòng, tự dùng link dự phòng đã xác minh. Hỗ trợ tối đa 32 tác vụ kiểm tra và 32 tác vụ chụp ảnh đồng thời.
- **Timeshift:** lưu bộ đệm 5 phút kể từ khi bật ghi (không thể tua về trước thời điểm bắt đầu lưu nếu nhà cung cấp không hỗ trợ).
- **Cá nhân hóa:** giao diện Sáng / Tối / Tự động, bánh xe chọn màu, hồ sơ riêng và khóa PIN cơ bản.

### Smart IPTV Doctor 2.0 (giữ nguyên)

- **Freeze Detector:** giám sát video chính theo thời gian thực, cảnh báo khung hình đứng hoặc màn hình đen nhưng không vội kết luận link Die. Tùy chọn thử link dự phòng khi đứng hình được xác nhận được **tắt mặc định**.
- **Visual Channel Deduplication:** quét Snapshot đã lưu, đối chiếu dấu vân tay hình ảnh và metadata để đề xuất kênh nghi trùng; **không tự gộp** khi chỉ có một ảnh giống nhau.
- **Doctor 2.0:** điểm ưu tiên đề xuất sửa, phát hiện kênh bị báo Die dù từng phát thành công, thêm dự phòng đã xác minh sau khi bạn chấp thuận, hoàn tác và xuất báo cáo JSON.

![Smart IPTV Doctor 2.0 — ảnh giao diện thử](docs/images/doctor-v4-17.png)

Chi tiết: [Hướng dẫn Doctor 2.0 (Việt/Anh)](docs/DOCTOR_V4_17_VI_EN.md). Phần mới chỉ dành cho Windows/macOS.

### Cập nhật phiên bản tự động (sửa trong v4.20)

Vào **Cài đặt → Cập nhật phiên bản** để kiểm tra GitHub Releases, tải phiên bản mới có tiến độ và xác nhận cài đặt. Mặc định bật **Tự kiểm tra khi mở ứng dụng** và **Tự tải bản mới**, có thể tắt riêng. Nếu bản cài chưa ký hoặc là Portable, app tải bộ cài có checksum SHA256 rồi yêu cầu mở thủ công; không tự thực thi file tải về. Nếu chỉ có mã nguồn hoặc chưa có Release, app hiển thị hướng dẫn rõ ràng.

> **Lần nâng cấp đầu tiên:** v4.15 chưa có trình cập nhật tự tải/cài nên phải **cài v4.16 thủ công một lần**. Để bản Mac tự cài cập nhật về sau, cần ký bằng Apple Developer ID và notarize; bản Windows nên được ký. Xem [Hướng dẫn cập nhật và phát hành](docs/AUTO_UPDATE_VI.md).

### 8 ngôn ngữ giao diện

Vào **Cài đặt → Ngôn ngữ** để chọn: Tiếng Việt, English, Español, Português (Brasil), 简体中文, ไทย, ລາວ hoặc ភាសាខ្មែរ. Thiết lập được lưu sau khi đóng ứng dụng. Tên kênh, tên nhóm M3U và dữ liệu EPG không bị tự động dịch. Một số thông báo kỹ thuật chuyên sâu có thể chưa được dịch hết.

### Sử dụng và cài đặt

1. Mở ứng dụng và chọn **Mở file M3U** hoặc **Thêm URL**.
2. Chọn kênh để phát; có thể đánh dấu Yêu thích và sắp xếp theo thư mục.
3. Vào **Quản lý nguồn** để thu thập, gộp, kiểm tra và sửa link.
4. Vào **Cài đặt** để chọn ngôn ngữ, màu giao diện, số luồng kiểm tra và Snapshot.

**Tạo bộ cài từ mã nguồn:** cần Node.js 22+, npm và Internet cho lần cài gói đầu tiên. Trên Mac chạy `BUILD_MAC.command` (hoặc `npm run dist:mac:arm64` / `npm run dist:mac:x64`); trên Windows chạy `BUILD_WINDOWS.bat` (hoặc `npm run dist:win`). File build nằm trong `dist/`. Bộ cài chưa ký có thể gặp cảnh báo bảo mật; cần ký và notarize trước khi phát hành chính thức.

**Lưu ý pháp lý và quyền riêng tư:** phần mềm không cung cấp kênh trả phí, tài khoản thuê bao hay quyền phát lại nội dung. Chỉ sử dụng luồng bạn có quyền truy cập; không đăng playlist riêng, thông tin đăng nhập hoặc token lên GitHub public. Giấy phép MIT áp dụng cho mã nguồn của ứng dụng, còn FFmpeg, Electron, hls.js và dữ liệu EPG có điều khoản riêng tại [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Bản **v4.20** chỉ cập nhật phần mềm **Windows/macOS**, không cập nhật Android/iOS. Có thể xem hướng dẫn chi tiết tại [Hướng dẫn tiếng Việt](docs/README_VI.md), [Hướng dẫn build](docs/BUILD.md) và [MIT License](LICENSE).

---

## 🇬🇧 English

**Open-source IPTV desktop player for macOS and Windows, featuring an 8-language interface, M3U playlists, XMLTV program guides, four-channel MultiView, snapshots, and multi-pass stream health checks.**

![Open IPTV Pro desktop interface](docs/images/interface-v4-1.png)

> **v4.20.0 · Desktop only.** Android and iOS source code are intentionally **not** included or updated in this release. The project is licensed under the MIT License; bundled dependencies have their own licenses (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)). This repository does **not** include commercial television streams, pirated playlists, or viewing rights.

## Visual Stream Diagnostics (retained)

**Smart IPTV Doctor 2.0** adds on-device video freeze/black-screen warnings, local perceptual comparison of saved channel snapshots (review only, no automatic merge), prioritized recommendations and undo for the last change. Recently verified backup URLs can be added after confirmation. These features never treat a static scene or one matching frame as proof a stream is dead or two channels are identical. See [Doctor 2.0 guide (Vietnamese/English)](docs/DOCTOR_V4_17_VI_EN.md).

## In-app updates (v4.16)

**Settings → Software Updates** checks the official GitHub Releases repository, reports available versions, downloads with progress and SHA256 validation, and automatically downloads an available verified update (configurable) and asks permission before installing/restarting. Signed installed desktop builds can update in-app when GitHub Releases includes proper metadata and installers. Unsigned/portable builds download a verified installer for **manual** installation. A source-code-only Release cannot be installed. See [Update instructions (Vietnamese)](docs/AUTO_UPDATE_VI.md).

**Migration:** users of v4.15 must install v4.16 manually once, because the old version does not contain the new updater. macOS automatic installation requires Developer ID signing and notarization; Windows signing is recommended.

## Languages

In **Settings → Language**, choose from:

| Language | Display name | Locale |
| --- | --- | --- |
| Vietnamese | Tiếng Việt | `vi` |
| English | English | `en` |
| Spanish | Español | `es` |
| Portuguese (Brazil) | Português (Brasil) | `pt-BR` |
| Simplified Chinese | 简体中文 | `zh-CN` |
| Thai | ไทย | `th` |
| Lao | ລາວ | `lo` |
| Khmer (Cambodian) | ភាសាខ្មែរ | `km` |

Language changes apply immediately and are saved locally. The application translates navigation, main controls, settings, tooltips, and key workflows; some technical messages may remain in their original wording while translations are being expanded. **Imported channel names, user-created folder names, EPG program names, and source metadata are not machine-translated or modified.** All translation files are available in [`renderer/locales/`](renderer/locales/) and can be improved through pull requests.

![English-language settings screenshot](docs/images/i18n-english-v4-15.png)

## Features

- **Playlist management:** add local M3U files or URLs, refresh sources, import public M3U files from GitHub repositories, merge duplicates, and maintain backup streams.
- **IPTV player:** HLS/MP4 playback, favorites synchronized between screens, channel folders, drag-and-drop channel organization, aspect-ratio controls, and picture-in-picture (where supported).
- **EPG:** XMLTV program guide, mapping options, program search, and reminders while the app is running.
- **MultiView:** watch four channels at once. Hover over a pane to hear its audio; other panes stay muted.
- **Channel snapshots:** preview thumbnails, per-channel capture and bulk capture using bundled FFmpeg.
- **Stream health:** multi-step verification, online/offline/uncertain classification, cautious failover, health history, and Smart IPTV Doctor diagnostics.
- **Performance settings:** independently set up to **32 concurrent URL checks** and **32 snapshot jobs**. For reliability, start with four workers per task.
- **Timeshift:** local five-minute rolling buffer when enabled. The buffer only contains data recorded **since buffering began**, unless the provider supplies DVR/catch-up support.
- **Appearance:** Light, Dark, or automatic system mode; adjustable accent color.
- **Profiles:** separate favorites and basic local parental controls.

### What this app does not promise

Streams may require permissions or provider-specific authentication. A URL can play in a video player yet be inaccessible to automated probes; ambiguous cases are labeled **Unknown**, rather than definitively Offline. EPG coverage and catch-up depend on external sources. Local parental PINs are convenience controls, not operating-system security. Multiview, snapshots, timeshift, and high concurrency may consume significant CPU, RAM, bandwidth and disk space.

## Getting started

1. Download the source ZIP or clone this repository.
2. Import an `.m3u` file using **Open M3U File**, or use **Add URL** to fetch a playlist.
3. Choose a channel to watch. Save channels to Favorites, group them into folders, or open **Manage Sources** for link checks and deduplication.
4. Select **Settings → Language** for another interface language.

**For end users:** install an unsigned `.dmg`/`.exe` built from this repository; builds still need validation on the target operating system. We do not claim to ship signed/notarized installers here.

## Build from source

**Prerequisites:** Git (optional), Node.js 22+ and npm. The provided Mac build script can fetch a verified Node.js copy locally. The Windows build helper may download its build tools. An internet connection is required for the initial `npm install` and build dependencies.

```bash
npm install
npm test
npm run start
```

### macOS

Run `BUILD_MAC.command` from the project directory, or run one of:

```bash
npm run dist:mac:arm64  # Apple Silicon
npm run dist:mac:x64    # Intel
```

The generated `.dmg` is placed in `dist/`. Builds created without a signing identity may be blocked by Gatekeeper; release builds should be signed and notarized.

### Windows

Run `BUILD_WINDOWS.bat`, or install Node.js 22+ and use:

```powershell
npm install
npm test
npm run dist:win
```

Setup and portable `.exe` outputs are placed under `dist/`. Unsigned installers can trigger SmartScreen warnings.

### GitHub Actions

The workflow at `.github/workflows/tao-bo-cai.yml` provides separate Windows x64, macOS Intel and Apple Silicon build jobs. Workflows build source code **without automatically publishing installers**; they upload unsigned artifacts to that workflow run. The repository does not upload your saved IPTV playlists, favorites, EPG, snapshots, or tokens.

## Privacy and data

Application settings and imported playlists are stored on the user's machine. Remote playlist, EPG, streaming and GitHub Release URL requests will contact the respective servers. Do not publish subscription tokens, private playlists, provider credentials, or copyrighted streams in a public Git repository. The **publish to GitHub/Gist** feature has been removed from the app.

## Project structure

```text
renderer/                 Desktop user interface, translations and UI logic
renderer/locales/         Editable JSON translation dictionaries
renderer/i18n.js          Language switching and DOM translation
src/                      Desktop native processes, streaming and FFmpeg integrations
assets/                   Application icons
examples/demo.m3u         Synthetic sample playlist
scripts/                  Platform build helper scripts
tests/                    Node and UI regression tests
docs/                     Additional guides and screenshots
.github/workflows/        CI and installer build jobs
```

## Documentation and contribution

- [Build guide](docs/BUILD.md)
- [Vietnamese guide](docs/README_VI.md)
- [English user guide](docs/USER_GUIDE_EN.md)
- [GitHub repository description](docs/GITHUB_DESCRIPTION_EN.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [MIT License](LICENSE)

Translations are community-editable. Please preserve placeholders and technical identifiers such as `M3U`, `XMLTV`, `EPG`, `FFmpeg`, `HLS`, and `URL`. Before submitting a translation, run the UI language-switching smoke test and review text clipping on smaller screens.

## Legal notice

Open IPTV Pro is a player and playlist-management application. It does not provide pay-TV accounts, subscriptions or rebroadcasting rights. Use streams only when you have permission to view or redistribute them. This project's MIT license covers the application's own source code only, not the legal status of any third-party streams or EPG data.

## v4.23.6 — EPG cập nhật khi khởi động / nhập file thủ công
Vào **Cài đặt → Nguồn lịch EPG**: bật **Tự tải EPG khi khởi động ứng dụng** (mặc định tắt), hoặc bấm **Tải EPG từ URL ngay**. Nhấn **Nhập file EPG thủ công** để chọn XMLTV `.xml`, `.xmltv` hoặc `.gz`. Ứng dụng kiểm tra file rồi yêu cầu xác nhận trước khi thay lịch đang lưu. EPG cũ vẫn giữ nếu tải/nhập thất bại. Tự tải chỉ chạy một lần trong mỗi lần mở app và bỏ qua khi chưa có playlist M3U.


**Mới v4.23.14:** Xem chi tiết `HUONG_DAN_PLAYER_V4_23_14.md`; kênh sự kiện/video có hỗ trợ tua khi máy chủ cung cấp phân đoạn, full screen tự ẩn điều khiển, phím tắt, phát lại kênh gần nhất, nút đỏ Mac thoát hoàn toàn.


## Mới v4.23.15 – Kiểm tra HLS Live Events từ playlist thực tế

- Sửa trình phát HLS.js để **không gọi `play()` trước sự kiện `MANIFEST_PARSED`**: tránh tự báo lỗi và kích hoạt failover khi manifest chưa được nạp.
- Proxy HLS dùng tác vụ có thể kiểm thử riêng, nhận dạng manifest kể cả khi URL không có `.m3u8`, giữ URL các segment và KEY theo cơ chế rewrite. Không gửi `Range` với manifest; có thử GET thường khi máy chủ từ chối `Range` của phân đoạn.
- Khi máy chủ trả HTTP 403/404/429/5xx, ứng dụng giữ mã lỗi trong thông báo; không đánh dấu nhầm luồng đã phát. Nếu máy chủ chặn truy cập hoặc URL hết hạn, phần mềm không thể tự tạo luồng thay thế.
- Thanh tua VOD/Event chỉ hiện khi manifest xác nhận là sự kiện/VOD và HTML5 có vùng seekable; **LIVE thuần không có thanh chọn phân đoạn**, dù Chromium có vùng đệm tạm. Tua lại 10 phút riêng vẫn giữ nguyên.
- Tệp M3U được cung cấp để tái hiện lỗi có 557 kênh; nhóm LIVE EVENTS có 72 mục: 71 HLS, 1 MPEG-DASH. **MPEG-DASH `.mpd` chưa được hỗ trợ trực tiếp** trong trình phát này; không được đưa nhầm vào HLS.js.
- Chẩn đoán nguồn ngay trên máy người dùng, không in URL đầy đủ chứa token:

```bash
node scripts/diagnose-m3u.cjs "$HOME/Downloads/live events iptv.m3u" --group "LIVE EVENTS" --limit 5
```

Có thể thêm `--offline` để chỉ đọc/thống kê file không dùng mạng. Script không sửa playlist hoặc dữ liệu người dùng. **Không bao gồm playlist riêng của người dùng trong ZIP nguồn**.

Giới hạn: các CDN bên ngoài không thể truy cập từ môi trường thử nghiệm, nên cần chạy chẩn đoán trên máy đang phát để xác nhận lỗi riêng của từng host. Không tự vượt DRM, xác thực hay giới hạn vùng địa lý.

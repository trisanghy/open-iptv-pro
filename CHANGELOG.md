## Rust Lab v23.8.91 — Bộ icon Web, bảo toàn bản dịch và kiểm thử

Giữ bộ icon SVG từ v23.8.90 nhưng trả lại chuỗi nhãn có sẵn để tránh phá kiểm tra 17 ngôn ngữ, cập nhật hai kiểm thử bố cục để chấp nhận chữ Chụp ảnh không chứa ký tự ▣. Bổ sung CSS che ký tự trang trí của nút DVR và giữ nguyên nhãn cho trình đọc màn hình. Bản phát hành v23.8.91 có tag riêng bất biến, không sửa v23.8.89 hoặc v23.8.90. [Release notes](RELEASE_NOTES_RUST_LAB_V23_8_91.md).

## Rust Lab v23.8.90 — Đồng bộ icon trình phát theo Web

Thay ký tự Unicode trong thanh điều khiển chính và toàn màn hình bằng bộ icon SVG mask từ `web/online`: phát/tạm dừng, kênh trước/sau, dừng, âm lượng, EPG, Cast, PiP, fullscreen, ghi hình, yêu thích và tùy chọn. Giữ nguyên video, event listeners, AI và cửa sổ CMD/PowerShell ẩn ngầm từ v23.8.89. Có regression test riêng. [Release notes](RELEASE_NOTES_RUST_LAB_V23_8_90.md).

## 4.23.17 — Cấu hình kiểm tra, Sidebar màu và tua lại tùy chỉnh
- Nút Snapshot/kiểm tra chuyển thành lựa chọn thật, tự lưu và đồng bộ.
- Bảng màu chuyển từ bánh xe sang sidebar, gộp với chế độ hiển thị; lựa chọn Sidebar gọn/đầy đủ.
- FFmpeg tua lại 5/10/15/30 phút, lưu tùy chọn và áp dụng lần khởi tạo mới.
- Thử nghiệm hỗ trợ MPEG-DASH (.mpd) bằng dash.js và proxy manifest/segment (không hỗ trợ vượt DRM).

## v4.23.16 — Desktop Chromium networking for HLS (2026-11-11)

- Prefer Electron Chromium `net.fetch()` for IPTV HLS manifest, segments, VOD and channel checks. Supports macOS/Windows system proxies and TLS setup.
- Preserve Node HTTP fetch solely as fallback after Chromium transport errors. Do not retry denied HTTP responses as alternate identities.
- Enhance local M3U diagnostics: explain DNS/TLS/connection errors and optionally compare with macOS curl without printing URL tokens.
- No automatic claims that blocked/unreachable streams are dead; DRM and provider restrictions remain respected.
- Regression tests for transport fallback, cancellation, HTTP denials and local proxy with Chromium-like injected fetcher.

## v4.23.15 — Live Events HLS / VOD compatibility & LIVE seek correction (2026-11-11)
- Đối chiếu file M3U do người dùng gửi: 557 kênh, 72 LIVE EVENTS (71 HLS, 1 MPEG-DASH); không phân loại phát theo nhãn nhóm.
- HLS.js phát sau MANIFEST_PARSED; tránh lỗi play() quá sớm, giữ kiểm tra thế hệ/attempt để chặn callback cũ sau failover.
- HTTP relay HLS tách thành module testable, dùng desktop browser-like User-Agent, không gửi Range khi lấy manifest, retry GET thường nếu segment range không được hỗ trợ.
- Nguồn HLS trả HTML, HTTP 403/404, nội dung không hợp lệ sẽ được báo chính xác; không biến lỗi upstream thành thành công giả.
- Thanh chọn vị trí chỉ hiển thị trên EVENT/VOD có vùng seekable thật; LIVE không hiện thanh chọn phân đoạn, vẫn có Tua lại 10 phút riêng.
- Phát hiện DASH .mpd và báo không được hỗ trợ thay vì đưa nhầm vào HLS.js. Không tự vượt DRM/xác thực.
- Công cụ chẩn đoán M3U tại scripts/diagnose-m3u.cjs (không tiết lộ URL đầy đủ). Không kèm playlist của người dùng.
- Kiểm thử: 173 đạt, 0 lỗi; 2 FFmpeg integration chạy riêng đạt; HTTP proxy dùng local server fixtures, chưa xác nhận được các host video bên ngoài.

## v4.23.14 — Stream Events / VOD & player usability (2026-11-11)
- Xác định HLS bằng nội dung manifest, kể cả URL thiếu .m3u8 hoặc trả application/octet-stream; proxy giữ đủ byte đầu tiên của TS/MP4.
- Phân biệt HLS EVENT, VOD và LIVE. Thanh chọn phân đoạn chỉ xuất hiện khi video thực sự có vùng seekable; sự kiện có thể tua khi máy chủ cho phép.
- Nút phát/tạm dừng/kênh trước/kênh sau/dừng/chụp/fullscreen có cùng đường kính hình tròn trong các theme.
- Fullscreen: overlay điều khiển chỉ hiện khi di chuột và tự ẩn khi ngừng tương tác.
- Phím tắt Xem TV: ←/→ chuyển kênh; ↑/↓ tăng/giảm âm lượng 5%; bỏ qua khi người dùng đang nhập liệu.
- Mở lại kênh gần nhất khi khởi động nếu còn trong nguồn đang bật; không tự tạo thêm playlist.
- macOS: đóng cửa sổ bằng nút đỏ sẽ thoát ứng dụng, không còn tiến trình giao diện ẩn.
- Không thay đổi DVR/Backup/EPG/Doctor, không chỉnh iOS/Android.
- **Giới hạn**: không xác minh được playlist nts12.s.gy trực tiếp từ môi trường kiểm thử; khả năng phát còn phụ thuộc codec/DRM/headers/địa lý/nhà cung cấp.

## v4.23.13 — Đồng bộ thanh cuộn và Cài đặt một cột

- Thanh cuộn dọc/ngang theo màu nhấn của phong cách hiện tại và bánh xe màu, bao gồm sidebar, danh sách kênh, EPG, Smart Discovery và chi tiết tác vụ.
- Cài đặt thu gọn thành **mỗi nhóm một hàng toàn chiều rộng**, bấm vào mới mở chi tiết; hỗ trợ Compact/Comfort.
- Bỏ liên kết Sao lưu/Khôi phục dư ở sidebar; chức năng Backup/Restore vẫn nằm tại **Cài đặt → Sao lưu & Khôi phục dữ liệu**.
- Không thay đổi cơ chế phát, ghi hình, Timeshift, EPG, nguồn M3U hay dữ liệu cá nhân.

## v4.23.12 – TV reference layout rebuild & accent fix

- Cinema TV: theater navigation, one actual video player at left, current/next programme information at right, channel carousel using existing playlist and real snapshots. Full channel list opens as a drawer.
- Glassmorphism: horizontal nav, 3 functional zones (channels / playable video / EPG). Liquid/glass effects stay on panels instead of obscuring the video.
- Broadcast Studio: 2×2 recent snapshot rack and actual current video. Snapshot cards are clearly not four live feeds; MultiView page remains the real multi-stream player.
- Bento Dashboard: welcome area and featured carousel above the main player; Swiss Editorial typography refined.
- Fix custom color wheel: removing the inset shadow that covered the saturation/value gradients, persisting explicit accent selection (`accentCustom`) and applying chosen color to buttons, active tabs, controls and progress across themes.
- Preserve existing original video element, IPC and DVR handlers while changing layouts; restore controls when leaving TV overlays.
- 11 interface styles, Compact / Comfort; no changes to IPTV streams, EPG parser, DVR or updater paths.

## 4.23.11 — Full-sync UI and TV dashboard layouts

- Unified 11 themes: Current, Minimalism, Material 3, Apple HIG, Liquid Glass, Cinema TV, Fluent 2, Glassmorphism, Broadcast Studio, Bento Dashboard, Swiss Editorial.
- Independent Compact/Comfort density persisted in localStorage and included in backup keys; adjusts navigation, channel rows, player controls, cards and settings throughout app.
- Theme palettes and structural layout per preset for Windows/macOS, including horizontal navigation in Cinema/Swiss, and full AMOLED black override.
- Consistent styling of all pages, EPG/DVR panels, Snapshot, popups, sources, forms, playback controls and footer; custom accent remains usable.
- Regression tests for 11 styles x 2 densities at 1000/1360px; verified footer visibility and no page-wide overflow. Electron installer testing is still required.
- No mobile changes and no automatic GitHub publication.

## v4.23.10 — Interface Style Picker (Windows/macOS)
- Add five selectable visual designs in Settings: Current, Minimalism, Material Design 3 inspired, Apple HIG inspired, Liquid Glass inspired.
- CSS-only changes across navigation, card shapes, controls, surface tones and effects; do not duplicate IPTV, DVR or network logic.
- Save a dedicated UI-style preference, initialize it before the stylesheet renders, and include it with namespaced Backup/Restore data.
- Keep Light/Dark/AMOLED/Auto, hue wheel, all eight app languages and the previous UI as a one-click revert.
- Reduced-motion and reduced-transparency fallbacks for accessible presentation; Liquid Glass effects confined to navigation/controls.
- Regression: 142 passing Node.js tests, two FFmpeg integration tests skipped by default; Chromium UI verified at 1000 and 1360 px.
- No packaged Windows EXE or macOS DMG runtime certification in this environment; GitHub remains unchanged.

## 4.23.9 – Snapshot / Smart Discovery Preview Fix
- Snapshot: nhấn ảnh mở đúng kênh trong trình phát; nếu nguồn tắt, hỏi trước khi bật, không thay đổi âm thầm.
- Snapshot: tự tìm kênh hiện có theo URL khi ID thay đổi; ảnh cũ không trùng URL chỉ ghép lại nếu tên kênh là duy nhất và người dùng xác nhận.
- Snapshot: bấm Enter/Space cũng mở kênh; nút yêu thích không làm chuyển trang.
- Smart Discovery: rê chuột lên kết quả để xem trước bằng luồng tạm không tiếng, không thêm nguồn hay đổi trạng thái kiểm tra.
- Dừng preview khi đổi trang, lọc hoặc render lại danh sách để tránh phát ngầm.

## v4.23.8 — Giao diện compact, AMOLED, bánh xe màu
- Tiến độ tác vụ mở bằng popup nhỏ nổi phía trên footer, không nới cao thanh trạng thái. Bấm bên ngoài hoặc Escape để thu lại.
- Cài đặt chuyển sang các nhóm thu gọn; chỉ mở mục cần chỉnh, tự mở nhóm EPG/Backup từ điều hướng.
- Bổ sung AMOLED đen tuyệt đối và bánh xe màu hỗ trợ kéo, chọn sắc độ và độ sáng; lưu lựa chọn.
- Giữ nguyên chức năng phát IPTV, EPG, DVR, Doctor, Discovery, Backup, Win/macOS.

## v4.23.7 — Compact footer tasks / instant channel scan / startup EPG presets
- Move the check/snapshot task dock into the bottom-right status footer, collapsed by default; expanding it reflows rather than overlays controls.
- Run channel validation directly from the TV quick action, without switching page.
- Enable XMLTV startup refresh once by default on upgrade; user can switch it off after upgrade. Add optional published EPGShare01 and IPTV-EPG.org country feeds; only Vietnam enabled by default. Preserve user-added sources and preferences.
- Make multi-source EPG deduplication linear in the number of programmes instead of rebuilding a full set for each feed.
- Regression checks: Node.js, Chromium UI at 1000/1360 px, EPG manual import and opt-out. No actual Windows/macOS packaged runtime validated.

## v4.23.6 — EPG Auto Refresh / Manual Import (Windows/macOS)
- Optional per-launch refresh for enabled XMLTV sources. Off by default, only once per session; skips startup when no M3U channels exist.
- Manual secure XMLTV import (.xml, .xmltv, .gz) through OS file chooser with bounded gzip decompression and format validation.
- Import requires confirmation before replacing existing guide; old data is preserved on failure, cancellation, or unusable content.
- Existing remote XMLTV refresh remains accessible on EPG page and settings. DVR/Replay and other desktop capabilities unchanged.

## v4.23.5 — MP4 DVR + 10-minute Replay (Windows/macOS)

- Full scheduled DVR recordings finish as valid `.mp4` files with channel, local start/end and EPG/manual programme title in the filename.
- Capture to `.part.ts`, verify TS evidence, stream-copy remux to `.part.mp4`, validate MP4 and atomically rename when complete. Preserve TS if conversion fails, disk is full or app exits; show "Finalizing MP4" state.
- Replay buffer: 5 minutes → ~10 minutes, controls −10s / −30s / LIVE plus buffer toggle, bounded temporary storage and disk reserve.
- Automatic EPG title lookup for quick/manual schedule when a programme overlaps the selected time; retain explicit user title.
- Source-only change for desktop; no git push or native installer validation claimed.

## v4.23.5 — DVR controls inside Timeshift + non-overlay task dock (Windows/macOS)

- Exposed safe scheduled recording from the watch page Timeshift section, with current-channel prefill, start/end fields, confirmation and status for active/upcoming recordings.
- Quick link opens the existing full EPG recording management page, preserving stop/cancel/file-location behavior.
- Moved task progress from a fixed overlay to a collapsible in-flow panel at the bottom of the main window, so it no longer obscures playback buttons.
- Retained DVR FFmpeg worker isolation, Windows build repairs and the full v4.23.3 feature set.
- Tested Node.js regressions and desktop Chromium UI at 1000 and 1360 px; packaged source only, not built native installers.

## v4.23.3 — Safe Scheduled Recording (DVR), Windows/macOS (source only)

- Hẹn giờ ghi chương trình trực tiếp từ EPG hoặc nhập lịch thủ công, chọn thư mục, xem tiến độ và hủy/dừng.
- Một tiến trình FFmpeg stream-copy MPEG-TS độc lập; giới hạn một bản ghi tại một thời điểm, từ chối lịch trùng; ưu tiên ổn định phát IPTV và Timeshift.
- Lưu lịch bằng ghi file nguyên tử; xử lý lịch bỏ lỡ, khởi động lại, tiến trình lỗi, thoát sớm, dung lượng đĩa thấp, gián đoạn, hoàn tất.
- Chỉ `.ts` hoàn chỉnh được báo thành công; bản dở giữ dưới `.partial.ts` / `.interrupted.ts`; không tự ghi đè.
- Backup/Restore bổ sung lịch tương lai, không bao gồm video; hỗ trợ Backup cũ.
- Thêm bộ test mô phỏng FFmpeg, test luồng MPEG-TS thật và kiểm thử giao diện Chromium cho hai độ rộng.
- Giữ v4.23.2 làm mốc; chưa build thử DMG/EXE trên thiết bị thật, chưa publish GitHub.

## v4.23.2 — Desktop Stability & UI/Logic Audit (Windows/macOS)
- Doctor 3.0: scan ALL without channel count truncation, stale-only and quick presets, bounded workers, progress/cancel, guards against false Alive/Die.
- Smart Discovery: evidence-gated stream status, resume unchecked channels in ALL mode, load-more results, catalog-switch preview invalidation.
- Source import/refresh: rollback on localStorage quota error, visible warning; asynchronous bounded local-file reading.
- M3U: corrected comma parsing inside quoted EXTINF fields and case-insensitive metadata handling.
- Regression tests extended for scans >1,000 channels, cancellation, unsafe classifications, source parsing and screen integration.
- Source only; no claimed native macOS/Windows binary or GitHub Release. iOS/Android unchanged.

## v4.23.1 — Source Manager + Discovery đa nguồn (Desktop)
- Gộp Smart IPTV Discovery vào Quản lý nguồn, bỏ mục menu riêng.
- Danh mục mới: iptv-org theo quốc gia, danh mục, ngôn ngữ, toàn cầu; Free-TV/IPTV chọn lọc.
- Thêm **Kiểm tra tất cả không giới hạn số kênh**, hoặc kiểm tra nhanh tối đa 1.000 kênh mỗi lượt, 2–8 worker, tiến độ, hủy, tìm kiếm và lọc trạng thái.
- Chỉ tải các danh mục được phép; vẫn yêu cầu xác nhận trước khi nhập, giữ nguyên nguồn cũ.
- Giữ nguyên Smart IPTV Doctor 3.0, Backup/Restore và bộ tính năng Full Desktop.

# Changelog

## 4.23.0 — Smart IPTV Discovery + Doctor 3.0 (Windows/macOS)

- Thêm mục Smart Discovery: chọn quốc gia (mặc định VN), tải playlist iptv-org HTTPS trong giới hạn, kiểm tra theo đợt 10–50 kênh, tối đa ba luồng, và phân biệt có bằng chứng phát / Die đã lặp lại / Chưa rõ. Không theo redirect lạ trong nguồn danh mục.
- Có nút chỉ nhập kênh đã xác minh Sống hoặc nhập playlist gốc sau cảnh báo và xác nhận. Nguồn nhập không tự được collector cập nhật/gộp.
- Doctor 3.0: xếp hạng dựa trên lịch sử phát, thời gian mở kênh, độ trễ và sự cố; đề xuất metadata, xác minh thêm 10–40 kênh, JSON; link dự phòng cần xác nhận và có Hoàn tác.
- Backup/Restore nhận cả dữ liệu Doctor v3; không thay khả năng khôi phục bản 4.22.2.
- Giữ nguyên Doctor v2, chức năng desktop Full và giao diện gốc. Không chạm Android/iOS. Chưa phát hành bộ cài hoặc push GitHub.


## v4.22.2 — Full Desktop Backup / Restore (Windows/macOS)

- Thêm nút **Backup / Restore** tại giao diện desktop và phần Cài đặt.
- Xuất/nhập `.iptvbackup`: danh sách nguồn M3U, kênh, yêu thích, nhóm, hồ sơ/PIN theo định dạng hiện lưu, cài đặt giao diện/EPG/Doctor; có thể kèm ảnh Snapshot JPG.
- Kiểm tra định dạng dữ liệu và SHA-256 của ảnh khi khôi phục. Hiển thị xem trước, yêu cầu xác nhận; ảnh cũ không bị ghi đè, cài đặt được rollback nếu thao tác ghi thất bại.
- Giới hạn file 128 MB; bản sao lưu **không mã hóa** và không chứa Timeshift buffer / app installer.
- Cập nhật hướng dẫn, README, release notes và script GitHub; giữ nguyên FFmpeg, Timeshift, MultiView, Cast/AirPlay, Doctor, EPG và tám ngôn ngữ.
- Chỉ sửa Windows/macOS. Android/iOS giữ nguyên; push mã nguồn không đồng nghĩa đã phát hành installer trên Releases.

**English:** Adds verified, confirmed local backup/restore of playlists, favorites, settings, profiles, EPG and optional Snapshot files. Replaced settings roll back on failure; backup files are not encrypted. Desktop only.

## 4.22.1 — Desktop stability (Windows/macOS)

- Sửa downloader cập nhật: giới hạn dung lượng an toàn, tránh ngoại lệ không được bắt trong sự kiện streaming, phát hiện kết nối ngừng nhận dữ liệu.
- Cấu hình build xác nhận file bộ cài tồn tại thực tế trước khi báo thành công.
- Giao diện hiển thị đúng phiên bản; hạn chế điều hướng khỏi entry file; bộ nhớ stderr FFmpeg có giới hạn.
- Giữ nguyên bộ FFmpeg và chức năng Timeshift Full. Android/iOS tạm dừng.

## 4.22.0 – Repository cố định, cập nhật tương thích và icon macOS

- Bỏ ô repository có thể nhập; dùng `trisanghy/open-iptv-pro` làm nhà phát hành mặc định.
- Không từ chối toàn bộ Release khi tag không đúng mẫu `vX.Y.Z`; nhận diện phiên bản từ tag, tên và tên bộ cài; tìm bản tương thích trong Releases.
- Không đề xuất bản cũ; chọn đúng hệ điều hành/kiến trúc, tự tải có tiến độ khi tùy chọn được bật; giữ xác minh SHA256 hoặc chữ ký trước khi cài.
- Thay icon điều hướng bằng SVG bo tròn đồng bộ, tăng khả năng nhìn và tương phản, giữ giao diện 8 ngôn ngữ.
- Giữ toàn bộ FFmpeg, Timeshift, Snapshot, MultiView, Cast/AirPlay và tính năng Full.

**English:** Fixed official repository, flexible Release/version matching, platform-aware verified downloads, macOS-inspired sidebar icon set, all Full features preserved.

## 4.21.0 – M3U URL Editor + Cast/AirPlay (Desktop Full)

- Sửa URL nguồn M3U đã lưu, giữ danh tính nguồn, kênh khớp, thư mục và Yêu thích; thay thế chỉ sau tải và kiểm tra thành công.
- Tìm Google Cast qua mDNS, gửi kênh lên Chromecast/Google TV bằng Default Media Receiver.
- Máy chủ relay LAN tạm thời kèm liên kết ký HMAC cho manifest HLS và segment, không dùng proxy 127.0.0.1 trên TV.
- AirPlay dùng trình phát Safari trên macOS; hỗ trợ link LAN cho trình duyệt TV.
- FFmpeg nhúng, Timeshift, Snapshot, MultiView, Doctor và 8 ngôn ngữ được giữ nguyên.
- Source code tests + simulated UI tests; chưa thử trên thiết bị TV thật.

---

## v4.20.0 — Fix GitHub updater, keep full FFmpeg and Timeshift (2026-11-08)
- Báo rõ khi GitHub chỉ có commit mã nguồn, chưa có Release hoặc chưa có bộ cài đúng kiến trúc.
- Thiếu SHA256SUMS.txt/digest thì không tự tải bộ cài chưa được xác minh.
- Electron autoUpdater thất bại sẽ chuyển sang tải bộ cài đã kiểm tra SHA256 nếu Release có checksum.
- GitHub Actions tạo Mac Intel + Apple Silicon trên máy build riêng, gộp manifest latest-mac.yml cho cả hai.
- Không bỏ chức năng, vẫn tích hợp FFmpeg, Timeshift, Snapshot 32 luồng, MultiView và 8 ngôn ngữ.

## v4.19.0 — Full UI (2026-11-08)

- Khôi phục FFmpeg nhúng trong bộ cài Mac/Windows (không yêu cầu cài riêng).
- Timeshift 5 phút, tự bật Timeshift, Snapshot hàng loạt tối đa 32 tác vụ, MultiView, EPG, Doctor 2.0, kiểm tra 32 luồng, Failover, PiP, Auto Update: giữ nguyên.
- Cải thiện giao diện: nhóm công cụ nhanh có thể mở rộng, đưa liên kết tới các mục kiểm tra/ảnh chụp/Timeshift vào Cài đặt, gộp báo cáo Doctor thành một hành động.
- Giữ sửa lỗi luồng video dài hơn 25 giây trong proxy từ v4.18.
- Khôi phục Windows Setup và Portable; macOS DMG/ZIP, Intel/Apple Silicon.

**English:** Bundled FFmpeg restored. No desktop feature removed; only UI organization is simplified.

# Changelog

## v4.18.0 — Lite builds, stable long-running streams, compact UI
- Removes bundled FFmpeg; FFmpeg-dependent timeshift/bulk captures remain available when installed externally.
- Targets architecture-specific macOS builds (ARM64 or Intel) and one Windows NSIS installer, retaining 8 Electron locales.
- Fixes upstream proxy aborting healthy long-running video streams after a 25-second handshake timeout. Bounds HLS manifests while reading.
- Caps HLS memory/buffers, video quality to player dimensions, and MultiView tile buffers. Caches short media-type probes; retries recoverable decoding faults once.
- Unifies Doctor reporting/actions, removes duplicate worker settings and the redundant player quick-action strip. No changes to Android/iOS.


## v4.17.0 — Smart IPTV Doctor 2.0, Freeze Monitor, Visual Snapshot Review
- On-device frozen-frame/black-screen warning for the playing channel.
- Snapshot perceptual hash comparisons with conservative, review-only duplicate suggestions.
- Evidence-based diagnostic recommendations with explicit confirmation and undo.
- Offline JSON reporting; 8-language support for newly added primary controls.
- Windows/macOS only; no Android/iOS changes.


## v4.16.0 — Thông báo, tải và cài bản cập nhật
- Kiểm tra GitHub Releases theo repository chính thức, tự thông báo khi mở ứng dụng nếu được bật.
- Tải bộ cài mới kèm tiến độ, xác minh SHA256 và chỉ cài khi người dùng xác nhận.
- Bản có chữ ký số và metadata hợp lệ dùng electron-updater; bản chưa ký hoặc portable mở bộ cài thủ công.
- Thêm GitHub Actions phát hành bộ cài, ZIP cập nhật Mac, latest.yml/latest-mac.yml và SHA256SUMS.txt.
- Không sửa Android/iOS, playlist, dữ liệu Snapshot hoặc Yêu thích.


## v4.14.0 — Flat icon + Android/iOS source
- Thay logo app desktop thành tam giác Play đặc, gradient xanh ngọc–xanh dương–tím trên nền trắng, không có chữ, không Liquid Glass.
- Bổ sung source app Android/iOS Capacitor 8 trong `mobile/`, giao diện cảm ứng riêng cùng parser M3U/EPG với desktop.
- Thêm scripts tạo Android debug APK, mở dự án iOS bằng Xcode, tạo icon native tự động.
- Không thay đổi cơ chế nguồn/yêu thích desktop từ v4.13. Các tính năng cần FFmpeg/Electron chưa port mobile.


## v4.13.0 — Đồng bộ Yêu thích và icon mới
- Tất cả các nút sao ở Xem TV, trình phát, Yêu thích và Snapshot dùng chung trạng thái theo danh tính kênh ổn định.
- Thao tác bật/tắt sao cập nhật ngay bộ đếm, danh sách lọc và khung đang phát; giữ vị trí cuộn khi đổi sao trong danh sách.
- Đồng bộ lựa chọn yêu thích vào hồ sơ đang hoạt động; làm mới hoặc đổi/xóa/bật/tắt nguồn tự cập nhật danh sách hiển thị.
- Snapshot có nút sao riêng; nhấn không tự mở kênh.
- Thiết kế lại icon Play cân đối, nền sáng và chuyển màu tím–xanh, xuất PNG/ICO/ICNS/SVG.


## v4.12.0 — 32 checks & 32 snapshots
- Tăng trần tác vụ kiểm tra link và FFmpeg Snapshot từ 16 lên 32; giữ mặc định 4 và lưu riêng từng cấu hình.
- Cập nhật cả hai hộp chọn nhanh và phần kiểm tra / sửa link dự phòng của playlist gộp.
- Không thay đổi chính sách bảo thủ Sống / Die / Chưa rõ và trạng thái Yêu thích.
- Bộ thử giả lập đo được 32 kiểm tra và 32 Snapshot chạy đồng thời; không đo trên nguồn mạng thực.

## v4.11.0 — Tùy chỉnh kiểm tra & Snapshot 1–16 luồng
- Hai tùy chọn tốc độ độc lập trong Cài đặt (1–16, mặc định 4), lưu với playlist/cấu hình đã có.
- Chọn nhanh và đồng bộ với Cài đặt tại Quản lý nguồn → Kiểm tra & sửa, và trang Snapshot.
- Kiểm tra toàn bộ kênh theo số luồng đã chọn; vẫn phân loại Sống/Die/Chưa rõ theo bằng chứng nhiều vòng.
- Kiểm tra & thay link dự phòng của playlist gộp cũng dùng mức song song 1–16.
- Chụp Snapshot nâng tối đa từ 8 lên 16 tiến trình FFmpeg; tiếp tục tách biệt hai tác vụ.
- Hiển thị mức song song trong bảng tiến độ; nút hủy và dữ liệu không thay đổi.
- Bổ sung kiểm thử giới hạn đồng thời (40 luồng mẫu, 2 lần chạy mỗi tác vụ) và trường hợp playlist gộp cũ thiếu `alternates`.

## v4.10.0 — Channel drag-and-drop and parallel fast Snapshot
- Thêm kéo thả kênh từ danh sách vào thư mục khác, kể cả thư mục gập/trống; giữ thứ tự thư mục, tùy chọn chuyển thủ công và dữ liệu nguồn.
- Chụp ảnh đồng thời 1/2/4/6/8 luồng FFmpeg, mặc định 4; lưu tùy chọn trong ứng dụng.
- Mặc định bỏ qua các kênh đã có snapshot, tránh chụp trùng URL; tùy chọn làm mới tất cả ảnh.
- Hạn chế thời gian chờ FFmpeg 12 giây/luồng, tăng tốc chuẩn bị ảnh thumbnail 384px, lưu từng lô và tối ưu danh sách ảnh lớn.
- Bổ sung bài thử GUI kéo thả, 4/2 worker song song, đồng bộ Cài đặt/Snapshot và bộ đếm khi bỏ qua ảnh.

## v4.9.0 — Favorites sync, conservative channel checking, refreshed logo
- Di chuyển dấu sao từ URL sang danh tính kênh, tự đồng bộ khi thêm, làm mới, tắt, xóa nguồn; giảm trùng khi cùng kênh ở nhiều nguồn.
- Sửa hồ sơ người lớn/trẻ em để giữ danh sách yêu thích riêng; tương thích dữ liệu từ các bản cũ.
- Giảm báo Die nhầm: thử lại không Range, thử 2 User-Agent; HLS kiểm tra segment mới, nhận diện MPEG-TS/fMP4; HTTP tạm thời thành Chưa rõ. Die chỉ khi URL luồng chính trả 404/410 nhiều vòng.
- Khi có bằng chứng phát video thực, cập nhật Sống và ghi nhận đúng link chính/dự phòng.
- Nâng cấp kết quả Die từ checker cũ thành Chưa rõ để kiểm tra lại, không xóa nguồn/ảnh/Yêu thích.
- Thay thiết kế icon, thêm SVG vector và các tài nguyên Mac/Windows.
- Thêm kiểm thử hồi quy danh sách Yêu thích, trạng thái nguồn, HLS và các lỗi máy chủ giả lập.


## v4.8.0 — Light / Dark / Auto appearance, consolidated link checks
- Thêm lựa chọn giao diện Sáng / Tối / Tự động theo chế độ macOS/Windows, cập nhật ngay khi hệ thống thay đổi và lưu thiết lập.
- Giữ bánh xe chọn màu/biểu tượng và mọi dữ liệu nguồn đã lưu.
- Bỏ mục Kiểm tra link riêng ở thanh bên, thêm nút Kiểm tra toàn bộ kênh ở Quản lý nguồn → Kiểm tra & sửa, dùng lại bộ kiểm tra nhiều vòng và tiến độ theo thời gian thực.
- Lối tắt kiểm tra ở trang TV và Smart IPTV Doctor dẫn về Quản lý nguồn.
- Thêm bài kiểm thử UI cho 3 chế độ giao diện, tự đổi theo hệ thống và đường kiểm tra mới.


## v4.7.0 — Nguồn hợp nhất & icon sáng
- Gộp **toàn bộ** workflow Thu thập → Gộp kênh → Kiểm tra/sửa → Xuất/Hoàn tác vào trang Quản lý nguồn.
- Xóa menu Thu thập & sửa kênh riêng; loại bỏ nút gộp trùng lặp.
- Thêm thanh điều hướng nhanh giữa các phần của Quản lý nguồn.
- Làm mới icon ứng dụng sang nền sáng, Play đa sắc kiểu Material, cân đối và rõ ở kích thước nhỏ.


## v4.6.0 — Default Timeshift, preview everywhere, source management merge
- Add a persistent opt-in setting to auto-enable the 5-minute local FFmpeg Timeshift after a LIVE channel begins playing. Keep the browser-only preview mode disabled; guard against duplicate starts and channel-switch races.
- Reuse one muted hover preview for TV, Favorites, Snapshot library, EPG guide/results and Channel Health table.
- Move the duplicate-channel merge workflow into Quản lý nguồn: source selection, dry-run analysis, explicit apply and local undo; retain public repository discovery and verified repair separately.
- Preserve original source-channel entries on undo, including when URL playlists were refreshed during merging.
- Add synthetic UI tests for these flows and update Vietnamese/English usage guides and screenshots.

## v4.5.0 — Read-only playlist discovery & repair
- Removed GitHub/Gist upload UI, token form, publish IPC and upload scripts.
- Added read-only discovery of public `.m3u/.m3u8` files in a GitHub repository by URL.
- Added selected-source collection, safe merge, deduplication, fallback URLs, deep verification and backup promotion only on confirmed live status.
- Added cleaned verified-only M3U export, rollback, opt-in refresh every 60 minutes while application is running, and live reports.
- Original sources are retained and not overwritten by unverified candidates.


## v4.4.0 — MultiView, Timeshift, Failover, Smart EPG, Health, Profiles and Doctor
- Add four-tile Multiview with muted background audio and hover-to-unmute one tile.
- Add opt-in FFmpeg local rolling 5-minute HLS Timeshift buffer and seek controls.
- Add manual/duplicate-name failover, stream startup timeout and stall detection, configurable HLS buffering.
- Add Smart EPG manual matching, offset, search and in-app reminders plus catch-up source template playback.
- Add silent hover previews, profile favorites, child-group restrictions with PBKDF2 PIN, and offline IPTV Doctor reports.
- Add tests for new functions, local MPEGTS FFmpeg buffer and advanced UI pages.


## v4.3.0 — Grouped snapshots and independent live tasks
- Snapshot library now follows the same custom/M3U folder order as the channel list, in a compact five-column layout on wide windows (responsive below 1200px).
- Stream checking and bulk snapshots now run concurrently, with separate progress, cancellation and counters.
- Realtime link-check results show each completed channel as **Sống**, **Die**, or **Chưa rõ**, including live totals; individual channel badges update immediately.
- A collapsible task monitor stays visible while navigating to other pages.
- Added synthetic-data GUI regression test for 5-column grouping and simultaneous check/snapshot workloads.

## v4.2.0 — Folder order, drag-drop, EPG matching and icon polish
- Giữ thứ tự thư mục theo thứ tự xuất hiện trong file M3U, không tự sort alphabet ngoài ý muốn.
- Khi đóng/mở thư mục trong danh sách kênh, giữ lại vị trí cuộn thay vì nhảy về đầu trang.
- Thêm kéo thả để sắp xếp lại thứ tự thư mục ở trang thư mục và ngay trong danh sách kênh.
- Cải thiện ghép EPG bằng `tvg-id`, tên kênh và alias trong XMLTV; ưu tiên ghép chính xác hơn cho kênh Việt Nam.
- Làm lại icon tam giác cân hơn; màu icon trong giao diện đổi theo màu theme đã chọn.

## v4.1.0 — EPG, PiP, theme wheel, release check
- Thêm lịch phát sóng XMLTV (đang phát / sắp phát), ghép theo `tvg-id`, nhóm tên hiển thị, nhiều nguồn EPG tùy chọn.
- Cài sẵn đường dẫn EPG công khai cho VN, Singapore, Thailand, UK; nguồn mặc định chỉ tải khi nhấn cập nhật.
- Thêm Picture-in-Picture (PiP), hỗ trợ tùy video/nền tảng.
- Thêm bánh xe màu và color picker; nhớ màu sau khi khởi động.
- Thêm kiểm tra cập nhật từ GitHub Releases trong Cài đặt; không cài hoặc cập nhật âm thầm.
- Bỏ hai badge “LIVE IPTV” và “Đang phát” phủ lên hình video.
- Tài liệu nguồn EPG, thử nghiệm XMLTV/gzip và release check; 5 test lõi mới.

## 4.0.0 — Source preview
- Rename StreamLeaf IPTV to Open IPTV Pro; use purple 3D play icon.
- Add M3U channel folder tree, custom folders and channel moves.
- Add attached thumbnail snapshots and desktop disk-based persistence.
- Add fit/fill/stretch/original video sizing and fullscreen safe-area CSS.
- Publish MIT source license, third-party notices, GitHub scripts, CI, docs.

## 4.22.2 — Backup/Restore desktop (chưa phát hành)

- Backup & Restore file `.iptvbackup`: lưu cấu hình, playlist, favorites, hồ sơ, EPG, tùy chọn ảnh Snapshot.
- Trình chọn file gốc Electron, xác nhận trước khi ghi đè, rollback cấu hình nếu lỗi, kiểm tra SHA-256 cho ảnh.
- Thêm phím tắt ở sidebar và card Cài đặt; bổ sung dịch giao diện 7 ngôn ngữ.
- Chưa publish GitHub và chưa sửa iOS/Android.

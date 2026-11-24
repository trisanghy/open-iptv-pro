# Positron — Nhật ký tính năng theo phiên bản

**Ưu tiên: tính năng mới hữu ích, không chỉ sửa giao diện.**

Trang này được tạo tự động từ GitHub Actions Artifacts và Releases lịch sử. Bấm vào từng phiên bản để đọc mô tả, mở ảnh và tải EXE.

[Mở WEBSITE changelog tương tác](https://raw.githack.com/trisanghy/open-iptv-pro/Positron/docs/positron-features/index.html) · [Giao diện HTML trong repository](index.html) · [Các bản phát hành](https://github.com/trisanghy/open-iptv-pro/releases) · [Nhật ký Git tiếng Việt](LOG_GIT_TIENG_VIET.md) · [Quy tắc ưu tiên tính năng](../../POSITRON_FEATURE_RULES.md)

<details>
<summary><strong>P5.1.351</strong> · QA độc lập kênh IPTV, bảo toàn playlist và thông luồng phát hành · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.436 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — khắc phục lỗi CI capture ngăn phát hành Mac/Windows, do 561 dữ liệu kênh QA tồn tại từ giai đoạn trước khiến bài audit trạng thái rỗng thất bại; bảo toàn dữ liệu nguồn và quyền riêng tư. Feature class: AI

![Ảnh chụp Electron thật P5.1.351](./screenshots/positron-p51351-source-state-isolation-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51351-source-state-isolation-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45293323822) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45293649622) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/tree/Positron) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c7ce8c20280ecf33448bcdd95a3e2ac17d1a77d3)

</details>

<details>
<summary><strong>P5.1.350</strong> · Nút nhập nguồn hợp pháp trong WatchFlow chưa có kênh (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.435 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh thật P349 cho thấy WatchFlow Intelligence chưa có playlist chỉ hiển thị một dòng hướng dẫn, trong khi thao tác nhập nguồn nằm bên ngoài bảng AI. Thêm lối vào Quản lý nguồn ở đúng trạng thái trống, không tự nhập hoặc phát kênh. Feature class: AI

![Ảnh chụp Electron thật P5.1.350](./screenshots/positron-p51350-legal-source-onboarding-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51350-legal-source-onboarding-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45290246782) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45290246769) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45290246769/artifacts/14873817054) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45290246769/artifacts/14874321156) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45290246769/artifacts/14873089513) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4917b25c49bd7d292733113e213a89359fb6b44a)

</details>

<details>
<summary><strong>P5.1.349</strong> · Hướng dẫn AI cuộn được và không che nút chế độ (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.434 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P348 720×900 cho thấy cửa sổ hướng dẫn phím phủ cả sáu nút chuyển chế độ AI; người dùng không thể nhìn đủ các lựa chọn khi mở trợ giúp. Cần một bảng trợ giúp cuộn được phía dưới lưới chế độ, vẫn giữ toàn bộ lệnh. Feature class: AI

![Ảnh chụp Electron thật P5.1.349](./screenshots/positron-p51349-help-below-modes-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51349-help-below-modes-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45289336657) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45289336686) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45289336686/artifacts/14874010630) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45289336686/artifacts/14874050683) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45289336686/artifacts/14872449001) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/75654e84f6a1b9b399cb4988f516038214523ccb)

</details>

<details>
<summary><strong>P5.1.348</strong> · Esc thu gọn hướng dẫn AI khi focus đang ở chế độ khác (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.433 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thực P347 cho thấy hướng dẫn AI nằm trên các nút chế độ khi bung ra; người dùng remote có thể chuyển focus sang chế độ khác, nên Esc phải đóng riêng hướng dẫn đầu tiên thay vì đóng cả WatchFlow đang sử dụng. Feature class: AI

![Ảnh chụp Electron thật P5.1.348](./screenshots/positron-p51348-escape-other-focus-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51348-escape-other-focus-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45288452957) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45288453026) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45288453026/artifacts/14872813888) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45288453026/artifacts/14873301121) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45288453026/artifacts/14873865132) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a4f57ec93e1991988997ecee8c6a70a9160e205f)

</details>

<details>
<summary><strong>P5.1.347</strong> · Đóng hướng dẫn AI sau thao tác ngoài bảng (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.432 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P346 720px cho thấy hướng dẫn phím che các nút chế độ AI; cho phép chạm bên ngoài lớp hướng dẫn để đóng riêng lớp đó, tránh nhấn nhầm hoặc mất bảng WatchFlow, nhất là khi dùng remote và màn hình hẹp. Feature class: AI

![Ảnh chụp Electron thật P5.1.347](./screenshots/positron-p51347-auto-dismiss-mode-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51347-auto-dismiss-mode-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45287348167) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45287352330) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45287352330/artifacts/14871009784) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45287352330/artifacts/14871494611) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45287352330/artifacts/14872501761) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b1e23d5a155108165ec400331ac957e30b3e0d4b)

</details>

<details>
<summary><strong>P5.1.346</strong> · Esc thu gọn hướng dẫn trước khi thoát WatchFlow (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.431 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh thật P345 đã mở cho thấy hướng dẫn phím chiếm phần lớn màn hình 720px khi mở; remote cần một phím Esc đóng lớp hướng dẫn mà không thoát toàn bộ WatchFlow và không làm mất focus. Feature class: AI

![Ảnh chụp Electron thật P5.1.346](./screenshots/positron-p51346-escape-guide-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51346-escape-guide-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45283577787) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45283577752) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45283577752/artifacts/14869343522) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45283295689/artifacts/14869919237) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45283577752/artifacts/14871445682) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d45c93293ba1e3f836bcbcef1ac3b2aa975b2406)

</details>

<details>
<summary><strong>P5.1.345</strong> · Phím điều khiển AI mở gọn bằng remote (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.430 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P344 cho thấy PageUp/PageDown chạy đúng nhưng chỉ có hướng dẫn Alt+Shift+J; người dùng bàn phím/remote không biết đủ các phím khi danh sách dài, trong khi thêm nhiều nút vào header sẽ che nội dung. Feature class: AI

![Ảnh chụp Electron thật P5.1.345](./screenshots/positron-p51345-shortcut-guide-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51345-shortcut-guide-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45281216128) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45281477191) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45281216084/artifacts/14870500777) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45281216084/artifacts/14869118109) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45281216084/artifacts/14870835449) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1d98d985370cae1787396531dd2836ee3395a8e7)

</details>

<details>
<summary><strong>P5.1.344</strong> · PageUp/PageDown duyệt gợi ý AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.429 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người dùng TV/remote có danh sách 8 gợi ý AI phải bấm mũi tên từng lần hoặc Home/End; nay PageUp/PageDown di chuyển nhanh năm thẻ mà vẫn giữ nút Xem trong tầm nhìn. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45280194558) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45279993093/artifacts/14870080723) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45279993093/artifacts/14868839828) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45279993093/artifacts/14868784689) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/8491fd93382f315f44dc78d0520e9cfea75cd8f6)

</details>

<details>
<summary><strong>P5.1.343</strong> · Home/End nhảy đầu/cuối gợi ý AI bằng remote (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.428 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi danh sách AI có nhiều gợi ý, dùng phím mũi tên đi từng thẻ rất chậm. Bổ sung Home/End từ nút Xem để nhảy ngay đến thẻ đầu/cuối mà vẫn thấy tiêu đề, nút phát và tên kênh ở dải thông tin, không tự phát. Feature class: AI

![Ảnh chụp Electron thật P5.1.343](./screenshots/positron-p51343-home-end-ai-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51343-home-end-ai-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45274413610) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45274413917) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45274413917/artifacts/14866203804) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45274413917/artifacts/14866776502) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45274413917/artifacts/14865929476) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f6b509afc266298313db6e42a75f8fe4f940c2bc)

</details>

<details>
<summary><strong>P5.1.342</strong> · Điều hướng gợi ý AI hiển thị trọn tiêu đề (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.427 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi chuyển gợi ý bằng bàn phím hoặc remote, ứng dụng tự tính vùng trống và căn lại vị trí cuộn theo toàn bộ thẻ thay vì chỉ đưa nút Xem vào màn hình, giúp đọc tên kênh chính xác trên màn hình hẹp trước khi phát video. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45273925096) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d15916b766112cffc54bba95a7d1a945477eec89)

</details>

<details>
<summary><strong>P5.1.341</strong> · Remote lên/xuống duyệt gợi ý AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.426 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Các phím Alt+Shift+J/K/P của WatchFlow AI dùng trên bàn phím PC nhưng không thuận tiện khi điều khiển bằng remote TV hoặc phím mũi tên cơ bản. Bổ sung ArrowUp/ArrowDown trực tiếp khi nút Xem đang được focus, tự cuộn và quay vòng danh sách. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45271955389) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45271051956/artifacts/14866015886) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45271051956/artifacts/14864118613) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45271051956/artifacts/14865856150) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9aeb3f124a8153576efa57d471c22f5d94054b53)

</details>

<details>
<summary><strong>P5.1.340</strong> · AI mở tên kênh đầy đủ bằng bàn phím (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.425 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ở giao diện WatchFlow AI 720px, chip tên kênh P339 cố ý rút gọn để tránh chiếm chỗ; nhưng remote và bàn phím không có hover để biết tên đầy đủ. Bổ sung phím xem thông tin kênh và chủ đề khi cần, luôn theo gợi ý đang focus. Feature class: AI

![Ảnh chụp Electron thật P5.1.340](./screenshots/positron-p51340-full-channel-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51340-full-channel-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45269675922) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45269675753) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45269675753/artifacts/14864328435) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45269675753/artifacts/14863484978) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45269675753/artifacts/14864695944) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2c1d2623c935f24a3797d87c11e321eab7c2422e)

</details>

<details>
<summary><strong>P5.1.339</strong> · AI luôn hiện tên kênh đang chọn khi cuộn (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.424 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi điều hướng các gợi ý bằng Tab/J/K/P trên cửa sổ hẹp, card được cuộn vào vùng nhìn và tiêu đề tên kênh phía trên thẻ có thể bị thanh sticky che; người dùng chỉ thấy nút Xem mà không biết chính xác kênh nào. Thêm ngữ cảnh tên kênh đang focus vào tiêu đề cố định, không cần phát video. Feature class: AI

![Ảnh chụp Electron thật P5.1.339](./screenshots/positron-p51339-channel-context-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51339-channel-context-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45268221504) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45268221218) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45267804870/artifacts/14863314566) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45268221218/artifacts/14863348327) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45268221218/artifacts/14864436825) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6f36f965965fa0731baf2acc50d0e38632e35659)

</details>

<details>
<summary><strong>P5.1.338</strong> · AI điều hướng ngược gợi ý qua Alt+Shift+P (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.423 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người dùng trước đây có thể nhấn Alt+Shift+K để đi tới gợi ý kế nhưng không thể quay về gợi ý trước mà không Tab qua các nút đánh giá; bổ sung hành trình hai chiều thực sự cho WatchFlow AI trên remote và desktop. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45266137724) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45266137724/artifacts/14862986883) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45266137724/artifacts/14861404732) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45266137724/artifacts/14863631195) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/cba8548e75890958781dd6fe1f817612079d616c)

</details>

<details>
<summary><strong>P5.1.337</strong> · AI đồng bộ vị trí gợi ý với Tab, chuột và remote (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.422 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — bộ đếm “Gợi ý 2/3” của P336 chỉ cập nhật khi nhấn J/K; di chuyển focus thông thường sang thẻ khác khiến nhãn trong sticky header bị sai. Feature class: AI

![Ảnh chụp Electron thật P5.1.337](./screenshots/positron-p51337-focus-sync-after-1920x1080-real.png)

[Ảnh trước sửa](./screenshots/positron-p51337-focus-sync-before-1920x1080-real.png) · [QA Electron thật](https://github.com/trisanghy/open-iptv-pro/actions/runs/45264613574) · [CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45264613661) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45264613661/artifacts/14860718802) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45264613661/artifacts/14862038062) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45264613661/artifacts/14863250092) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/8a6e834f871ab031ab8d1fd50d21e33f83249239)

</details>

<details>
<summary><strong>P5.1.336</strong> · AI thông báo vị trí gợi ý bằng chữ và screen reader; cuộn vào giữa khi chuyển (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.421 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thông báo vị trí trong tập gợi ý AI (ví dụ Gợi ý 2/3) khi điều hướng bằng bàn phím, giúp người dùng biết đang xem mục nào và phát hiện điểm dừng rõ ràng trên remote/desktop. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45261281535) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45261281535/artifacts/14860418310) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45261281535/artifacts/14860737131) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45261281535/artifacts/14860646802) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/854c274c7796d8e35ac772c3afb57591c4dbebb3)

</details>

<details>
<summary><strong>P5.1.335</strong> · AI chọn gợi ý kế tiếp bằng Alt+Shift+K, tự quay vòng (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.420 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Xem liên tiếp các gợi ý AI bằng phím tắt tập trung vào nút Xem của từng thẻ, không phải Tab qua nút phản hồi Hợp gu/Không hợp hoặc công cụ tra cứu. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45259743992) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45259743992/artifacts/14857759754) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45259743992/artifacts/14860620755) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45259743992/artifacts/14857969723) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/81aab782c5098ad1ce54d3dd074aa7b97a71838d)

</details>

<details>
<summary><strong>P5.1.334</strong> · AI đi tới nút Xem đầu bằng bàn phím và trả khoảng trống dưới header (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.419 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm phím tắt điều hướng trực tiếp tới gợi ý có thể phát trong WatchFlow Intelligence, để không phải Tab qua nhiều công tắc mô hình trước khi chọn nội dung. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45257848083) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/272c19dd585419679a3fe66eadcba64ee122cfd5)

</details>

<details>
<summary><strong>P5.1.333</strong> · Sửa trùng thanh điều hướng che nút Xem AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.418 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Sửa lỗi CI kiểm thử Electron làm thất bại bước chụp ảnh và chặn kiểm chứng bản phát hành, đồng thời khôi phục nút Xem AI bị che trên màn 720px. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45257557608) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45256104617/artifacts/14857818301) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45257557608/artifacts/14858782978) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45257557608/artifacts/14859072761) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2122b11a1deee17ac4849e52d75fbb4ed8a17f23)

</details>

<details>
<summary><strong>P5.1.332</strong> · WatchFlow AI không nguồn: khung đọc rộng, nút 44px và gợi ý phím (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.417 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — bổ sung chế độ hiển thị WatchFlow Intelligence dễ đọc khi chưa có playlist trên desktop; trước đó bảng AI chỉ rộng khoảng 265px khiến sáu nút chế độ quấn chữ, khó chọn bằng remote. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45253296908) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45253296908/artifacts/14856639097) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45253296908/artifacts/14857610248) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45253296908/artifacts/14855154869) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ca70dc76d7192655ba545e3c99b8bfa11b68bc7c)

</details>

<details>
<summary><strong>P5.1.331</strong> · Điều khiển sáu chế độ AI bằng remote/mũi tên (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.416 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — bổ sung điều hướng phím mũi tên lên, xuống, trái, phải, Home và End cho sáu chế độ WatchFlow Intelligence trên lưới hai hàng; không còn phải bấm Tab nhiều lần khi sử dụng remote/bàn phím. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45251524334) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45251524334/artifacts/14855214163) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45251524334/artifacts/14855602489) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45251524334/artifacts/14855123661) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/dd8b8fe3b7bb0115bce287235c3797e5aaf506e6)

</details>

<details>
<summary><strong>P5.1.330</strong> · Phím tắt AI an toàn theo ngữ cảnh (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.415 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — bổ sung khả năng nhận biết vùng biên tập và hộp thoại đang hoạt động trước khi mở bảng AI, tránh F6/Alt+Shift+W chiếm tiêu điểm gây gián đoạn nhập dữ liệu hoặc thao tác nguồn và Cast. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45247456425) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45247456425/artifacts/14854657820) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45247456425/artifacts/14853489208) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ca656166593df3dc3e4713a0f1773384b0995d95)

</details>

<details>
<summary><strong>P5.1.329</strong> · Phím tắt hai chiều mở/đóng WatchFlow AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.414 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — điều khiển hoàn toàn bằng một phím để bật và tắt bảng AI, không phải đưa chuột tìm nút × hoặc chuyển sang Escape khi đang xem truyền hình. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45246133700) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45246133700/artifacts/14852279504) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45246133700/artifacts/14854262651) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0f48093ce424130fbd5dad859a54f1ce84444031)

</details>

<details>
<summary><strong>P5.1.328</strong> · Phím tắt mở nhanh WatchFlow Intelligence (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.413 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — thêm lối truy cập AI trực tiếp qua bàn phím mà không phải tìm nút trên toolbar, hỗ trợ thao tác nhanh khi quản lý danh sách kênh. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45244481603) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45243403515/artifacts/14853620023) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45244481603/artifacts/14852952507) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45244481603/artifacts/14852403403) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0fbc817300aa65961ab28b1a3e38c27544f07cca)

</details>

<details>
<summary><strong>P5.1.327</strong> · Điều hướng focus khi mở lại WatchFlow AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.412 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — remote/bàn phím quay về AI tab trong bảng thay vì toolbar phía sau. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45240853457) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45240853457/artifacts/14853080265) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45240853457/artifacts/14852655631) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45240853457/artifacts/14851996388) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b23effd09311698475cb78225da04944812901c4)

</details>

<details>
<summary><strong>P5.1.326</strong> · Nhãn AI “sơ bộ” khi mẫu học còn ít (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.411 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — hiển thị rõ mức hợp gu mới chỉ là ước tính khi AI chưa có đủ 10 phản hồi; kèm giải thích bằng tooltip và nhãn đọc màn hình, không đổi thứ hạng hay tỷ lệ mô hình. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45236620519) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45236620519/artifacts/14849247904) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45236620519/artifacts/14850361986) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45236620519/artifacts/14849572087) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b716cf4039cb9787a0e18201df6b142d5771c610)

</details>

<details>
<summary><strong>P5.1.325</strong> · WatchFlow chuyển tiêu điểm bằng phím mũi tên mà không tự phát (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.410 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — năm chế độ WatchFlow và mục AI có điều hướng ArrowLeft/ArrowRight/Home/End bằng bàn phím hoặc remote; chỉ chuyển tiêu điểm, không tự chạy Smart Zap và không phát kênh. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45234509867) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45234509867/artifacts/14848686619) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45234509867/artifacts/14849215805) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45234509867/artifacts/14847874554) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4e5008e885b7495ca205411ad0ed02cee7a6d6bc)

</details>

<details>
<summary><strong>P5.1.324</strong> · 5 chế độ WatchFlow đủ vùng bấm 44px (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.409 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — tăng vùng bấm của năm nút Gợi ý, Tiếp, Cùng gu, Mix, Zap từ 35px lên 44px; vẫn trên một hàng. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45230817039) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45230817039/artifacts/14847347482) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45230817039/artifacts/14847656175) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45230817039/artifacts/14846867848) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/cb28492137a419d7f464e80dd7aa546d8b0027c1)

</details>

<details>
<summary><strong>P5.1.323</strong> · Cập nhật Positron P5.1.323 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.408 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — AI hợp gu có thao tác vùng chạm 44px dễ dùng trên máy tính và cửa sổ hẹp, hỗ trợ điều hướng bàn phím rõ nét ngay trong đề xuất kênh. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45223486028) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45223486028/artifacts/14841978312) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45223486028/artifacts/14842063290) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45223486028/artifacts/14842023568) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ee26f07e7d09f2b55c83fe44481c8251bcaa7aec)

</details>

<details>
<summary><strong>P5.1.322</strong> · Header WatchFlow theo chế độ AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.407 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi đọc WatchFlow Intelligence, header cố định phải nói rõ đang ở chế độ AI hợp gu thay vì nhãn Gợi ý thường, đặc biệt khi cuộn sâu. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864/artifacts/14840651593) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864/artifacts/14838601170) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864/artifacts/14839580218) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/834fc39e9fde32e056d3ef252a286644b8c186c2)

</details>

<details>
<summary><strong>P5.1.321</strong> · Về đầu bảng WatchFlow AI khi cuộn sâu (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.406 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung điều hướng trở về đầu nội dung AI khi phải cuộn sâu để xem bằng chứng giải thích Logistic; thao tác này trước đây không tồn tại. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45213107222) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45213107222/artifacts/14836944340) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45213107222/artifacts/14838201068) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45213107222/artifacts/14837690681) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4141cb0beede9a4fa4773970b12d07ff43652b2c)

</details>

<details>
<summary><strong>P5.1.320</strong> · Nút Xem/Hợp gu luôn nằm trên phần giải thích AI (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.405 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Ảnh Electron thật P319 chứng minh mở giải thích AI đã đẩy nút Xem khởi động playback và Hợp gu ra khỏi vùng bấm, chặn thao tác chính với kênh. Đưa hàng nút lên trên phần giải thích và kiểm chứng click target trong Electron. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45205998261) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45205998261/artifacts/14835366389) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45205998261/artifacts/14832934452) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45205998261/artifacts/14833183820) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/39c421d32aad5abeff77718734c11e7f99d5976a)

</details>

<details>
<summary><strong>P5.1.319</strong> · AI giải thích thật yếu tố nào tăng/giảm gợi ý Logistic (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.404 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Từng kênh trong WatchFlow Intelligence có mục "Vì sao AI gợi ý?" đọc-only. Hiển thị các trọng số học đóng góp mạnh nhất vào logit của điểm gợi ý: chủ đề, EPG, khung giờ, ngày thường/cuối tuần, nhóm kênh; tuyệt đối không công bố tên token nhóm riêng tư hay tự dựng lịch. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45203314016) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45203314016/artifacts/14831959447) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45203314016/artifacts/14831543488) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45203314016/artifacts/14833261282) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/03956a865cedb6d842c6384876158a23d5112c32)

</details>

<details>
<summary><strong>P5.1.318</strong> · AI chẩn đoán 3 mô hình trực tiếp trong Quản lý mô hình (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.403 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi tệp sao lưu khác trọng số AI đang dùng, hiển thị Logistic/Naive Bayes/UCB với số phản hồi/nhãn/chủ đề và số trường dữ liệu học khác ngay dưới nút đối chiếu trong Quản lý mô hình. Trước đây bảng chi tiết chỉ hiện sâu trong phần Dạy AI. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45200800416) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45200800416/artifacts/14833250464) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45200800416/artifacts/14832177145) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45200800416/artifacts/14830861912) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9d33bcdc18ff9958731996a940262015af7a61a4)

</details>

<details>
<summary><strong>P5.1.317</strong> · Đối chiếu bản sao AI cũ sau khi khởi động lại (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.402 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Có thể chọn bản sao JSON cũ để đối chiếu với Logistic, Naive Bayes và UCB đang lưu ở máy dù phiên làm việc này chưa xuất lại mô hình. Trước đây nút bị ẩn và xác minh trả lỗi nếu chưa xuất bản sao trong phiên. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14831121482) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14829302830) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14829845725) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/eeec05980f44e61705899200170db442dbd90fc6)

</details>

<details>
<summary><strong>P5.1.316</strong> · Đếm trường dữ liệu học AI thay đổi (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.401 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Đếm số giá trị học khác nhau riêng từng mô hình Logistic, Naive Bayes, UCB, kể cả khi bộ đếm mẫu học không đổi; không tính lại thứ tự khóa JSON. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14827661682) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14827329285) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14827878039) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6c4e835fd0a169e8b629d41f44b47cfa63fdd304)

</details>

<details>
<summary><strong>P5.1.315</strong> · Kiểm tra trọng số AI không phụ thuộc thứ tự khóa JSON (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.400 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Phân tích nội dung JSON sau khi chọn lại tệp sao lưu: hai tệp có cùng bộ trọng số Logistic, Naive Bayes, UCB được công nhận tương đương dù khác thứ tự khóa, tránh cảnh báo sai khi JSON được chỉnh định dạng bằng công cụ khác; vẫn nhận ra trọng số số học bị đổi thực sự. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758/artifacts/14826049955) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758/artifacts/14826124626) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758/artifacts/14826024180) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/86b7954ec4ae9279579dd6eaa9f6e4eed70be109)

</details>

<details>
<summary><strong>P5.1.314</strong> · Phân tích mô hình AI sai khác khi kiểm tra bản sao (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.399 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi JSON sao lưu AI hợp lệ nhưng khác trọng số, tự phân tích cục bộ và chỉ rõ Logistic, Naive Bayes hay UCB thay đổi; thống kê số mẫu/chủ đề trước-sau kể cả khi số lượng bằng nhau nhưng trọng số khác. Không nhập tệp hoặc sửa mô hình. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582/artifacts/14826852047) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582/artifacts/14825821450) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582/artifacts/14825442744) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/8802294395ad6c797949d61cae2cedc0e038e8ba)

</details>

<details>
<summary><strong>P5.1.313</strong> · Kiểm chứng tệp sao lưu AI đã tải (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.398 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Chọn lại bản sao JSON đã tải, kiểm tra định dạng, bộ đếm và trọng số Logistic/Naive Bayes/UCB với bản vừa xuất. Cảnh báo khi không khớp, không tự ghi đè dữ liệu học. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339/artifacts/14824652376) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339/artifacts/14825285702) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339/artifacts/14824507938) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/226ca7f70a2a7eb11254cabebd63feabfe4db36c)

</details>

<details>
<summary><strong>P5.1.312</strong> · Cứu hộ sao lưu trọng số AI khi bộ nhớ đầy (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.397 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi ghi nhãn AI gặp lỗi lưu bộ nhớ, thêm nút cứu hộ xuất bản sao trọng số Naive Bayes bằng JSON ngay tại hàng đợi dạy AI; người dùng không phải tìm sâu trong cài đặt và không bị mất trọng số đã lưu. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45183357907) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45183357907/artifacts/14821773672) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45183357907/artifacts/14822073354) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45183357907/artifacts/14823115113) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c94c1c9d179d4d9dbf10cc008b51c92685d8775a)

</details>

<details>
<summary><strong>P5.1.311</strong> · Lưu nhãn Naive Bayes an toàn khi bộ nhớ đầy (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.396 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Ngăn mất dữ liệu nhãn Naive Bayes khi localStorage đầy: RAM trước đây vẫn báo học thành công dù dữ liệu trên đĩa không được ghi, gây sai mô hình sau khi mở lại. Electron screenshot: positron-p51311-storage-fail-before-1920x1080-real.png / positron-p51311-storage-fail-after-1920x1080-real.png.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45181291993) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45181291993/artifacts/14821647369) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45181291993/artifacts/14821348014) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45181291993/artifacts/14821417130) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/486e493caa4871e75ee2cf623e28db383c1b4770)

</details>

<details>
<summary><strong>P5.1.310</strong> · Đọc rộng phân tích AI theo lựa chọn / Electron 4.23.395 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.395 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bảng WatchFlow AI mặc định chỉ rộng khoảng 528 px trên desktop 1920 px dù còn nhiều khoảng trống; thêm nút “Đọc rộng” để tăng lên 820 px, cùng “Thu gọn” trở lại. Không tác động mô hình hoặc luồng phát. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45179155802) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45179155802/artifacts/14820019244) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45179155802/artifacts/14820991628) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45179155802/artifacts/14820481511) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b1be29fbb66a02013c90307ba2b2aa02d49459b0)

</details>

<details>
<summary><strong>P5.1.309</strong> · Tách xác nhận khôi phục khỏi dạy AI và quay lại an toàn / Electron 4.23.394 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.394 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ở hàng đợi dạy nhãn, tạm ẩn nút xác nhận nhập trọng số đang nổi chồng lên bộ chọn chủ đề, đồng thời thêm lối “Trở lại kiểm tra bản sao AI” để quay về xem xét mô hình khôi phục chưa xác nhận. Chuyển chế độ không tự nhập hay mất dữ liệu. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45175939667) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45175939667/artifacts/14820305769) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45175939667/artifacts/14818483376) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45175939667/artifacts/14819766148) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b632b1e7fb2e5b4bf59dab5c233ac7f68d04da70)

</details>

<details>
<summary><strong>P5.1.308</strong> · Chuyển từ nhóm AI chưa chắc chắn sang hàng đợi dạy nhãn / Electron 4.23.393 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.393 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Từ danh sách kênh mà hai mô hình Naive Bayes đều chưa đủ chắc chắn, thêm nút mở trực tiếp hàng đợi dạy AI đã có thay vì tìm qua Thư mục EPG; luôn do người xem quyết định nhãn, không tự bật quyền hoặc phát video. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45174263973) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45174263973/artifacts/14817234657) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45174263973/artifacts/14817723648) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45174263973/artifacts/14817109745) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c1e942dd87189d3573ea6fd945ee68a25828f094)

</details>

<details>
<summary><strong>P5.1.307</strong> · Xem kênh AI chưa đủ chắc chắn, tránh che nội dung / Electron 4.23.392 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.392 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hiển thị ví dụ từ kênh mà cả Naive Bayes hiện tại và mô hình khôi phục đều chưa đủ chắc chắn phân loại, thay vì chỉ số đếm; ngăn tên nhúng URL lộ địa chỉ và giữ dòng mẫu khỏi nút xác nhận khôi phục sticky. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45172142742) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45172142742/artifacts/14817327058) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45172142742/artifacts/14817512731) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45172142742/artifacts/14818056592) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/042eb956e0aedfd351b6ff17caf934915b478913)

</details>

<details>
<summary><strong>P5.1.306</strong> · AI chỉ ra nhóm kênh mất độ chắc chắn khi khôi phục / Electron 4.23.391 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.391 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Phân tích 4 nhóm bằng chứng Naive Bayes (cũ chắc/mới không, mới chắc/cũ không, cả hai không chắc, cả hai chắc), cho xem các tên kênh bị giảm độ chắc chắn trước khi nhập sao lưu, và không kết luận không đổi chủ đề khi thiếu mẫu giao. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45169659072) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45169443968/artifacts/14815259166) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45169443968/artifacts/14815449131) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45169443968/artifacts/14816068197) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4894bee77bda66878614e21ff384be02ad3695c2)

</details>

<details>
<summary><strong>P5.1.305</strong> · AI chẩn đoán độ chắc chắn khi so sánh khôi phục / Electron 4.23.390 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.390 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung bảng đối chiếu số kênh mà mô hình Naive Bayes hiện tại và mô hình sao lưu phân loại đủ chắc chắn, phát hiện thiếu bằng chứng thay vì hiển thị 0/0 (0%) gây nhầm lẫn. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45166821071) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45166821071/artifacts/14815041359) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45166821071/artifacts/14815915324) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45166821071/artifacts/14815390895) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/16ea9b1c55f972fbe8f3bd010d69de3ab7cd2de4)

</details>

<details>
<summary><strong>P5.1.304</strong> · AI phát hiện chuyển chủ đề ngầm khi khôi phục mô hình / Electron 4.23.389 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.389 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung ma trận so sánh chủ đề trước/sau của Naive Bayes, tìm tình huống kênh vẫn đủ chắc chắn nhưng chuyển từ chủ đề A sang B; cảnh báo khi nhiều kênh đổi nhãn dù tỷ lệ bao phủ không giảm. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45163491636) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45163491636/artifacts/14813455926) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45163491636/artifacts/14813881255) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45163491636/artifacts/14814825776) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f7a7f79772713d316c7d0a58762d86665902a973)

</details>

<details>
<summary><strong>P5.1.303</strong> · AI lọc nhóm thật sự mất phân loại / Electron 4.23.388 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.388 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm bộ lọc chỉ nhóm có kênh mất dự đoán đủ chắc chắn trong phân tích rủi ro mô hình Naive Bayes; giúp người xem bỏ qua các dòng không có suy giảm ngay trong báo cáo khôi phục mà không xóa bất kỳ nhãn hay kênh nào. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45152927137) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45152927137/artifacts/14806833489) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45152927137/artifacts/14807316994) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45152927137/artifacts/14807417341) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2b3a8e487b4c003dd2ffd83a948bb6917b0b50ab)

</details>

<details>
<summary><strong>P5.1.302</strong> · AI mở ngay danh sách kênh nguy cơ từ cảnh báo khôi phục / Electron 4.23.387 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.387 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm thao tác điều hướng một chạm trực tiếp từ cảnh báo Naive Bayes đến danh sách tên kênh đang bị ảnh hưởng, tự mở phần chi tiết và đặt mẫu kênh vào vùng nhìn không bị nút xác nhận cố định che, giảm thao tác cuộn dài. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45151303832) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45151303832/artifacts/14805229956) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45151303832/artifacts/14806916043) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45151303832/artifacts/14806656668) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5815ea6613d23ef610ccea6111bf88ab8bf724b5)

</details>

<details>
<summary><strong>P5.1.301</strong> · Cảnh báo khôi phục AI không bị che / Electron 4.23.386 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.386 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm trạng thái cảnh báo riêng trên nút khôi phục AI khi mô hình mới có thể làm mất dữ liệu phân loại đã học, giúp người xem phân biệt thao tác có rủi ro và kiểm tra trước khi xác nhận. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150/artifacts/14806181995) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150/artifacts/14806450707) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150/artifacts/14805678693) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a1087f39a7a629895ef9954f31459b50e9901753)

</details>

<details>
<summary><strong>P5.1.300</strong> · AI hiển thị tên kênh dễ mất phân loại khi thay mô hình / Electron 4.23.385 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.385 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Sau khi AI Naive Bayes cảnh báo nhóm chịu rủi ro, người xem có thể chủ động mở danh sách tối đa ba tên kênh thực đang có nguy cơ mất dự đoán đủ chắc chắn trong mỗi nhóm, thay vì chỉ nhìn tỷ lệ tổng hợp; danh sách không tự phát video. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45147223325) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45147223325/artifacts/14803889508) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45147223325/artifacts/14805325644) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45147223325/artifacts/14804122792) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/68a129d37738274c641ee7591d2a590eeb3df7bc)

</details>

<details>
<summary><strong>P5.1.299</strong> · AI phát hiện rủi ro tập trung theo nhóm khi khôi phục mô hình / Electron 4.23.384 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.384 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi mô hình Naive Bayes mới làm ít nhất 5 kênh trong một nhóm mất phân loại đủ chắc chắn, chiếm tối thiểu 60% nhóm, hiện cảnh báo độc lập ngay trước xác nhận khôi phục kể cả khi mức giảm trung bình toàn thư viện còn thấp. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45145369053) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1f499af969869d6dacab2675743ae0303a9722c4)

</details>

<details>
<summary><strong>P5.1.298</strong> · AI loại nhóm mẫu quá nhỏ khi so sánh rủi ro / Electron 4.23.383 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.383 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép ẩn nhóm chỉ có dưới 5 kênh trong thống kê rủi ro phân loại Naive Bayes để tránh xem tỷ lệ 100% trên 1 kênh tương đương với 100% trên hàng trăm kênh, vẫn có thể hiện lại toàn bộ ngay bằng nút. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45143108679) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45141677974/artifacts/14801668377) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45141677974/artifacts/14802876934) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45141677974/artifacts/14802516933) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/67a11cd0784212bfe9197ae5d9127772071d3dd4)

</details>

<details>
<summary><strong>P5.1.297</strong> · AI so sánh tỷ lệ kênh mất dự đoán theo nhóm / Electron 4.23.382 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.382 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — AI tính tỷ lệ kênh có thể mất dự đoán đủ chắc chắn riêng trong từng nhóm và cho phép đổi thứ tự ưu tiên từ số lượng sang tỷ lệ; tránh xem nhóm đông luôn là nhóm chịu rủi ro tương đối lớn nhất. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45138238786) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45138238786/artifacts/14800672593) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45138238786/artifacts/14800683624) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45138238786/artifacts/14800223391) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/84bac9a95102332b5268e18f899d87ea25787bbb)

</details>

<details>
<summary><strong>P5.1.296</strong> · Chi tiết nhóm rủi ro AI: selector chính xác và bàn phím / Electron 4.23.381 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.381 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Khôi phục CI Electron bị chặn vì bộ chọn nhầm hai mục chi tiết Naive Bayes; bảo vệ dữ liệu AI, playlist và thao tác phát video khỏi hồi quy. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45136685982) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45136685982/artifacts/14801185218) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45136685982/artifacts/14799519126) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45136685982/artifacts/14800321444) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b95ab76f9f8c84bf935dfecc0a37768a5161c1ce)

</details>

<details>
<summary><strong>P5.1.295</strong> · Xem nhóm kênh bị ảnh hưởng khi khôi phục Naive Bayes / Electron 4.23.380 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.380 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Trong dự báo trước khi nhập mô hình AI, bổ sung bảng xem riêng tối đa năm nhóm kênh chịu nhiều tác động nhất (mất dự đoán đủ chắc chắn, thay nhãn, mới được phân loại), dựa trên tối đa 1.000 kênh đang có. Không còn phải suy luận từ một tỷ lệ tổng hợp. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45132994889) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45132994889/artifacts/14798597370) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45132994889/artifacts/14799215301) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45132994889/artifacts/14797799469) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/cbc355895e068028dbb0183b852d9994debae17c)

</details>

<details>
<summary><strong>P5.1.294</strong> · AI phát hiện bất đồng giữa hai mẫu kênh / Electron 4.23.379 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.379 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi xem trước khôi phục mô hình Naive Bayes, so sánh 180 kênh đầu và mẫu phân tầng theo nhóm, đo chênh lệch độ bao phủ trước/sau và mức suy giảm; cảnh báo khi hai kết quả chênh từ 20 điểm phần trăm hoặc mức rủi ro khác nhau. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45131802739) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45131802739/artifacts/14798341571) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45131802739/artifacts/14797614935) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45131802739/artifacts/14798057621) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e446438e050224c3b9ac519fc91610ec79a183c2)

</details>

<details>
<summary><strong>P5.1.293</strong> · AI kiểm tra chéo kênh theo nhóm trước khôi phục / Electron 4.23.378 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.378 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bên cạnh dự báo Naive Bayes theo 180 kênh đầu, thêm kiểm tra chéo luân phiên lấy mẫu theo nhóm để không bỏ sót nhóm kênh ở cuối playlist. Hiển thị riêng độ bao phủ và cảnh báo suy giảm trên mẫu đa nhóm. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45130429658) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45130429658/artifacts/14797522089) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45130429658/artifacts/14796919561) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45130429658/artifacts/14797542076) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d6a2d41b10de7f13a53f90bbe844cab963cbdb66)

</details>

<details>
<summary><strong>P5.1.292</strong> · AI cảnh báo suy giảm độ bao phủ trước nhập mô hình / Electron 4.23.377 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.377 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bộ xem trước Naive Bayes tự đo tỷ lệ kênh còn đủ chắc chắn phân loại trước và sau khi khôi phục JSON; khi tỷ lệ giảm trên ngưỡng lớn có cảnh báo rõ ràng ngay trong bản xem trước, tránh vô tình thay mô hình đang hữu ích bằng mô hình thiếu dữ liệu. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45127837795) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45127837795/artifacts/14796651496) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45127837795/artifacts/14797525032) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45127837795/artifacts/14796950553) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/87aed14ec3809dcd709e230c14ea0b72c13f6d24)

</details>

<details>
<summary><strong>P5.1.291</strong> · AI tách đổi chủ đề khỏi thay đổi độ chắc chắn / Electron 4.23.376 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.376 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bộ xem trước Naive Bayes bổ sung thống kê riêng những kênh thật sự chuyển giữa hai dự đoán chủ đề đủ chắc chắn, những kênh mới được dự đoán đủ chắc chắn, và những kênh không còn đạt ngưỡng; tránh gộp sai thành tất cả đều “đổi nhãn”. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45126649753) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45126649753/artifacts/14795878025) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45126649753/artifacts/14796137132) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45126649753/artifacts/14796500472) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0aa51a3b1f3965ab8b1993efccafa4bf091dfd98)

</details>

<details>
<summary><strong>P5.1.290</strong> · Giữ nút xác nhận khôi phục AI luôn trong tầm nhìn / Electron 4.23.375 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.375 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Nút xác nhận khôi phục dữ liệu mô hình AI biến mất khỏi vùng nhìn thấy khi mở dự báo Naive Bayes; chặn thao tác đồng ý có chủ đích và gây nhầm lẫn trạng thái dữ liệu. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45125073609) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0fdf9f036487ab5c87e0b9acbf4e1be46270e298)

</details>

<details>
<summary><strong>P5.1.289</strong> · Dự báo kênh đổi chủ đề Naive Bayes trước khôi phục / Electron 4.23.374 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.374 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Sau khi chọn JSON sao lưu, AI thử phân loại tối đa 180 kênh theo mô hình Naive Bayes hiện tại và mô hình trong tệp, đếm số kênh có thể đổi nhãn, liệt kê tối đa 4 khác biệt và nêu rõ đây chỉ là dự đoán dựa trên tên/nhóm kênh, không xác nhận từ EPG/luồng. Bảng thu gọn để giữ nút Xác nhận dễ truy cập. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45122261013) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45122261013/artifacts/14793848891) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45122261013/artifacts/14794411951) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45122261013/artifacts/14793923213) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0491bc0627cf54e33279e4e7baa58f2f3119664d)

</details>

<details>
<summary><strong>P5.1.288</strong> · Xem thử thứ hạng gợi ý AI trước khi nhập mô hình / Electron 4.23.373 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.373 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Mô phỏng tác động của trọng số Logistic ML trong tệp sao lưu lên ba gợi ý kênh hiện tại ngay ở màn hình xem trước. Hiển thị thứ hạng trước/sau, số vị trí thay đổi và cảnh báo khi mô hình chưa học đủ. Không tự phát kênh, không ghi mô hình hay gửi dữ liệu lên mạng. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45121216213) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45121216213/artifacts/14793164054) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45121216213/artifacts/14794255398) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45121216213/artifacts/14792999599) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1eb66e19d091af5bdcba6a529caac221373e164b)

</details>

<details>
<summary><strong>P5.1.287</strong> · Hoàn tác lần khôi phục mô hình AI gần nhất / Electron 4.23.372 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.372 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Sau khi xác nhận nhập JSON trọng số, người dùng có thể Hoàn tác để trở lại chính xác ba mô hình học trước đó và các nhãn đã dạy. Snapshot nằm trong RAM, tự chặn nếu mô hình tiếp tục học để tránh ghi đè dữ liệu mới. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45120411059) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45120411059/artifacts/14793731380) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45120411059/artifacts/14793547281) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45120411059/artifacts/14793243442) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/633441d4ab5a93455c9f06d47e159c0d53c6cabc)

</details>

<details>
<summary><strong>P5.1.286</strong> · So sánh trọng số AI hiện tại với bản sao trước khôi phục / Electron 4.23.371 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.371 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hiển thị chênh lệch mẫu học Logistic ML, Naive Bayes và lượt khám phá UCB trong bảng so sánh ngay trước khi xác nhận, cảnh báo khi bản sao ít dữ liệu học hơn và nêu rõ không đánh đồng số mẫu với độ chính xác. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45119283981) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45119283981/artifacts/14793380615) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45119283981/artifacts/14792169272) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45119283981/artifacts/14792444646) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0904c77af9e1fee2a570b389f5226d437a00d2df)

</details>

<details>
<summary><strong>P5.1.285</strong> · Khôi phục mô hình AI từ JSON có xác nhận / Electron 4.23.370 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.370 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung chọn file sao lưu JSON cục bộ, từ chối tệp sai định dạng, giả mạo, vượt 500KB hoặc tổng số mẫu không khớp. Hiển thị xem trước Logistic, Naive Bayes, UCB và bắt buộc nhấn nút xác nhận trước khi thay thế trọng số. Chỉ đọc tệp trong Electron, không tải lên Internet. Bảo toàn quyền bật AI, thông báo, dữ liệu M3U/kênh, EPG, Favorites và trình phát; nếu ghi localStorage thất bại, khôi phục các giá trị cũ trong bộ nhớ.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45118018946) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45118018946/artifacts/14792766312) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45118018946/artifacts/14792446762) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45118018946/artifacts/14792024314) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0b4a70679db25c5360e63e77d4d0e754726798f1)

</details>

<details>
<summary><strong>P5.1.284</strong> · Sao lưu trọng số ba mô hình AI / Electron 4.23.369 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.369 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Chủ động tải JSON trọng số Logistic, Naive Bayes và UCB cùng bộ đếm mẫu, chỉ dữ liệu học trên máy; không gồm playlist, URL, ID kênh hoặc lịch sử xem. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45116563561) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45116563561/artifacts/14791853159) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45116563561/artifacts/14792100752) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45116563561/artifacts/14791149273) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d5abf87d0b11598197089f71c865e568bb17625e)

</details>

<details>
<summary><strong>P5.1.283</strong> · AI kiểm tra độ cân bằng nhãn huấn luyện / Electron 4.23.368 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.368 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Đánh giá số chủ đề đã có nhãn thật, tổng số mẫu, tỷ lệ tập trung chủ đề lớn nhất và nhóm chủ đề chưa được học; đưa lời khuyên chống lệch mẫu mà không tự phân loại kênh hay hứa hẹn độ chính xác. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45113392896) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45113392896/artifacts/14790472861) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45113392896/artifacts/14790627070) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45113392896/artifacts/14790632148) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4fa6da714e28742fb5d8788aed0f8978a1ac224e)

</details>

<details>
<summary><strong>P5.1.282</strong> · AI giải thích bằng chứng Naive Bayes / Electron 4.23.367 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.367 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép xem mô hình Naive Bayes đã học bao nhiêu nhãn/chủ đề, có từ khóa nào trùng tên kênh và có dự đoán đáng tin cậy hay chưa; không hiển thị đoán mò khi thiếu nhãn hoặc từ khóa, không tự thay đổi kết quả phân loại. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45112365409) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45112365409/artifacts/14789154857) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45112365409/artifacts/14790437107) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45112365409/artifacts/14790247446) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6ee54615c4a6207639e3ef0ac64427e9741f4419)

</details>

<details>
<summary><strong>P5.1.281</strong> · Hoàn tác chính xác nhãn AI gần nhất / Electron 4.23.366 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.366 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khôi phục chính xác trọng số Naive Bayes và ID của các kênh đã gán nhãn trước khi dạy sai, không xóa nhãn cũ. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45111136856) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45111136856/artifacts/14789941639) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45111136856/artifacts/14790100482) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45111136856/artifacts/14789292760) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/92b994639aa643297d3ee1dfd3192ab60e097617)

</details>

<details>
<summary><strong>P5.1.280</strong> · Hàng đợi AI dạy chủ đề không lặp / Electron 4.23.365 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.365 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Dạy AI nhanh chuyển qua hơn năm kênh chưa phân loại sau mỗi lần Bỏ qua; giữ danh sách bỏ qua chỉ trong phiên, tránh xuất hiện lại kênh cũ, cho phép Xem lại toàn bộ kênh đã bỏ qua. Xếp hạng vẫn dựa trên độ chưa chắc chắn của Naive Bayes và quyền người dùng tự gán nhãn. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45105835336) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45105835336/artifacts/14787382799) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45105835336/artifacts/14786464917) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45105835336/artifacts/14787043326) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f6758a23b4888f8603ab9df8376d9c4c9bc2a39e)

</details>

<details>
<summary><strong>P5.1.279</strong> · Giữ thư mục con mở khi AI tự render / Electron 4.23.364 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.364 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Lỗi đã sửa: trạng thái chi tiết danh sách chưa phân loại được khôi phục khi giao diện render lại, không quét lại EPG, không phát kênh hoặc sửa playlist. Evidence: GitHub Actions 45101613049 test/capture/build thành công; ảnh Electron thật trước/sau đã mở xem trong đợt tiếp nối 23/11/2026.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45101613049) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45101613049/artifacts/14785184776) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45101613049/artifacts/14785399211) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45101613049/artifacts/14785583240) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/08320065119ca921d71bfe130c78d13ca9ab36a2)

</details>

<details>
<summary><strong>P5.1.278</strong> · Hướng dẫn dạy AI từng kênh / Electron 4.23.363 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.363 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hướng dẫn dạy AI theo từng kênh chưa phân loại: hiển thị một đề xuất có độ chắc chắn thấp nhất, cho phép Ghi nhãn & tiếp hoặc Bỏ qua an toàn; chuyển danh sách đầy đủ kênh chưa phân loại vào mục mở rộng riêng để không có hai thanh cuộn chen nhau. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45100262588) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/92bba48ee5a70c1eacde9616b74b732a27ba653b)

</details>

<details>
<summary><strong>P5.1.277</strong> · AI học chủ động từ kênh chưa phân loại / Electron 4.23.362 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.362 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Học chủ động từ các kênh chưa có chủ đề EPG: xếp hạng độ không chắc chắn của Naive Bayes, hiển thị năm kênh ưu tiên, cho người dùng gán nhãn trực tiếp, không phỏng đoán khi thiếu nhãn hay tự phát video. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45099187436) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45099187436/artifacts/14784726920) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45099187436/artifacts/14784860898) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45099187436/artifacts/14784218212) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fd856f64619c58789288c9e9abe828d34adc583c)

</details>

<details>
<summary><strong>P5.1.276</strong> · Quản lý mô hình học AI và xóa riêng / Electron 4.23.361 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.361 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bảng quản lý giúp kiểm tra ba mô hình học thực Logistic, Naive Bayes, UCB cùng dữ liệu/dung lượng từng mô hình và xóa riêng, không đụng đến playlist, guide hoặc mô hình học còn lại. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45098048396) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45098048396/artifacts/14783943722) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45098048396/artifacts/14784406677) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45098048396/artifacts/14783728299) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/eae69b98533a9abba10cffc7b2f938b2e75a47c5)

</details>

<details>
<summary><strong>P5.1.275</strong> · Chỉ mục EPG tái sử dụng và chủ động quét lại / Electron 4.23.360 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.360 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Lập chỉ mục kênh/chương trình theo XMLTV rồi dùng lại khi thay đổi giao diện, mở thư mục hoặc cập nhật chỉ báo số kênh, thay vì quét toàn bộ 561 kênh mỗi lần hiển thị. Người dùng có nút **Quét lại EPG** trong Thư mục EPG và Chương trình EPG; thay đổi nguồn, EPG có nhận diện mới hoặc qua mốc thời gian tự làm mới kết quả. Giữ nguyên trạng thái mở/đóng các thư mục khi giao diện được cập nhật. Feature class: BREAKTHROUGH

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14782572050) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14781829450) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14782820842) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/67aabf3c2c0b34aadafea78f3e01dfd29c0dd43c)

</details>

<details>
<summary><strong>P5.1.274</strong> · Tìm chương trình EPG xuyên chủ đề không dấu / Electron 4.23.359 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.359 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm khám phá chương trình XMLTV theo từ khóa trên toàn bộ các chủ đề, tên chương trình và kênh, hỗ trợ dấu/không dấu; chương trình đa nhãn chỉ liệt kê một lần trong kết quả. Tìm trực tiếp trong tập lịch 24 giờ đã nạp, không tự quét hay phát video. Feature class: BREAKTHROUGH

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324/artifacts/14781925642) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324/artifacts/14781508751) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324/artifacts/14781816591) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2cc486dbd0f40ecfdd93587d7b357355003dfffe)

</details>

<details>
<summary><strong>P5.1.273</strong> · Thư mục chương trình EPG 24h đa chủ đề / Electron 4.23.358 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.358 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm màn hình **Chương trình EPG** cho phép khám phá lịch phát thật theo chủ đề, không chỉ gom kênh. Một chương trình thời sự kết hợp bóng đá có thể xuất hiện đồng thời trong Tin tức và Thể thao, xem tên/giờ/kênh và chủ động chọn xem kênh; chỉ dùng XMLTV đã tải. Feature class: BREAKTHROUGH

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45089366850) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882/artifacts/14780667409) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882/artifacts/14780770977) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882/artifacts/14781025288) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6b67b80e02ecf8c4f34a16321cd918189901dcdc)

</details>

<details>
<summary><strong>P5.1.272</strong> · Thư mục EPG đa nhãn tự động / Electron 4.23.357 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.357 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm thư viện chủ đề EPG ảo tự phân loại toàn bộ danh sách kênh trên thiết bị từ các chương trình XMLTV hiện có; một kênh có thể xuất hiện đồng thời trong Thể thao, Tin tức, Phim, Thiếu nhi hoặc các thư mục khác mà không làm thay đổi M3U gốc. Feature class: BREAKTHROUGH

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45088962651) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45088149663/artifacts/14779624997) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45088149663/artifacts/14779819089) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45088149663/artifacts/14780376396) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fe531483a02257b9afd514a45e10fc1a457f2d9d)

</details>

<details>
<summary><strong>P5.1.271</strong> · AI tự học phân loại chủ đề / Electron 4.23.356 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.356 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung **Dạy AI phân loại** trên từng kênh khi có quyền học, sử dụng mô hình Multinomial Naive Bayes huấn luyện online từ các nhãn chủ đề do người dùng tự xác nhận. Sau khi có ít nhất hai nhóm đủ ví dụ, AI có thể gợi ý chủ đề cho kênh tương tự chưa khớp quy tắc tên hoặc EPG; kết quả phải vượt ngưỡng tin cậy, và EPG thực luôn được ưu tiên. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45085935252) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45085935252/artifacts/14778569863) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45085935252/artifacts/14779257902) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45085935252/artifacts/14778679794) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/336c2e71333e99b6d1b2d64bf32eb72af315a74b)

</details>

<details>
<summary><strong>P5.1.270</strong> · AI khám phá theo contextual bandit / Electron 4.23.355 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.355 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Chế độ **Khám phá AI** tính điểm UCB cho chủ đề ít được đánh giá kết hợp xác suất logistic đã học thực tế, chọn ra danh sách đa dạng, tránh lặp quá nhiều kênh cùng chủ đề và giảm dần mức khám phá khi chủ đề được phản hồi. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45084638523) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45084638523/artifacts/14779210750) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45084638523/artifacts/14778508435) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45084638523/artifacts/14778419146) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/aabfd6c885a45920eb78e3df5d453d1addceadc4)

</details>

<details>
<summary><strong>P5.1.269</strong> · AI lập lịch xem 24 giờ tránh trùng giờ / Electron 4.23.354 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.354 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — WatchFlow Intelligence có chế độ **Lịch AI 24h** tối ưu lịch xem không trùng giờ. Thuật toán weighted interval scheduling chọn tối đa 8 chương trình từ XMLTV thật theo trọng số logistic học từ sở thích; chương trình chồng thời gian cạnh tranh cùng một vị trí, không bịa lịch khi thiếu EPG. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45083798733) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45083798733/artifacts/14778775249) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45083798733/artifacts/14778069627) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45083798733/artifacts/14777544172) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/00e269d9d88d4279865266b24131f927af1b9f10)

</details>

<details>
<summary><strong>P5.1.268</strong> · AI nhắc chương trình hợp gu đúng lúc / Electron 4.23.353 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.353 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung công cụ **Nhắc trong ứng dụng** cho WatchFlow Intelligence. Khi người xem chủ động bật học và bật nhắc, ứng dụng định kỳ kiểm tra XMLTV đã tải, lấy chương trình gần giờ chiếu và dùng **mô hình logistic đã học từ hành vi/đánh giá** để thông báo chương trình có xác suất hợp gu đạt ngưỡng. Chỉ hiển thị lời nhắc cục bộ, không tự phát kênh, không gửi hành vi lên mạng, không mở thông báo OS khi chưa xin quyền. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45081203103) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45081203103/artifacts/14776683717) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45081203103/artifacts/14777790911) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45081203103/artifacts/14776359914) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/86ef0b3e39ffde2accb6c27f79e5421cd23403ec)

</details>

<details>
<summary><strong>P5.1.267</strong> · AI lịch EPG hợp gu từ chương trình sắp chiếu / Electron 4.23.352 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.352 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Một chế độ mới **Lịch EPG hợp gu** trong WatchFlow Intelligence: dùng EPG XMLTV hiện có để tìm chương trình sẽ bắt đầu trong 8 giờ tới, không bịa giờ hoặc tiêu đề; xếp chương trình theo mức độ phù hợp nhờ trọng số logistic học từ phản hồi và thời lượng xem, cá nhân hóa theo giờ phát và loại nội dung. Phân loại chủ đề từ tên/mô tả EPG dùng luật rõ ràng (không quảng cáo là LLM), còn xếp hạng bằng mô hình học thực. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45079844267) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45079844267/artifacts/14777225099) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45079844267/artifacts/14777245430) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45079844267/artifacts/14777036909) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ba8669395b31bc115a8d1acea232c159f418e70a)

</details>

<details>
<summary><strong>P5.1.266</strong> · WatchFlow Intelligence: học máy sở thích, phân loại EPG và tìm chủ đề trên Wikipedia / Electron 4.23.351 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.351 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — WatchFlow Intelligence với thuật toán học máy hồi quy logistic cập nhật trọng số dựa trên thời lượng xem ≥35 giây có hình hoặc đánh giá Hợp gu/Không hợp; phân loại theo chương trình XMLTV đang/sắp chiếu; tra cứu Wikipedia theo tên kênh và chỉ khi bấm nút, không gửi playlist, URL hoặc lịch sử xem lên mạng. Feature class: AI

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45078908616) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45078908616/artifacts/14776800871) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45078908616/artifacts/14776606618) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45078908616/artifacts/14776476463) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9841f5b59d97a12811d58cb7c8c85fa57837928c)

</details>

<details>
<summary><strong>P5.1.265</strong> · Đi tới nguồn bằng Enter/Space / Electron 4.23.350 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.350 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người dùng bàn phím có thể focus một hàng trong Chi tiết nguồn rồi bấm Enter hoặc Space để mở thẻ nguồn tương ứng; giữ nguyên điều khiển nút Đi tới và không can thiệp vào phát kênh. Electron screenshot: positron-p51265-source-enter-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45075407141) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45075407141/artifacts/14775465063) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45075330673/artifacts/14774709379) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45075407141/artifacts/14774729270) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9bbb0834b1a7c019a390621956f88eef8751320b)

</details>

<details>
<summary><strong>P5.1.264</strong> · Đặt lại bộ lọc chi tiết nguồn / Electron 4.23.349 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.349 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Một nút “Đặt lại” khôi phục đồng thời tìm kiếm, bộ lọc Bật/Tắt và thứ tự nguồn ban đầu. Nút chỉ khả dụng khi điều kiện tìm/lọc/sắp xếp đang khác mặc định; không sửa nguồn, playlist, Favorites hay video phát. Electron screenshot: positron-p51264-source-reset-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45074521257) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45074521257/artifacts/14774852188) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45074521257/artifacts/14774428364) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45074521257/artifacts/14774687745) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e0da21f76b62c2d4a60bcb13d5290a0a081999a2)

</details>

<details>
<summary><strong>P5.1.263</strong> · Điều hướng danh sách nguồn bằng phím mũi tên / Electron 4.23.348 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.348 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Duyệt các hàng trong Chi tiết nguồn bằng mũi tên Lên/Xuống, tự chuyển focus rõ ràng và quay vòng khi tới đầu/cuối; chặn phím khỏi shortcut TV bên ngoài, không thay đổi playlist hoặc phát kênh. Electron screenshot: positron-p51263-source-keyboard-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073811051) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073811051/artifacts/14774166821) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073811051/artifacts/14774620959) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073811051/artifacts/14774452025) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c15272d98831bef2c7610c3de6dd8e273eb99a1f)

</details>

<details>
<summary><strong>P5.1.262</strong> · Trở lại chi tiết nguồn đã chọn / Electron 4.23.347 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.347 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút trở lại ngay trên thẻ nguồn sau khi dùng Đi tới, cuộn lại đúng hàng chi tiết trước đó và làm nổi bật dòng nguồn; giữ ID nguồn sau khi sắp xếp, không sửa playlist hoặc phát video. Electron screenshot: positron-p51262-source-return-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073122454) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073122454/artifacts/14774190789) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073122454/artifacts/14774351117) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45073122454/artifacts/14773808137) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0419e80c05a4ba0e5ef9afe35e51905a70460de6)

</details>

<details>
<summary><strong>P5.1.261</strong> · Đi tới thẻ nguồn từ bảng chi tiết / Electron 4.23.346 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.346 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bấm trực tiếp từ dòng nguồn trong phần Chi tiết nguồn để tìm và làm nổi bật thẻ nguồn gốc bên dưới, giữ đúng ID nguồn dù bảng chi tiết đã sắp xếp; không thay đổi playlist hoặc tự phát video. Electron screenshot: positron-p51261-source-jump-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45072320263) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45072320263/artifacts/14774145290) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45072320263/artifacts/14773163477) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45072320263/artifacts/14773088839) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/22be696da3edf895822560bdea9b6993f70ffccd)

</details>

<details>
<summary><strong>P5.1.260</strong> · Sắp xếp nguồn theo số kênh hoặc tên / Electron 4.23.345 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.345 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép xem nguồn nhiều kênh nhất hoặc ít kênh nhất ở đầu bảng chi tiết, hoặc sắp xếp tên A–Z; chỉ thay đổi thứ tự hiển thị bảng phụ, hoàn toàn giữ nguyên dữ liệu M3U và thứ tự nguồn gốc. Electron screenshot: positron-p51260-source-sort-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45071580201) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45071580201/artifacts/14772858600) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45071580201/artifacts/14773955986) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45071580201/artifacts/14773985758) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6a34a041ba7f688e0f584dd90ec646f679b2124f)

</details>

<details>
<summary><strong>P5.1.259</strong> · Lọc nhanh nguồn bật/tắt trong chi tiết IPTV / Electron 4.23.344 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.344 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Có bộ chọn trạng thái Tất cả / Đang bật / Đang tắt ngay trong chi tiết nguồn. Thao tác lọc phối hợp với tìm kiếm theo tên, công khai số nguồn phù hợp và không đổi dữ liệu playlist, Favorites hoặc kênh phát. Electron screenshot: positron-p51259-source-status-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45070718230) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45070718230/artifacts/14773880161) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45070718230/artifacts/14772827824) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45070718230/artifacts/14773596133) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fe4dd6a7eab43d3520a113317ddc3f655e46b4f8)

</details>

<details>
<summary><strong>P5.1.258</strong> · Tìm kiếm trong danh sách chi tiết nguồn IPTV / Electron 4.23.343 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.343 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung ô tìm nguồn ngay sau khi mở “Chi tiết nguồn”, tìm không phân biệt hoa/thường và dấu tiếng Việt trên **toàn bộ danh sách nguồn**, không chỉ 30 dòng đầu. Danh sách chi tiết có cuộn riêng và thông báo khi không có kết quả. Không gọi playback, không ghi dữ liệu nguồn/M3U, giữ số kênh/trạng thái từng nguồn và có thể thu gọn như trước.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45069737947) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45069737947/artifacts/14772434299) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45069737947/artifacts/14773115457) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45069737947/artifacts/14772394686) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5122c19f45ea1abdf038781176479f3a62eda649)

</details>

<details>
<summary><strong>P5.1.257</strong> · Mở chi tiết nguồn và số kênh từ thẻ thống kê / Electron 4.23.342 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.342 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút Chi tiết nguồn ngay cạnh thống kê thư viện. Khi bấm, ứng dụng liệt kê tên từng nguồn, số kênh thuộc nguồn và trạng thái Bật/Tắt, có thể đóng lại; bản lớn giới hạn hiển thị 30 nguồn để tránh làm nặng giao diện. Tất cả chỉ đọc, không thay đổi playlist. Electron screenshot: positron-p51257-source-details-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45068013536) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45068013536/artifacts/14772416001) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45068013536/artifacts/14771917773) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45068013536/artifacts/14772391551) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b7aa11106930fec36fe1e0ca4a544bf09c9f5156)

</details>

<details>
<summary><strong>P5.1.256</strong> · Thống kê nguồn đang bật và tổng kênh ngay trong tiêu đề Nguồn IPTV / Electron 4.23.341 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.341 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hiển thị thẻ số liệu `2/2 nguồn bật · 561 kênh` theo thư viện thực, tự cập nhật khi số lượng nguồn/kênh trong footer chính thay đổi. Giúp nhận ra nguồn đang tắt ngay trên màn quản lý thay vì phải tìm nút trạng thái; chỉ đọc dữ liệu, không phát kênh hay lưu nguồn. Electron screenshot: positron-p51256-inventory-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45067258979) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45067258979/artifacts/14772141185) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45067258979/artifacts/14772350242) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45067258979/artifacts/14772200527) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/abaf2d182b3381713d88853ecd388cb0bd5dd835)

</details>

<details>
<summary><strong>P5.1.255</strong> · Nút quay lại kênh ngay trên trang Nguồn IPTV / Electron 4.23.340 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.340 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút một chạm ở phần đầu trang Nguồn IPTV, hiện số kênh đã duyệt gần nhất và quay về kênh ấy mà không phát video; dùng chung cơ chế với Alt+Shift+L. Nút tự vô hiệu khi chưa có dấu vị trí và không thay đổi M3U, Favorites, playback hoặc cài đặt. Electron screenshot: positron-p51255-return-button-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45066510928) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45066510928/artifacts/14771692447) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45066510928/artifacts/14771388561) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45066510928/artifacts/14771751330) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0cabb37d421f6ba0ed6bf152323bb9d91d72110b)

</details>

<details>
<summary><strong>P5.1.254</strong> · Alt+Shift+L quay lại kênh từ trang khác / Electron 4.23.339 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.339 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Alt+Shift+L cho phép quay lại TV từ Nguồn IPTV, EPG hoặc Cài đặt, tìm đúng kênh vừa duyệt và căn giữa danh sách. Chỉ dùng bookmark trong phiên, không chiếm phím khi nhập liệu, không tự phát và không thay đổi playlist, Favorites hay nguồn. Electron screenshot: positron-p51254-cross-page-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45065493786) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45065493786/artifacts/14770294592) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45065493786/artifacts/14771087590) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45065493786/artifacts/14771416312) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9f4a2d1cd69ade9b4b94099b1894a6d9ee768377)

</details>

<details>
<summary><strong>P5.1.253</strong> · Căn giữa hàng kênh được khôi phục (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.338 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi dùng Alt+Shift+L quay lại hàng kênh đã duyệt, danh sách cuộn tự động căn hàng đó gần giữa panel để người xem có thể thấy các kênh lân cận cả phía trên và dưới, không chỉ nhìn hàng sát mép cuối. Electron screenshot: positron-p51253-centered-row-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45063655451) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45063655451/artifacts/14770437927) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45063655451/artifacts/14770059210) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45063655451/artifacts/14770147473) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d03e102c2f6b62f08545e4f98baa92ea56b9d712)

</details>

<details>
<summary><strong>P5.1.252</strong> · Quay lại kênh cả sau khi đổi bộ lọc (HOÀN TẤT) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.337 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi người dùng lọc Yêu thích hoặc Vừa xem làm mất hàng kênh cũ khỏi DOM, Alt+Shift+L ghi nhớ ID kênh ổn định, tự trở về bộ lọc Tất cả nếu cần và focus đúng kênh, không sửa nội dung playlist hay tự phát video. Electron screenshot: positron-p51252-resume-filter-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062930623) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062930623/artifacts/14769768913) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062930623/artifacts/14770635719) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062930623/artifacts/14769847222) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b2c93b5403781274aefe2555a71ec72b2844ada1)

</details>

<details>
<summary><strong>P5.1.251</strong> · Alt+Shift+L quay lại hàng kênh vừa duyệt (HOÀN TẤT) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.336 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm phím tắt Alt+Shift+L trở lại đúng hàng kênh từng được focus trước khi chuyển sang thanh công cụ; tận dụng ghi nhớ vị trí trong phiên làm việc, không ghi dữ liệu hay tự phát video. Electron screenshot: positron-p51251-return-to-row-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062166884) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062166884/artifacts/14769807267) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062166884/artifacts/14770500209) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45062166884/artifacts/14769975975) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/8d91b18927192866b127c61eb2912983eddbf02d)

</details>

<details>
<summary><strong>P5.1.250</strong> · Ẩn chỉ báo vị trí đã cũ (HOÀN TẤT) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.335 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm tương tác mới tự ẩn chỉ báo vị trí đang chọn khi người dùng đưa tiêu điểm ra khỏi danh sách kênh, không hiển thị sai trạng thái và không tác động việc phát video hay dữ liệu playlist. Electron screenshot: positron-p51250-focus-badge-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45061351371) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45061351371/artifacts/14769671589) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45061351371/artifacts/14769403789) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45061351371/artifacts/14769189676) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b02d3ff4947e473d233f3d97b40ade1c0ff8a14b)

</details>

<details>
<summary><strong>P5.1.249</strong> · Escape hủy rồi trở về hàng kênh đang chọn (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.334 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi mở bảng nhảy số từ một hàng kênh đang focus, phím Escape hủy và trả tiêu điểm về đúng hàng đó, để tiếp tục duyệt bằng lên/xuống. Trước đây Escape chỉ trả focus về nút mở bảng, gây đứt dòng điều hướng. User action: Chọn QA Channel 412, Alt+Shift+J, Escape: bảng đóng và kênh 412 sáng trở lại; nếu mở từ thanh công cụ thì Escape tiếp tục focus nút như cũ.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059996731) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059996731/artifacts/14768443514) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059996731/artifacts/14768797464) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059996731/artifacts/14769112386) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a327fe578da6d5d0ea1f2ff5ff1845b8f5e689dd)

</details>

<details>
<summary><strong>P5.1.248</strong> · Alt+Shift+J điền sẵn số kênh đang focus (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.333 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Trên danh sách kênh đang focus, Alt+Shift+J mở bảng nhảy và tự điền số hàng đang chọn để sửa sang một kênh lân cận; Alt+J vẫn mở ô trống như trước. User action: Sau khi chọn vị trí kênh 412/561, nhấn Alt+Shift+J để ô số đã có 412; sửa thành 413 rồi Enter nếu muốn, không tự phát.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059238542) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059238542/artifacts/14768382741) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059238542/artifacts/14769355292) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45059238542/artifacts/14769071171) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/42d3264949a995d7a5bdae3d06a69e7c5e4849d3)

</details>

<details>
<summary><strong>P5.1.247</strong> · Hiện vị trí kênh đang chọn (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.332 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Dưới tổng số kênh ở tiêu đề danh sách có nhãn nhỏ "Kênh 412/561" được cập nhật khi focus bằng bàn phím hoặc nhảy số. Hữu ích với các kênh tên giống nhau, không cần mở lại bảng nhảy. User action: Chọn một kênh bằng mũi tên hoặc gõ 412 Ctrl+Enter; nhãn vị trí hiện theo hàng đang chọn; không phát video.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45058439931) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45058439931/artifacts/14768343035) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45058439931/artifacts/14768860609) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45058439931/artifacts/14767884749) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d4e18fb0b945a3d984c250f375b81766c411fd59)

</details>

<details>
<summary><strong>P5.1.246</strong> · Ctrl+Enter nhảy kênh rồi thu gọn bảng (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.331 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi nhập số kênh, Ctrl+Enter (Mac có thể Command+Enter) nhảy đến hàng kênh rồi tự thu gọn công cụ, trả lại không gian danh sách và giữ tiêu điểm đúng hàng; Enter thông thường vẫn để mở bảng cho tác vụ tiếp. User action: Tại Xem truyền hình, chọn hàng kênh, gõ 412 rồi Ctrl+Enter để tới QA Channel 412 mà không tự phát, đồng thời bảng nhập số thu gọn.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057860418) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057860418/artifacts/14768655104) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057860418/artifacts/14767638933) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057860418/artifacts/14768595354) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/31098587fa83f667bc76fc95bea368bfba36192f)

</details>

<details>
<summary><strong>P5.1.245</strong> · Đồng bộ nhóm với kênh đang chọn (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.330 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hộp chọn nhóm trong trình nhảy kênh tự chỉ đúng nhóm của hàng kênh được focus sau thao tác bằng bàn phím, thay vì duy trì lựa chọn cũ. User action: Tại Xem truyền hình, focus một hàng kênh và gõ 412 Enter; ô Đến nhóm hiển thị 03 · Other channels đúng với QA Channel 412.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057242821) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057242821/artifacts/14767654581) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057242821/artifacts/14768017268) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45057242821/artifacts/14767902392) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/eff9081b19b1802f69d969479270684dc877c684)

</details>

<details>
<summary><strong>P5.1.244</strong> · Gõ số để nhảy nhanh tới kênh (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.329 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Gõ chữ số 0–9 khi focus hàng kênh để mở hộp nhảy số, nhập tiếp và nhấn Enter để đi tới kênh; không tự phát hoặc đổi nguồn. User action: Focus một hàng kênh trong Xem truyền hình; gõ 412 rồi Enter để chuyển tiêu điểm tới kênh 412, Escape để hủy.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45056567429) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45056567429/artifacts/14768140353) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45056567429/artifacts/14767990845) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45056567429/artifacts/14766764356) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5f150a49c2bf077834ac8f5b3e4ef31c20bb3287)

</details>

<details>
<summary><strong>P5.1.243</strong> · Shift+R mở/thoát Vừa xem mà không cần chuột / Electron 4.23.328 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.328 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm phím Shift+R ngay tại hàng kênh để mở lọc Vừa xem. Ảnh P5.1.242 cho thấy khi lịch sử rỗng không còn hàng nào để focus, do đó Shift+R trên chip Vừa xem cũng quay lại Tất cả và trả focus về kênh đầu tiên. Cho phép thao tác hai chiều bằng bàn phím, không tự phát, không sửa Favorites hay nguồn. Electron screenshot: positron-p51243-keyboard-recent-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45055635344) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45055635344/artifacts/14767765415) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45055635344/artifacts/14766763208) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45055635344/artifacts/14767497666) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/7edfcd38a3c6fab821f5f8097d8a6b1c012b83e5)

</details>

<details>
<summary><strong>P5.1.242</strong> · Chip báo mọi bộ lọc kênh ẩn / Electron 4.23.327 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.327 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Mở rộng chip báo trạng thái P5.1.241 từ riêng Yêu thích sang mọi tab lọc native, gồm Vừa xem, Sống, Die và Chưa rõ. Khi tab bị thu gọn hoặc lọc ra 0 kênh, người dùng vẫn nhìn thấy tên bộ lọc, số kênh và hành động Xem tất cả để tránh hiểu nhầm mất playlist. Màu chip Vừa xem dịu hơn và mọi thao tác không thay đổi Favorites, playback hay nguồn. Electron screenshot: positron-p51242-recent-filter-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054829307) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054829307/artifacts/14766866835) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054829307/artifacts/14767226961) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054829307/artifacts/14767361655) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f08c90c8876b294c55ac44fcbacef636353bc7e7)

</details>

<details>
<summary><strong>P5.1.241</strong> · Chip lọc Yêu thích có nút Xem tất cả / Electron 4.23.326 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.326 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi Shift+F lọc còn 20 kênh, ảnh P5.1.240 chỉ báo 20/561 mà không nêu bộ lọc đang bật, rất dễ hiểu nhầm mất kênh. Thêm chip nhỏ trực tiếp dưới ô tìm để hiển thị `Yêu thích · 20` cùng hành động `Xem tất cả`, khôi phục danh sách bằng bộ lọc native và giữ focus; không thay đổi dữ liệu Favorites hoặc IPTV. Electron screenshot: positron-p51241-favorite-chip-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054237610) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054237610/artifacts/14766434722) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054237610/artifacts/14767056583) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45054237610/artifacts/14766921927) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5722a5a8839de898f683452d63fa105c6ca7810a)

</details>

<details>
<summary><strong>P5.1.240</strong> · Shift+F lọc nhanh yêu thích không thay đổi dấu sao / Electron 4.23.325 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.325 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm phím tắt Shift+F trong danh sách kênh để luân phiên bộ lọc Tất cả/Yêu thích và giữ focus trên hàng đầu. Trước đây Shift+F bị hiểu nhầm là F và đảo dấu sao, dễ thay đổi dữ liệu yêu thích ngoài ý muốn. Bản mới chỉ chuyển bộ lọc sẵn có, tuyệt đối không ghi M3U hoặc thay đổi Favorites. Electron screenshot: positron-p51240-shift-favorites-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45053439491) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45053439491/artifacts/14766960153) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45053439491/artifacts/14766960194) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45053439491/artifacts/14766810535) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1f91a9f63bb9492b6bf1ac06b88cbfd81776cda0)

</details>

<details>
<summary><strong>P5.1.239</strong> · Escape đóng bảng nhảy kênh từ danh sách / Electron 4.23.324 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.324 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung phím Escape để đóng ngay bảng nhảy kênh/nhóm khi đang focus một hàng kênh, giảm chiều cao phần biểu mẫu và trả lại không gian duyệt kênh mà không phải quay về nút đóng. Không bắt đầu playback, không đổi M3U/EPG/Favorites và không thay đổi lịch sử nhóm. Electron screenshot: positron-p51239-escape-jump-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45052833628) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45052833628/artifacts/14766362929) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45052833628/artifacts/14765999153) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45052833628/artifacts/14766486501) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/33a73f03a973ed73987a0b86f96738f73ce7e912)

</details>

<details>
<summary><strong>P5.1.238</strong> · Không cướp focus khi đang nhập với Alt+J/Alt+G / Electron 4.23.323 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.323 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Tăng khả năng điều hướng bằng bàn phím có nhận biết ngữ cảnh: Alt+J/Alt+G chỉ bật bảng nhảy khi ngoài vùng soạn thảo, trong ô tìm kiếm hoặc biểu mẫu người dùng tiếp tục nhập không mất focus, bảo toàn dữ liệu và thao tác video hiện tại. Giải quyết việc phím tắt toàn cục can thiệp vào chỉnh sửa nội dung. Giữ nguyên thao tác Alt+J/Alt+G khi focus ngoài các ô nhập; không tự phát kênh, không thay đổi nguồn M3U, lịch sử hay danh sách Yêu thích.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45051988709) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/636b484fe5fdec59aad8377e4b37532c688c6c08)

</details>

<details>
<summary><strong>P5.1.237</strong> · Alt+←/Alt+→ điều hướng lịch sử nhóm / Electron 4.23.322 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.322 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Điều hướng lịch sử nhóm trực tiếp từ hàng kênh bằng tổ hợp Alt+Mũi tên trái/phải, giúp người dùng điều khiển bằng bàn phím mà không phải di chuyển focus lên nút Nhóm trước/Nhóm sau; phím vẫn giữ chức năng soạn thảo khi đang ở ô nhập. Electron screenshot: positron-p51237-keyboard-history-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049986914) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049986914/artifacts/14765515658) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049986914/artifacts/14764968710) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049986914/artifacts/14765535568) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/749ca18174015329d9eebff265204c5f9d8c6ec9)

</details>

<details>
<summary><strong>P5.1.236</strong> · Nhóm sau: quay lại nhóm vừa rời sau thao tác Back / Electron 4.23.321 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.321 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút “↷ Nhóm sau” chỉ xuất hiện sau khi người xem quay về nhóm trước, hỗ trợ tiến lại nhóm đã duyệt mà không phải tìm kiếm hay ghi nhớ thư mục vừa xem; việc chọn nhóm mới chủ động sẽ xóa hướng tiến không còn hợp lệ. Electron screenshot: positron-p51236-group-forward-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049246898) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049246898/artifacts/14765320279) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049246898/artifacts/14764604523) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45049246898/artifacts/14764204446) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/39ef304fbab638cc562e79808e59641995a3c0f3)

</details>

<details>
<summary><strong>P5.1.235</strong> · Quay về nhóm trước mà không lặp lại nhóm hiện tại / Electron 4.23.320 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.320 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Lịch sử điều hướng nhóm theo phiên chỉ giữ một vị trí cho mỗi nhóm và tự loại đích quay lại trùng nhóm đang xem, giúp nút “Nhóm trước” không quay vòng vô ích hoặc hiển thị nhầm sau khi trở về. Electron screenshot: positron-p51235-history-dedupe-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45048450106) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45048450106/artifacts/14764786826) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45048450106/artifacts/14763834419) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45048450106/artifacts/14765145567) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e65f216e629350fcfaf9d4159b3cb0ac8d5a1be9)

</details>

<details>
<summary><strong>P5.1.234</strong> · Tìm đúng nhóm có Đ viết hoa bằng chữ không dấu / Electron 4.23.319 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.319 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hỗ trợ tìm tên thư mục tiếng Việt có chữ Đ viết hoa bằng từ khóa không dấu ngay trong bộ chọn nhóm, giúp người xem truy cập đúng dữ liệu danh sách kênh mà không cần đổi tên thư mục hoặc mở video. Electron screenshot: positron-p51234-vietnamese-group-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047758931) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047758931/artifacts/14763449285) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047758931/artifacts/14764164278) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047758931/artifacts/14764477608) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c7423143a230c9dde4f3552f729a6ada0dcc52e0)

</details>

<details>
<summary><strong>P5.1.233</strong> · Quay về nhóm vừa rời / Electron 4.23.318 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.318 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người dùng nhảy từ nhóm 01 sang một nhóm bất kỳ có thể quay lại nhóm cũ trong một lần nhấn, kể cả khi hai nhóm cách xa nhau; lịch sử focus nhóm trong phiên hoàn toàn tách biệt lịch sử phát video và không ghi đè dữ liệu playlist. Electron screenshot: positron-p51233-group-history-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047058362) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047058362/artifacts/14763878662) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047058362/artifacts/14764391136) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45047058362/artifacts/14763524751) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1576847148f18e81967f6af9e33b34fb85996625)

</details>

<details>
<summary><strong>P5.1.232</strong> · Tìm nhanh nhóm kênh theo tên / Electron 4.23.317 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.317 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi có hàng chục thư mục, người dùng có thể gõ một phần tên để thu hẹp nhóm ngay trong bộ chọn Alt+G, thay vì bấm tới từng nhóm; hỗ trợ tên tiếng Việt không dấu. Đồng thời sửa lỗi ảnh P5.1.231 cho thấy nhãn “Đến nhóm” chồng lên ô chọn. Electron screenshot: positron-p51232-group-search-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45045467358) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45045467358/artifacts/14763178281) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45045467358/artifacts/14762534717) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45045467358/artifacts/14764000170) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/bb0d388b064196f684708f01f8cedf82f8718652)

</details>

<details>
<summary><strong>P5.1.231</strong> · Bộ chọn nhóm kênh trực tiếp qua Alt+G / Electron 4.23.316 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.316 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Sau khi chuyển nhóm tuần tự đã hoạt động, người dùng có hàng chục nhóm kênh cần nhảy trực tiếp tới bất kỳ nhóm nào bằng menu chọn có nhãn rõ ràng và hỗ trợ bàn phím; có thể mở nhóm thu gọn qua thao tác gốc. Electron screenshot: positron-p51231-group-picker-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45044821726) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45044821726/artifacts/14762578572) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45044821726/artifacts/14763575535) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45044821726/artifacts/14763680145) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0b096c095021ea4d82e0dbda9ce1bfb88e83e829)

</details>

<details>
<summary><strong>P5.1.230</strong> · Chuyển nhóm kênh bằng phím trái/phải / Electron 4.23.315 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.315 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Chọn một kênh rồi nhấn → để tới đầu nhóm mở kế tiếp, ← để về đầu nhóm trước. Bỏ qua nhóm thu gọn, giữ nguyên luồng phát, dữ liệu playlist và Favorites. User action: Trên trang TV, focus một hàng kênh rồi nhấn mũi tên phải để tới đầu nhóm kế tiếp đang mở, nhấn mũi tên trái để quay lại nhóm trước; nhấn Enter mới phát.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45043514719) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45043514719/artifacts/14762282691) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45043514719/artifacts/14763081861) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45043514719/artifacts/14762728042) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ef06c22c7cb84ec2ae62cbd8672dc0a79781cefc)

</details>

<details>
<summary><strong>P5.1.229</strong> · Đánh dấu yêu thích ngay bằng phím F / Electron 4.23.314 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.314 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người dùng đang duyệt hàng trăm kênh bằng phím mũi tên có thể nhấn F trên hàng kênh được focus để thêm/bỏ Yêu thích ngay lập tức, không cần rê chuột tới biểu tượng sao nhỏ và không làm chuyển hoặc phát kênh. Electron screenshot: positron-p51229-keyboard-favorite-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45042515098) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0b4614e9ce376a8b62899c1558b2644ee6a46e16)

</details>

<details>
<summary><strong>P5.1.228</strong> · Duyệt kênh bằng bàn phím, không cần chuột / Electron 4.23.313 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.313 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người dùng có hàng trăm kênh có thể di chuyển focus bằng mũi tên lên xuống, Home, End, PageUp và PageDown mà không phải nhấn phát từng kênh; thêm viền focus rõ ràng và Alt+J mở ô nhảy tới số kênh, giữ nguyên video đang xem. Electron screenshot: positron-p51228-keyboard-channels-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041825637) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041825637/artifacts/14761408835) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041825637/artifacts/14761724667) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041825637/artifacts/14762395800) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d0ea0be1b121c96c203a869c076280efbf7af1cd)

</details>

<details>
<summary><strong>P5.1.227</strong> · Nhảy kênh không cuộn cả trang video, tiêu đề gọn / Electron 4.23.312 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.312 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Ảnh Electron P5.1.226 cho thấy nhảy tới kênh 250 kéo cả trang video lên, che khuất đầu sidebar và mép trên khung phát, trong khi ba nút tiêu đề khiến chữ xuống hai dòng; sửa đúng vùng cuộn để điều khiển TV vẫn luôn nhìn thấy. Electron screenshot: positron-p51227-jump-scroll-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041070170) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041070170/artifacts/14761942346) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041070170/artifacts/14761383083) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45041070170/artifacts/14761178824) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5e7c9bb8666289cfb14d06da4c4956fbd8ef91a0)

</details>

<details>
<summary><strong>P5.1.226</strong> · Nhảy nhanh tới kênh theo số, không tự phát / Electron 4.23.311 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.311 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi playlist có hàng trăm kênh, người dùng có thể nhập số thứ tự để định vị kênh trong danh sách mà không phải cuộn qua hàng trăm mục hoặc làm gián đoạn video đang phát. Electron screenshot: positron-p51226-channel-jump-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45040295057) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45040295057/artifacts/14761142759) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45040295057/artifacts/14761651974) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45040295057/artifacts/14761851433) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0b3ed40ff034e49e1ad99dd14dbc660a585dd035)

</details>

<details>
<summary><strong>P5.1.225</strong> · Giữ điều khiển phát video trong cửa sổ desktop / Electron 4.23.310 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.310 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Các nút điều khiển phát video, âm lượng và chọn kênh bị đẩy xuống dưới vùng nhìn khi desktop rộng mà cửa sổ thấp, nên cần giới hạn riêng chiều cao stage để tránh cắt thao tác quan trọng mà không thay đổi dữ liệu người xem. Electron screenshot: positron-p51225-tv-controls-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45039175143) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45039175143/artifacts/14761276373) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45039175143/artifacts/14761280936) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45039175143/artifacts/14760524679) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/88fbb97fa7e16aaeb7c22d210aaec162e4ac6e95)

</details>

<details>
<summary><strong>P5.1.224</strong> · Trạng thái nhập XMLTV hiển thị ngay trong EPG / 4.23.309 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.309 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Sau khi người dùng nhập hoặc hủy file XMLTV ngay từ trang Lịch phát sóng, phản hồi không còn bị giấu trong mục Cài đặt, tránh nhầm rằng ứng dụng treo hoặc mất dữ liệu EPG. Electron screenshot: positron-p51224-epg-feedback-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45038371586) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45038371586/artifacts/14761045562) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45038371586/artifacts/14760697681) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45038371586/artifacts/14760822247) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/be3e79f8049cae0ebd42a211c47b73577a991fce)

</details>

<details>
<summary><strong>P5.1.223</strong> · Nhập XMLTV trực tiếp từ trạng thái EPG rỗng / Electron 4.23.308 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.308 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người xem có file XMLTV hợp pháp trong máy có thể nhập trực tiếp từ trang Lịch phát sóng mà không phải đi vòng qua trang Cài đặt; dùng nguyên luồng kiểm tra, xác nhận và lưu của chức năng nhập hiện có. Electron screenshot: positron-p51223-epg-import-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45037486320) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45037486320/artifacts/14760760867) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45037486320/artifacts/14760800275) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45037486320/artifacts/14760104593) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/50bd3ac3820dbf615c5191abf5a7ac989691b51b)

</details>

<details>
<summary><strong>P5.1.222</strong> · Chọn nhanh nguồn EPG khi chưa tải dữ liệu / Electron 4.23.307 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.307 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung nút chọn nguồn XMLTV ngay trong trạng thái rỗng của lịch phát sóng, giúp người dùng nhập và kiểm tra nguồn thay vì bị báo sai là danh sách kênh không khớp khi chưa tải lịch. Electron screenshot: positron-p51222-epg-source-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45036408471) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45036408471/artifacts/14760007980) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45036408471/artifacts/14759729346) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45036408471/artifacts/14760270944) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/3848d687983751697f938c1e8c43c42273a5591c)

</details>

<details>
<summary><strong>P5.1.221</strong> · Căn thẳng các nhãn EPG DVR / Electron 4.23.306 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.306 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Các nhãn Bắt đầu và Kết thúc lệch hàng khiến việc chọn đúng thời điểm ghi video trở nên khó kiểm tra; sửa bố cục để tránh thao tác nhầm mà không thay đổi dữ liệu lịch hoặc luồng ghi hình. Electron screenshot: positron-p51221-dvr-form-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45035298048) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45035298048/artifacts/14759472652) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45035298048/artifacts/14759368044) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45035298048/artifacts/14758954925) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/57ad538afbea22ad2a867ebca6a8017e82235fa1)

</details>

<details>
<summary><strong>P5.1.220</strong> · Mở rộng lịch sử khám phá tối đa 50 kênh / Electron 4.23.305 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.305 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Mã và ảnh Electron P5.1.219 cho thấy lịch sử có thể chứa 50 lần khám phá nhưng popup chỉ hiện 10 kênh gần nhất, khiến các kênh cũ không thể truy cập; thêm nút mở rộng/thu gọn. Electron screenshot: positron-p51220-history-more-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45034008644) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45034008644/artifacts/14759535170) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45034008644/artifacts/14759325742) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45034008644/artifacts/14758804417) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d1dd21a6f3662daa57a4ae5944f7617274259b07)

</details>

<details>
<summary><strong>P5.1.219</strong> · Sắp xếp lịch sử khám phá theo tên / Electron 4.23.304 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.304 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.218 cho thấy tìm kiếm và lọc Yêu thích hoạt động nhưng lịch sử chỉ theo thời điểm khám phá; thêm chế độ tên A–Z và Z–A theo thứ tự tiếng Việt. Electron screenshot: positron-p51219-history-sort-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45033057660) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45033057660/artifacts/14758349169) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45033057660/artifacts/14758867242) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45033057660/artifacts/14757854191) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/816fa1741d35c0594bbc0f255ac903165a3aeb77)

</details>

<details>
<summary><strong>P5.1.218</strong> · Lọc nhanh Yêu thích trong lịch sử khám phá / Electron 4.23.303 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.303 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.217 cho thấy nút sao mới đã giúp lưu kênh, nhưng danh sách lịch sử còn trộn kênh thường và kênh đã yêu thích. Thêm lọc theo Favorites trong phiên, kết hợp tìm kiếm. Electron screenshot: positron-p51218-favorites-filter-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45032368431) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45032368431/artifacts/14758571196) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45032368431/artifacts/14758562197) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45032368431/artifacts/14758865844) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e7667a49aeec087a0f1c812e0a55eed4d7a954e0)

</details>

<details>
<summary><strong>P5.1.217</strong> · Đánh dấu Yêu thích trong lịch sử khám phá / Electron 4.23.302 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.302 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.216 cho thấy menu khám phá cho phép chọn phát lại và tìm kiếm nhưng thiếu thao tác lưu ngay kênh vừa thấy vào Yêu thích; thêm nút sao độc lập trong mỗi dòng. Electron screenshot: positron-p51217-history-favorite-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45031585445) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45031585445/artifacts/14757579744) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45031585445/artifacts/14758765065) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45031585445/artifacts/14758032442) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/31f35aac8c43f3a4af93522a0063a98fe2175b8b)

</details>

<details>
<summary><strong>P5.1.216</strong> · Gõ tìm ngay khi mở lịch sử khám phá / Electron 4.23.301 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.301 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Mở menu với tiêu điểm ở ô tìm, gõ ngay và di chuyển hai hướng giữa kết quả bằng bàn phím; không tự phát kênh. Electron screenshot: positron-p51216-search-focus-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45030255128) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45030255128/artifacts/14756824153) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45030255128/artifacts/14757134493) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45030255128/artifacts/14757562728) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/18a791e1373a02601e398940f73075574d6b0b87)

</details>

<details>
<summary><strong>P5.1.215</strong> · Tìm kiếm nhanh trong lịch sử khám phá kênh / Electron 4.23.300 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.300 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.214 xác nhận lịch sử khám phá có nút chọn bằng bàn phím nhưng chưa có ô tìm khi nhiều kênh xuất hiện. Thêm tìm nhanh theo tên hoặc nhóm, hỗ trợ bỏ dấu tiếng Việt. Electron screenshot: positron-p51215-history-search-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027890085) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027890085/artifacts/14756701515) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027890085/artifacts/14756812059) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/37816aa49163733d664bf5725631b17805cd5f4f)

</details>

<details>
<summary><strong>P5.1.214</strong> · Điều hướng menu lịch sử bằng bàn phím/remote / Electron 4.23.299 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.299 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.213 chứng minh menu lịch sử mở và chọn kênh bằng click nhưng thiếu di chuyển tiêu điểm có điều khiển với phím mũi tên. Thêm ↑/↓ chuyển lựa chọn và quay vòng, Home/End đến đầu/cuối; Enter thực hiện xem lại. Electron screenshot: positron-p51214-history-keys-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027131934) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027131934/artifacts/14756227602) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027131934/artifacts/14755988637) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45027131934/artifacts/14755814680) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/010dd8f1ce13cc2d000fd4b600f40837c3f89e7a)

</details>

<details>
<summary><strong>P5.1.213</strong> · Lịch sử kênh ngẫu nhiên chọn phát lại / Electron 4.23.298 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.298 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Từ ảnh P5.1.212, Back và Forward chỉ chuyển kênh từng bước. Menu mới mở trực tiếp tối đa 10 kênh vừa khám phá để chọn phát lại bằng một lần bấm. Electron screenshot: positron-p51213-random-history-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45026225429) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45026225429/artifacts/14755358835) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45026225429/artifacts/14755318912) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45026225429/artifacts/14756021640) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fccaef6054b3259c98de64e01198e3fa9f8efb9c)

</details>

<details>
<summary><strong>P5.1.212</strong> · Tiến tới trong lịch sử kênh ngẫu nhiên / Electron 4.23.297 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.297 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.211 cho thấy nút ↶ cho phép quay về kênh khám phá trước, nhưng sau đó người xem không thể trở lại kênh vừa rời nếu không bấm Bất kỳ để lấy một kênh khác. Thêm nút tiến ↷ để điều hướng lịch sử hai chiều ngay trong thanh phát, tránh mất ngữ cảnh. Electron screenshot: positron-p51212-random-forward-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45025012943) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45025012943/artifacts/14754798438) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45025012943/artifacts/14755327353) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45025012943/artifacts/14755049305) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fe62662b4888ce02bd1fbac7d9a57fde4c6f3715)

</details>

<details>
<summary><strong>P5.1.211</strong> · Trở lại kênh ngẫu nhiên đã khám phá / Electron 4.23.296 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.296 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Sau ảnh Electron P5.1.210, thanh Bất kỳ đã có số lượt và nút làm mới nhưng chưa có thao tác quay lại khi vừa khám phá một kênh ngẫu nhiên thú vị rồi chuyển tiếp. Thêm nút quay lại theo lịch sử phiên khám phá để tiết kiệm thao tác tìm kênh và giữ ngữ cảnh. Electron screenshot: positron-p51211-random-back-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45024273180) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45024273180/artifacts/14755561418) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45024273180/artifacts/14755316375) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45024273180/artifacts/14755750173) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/7114bfbad4b3018e39d5da180b1b94d029e94a0d)

</details>

<details>
<summary><strong>P5.1.210</strong> · Tự cập nhật bộ đếm khám phá khi đổi nguồn / Electron 4.23.295 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.295 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Từ ảnh P5.1.209 và mã xử lý danh sách nguồn, bộ đếm Bất kỳ có thể tiếp tục ghi nhận các kênh đã xóa hoặc thay nguồn, dẫn tới tiến độ sai cho tới lúc người dùng tự bấm chuyển kênh tiếp. Bổ sung đồng bộ thông minh khi danh sách kênh được cập nhật, tránh khiến tiến độ kênh không còn tồn tại gây nhầm lẫn. Electron screenshot: positron-p51210-source-sync-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45023542761) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45023542761/artifacts/14754961601) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45023542761/artifacts/14755201127) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45023542761/artifacts/14754965987) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9cbd49228ed9ae4bba7c56edb8cabc2efe7d55e0)

</details>

<details>
<summary><strong>P5.1.209</strong> · Tiến độ khám phá ngẫu nhiên có mẫu số / Electron 4.23.294 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.294 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.208 cho thấy nút Bất kỳ chỉ hiển thị số kênh đã thử trong phiên (1), không cho biết tổng số kênh đủ điều kiện. Thêm mẫu số trực tiếp để người xem biết đã khám phá bao nhiêu trong toàn bộ playlist hiện tại. Electron screenshot: positron-p51209-random-progress-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45022523364) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45022523364/artifacts/14754024617) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45022523364/artifacts/14754418455) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45022523364/artifacts/14753689170) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0b188efc125b3bb30c8a09df44d37375433da07f)

</details>

<details>
<summary><strong>P5.1.208</strong> · Giữ tiêu điểm khi làm mới khám phá ngẫu nhiên / Electron 4.23.293 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.293 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Nút làm mới tự ẩn khi đang có tiêu điểm bàn phím khiến người dùng điều khiển từ xa mất vị trí tiếp tục thao tác chọn kênh phát; lỗi chặn trải nghiệm xem và không thể đi tiếp bằng Enter như mong đợi. Electron screenshot: positron-p51208-focus-return-after-1920x1080-real.png

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45021828902) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45021828902/artifacts/14754143004) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45021828902/artifacts/14754093195) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45021828902/artifacts/14753738032) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1dde6d67c651cd75710de0ea53d161c3d102528d)

</details>

<details>
<summary><strong>P5.1.207</strong> · Làm mới vòng khám phá ngẫu nhiên (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.292 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút làm mới trực tiếp trên thanh phát để người xem bắt đầu một lượt khám phá ngẫu nhiên mới bất cứ khi nào, không cần chờ đi hết toàn bộ danh sách hợp lệ. User action: Sau khi nhấn Bất kỳ ít nhất một lần, nhấn nút ↻ ngay bên cạnh để xóa bộ đếm lượt khám phá hiện tại rồi bắt đầu chọn lại từ đầu.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45020339907) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45020339907/artifacts/14753069788) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45020339907/artifacts/14753322447) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45020339907/artifacts/14753013508) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b9e283ba16cf68d174c8ac2feefef51c4414245c)

</details>

<details>
<summary><strong>P5.1.206</strong> · Khám phá ngẫu nhiên không lặp kênh (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.291 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người xem dùng nút Bất kỳ nhiều lần mà tránh chọn lại các kênh đã được khám phá trong cùng chu kỳ; khi hết tập hợp hợp lệ mới mở vòng khám phá tiếp, tăng sự đa dạng. User action: Trên màn hình Xem truyền hình, nhấn Bất kỳ nhiều lần; huy hiệu số đếm các kênh đã chọn trong chu kỳ hiện tại, hoạt động ngay trong trình phát.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45019623003) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45019623003/artifacts/14752943900) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45019623003/artifacts/14753381318) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45019623003/artifacts/14753515888) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c6fa1983e7befaf3a8977bdcdcd3e1176f05d66c)

</details>

<details>
<summary><strong>P5.1.205</strong> · Đổi kênh ngẫu nhiên ngay khi xem (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.290 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Người xem có thể khám phá kênh ngẫu nhiên khác ngay khi đang phát thay vì phải trở về màn hình chưa chọn kênh. User action: Tại Xem truyền hình, khi có từ hai kênh hợp lệ, nhấn biểu tượng xúc xắc Bất kỳ bên cạnh nút Kênh sau.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45018906781) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45018906781/artifacts/14752029933) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45018906781/artifacts/14753450334) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45018906781/artifacts/14752314285) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/14682f2c11b798f8f2565cdb9ec69729fa6fcb11)

</details>

<details>
<summary><strong>P5.1.204</strong> · Khám phá kênh ngẫu nhiên từ trang TV (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.289 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi có nhiều kênh đã nhập nhưng chưa chọn kênh để xem, nút “Khám phá kênh ngẫu nhiên” giúp tìm nội dung mới thay vì luôn bắt đầu từ kênh thứ nhất; không chọn kênh chết/thiếu URL, không tự chạy lúc mở app. User action: Mở trang Xem truyền hình, khi chưa chọn kênh hãy nhấn Khám phá kênh ngẫu nhiên; ứng dụng chọn một kênh hợp lệ bằng hành động rõ ràng của người xem.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45016102045) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45016102045/artifacts/14751792737) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45016102045/artifacts/14751872622) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45016102045/artifacts/14752530338) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9052de6fe686bbdae4a04b548e6e158590c5c5ba)

</details>

<details>
<summary><strong>P5.1.203</strong> · Thông báo TV không che nút phát/âm lượng (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.288 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi xem truyền hình trên desktop, thông báo được đưa đến vùng góc phía trên; nút mở danh sách nổi vẫn bấm được nhưng không che thanh phát và âm lượng, trong khi cảnh báo quan trọng cùng lịch sử trên thanh đầu vẫn truy cập được. User action: Mở trang Xem truyền hình trên desktop và thực hiện thao tác phát sinh thông báo; điều khiển Play/Volume không còn bị banner che. Bấm Thông báo trên thanh trên để xem nhật ký.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45015321816) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45015321816/artifacts/14751760664) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45015321816/artifacts/14752095837) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45015321816/artifacts/14751706650) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a8bf38dceee311551c452c8127c8614cf16639b2)

</details>

<details>
<summary><strong>P5.1.202</strong> · Gia hạn lịch ghi thêm 15 phút, giới hạn tối đa 8 giờ (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.287 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Giữ nguyên kênh và giờ bắt đầu, cho phép gia hạn mốc kết thúc thêm 15 phút khi chương trình thể thao hoặc trực tiếp kéo dài. User action: Vào Lịch phát sóng → Hẹn giờ ghi hình, chọn thời gian bắt đầu/kết thúc hợp lệ, nhấn “Gia hạn +15 phút”; có cả trên mẫu ghi nhanh từ TV.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45014092924) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45014092924/artifacts/14750539792) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45014092924/artifacts/14750754642) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45014092924/artifacts/14750568355) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/023d2800d24c25eb21673568f88fb6c2339e4cb5)

</details>

<details>
<summary><strong>P5.1.201</strong> · Hoàn tác lần thay tên bản ghi vừa xác nhận (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.286 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép khôi phục đúng tên chương trình người dùng vừa thay bằng nút hoàn tác một lần, tránh mất tên nhập thủ công khi họ đổi ý và không làm thay đổi bất cứ lịch ghi nào. User action: Mở Lịch phát sóng, nhập tên riêng, xác nhận hai lần thay tên theo kênh, rồi nhấn Hoàn tác thay tên để trở về tên trước đó.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45012143002) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45012143002/artifacts/14750167111) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45012143002/artifacts/14749944813) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45012143002/artifacts/14750406166) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/cf02d2a3c4e7aca3788d66ca5ef548bcfef5dd14)

</details>

<details>
<summary><strong>P5.1.200</strong> · Xác nhận thay tên lịch ghi bằng hai lần nhấn (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.285 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Khi đã có tên ghi hình tự nhập, nút tạo tên tự động cho phép xác nhận rõ ràng bằng hai lần nhấn thay vì bắt xóa tên cũ; tránh ghi đè vô ý và giảm bước thao tác. User action: Vào Lịch phát sóng, nhập tên riêng, bấm Tạo tên từ kênh và giờ một lần để xem xác nhận, bấm lần hai để thay hoặc nhấn Escape để hủy.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45011406722) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45011406722/artifacts/14750003127) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45011406722/artifacts/14749624706) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45011406722/artifacts/14750191642) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/59eb5d2427b5867b127eb26b547004a3d35b3c8e)

</details>

<details>
<summary><strong>P5.1.199</strong> · Đồng bộ tên ghi hình tạo tự động (CANDIDATE) · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.284 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Tên được ứng dụng tạo từ kênh và giờ nay tự cập nhật khi người xem đổi thời gian ghi hoặc kênh, tránh tạo lịch với tên sai ngày nhưng vẫn bảo vệ nhãn nhập tay. User action: Mở Lịch phát sóng, tạo tên từ kênh và giờ, sau đó chọn Ngày mai cùng giờ hoặc sửa giờ bắt đầu để thấy tên tự cập nhật.

![Ảnh chụp Electron thật P5.1.199](./screenshots/positron-p51199-desktop-1920x1080-trang-chu-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45010478235) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45010478235/artifacts/14749422681) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45010478235/artifacts/14748999033) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45010478235/artifacts/14749737352) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9eb4ea091ac8e419caf488b644c0ae7639ec44fa)

</details>

<details>
<summary><strong>P5.1.198</strong> · Hẹn giờ ghi ngày mai cùng giờ / Electron 4.23.283 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.283 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.197 thực tế cho thấy các nút bắt đầu nhanh chỉ có Sau 5, Sau 15, Sau 30 phút, không có cách chuyển lịch ghi sang ngày mai giữ nguyên giờ đã chọn. Bổ sung nút Ngày mai cùng giờ ở cả hai mẫu ghi hình để tiện lên lịch mà không nhập lại giờ kết thúc. Electron screenshot: positron-p51198-dvr-tomorrow-after-1920x1080-real.png

![Ảnh chụp Electron thật P5.1.198](./screenshots/positron-p51198-dvr-tomorrow-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45008120878) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45008120878/artifacts/14749011467) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45008120878/artifacts/14747964856) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45008120878/artifacts/14749225238) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f84f7f4e84d3b5b398bded8c4111162797ce4810)

</details>

<details>
<summary><strong>P5.1.197</strong> · Sao chép lịch ghi và bỏ lặp tên kênh / Electron 4.23.282 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.282 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.196 thật ở 1920×1080 cho thấy dòng xem trước nhỏ, lặp kênh hai lần khi tên được tạo tự động và không thể sao chép nội dung để đối chiếu. Bổ sung nút sao chép theo yêu cầu, trạng thái thành công/thất bại và nội dung tóm tắt gọn dễ đọc. Electron screenshot: positron-p51197-dvr-copy-after-1920x1080-real.png

![Ảnh chụp Electron thật P5.1.197](./screenshots/positron-p51197-dvr-copy-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45007155339) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45007155339/artifacts/14748690750) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45007155339/artifacts/14747384480) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45007155339/artifacts/14748586133) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/70906dee44f4669c739051a079d9dc6bb7e251bd)

</details>

<details>
<summary><strong>P5.1.196</strong> · Xem trước lịch ghi hình / Electron 4.23.281 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.281 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.195 cho thấy người dùng điền kênh, tên và hai mốc thời gian nhưng thiếu bước xem lại toàn bộ lịch. Thêm phần xem trước luôn cập nhật, cho phép phát hiện thời lượng sai trước khi người dùng chủ động xác nhận. Electron screenshot: positron-p51196-dvr-preview-after-1920x1080-real.png

![Ảnh chụp Electron thật P5.1.196](./screenshots/positron-p51196-dvr-preview-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45006490171) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45006490171/artifacts/14747834242) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45006490171/artifacts/14748163010) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45006490171/artifacts/14748043664) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/35e66592acf4182cb74d412a2eb643abc241c049)

</details>

<details>
<summary><strong>P5.1.195</strong> · Đặt tên bản ghi tự động theo kênh và giờ / Electron 4.23.280 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.280 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.194 Electron thật cho thấy ô Tên chương trình vẫn rỗng ngay cả khi kênh và giờ ghi đã được chọn; người dùng cần gõ lại hoặc không thể lưu vì trường bắt buộc. Thêm nút gợi ý tên chính xác theo kênh/giờ, tuyệt đối không ghi đè tên tự nhập. Tính năng: nút “Tạo tên từ kênh và giờ” bên dưới Tên chương trình của mẫu EPG. Nhấn để điền tên kênh đã chọn và thời gian địa phương đã nhập (DD.MM.YYYY HH:mm), loại ký tự không an toàn; nếu người dùng đã nhập tên khác thì chỉ báo và giữ nguyên. Không đổi giờ, kênh, nguồn hay trạng thái ghi hình.

![Ảnh chụp Electron thật P5.1.195](./screenshots/positron-p51195-dvr-autoname-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004688211) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004688211/artifacts/14748065112) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004688211/artifacts/14747131927) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004688211/artifacts/14748015386) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4c0af9abac7b5a596d024e423b04a7d947672f33)

</details>

<details>
<summary><strong>P5.1.194</strong> · Chọn nhanh giờ bắt đầu ghi hình sau 5/15/30 phút / Electron 4.23.279 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.279 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.193 thực ở 1920×1080 cho thấy lịch ghi có các nút chọn thời lượng nhưng trường Bắt đầu vẫn cần nhập ngày giờ thủ công. Bổ sung chọn giờ bắt đầu từ hiện tại để giảm thao tác hẹn ghi, không gửi lịch khi chưa xác nhận. Tính năng: dưới giờ Bắt đầu có ba nút “Sau 5 phút”, “Sau 15 phút”, “Sau 30 phút” ở EPG và biểu mẫu ghi nhanh TV. Nhấn chỉ điền Bắt đầu dựa trên phút hiện tại, đồng thời dời Kết thúc để giữ thời lượng cũ nếu hợp lệ (1–480 phút), hoặc 60 phút khi thiếu/không hợp lệ. Tự cập nhật nhãn thời lượng và trạng thái preset P5.1.192/193.

![Ảnh chụp Electron thật P5.1.194](./screenshots/positron-p51194-dvr-start-after-before-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004026363) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004026363/artifacts/14747500489) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004026363/artifacts/14747490521) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45004026363/artifacts/14746809647) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ff29ada0c777398a4fc8dcba36db4cd9c99dd474)

</details>

<details>
<summary><strong>P5.1.193</strong> · Nút DVR tự đánh dấu thời lượng 30/60/120 phút / Electron 4.23.278 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.278 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thực của P5.1.192 cho thấy thời lượng 1 giờ nhưng ba nút 30/60/120 phút có giao diện giống hệt nhau, khiến người xem khó xác định lựa chọn hiện tại khi chỉnh giờ ghi. Khi nhập Bắt đầu/Kết thúc, ứng dụng đánh dấu đúng nút có số phút tương ứng bằng aria-pressed và viền màu chủ đề; không có nút được chọn khi chỉnh giờ không khớp hoặc lịch sai.

![Ảnh chụp Electron thật P5.1.193](./screenshots/positron-p51193-dvr-selected-preset-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45003368885) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45003368885/artifacts/14746748583) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45003368885/artifacts/14746987285) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45003368885/artifacts/14747031520) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5074565d748fc23c50d1b26cb6523cf024a2388b)

</details>

<details>
<summary><strong>P5.1.192</strong> · Thời lượng ghi hình trực tiếp và cảnh báo 8 giờ / Electron 4.23.277 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.277 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.191 cho thấy nút chọn thời lượng 30/60/120 phút đã hoạt động, nhưng form không có thông tin tổng thời lượng và chưa cảnh báo trực quan khi người dùng sửa giờ kết thúc sai. Thêm dòng kiểm tra trực tiếp cho cả EPG DVR và ghi nhanh TV mà không can thiệp luồng ghi hình. Hiển thị số giờ/phút ngay khi nhập thời gian; nếu kết thúc không sau bắt đầu hoặc vượt 8 giờ, báo rõ lỗi. Không tự thay đổi giờ nhập, không tự tạo lịch, không phát video, giữ xác thực DVR native.

![Ảnh chụp Electron thật P5.1.192](./screenshots/positron-p51192-dvr-duration-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45002519101) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45002519101/artifacts/14746886386) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45002519101/artifacts/14746328581) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45002519101/artifacts/14745843920) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1b90ff51eb4aa01d12b0b48e4483051b34118c70)

</details>

<details>
<summary><strong>P5.1.191</strong> · Chọn nhanh thời lượng DVR 30/60/120 phút / Electron 4.23.276 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.276 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh EPG Electron thật P5.1.190 ở 1920×1080 cho thấy hẹn giờ ghi hình phải nhập thủ công cả thời gian Bắt đầu và Kết thúc. Thêm nút cộng 30, 60, 120 phút dưới trường Kết thúc ở cả lịch ghi trên EPG và biểu mẫu ghi nhanh trên TV. Nút chỉ tính và điền giá trị Kết thúc theo thời gian Bắt đầu ở múi giờ cục bộ; kích hoạt input/change để form gốc kiểm tra. Không tự đặt lịch, không khởi chạy DVR, không sửa nguồn M3U, danh sách kênh hoặc quyền xem.

![Ảnh chụp Electron thật P5.1.191](./screenshots/positron-p51191-dvr-presets-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001869250) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001869250/artifacts/14746481565) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001869250/artifacts/14745754799) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001869250/artifacts/14746098066) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/324ce2606c258faa412d811b4acb95865f8c1c81)

</details>

<details>
<summary><strong>P5.1.190</strong> · Bấm lại tab TV để trở về khung phát / Electron 4.23.275 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.275 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.189 1920×1080 cho thấy đầu trình phát bị khuất khi đang ở trang TV nhưng cuộn còn sâu; thao tác chọn TV khi tab đã active không quay về vùng video vì setPage chỉ đặt lại scroll ở lần chuyển tab. Khi chọn lại nút TV đang active, cuộn nội dung về đầu trình phát ngay. Chỉ áp dụng cho trang TV, không chuyển kênh, không tự phát và không thay đổi các tab/thiết lập khác.

![Ảnh chụp Electron thật P5.1.190](./screenshots/positron-p51190-tv-reselect-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001086204) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001086204/artifacts/14745474647) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001086204/artifacts/14746051346) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45001086204/artifacts/14746325855) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b8a22f0f8b7e0e533ad9fd264fde379b045733e8)

</details>

<details>
<summary><strong>P5.1.189</strong> · Sắp xếp gợi ý Yêu thích A–Z / Z–A / theo nguồn / Electron 4.23.274 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.274 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.188 đã dàn đủ sáu cột gợi ý nhưng chỉ có tìm kiếm và lọc nhóm, chưa có cách sắp xếp các kênh chưa yêu thích khi nguồn chứa hàng trăm kênh. Thêm tùy chọn hiển thị Theo nguồn, Tên A–Z, Tên Z–A theo thứ tự tiếng Việt. Lựa chọn chỉ sắp xếp mảng gợi ý đã lọc trước khi phân trang; giữ nguyên thứ tự nguồn M3U, Favorites đã lưu, trạng thái kênh hiện tại và nút lưu hàng loạt, không tự phát video.

![Ảnh chụp Electron thật P5.1.189](./screenshots/positron-p51189-favorite-sort-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/45000491204) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45000491204/artifacts/14745861833) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45000491204/artifacts/14745846880) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/45000491204/artifacts/14746030955) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/61177c02fc3c2e727e1057034b65dd678fad3c16)

</details>

<details>
<summary><strong>P5.1.188</strong> · Gợi ý Yêu thích đủ rộng trên desktop / Electron 4.23.273 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.273 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm chế độ dàn gợi ý toàn chiều rộng desktop giúp duyệt kênh nhanh hơn, dựa trên ảnh Electron P5.1.187 thật ở 1920×1080 cho thấy phần gợi ý chỉ chiếm 1180px, để thừa vùng trống rộng bên phải, trong khi danh sách Yêu thích phía trên dùng đủ chiều ngang. Với desktop từ 1600px, mở rộng riêng khối gợi ý theo bề ngang vùng nội dung, tự bố trí 6 cột dễ đọc. Giữ 4 cột ở laptop, 2/1 cột ở máy hẹp; không đụng dữ liệu M3U/Favorites, phát video hoặc phân trang.

![Ảnh chụp Electron thật P5.1.188](./screenshots/positron-p51188-favorite-wide-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44999409219) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44999409219/artifacts/14745166752) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44999409219/artifacts/14745586285) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44999409219/artifacts/14745327036) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/688f2740afdf66c424ce82dcd6aeb3e4391272a5)

</details>

<details>
<summary><strong>P5.1.187</strong> · Đi thẳng tới trang gợi ý / Electron 4.23.272 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.272 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.186 hiển thị Trang 9/9 và Trước/Tiếp, nhưng chưa thể tới trang số bất kỳ khi nguồn có hàng chục hoặc hàng trăm trang. Thêm ô số “Đến trang” với giới hạn 1..tổng trang, nhập và nhấn Enter hoặc đổi giá trị để nhảy trực tiếp; tự kẹp số quá nhỏ/lớn, đồng bộ chỉ số và số kênh, giữ nguyên tìm kiếm/nhóm/pageSize và dữ liệu nguồn.

![Ảnh chụp Electron thật P5.1.187](./screenshots/positron-p51187-favorite-direct-page-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44998410884) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44998410884/artifacts/14744857042) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44998410884/artifacts/14744559372) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44998410884/artifacts/14745265654) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/93abc920f4197ca4e3724b8ce83411f23ddcaa7f)

</details>

<details>
<summary><strong>P5.1.186</strong> · Phân trang gợi ý Trước / Tiếp / Trang x/y / Electron 4.23.271 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.271 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.185 có hàng trăm kênh gợi ý nhưng chỉ có Gợi ý khác, không biết đang ở trang nào, không quay lại trang trước và vòng lặp cũ có thể lặp kênh ở trang cuối. Thêm nút Trước, chỉ số Trang x/y (aria-live), giữ nút Gợi ý khác để tiến tiếp; phân trang theo các lát cắt không trùng kênh. Trang cuối đúng số còn lại, nút Lưu cả N phản ánh số hiện tại, chức năng cũ vẫn giữ và không tự phát video.

![Ảnh chụp Electron thật P5.1.186](./screenshots/positron-p51186-favorite-paging-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997852004) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997852004/artifacts/14744513260) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997852004/artifacts/14745140514) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997852004/artifacts/14744588118) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/3d990557bb77972a22f4e0d77ff55b7436da7bcb)

</details>

<details>
<summary><strong>P5.1.185</strong> · Nhóm gợi ý truy cập nhanh có số kênh / Electron 4.23.270 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.270 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.184 có dropdown nhóm nhưng không biết số kênh từng nhóm trước khi chọn; duyệt 541 kênh mất thời gian. Thêm dải nút truy cập nhanh các nhóm nhiều kênh với đếm số lượng thực từ kênh còn gợi ý, đánh dấu nhóm đang chọn bằng aria-pressed; chọn Tất cả khôi phục. Dropdown hiện số lượng từng nhóm và tổng kênh; không can thiệp M3U, favoriteKeys hay phát video.

![Ảnh chụp Electron thật P5.1.185](./screenshots/positron-p51185-group-quick-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997197125) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997197125/artifacts/14744841063) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997197125/artifacts/14744656834) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44997197125/artifacts/14744955101) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/cda6a6fe6f29798b3dda34faeab54ab5f648f452)

</details>

<details>
<summary><strong>P5.1.184</strong> · Lọc gợi ý Yêu thích theo nhóm / Electron 4.23.269 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.269 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh P5.1.183 chứng minh có 553 kênh chưa lưu nhưng gợi ý không phân loại theo nhóm; tìm bằng mắt còn rườm rà. Thêm dropdown nhóm được tạo trực tiếp từ metadata nguồn đang bật, chỉ lọc tên nhóm thực có kênh chưa đánh dấu sao. Kết hợp tìm kiếm không dấu và lựa chọn 6/12/24 kênh, nút Lưu cả N vẫn theo số thẻ được lọc. Tập dữ liệu nguồn và favoriteKeys giữ nguyên.

![Ảnh chụp Electron thật P5.1.184](./screenshots/positron-p51184-favorite-group-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44996617767) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44996617767/artifacts/14743933119) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44996617767/artifacts/14744002516) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44996617767/artifacts/14744720426) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/4f8caf8a4166a6cf47b655ad5a63fdf3a0352e89)

</details>

<details>
<summary><strong>P5.1.183</strong> · Gợi ý Yêu thích 6/12/24 kênh / Electron 4.23.268 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.268 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.182 cho thấy 6 gợi ý bị bó trong card 720px trên desktop rộng 1920px, duyệt nhiều kênh mất thao tác. Viewer chọn 6, 12 hoặc 24 gợi ý, giữ mặc định sáu, nút Gợi ý khác nhảy đúng số đang chọn, Lưu cả N chỉ lưu kênh hiển thị sau nhấn chủ động. Tăng panel lên tối đa 1180px, 4/2/1 cột responsive.

![Ảnh chụp Electron thật P5.1.183](./screenshots/positron-p51183-favorite-suggestions-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995970440) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995970440/artifacts/14744145644) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995970440/artifacts/14744430035) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995970440/artifacts/14743659503) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c27cf4ce68b224a24d6c2a0e63e281b670a61974)

</details>

<details>
<summary><strong>P5.1.182</strong> · Sắp xếp Yêu thích theo tên / Electron 4.23.267 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.267 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Từ ảnh Electron P181 nhận thấy danh sách 8 Favorites thiếu điều khiển sắp xếp, khó tìm bằng mắt ở thư viện nhiều kênh. Thêm select “Thứ tự ban đầu / Tên A–Z / Tên Z–A” cạnh ô tìm kiếm; Intl.Collator('vi') và CSS order, không ghi thay đổi vào favoriteKeys, M3U hay trạng thái trình phát.

![Ảnh chụp Electron thật P5.1.182](./screenshots/positron-p51182-favorites-sort-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995431714) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995431714/artifacts/14743846836) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995431714/artifacts/14743583561) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44995431714/artifacts/14743538975) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/38923e0aa8f2fd1715eb6892999ddacb3139e869)

</details>

<details>
<summary><strong>P5.1.181</strong> · Sửa lưới Yêu thích 6 cột hẹp/cắt tên / Electron 4.23.266 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.266 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Ảnh P5.1.180 xác nhận lỗi cắt tên Yêu thích khiến người xem không nhận diện chính xác kênh trước khi bấm phát video, nguy cơ chọn sai kênh; đây là lỗi cản trở sử dụng cốt lõi. Visual bug confirmed from real screenshot P5.1.180: khi lưu 6 kênh một lần tổng 8 Favorites, auto-fit grid dàn thành 6 cột hẹp, tên "QA Ch..." bị ellipsis và metadata dồn 4 dòng.

![Ảnh chụp Electron thật P5.1.181](./screenshots/positron-p51181-readable-favorites-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44994741904) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44994741904/artifacts/14743133651) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44994741904/artifacts/14743208573) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44994741904/artifacts/14743662387) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/93edf7c6aea472f95462e1606ef9d7597526bb60)

</details>

<details>
<summary><strong>P5.1.180</strong> · Lưu nhiều kênh gợi ý vào Yêu thích bằng một nhấn / Electron 4.23.265 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.265 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.179 cho thấy tìm ra kênh gợi ý dễ hơn nhưng người xem vẫn phải nhấn ☆ nhiều lần để lưu một nhóm sáu kênh. Thêm thao tác Lưu cả N kênh chỉ lưu danh sách gợi ý hiện tại khi có nhấn chủ động, không sửa playlist hoặc tự phát. User action: Mở Yêu thích có ít nhất một kênh → xem nhóm gợi ý hoặc lọc theo tên/nhóm → bấm Lưu cả N kênh để đánh dấu yêu thích toàn bộ danh sách N kênh đang hiển thị.

![Ảnh chụp Electron thật P5.1.180](./screenshots/positron-p51180-bulk-favorites-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992995959) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992995959/artifacts/14742369391) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992995959/artifacts/14743090109) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992995959/artifacts/14742671504) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/7324378988794dfed8c96fc16bdbd3bad9083b94)

</details>

<details>
<summary><strong>P5.1.179</strong> · Tìm trực tiếp trong 559 kênh gợi ý / Electron 4.23.264 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.264 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.178 cho thấy Gợi ý khác đã duyệt sáu kênh mỗi lần nhưng không có cách tìm tên hoặc nhóm khi 559 kênh chưa sao. Bổ sung bộ tìm riêng ngay trong khu vực gợi ý, hỗ trợ tiếng Việt không dấu, không ảnh hưởng bộ lọc của Favorites đã lưu. User action: Mở Yêu thích có ít nhất một kênh → gõ tên hoặc nhóm trong ô Tìm kênh để thêm → chọn ☆ để lưu hoặc xóa từ khóa để xem các nhóm kênh tiếp.

![Ảnh chụp Electron thật P5.1.179](./screenshots/positron-p51179-search-suggestions-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992579411) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992579411/artifacts/14742736065) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992579411/artifacts/14742631091) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992579411/artifacts/14742915005) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f6f2736a5f91cc3904ffc2f692439e803440529f)

</details>

<details>
<summary><strong>P5.1.178</strong> · Gợi ý khác để duyệt thêm kênh Yêu thích / Electron 4.23.263 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.263 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.176 cho thấy bảng Gợi ý thêm vào Yêu thích chỉ có sáu kênh đầu dù còn hàng trăm kênh chưa đánh sao. Thêm nút Gợi ý khác để duyệt các nhóm sáu kênh chưa sao tiếp theo mà không sửa playlist và không tự phát. User action: Mở trang Yêu thích có ít nhất một kênh → bấm Gợi ý khác để thấy sáu kênh tiếp theo → bấm ☆ ở kênh mong muốn để thêm vào Yêu thích.

![Ảnh chụp Electron thật P5.1.178](./screenshots/positron-p51178-rotate-favorites-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992015463) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992015463/artifacts/14742730056) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992015463/artifacts/14742695020) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44992015463/artifacts/14742372521) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/433dcac2d6833063948cf6bad53c980ebe4d7896)

</details>

<details>
<summary><strong>P5.1.177</strong> · Tìm kiếm không dấu trong Yêu thích / Electron 4.23.262 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.262 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh thực P5.1.176 đã có 2 thẻ yêu thích với số lượng có thể tăng liên tục; trang chưa có ô tìm riêng theo tên/nhóm. Bổ sung thanh tìm kênh trong Yêu thích, hỗ trợ tiếng Việt không dấu, case-insensitive, trả về số hiển thị X / tổng mà không thay đổi số kênh yêu thích thật. User action: Mở trang Yêu thích đang có nhiều thẻ → nhập một phần tên hoặc nhóm vào ô Tìm trong Yêu thích → chỉ còn thẻ phù hợp; xóa từ khóa để trở lại danh sách đầy đủ.

![Ảnh chụp Electron thật P5.1.177](./screenshots/positron-p51177-search-favorites-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991582843) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991582843/artifacts/14741129418) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991582843/artifacts/14741718020) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991582843/artifacts/14742067841) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/56e4f6e26bc8342f1a83a10fc43c204352440822)

</details>

<details>
<summary><strong>P5.1.176</strong> · Gợi ý thêm Yêu thích sau kênh đầu tiên / Electron 4.23.261 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.261 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.175 sau thao tác cho thấy QA Channel 001 là thẻ Yêu thích duy nhất, còn phần lớn trang trống, trong khi 560 kênh khác đã nhập. Bổ sung bảng Gợi ý thêm vào Yêu thích ở cuối danh sách khi đã có Favorites, với tối đa 6 kênh chưa đánh dấu sao; bấm ☆ lưu trực tiếp, không phát. User action: Mở Yêu thích đã có ít nhất một kênh → chọn ☆ tại bảng Gợi ý thêm vào Yêu thích → kênh tiếp theo xuất hiện trong danh sách ngay lập tức, cập nhật số sao.

![Ảnh chụp Electron thật P5.1.176](./screenshots/positron-p51176-more-favorites-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991179482) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991179482/artifacts/14741867991) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991179482/artifacts/14741987373) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44991179482/artifacts/14742132049) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/12f85294771a70492470a5183470e1f157512326)

</details>

<details>
<summary><strong>P5.1.175</strong> · Thêm nhanh kênh vào Yêu thích ngay trong empty state / Electron 4.23.260 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.260 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.174 cho thấy trang Yêu thích đang trống nhưng có 561 kênh và CTA phải chuyển sang TV. Tạo cụm chọn nhanh tối đa 6 kênh đang bật, bấm ☆ bên cạnh tên kênh sẽ đánh dấu yêu thích ngay tại đây, không cần mở player. Đồng thời CTA tới TV xóa từ khóa QA Channel 011 cũ để trả lại toàn bộ 561 kênh. User action: Mở Yêu thích khi chưa có kênh yêu thích nhưng đã có nguồn → chọn một trong tối đa 6 nút ☆ kênh được gợi ý → kênh đó xuất hiện thành thẻ Yêu thích; có thể mở TV để chọn thêm kênh khác.

![Ảnh chụp Electron thật P5.1.175](./screenshots/positron-p51175-quick-favorite-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990708741) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990708741/artifacts/14741822380) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990708741/artifacts/14741766717) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990708741/artifacts/14741716931) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c4da69de4d8d282026a8cd48cf6d24f019eff9cc)

</details>

<details>
<summary><strong>P5.1.174</strong> · Yêu thích trống dẫn đúng tới TV thay vì Quản lý nguồn / Electron 4.23.259 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.259 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.173 tại trang Yêu thích cho thấy 561 kênh đã nhập nhưng danh sách chưa có sao, nút CTA vẫn ghi Quản lý nguồn IPTV; dẫn người dùng sang việc thêm nguồn không liên quan. CTA giờ đổi theo dữ liệu hiện có: có kênh → Xem kênh để đánh dấu ★ (quay về TV, focus ô tìm); không có kênh → Quản lý nguồn IPTV. User action: Mở Yêu thích khi đã có kênh nhưng chưa đánh dấu sao → bấm Xem kênh để đánh dấu ★ → tự đến TV và focus tìm kênh; việc đánh dấu sao vẫn do người dùng thực hiện.

![Ảnh chụp Electron thật P5.1.174](./screenshots/positron-p51174-favorite-action-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990151705) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990151705/artifacts/14741019603) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990151705/artifacts/14741044697) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44990151705/artifacts/14741526842) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/240af7385b31dc55da55264675cd05ae2f14df44)

</details>

<details>
<summary><strong>P5.1.173</strong> · Quay lại đúng vị trí kiểm kê sau khi tìm kênh / Electron 4.23.258 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.258 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron P5.1.172 cho thấy bấm Tìm sẽ đưa đúng một kênh lên TV nhưng người dùng phải tìm lại vị trí kiểm kê; bổ sung nút ↩ Kiểm kê · trang N xuất hiện cạnh ô tìm TV chỉ sau thao tác định vị, quay về đúng trang kênh thiếu logo đang xử lý mà không mất bộ lọc. User action: Từ Thư viện → Kênh thiếu logo → sang trang 2 → bấm Tìm một kênh → chọn ↩ Kiểm kê · trang 2 ngay dưới ô tìm để quay lại đúng trang thứ hai và tiếp tục rà soát.

![Ảnh chụp Electron thật P5.1.173](./screenshots/positron-p51173-return-inspection-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989696888) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989696888/artifacts/14740769871) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989696888/artifacts/14741561885) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989696888/artifacts/14741486425) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1dd6895f7bde24deb17a19c4b3a4b86de072ce55)

</details>

<details>
<summary><strong>P5.1.172</strong> · Tìm đúng kênh thiếu logo trong danh sách TV / Electron 4.23.257 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.257 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Ảnh Electron thật P5.1.171 cho thấy trang kiểm kê hiển thị kênh 11–20 trong khi danh sách TV bên trái còn kênh 1–10, thiếu cầu nối tìm đúng kênh để người dùng sửa hoặc xem thông tin. Thêm nút Tìm cho mỗi hàng, đặt ô tìm trong TV theo đúng tên kênh và mở bộ lọc Tất cả. User action: Mở Thư viện → Kênh thiếu logo → chuyển tới trang cần kiểm tra → bấm Tìm cạnh kênh muốn định vị; panel đóng, tab TV hiện danh sách đã lọc theo tên, chỉ phát khi người dùng chủ động bấm kênh.

![Ảnh chụp Electron thật P5.1.172](./screenshots/positron-p51172-locate-channel-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989286997) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989286997/artifacts/14740823774) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989286997/artifacts/14740784057) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44989286997/artifacts/14741107780) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/511b1331a809f62bd39c47abfbfb6048e3c27f19)

</details>

<details>
<summary><strong>P5.1.171</strong> · Phạm vi kênh thực đang xem / Electron 4.23.256 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.256 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Electron screenshot: positron-p51171-visible-range-after-1920x1080-real.png User action: Mở Thư viện → Kênh thiếu logo → chuyển trang hoặc đổi số kênh/trang; quan sát dòng Đang xem X–Y / tổng kênh ngay dưới thanh phân trang.

![Ảnh chụp Electron thật P5.1.171](./screenshots/positron-p51171-visible-range-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44988596222) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d41dac20e845cdbef5bea8d34cb4737be5887903)

</details>

<details>
<summary><strong>P5.1.170</strong> · Xóa nhanh toàn bộ bộ lọc Thư viện / Electron 4.23.255 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.255 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép đưa năm điều kiện tìm kiếm, nhóm, EPG, thứ tự và mật độ phân trang về mặc định chỉ với một lần bấm, thay vì hoàn nguyên từng ô khi kiểm kê danh sách nhiều kênh. User action: Mở Thư viện → Kênh thiếu logo → thay đổi ít nhất một bộ lọc → bấm nút Xóa bộ lọc cạnh Xuất CSV để trở về tất cả kênh, thứ tự playlist, 10 kênh/trang.

![Ảnh chụp Electron thật P5.1.170](./screenshots/positron-p51170-clear-filters-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986538072) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986538072/artifacts/14739898223) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986538072/artifacts/14740630378) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986538072/artifacts/14739837219) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b577e4d1bfa84bab81209ca0fec6e5b1e295998c)

</details>

<details>
<summary><strong>P5.1.169</strong> · Lọc kênh thiếu logo theo mã EPG / Electron 4.23.254 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.254 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép phát hiện kênh vừa thiếu logo vừa thiếu mã nhận diện EPG hoặc có EPG nhưng thiếu logo, hỗ trợ người dùng tự ưu tiên sửa metadata thư viện lớn mà không thay đổi playlist. User action: Mở Thư viện → Kênh thiếu logo → chọn Mọi tình trạng EPG, Thiếu cả mã EPG hoặc Đã có mã EPG; kết hợp tìm kiếm, lọc nhóm, sắp xếp, phân trang và xuất CSV theo đúng tập đã lọc.

![Ảnh chụp Electron thật P5.1.169](./screenshots/positron-p51169-epg-filter-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986000752) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986000752/artifacts/14740346111) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986000752/artifacts/14740410330) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44986000752/artifacts/14740161620) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c4ecb019b4eb7863a919491b8865666699e25d79)

</details>

<details>
<summary><strong>P5.1.168</strong> · Thanh phân trang kênh thiếu logo luôn dễ thao tác / Electron 4.23.253 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.253 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Thanh điều hướng phân trang dữ liệu thư viện bị che khỏi vùng nhìn khiến người dùng không mở được những trang kênh còn lại khi danh sách lớn; đưa nút lên trên vùng cuộn giúp truy cập đầy đủ. Electron screenshot: positron-p51168-pager-visible-after-1920x1080-real.png

![Ảnh chụp Electron thật P5.1.168](./screenshots/positron-p51168-pager-visible-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44985148784) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44985148784/artifacts/14739234298) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44985148784/artifacts/14738788986) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44985148784/artifacts/14739885213) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/14265297ee9e49a053ec8e0440d9dfaddde59641)

</details>

<details>
<summary><strong>P5.1.167</strong> · Thay đổi số kênh thiếu logo mỗi trang / Electron 4.23.252 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.252 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Duyệt 10, 25 hoặc 50 kênh thiếu logo mỗi trang; thao tác nhanh với thư viện lớn (ảnh gốc có 432 kênh thiếu logo), không cần nhấn Tiếp hàng chục lần. User action: Thư viện → Kênh thiếu logo → chọn 10 / 25 / 50 kênh/trang; bộ lọc, tìm kiếm, nhảy trang và xuất CSV vẫn bảo toàn giá trị, tự tính lại số trang, quay về trang 1 sau đổi mật độ.

![Ảnh chụp Electron thật P5.1.167](./screenshots/positron-p51167-missing-page-size-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44983042167) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44983042167/artifacts/14738736314) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44983042167/artifacts/14738826814) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44983042167/artifacts/14738742056) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/7a66aabb01e3ca3167feef41cee6ba2756eb1ee9)

</details>

<details>
<summary><strong>P5.1.166</strong> · Lọc tên kênh trùng theo nguồn và Xóa lọc / Electron 4.23.251 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.251 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm bộ lọc tên kênh trùng giữa nhiều nguồn, trong một nguồn hoặc thiếu mã nguồn, giúp rà soát metadata nhanh và tránh nhầm kênh khi trùng tên giữa nhiều playlist. User action: Mở Thư viện → Tên kênh trùng → chọn chế độ lọc nguồn; khi ô tìm kiếm còn từ khóa cũ bấm Xóa lọc để hiện danh sách đầy đủ, không cần xóa từng ký tự. Xuất CSV vẫn tôn trọng bộ lọc nguồn.

![Ảnh chụp Electron thật P5.1.166](./screenshots/positron-p51166-duplicate-scope-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44982523649) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44982523649/artifacts/14738920467) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44982523649/artifacts/14738546983) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44982523649/artifacts/14738173920) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/3acc2ba80124e18d6ffacfe301583df6a60fdce8)

</details>

<details>
<summary><strong>P5.1.165</strong> · Xuất CSV tên kênh trùng / Electron 4.23.250 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.250 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Xuất bảng metadata có thể đối chiếu toàn bộ tên kênh trùng theo bộ lọc, giúp rà soát hàng trăm kênh mà không phải sửa playlist hoặc mở từng trang. User action: Thư viện → Tên kênh trùng → tìm tên hoặc nhóm → Xuất CSV; ghi toàn bộ kết quả được lọc vào file tải về.

![Ảnh chụp Electron thật P5.1.165](./screenshots/positron-p51165-duplicate-csv-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44981939496) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44981939496/artifacts/14737938990) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44981939496/artifacts/14737764746) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44981939496/artifacts/14738316063) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/936c1fb09c2e92eb275236dd960edee4111ed8c3)

</details>

<details>
<summary><strong>P5.1.164</strong> · Phát hiện tên kênh trùng trong thư viện / Electron 4.23.249 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.249 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Phát hiện các tên kênh bị nhập lặp trong playlist hoặc nhiều nguồn để rà soát thư viện lớn; phân biệt tên khác dấu tiếng Việt, không tự xóa kênh. User action: Mở Thư viện → Tên kênh trùng → mở danh sách, tìm theo tên hoặc nhóm, xem số kênh, số nhóm và số nguồn có tên trùng; dùng Trước/Tiếp để xem những trang còn lại.

![Ảnh chụp Electron thật P5.1.164](./screenshots/positron-p51164-duplicates-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44979286868) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44979286868/artifacts/14737615346) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44979286868/artifacts/14737700324) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44979286868/artifacts/14737251596) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/752bfdb8f84196ac0b4b065a50b2650303b4179c)

</details>

<details>
<summary><strong>P5.1.163</strong> · Xuất CSV kênh thiếu logo an toàn / Electron 4.23.248 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.248 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thư viện → Kênh thiếu logo → lọc/tìm/sắp xếp → **Xuất CSV** tất cả kênh khớp, không chỉ 10 hàng hiện tại. User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm, tìm hoặc sắp xếp → bấm Xuất CSV, nhận file tên và nhóm kênh trong thư mục Tải xuống.

![Ảnh chụp Electron thật P5.1.163](./screenshots/positron-p51163-csv-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44978630379) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44978630379/artifacts/14737016112) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44978630379/artifacts/14737180841) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44978630379/artifacts/14736757782) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a4a9f1e5d87d17716e5c89dd71d0bf57aaace4b9)

</details>

<details>
<summary><strong>P5.1.162</strong> · Chuyển nhanh tới trang bất kỳ trong thư viện / Electron 4.23.247 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.247 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Nhập trực tiếp trang muốn xem ở bảng kênh thiếu logo thay vì bấm nút Tiếp liên tục khi thư viện có hàng chục trang; tự giới hạn trong khoảng trang hợp lệ, tránh mất vị trí. User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm hoặc tìm kiếm → nhập số trang trong ô cạnh nút Trước/Tiếp rồi nhấn Enter hoặc nút Đến để chuyển ngay.

![Ảnh chụp Electron thật P5.1.162](./screenshots/positron-p51162-jump-page-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977730900) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977730900/artifacts/14736601466) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977730900/artifacts/14736960569) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977730900/artifacts/14736342929) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/bf88bf4ba3743247679a6adce5b617ce47245ba2)

</details>

<details>
<summary><strong>P5.1.161</strong> · Sắp xếp kênh thiếu logo A–Z/Z–A / Electron 4.23.246 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.246 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hỗ trợ sắp xếp những kênh thiếu logo theo tên tăng/giảm với so sánh số tự nhiên, để nhanh chóng phát hiện và rà soát các kênh có tên tương tự trong thư viện lớn. User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm tùy ý → chọn Thứ tự playlist, Tên kênh A–Z hoặc Tên kênh Z–A để sắp xếp riêng danh sách trên màn hình.

![Ảnh chụp Electron thật P5.1.161](./screenshots/positron-p51161-sort-missing-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977123340) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977123340/artifacts/14736004275) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977123340/artifacts/14736064152) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44977123340/artifacts/14735924595) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/caba7377c1e7c484c9db78cd1e6ee8ec48d40182)

</details>

<details>
<summary><strong>P5.1.160</strong> · .1 — Hoàn thiện lọc nhóm và minh chứng Electron / 4.23.245 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.245 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: BLOCKER_FIX — Sửa lỗi kiểm chứng CI khi bộ lọc nhóm đang hoạt động nhưng ảnh Electron sau thao tác không cho thấy điều khiển, bảo đảm hình ảnh đại diện đúng giao diện được phát hành. Electron screenshot: positron-p511601-group-filter-after-1920x1080-real.png

![Ảnh chụp Electron thật P5.1.160](./screenshots/positron-p51160-group-filter-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44976495935) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44975817118/artifacts/14735348495) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44975817118/artifacts/14735782591) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44975817118/artifacts/14736106509) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/380801bdf6db023cf17e1f79ce2beffd913f3302)

</details>

<details>
<summary><strong>P5.1.159</strong> · Tìm kiếm kênh thiếu logo / Electron 4.23.243 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.243 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm tìm kiếm kênh chưa có logo theo tên hoặc nhóm, hỗ trợ tiếng Việt không dấu để người dùng không phải duyệt từng trang trong playlist lớn. User action: Mở Thư viện → Kênh thiếu logo → nhập tên hoặc nhóm; danh sách cập nhật ngay và xoá tìm kiếm để xem lại tất cả.

![Ảnh chụp Electron thật P5.1.159](./screenshots/positron-p51159-search-missing-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44974923622) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44974923622/artifacts/14735546178) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44974923622/artifacts/14734984481) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44974923622/artifacts/14735426765) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/88483997300e24fb6e19d4a7031edd230ca0cb46)

</details>

<details>
<summary><strong>P5.1.158</strong> · Chẩn đoán kênh thiếu logo / Electron 4.23.242 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.242 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Từ tỷ lệ logo 0/561 nhìn thấy trên ảnh Electron P5.1.157, bổ sung danh sách các kênh chưa có URL logo, chia trang 10 kênh để người dùng xác định metadata thiếu. User action: Thư viện → Kênh thiếu logo → Trước / Tiếp; hiển thị tên và nhóm từ playlist đã nhập, không tự quét mạng và không bổ sung logo giả.

![Ảnh chụp Electron thật P5.1.158](./screenshots/positron-p51158-missing-logos-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14734570130) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14734350521) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44971811937/artifacts/14733927084) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2bc1e0ee731cf586b2832752c7ddec50c0600f72)

</details>

<details>
<summary><strong>P5.1.157</strong> · Phân bố kênh theo nhóm / Electron v4.23.241 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.241 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm danh sách nhóm kênh với số lượng và thanh tỷ lệ ngay trong Bản đồ thư viện; có thể mở thêm từng 5 nhóm mà không cần tải nguồn mới hoặc thử phát. User action: Bấm Thư viện, xem Phân bố kênh theo nhóm; nhấn Xem thêm 5 nhóm để đọc tiếp, chọn Thu gọn danh sách khi đã xem hết.

![Ảnh chụp Electron thật P5.1.157](./screenshots/positron-p51157-groups-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970820752) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970820752/artifacts/14734035253) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970820752/artifacts/14733612596) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970820752/artifacts/14733224258) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ca549834c5d2cdee64ecc6b7a8feb75f1be0e51c)

</details>

<details>
<summary><strong>P5.1.156</strong> · Bản đồ thư viện kênh ngoại tuyến / Electron v4.23.240 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.240 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm bảng Library Pulse riêng trong thanh trên: đếm số kênh, số nguồn, số nhóm, trạng thái khả dụng đã được lưu, URL logo và mã EPG của dữ liệu hiện có. User action: Chọn Thư viện, xem các thẻ thống kê và thanh mức độ hoàn thiện metadata; nhấn Cập nhật để đọc lại dữ liệu hiện hành hoặc Escape để đóng.

![Ảnh chụp Electron thật P5.1.156](./screenshots/positron-p51156-library-pulse-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970204577) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970204577/artifacts/14733262839) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970204577/artifacts/14733282770) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44970204577/artifacts/14733347222) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e124df2c3230584f5642674051a4a6dda87f8837)

</details>

<details>
<summary><strong>P5.1.155</strong> · Dọn banner nổi, giữ nhật ký / Electron v4.23.239 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.239 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm thao tác Dọn banner để người dùng đóng nhanh toàn bộ banner đang che trình phát, không phải chạm từng toast và không làm mất dòng nhật ký đã ghi. User action: Mở Thông báo và bấm Dọn banner; các banner thành công/cảnh báo/lỗi đang nổi biến mất theo thao tác chủ động, nhưng nội dung và số mục trong Nhật ký giữ nguyên.

![Ảnh chụp Electron thật P5.1.155](./screenshots/positron-p51155-dismiss-toasts-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969691040) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969691040/artifacts/14733645059) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969691040/artifacts/14732184431) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969691040/artifacts/14733470692) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/98c9a6e5f9d77dc59f85a2a5515cb5e7e8a13647)

</details>

<details>
<summary><strong>P5.1.154</strong> · Chế độ Không làm phiền khi xem TV / Electron v4.23.238 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.238 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Bổ sung công tắc Ẩn xác nhận nổi để giảm banner che nội dung video, nhưng vẫn ghi toàn bộ sự kiện vào nhật ký phiên và luôn giữ banner cảnh báo/lỗi quan trọng. User action: Mở Thông báo, bấm Ẩn xác nhận nổi: Bật; các thông báo thành công mới không che màn hình nhưng vẫn xem được trong Nhật ký. Bấm lại để tắt chế độ.

![Ảnh chụp Electron thật P5.1.154](./screenshots/positron-p51154-quiet-mode-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969051299) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969051299/artifacts/14733037851) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969051299/artifacts/14732258624) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44969051299/artifacts/14732947207) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fad7c1af0b146ee85083a833d7a747a0859d42a0)

</details>

<details>
<summary><strong>P5.1.153</strong> · Tìm trong nhật ký thông báo bằng từ khóa không dấu / Electron v4.23.237 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.237 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép tìm kiếm nội dung thông báo ngay trong nhật ký 30 mục theo từ khóa tiếng Việt có hoặc không có dấu, kết hợp bộ lọc loại thông báo mà không xóa dữ liệu. User action: Mở Thông báo, nhập từ khóa trong ô Tìm trong thông báo; có thể gõ ket noi để tìm kết nối, hoặc nhấn Xóa tìm kiếm để khôi phục danh sách.

![Ảnh chụp Electron thật P5.1.153](./screenshots/positron-p51153-notice-search-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44968623994) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44968623994/artifacts/14732462346) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44968623994/artifacts/14733265152) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44968623994/artifacts/14733170404) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6af7f8fb5b7ca2d5d2251f368407fde298503d9d)

</details>

<details>
<summary><strong>P5.1.152</strong> · Lọc nhật ký theo loại thông báo / Electron v4.23.236 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.236 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép tìm nhanh cảnh báo, lỗi và xác nhận thành công trong nhật ký tối đa 30 mục bằng bộ lọc không phá hủy, phù hợp khi phải kiểm tra nhiều thông báo. User action: Mở Thông báo ở thanh trên, bấm Cảnh báo / Lỗi / Hoàn thành để chỉ xem loại tương ứng; chọn Tất cả để khôi phục toàn bộ danh sách.

![Ảnh chụp Electron thật P5.1.152](./screenshots/positron-p51152-alert-filter-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967801689) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967801689/artifacts/14732461231) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967801689/artifacts/14732537424) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967801689/artifacts/14732317472) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/fb8572b91feb1d0047db68a1eeed4cfdc15e71e0)

</details>

<details>
<summary><strong>P5.1.151</strong> · Nhật ký thông báo của phiên chạy / Electron v4.23.235 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.235 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nhật ký tối đa 30 thông báo thành công, cảnh báo và lỗi trong phiên để có thể xem lại sau khi thông báo nổi tự hết hạn mà không lưu dữ liệu riêng xuống đĩa. User action: Bấm Thông báo trên thanh trên để xem nội dung và thời điểm thông báo; chọn Xóa lịch sử hoặc Đóng/Escape. Lịch sử tự xóa khi thoát ứng dụng.

![Ảnh chụp Electron thật P5.1.151](./screenshots/positron-p51151-notification-archive-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967120986) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967120986/artifacts/14731908394) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967120986/artifacts/14732276443) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44967120986/artifacts/14731913520) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6cb00b963173e2632315916e9896a8fee070dfe7)

</details>

<details>
<summary><strong>P5.1.150</strong> · Trung tâm thông báo gọn, xem lại thông báo khi cần / Electron v4.23.234 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.234 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút "Xem thêm N thông báo" cho các xác nhận thành công còn hiệu lực, mặc định thu gọn chỉ hiện thông báo mới nhất. Bấm để mở lại rồi bấm thu gọn. Cảnh báo và lỗi không bị ẩn, người dùng vẫn có thể đóng từng thông báo, và bộ hẹn tự tắt 5,5 giây không thay đổi. Không ghi thông báo lên đĩa và không sửa playlist/player. User action: Khi thao tác nhiều, chỉ một thông báo thành công mới nhất và một nút Xem thêm xuất hiện; bấm Xem thêm để đọc lại những thông báo vẫn còn trên màn hình, bấm Thu gọn để giải phóng không gian.

![Ảnh chụp Electron thật P5.1.150](./screenshots/positron-p51150-toast-centre-after-1920x1080-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44965060471) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44965060471/artifacts/14731845362) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44965060471/artifacts/14731151814) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44965060471/artifacts/14731111937) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/73ecdec3a25b805e791c2e8d48b5fc286fe72ac0)

</details>

<details>
<summary><strong>P5.1.149</strong> · Chọn nhắc EPG trước 5/10/15/30 phút / Electron v4.23.233 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.233 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Chọn thông báo XMLTV trước 5, 10, 15 hoặc 30 phút; mỗi lịch giữ thời điểm riêng. Lịch cũ không có leadMinutes vẫn mặc định 10 phút; không đụng nguồn và không autoplay. User action: Trong Chọn kênh, bật lọc Sắp chiếu hoặc Đang chiếu (EPG), mở Bộ lọc, chọn Nhắc trước 5/10/15/30 phút rồi bấm chuông trên thẻ kênh. Bấm lại để hủy như P5.1.148.

![Ảnh chụp Electron thật P5.1.149](./screenshots/positron-p51149-reminder-lead-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44963703698) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44963703698/artifacts/14729919141) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44963703698/artifacts/14731195234) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44963703698/artifacts/14730523616) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e447a573a3acb2000cb4bd7d8ee6aefd2f511306)

</details>

<details>
<summary><strong>P5.1.148</strong> · Hủy hoặc bật lại lịch nhắc EPG ngay bằng chuông / Electron v4.23.232 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.232 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Nút chuông nhắc lịch ngay trên thẻ kênh nay thể hiện rõ đã lưu/chưa lưu, và cho phép bấm lần nữa để hủy đúng một chương trình đã nhắc; sử dụng lịch XMLTV đã nhập và dịch vụ nhắc nội bộ hiện có, không tự phát và không tác động lịch khác. User action: Mở Chọn kênh và bật bộ lọc EPG, tìm chương trình sắp chiếu rồi nhấn chuông để lưu; chuông đổi màu và trạng thái đã nhắc. Nhấn lại chuông để hủy, không phải tìm vào màn EPG và không cần tải nguồn ngoài.

![Ảnh chụp Electron thật P5.1.148](./screenshots/positron-p51148-cancel-reminder-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44960229561) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44960229561/artifacts/14728713994) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44960229561/artifacts/14728529758) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44960229561/artifacts/14729312575) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/681f1406615d9f0b6f4c7a6fc5c15a159ed62ac2)

</details>

<details>
<summary><strong>P5.1.147</strong> · Nhắc trước 10 phút ngay trên kênh có chương trình sắp chiếu / Electron v4.23.231 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.231 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm nút chuông độc lập trên thẻ kênh có lịch XMLTV sắp chiếu, cho phép đặt nhắc trước 10 phút bằng hệ thống nhắc lịch thật đã có; không cần mở trang EPG và tuyệt đối không tự phát video. User action: Trong Chọn kênh bật “Sắp chiếu” hoặc “Đang chiếu (EPG)”, tìm kênh có chương trình tiếp theo, nhấn nút chuông ở góc phải trên để lưu nhắc. Nhấn lần nữa nhận thông báo đã có nhắc, không tạo lịch trùng.

![Ảnh chụp Electron thật P5.1.147](./screenshots/positron-p51147-epg-reminder-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959830829) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959830829/artifacts/14728943491) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959830829/artifacts/14729123026) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959830829/artifacts/14729745471) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a4f216e89a23cda610be1cb4d168e21756b2a507)

</details>

<details>
<summary><strong>P5.1.146</strong> · Thanh tiến độ và phút còn lại theo lịch XMLTV / Electron v4.23.230 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.230 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Xem tiến độ ước tính của chương trình **theo lịch EPG**, gồm thanh phần trăm và số phút còn lại. Không mô tả là tiến độ phát video thực tế. User action: TV → Chọn kênh → Bộ lọc → “Có chương trình đang chiếu (EPG)”, xem “Theo lịch EPG: 50% · còn 15 phút” trên thẻ kênh. Không có dữ liệu EPG hợp lệ hoặc tắt bộ lọc thì ẩn tiến độ.

![Ảnh chụp Electron thật P5.1.146](./screenshots/positron-p51146-epg-progress-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959505918) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959505918/artifacts/14729041845) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959505918/artifacts/14728942357) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959505918/artifacts/14729465309) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2ba6192d240386d51d3728ec4ae0224c6b7c38fd)

</details>

<details>
<summary><strong>P5.1.145</strong> · Tùy chỉnh mốc lọc EPG sắp chiếu 15, 30, 60 phút / Electron v4.23.229 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.229 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép chọn khoảng thời gian 15, 30 hoặc 60 phút khi lọc chương trình sắp chiếu. Danh sách thay đổi tức thì theo giờ phát thật từ XMLTV đã nhập, không tự tải thêm lịch hay tác động playlist. User action: Mở TV → Chọn kênh → Bộ lọc → bật “Sắp chiếu” → chọn “Khoảng thời gian” 15, 30 hoặc 60 phút. Hệ thống cập nhật bộ lọc ngay, người dùng tắt chế độ để trở về danh sách đầy đủ.

![Ảnh chụp Electron thật P5.1.145](./screenshots/positron-p51145-time-window-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959256009) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959256009/artifacts/14728996572) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959256009/artifacts/14729415519) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44959256009/artifacts/14728543494) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/7ba96c19fce35a48940b21e0f0548983f9ab0b31)

</details>

<details>
<summary><strong>P5.1.144</strong> · Sắp xếp chương trình EPG sắp phát sớm nhất / Electron v4.23.228 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.228 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm tùy chọn sắp xếp kênh theo thời điểm bắt đầu chương trình tiếp theo từ lịch XMLTV thực tế đã nhập; kênh chưa có EPG vẫn giữ lại cuối danh sách và không mất nguồn. User action: Mở TV → Chọn kênh → Bộ lọc → Sắp xếp → “Chương trình sắp phát sớm nhất (EPG)”; các kênh có chương trình gần tới đứng đầu, trên thẻ hiện giờ và tên chương trình. Chọn “Tên A → Z” để trở về như cũ.

![Ảnh chụp Electron thật P5.1.144](./screenshots/positron-p51144-earliest-epg-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958901833) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958901833/artifacts/14728353480) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958901833/artifacts/14729205050) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958901833/artifacts/14729295264) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/3b5f9bac04dfae36c40bfa096fb7fae0f6eafbdd)

</details>

<details>
<summary><strong>P5.1.143</strong> · Lọc chương trình sắp chiếu trong 60 phút / Electron v4.23.227 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.227 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Lọc kênh có chương trình sẽ bắt đầu trong 60 phút tới từ EPG/XMLTV đã nhập, kể cả kênh chưa có chương trình đang phát. Hiện giờ phát và tên, tìm tên không dấu. Tách biệt và loại trừ bộ lọc “Đang chiếu”. User action: TV → Chọn kênh → Bộ lọc → “Sắp chiếu trong 60 phút (EPG)”; tìm “phim sap chieu”. Không tự mở nguồn phát, đặt lịch nhắc, tải XMLTV mới hay thay đổi playlist.

![Ảnh chụp Electron thật P5.1.143](./screenshots/positron-p51143-soon-filter-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958722454) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958722454/artifacts/14728643627) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958722454/artifacts/14729260002) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958722454/artifacts/14729020741) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/78388e1ae808cb7a85c7afa6ff0d05c34dc068fc)

</details>

<details>
<summary><strong>P5.1.142</strong> · Xem lịch chương trình tiếp theo ngay trên thẻ kênh / Electron v4.23.226 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.226 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Hiển thị tên và giờ bắt đầu chương trình sắp phát bên dưới chương trình hiện tại trên thẻ kênh, chỉ khi người dùng bật bộ lọc EPG và chỉ từ lịch XMLTV có thật đã nhập; không tự mở nguồn ngoài, tự phát video hay đặt nhắc lịch. User action: Mở TV → Chọn kênh → Bộ lọc → bật “Có chương trình đang chiếu (EPG)”; thẻ kênh sẽ hiện “Theo EPG: ...” và “Tiếp theo HH:MM: ...” khi lịch XMLTV có chương trình kế tiếp.

![Ảnh chụp Electron thật P5.1.142](./screenshots/positron-p51142-next-programme-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958026884) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958026884/artifacts/14728697042) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958026884/artifacts/14727554342) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44958026884/artifacts/14728845164) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/19d14c388372dba0e04c4f09302b1689f7203fce)

</details>

<details>
<summary><strong>P5.1.141</strong> · Tìm theo tên chương trình đang chiếu / Electron v4.23.225 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.225 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Cho phép tìm kênh bằng **tên chương trình đang chiếu** từ XMLTV hiện có ngay trong giao diện TV, không cần mở trang Lịch phát sóng; tìm tiếng Việt không dấu và nhiều từ linh hoạt. Chỉ bật tính năng khi người dùng chủ động lọc EPG. User action: Mở Chọn kênh → Bộ lọc → Có chương trình đang chiếu (EPG), nhập tên chương trình như “tin yeu thich” để tìm kênh đang có chương trình đó theo XMLTV; nhấn vào thẻ mới phát.

![Ảnh chụp Electron thật P5.1.141](./screenshots/positron-p51141-programme-title-search-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44957570434) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44957570434/artifacts/14728401829) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44957570434/artifacts/14728268277) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44957570434/artifacts/14728551548) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/07329cda329e476a2b3d029ed9215ff110d82504)

</details>

<details>
<summary><strong>P5.1.140</strong> · Lọc kênh đang có chương trình từ XMLTV / Electron v4.23.224 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.224 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm bộ lọc chỉ hiển thị các kênh có chương trình hiện tại trong lịch EPG/XMLTV đã nhập, kèm tên chương trình ngay trên thẻ; không dự đoán lịch phát và không kiểm tra hoặc tự mở luồng mạng. User action: Mở Chọn kênh → Bộ lọc → bật “Có chương trình đang chiếu (EPG)”; chọn kênh có tên chương trình theo lịch, hoặc tắt bộ lọc để xem toàn bộ.

![Ảnh chụp Electron thật P5.1.140](./screenshots/positron-p51140-epg-current-filter-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44957102347) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/62d067d5d73829c60e41bb14925068d2c0643190)

</details>

<details>
<summary><strong>P5.1.139</strong> · Ưu tiên kênh yêu thích lên đầu / Electron v4.23.223 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.223 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Thêm tùy chọn sắp xếp “Yêu thích lên đầu” trong danh sách kênh, đưa kênh đã đánh dấu sao lên trước nhưng giữ các kênh khác theo thứ tự tên; chỉ thay đổi cách hiển thị, không sửa playlist hay dữ liệu nguồn. User action: Mở Chọn kênh, mở Bộ lọc rồi chọn Sắp xếp → Yêu thích lên đầu; có thể trở lại Tên A → Z/Z → A ngay lập tức.

![Ảnh chụp Electron thật P5.1.139](./screenshots/positron-p51139-favorites-first-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44956736905) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/655e1d7bcd10dfc64cc9d6dbd206a44f499cb13d)

</details>

<details>
<summary><strong>P5.1.138</strong> · Chuyển trang kênh bằng PageDown/PageUp / Electron v4.23.222 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.222 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Duyệt xuyên qua các trang kênh dài chỉ bằng hai phím PageDown/PageUp, giữ tiêu điểm vào thẻ ở trang mới và không tự phát; hữu ích khi danh sách có hàng trăm kênh. User action: Mở Chọn kênh, dùng Enter chọn thẻ rồi nhấn PageDown để sang trang kế tiếp và chọn kênh đầu; PageUp trở về trang trước và chọn thẻ cuối, nhấn Enter trên thẻ mới phát.

![Ảnh chụp Electron thật P5.1.138](./screenshots/positron-p51138-page-navigation-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44956385940) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d7d5cca15b8dcd259ac1197bf1624477acda7025)

</details>

<details>
<summary><strong>P5.1.137</strong> · Duyệt thẻ kênh bằng phím mũi tên / Electron v4.23.221 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.221 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Điều hướng các kênh ngay trong Chọn kênh bằng bốn phím mũi tên và Home/End, bám đúng vị trí thẻ ở cả dạng lưới và danh sách; không cần Tab qua từng nút yêu thích và không tự phát video. User action: Mở Chọn kênh, nhập “QA Channel” rồi Enter để chọn thẻ đầu tiên; dùng ← → ↑ ↓ để di chuyển theo vị trí kênh, Home về đầu và End tới cuối; chỉ Enter trên thẻ mới phát.

![Ảnh chụp Electron thật P5.1.137](./screenshots/positron-p51137-arrow-navigation-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44955289084) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44955289084/artifacts/14726708701) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44955289084/artifacts/14727039682) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44955289084/artifacts/14726504495) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/6d8b23968e30a4264feca3cd58b44ace6d1720ee)

</details>

<details>
<summary><strong>P5.1.136</strong> · Enter chọn kết quả tìm kênh / Electron v4.23.220 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.220 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Chuyển tiêu điểm bàn phím tới thẻ kênh phù hợp đầu tiên sau khi tìm kiếm, tránh phải dùng chuột và không tự phát hoặc thay đổi dữ liệu người dùng. User action: Mở Chọn kênh ở TV, nhập tên kênh vào Tìm kiếm rồi nhấn Enter để chọn thẻ đầu tiên; nhấn Enter thêm lần nữa trên thẻ mới phát kênh nếu muốn.

![Ảnh chụp Electron thật P5.1.136](./screenshots/positron-p51136-search-enter-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954714575) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954714575/artifacts/14727317136) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954714575/artifacts/14727092959) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954714575/artifacts/14726284115) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a883e66d3a727ee4e007253869dd811269c9bec3)

</details>

<details>
<summary><strong>P5.1.135</strong> · Tìm kênh nhiều từ không đúng thứ tự / Electron v4.23.219 · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.219 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Feature priority: NEW — Tìm được kênh bằng nhiều từ khóa trong tên và nhóm dù đảo thứ tự, có khoảng trắng lặp hoặc gõ tiếng Việt không dấu; không truy cập URL, không tự phát video và không đổi dữ liệu. User action: Mở Chọn kênh, gõ "001 Channel QA" hoặc "qa 001" vào Tìm kiếm; kết quả "QA Channel 001" xuất hiện mà không cần gõ chính xác thứ tự.

![Ảnh chụp Electron thật P5.1.135](./screenshots/positron-p51135-reordered-search-before-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954014734) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954014734/artifacts/14727320761) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954014734/artifacts/14727236261) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44954014734/artifacts/14726927454) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f257bf79031549cc75d4eb5f3beb463786930daf)

</details>

<details>
<summary><strong>P5.1.134</strong> · Nhấn F để thêm/bỏ Yêu thích và dùng biểu tượng sao SVG · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.218 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi chọn một thẻ kênh, nhấn phím F để thêm kênh vào Yêu thích; nhấn lần nữa để bỏ lưu mà không phát video. Nút sao sử dụng SVG 20 px đồng nhất thay ký tự phụ thuộc phông chữ, giữ nguyên dữ liệu đã lưu, thao tác chuột và bàn phím.

![Ảnh chụp Electron thật P5.1.134](./screenshots/positron-p51134-favorite-native-svg-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44953311849) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44953311849/artifacts/14726279007) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44953311849/artifacts/14727180312) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44953311849/artifacts/14726686877) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/d973e0886eae15c9fed6f8bee1886639bbfaa46e)

</details>

<details>
<summary><strong>P5.1.133</strong> · Tên kênh dễ đọc hơn, nút Yêu thích tách riêng · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.217 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Ở cửa sổ 450 px, tên kênh dài bị cắt cạnh nút hình sao. Bản này dành hàng riêng cho nút Yêu thích, cho phép tên kênh xuống hai dòng mà vẫn giữ nguyên thao tác phát và dữ liệu đã lưu.

![Ảnh chụp Electron thật P5.1.133](./screenshots/positron-p51133-compact-card-title-star-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44952192829) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44952192829/artifacts/14726216947) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44952192829/artifacts/14725709387) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44952192829/artifacts/14725474222) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f83532e25748d481dfdf37a43799944b77d4a93b)

</details>

<details>
<summary><strong>P5.1.132</strong> · Xóa nhanh bộ lọc khi tìm không thấy kênh · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.216 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi tìm kiếm hoặc chọn nhóm mà không có kết quả, xuất hiện nút “Xóa bộ lọc và xem tất cả kênh”. Nhấn nút sẽ xóa truy vấn, khôi phục danh sách và đưa con trỏ về ô tìm kiếm; không tự phát kênh.

![Ảnh chụp Electron thật P5.1.132](./screenshots/positron-p51132-empty-search-clear-after-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44951265649) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44951265649/artifacts/14725866520) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44951265649/artifacts/14725378234) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44951265649/artifacts/14726185512) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/eab0be6a1e9e6873894becc3a472b117fb60cea2)

</details>

<details>
<summary><strong>P5.1.131</strong> · Tìm kênh tiếng Việt không dấu, kể cả chữ đ · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.215 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung quy đổi chữ “đ” thành “d” khi tìm kiếm. Ví dụ, gõ “dia phuong” có thể tìm nhóm “TH địa phương”. Tên và nhóm kênh gốc không bị thay đổi.

![Ảnh chụp Electron thật P5.1.131](./screenshots/positron-p51131-ascii-d-search-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950887023) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950887023/artifacts/14725279740) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950887023/artifacts/14725696997) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950887023/artifacts/14725313078) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c06e731ff1b8c84341ef24e7077500cd28b01203)

</details>

<details>
<summary><strong>P5.1.130</strong> · Ẩn phần viền thừa ở nút lọc nhóm kênh · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.214 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Mở rộng vùng che có điều kiện cho thanh nhóm kênh cuộn ngang, xử lý nét viền còn lộ cạnh “Tất cả”. Các nút nhóm bên cạnh vẫn bấm được và không ảnh hưởng phát kênh.

![Ảnh chụp Electron thật P5.1.130](./screenshots/positron-p51130-border-mask-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950230433) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950230433/artifacts/14724739938) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950230433/artifacts/14725820341) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44950230433/artifacts/14725058954) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/5fa615c4555fb3a6bfe570be29281e5edea98b14)

</details>

<details>
<summary><strong>P5.1.129</strong> · Sửa chữ nhóm kênh bị lộ cạnh nút “Tất cả” · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.213 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Theo ảnh Electron 450 px, một phần chữ của nhóm bị cuộn lọt ra cạnh nút “Tất cả”. Đồng bộ trạng thái cuộn và chỉ che phần chữ thừa khi thực sự cuộn ngang.

![Ảnh chụp Electron thật P5.1.129](./screenshots/positron-p51129-right-mask-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44949632131) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44949632131/artifacts/14724943298) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44949632131/artifacts/14724602734) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44949632131/artifacts/14724998271) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/c3754e3d196f4ef9354a93617f235cd89538166a)

</details>

<details>
<summary><strong>P5.1.128</strong> · Tự đưa nhóm đang chọn vào vùng nhìn thấy · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.212 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi đổi nhóm bằng bộ lọc nâng cao, thanh nhóm kênh tự cuộn để hiện nút nhóm đang được chọn. Chọn “Tất cả” sẽ đưa thanh về đầu.

![Ảnh chụp Electron thật P5.1.128](./screenshots/positron-p51128-dropdown-chip-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44948172418) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44948172418/artifacts/14724103348) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44948172418/artifacts/14724531052) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44948172418/artifacts/14724826026) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/7003357116d97ec3d98c76af54071fd4e81b717d)

</details>

<details>
<summary><strong>P5.1.127</strong> · Dùng phím mũi tên để duyệt nhóm kênh · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.211 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Cho phép chuyển tiêu điểm giữa các nhóm bằng phím mũi tên, Home và End trên màn hình hẹp. Chỉ thay đổi bộ lọc khi người dùng chọn nhóm.

![Ảnh chụp Electron thật P5.1.127](./screenshots/positron-p51127-category-keys-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44947131907) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44947131907/artifacts/14723772602) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44947131907/artifacts/14724395984) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44947131907/artifacts/14724118418) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/8bad7fc08d009c3529447d0389a176caabe30648)

</details>

<details>
<summary><strong>P5.1.126</strong> · Che tên nhóm kênh bị khuất sau nút “Tất cả” · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.210 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thêm vùng che phía dưới nút “Tất cả” được ghim khi thanh nhóm cuộn ngang, tránh hiển thị chữ chồng và tránh chọn nhầm nhóm bị che.

![Ảnh chụp Electron thật P5.1.126](./screenshots/positron-p51126-pinned-all-masked-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946531557) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946531557/artifacts/14724171872) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946531557/artifacts/14723504049) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946531557/artifacts/14723248369) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9aac59d3c7b66e5689a2d3f24e3da76d704e8483)

</details>

<details>
<summary><strong>P5.1.125</strong> · Ghim nút “Tất cả” khi cuộn nhóm kênh · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.209 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Giữ nút đặt lại “Tất cả” ở mép trái của thanh nhóm kênh trên cửa sổ hẹp. Các nhóm còn lại vẫn hỗ trợ cuộn, cảm ứng và bàn phím.

![Ảnh chụp Electron thật P5.1.125](./screenshots/positron-p51125-pinned-all-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946081256) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946081256/artifacts/14723621595) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946081256/artifacts/14723272729) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44946081256/artifacts/14723847093) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/b7cc07b69b8c3d503edb39f3284add1695a658ac)

</details>

<details>
<summary><strong>P5.1.124</strong> · Cuộn nhóm kênh ngang bằng bánh xe chuột · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.208 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Dùng bánh xe chuột để di chuyển thanh nhóm kênh theo chiều ngang khi còn nội dung cần cuộn. Khi tới mép, trả thao tác cuộn về trang như bình thường.

![Ảnh chụp Electron thật P5.1.124](./screenshots/positron-p51124-chip-wheel-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44945390298) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44945390298/artifacts/14723855687) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44945390298/artifacts/14723880794) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44945390298/artifacts/14723506867) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/808e2f8ef5260b4bd9b41dc2747ce3113256181d)

</details>

<details>
<summary><strong>P5.1.123</strong> · Thông báo trên màn hình nhỏ không che nội dung · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.207 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Đưa thông báo thành công vào dải gọn phía dưới và giữ nút đóng. Các thông báo cảnh báo/lỗi vẫn được ưu tiên hiển thị.

![Ảnh chụp Electron thật P5.1.123](./screenshots/positron-p51123-success-toast-footer-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941906824) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941906824/artifacts/14721389932) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941906824/artifacts/14722366445) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941906824/artifacts/14721713989) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/38011da89d7b384431bbf3babb9da4f581674340)

</details>

<details>
<summary><strong>P5.1.122</strong> · Đóng thông báo và khôi phục vị trí bàn phím · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.206 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi đóng thông báo, tiêu điểm quay lại điều khiển trước đó thay vì bị mất. Giữ nguyên thời gian tự tắt, mức cảnh báo và các chức năng khác.

![Ảnh chụp Electron thật P5.1.122](./screenshots/positron-p51122-toast-focus-return-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941209570) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941209570/artifacts/14721941989) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941209570/artifacts/14721553223) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44941209570/artifacts/14722035989) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9b5676910c4e9c88250b68f49bfe47e8abcad956)

</details>

<details>
<summary><strong>P5.1.121</strong> · Thêm nút đóng thông báo bằng chuột hoặc bàn phím · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.205 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung nút đóng có thể dùng bằng cảm ứng và bàn phím cho thông báo trong Positron. Không thay đổi nội dung và thời gian tự tắt của thông báo.

![Ảnh chụp Electron thật P5.1.121](./screenshots/positron-p51121-toast-dismiss-visible-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44938106552) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44938106552/artifacts/14720871449) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44938106552/artifacts/14720427791) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44938106552/artifacts/14720158601) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/daefa5bb1e8119c8d16ddbf22d7b04003881f5b7)

</details>

<details>
<summary><strong>P5.1.120</strong> · Rút gọn các thông báo thành công trên màn hình hẹp · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.204 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Chỉ hiện thông báo thành công mới nhất ở cửa sổ hẹp để không che danh sách kênh; cảnh báo, lỗi và bộ hẹn giờ vẫn hoạt động.

![Ảnh chụp Electron thật P5.1.120](./screenshots/positron-p51120-compact-toast-stack-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44937368201) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44937368201/artifacts/14720775358) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44937368201/artifacts/14720641084) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44937368201/artifacts/14720745668) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/2eec95e697ef50b9e2f2c1b420652515005423bc)

</details>

<details>
<summary><strong>P5.1.119</strong> · Hiển thị số kênh Yêu thích trực tiếp trên tab · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.203 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thêm huy hiệu đếm số kênh đã lưu ở tab Yêu thích. Số được cập nhật khi thêm/bỏ sao và ẩn khi bằng không; có nhãn hỗ trợ truy cập.

![Ảnh chụp Electron thật P5.1.119](./screenshots/positron-p51119-favorite-count-badge-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44936414753) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44936414753/artifacts/14719833247) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44936414753/artifacts/14719238570) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44936414753/artifacts/14720120175) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/f3bd1bf867f939335eb2d96e555be9dd7408e81e)

</details>

<details>
<summary><strong>P5.1.118</strong> · Đánh dấu Yêu thích ngay trên thẻ kênh · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.202 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thêm nút hình sao riêng trên từng thẻ kênh. Người dùng có thể lưu hoặc bỏ Yêu thích mà không cần phát kênh trước.

![Ảnh chụp Electron thật P5.1.118](./screenshots/positron-p51118-direct-favorite-channel-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44935525440) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44935525440/artifacts/14719119090) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44935525440/artifacts/14719442997) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44935525440/artifacts/14719970323) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/9751d3c02c2a293c63301f066b16b079a2d884ff)

</details>

<details>
<summary><strong>P5.1.117</strong> · Một kênh lọc được hiển thị rộng và dễ đọc · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.201 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi chỉ còn một kênh trong kết quả lọc trên màn hình hẹp, thẻ kênh tự chiếm toàn bộ hàng thay vì bó hẹp trong nửa cột.

![Ảnh chụp Electron thật P5.1.117](./screenshots/positron-p51117-single-result-wide-card-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934939463) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934939463/artifacts/14719042172) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934939463/artifacts/14718877901) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934939463/artifacts/14719711350) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/15a29463a11da0679caa367515362c74bfec8029)

</details>

<details>
<summary><strong>P5.1.116</strong> · Chỉ hiển thị nhóm kênh thật trong danh sách · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.200 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thanh lọc nhanh lấy nhóm có trong nguồn M3U đã nhập, không hiện nhóm rỗng. Trạng thái nút được chọn và khả năng dùng bàn phím được cải thiện.

![Ảnh chụp Electron thật P5.1.116](./screenshots/positron-p51116-real-category-filter-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934384750) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934384750/artifacts/14719545663) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934384750/artifacts/14718872342) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44934384750/artifacts/14719650492) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/68bf5505bc72a73853284574dc3106bfad7e9973)

</details>

<details>
<summary><strong>P5.1.115</strong> · Bỏ hướng dẫn trùng ở Yêu thích và Gần đây · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.199 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Trên màn hình hẹp, ẩn bảng phụ rỗng bị lặp với thông báo chính của tab đang mở. Các bảng hữu ích khác vẫn được giữ lại.

![Ảnh chụp Electron thật P5.1.115](./screenshots/positron-p51115-no-duplicate-favorite-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933799628) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933799628/artifacts/14718786692) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933799628/artifacts/14719076348) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933799628/artifacts/14717989758) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/caf6a5bff4a115cac60f8474519e5d6101dfdd87)

</details>

<details>
<summary><strong>P5.1.114</strong> · Hướng dẫn rõ ràng khi Yêu thích hoặc Gần đây trống · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.198 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Phân biệt chưa có Yêu thích, chưa có lịch sử và lọc không ra kết quả. Thêm nút “Xem tất cả kênh” để quay lại thư viện.

![Ảnh chụp Electron thật P5.1.114](./screenshots/positron-p51114-favorite-empty-action-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933308025) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933308025/artifacts/14718109857) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933308025/artifacts/14718682462) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44933308025/artifacts/14717864699) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/257422b56d81d4eca9c8efacfb1aeb4ebd2dab83)

</details>

<details>
<summary><strong>P5.1.113</strong> · Điều hướng các tab thư viện kênh bằng bàn phím · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.197 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Hỗ trợ phím mũi tên, Home và End để chuyển tab; giữ trạng thái được chọn, tiêu điểm và các thao tác chuột vốn có.

![Ảnh chụp Electron thật P5.1.113](./screenshots/positron-p51113-keyboard-favorites-tab-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932830440) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932830440/artifacts/14718357701) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932830440/artifacts/14718591940) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932830440/artifacts/14718721333) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/e634e2c7c9da33ebb5c54043e4d212ab8d3a40a3)

</details>

<details>
<summary><strong>P5.1.112</strong> · Thẻ kênh hai cột dễ đọc hơn trên màn hình hẹp · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.196 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay lưới thẻ quá nhỏ bằng hai cột và cho phép tên kênh hiển thị nhiều dòng, tránh cắt mất tên.

![Ảnh chụp Electron thật P5.1.112](./screenshots/positron-p51112-readable-channel-cards-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932267277) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932267277/artifacts/14717957665) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932267277/artifacts/14717758792) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44932267277/artifacts/14718456595) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/50a2f2e24710e1727b7fe6a31273cc2808bc30d0)

</details>

<details>
<summary><strong>P5.1.111</strong> · Bộ lọc nhóm kênh gọn trong một hàng cuộn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.195 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Hiển thị nhóm trong một hàng cuộn ngang thay vì xuống nhiều dòng. Giữ vị trí thanh cuộn sau khi chọn nhóm.

![Ảnh chụp Electron thật P5.1.111](./screenshots/positron-p51111-single-row-chips-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44931301124) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44931301124/artifacts/14718022003) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44931301124/artifacts/14718265288) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44931301124/artifacts/14718161027) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ba5a3f4b282ad68a4d5c270fe523935dbf35b00e)

</details>

<details>
<summary><strong>P5.1.110</strong> · Thu gọn màn hình phát khi chưa chọn kênh · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.194 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Ở cửa sổ hẹp và chưa phát gì, thu gọn vùng giới thiệu để đưa phần tìm kênh lên cao hơn. Khung video thực vẫn giữ tỷ lệ.

![Ảnh chụp Electron thật P5.1.110](./screenshots/positron-p51110-compact-idle-player-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44929904122) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44929904122/artifacts/14717042762) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44929904122/artifacts/14717361613) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44929904122/artifacts/14717786119) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/75d4acb5bf940eb46ecb868476aca6bda33e99f4)

</details>

<details>
<summary><strong>P5.1.109</strong> · Không lặp thông báo đang hiển thị · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.193 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Nếu một thông báo cùng nội dung và mức độ vẫn đang mở, không tạo bản trùng. Thông báo khác hoặc mức cảnh báo khác vẫn xuất hiện.

![Ảnh chụp Electron thật P5.1.109](./screenshots/positron-p51109-native-toast-dedupe-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928941637) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928941637/artifacts/14715769950) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928941637/artifacts/14716674673) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928941637/artifacts/14716674755) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/1b2c5d4d55f3d60a9ff64f45529aa181d3a9454e)

</details>

<details>
<summary><strong>P5.1.108</strong> · Thông báo không đè lên thanh biểu tượng · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.192 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Giới hạn vị trí thông báo trong cửa sổ hẹp để không che thanh điều hướng có biểu tượng bên trái.

![Ảnh chụp Electron thật P5.1.108](./screenshots/positron-p51108-toast-clear-of-sidebar-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928243485) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928243485/artifacts/14717000133) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928243485/artifacts/14716723244) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44928243485/artifacts/14716427747) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/a19d24c9858fba65cabc17c0ef478a861e44b0f1)

</details>

<details>
<summary><strong>P5.1.107</strong> · Thay biểu tượng chữ bằng SVG thống nhất · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.191 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Các nút tab thư viện kênh và chế độ xem dùng biểu tượng SVG thay cho ký tự phụ thuộc phông chữ. Thao tác và nhãn hỗ trợ truy cập được giữ nguyên.

![Ảnh chụp Electron thật P5.1.107](./screenshots/positron-p51107-chooser-native-svg-450-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44925408257) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44925408257/artifacts/14715611666) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44925408257/artifacts/14715134699) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44925408257/artifacts/14714774243) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/ac4670a51959aef9a9e6917c85495184c460bf1a)

</details>

<details>
<summary><strong>P5.1.106</strong> · Bỏ thanh cuộn ngang thừa trong WatchFlow trống · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.190 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sửa khoảng cách ở hộp WatchFlow khi chưa có nguồn để không xuất hiện thanh cuộn ngang không cần thiết.

![Ảnh chụp Electron thật P5.1.106](./screenshots/positron-p51106-empty-watchflow-no-horizontal-scroll-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44924483487) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44924483487/artifacts/14714244518) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44924483487/artifacts/14714509072) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44924483487/artifacts/14715073154) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/19746909a874bdcc659f6948319cee86f0eec1da)

</details>

<details>
<summary><strong>P5.1.105</strong> · Dọn dấu trang mất nguồn bằng hai bước xác nhận · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung thao tác xử lý dấu trang Xem sau không còn nguồn hợp lệ, có bước xác nhận rõ ràng để tránh xóa nhầm.

![Ảnh chụp Electron thật P5.1.105](./screenshots/positron-p51105-dormant-manage-after-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921869316) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921869316/artifacts/14714251005) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921869316/artifacts/14714022840) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921869316/artifacts/14713917924) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/937db5120885efefe32c62fe3a9476601e76955c)

</details>

<details>
<summary><strong>P5.1.104</strong> · Thông báo nguồn Xem sau không còn hoạt động · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Phát hiện dấu trang đã lưu nhưng nguồn không còn sẵn có; thông báo rõ tình trạng mà không tự xóa dữ liệu đã lưu.

![Ảnh chụp Electron thật P5.1.104](./screenshots/positron-p51104-watchlater-unavailable-552-real.png)

[CI tổng hợp](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921297970) · [Tải Mac Apple Silicon (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921297970/artifacts/14714021401) · [Tải Mac Intel (ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921297970/artifacts/14712794961) · [Tải Windows x64 (Setup + Portable ZIP)](https://github.com/trisanghy/open-iptv-pro/actions/runs/44921297970/artifacts/14713946942) · [Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md) · [Xem thay đổi Git](https://github.com/trisanghy/open-iptv-pro/commit/0e6a64d5d4dbcda6e4131a3375b414e63cb54a52)

</details>

<details>
<summary><strong>P5.1.103</strong> · Không tự loại dấu trang Xem sau khi đủ 80 mục · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi đạt giới hạn 80 kênh lưu Xem sau, ngăn việc âm thầm loại kênh cũ. Người dùng được thông báo để tự quyết định.

![Ảnh chụp Electron thật P5.1.103](./screenshots/positron-p51103-watchlater-cap-after-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.102</strong> · Tìm Xem sau theo nhiều từ, nhóm và chất lượng · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Cải thiện tìm kiếm dấu trang đã lưu bằng nhiều từ khóa và thông tin nhóm/chất lượng, thay vì chỉ khớp chuỗi liền nhau.

![Ảnh chụp Electron thật P5.1.102](./screenshots/positron-p51102-watch-later-multiterm-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.101</strong> · Tìm kiếm trong toàn bộ danh sách Xem sau · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.185 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thêm ô tìm kiếm cục bộ cho tối đa 80 kênh đã lưu Xem sau, hỗ trợ không dấu, không gửi dữ liệu lên mạng và không tự phát video.

![Ảnh chụp Electron thật P5.1.101](./screenshots/positron-p51101-watch-later-search-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.100</strong> · Giữ thanh tiêu đề WatchFlow khi cuộn danh sách dài · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.184 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Cố định tiêu đề và các tab WatchFlow khi cuộn sâu trong danh sách Xem sau, giúp nút đóng và điều hướng luôn dễ tìm.

![Ảnh chụp Electron thật P5.1.100](./screenshots/positron-p51100-watch-later-sticky-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.99</strong> · Xem chương trình sắp phát từ lịch XMLTV · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.183 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bên cạnh chương trình đang phát, WatchFlow hiển thị chương trình tiếp theo và giờ bắt đầu khi có dữ liệu XMLTV hợp lệ. Không tự suy đoán tên chương trình.

![Ảnh chụp Electron thật P5.1.99](./screenshots/positron-p5199-next-epg-watchflow-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.98</strong> · Hiển thị tên chương trình đang phát trong WatchFlow · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.182 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Kết hợp dữ liệu lịch XMLTV đã nhập để thẻ gợi ý WatchFlow hiện chương trình đang phát, thay vì chỉ tên kênh.

![Ảnh chụp Electron thật P5.1.98](./screenshots/positron-p5198-live-epg-watchflow-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.97</strong> · Xem được mọi kênh đã lưu trong Xem sau · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.181 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung cách duyệt các dấu trang vượt quá tám kênh đầu tiên, giúp truy cập đủ danh sách đã lưu.

![Ảnh chụp Electron thật P5.1.97](./screenshots/positron-p5197-watch-later-many-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.96</strong> · Lưu kênh Xem sau riêng tư trên thiết bị · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.180 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung danh sách Xem sau cục bộ để người dùng lưu kênh muốn quay lại. Không tải dữ liệu lên máy chủ và không tự phát.

![Ảnh chụp Electron thật P5.1.96](./screenshots/positron-p5196-watch-later-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.95</strong> · Sửa dấu hiệu cuộn WatchFlow bị che · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.179 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Điều chỉnh vị trí chỉ báo cuộn dựa trên ảnh kiểm thử thực, tránh lớp chỉ dẫn nằm đè lên nội dung thẻ.

![Ảnh chụp Electron thật P5.1.95](./screenshots/positron-p5195-watchflow-inline-scroll-cue-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.94</strong> · Báo hiệu còn gợi ý WatchFlow phía dưới · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.178 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thêm dấu hiệu trực quan khi danh sách gợi ý WatchFlow còn nội dung bên dưới, giúp người dùng biết có thể cuộn xem thêm.

![Ảnh chụp Electron thật P5.1.94](./screenshots/positron-p5194-watchflow-scroll-cue-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.93</strong> · Phân bổ gợi ý Mix cân bằng giữa các nhóm nguồn · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.177 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Điều chỉnh cách chọn gợi ý Mix theo ngày để không tập trung quá nhiều kênh trong một nhóm, đồng thời vẫn dựa trên dữ liệu phát thực tế.

![Ảnh chụp Electron thật P5.1.93](./screenshots/positron-p5193-group-balanced-mix-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.92</strong> · Tính đúng ngày địa phương cho Mix và Smart Zap · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.176 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Dùng ngày theo múi giờ của thiết bị khi tạo gợi ý Mix hằng ngày và chuyển kênh thông minh, tránh lệch ngày.

![Ảnh chụp Electron thật P5.1.92](./screenshots/positron-p5192-local-calendar-mix-552-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.91</strong> · Đồng bộ biểu tượng Phát/Tạm dừng theo bản Web · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.175 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sử dụng hình SVG Phát và Tạm dừng tương ứng với bộ biểu tượng trên nhánh Web, giữ kích thước và đường nét đồng nhất.

![Ảnh chụp Electron thật P5.1.91](./screenshots/positron-p5191-web-play-svg-552-metadata-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.90</strong> · Ẩn thử nghiệm Video Lab khi chưa chọn kênh · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.174 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Không hiện công cụ Video Lab khi người dùng chưa chọn kênh, tránh nút dẫn vào tính năng chưa có nội dung. Cài đặt không bị xóa.

![Ảnh chụp Electron thật P5.1.90](./screenshots/positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.89</strong> · Trạng thái trình phát phản ánh số kênh có sẵn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.173 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay lời hướng dẫn mặc định dựa trên việc danh sách có kênh khả dụng hay không, giúp người dùng biết bước tiếp theo.

![Ảnh chụp Electron thật P5.1.89](./screenshots/positron-p5189-player-ready-subtitle-552-metadata-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.88</strong> · Hướng dẫn bắt đầu xem dựa trên playlist thực · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.172 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi đã có danh sách kênh, hiển thị lời mời chọn kênh và số kênh thực tế. Khi chưa có nguồn, giữ hướng dẫn nhập danh sách.

![Ảnh chụp Electron thật P5.1.88](./screenshots/positron-p5188-player-ready-552-metadata-real.png)

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.87</strong> · Tab Tiếp tục xem gọn và dễ đọc · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.171 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Rút gọn nhãn hiển thị thành “Tiếp” khi cần, trong khi nhãn đầy đủ “Tiếp tục xem” vẫn được giữ cho hỗ trợ truy cập.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.86</strong> · Hộp WatchFlow không che trình phát · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.170 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Giới hạn bố cục hộp gợi ý WatchFlow để không đè lên vùng video và các điều khiển quan trọng.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.85</strong> · Xếp hạng kênh tương tự tốt hơn trong WatchFlow · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.169 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Điều chỉnh thứ tự gợi ý Tương tự để ưu tiên nhóm kênh phù hợp trước khi xét điểm chất lượng phát.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.84</strong> · Thêm thao tác hữu ích khi danh sách kênh trống · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Hiển thị hướng dẫn và thao tác nhập nguồn ngay ở thanh danh sách kênh khi chưa có kênh để xem.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.83</strong> · Điều khiển phụ của trình phát gọn hơn trên 600 px · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sắp xếp lại các lựa chọn phụ của trình phát trên cửa sổ hẹp để tránh chiếm quá nhiều chiều cao.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.82</strong> · Bộ chọn kênh một hàng trên màn hình nhỏ · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Các tab lọc của thư viện kênh được bố trí lại trên một hàng khi cửa sổ hẹp, hạn chế xuống dòng không cần thiết.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.81</strong> · Thanh công cụ WatchFlow Plus nằm trên một hàng · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sắp xếp các chế độ WatchFlow Plus thành một hàng dễ sử dụng, tránh chiếm vùng hiển thị của video và danh sách.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.80</strong> · WatchFlow Plus: nhiều cách khám phá kênh · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.164 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thử nghiệm các chế độ gợi ý và chuyển kênh nhanh, gồm Smart Zap và Mix, dựa trên thông tin nguồn và hành vi xem cục bộ; chỉ phát khi người dùng thao tác.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.79</strong> · Tên công cụ trình phát rõ nghĩa hơn · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay nút dấu ba chấm khó hiểu bằng nhãn mở công cụ rõ hơn, giúp tìm Tua lại và ghi hình.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.78</strong> · Màn hình chẩn đoán khi chưa có nguồn gọn hơn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Ẩn các chỉ số bằng không chưa hữu ích ở trạng thái chưa nhập nguồn, tập trung vào hướng dẫn bắt đầu.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.77</strong> · Kiểm tra lại nút nhập nguồn trong Chẩn đoán · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung kiểm thử ảnh để xác minh nút nhập nguồn thật của trang Chẩn đoán khi chưa có kênh.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.76</strong> · Chẩn đoán thông minh cho trạng thái chưa có nguồn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Tập trung trang Chẩn đoán vào thao tác thêm nguồn trước khi hiển thị các bảng kiểm tra nâng cao chưa sử dụng được.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.75</strong> · Thông báo rõ giới hạn Video Lab thử nghiệm · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Nêu rõ chức năng nâng cao hình ảnh bằng AI hiện chưa có hệ thống xử lý video trực tiếp đã xác minh, tránh gây hiểu nhầm.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.74</strong> · Tận dụng chiều cao màn hình máy tính hợp lý · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thu gọn vùng phát trống trên cửa sổ máy tính thấp để các điều khiển hữu ích không bị đẩy xuống dưới.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.73</strong> · Đường dẫn lưu bản ghi DVR rõ ràng và an toàn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Cải thiện nhãn và cách trình bày đường dẫn lưu bản ghi, tránh chuỗi đường dẫn dài làm vỡ bố cục.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.72</strong> · Sắp xếp bộ lọc Smart Discovery dễ dùng hơn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Đưa các điều khiển khám phá nguồn về thứ tự thao tác tự nhiên, tránh các nút và lựa chọn nằm rời rạc.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.71</strong> · Chỉ mở WatchFlow đúng ngữ cảnh màn hình TV · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Ẩn thao tác WatchFlow khi đang quản lý nguồn và đóng bảng khi chuyển khỏi trang TV, giữ nguyên kênh và nguồn.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.70</strong> · Đánh dấu rõ mục đang chọn trong quản lý nguồn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.154 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Tăng tương phản mục điều hướng đang chọn và gắn nhãn vị trí hiện tại cho công cụ hỗ trợ truy cập.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.69</strong> · Sửa hàng điều hướng nguồn bị tách lẻ · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.153 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Điều chỉnh bố cục điều hướng quản lý nguồn ở cửa sổ khoảng 720 px để không còn một nút bị rớt xuống hàng riêng.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.68</strong> · Thay biểu tượng menu bằng SVG bốn ô · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.152 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Đưa biểu tượng SVG bốn ô vào nút mở menu sẵn có, giữ nguyên nhãn, trạng thái mở và thao tác.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.67</strong> · Tự đóng WatchFlow khi rời trang TV · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.151 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Theo dõi trang TV đang được mở và đóng bảng WatchFlow khi người dùng chuyển trang, không làm thay đổi dữ liệu hoặc kênh đang phát.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.66</strong> · Nút đóng WatchFlow rõ và dễ bấm hơn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.150 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay ký tự biểu tượng bằng SVG 20 px và mở rộng vùng chạm của nút đóng, giữ hỗ trợ phím Escape.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.65</strong> · Khôi phục tiêu điểm sau khi đóng WatchFlow · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.149 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sau khi đóng WatchFlow, đưa tiêu điểm về nút phù hợp ở trang TV để người dùng tiếp tục thao tác bằng bàn phím.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.64</strong> · Ẩn đoạn giới thiệu WatchFlow thừa khi chưa có kênh · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.148 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bỏ đoạn hướng dẫn lặp ở trạng thái trống, vẫn giữ nguyên bố cục và các gợi ý khi có kênh.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.63</strong> · Hướng dẫn nhập nguồn rõ ràng trong WatchFlow trống · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.147 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Khi chưa có nguồn kênh, hiện cách thêm IPTV thay vì các bộ lọc thể loại không thể dùng.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.62</strong> · Đồng bộ màu thanh phụ đề CC trong giao diện Horizon · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.146 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Chỉnh màu các điều khiển phụ đề và AI theo bảng màu Horizon; không thay đổi hành vi công cụ.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.61</strong> · Tăng độ tương phản thư mục có dữ liệu trong Horizon · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.145 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Chỉnh nền, chữ và mũi tên của thư mục có kênh để dễ đọc trên giao diện tối, không ảnh hưởng kéo thả.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.60</strong> · Gợi ý WatchFlow cân bằng theo nhóm kênh · CHƯA CÓ BẢN PHÁT HÀNH · TÍNH NĂNG</summary>

**Ứng dụng:** 4.23.144 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Phân bổ gợi ý WatchFlow từ các nhóm nguồn khác nhau thay vì chọn liên tiếp quá nhiều kênh trong một nhóm.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.59</strong> · Đồng bộ màu thanh cuộn của Horizon · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.143 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Chỉnh màu thanh cuộn theo giao diện Horizon mà không thay đổi hành vi cuộn hoặc các chủ đề khác.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.58</strong> · Sửa tiêu đề bị chật trên giao diện Horizon hẹp · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.142 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sửa cách hiển thị tiêu đề ở cửa sổ khoảng 600 px theo ảnh Electron thực tế để không bị cắt, chồng chữ.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.57</strong> · Hoàn thiện Horizon và WatchFlow có dữ liệu thử nghiệm · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.141 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Kiểm tra WatchFlow với dữ liệu kênh giả lập và sửa tiêu đề thiếu tương phản trên nền tối.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.56</strong> · Thiết kế lại Horizon và gợi ý WatchFlow cục bộ · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.140 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Bổ sung lớp bố cục Horizon và các gợi ý WatchFlow dựa trên dữ liệu có sẵn cục bộ, kèm ảnh kiểm thử Electron.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.51</strong> · Sửa màn hình DVR trống theo ảnh kiểm thử · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** Chưa xác minh · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Điều chỉnh trang ghi hình khi chưa có kênh, tránh hiển thị lịch hẹn không thể sử dụng.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.25</strong> · Sửa nút xóa kênh khi chưa có kênh nào · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.109 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Đặt điều khiển ở trạng thái vô hiệu hóa rõ ràng khi chưa có kênh; tự kích hoạt lại khi có dữ liệu.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.24</strong> · Biểu tượng ghi hình DVR rõ hơn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.108 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay biểu tượng ghi hình bằng SVG đồng nhất mà không ảnh hưởng lịch hẹn và dữ liệu.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.23</strong> · Thu gọn hướng dẫn Nguồn ở cửa sổ hẹp · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.107 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Giảm khoảng đệm của hướng dẫn nhập nguồn và khám phá nguồn khi chưa có danh sách.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.22</strong> · Nút điều khiển hình ảnh SVG rõ ràng hơn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.106 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay ký tự biểu tượng bằng SVG đơn sắc, giữ trạng thái bật/tắt và tên điều khiển.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.21</strong> · Sửa bố cục lựa chọn luồng phát trên cửa sổ nhỏ · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.105 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Đưa bộ chọn đường phát thành một hàng đủ rộng trong cửa sổ rất hẹp.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.7</strong> · Sửa nền tối còn sót trong Khám phá nguồn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.91 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Theo ảnh Electron, vùng nền Khám phá nguồn đã cải thiện nhưng còn dải tối ở phần tiêu đề; tiếp tục sửa lớp giao diện này.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.3</strong> · Nút Toàn màn hình rõ hơn · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.87 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay biểu tượng toàn màn hình khó nhận biết bằng hình vector dễ hiểu.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.2</strong> · Đặt lại vị trí huy hiệu phiên bản · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.86 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Sửa huy hiệu phiên bản bị che một phần bởi nút menu trên màn hình hẹp.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

<details>
<summary><strong>P5.1.1</strong> · Hiển thị đúng phiên bản Positron P5.1.1 · CHƯA CÓ BẢN PHÁT HÀNH · CẢI TIẾN / SỬA LỖI</summary>

**Ứng dụng:** 4.23.85 · **Trạng thái:** CHƯA CÓ BẢN PHÁT HÀNH

Thay nhãn phiên bản cũ còn sót ở thanh bên bằng nhãn Positron phù hợp.

*Chưa có ảnh chụp riêng đã xác minh cho phiên bản này.*

[Bản phát hành / thông tin](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

</details>

---

Ảnh lấy từ QA Electron thật của Actions hoặc Release lịch sử; bộ cài thử nghiệm là artifact ZIP. Mỗi lần nhánh Positron được cập nhật, GitHub Actions tạo lại trang Markdown và đồng bộ ảnh mà không force-push hay sửa nhánh web/online.

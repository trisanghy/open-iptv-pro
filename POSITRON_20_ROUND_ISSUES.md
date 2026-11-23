# Positron — 20 vòng mới từ P5.1.323

Baseline 24/11/2026: HEAD 557361b9ab74340ca0f2999f1e0912c2c43803db, P5.1.323 / 4.23.408; CI 45223486028 đạt test/capture/build Win/Mac; release skipped theo chính sách stable-only.
Đã tải artifact 14841828720 và mở ảnh Electron trước/sau P323 1920x1080, 720x900; Sources và EPG.

## Vòng 01 — P5.1.324 (CANDIDATE)
- Lỗi từ ảnh: năm nút chuyển chế độ WatchFlow tại 720px chỉ cao khoảng 35px, không đồng đều với nút AI 44px.
- Root cause: renderer/positron-watchflow-next.css đặt min-height 35px; P5.1.81 giữ năm cột nhưng không sửa hitbox.
- Mã: tăng năm nút lên 44px; giữ một hàng, kiểm tra keyboard focus và tránh tràn.
- Test: tests/positron-324.test.cjs và scripts/positron-324-audit.cjs, chạy trong Electron CDP thực.
- Ảnh trước 1920 do áp dụng tạm CSS cũ 35px lên Electron mới, không phải binary cũ; ảnh sau 1920 và 720 là CSS mới.
- CHƯA TÍNH HOÀN THÀNH cho tới khi CI xanh và đã mở ảnh sau.
- Vòng 02 ưu tiên: xem lỗi EPG notification che khu vực lọc ở 720px, bảo toàn thông báo qua Notification Archive.

## CI repair P324
- Actions 45230032964: 1033 pass / 7 fail / 5 skip; lỗi version trong HTML, sidebar, Windows scripts và bài test metadata screenshot không tìm thấy vị trí khai báo P324 trong P5 QA script.
- Repair: đồng bộ 4.23.409, Positron P5.1.324; gọi helper QA P324 trong vòng CDP P5 chính, thêm filename vào báo cáo, giữ các assertion nguyên vẹn. Chưa tính vòng đạt trước CI mới.

## Vòng 01 P5.1.324 — ĐÃ ĐẠT
- Final code commit cb28492137a419d7f464e80dd7aa546d8b0027c1 (sau repair 7 lỗi version CI).
- Actions 45230817039: Node 1.040 pass, 5 skipped, 0 fail; capture success; Windows Setup/Portable x64, mac ARM/x64 success; Release skipped do Stable-only.
- Real screenshot artifact 14847601479: before/after 1920 và after 720, đã tải và MỞ trực tiếp. QA 11/11: 35→44px, một hàng, không tràn, keyboardFocus, playlist/model giữ nguyên, noAutoplay.
- Kết luận: đạt đầy đủ vòng 01, có ảnh trước/sau và soát trực tiếp.

## Vòng 02 P5.1.325 — CANDIDATE
- Phát hiện từ ảnh thật P324: thanh năm chế độ WatchFlow có kích thước 44px nhưng chưa có điều hướng mũi tên/remote; phải tab qua hoặc bấm bằng chuột.
- Nguyên nhân: renderer/positron-watchflow-next.js chỉ gắn click, không có listener keydown trên thanh năm chế độ.
- Sửa có ích: ArrowLeft, ArrowRight, Home, End chỉ dịch focus qua năm nút; không click, không kích hoạt Zap, không làm thay đổi kênh/playlist/mô hình khi chỉ bấm mũi tên.
- Kịch bản Electron P325: focus trước/sau 1920 và focus 720; soát ảnh, geometry, không tràn, noAutoplay, mô hình không thay đổi.
- **Không coi vòng 02 đã đạt trước CI và ảnh thật đã được mở.**

## Vòng 02 P5.1.325 — ĐÃ ĐẠT
- Final CI code SHA 4e5008e885b7495ca205411ad0ed02cee7a6d6bc, thêm CI repair 42d8122... khi QA thiếu tham số page.
- Actions 45234509867: 1.041 Node pass, 5 skipped, 0 fail; capture success; Win/mac arm/mac Intel build success; Release skipped do Stable-only.
- Real screenshots 14849585829 tải và đã MỞ trước/sau 1920, sau 720; 17/17 QA đạt; focus Gợi ý → Tiếp có viền rõ, vòng Home/End không kích hoạt phát.
- Vòng 02 được chứng minh đầy đủ.

## Vòng 03 P5.1.326 — ĐÃ ĐẠT
- Lỗi từ ảnh sau P325: chỉ bốn phản hồi AI nhưng metric hiện “86% hợp gu” không ghi rõ độ bất định, có thể bị hiểu sai là độ chính xác đã đo.
- Mục tiêu: thêm nhãn “(sơ bộ)” khi học 2–9 phản hồi, cung cấp giải thích tooltip/aria-label; giữ nguyên thuật toán, điểm, không gửi dữ liệu.
- Test: Node static regression + Electron screenshot trước/sau 1920 và sau 720, kiểm tra nút Xem không bị đẩy khuất, không tràn và không tự phát.
- Actions 45236620519: Node 1.042 pass/5 skipped/0 fail, capture & Win x64/Mac arm64/Mac x64 success; public release skipped Stable-only.
- Real Electron artifact 14848624172: ảnh trước/sau 1920 và sau 720 đã tải và MỞ; 11/11 QA pass; 86% giữ nguyên, thêm nhãn (sơ bộ), nút Xem vẫn hiển thị.
- Chốt 03/20 vòng đủ bằng chứng. 17 vòng sau CHƯA thực hiện; cần tiếp tục dựa trên ảnh P326 và HEAD hiện hành.

## Đợt MỚI từ P5.1.326 — 01/20 P5.1.327 (CANDIDATE)
- Baseline P326: 1042 Node pass, 5 skipped, 11/11 Electron QA, Win/Mac builds pass; Release skipped stable-only. Đã MỞ ảnh after 1920 và 720.
- Lỗi quan sát: viền focus nằm tại nút WatchFlow trên topbar phía sau bảng AI đang mở. Nguyên nhân: opener cố focus một tab cũ bị AI ẩn.
- Sửa: khi bảng AI mở lại, chỉ chuyển focus từ ngoài hoặc từ control đã ẩn vào nút AI; không thay đổi tiêu điểm của control đang hiển thị bên trong.
- QA: Electron thực trước/sau 1920, sau 720, focus DOM, overflow, no autoplay và playlist/model giữ nguyên. Chỉ tính hoàn thành sau khi có CI/ảnh được MỞ xác nhận.

### Sửa kịch bản kiểm thử P327 sau CI capture thất bại
- CI 45239378274: Node 1043 pass/5 skip/0 fail; Capture thất bại ở assertion tự áp đặt "trạng thái lỗi cũ phải còn hiện diện". Với cơ chế mới, hệ thống đã chuyển focus vào AI tab trước khi screenshot; đây là dấu hiệu sửa thành công, không phải lỗi chức năng. Đã tải và MỞ Electron ảnh 1920/720 của capture thất bại, xác nhận focus viền nằm ở nút AI trong panel, không tràn.
- Repair: ảnh TRƯỚC chụp trạng thái WatchFlow đã đóng và focus ở toolbar; ảnh SAU chụp sau mở và mở lại WatchFlow AI thực. QA xác minh cả mở lần đầu/mở lại, không ép phần mềm quay về trạng thái lỗi sau sửa hoặc bỏ tiêu chí focus.
- Cần chạy lại CI, mở ảnh trước/sau mới và kiểm tra toàn bộ build trước khi công nhận vòng hoàn tất.

## Đợt mới — Vòng 01 P5.1.327: ĐÃ ĐẠT
- CI run 45240853457, SHA b23effd09311698475cb78225da04944812901c4: Node 1.043 pass, 5 skipped, 0 failed; Electron 9/9 QA true; capture, Windows x64, Mac arm64, Mac x64 build pass; Release skipped stable-only.
- Ảnh tải từ artifact 14852091202 đã MỞ: trước đóng WatchFlow, sau mở AI focus đúng nút tại 1920 và 720, không tràn. So sánh với ảnh P326 cho thấy focus không còn ở topbar. Không claim playback/GPU/Cast thực.

## Đợt mới — Vòng 02 P5.1.328: CANDIDATE
- Từ ảnh P327, WatchFlow AI chỉ mở bằng nút; người dùng điều khiển bàn phím không có phím tắt trực tiếp.
- Tính năng: F6 hoặc Alt+Shift+W mở AI ngay trang TV và focus vào AI tab; không chiếm nhập liệu, không chạy ở trang Sources, không phát kênh hoặc thay đổi nguồn/model.
- QA Electron: before/after 1920, after 720; F6/Alt+Shift+W thực, điền tìm kiếm, non-TV guard, aria-keyshortcuts, không tràn/dữ liệu bất biến. Không đánh dấu hoàn tất trước CI/soát ảnh.

### P328 — Chặn false-positive của QA nhập liệu
- Workflow 45243005052: Node pass, Win/mac build pass nhưng Electron capture báo ignoresTextInputs=false. Lỗi có thể xuất phát từ QA chỉ chọn DOM input đầu tiên, không xác minh trạng thái focus thật, hoặc bộ nhận phím cần guard mạnh hơn.
- Sửa kiểm thử: target #searchBox có thật ở TV, bắt buộc visible và document.activeElement===input trước khi nhấn F6. Đồng thời guard cả event.target và document.activeElement trong handler. Giữ nguyên assertion panel phải đóng khi nhập.
- Chạy lại full CI, không nhận P328 đạt khi chưa xem screenshot thật.

## Đợt mới — Vòng 02/20 P5.1.328: Electron QA ĐÃ ĐẠT, Mac ARM đang xếp hàng
- CI 45244481603 trên commit 0fbc817300aa65961ab28b1a3e38c27544f07cca: Node tests success, capture success (13/13 flags true) sau 2 lượt sửa QA/guard ô tìm kiếm; build Windows x64 và macOS Intel pass; macOS ARM tại thời điểm cập nhật còn queued. Release stable-only.
- Ảnh native lấy từ artifact 14853641547 đã MỞ: before 1920 panel đóng, after F6 mở AI có focus, 720x900 không tràn, AI tab đúng. QA: actual searchBox focused true, F6 không mở AI, Sources không mở AI, layout quốc tế KeyW pass, playlist/model/noAutoplay unchanged.
- Không claim phát hành ARM khi còn queued; vẫn tiếp tục vòng 03 dựa trên ảnh đã mở và QA desktop.

## Đợt mới — Vòng 03 P5.1.329: CANDIDATE
- Phát hiện từ ảnh sau P328: phím tắt đã mở AI, nhưng nhấn lại không đóng; cửa sổ AI phủ góc video, để đóng phải tìm nút × hoặc dùng phím Escape riêng.
- Tính năng: F6 và Alt+Shift+W là hai-way toggle cùng trạng thái; lần đầu mở và tập trung nút AI, lần hai đóng và chuyển focus về WatchFlow toolbar, trên cả 1920/720.
- QA Electron: trước AI mở/sau đóng trên desktop và 720, nhấn lại F6/chord, no overflow/data changes/autoplay; không tính vòng hoàn tất trước Node + ảnh thật + CDP/CI và mở PNG.


## Vòng tiếp nối — P5.1.330: CANDIDATE
- Baseline mới nhất: P5.1.329 / 4.23.414, HEAD kiểm tra trước commit; đã mở ảnh Electron thật P328 (720, 1920) và đọc mã P329.
- Lỗi phát hiện trong mã: shortcut F6/Alt+Shift+W có thể chồng AI lên dialog Thêm nguồn/Cast, chặn contenteditable="true" nhưng không chặn các biến thể contenteditable="" hoặc "plaintext-only".
- Sửa P330: thêm guard isContentEditable và .modal-backdrop thật trong renderer/positron-intelligence.js; giữ nguyên cơ chế toggle hai chiều P329. Không ảnh hưởng playlist/model.
- Electron QA script: source/cast native modal, 2 loại ô editable, shortcut hoạt động ở TV thường, F6 nhấn lại đóng, viewport 1920/720, không tràn, không tự phát. Ảnh before/after 1920 và after 720. Chỉ công nhận vòng đạt khi CI thành công và trực tiếp mở PNG sau.


## Vòng tiếp — P5.1.331: CANDIDATE
- Baseline: ảnh P5.1.330 thật ở 720x900 đã được mở; sáu chế độ AI nằm 3 cột x 2 hàng, cần ấn Tab để di chuyển. P330 Node 1046 pass, 5 skip, 11/11 Electron flags; Windows/Intel/capture pass, Mac ARM còn queued khi bắt đầu P331.
- Nguyên nhân: .po-ai-modes chỉ có click handlers, chưa có keyboard navigation 6 chế độ; khác với thanh WatchFlow chính đã được P325 thêm mũi tên.
- Sửa P331: ArrowLeft/Right (vòng qua các nút đang bật), ArrowUp/Down (đổi hàng, giữ cột nếu được), Home/End, tránh nút disabled, viền focus-visible dễ nhận. Tất cả thao tác chỉ chuyển focus; Enter/Space mới kích hoạt mode.
- QA thật: Electron desktop 1920 và màn hẹp 720; before/after, kiểm tra nhãn aria-pressed không thay đổi, không phát kênh, mô hình/playlist giữ nguyên, không tràn ngang.
- Không đánh dấu hoàn tất trước khi CI Node/capture và trực tiếp mở PNG.


### P331 — Khắc phục false-negative CI về nút Khám phá AI
- Actions 45249820668: Node 1047 pass/5 skipped/0 fail, Windows x64 & Intel DMG build success, Electron capture fails duy nhất vì QA tự giả định nút Khám phá AI disabled.
- Trên ảnh Electron thật 720 (đã MỞ) nút Khám phá AI vẫn bật; ArrowDown từ Kênh hợp gu chuyển focus chính xác vào nút đó. Ảnh 1920 before/after đã MỞ, viền focus dịch từ Kênh hợp gu sang Lịch EPG hợp gu.
- Sửa QA, KHÔNG thay logic sản phẩm: kiểm tra hai trường hợp Explore bật và bị khóa bằng thuộc tính disabled tạm thời trên nút thật trong Electron; restore sau thử, xác nhận playlist/model/no autoplay.
- P331 còn CANDIDATE tới khi CI mới pass và ảnh 720 trạng thái bị khóa đã mở lại.


### P331 — Bổ sung CI xác minh vòng hiện tại, không thay hồi quy đầy đủ
- Thêm .github/workflows/positron-fast-round.yml cùng scripts/positron-fast-round.cjs: chạy Electron thật trên Xvfb/CDP và đúng scripts/positron-NNN-audit.cjs theo nhãn package.json.
- Mục đích: lấy ảnh/QA riêng cho vòng hiện tại mà không phải đợi lại toàn bộ 50+20 kiểm tra lịch sử; workflow positron-lab.yml cũ vẫn chạy độc lập, không bỏ kiểm tra nào.
- Fast QA phải kiểm tra PNG before/after thực tế, JavaScript errors, version thực và báo fail trung thực. Chưa coi P331 đủ quy trình nếu fast CI chưa đạt và ảnh chưa được xem.


## Vòng tiếp — P5.1.332: CANDIDATE
- Đã xem ảnh P331 fast native Electron từ run 45251855269, 16/16 flag đạt, desktop 1920 khi chưa có nguồn: WatchFlow Intelligence panel chỉ chiếm khoảng 265px khiến sáu nút 3x2 xuống dòng; 720 thì nút chế độ thấp 38px.
- Vấn đề từ CSS: selector width 528px loại trừ data-empty-playlist="true"; khi AI mở không nguồn thì rơi về kích thước mặc định rất hẹp. 6 nút cũng min-height 38px, dù ứng dụng ưu tiên remote.
- P332 sửa trực tiếp trong CSS/JS: đảm bảo AI-active desktop panel width 528px kể cả khi chưa có playlist, tăng min-height 44px; hiển thị hướng dẫn phím và aria-describedby.
- QA Electron mới: đo width 1920, minheight 44 của đủ 6 nút, hint, focus-only, 720 width/overflow, không đổi playlist/model/autoplay; ảnh before panel đóng và after panel mở; đối chiếu với ảnh P331 panel mở làm baseline cũ.
- CHƯA ĐẠT cho đến khi CI/ảnh thật của P332 được mở soát.


### P332 — giữ bất biến DOM của P276 thay vì bỏ bài hồi quy
- Fast QA ban đầu (45252855915): 14/14 flag đạt, ảnh desktop/720 đã MỞ; desktop width 528px, sáu nút height 44px, helper liên kết aria-describedby.
- Node full suite run 45252855893: 1047 pass, 5 skipped, 1 fail ở test P276 vì static invariant bắt buộc lệnh area.append(title,controls,alertRow,modeBar,summary,list,privacy,modelManager) không đổi.
- Sửa mã thực: giữ nguyên câu lệnh area.append và dùng modeBar.after(modeHelp) để thêm dòng gợi ý bên dưới; DOM hiển thị giữ đúng hình và không phá thứ tự nhóm điều hướng trước model manager. Chạy lại Node và Electron sau sửa.

## Đợt 24/11/2026 từ P5.1.332 — vòng 01 P5.1.333 (CANDIDATE)
- HEAD đầu vào: efc6f67e7d034de96790e10fa90e6c400b8206c4; package 4.23.417. Fast Electron CI 45253296843 thành công, ảnh baseline 1920 và 720 đã được mở.
- Full capture 45253296908 lỗi P326 `cardAndActionsVisible=false` dù Node và build Win/Mac thành công.
- Ảnh đã trực tiếp mở: P326 after-720 trong artifact 14856358405; nút Xem đầu bị đẩy dưới mép panel do toolbar WatchFlow thường và AI cùng hiện.
- Sửa CSS: ẩn năm nút WatchFlow thường khi AI active; giữ tab AI để về chế độ cũ. Không giảm assertion P326.
- Chạy scripts/positron-333-audit.cjs với before/after Electron, 1920/720, đo CTA và không mất dữ liệu.
- CHƯA tính vòng nếu chưa đạt Node, QA Electron, soát ảnh SAU và CI.

## 24/11/2026 — vòng 02 P5.1.334 (đầu vào: ảnh sau P333, CANDIDATE)
- Ảnh thật đã MỞ ở 720/1920: nút «AI hợp gu» ngay sát/chạm thanh tiêu đề dính, và người dùng remote phải Tab qua nhiều điều khiển trước khi tới nút Xem đầu.
- Chọn nâng cấp AI có thể dùng ngay: Alt+Shift+J đưa focus vào nút Xem đầu, không tự phát; chừa 9px phía dưới header sticky khi AI active. Không sửa nguồn IPTV, dữ liệu người dùng.
- Kiểm thử: trước/sau Electron hai viewport, focus/aria-keyshortcuts, không tràn, không autoplay, và Node. Vòng này chỉ được tính khi test + mở ảnh + phiên bản/commit đạt.

## 24/11/2026 — vòng 03 P5.1.335 (đầu vào: ảnh P334)
- Screenshot P334 720px: nút Xem gợi ý đầu đã được focus qua Alt+Shift+J. Danh sách AI có nhiều thẻ nhưng phím Tab phải đi qua nút đánh giá/tra cứu mỗi thẻ mới tới gợi ý tiếp theo.
- New actionable AI feature: Alt+Shift+K nhảy lần lượt qua nút Xem mỗi thẻ và quay vòng; không bắt đầu phát, không sửa danh sách nguồn/mô hình.
- QA: Electron thực 1920/720 chụp trước/sau focus từ thẻ đầu sang thẻ kế, thử wrap, lưu PNG SHA, Node regression và nhập liệu được bảo vệ. Chỉ ghi vòng đạt khi kiểm thử và mở ảnh hoàn tất.

## 24/11/2026 — vòng 04 P5.1.336 (đầu vào: ảnh sau P335)
- Ảnh Electron thật P335 720 px: nút Xem gợi ý thứ hai có focus ring nhưng nằm ngay sát mép dưới panel; thiếu nhãn vị trí gợi ý hiện tại cho người dùng/trình đọc màn hình.
- New AI UX: tự cuộn gợi ý được chọn bằng K tới giữa vùng nhìn, và trạng thái «Gợi ý N/Tổng» aria-live trên bảng chỉ khi nhấn J/K; giữ nội dung người dùng và hành vi phát.
- Kiểm thử bắt buộc: Node và Electron 720/1920 before/after; phím chuyển 1→2, vòng về đầu, badge có aria-live, nút Xem có margin, ảnh thật MỞ soi; trước khi đạt không tính vòng.

## P5.1.336 screenshot-review correction (same patch version)
- P336 screenshot review found false-positive: badge CSS was visible but it scrolled above viewport when button K centered at 720px; fix attaches badge to sticky h2 title and strengthens native QA to check badge pixel geometry inside sticky header (not only display/visibility).

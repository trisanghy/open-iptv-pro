# Checkpoint 25/11/2026 — P5.1.356 dự kiến (0/20 vòng hoàn tất)

- Baseline P5.1.355 / 4.23.440, HEAD `29407de9bf360419a9e5f34f4515644d9b551185`, QA source `5235ab6fe76b959be804f901174beb47bf16d282`.
- Fast QA 45513376089 success; full run 45513375909 success, 1081 pass / 5 skipped / 0 fail. Windows x64 artifact 14977251794, mac arm64 14975947520, mac x64 14976917178, PNG bundle 14977072946, fast 14976323180.
- Đã mở ảnh Electron P355 `docs/positron-features/screenshots/positron-p51355-context-keys-after-1920x1080-real.png`: không nguồn, nút thêm nguồn hợp pháp, quyền học tắt. Ảnh 720×900 ở cùng đường dẫn dự đoán trả 404, không tuyên bố đã mở.
- Phát hiện qua đọc mã (không suy ra từ ảnh): `tick()` trong renderer/positron-intelligence.js cộng elapsed theo đồng hồ khi readyState >= 2, không kiểm tra currentTime tiến; có thể ghi sai sở thích khi đồng hồ media đứng. Chưa tái hiện trên Electron. Cần xác minh trên media fixture hợp pháp; không dùng luồng IPTV riêng.
- Chuẩn bị hàm thuần dưới đây, kiểm thử standalone 9/9 PASS (Node 22): phát bình thường, đứng media 240s, phát một phần, nhảy tiến/lùi, tốc độ 2x, đổi source, seek/giá trị lỗi, giới hạn khoảng trống, cờ threshold không đổi. Kiểm tra 3 đoạn thay thế đúng một lần trên source HEAD. Chưa chạy full repo tests hay Electron mới; chưa áp dụng vào renderer, chưa tăng version. Không đếm vòng.
- Local không phân giải DNS github.com và không có Electron executable. Không được nhận ảnh cũ là P356. Giữ AGENTS.md stable-only; dùng Actions artifacts thay public release thử nghiệm, giữ refresh-changelog.
- Khôi phục: kiểm tra lại HEAD; nếu lỗi vẫn tồn tại, thêm helper vào core, export nó, thay tick và thêm regression, chạy Node test và Electron thực với media fixture (timeline đóng băng vs tiến, 35s/180s). Chụp trước/sau 1920×1080 và 720×900 bằng Electron, mở ảnh, xác minh không đổi dữ liệu nguồn và không gọi mạng. Chỉ khi đạt mới tăng nhãn/version và chạy CI build tương ứng. Không coi tiến triển timeline là bằng chứng riêng về frame video đã giải mã; kiểm tra thêm nếu cần.

## Mã ứng viên chưa áp dụng

```js
function advanceViewingSample(previous,{id,source,wall,media,rate=1,seeking=false}){
 if(!id||!source||seeking||!Number.isFinite(wall)||!Number.isFinite(media)||media<0||!Number.isFinite(rate)||rate<=0)return null;
 const sample={id:String(id),source,wall,media,seconds:0,first:false,second:false};
 if(!previous||previous.id!==sample.id||previous.source!==source)return sample;
 const elapsed=(wall-previous.wall)/1000,delta=media-previous.media;
 sample.seconds=previous.seconds;sample.first=previous.first;sample.second=previous.second;
 if(elapsed>0&&delta>0&&delta<=elapsed*rate+1.25){
  sample.seconds+=Math.min(5,elapsed,delta/rate);
 }
 return sample;
}
```

Trong `renderer/positron-intelligence-core.js` thêm hàm và export trong Object.freeze.
Trong `renderer/positron-intelligence.js`, giữ guard enabled/readyState, thay đoạn từ `const ch=state()?.getCurrent?.(),now=Date.now();` đến `active.seconds+=elapsed;` bằng:

```js
const ch=state()?.getCurrent?.(),now=Date.now();
active=core.advanceViewingSample(active,{id:ch?.id,source:player.currentSrc,
 wall:win.performance.now(),media:player.currentTime,rate:player.playbackRate,seeking:player.seeking});
if(!active)return;
```

Giữ các ngưỡng học 35/180s và core.learn hiện có. Thêm listener `seeking` và `emptied` xóa active trong RAM. Không lưu URL source hoặc thêm quyền truy cập mạng.

Trạng thái: CHECKPOINT / chưa có P356, chưa có ảnh mới, không chạy nền.

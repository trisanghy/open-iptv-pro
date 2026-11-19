'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'i18n.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'languages.bundle.js'),'utf8');
const begin='window.OPEN_IPTV_TRANSLATIONS=';
const data=JSON.parse(bundle.slice(bundle.indexOf(begin)+begin.length).replace(/;\s*$/,''));
function makeEngine(){
 const document={documentElement:{},readyState:'loading',addEventListener(){}};
 class MutationObserver{observe(){}}
 const win={OPEN_IPTV_TRANSLATIONS:structuredClone(data)};
 vm.runInNewContext(source,{window:win,document,MutationObserver,localStorage:{getItem:()=>null,setItem(){}},CustomEvent:class {}},{timeout:5000});
 return win.OpenIPTVI18n;
}
test('all screenshot-reported Vietnamese Web labels translate into English',()=>{
 const t=makeEngine().t;
 const cases={
  'Thêm tính năng':'More features',
  '🔊 Bật tiếng':'🔊 Enable sound',
  'Bật tiếng':'Enable sound',
  'Bật tiếng cho kênh đang phát':'Enable sound for the current channel',
  'Tắt tiếng':'Mute',
  'Tải xuống phần mềm':'Download the app',
  'Tài khoản & Đồng bộ đám mây':'Account & Cloud Sync',
  '☁ Tài khoản & Đồng bộ đám mây':'☁ Account & Cloud Sync',
  'Chế độ khách · lưu trên thiết bị':'Guest mode · stored on this device',
  'Gửi email đăng nhập':'Send sign-in email',
  'Dán liên kết đăng nhập từ Gmail':'Paste sign-in link from Gmail',
  'Tự mở kênh khi vào website':'Automatically play when opening the website',
  'Âm thanh khi khóa màn hình':'Audio on the lock screen',
  'Tiếp tục nghe và điều khiển khi màn hình tắt (nếu được hỗ trợ)':'Continue listening and controlling playback while the screen is off (if supported)',
  'Ngôn ngữ giao diện':'Interface language',
  'Cấu hình kiểm tra, Snapshot và thời gian tua':'Scan settings, snapshots, and rewind duration',
  'Giám sát khung hình và link dự phòng':'Video freeze & backup streams',
  'Nhấn để mở các tùy chọn':'Tap to expand options',
  'Nhấn Nghe nền ở màn hình TV trước khi khóa máy. Chrome/Edge Android và Safari iOS chỉ phát tiếp nếu trình duyệt và luồng IPTV hỗ trợ.':'Tap Background audio on the TV screen before locking your device. Chrome/Edge on Android and Safari on iOS can continue only if the browser and stream support it.',
  'Chức năng cài đặt tự động chỉ hoạt động trong bản desktop đã đóng gói.':'Automatic installation is available only in the packaged desktop app.'
 };
 for(const [vi,en] of Object.entries(cases))assert.equal(t(vi,'en'),en,vi);
 assert.equal(t('Tự mở kênh khi vào website','vi'),'Tự mở kênh khi vào website');
});
test('counts and common dynamic UI statuses translate without modifying channel names',()=>{
 const t=makeEngine().t;
 const cases={'Đang dùng: 4 luồng':'In use: 4 workers','Đang dùng: 10 phút':'In use: 10 minutes',
  '● Sống 0 · ● Die 0 · ● Chưa rõ 0':'● Live 0 · ● Offline 0 · ● Unknown 0',
  '✓ Có ảnh 0 · ✕ Lỗi 0':'✓ Captured 0 · ✕ Errors 0',
  '0/0 kênh':'0/0 channels','Đã tự đồng bộ lúc 12:20':'Automatically synced at 12:20',
  'Đã tải Backup JSON (123 KB). File có thể chứa URL hoặc PIN, hãy cất riêng.':'JSON backup downloaded (123 KB). It may contain URLs or PINs; store it securely.'};
 for(const [vi,en] of Object.entries(cases))assert.equal(t(vi,'en'),en,vi);
 assert.equal(t('VTV5 Tây Nguyên','en'),'VTV5 Tây Nguyên');
 assert.equal(t('https://example.invalid/private?token=abc','en'),'https://example.invalid/private?token=abc');
});
test('Web HTML static labels are covered by English translations (excluding proper language names)',()=>{
 const t=makeEngine().t;
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const names=new Set(['Tiếng Việt','Español','Português (Brasil)','ไทย','ລາວ','ភាសាខ្មែរ']);
 const values=[...new Set([...html.matchAll(/>([^<>\n]{2,350})</g)].map(m=>m[1].trim().replace(/&amp;/g,'&')).filter(v=>/[À-ỹ]/.test(v)))];
 const missed=values.filter(v=>!names.has(v)&&t(v,'en')===v);
 assert.equal(missed.length,0,'Untranslated static Web UI: '+missed.join(' | '));
});
test('source collector, Cast, advanced player and app statuses also translate',()=>{
 const t=makeEngine().t;
 const pairs={
  'Chưa có nguồn. Hãy mở file M3U, thêm URL hoặc nhập repo công khai.':'No sources yet. Open an M3U file, add a URL, or import a public repository.',
  'Thu thập thất bại; dữ liệu cũ được giữ lại.':'Collection failed; previous data preserved.',
  'Đã hủy áp dụng; playlist không đổi.':'Apply canceled; playlist unchanged.',
  'Trình duyệt hiện tại không mở được AirPlay. Hãy mở website trực tiếp trong Safari; nếu cần, dùng Phản chiếu màn hình trong Trung tâm điều khiển iPhone.':'This browser cannot open AirPlay. Open the website directly in Safari. If needed, use Screen Mirroring in iPhone Control Center.',
  'Đang tìm Chromecast / Google TV trong mạng nội bộ…':'Searching for Chromecast / Google TV on the local network…',
  'Chưa có dữ liệu tua lại':'No timeshift data available',
  'Kênh thuộc nhóm bị khóa trong hồ sơ trẻ em':'Channel belongs to a locked group in the child profile',
  'Không lưu được dữ liệu (bộ nhớ ứng dụng có thể đã đầy). Hãy sao lưu và giảm số kênh/ảnh.':'Could not save data (app storage may be full). Back up data and reduce the number of channels/snapshots.',
  'Thiếu module kiểm tra Web. Hãy tải lại website.':'Web channel checker module missing. Reload website.',
  'Đang đợi dữ liệu video từ nguồn • ':'Waiting for video data from source • '
 };
 for(const [from,to] of Object.entries(pairs))assert.equal(t(from,'en'),to,from);
 assert.equal(t('Auto Failover: thử link https://example.invalid/live','en'),'Auto Failover: trying URL https://example.invalid/live');
 assert.equal(t('Đã lưu 3 link dự phòng','en'),'Saved 3 backup URLs');
 assert.equal(t('VTV5 Tây Nguyên','en'),'VTV5 Tây Nguyên');
});
test('root UI language parser has 17 selectable options and never changes source data',()=>{
 const i=makeEngine();
 assert.equal(Object.keys(i.locales).length,17);
 assert.match(source,/const originalText=new WeakMap/);
 assert.match(source,/skipSelector=.*#playingTitle/);
 assert.match(source,/Object\.assign\(dictionaries\.en/);
 assert.match(source,/MutationObserver/);
});

test('Chrome iOS uses existing volume button with no extra language-specific prompt',()=>{
 const recovery=fs.readFileSync(path.join(root,'web-ios-audio-recovery.js'),'utf8');
 const resume=fs.readFileSync(path.join(root,'resume-last.js'),'utf8');
 assert.doesNotMatch(recovery,/createElement|web-unmute-assist/);
 assert.doesNotMatch(resume,/showPrompt|web-resume-panel/);
 assert.match(recovery,/mute\.addEventListener\('click'/);
 assert.match(recovery,/video\.play\(\)/);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/src="i18n\.js\?v=[a-f0-9]{16}"/);
 assert.doesNotMatch(html,/web-ios-audio-recovery\.css|resume-last\.css/);
});

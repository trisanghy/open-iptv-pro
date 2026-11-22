'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const page=read('renderer/index.html'),ui=read('renderer/desktop-tv-pair.js'),css=read('renderer/desktop-tv-pair.css'),proto=read('renderer/web-tv-pair.js'),cast=read('renderer/cast-ui.js'),app=read('renderer/app.js');
test('TV pairing uses unmodified ECDH P-256 and AES-GCM protocol with public Web configuration',()=>{
 assert.match(proto,/namedCurve:'P-256'/);assert.match(proto,/name:'AES-GCM'/);
 assert.match(proto,/https:\/\/trisanghy\.github\.io\/open-iptv-pro\/cloud-config\.json/);
 assert.match(proto,/persistSession:false/);assert.match(proto,/pendingAcks:new Map/);
 assert.match(proto,/command-ack/);assert.match(proto,/reportPlayback/);
});
test('TV pairing panel has approved Web short links, state and usable remote buttons',()=>{
 for(const id of ['desktopTvPair','dtvPin','dtvConnect','dtvDisconnect','dtvHeadline','dtvCrypto','dtvControls','dtvPrev','dtvToggle','dtvStop','dtvNext','dtvMute','dtvVolume'])assert.ok(page.includes('id="'+id+'"'),id);
 for(const link of ['https://is.gd/openiptv','https://is.gd/IPTVTV','https://trisanghy.github.io/open-iptv-pro/tv.html'])assert.ok(page.includes(link),link);
 assert.match(ui,/ĐÃ KẾT NỐI/);assert.match(ui,/Phiên được mã hóa/);assert.match(ui,/onPlayback:info/);
 assert.match(ui,/awaitPlayback/);assert.match(ui,/onVolume/);assert.match(ui,/root\.OpenIPTVDesktopTVPair=Object\.freeze/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\) 1px 40px minmax\(70px,30%\)/);
});
test('Existing Google Cast / AirPlay remains and native playback routes paired actions',()=>{
 assert.match(cast,/castDiscover/);assert.match(cast,/scanAirplay/);assert.match(cast,/openAirplay/);
 assert.match(cast,/OpenIPTVDesktopTVPair/);
 assert.match(app,/OpenIPTVDesktopTVPair/);
 assert.match(page,/desktop-tv-pair\.js/);assert.match(page,/web-tv-pair\.js/);
});

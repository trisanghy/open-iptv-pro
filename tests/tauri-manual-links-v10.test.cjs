'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','renderer');
const picker=require(path.join(root,'manual-link-picker.js'));
const adaptive=require(path.join(root,'adaptive-playback.js'));
const advanced=require(path.join(root,'advanced-core.js'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const primary='https://iptv.example/live.m3u8?token=private';
const backup='https://backup.example/vtv3.m3u8?secret=hidden';
const base={id:'vtv3',name:'VTV3',url:primary,sourceId:'src1'};
test('No backup gives only one source and toggle is conditional',()=>{
 assert.equal(picker.choices(base,[base],{},advanced.alternatives,adaptive).length,1);
 assert.match(app,/items\.length<2/);
 assert.match(app,/control\.classList\.add\('hidden'\)/);
});
test('Manual and merged backups are included, with original source preserved',()=>{
 const sameName={...base,id:'other',url:'https://other.example/vtv3.m3u8'};
 const ch={...base};
 const items=picker.choices(ch,[ch,sameName],{[ch.id]:[backup]},advanced.alternatives,adaptive);
 assert.equal(items.length,3);
 assert.equal(items[0].label,'Link gốc');
 assert.equal(items.filter(x=>x.label.startsWith('Dự phòng')).length,2);
 assert.equal(ch.url,primary);
 assert.ok(items.some(x=>x.url===backup));
 assert.ok(items.every(x=>!x.host.includes('secret=')&&!x.host.includes('token=')));
});
test('Click selection puts chosen link first without deleting failover alternatives',()=>{
 const list=[primary,backup,'https://another.example/live'];
 assert.deepEqual(picker.prioritize(backup,list),[backup,primary,list[2]]);
 assert.deepEqual(picker.prioritize('javascript:alert(1)',list),list);
 assert.deepEqual(list,[primary,backup,list[2]]);
});
test('Preferred backup and playing source indicators are retained',()=>{
 const ch={...base,preferredStreamUrl:backup};
 const items=picker.choices(ch,[ch],{[ch.id]:[backup]},advanced.alternatives,adaptive);
 assert.equal(items[0].url,backup);
 assert.equal(items[0].preferred,true);
 assert.match(app,/items\.find\(item=>item\.url===activeUrl\)/);
 assert.match(app,/item\.preferred/);
});
test('UI is by the playing title; no extra unrelated dialog',()=>{
 assert.match(html,/id="playingTitle"[\s\S]*?id="manualLinkControl"/);
 assert.match(html,/id="manualLinkSelect"/);
 assert.doesNotMatch(html,/id="manualLinkMenu"/);
 assert.ok(html.indexOf('manual-link-picker.js')<html.indexOf('app-entry.js'));
 assert.match(app,/manualChoices\(channel\)\.some\(item=>item\.url===url\)/);
 assert.match(app,/playChannel\(channel\.id,null,\{mode:'live',manualUrl:url\}\)/);
 assert.match(app,/if\(opts\.manualUrl&&playMode==='live'&&manualPicker\)/);
 assert.match(app,/updateManualLinks\(\);\n  textStatus\('Auto Failover/);
});

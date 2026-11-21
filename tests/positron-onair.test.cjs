'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const core=require('../renderer/positron-onair-core.js');
const now=Date.parse('2026-11-21T12:00:00Z');
const channel={id:'v1',tvgId:'vtv1',name:'VTV1 HD'};
const guide={names:{vtv1:'vtv1'},aliasesById:{vtv1:['VTV1']},programmes:[
 {id:'vtv1',start:now-60_000,end:now+60_000,title:'Thời sự 19h'}]};
const match=(g,c,t=now)=>core.lookup(g,c,t,{current:(a,b,clock)=>{
 const p=a.programmes.find(x=>x.id===b.tvgId&&x.start+(a.offsetMinutes||0)*60_000<=clock&&x.end+(a.offsetMinutes||0)*60_000>clock);
 return {now:p?{...p,start:p.start+(a.offsetMinutes||0)*60_000,end:p.end+(a.offsetMinutes||0)*60_000}:null};
}});
test('EPG on-air respects programme window, guide offset and absent EPG',()=>{
 assert.equal(match(guide,channel)?.title,'Thời sự 19h');
 assert.equal(match(guide,channel,now+60_000),null,'end is exclusive');
 assert.equal(match(guide,channel,now-60_001),null);
 assert.equal(match({...guide,offsetMinutes:60},channel),null);
 assert.equal(match({...guide,offsetMinutes:60},channel,now+3600_000)?.title,'Thời sự 19h');
 assert.equal(match({programmes:[]},channel),null);
 assert.equal(match(null,channel),null);
});
test('EPG on-air does not invent programme titles or trust malformed metadata',()=>{
 assert.equal(match({...guide,programmes:[{id:'vtv1',start:now-100,end:now+100,title:''}]},channel),null);
 assert.equal(core.lookup(guide,channel,now,{current:()=>{throw Error('invalid guide')}}),null);
 assert.equal(core.lookup(guide,channel,now,{current:()=>({now:{title:'fake',start:NaN,end:now+1}})}),null);
});
test('WatchFlow on-air uses existing XMLTV API and metadata-only Electron evidence',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const html=fs.readFileSync('renderer/index.html','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(html.indexOf('positron-onair-core.js')<html.indexOf('positron-watchflow-next.js'));
 assert.ok(ui.includes('window.IPTVExtras?.getGuide?.()'));
 assert.ok(ui.includes('window.PositronOnAirCore?.lookup(liveGuide,ch,liveClock,window.IPTVGuide)'));
 assert.ok(ui.includes("programme.textContent='Đang chiếu: '+onAir.title"));
 assert.ok(qa.includes('positron-p5198-live-epg-watchflow-552-real.png'));
 assert.ok(qa.includes('scrollAtTop:document.getElementById'));
 assert.ok(ui.includes('panel.scrollTop=0'));

});

test('Next programme is XMLTV-only, future, bounded and respects absence',()=>{
 const base={...guide,programmes:[...guide.programmes,{id:'vtv1',start:now+60_000,end:now+3600_000,title:'Phim tối nay'}]};
 const api={current:(g,c,at)=>({next:g.programmes.find(p=>p.start>at)})};
 assert.equal(core.upcoming(base,channel,now,api)?.title,'Phim tối nay');
 assert.equal(core.upcoming({...base,programmes:[]},channel,now,api),null);
 assert.equal(core.upcoming(base,channel,now+60_000,api),null);
 assert.equal(core.upcoming(base,channel,now-13*3600_000,api),null);
 assert.equal(core.upcoming(base,channel,now,{current:()=>({next:{start:now+1000,end:now+2000,title:''}})}),null);
});
test('Next XMLTV display uses native local clock and never fetches media',()=>{
 const ui=fs.readFileSync('renderer/positron-watchflow-next.js','utf8');
 const qa=fs.readFileSync('scripts/positron-20-extension.cjs','utf8');
 assert.ok(ui.includes('window.PositronOnAirCore?.upcoming(liveGuide,ch,liveClock,window.IPTVGuide)'));
 assert.ok(ui.includes("toLocaleTimeString('vi-VN'"));
 assert.ok(ui.includes("upcoming.textContent='Tiếp theo '+at+': '+nextEPG.title"));
 assert.ok(qa.includes('positron-p5199-next-epg-watchflow-552-real.png'));
});

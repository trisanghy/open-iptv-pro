'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const section=(start,end)=>{
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing section: '+start);
 return html.slice(a,b+end.length);
};
const epgSource=section('/* BEGIN TIZEN EPG LITE V1','/* END TIZEN EPG LITE V1 */');
const searchScript=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
 .map(m=>m[1]).find(s=>s.includes('root.OpenIPTVChannelSearch=api'));
assert.ok(searchScript,'Web shared search algorithm missing');
const sampleChannel={id:'channel-vtv1',name:'VTV1 HD',group:'Tin tức',tvgId:'VTV1.vn'};
const clock=Date.UTC(2026,10,23,12,30,0); // 19:30 in Vietnam
const xml='<tv><channel id="VTV1.vn"><display-name>VTV1 HD</display-name></channel>'+
 '<channel id="unrelated"><display-name>Channel X</display-name></channel>'+
 '<programme channel="VTV1.vn" start="20261123190000 +0700" stop="20261123194500 +0700"><title lang="vi">Thời sự 19h</title></programme>'+
 '<programme channel="VTV1.vn" start="20261123194500 +0700" stop="20261123203000 +0700"><title>Việt Nam hôm nay</title></programme>'+
 '<programme channel="unrelated" start="20261123190000 +0700" stop="20261123210000 +0700"><title>Ignore this</title></programme></tv>';
const runEpg=(more={})=>{
 const env={state:{sources:[],favorites:{},recent:[]},selected:null,search:'',setTimeout,clearTimeout,
  byId:()=>({textContent:'',style:{},hidden:false}),all:()=>[sampleChannel],draw:()=>{},
  localStorage:{getItem:()=>null,setItem:()=>{}},...more};
 const ctx=vm.createContext(env);vm.runInContext(epgSource,ctx,{timeout:1000});return ctx;
};
test('Google TV 16:9 shell includes actual approved Web logo and complete controls',()=>{
 for(const id of ['searchBtn','addBtn','themeBtn','appsBtn','guideCard','guideBtn','infoBtn','guideNowTitle',
  'guideNextTitle','guideProgress','searchSuggestions','searchNotice','epgIndicator','channelPicker','sourceQR'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/class="brand-svg"/);
 assert.match(html,/M 197,266/,'official Web icon.svg play shape preserved');
 assert.match(html,/GOOGLE TV \/ MATERIAL 3 DESIGN/);
 assert.match(html,/body #app \.channel\.is-selected\{background:#9dc6ff/);
 assert.match(html,/body #app \.actions \.primary\{background:#2f85f9/);
 assert.match(html,/body #app \.brandicon\{display:flex/);
 assert.ok(html.indexOf('id="appsBtn"')<html.indexOf('data-nav="help"'),'Apps should precede Help like the approved layout');
});
test('Web default EPG source, daily refresh and bounded separate storage',()=>{
 const ctx=runEpg();
 assert.equal(ctx.EPG_DEFAULT,'https://epg.io.vn/epg.xml.gz');
 assert.equal(ctx.EPG_PLAIN,'https://epg.io.vn/epg.xml');
 assert.equal(ctx.EPG_BACKUP,'https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz');
 assert.equal(ctx.EPG_DAY_KEY,'openiptv-tizen-epg-day-v1');
 assert.notEqual(ctx.EPG_DAY_KEY,'openiptv-tizenbrew-tv-v1');
 assert.match(epgSource,/maxRows=4500/);
 assert.match(epgSource,/if\(meta\.lastAttempt===today\)/);
 assert.match(epgSource,/if\(!all\(\)\.length\)/);
 assert.match(epgSource,/if\(json.length>750000\)/);
 assert.match(epgSource,/8000000/);
 assert.match(epgSource,/24000000/);
 assert.match(epgSource,/epgDatabase\(\)/);
 assert.match(html,/clock\(\);setInterval\(clock,30000\);void epgStartup\(\)/);
 assert.match(html,/if\(typeof epgStartup==='function'\)void epgStartup\(\);if\(!fromPhone\)closeDialog\(\)/);
});
test('XMLTV timezone, tvg-id match and live/next programme',()=>{
 const ctx=runEpg();
 assert.equal(ctx.epgClock('20261123190000 +0700'),Date.UTC(2026,10,23,12));
 const guide=ctx.epgParse(xml,[sampleChannel],clock);
 assert.equal(guide.programmes.length,2);
 assert.equal(guide.programmes[0].title,'Thời sự 19h');
 assert.ok(!guide.programmes.some(p=>p.id==='unrelated'));
 assert.equal(ctx.epgSet(guide),true);
 const current=ctx.epgForChannel(sampleChannel,clock);
 assert.equal(current.now.title,'Thời sự 19h');
 assert.equal(current.next.title,'Việt Nam hôm nay');
 assert.equal(ctx.epgNorm('Đài VTV1 HD'),'daivtv1');
});
test('XMLTV parser rejects invalid and oversized files rather than filling memory',()=>{
 const ctx=runEpg();
 assert.throws(()=>ctx.epgParse('not xml',[sampleChannel],clock),/XMLTV/);
 assert.throws(()=>ctx.epgParse('x'.repeat(24000001),[sampleChannel],clock),/24 MB/);
 let input='<tv>';
 for(let n=0;n<160;n++)input+='<channel id="ch'+n+'"><display-name>Channel '+n+'</display-name></channel>';
 const channels=Array.from({length:160},(_,i)=>({id:'id'+i,name:'Channel '+i,tvgId:'ch'+i}));
 for(let n=0;n<160;n++)for(let i=0;i<40;i++)input+=
  '<programme channel="ch'+n+'" start="20261123190000 +0700" stop="20261123200000 +0700"><title>Show '+i+'</title></programme>';
 input+='</tv>';
 const guide=ctx.epgParse(input,channels,clock);
 assert.ok(guide.programmes.length<=4500,'EPG row limit exceeded');
 assert.ok(guide.programmes.length>100);
});
test('EPG fetch limits reject oversize headers and live stream payloads',async()=>{
 const ctx=runEpg();
 await assert.rejects(ctx.epgLimitedBytes({headers:{get:()=>String(9000000)}},8000000),/giới hạn/);
 let sent=0,cancelled=false;
 const reader={
  async read(){sent++;return sent<3?{done:false,value:new Uint8Array(50)}:{done:true};},
  async cancel(){cancelled=true;},releaseLock(){}
 };
 await assert.rejects(ctx.epgLimitedBytes({body:{getReader:()=>reader},headers:{get:()=>null}},80),/giới hạn/);
 assert.equal(cancelled,true);
});
test('A successful EPG daily update downloads once and stores in separate cache',async()=>{
 const store=new Map(),calls=[],ctx=runEpg({localStorage:{
  getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)
 }});
 let writes=0;
 ctx.epgReadCache=async()=>null;
 ctx.epgDownload=async url=>{calls.push(url);return '<tv><channel id="VTV1.vn"><display-name>VTV1</display-name></channel>'+
 '<programme channel="VTV1.vn" start="'+(function(v){var d=new Date(v+7*3600000);return d.getUTCFullYear()+('0'+(d.getUTCMonth()+1)).slice(-2)+('0'+d.getUTCDate()).slice(-2)+('0'+d.getUTCHours()).slice(-2)+('0'+d.getUTCMinutes()).slice(-2)+'00 +0700';})(Date.now()-1800000)+
 '" stop="'+(function(v){var d=new Date(v+7*3600000);return d.getUTCFullYear()+('0'+(d.getUTCMonth()+1)).slice(-2)+('0'+d.getUTCDate()).slice(-2)+('0'+d.getUTCHours()).slice(-2)+('0'+d.getUTCMinutes()).slice(-2)+'00 +0700';})(Date.now()+1800000)+'"><title>Live news</title></programme></tv>';};
 ctx.epgWriteCache=async(day,g)=>{assert.ok(g.programmes.length);writes++;};
 ctx.renderSelectedEPG=()=>{};
 await ctx.epgStartup();
 await ctx.epgStartup();
 assert.equal(calls.length,1);
 assert.equal(calls[0],ctx.EPG_DEFAULT);
 assert.equal(writes,1);
 const metadata=JSON.parse(store.get(ctx.EPG_DAY_KEY));
 assert.equal(metadata.lastAttempt,ctx.epgDate());
 assert.equal(metadata.lastSuccess,ctx.epgDate());
 assert.equal(ctx.epgReady,true);
});
test('Daily failure preserves last good EPG cache and does not retry all day',async()=>{
 const store=new Map(),ctx=runEpg({localStorage:{
  getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)
 }});
 const guide=ctx.epgParse(xml,[sampleChannel],clock),called=[];
 ctx.epgReadCache=async()=>({day:'2026-11-22',guide});
 ctx.epgDownload=async url=>{called.push(url);throw Error('offline');};
 ctx.renderSelectedEPG=()=>{};
 await ctx.epgStartup();
 await ctx.epgStartup();
 assert.equal(ctx.epgReady,true,'old successful cache must remain visible');
 assert.equal(called.length,3,'VNEPG gzip, VNEPG XML and EPGShare01 backup share one daily refresh cycle');
 assert.equal(ctx.epgError.startsWith('EPG:'),true);
});
test('Web search reused exactly: accent-insensitive, typo correction and EPG programme',()=>{
 const context={window:{}};vm.runInNewContext(searchScript,context,{timeout:1000});
 const search=context.window.OpenIPTVChannelSearch;
 assert.ok(search&&typeof search.search==='function');
 const channels=[sampleChannel,{id:'another',name:'VTV3 HD',group:'Giải trí',tvgId:'VTV3.vn'}];
 const guide=runEpg().epgParse(xml,channels,clock);
 const byName=search.search(channels,'vtv1',guide,{clock});
 assert.equal(byName.channels.length,1);
 assert.equal(byName.channels[0].id,sampleChannel.id);
 const viaEPG=search.search(channels,'thoi su',guide,{clock});
 assert.equal(viaEPG.channels.length,1);
 assert.equal(viaEPG.matches.get(sampleChannel.id).programme,'Thời sự 19h');
 const typo=search.search(channels,'vtv 1',guide,{clock});
 assert.ok(typo.channels.length>=1);
 assert.equal(search.normalize('Truyền hình Việt Nam'),'truyen hinh viet nam');
});
test('Suggestions are local-only and prioritise favourites and recents',()=>{
 const start=html.indexOf('/* Local-only recommendations');
 const end=html.indexOf('function draw(){',start);
 assert.ok(start>0&&end>start);
 const ctx=vm.createContext({
  state:{sources:[],favorites:{'c2':true},recent:['c3']},
  playing:null,Date,byId:()=>null,epgForChannel:()=>({now:null,next:null})
 });
 vm.runInContext(html.slice(start,end),ctx);
 const rows=[{id:'c1',name:'One'},{id:'c2',name:'Two'},{id:'c3',name:'Three'}];
 const ranked=ctx.recommendChannels(rows);
 assert.equal(ranked[0].id,'c2');
 assert.equal(ranked[1].id,'c3');
 assert.match(html,/group==='✨ Gợi ý'/);
});

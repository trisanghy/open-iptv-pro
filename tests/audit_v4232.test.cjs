'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../src/core.cjs');
const doctorCore=require('../renderer/doctor-v3-core.js');
function env(){
 const nodes=new Map();
 function el(id=''){
  return {id,value:'',disabled:false,textContent:'',style:{},children:[],className:'',callbacks:{},
   addEventListener(k,f){this.callbacks[k]=f;},replaceChildren(...x){this.children=x;this.textContent='';},append(...x){this.children.push(...x);},
   setAttribute(k,v){this[k]=v;},get childElementCount(){return this.children.length;}};
 }
 const get=id=>{if(!nodes.has(id))nodes.set(id,el(id));return nodes.get(id);};
 return {document:{getElementById:get,createElement:tag=>el(tag)},get};
}
function launchDoctor(options){
 const {document,get}=env(),store=new Map();
 const channels=options.channels||[];
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 get('doctor3Limit').value=options.limit||'all';
 let checkInFlight=0,maxInFlight=0,requested=0,saves=0,errors=[],checked=[];
 const ctx={getChannels:()=>channels,save(){saves++},renderList(){},toast:s=>errors.push(s),getStore:()=>({channels})};
 const w={IPTVState:ctx,OpenIPTVDoctorV3:doctorCore,streamleaf:{check:async url=>{
   requested++;checkInFlight++;maxInFlight=Math.max(maxInFlight,checkInFlight);
   let res;try{res=await options.check(url);}finally{checkInFlight--;}
   checked.push(url);return res;
  }},IPTVProAdvanced:{canEdit:()=>true,onCheck:(ch,r)=>{}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../renderer/doctor-v3.js'),'utf8'),
  {window:w,document,localStorage,confirm:()=>true,setTimeout,Blob,URL,console});
 return {get,channels,saves:()=>saves,stats:()=>({requested,maxInFlight,checked}),errors};
}
test('M3U parser does not split metadata at a comma inside quotes, and accepts lowercase EXTINF',()=>{
 const playlist='#EXTM3U\n#extinf:-1 tvg-name="News, Local" group-title="World, Local" tvg-id="v1",News One, HD\nhttps://example.test/live.m3u8\n';
 const [c]=core.parseM3U(playlist);
 assert.equal(c.name,'News One, HD');assert.equal(c.group,'World, Local');assert.equal(c.tvgId,'v1');
 assert.equal(core.parseM3U(core.exportM3U([c]))[0].name,c.name);
});
test('Renderer/core M3U parsers agree for quoted commas in metadata',()=>{
 const playlist='#EXTM3U\n#EXTINF:-1 tvg-name="Local, Morning" group-title="Sports, World",Television, HD\nhttps://example.test/c.m3u8\n';
 const sandbox={window:{},URL};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../renderer/core-browser.js'),'utf8'),sandbox);
 const front=sandbox.window.StreamLeafCore.parseM3U(playlist,'source');
 const back=core.parseM3U(playlist,'source');
 assert.equal(front.length,1);assert.equal(front[0].group,back[0].group);assert.equal(front[0].name,back[0].name);
});
test('Doctor 3.0 ALL checks 1205 channels (no 40 / 1000 cap) with at most 4 concurrent requests',async()=>{
 const channels=Array.from({length:1205},(_,i)=>({id:String(i),name:'Channel '+i,url:`https://example.test/${i}`,status:'unchecked'}));
 const t=launchDoctor({channels,limit:'all',check:async()=>{await Promise.resolve();return {status:'alive',positiveEvidence:true,reason:'Video packet validated'};}});
 await t.get('doctor3Verify').onclick();
 assert.equal(t.stats().requested,1205);
 assert.ok(t.stats().maxInFlight<=4);
 assert.equal(channels.filter(x=>x.status==='alive').length,1205);
 assert.equal(t.get('doctor3ProgressBar').style.width,'100%');
 assert.equal(t.get('doctor3Cancel').disabled,true);
});
test('Doctor 3.0 does not classify Alive/Dead without the corresponding positive evidence',async()=>{
 const channels=['unprovenAlive','unconfirmedDead','provedAlive','confirmedDead'].map((n,i)=>({id:String(i),name:n,url:'https://example.test/'+n}));
 const outcomes=[{status:'alive',positiveEvidence:false},{status:'dead',confirmedDead:false},{status:'alive',positiveEvidence:true},{status:'dead',confirmedDead:true}];
 const t=launchDoctor({channels,limit:'all',check:async url=>outcomes[channels.findIndex(c=>c.url===url)]});
 await t.get('doctor3Verify').onclick();
 assert.deepEqual(channels.map(x=>x.status),['uncertain','uncertain','alive','dead']);
});
test('Doctor 3.0 cancel stops queueing new checks and retains completed results',async()=>{
 const channels=Array.from({length:200},(_,i)=>({id:String(i),name:'Channel '+i,url:`https://example.test/${i}`}));
 const t=launchDoctor({channels,limit:'all',check:async()=>{await new Promise(r=>setTimeout(r,3));return {status:'alive',positiveEvidence:true};}});
 const running=t.get('doctor3Verify').onclick();t.get('doctor3Cancel').onclick();await running;
 assert.ok(t.stats().requested<200);
 assert.equal(channels.filter(c=>c.status==='alive').length,t.stats().requested);
 assert.match(t.get('doctor3Status').textContent,/Đã hủy/);
});
test('Doctor 3.0 stale-only scope excludes channels with recent positive evidence',async()=>{
 const now=new Date().toISOString();
 const channels=[{id:'a',name:'Fresh',url:'https://e.test/a',status:'alive',checkedAt:now},{id:'b',name:'Stale',url:'https://e.test/b',status:'uncertain'}];
 const t=launchDoctor({channels,limit:'unverified',check:async()=>({status:'alive',positiveEvidence:true})});
 await t.get('doctor3Verify').onclick();
 assert.deepEqual(t.stats().checked,['https://e.test/b']);
});
test('Doctor and Discovery HTML include all-scope controls, progress, localized source-manager navigation',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
 assert.match(html,/<select class="modal-input" id="doctor3Limit">[\s\S]*?value="all"[\s\S]*?value="1000"/);
 assert.match(html,/id="doctor3ProgressBar"/);
 assert.match(html,/id="smartDiscoverySection"/);
 assert.doesNotMatch(html,/data-page="discovery"/);
 assert.match(fs.readFileSync(path.join(__dirname,'../renderer/smart-discovery-ui.js'),'utf8'),/positiveEvidence===true/);
});

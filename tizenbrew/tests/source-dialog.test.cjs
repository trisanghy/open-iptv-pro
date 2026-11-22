'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const tv=fs.readFileSync(path.join(root,'index.html'),'utf8');
const phone=fs.readFileSync(path.join(root,'phone.html'),'utf8');
const scripts=s=>Array.from(s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),m=>m[1]);

test('Tizen and mobile JavaScript scripts parse',()=>{
 for(const [target,html] of [['Tizen',tv],['phone',phone]]){
  assert.ok(scripts(html).length>0);
  scripts(html).forEach((s,i)=>assert.doesNotThrow(()=>new vm.Script(s,{filename:target+'-'+i+'.js'})));
 }
});
test('Only name, URL and consent are required on Tizen',()=>{
 assert.doesNotMatch(tv,/id="sourceText"/);
 assert.doesNotMatch(tv,/dán nội dung M3U/);
 for(const id of ['sourceName','sourceUrl','rights','sourceQR','sourceQRStatus','refreshSourceQR','toSourceUrl'])
  assert.match(tv,new RegExp('id="'+id+'"'));
 assert.match(tv,/new QRCode\(/);
 assert.match(tv,/width:420,height:420/);
 assert.match(tv,/SOURCE_PAGE\+'#code='\+token/);
});
test('Mobile and TV share a QR Realtime protocol and token expiry',()=>{
 for(const body of [tv,phone]){
  assert.match(body,/new Uint8Array\(16\)/);
  assert.match(body,/600000/);
  assert.match(body,/manager-request/);
  assert.match(body,/manager-result/);
  assert.match(body,/manager-progress/);
  assert.match(body,/openiptv-tizen-source-v1-/);
  assert.match(body,/https:\/\/zjbsvqryaxtafuffpifu\.supabase\.co/);
 }
 assert.match(tv,/event:'manager-request'},function\(event\)\{var message=event&&event\.payload;/);
 assert.match(phone,/var reply=packet&&packet\.payload/);
 assert.match(tv,/event:'source-submit'},async function\(event\)\{var message=event&&event\.payload;/);
 assert.match(tv,/await addSource\(\{name:req\.name,address:req\.address,rights:req\.rights\},true\)/);
 assert.match(phone,/action!=='hello'&&!online/);
 assert.match(phone,/lastSeen=Date\.now\(\);connection\(true/);
 assert.match(phone,/id="rights"/);
});
test('Samsung remote D-pad can leave input name for URL',()=>{
 const start=tv.indexOf('function keyHandler(e){');
 const end=tv.indexOf("\ndocument.querySelectorAll('[data-nav]')",start);
 assert.ok(start>=0&&end>start);
 let active,prevented=false,moved='',closed=false;
 const modal={hidden:false};
 const name={tagName:'INPUT',type:'text',focus(){active=name}};
 const address={tagName:'INPUT',type:'url',focus(){active=address}};
 const ctx={isRemoteBack:e=>e.key==='Escape',handleBack:()=>{closed=true;},document:{get activeElement(){return active;}},
  byId:id=>id==='modal'?modal:id==='sourceName'?name:id==='sourceUrl'?address:null,
  move:key=>{moved=key;},closeDialog:()=>{closed=true;}};
 const keyHandler=vm.runInNewContext(tv.slice(start,end)+'\nkeyHandler;',ctx);
 const fire=(key,keyCode)=>{prevented=false;keyHandler({key,keyCode,preventDefault(){prevented=true;},stopPropagation(){}});};
 active=name;fire('ArrowDown',40);assert.equal(active,address);assert.equal(prevented,true);
 active=name;fire('Enter',13);assert.equal(active,address);
 active=address;fire('ArrowUp',38);assert.equal(active,name);
 active=name;fire('ArrowLeft',37);assert.equal(prevented,false);
 active={tagName:'BUTTON'};fire('ArrowDown',40);assert.equal(moved,'ArrowDown');
 fire('Escape',27);assert.equal(closed,true);
});

test('Samsung remote can focus, check and uncheck the large consent control',()=>{
 assert.match(tv,/id="rights" role="checkbox" aria-checked="false"/);
 assert.match(tv,/class="rights-box"/);
 assert.match(tv,/\.rights-toggle\[aria-checked=true\]/);
 assert.doesNotMatch(tv,/id="rights"[^>]*type="checkbox"/);
 assert.match(tv,/byId\('rights'\)\.onclick=toggleRights/);
 assert.match(tv,/getAttribute\('aria-checked'\)==='true'/);
 const start=tv.indexOf('function setRightsChecked(');
 const end=tv.indexOf('async function addSource(',start);
 assert.ok(start>=0&&end>start);
 let checked='false';
 const rights={getAttribute:k=>k==='aria-checked'?checked:null,setAttribute:(k,v)=>{if(k==='aria-checked')checked=v}};
 const funcs=vm.runInNewContext(tv.slice(start,end)+'\n({setRightsChecked,toggleRights});',{byId:id=>id==='rights'?rights:{focus(){}}});
 funcs.toggleRights();assert.equal(checked,'true');
 funcs.toggleRights();assert.equal(checked,'false');
 funcs.setRightsChecked(false);assert.equal(checked,'false');
 const begin=tv.indexOf('function keyHandler(e){');
 const finish=tv.indexOf("\ndocument.querySelectorAll('[data-nav]')",begin);
 let active,prevented=false,stopped=false,toggles=0;
 const modal={hidden:false};
 const name={tagName:'INPUT',type:'text',focus(){active=name}};
 const address={tagName:'INPUT',type:'url',focus(){active=address}};
 const rightButton={tagName:'BUTTON',focus(){active=rightButton}};
 const save={tagName:'BUTTON',focus(){active=save}};
 const keyFn=vm.runInNewContext(tv.slice(begin,finish)+'\nkeyHandler;',{
  document:{get activeElement(){return active;}},
  byId:id=>({modal,sourceName:name,sourceUrl:address,rights:rightButton,saveSource:save})[id],
  isRemoteBack:()=>false,handleBack:()=>{},toggleRights:()=>{toggles++},move:()=>{}
 });
 const send=(key,keyCode,repeat=false)=>{prevented=false;stopped=false;keyFn({key,keyCode,repeat,preventDefault(){prevented=true},stopPropagation(){stopped=true}});};
 active=address;send('ArrowDown',40);assert.equal(active,rightButton);assert.equal(prevented,true);
 send('Enter',13);assert.equal(toggles,1);assert.equal(prevented,true);assert.equal(stopped,true);
 send('Enter',13,true);assert.equal(toggles,1,'holding OK must not toggle repeatedly');
 send(' ',32);assert.equal(toggles,2);
 send('ArrowDown',40);assert.equal(active,save);
 send('ArrowUp',38);assert.equal(active,rightButton);
 send('ArrowUp',38);assert.equal(active,address);
});
test('QR manager edits persist on TV; hidden/favorites/reorder are real TV state',()=>{
 const start=tv.indexOf('var managerRevision=0,managerBusy=');
 const finish=tv.indexOf('var timer=0;function notify',start);
 assert.ok(start>=0&&finish>start);
 const ctx=vm.createContext({
  state:{sources:[{id:'s-1',name:'Danh sách',address:'https://example.com/file.m3u',
    channels:[{id:'c1',name:'Kênh 1',group:'Tin tức',url:'https://example.com/1.m3u8'},
              {id:'c2',name:'Kênh 2',group:'Giải trí',url:'https://example.com/2.m3u8'}]}],
    favorites:{}},
  save:()=>true,draw:()=>{},selected:null,
  hash:s=>'hash-'+s.length,url:s=>/^https?:\/\//.test(s)?s:'',
  byId:()=>({hidden:false}),sourceStatus:()=>{},newToken:()=>''.padStart(32,'0'),
  setTimeout,clearTimeout,managerRevision:0,pairSeq:1,
  sourcePair:{token:'pair-ok'}
 });
 vm.runInContext(tv.slice(start,finish),ctx);
 const api={
  snap:ctx.managerSnapshot,do:ctx.managerPerform
 };
 let s=api.snap({sourceId:'s-1'});
 assert.equal(s.sources.length,1);
 assert.equal(s.total,2);
 assert.equal(s.channels[0].name,'Kênh 1');
 assert.equal(api.do('rename-source',{sourceId:'s-1',name:'Danh sách mới'}).ok,true);
 assert.equal(ctx.state.sources[0].name,'Danh sách mới');
 assert.equal(api.do('favorite-channel',{sourceId:'s-1',index:0,channelId:'c1'}).ok,true);
 assert.equal(ctx.state.favorites.c1,true);
 assert.equal(api.do('toggle-channel',{sourceId:'s-1',index:0,channelId:'c1'}).ok,true);
 assert.equal(ctx.state.sources[0].channels[0].hidden,true);
 assert.equal(api.do('move-channel',{sourceId:'s-1',index:0,channelId:'c1',direction:'down'}).ok,true);
 assert.equal(ctx.state.sources[0].channels[1].id,'c1');
 assert.equal(api.do('edit-channel',{sourceId:'s-1',index:1,channelId:'c1',name:'Kênh 1 mới',group:'Sửa tên',url:'https://example.com/new.m3u8'}).ok,true);
 assert.equal(ctx.state.sources[0].channels[1].group,'Sửa tên');
 assert.equal(api.do('add-channel',{sourceId:'s-1',name:'Kênh 3',group:'Tin tức',url:'https://example.com/3.m3u8'}).ok,true);
 assert.equal(ctx.state.sources[0].channels.length,3);
 assert.equal(api.do('delete-channel',{sourceId:'s-1',index:2,channelId:'hash-42'}).ok,false,'stale ID must be rejected');
 assert.equal(api.do('delete-source',{sourceId:'s-1'}).ok,true);
 assert.equal(ctx.state.sources.length,0);
});
test('QR snapshots are paginated, avoiding oversized Realtime messages',()=>{
 const start=tv.indexOf('var managerRevision=0,managerBusy='),finish=tv.indexOf('var timer=0;function notify',start);
 const items=Array.from({length:75},(_,i)=>({id:'channel-'+i,name:'Kênh '+i,group:'Nhóm',url:'https://example.com/'+i+'.m3u8'}));
 const ctx=vm.createContext({
  state:{sources:[{id:'s-2',name:'Nhiều kênh',channels:items}],favorites:{}},
  save:()=>true,draw:()=>{},hash:()=>'',url:s=>s,
  byId:()=>({hidden:false}),sourceStatus:()=>{},pairSeq:2,sourcePair:{token:'pair-ok'},
  setTimeout,clearTimeout
 });
 vm.runInContext(tv.slice(start,finish),ctx);
 const page1=ctx.managerSnapshot({sourceId:'s-2',offset:0});
 assert.equal(page1.channels.length,30);assert.equal(page1.hasMore,true);
 const page2=ctx.managerSnapshot({sourceId:'s-2',offset:30});
 assert.equal(page2.channels[0].index,30);assert.equal(page2.channels.length,30);
 const page3=ctx.managerSnapshot({sourceId:'s-2',offset:60});
 assert.equal(page3.channels.length,15);assert.equal(page3.hasMore,false);
 const filtered=ctx.managerSnapshot({sourceId:'s-2',query:'Kênh 74'});
 assert.equal(filtered.total,1);
});
test('QR phone cannot claim successful delivery without TV response',()=>{
 assert.match(phone,/connection\(false,'Đang kết nối máy chủ/);
 assert.match(phone,/action!=='hello'&&!online/);
 assert.match(phone,/event:'manager-result'/);
 assert.match(phone,/event:'manager-progress'/);
 assert.match(phone,/TV không trả lời sau/);
 assert.match(phone,/Đang gửi nguồn\. Chờ TV xác nhận/);
 assert.match(tv,/TV đã nhận nguồn từ điện thoại/);
 assert.match(tv,/await pairSend\(channel,'manager-result',answer\)/);
 assert.match(tv,/var message=event&&event\.payload/);
 assert.match(tv,/if\(!save\(\)\)throw Error\('TV không đủ bộ nhớ lưu thay đổi\.'\)/);
});
test('TV manager hello confirms online and returns a live snapshot',async()=>{
 const start=tv.indexOf('var managerRevision=0,managerBusy='),finish=tv.indexOf('var timer=0;function notify',start);
 const out=[],ctx=vm.createContext({
  state:{sources:[{id:'src-1',name:'My source',channels:[]}],favorites:{}},
  save:()=>true,draw:()=>{},hash:()=>'',url:s=>s,
  byId:()=>({hidden:false}),sourceStatus:()=>{},pairSeq:10,sourcePair:{token:'token-123'},
  setTimeout,clearTimeout
 });
 vm.runInContext(tv.slice(start,finish),ctx);
 const channel={send:async msg=>{out.push(msg);return 'ok';}};
 await ctx.onManagerRequest({id:'a'.repeat(32),action:'hello'},channel,10,'token-123');
 assert.equal(out.length,1);assert.equal(out[0].event,'manager-result');
 assert.equal(out[0].payload.ok,true);assert.equal(out[0].payload.online,true);
 assert.equal(out[0].payload.state.sources[0].name,'My source');
});

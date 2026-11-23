'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function block(a,b){let x=html.indexOf(a),y=html.indexOf(b,x);assert.ok(x>=0&&y>x,'Expected '+a);return html.slice(x,y);}
test('Only one exit remains; a separate TizenTube button is provided',()=>{
 assert.equal((html.match(/id="exitModuleBtn"/g)||[]).length,1);
 assert.equal((html.match(/id="tizenTubeBtn"/g)||[]).length,1);
 assert.doesNotMatch(html,/id="navExitBtn"|id="exitPlayer"/);
 assert.match(html,/class="exit-small"/);
 assert.match(html,/byId\('exitModuleBtn'\)\.onclick=exitModule/);
 const nav=html.slice(html.indexOf('<nav class="nav">'),html.indexOf('</nav>')+6);
 const player=html.slice(html.indexOf('<div id="player"'),html.indexOf('<div id="toast"'));
 assert.ok(nav.includes('id="sidebarShortcuts"'),'Both shortcuts should be inside the left sidebar');
 assert.ok(nav.indexOf('data-nav="help"')<nav.indexOf('id="sidebarShortcuts"'),'Below Hướng dẫn');
 assert.match(nav,/id="tizenTubeBtn"/);
 assert.match(nav,/id="exitModuleBtn"/);
 assert.doesNotMatch(player,/id="exitModuleBtn"|id="tizenTubeBtn"|sidebarShortcuts/);
 assert.doesNotMatch(html,/\.tv-shortcuts\{|position:fixed;z-index:8;right:18px/);
 assert.match(html,/\.nav \.sidebar-shortcuts\s*\{[^}]*flex-direction:column/,'shortcuts should appear vertically below Hướng dẫn');
 assert.match(html,/\.nav \.sidebar-shortcuts button\{width:100%\}/,'shortcuts occupy separate full-width rows');
 const footer=html.slice(html.indexOf('<footer class="footer">'),html.indexOf('</footer>')+9);
 assert.doesNotMatch(footer,/id="exitModuleBtn"|id="tizenTubeBtn"/,'neither shortcut may appear in footer');

});
test('Full-screen player cannot navigate to hidden sidebar buttons with remote',()=>{
 const from=html.indexOf('function keyHandler(e){');
 const to=html.indexOf("\ndocument.querySelectorAll('[data-nav]')",from);
 assert.ok(from>0&&to>from);
 let focused=0,clicked=0,played=0,paused=0,prevented=0,opened=0;
 const video={paused:true,play(){played++;return Promise.resolve()},pause(){paused++}};
 const exit={focus(){focused++},click(){clicked++}},tube={focus(){focused++},click(){clicked++}};
 const byId=id=>({player:{hidden:false},modal:{hidden:true},channelPicker:{hidden:true},browserFallback:{hidden:true},video,exitModuleBtn:exit,tizenTubeBtn:tube})[id];
 const fn=vm.runInNewContext(html.slice(from,to)+'\nkeyHandler;',{
  byId,isRemoteBack:()=>false,handleBack(){},document:{activeElement:exit},notify(){},
  togglePlayback(){played++;},changeChannel(){throw Error('Arrows must not directly change a channel');},openChannelPicker(){opened++;},move(){focused++}
 });
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])fn({key,keyCode:0,preventDefault(){prevented++}});
 assert.equal(focused,0,'no hidden sidebar button may be focused from the player');
 assert.equal(opened,4,'each D-pad direction opens the selector from fullscreen');
 fn({key:'Enter',keyCode:13,preventDefault(){prevented++}});
 assert.equal(played,1,'OK should control video');
 assert.equal(clicked,0,'OK on player must not activate old sidebar focus');
});
test('Changing to TizenTube asks installed TizenBrew module list first',async()=>{
 const code=block('function openTizenTube(){','function handleBack(e){');
 const messages=[],nav=[],timeouts=[],notifications=[];
 let ws;
 class WebSocketMock {constructor(u){assert.equal(u,'ws://127.0.0.1:8081');ws=this;} send(s){messages.push(JSON.parse(s));}close(){}}
 const elements={video:{pause(){}},player:{hidden:false}};
 const ctx={WebSocket:WebSocketMock,window:{location:{set href(v){nav.push(v);}}},byId:id=>elements[id],stopPair:()=>{},
  notify:t=>notifications.push(t),setTimeout:(f,delay)=>{const id=timeouts.length+1;timeouts.push({id,f,delay});return id;},clearTimeout:()=>{}};
 const open=vm.runInNewContext(code+'\nopenTizenTube;',ctx);
 open();ws.onopen();assert.equal(messages[0].type,4);assert.equal(messages.length,1);
 const installed={fullName:'npm/@foxreis/tizentube',appName:'TizenTube',packageType:'mods',evaluateScriptOnDocumentStart:true,appPath:'https://youtube.com/tv?test=1'};
 ws.onmessage({data:JSON.stringify({type:4,payload:[{fullName:'gh/test/demo',appName:'Demo'},installed]})});
 assert.equal(messages[1].type,5);assert.equal(messages[1].payload.fullName,installed.fullName);
 assert.equal(nav.length,0,'wait for TizenBrew injection-ready response');
 ws.onmessage({data:JSON.stringify({type:5,payload:true})});
 assert.equal(nav[0],installed.appPath);assert.equal(notifications.length,0);
});
test('TizenTube does not open plain YouTube if the module is not installed',()=>{
 const code=block('function openTizenTube(){','function handleBack(e){');
 const notifications=[],nav=[],msgs=[];
 let ws;
 class WS{constructor(){ws=this;}send(s){msgs.push(JSON.parse(s));}close(){}}
 const open=vm.runInNewContext(code+'\nopenTizenTube;',{WebSocket:WS,window:{location:{set href(v){nav.push(v);}}},byId:()=>({pause(){}}),stopPair(){},notify:s=>notifications.push(s),setTimeout(){return 1;},clearTimeout(){}});
 open();ws.onopen();ws.onmessage({data:JSON.stringify({type:4,payload:[]})});
 assert.equal(msgs.length,1);assert.deepEqual(nav,[]);assert.match(notifications[0],/Chưa tìm thấy TizenTube/);
});
test('Player clears status on real playback and does not keep old autoplay warning',()=>{
 const code=block("byId('video').onplaying=function()", "window.addEventListener('keydown',");
 const status={textContent:'Không tự phát được',hidden:false};
 const cls={present:false,add(x){if(x==='is-playing')this.present=true;},remove(x){if(x==='is-playing')this.present=false;}};
 const video={paused:false,readyState:4};
 const byId=id=>({video,player:{classList:cls},playerStatus:status})[id];
 const setPlayerStatus=msg=>{status.textContent=msg||'';status.hidden=!msg;};
 vm.runInNewContext(code,{byId,setPlayerStatus,playbackEngine:'html5',playbackSerial:7,playbackReady:()=>{cls.add('is-playing');setPlayerStatus('');}});
 video.onplaying();assert.equal(status.hidden,true);assert.equal(cls.present,true);
 status.textContent='Lỗi cũ';status.hidden=false;video.ontimeupdate();
 assert.equal(status.hidden,true);
 video.onpause();assert.equal(cls.present,false);
});
test('Main script remains syntactically valid and playback events are wired',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 scripts.forEach(s=>assert.doesNotThrow(()=>new vm.Script(s[1])));
 assert.match(html,/onplaying=function\(\)\{if\(playbackEngine==='html5'\)playbackReady\(playbackSerial\);\}/);
 assert.match(html,/ontimeupdate=function\(\)/);
 assert.match(html,/function startAvplay\(channel,token\)/);assert.match(html,/api\.prepareAsync\(/);assert.match(html,/fallbackFromAvplay\(/);
});

test('Home D-pad keeps vertical movement within the list and returns to the selected channel from actions',()=>{
 const button=(kind,name)=>({dataset:{[kind]:name},getClientRects(){return [{}];},
  focus(){document.activeElement=this;},scrollIntoView(){}});
 const search=button('id','search'),add=button('id','add'),theme=button('id','theme');
 const live=button('nav','all'),favorites=button('nav','favorites');
 const all=button('groupName','Tất cả'),sports=button('groupName','Thể thao');
 const first=button('channelId','one'),second=button('channelId','two'),more=button('id','more');
 const watch=button('id','watch'),fav=button('id','fav');
 const zones={
  '#app .toolbar button':[search,add,theme],
  '#app .nav button':[live,favorites],
  '#groups button':[all,sports],
  '#channels button,#empty button,#more':[first,second,more],
  '#app .actions button':[watch,fav]
 };
 const document={activeElement:live,querySelectorAll:selector=>zones[selector]};
 const context={document,section:'all',group:'Tất cả',selected:{id:'one'}};
 const move=vm.runInNewContext(block('function homeButtons(selector){','function move(key){')+'\nmoveHome;',context);
 const step=(key,expected)=>{move('Arrow'+key);assert.equal(document.activeElement,expected);};
 step('Right',first);
 step('Up',all);
 step('Right',sports);
 step('Down',first);
 step('Down',second);
 context.selected={id:'two'};
 step('Right',watch);
 step('Down',fav);
 step('Left',second);
 step('Down',more);
 step('Left',live);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
function extract(from,to){
 const a=html.indexOf(from),b=html.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'Missing '+from);
 return html.slice(a,b);
}
const focusCode=extract("var focusStorageKey=","function select(c){");
const pickerCode=extract("var pickerGroup='Tất cả',pickerIndex=0,pickerChannels=[],pickerHideTimer=null;","function closePlayer(){");
function harness(){
 const timers=new Map(),delays=[];let timerId=0;
 const channels=Array.from({length:45},(_,i)=>({
   id:'c'+(i+1),name:'Kênh '+(i+1),
   group:i<24?'Tin tức':'Thể thao',
   url:'https://example.com/'+(i+1)+'.m3u8'
 }));
 const playing=channels[10],played=[],selected=[],focused=[];
 const el=(tag,cls,text)=>({
   tag,className:cls||'',textContent:text||'',children:[],type:'',
   appendChild(node){this.children.push(node);return node;},
   scrollIntoView(){},
   focus(){focused.push(this)}
 });
 const els={
   player:{hidden:false,focus(){focused.push('player')}},
   channelPicker:{hidden:true,focus(){focused.push('picker')}},
   pickerGroups:{children:[],appendChild(node){this.children.push(node);},replaceChildren(){this.children=[];}},
   pickerList:{children:[],appendChild(node){this.children.push(node);},replaceChildren(){this.children=[];}},
   pickerInfo:{textContent:''}
 };
 const ctx={
   items:channels,playing,byId:id=>els[id],elem:el,
   setTimeout(fn,delay){const id=++timerId;timers.set(id,fn);delays.push(delay);return id;},
   clearTimeout(id){timers.delete(id);},
   localStorage:{getItem(){return null;},setItem(){}},
   select:ch=>selected.push(ch.id),play:ch=>{played.push(ch.id);ctx.playing=ch;}
 };
 const picker=vm.runInNewContext(focusCode+pickerCode+'\n({openChannelPicker,closeChannelPicker,pickerMove,confirmPickerChannel,pickerSetGroup,pickerGroupsAll,renderChannelPicker,current:()=>({pickerGroup,pickerIndex,pickerChannels,lastPickerPosition})});',ctx);
 return {picker,els,channels,played,selected,ctx,focused,timers,delays};
}
test('Full-screen player opens a real picker with the playing channel highlighted without switching',()=>{
 const s=harness();
 assert.equal(s.picker.openChannelPicker(),true);
 assert.equal(s.els.channelPicker.hidden,false);
 assert.deepEqual(s.delays,[3000],'picker should auto-hide after three seconds');
 assert.match(s.els.pickerInfo.textContent,/11 \/ 45 kênh/);
 assert.equal(s.els.pickerList.children.length,21,'large playlists render a small window');
 assert.equal(s.played.length,0,'opening picker must not switch channels');
 assert.ok(s.els.pickerList.children.some(row=>row.className.includes('active')));
});
test('Picker inactivity closes the overlay after three seconds and remote input restarts the timer',()=>{
 const s=harness();s.picker.openChannelPicker();
 const firstTimer=[...s.timers.keys()][0];
 s.picker.pickerMove('ArrowDown');
 assert.equal(s.timers.has(firstTimer),false,'activity clears the previous deadline');
 assert.deepEqual(s.delays,[3000,3000,200]);
 const currentTimer=[...s.timers.keys()][0];
 const expire=s.timers.get(currentTimer);s.timers.delete(currentTimer);expire();
 assert.equal(s.els.channelPicker.hidden,true,'inactivity hides the picker');
 assert.equal(s.focused.at(-1),'player','auto-hide returns focus to video');
 assert.equal(s.timers.size,0);
});
test('Up/Down highlights immediately and plays only after 200 ms idle',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowDown');
 assert.equal(s.picker.current().pickerChannels[s.picker.current().pickerIndex].id,'c12');
 assert.deepEqual(s.played,[],'one arrow event must not open the stream immediately');
 assert.deepEqual(s.selected,['c12']);
 assert.ok(s.delays.includes(200));
 const first=[...s.timers.entries()].at(-1);
 s.picker.pickerMove('ArrowDown');
 assert.equal(s.timers.has(first[0]),false,'rapid input clears pending tune');
 s.picker.pickerMove('ArrowUp');
 const last=[...s.timers.entries()].at(-1);
 last[1]();
 assert.deepEqual(s.played,['c12'],'only last channel starts');
 assert.equal(s.els.channelPicker.hidden,false);
 assert.equal(s.picker.confirmPickerChannel(),true);
 assert.deepEqual(s.played,['c12'],'OK must not reopen the playing stream');
});

test('Left/Right switches folders and keeps group-specific channels',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowRight');
 assert.equal(s.picker.current().pickerGroup,'Tin tức');
 assert.equal(s.picker.current().pickerChannels.length,24);
 s.picker.pickerMove('ArrowRight');
 assert.equal(s.picker.current().pickerGroup,'Thể thao');
 assert.equal(s.picker.current().pickerChannels.length,21);
 s.picker.pickerMove('ArrowLeft');
 assert.equal(s.picker.current().pickerGroup,'Tin tức');
 assert.equal(s.played.length,0);
});
test('Back closes picker without undoing the newly playing channel',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowDown');s.picker.closeChannelPicker();
 assert.equal(s.els.channelPicker.hidden,true);
 assert.equal(s.els.player.hidden,false);
 assert.equal(s.ctx.playing.id,'c12');
 assert.deepEqual(s.played,['c12']);
 assert.equal(s.focused.at(-1),'player');
});

test('First remote Up/Down both opens picker and changes channel immediately',()=>{
 const code=extract('function keyHandler(e){',"document.querySelectorAll('[data-nav]')");
 const s=harness(),calls={open:[],move:[],change:0,confirm:0};
 const byId=id=>({modal:{hidden:true},player:{hidden:false},channelPicker:s.els.channelPicker})[id];
 const fn=vm.runInNewContext(code+'\nkeyHandler;',{
  byId,isRemoteBack:()=>false,handleBack(){},
  openChannelPicker:anchor=>{calls.open.push(anchor);s.els.channelPicker.hidden=false;return true;},
  pickerMove:k=>calls.move.push(k),confirmPickerChannel:()=>{calls.confirm++;},
  changeChannel:()=>{calls.change++;},togglePlayback(){},move(){}
 });
 for(const [key,keyCode] of [['ArrowUp',38],['ArrowDown',40],['ArrowLeft',37],['ArrowRight',39]]){
  s.els.channelPicker.hidden=true;
  fn({key,keyCode,preventDefault(){},stopPropagation(){}});
 }
 assert.deepEqual(calls.open,[true,true,false,false]);
 assert.deepEqual(calls.move,['ArrowUp','ArrowDown']);
 assert.equal(calls.change,0);
 fn({key:'ArrowDown',keyCode:40,preventDefault(){},stopPropagation(){}});
 assert.deepEqual(calls.move,['ArrowUp','ArrowDown','ArrowDown']);
 fn({key:'Enter',keyCode:13,preventDefault(){}});
 assert.equal(calls.confirm,1);
});
test('First Up/Down anchors to currently playing channel, ignoring stale picker selection',()=>{
 const s=harness();
 s.picker.openChannelPicker();s.picker.pickerMove('ArrowDown');s.picker.closeChannelPicker();
 s.ctx.playing=s.channels[30];
 s.picker.openChannelPicker(true);
 assert.equal(s.picker.current().pickerGroup,'Tất cả');
 assert.equal(s.picker.current().pickerChannels[s.picker.current().pickerIndex].id,'c31');
 s.picker.pickerMove('ArrowUp');
 const pending=[...s.timers.entries()].at(-1);
 pending[1]();
 assert.equal(s.played.at(-1),'c30');
 assert.equal(s.els.channelPicker.hidden,false);
});

test('Samsung duplicate Back events cannot leave app after closing picker or player',()=>{
 const code=extract('function handleBack(e){','function keyHandler(e){');
 const state={modal:false,picker:true,player:true};
 const calls={picker:0,player:0,exit:0};
 let now=1000;
 const fn=vm.runInNewContext('var lastBackEventAt=0;\n'+code+'\nhandleBack;',{
  Date:{now:()=>now},
  byId:id=>({modal:{get hidden(){return !state.modal;}},channelPicker:{get hidden(){return !state.picker;}},player:{get hidden(){return !state.player;}}})[id],
  closeDialog(){},closeChannelPicker(){state.picker=false;calls.picker++;},
  closePlayer(){state.player=false;calls.player++;},
  exitModule(){calls.exit++;}
 });
 const event={preventDefault(){},stopImmediatePropagation(){}};
 fn(event);assert.deepEqual(calls,{picker:1,player:0,exit:0});
 now+=140;fn(event);assert.deepEqual(calls,{picker:1,player:0,exit:0});
 now+=800;fn(event);assert.deepEqual(calls,{picker:1,player:1,exit:0});
 now+=110;fn(event);assert.deepEqual(calls,{picker:1,player:1,exit:0});
 now+=900;fn(event);assert.equal(calls.exit,1);
});
test('HTML picker is inside the player and announces remote navigation',()=>{
 const a=html.indexOf('<div id="player"'),b=html.indexOf('<div id="toast"',a);
 const markup=html.slice(a,b);
 assert.match(markup,/id="channelPicker" hidden tabindex="-1"/);
 assert.match(markup,/id="pickerGroups"/);
 assert.match(markup,/id="pickerList"/);
 assert.match(markup,/Back Đóng danh sách/);
 assert.match(html,/↑ ↓ Chuyển ngay và hiện danh sách/);
});


test('Closing and reopening channel picker remembers the last highlighted channel',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowDown');
 assert.equal(s.picker.current().lastPickerPosition.id,'c12');
 s.picker.closeChannelPicker();
 s.picker.openChannelPicker();
 assert.equal(s.picker.current().pickerChannels[s.picker.current().pickerIndex].id,'c12');
 s.picker.pickerMove('ArrowRight');
 assert.equal(s.picker.current().lastPickerPosition.group,'Tin tức');
 s.picker.closeChannelPicker();s.picker.openChannelPicker();
 assert.equal(s.picker.current().pickerGroup,'Tin tức');
});

test('Full-screen picker provides sofa-readable sizes instead of tiny controls',()=>{
 const start=html.indexOf('/* TV picker large-type override:');
 const end=html.indexOf('.playerdiag{position:absolute;',start);
 assert.ok(start>=0&&end>start);
 const css=html.slice(start,end);
 for(const selector of ['#channelPicker .picker-panel','#channelPicker .picker-heading',
 '#channelPicker .picker-info','#channelPicker .picker-groups button',
 '#channelPicker .picker-row','#channelPicker .picker-row.active',
 '#channelPicker .picker-row .picker-onair','#channelPicker .picker-help']){
  assert.ok(css.includes(selector),'large-size rule for '+selector);
 }
 for(const size of ['width:min(920px,57vw)','font-size:39px','font-size:29px',
  'min-height:78px','font-size:23px','font-size:21px','@media(max-width:1350px)',
  '@media(max-height:620px)','min-height:56px']){
  assert.ok(css.includes(size),'missing TV scale rule '+size);
 }
 assert.ok(html.includes('<div class="picker-help" aria-label="Phím điều khiển TV">'));
 assert.ok(html.includes('<b>↑ ↓</b> Phát kênh ngay'));
 assert.ok(html.includes('<b>← →</b> Đổi thư mục'));
 assert.ok(html.includes('<b>OK/Back Đóng danh sách</b>'));
});
test('Picker keeps the 3-second auto-hide and delayed 200ms playback',()=>{
 const s=harness();s.picker.openChannelPicker();
 assert.deepEqual(s.delays,[3000]);
 s.picker.pickerMove('ArrowDown');
 assert.deepEqual(s.delays,[3000,3000,200]);
 assert.deepEqual(s.played,[]);
 const pending=[...s.timers.entries()].at(-1);
 pending[1]();
 assert.deepEqual(s.played,['c12']);
 assert.equal(s.els.channelPicker.hidden,false);
});

test('Switching folder cancels tuning queued for a previous folder',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowDown');
 s.picker.pickerMove('ArrowRight');
 assert.equal(s.picker.current().pickerGroup,'Tin tức');
 s.picker.closeChannelPicker();
 assert.deepEqual(s.played,[],'old folder channel never starts');
});

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
const pickerCode=extract("var pickerGroup='Tất cả',pickerIndex=0,pickerChannels=[];","function closePlayer(){");
function harness(){
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
   localStorage:{getItem(){return null;},setItem(){}},
   select:ch=>selected.push(ch.id),play:ch=>played.push(ch.id)
 };
 const picker=vm.runInNewContext(focusCode+pickerCode+'\n({openChannelPicker,closeChannelPicker,pickerMove,confirmPickerChannel,pickerSetGroup,pickerGroupsAll,renderChannelPicker,current:()=>({pickerGroup,pickerIndex,pickerChannels,lastPickerPosition})});',ctx);
 return {picker,els,channels,played,selected,ctx,focused};
}
test('Full-screen player opens a real picker with the playing channel highlighted without switching',()=>{
 const s=harness();
 assert.equal(s.picker.openChannelPicker(),true);
 assert.equal(s.els.channelPicker.hidden,false);
 assert.match(s.els.pickerInfo.textContent,/11 \/ 45 kênh/);
 assert.equal(s.els.pickerList.children.length,21,'large playlists render a small window');
 assert.equal(s.played.length,0,'opening picker must not switch channels');
 assert.ok(s.els.pickerList.children.some(row=>row.className.includes('active')));
});
test('Up/Down changes highlighted channel and OK selects one channel',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowDown');
 assert.equal(s.picker.current().pickerChannels[s.picker.current().pickerIndex].id,'c12');
 assert.equal(s.played.length,0,'D-pad selection must not trigger playback');
 assert.equal(s.picker.confirmPickerChannel(),true);
 assert.deepEqual(s.selected,['c12']);
 assert.deepEqual(s.played,['c12']);
 assert.equal(s.els.channelPicker.hidden,true);
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
test('Closing picker returns to fullscreen without changing currently playing channel',()=>{
 const s=harness();s.picker.openChannelPicker();
 s.picker.pickerMove('ArrowDown');s.picker.closeChannelPicker();
 assert.equal(s.els.channelPicker.hidden,true);
 assert.equal(s.els.player.hidden,false);
 assert.equal(s.played.length,0);
 assert.equal(s.focused.at(-1),'player');
});
test('Every remote arrow opens picker; subsequent arrows navigate, never play directly',()=>{
 const code=extract('function keyHandler(e){',"document.querySelectorAll('[data-nav]')");
 const s=harness(),calls={open:0,move:[],change:0,confirm:0};
 const byId=id=>({modal:{hidden:true},player:{hidden:false},channelPicker:s.els.channelPicker})[id];
 const fn=vm.runInNewContext(code+'\nkeyHandler;',{
   byId,isRemoteBack:()=>false,handleBack(){},
   openChannelPicker(){calls.open++;s.els.channelPicker.hidden=false;},
   pickerMove:k=>calls.move.push(k),confirmPickerChannel:()=>{calls.confirm++;},
   changeChannel:()=>{calls.change++;},togglePlayback(){},move(){}
 });
 for(const [key,keyCode] of [['ArrowUp',38],['ArrowDown',40],['ArrowLeft',37],['ArrowRight',39]]){
   s.els.channelPicker.hidden=true;
   fn({key,keyCode,preventDefault(){},stopPropagation(){}});
 }
 assert.equal(calls.open,4);
 assert.equal(calls.change,0);
 fn({key:'ArrowDown',keyCode:40,preventDefault(){},stopPropagation(){}});
 assert.deepEqual(calls.move,['ArrowDown']);
 fn({key:'Enter',keyCode:13,preventDefault(){}});
 assert.equal(calls.confirm,1);
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
 assert.match(html,/↑ ↓ ← → Mở danh sách kênh/);
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

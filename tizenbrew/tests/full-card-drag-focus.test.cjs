'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const phone=fs.readFileSync(path.join(root,'tizenbrew/phone.html'),'utf8');
const tv=fs.readFileSync(path.join(root,'tizenbrew/index.html'),'utf8');

function section(text,begin,end){
  const start=text.indexOf(begin),stop=text.indexOf(end,start+begin.length);
  assert.ok(start>=0&&stop>start,'missing '+begin);
  return text.slice(start,stop);
}
function classes(names){
  const values=new Set(names.split(' ').filter(Boolean));
  return {contains:x=>values.has(x),add:(...v)=>v.forEach(x=>values.add(x)),remove:(...v)=>v.forEach(x=>values.delete(x))};
}
function row(kind,group,id,index){
  return {
    classList:classes(kind),
    dataset:{group,channelId:id||'',index:String(index||0)},
    getBoundingClientRect:()=>({top:250,height:100})
  };
}
function setup(){
  const listeners={},timers=[],sent=[];
  const channelOne=row('mobile-channel','Tin tức','c1',0);
  const channelTwo=row('mobile-channel','Tin tức','c2',1);
  const folderHead=row('folder-header','Thể thao','',0);
  const folderBlock={classList:classes('folder-block'),querySelector:()=>folderHead};
  const managed={
    managerPanel:{hidden:false},
    channelList:{contains:x=>[channelOne,channelTwo,folderHead].includes(x)}
  };
  const doc={
    addEventListener:(name,fn)=>{listeners[name]=fn;},
    elementFromPoint:()=>channelTwo,
    createElement:()=>({classList:classes(''),style:{},setAttribute(){},parentNode:{removeChild(){}}}),
    body:{appendChild(){}}
  };
  const context={
    document:doc,window:{innerWidth:390,innerHeight:844,scrollBy(){}},
    navigator:{},online:true,busy:false,selectionMode:false,
    byId:id=>managed[id],
    channelViews:[{id:'c1',index:0,name:'Kênh 1'},{id:'c2',index:1,name:'Kênh 2'}],
    setTimeout:(fn,delay)=>{const task={fn,delay};timers.push(task);return task;},
    clearTimeout:()=>{},setInterval:()=>99,clearInterval:()=>{},
    command:async(action,data)=>{sent.push({action,data});return {ok:true};}
  };
  const code=section(phone,'/* Same touch model as Web Mobile:',"document.addEventListener('touchcancel',dragClear,true);");
  const inspect=vm.runInNewContext(code+'\n({current:()=>dragGesture});',context);
  return {listeners,timers,sent,inspect,channelOne,channelTwo,folderHead,folderBlock,doc};
}
function target(card){
  return {closest:selector=>selector.includes('.mobile-channel')?card:null};
}
function event(type,targetElement,x=100,y=200){
  const touch={identifier:1,clientX:x,clientY:y};
  return {target:targetElement,touches:[touch],changedTouches:[touch],cancelable:true,preventDefault(){this.defaultPrevented=true}};
}

test('0.5s hold starts from any nested channel control, not just channel head',()=>{
  for(const position of ['favorite','move','more','edit','body']){
    const s=setup();
    const inner=target(s.channelOne);
    s.listeners.touchstart(event('touchstart',inner));
    assert.equal(s.timers[0].delay,500,position);
    s.timers[0].fn();
    assert.equal(s.inspect.current().active,true,position);
    assert.equal(s.inspect.current().source,s.channelOne,position);
  }
});
test('quick vertical swipe cancels pending hold so scrolling stays available',()=>{
  const s=setup(),inner=target(s.channelOne);
  s.listeners.touchstart(event('touchstart',inner,100,200));
  s.listeners.touchmove(event('touchmove',inner,100,230));
  assert.equal(s.inspect.current(),null);
});
test('channel can be dragged onto a different channel',async()=>{
  const s=setup(),inner=target(s.channelOne);
  s.listeners.touchstart(event('touchstart',inner,100,200));
  s.timers[0].fn();
  s.listeners.touchmove(event('touchmove',inner,120,330));
  s.listeners.touchend(event('touchend',inner,120,330));
  assert.equal(s.sent.length,1);
  assert.equal(s.sent[0].action,'relocate-channel');
  assert.equal(s.sent[0].data.channelId,'c1');
  assert.equal(s.sent[0].data.anchorId,'c2');
});
test('folder can be held from its blank body, without touching a dedicated button',()=>{
  const s=setup();
  const inner={closest:()=>s.folderBlock};
  s.listeners.touchstart(event('touchstart',inner));
  assert.equal(s.timers[0].delay,500);
  s.timers[0].fn();
  assert.equal(s.inspect.current().kind,'folder');
  assert.equal(s.inspect.current().source,s.folderHead);
});
test('all of folder/channel card disables iOS native callout during hold',()=>{
  assert.match(phone,/\.folder-block,\.folder-header,\.channel\.mobile-channel,\.channel\.mobile-channel \*\{-webkit-user-select:none/);
  assert.match(phone,/event\.target\.closest\('\.mobile-channel,\.folder-header,\.folder-block'\)/);
  assert.doesNotMatch(phone,/if\(!folder&&!event\.target\.closest\('\.channel-head'\)\)return/);
});
test('Samsung source dialog initially focuses a button rather than URL input',()=>{
  const calls=[],timers=[];
  const elements={
    modal:{hidden:true,firstElementChild:{classList:{toggle(){}}}},
    sourceDialog:{hidden:false},searchDialog:{hidden:true},
    dialogTitle:{textContent:''},toSourceUrl:{focus:()=>calls.push('button')},
    sourceUrl:{focus:()=>calls.push('keyboard')},
    searchInput:{focus:()=>calls.push('search')}
  };
  const code=section(tv,'function openDialog(kind){','function setRightsChecked(on){');
  const open=vm.runInNewContext(code+'\nopenDialog;',{
    byId:id=>elements[id],setRightsChecked(){},
    openPair(){return Promise.resolve();},stopPair(){},
    setTimeout:fn=>{timers.push(fn);}
  });
  open('source');timers.shift()();
  assert.deepEqual(calls,['button']);
  open('search');timers.shift()();
  assert.deepEqual(calls,['button','search']);
});

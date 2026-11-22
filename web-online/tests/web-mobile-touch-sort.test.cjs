'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('web-mobile-touch-sort.js'),order=require('../../channel-order.js');
function fixture(){
 const store={channels:[
  {id:'vtv1',name:'VTV1',group:'VTV',sourceId:'s1',url:'https://iptv.test/vtv1'},
  {id:'vtv2',name:'VTV2',group:'VTV',sourceId:'s1',url:'https://iptv.test/vtv2'},
  {id:'htv7',name:'HTV7',group:'HTV',sourceId:'s2',url:'https://iptv.test/htv7'}
 ],sources:[{id:'s1'},{id:'s2'}],favorites:['vtv1'],snapshots:{'https://iptv.test/vtv1':'snapshot'},
  groupOrder:['VTV','HTV','Trống'],channelOrder:{VTV:['vtv1','vtv2'],HTV:['htv7']},
  collapsedGroups:['HTV'],folders:['Trống']};
 const handlers={},registered={},stats={saved:0,rendered:0,toasts:[],canSave:true},timers=new Map();
 let timeoutIndex=0,now=0,hover=null;
 function classList(classes){const c=new Set(classes);return{contains:k=>c.has(k),add:k=>c.add(k),remove:(...args)=>args.forEach(x=>c.delete(x))}}
 const nodes={};
 function element(id){return nodes[id]||(nodes[id]={id,contains:()=>true,querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,bottom:400}),
  scrollHeight:200,clientHeight:100,scrollTop:0});}
 const doc={documentElement:{dataset:{iptvDevice:'mobile'}},body:{append(){}},
  getElementById:element,querySelector:()=>null,
  elementFromPoint:()=>hover,
  createElement:tag=>({tag,classList:classList([]),style:{},remove(){},setAttribute(){}}),
  addEventListener:(n,fn,options)=>{(registered[n]||=[]).push({fn,options});handlers[n]=e=>(registered[n]||[]).slice().forEach(x=>x.fn(e));},
  removeEventListener:(n,fn)=>{registered[n]=(registered[n]||[]).filter(x=>x.fn!==fn);}
 };
 const win={IPTVState:{getStore:()=>store,save(){stats.saved++;return stats.canSave},
  render(){stats.rendered++},toast:(...a)=>stats.toasts.push(a)},
  OpenIPTVChannelOrder:order,IPTVProAdvanced:{canEdit:()=>true},
  addEventListener(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){},
  setTimeout(cb,ms){const n=++timeoutIndex;timers.set(n,{cb,at:now+ms});return n},
  clearTimeout(n){timers.delete(n)},navigator:{}};
 vm.runInNewContext(source,{document:doc,window:win},{timeout:5000});
 function row(kind,id){
  const isChannel=kind==='channel';
  const node={dataset:isChannel?{channelId:id,group:store.channels.find(x=>x.id===id).group}:{group:id},
   classList:classList([isChannel?'channel-item':'folder-header']),
   getBoundingClientRect:()=>({top:0,bottom:90,height:90}),contains:x=>x===node,
   closest(query){if(query.includes('channel-item')||query.includes('folder-header'))return node;return query.includes('button')&&!isChannel?node:null}};
  return node;
 }
 function touch(type,source,x=15,y=15,{identifier=17,multi=false}={}){
  const t={identifier,clientX:x,clientY:y};
  const e={target:source,touches:type==='touchend'?[]:multi?[t,t]:[t],changedTouches:[t],cancelable:true,
   prevented:false,preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true}};
  handlers[type](e);return e;
 }
 function tick(ms){now+=ms;for(const [i,t]of [...timers])if(t.at<=now){timers.delete(i);t.cb()}}
 return {store,stats,win,doc,handlers,registered,row,touch,tick,setHover:x=>hover=x,timers};
}
test('channel reorder uses the existing store without changing source/favorites/snapshot',()=>{
 const f=fixture(),saved=JSON.stringify({sources:f.store.sources,favorites:f.store.favorites,snapshots:f.store.snapshots});
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitChannel('vtv2',{group:'VTV',anchorId:'vtv1',after:false}),true);
 assert.deepEqual([...f.store.channelOrder.VTV],['vtv2','vtv1']);
 assert.equal(JSON.stringify({sources:f.store.sources,favorites:f.store.favorites,snapshots:f.store.snapshots}),saved);
});
test('long press 800ms on a full channel row, then drag into folded folder',()=>{
 const f=fixture(),start=f.row('channel','vtv1'),target=f.row('folder','HTV');
 f.setHover(target);
 f.touch('touchstart',start);
 f.tick(799);
 assert.equal(f.timers.size,1);
 f.tick(1);
 const move=f.touch('touchmove',start,40,35);
 assert.equal(move.prevented,true);
 const end=f.touch('touchend',start,40,35);
 assert.equal(end.prevented,true);
 assert.equal(f.store.channels[0].group,'HTV');
 assert.deepEqual([...f.store.channelOrder.HTV],['htv7','vtv1']);
 assert.equal(f.store.collapsedGroups.includes('HTV'),false);
 assert.equal(f.stats.saved,1);
 const click={target:start,prevented:false,preventDefault(){this.prevented=true},stopImmediatePropagation(){}};
 f.handlers.click(click);assert.equal(click.prevented,true);
});
test('short tap and finger swipe before 0.8s never sort nor block default scroll',()=>{
 const f=fixture(),r=f.row('channel','vtv2');
 f.touch('touchstart',r);
 f.tick(450);
 const end=f.touch('touchend',r);
 assert.equal(end.prevented,false);
 f.tick(500);assert.equal(f.stats.saved,0);
 f.touch('touchstart',r);
 assert.ok(f.registered.touchmove.some(x=>x.options.passive===true),'channel touchmove must remain passive');
 const move=f.touch('touchmove',r,45,90);
 assert.equal(move.prevented,false);
 f.tick(1000);
 assert.equal(f.stats.saved,0);
});
test('long press on folder header itself reorders folders without adding controls',()=>{
 const f=fixture(),from=f.row('folder','VTV'),to=f.row('folder','HTV');
 f.setHover(to);
 f.touch('touchstart',from);f.tick(800);f.touch('touchmove',from,40,70);f.touch('touchend',from,40,70);
 assert.deepEqual([...f.store.groupOrder],['HTV','VTV','Trống']);
 assert.equal(f.stats.saved,1);
});
test('touch on interactive star button cannot drag a channel',()=>{
 const f=fixture(),r=f.row('channel','vtv1');
 const btn={closest(selector){if(selector.includes('channel-item'))return r;return btn}};
 f.touch('touchstart',btn);f.tick(900);
 assert.equal(f.timers.size,0);assert.equal(f.stats.saved,0);
});
test('storage failure reverts channel and folder moves',()=>{
 const f=fixture();f.stats.canSave=false;
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitChannel('vtv1',{group:'HTV',anchorId:'htv7'}),false);
 assert.deepEqual([...f.store.channelOrder.VTV],['vtv1','vtv2']);
 assert.equal(f.store.channels[0].group,'VTV');
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitFolder('VTV',{group:'HTV',after:true}),false);
 assert.deepEqual([...f.store.groupOrder],['VTV','HTV','Trống']);
});
test('Web-only CSS contains no visible three-bar grip and leaves touch scrolling enabled',()=>{
 const html=read('index.html'),builder=read('web-online/prepare-web.py'),css=read('web-mobile-touch-sort.css');
 assert.match(source,/HOLD_MS=800/);
 assert.doesNotMatch(source,/folder-sort-grip|setPointerCapture|pointerdown/);
 assert.match(css,/#channelList \.channel-move\{\s*display:none!important/);
 assert.match(css,/touch-action:pan-y!important/);
 assert.doesNotMatch(css,/\.folder-sort-grip/);
 for(const [asset,version] of [['web-mobile-touch-sort.css','header-page-scroll-20261122d'],['web-mobile-touch-sort.js','header-swipe-page-20261122e']]){
  const url=asset+'?v='+version;
  assert.ok(html.includes(url),url);
  assert.ok(builder.includes(url),url+' in build');
 }
 assert.match(builder,/copy2\(touch_sort_root \/ asset,out \/ asset\)/);
});

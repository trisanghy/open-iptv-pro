'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),source=fs.readFileSync(path.join(root,'web-mobile-touch-sort.js'),'utf8');
const order=require('../../channel-order.js');
function fixture(){
 const channels=[
  {id:'vtv1',name:'VTV1',group:'VTV',sourceId:'s1',url:'https://source.test/a'},
  {id:'vtv2',name:'VTV2',group:'VTV',sourceId:'s1',url:'https://source.test/b'},
  {id:'htv7',name:'HTV7',group:'HTV',sourceId:'s2',url:'https://source.test/c'}
 ];
 const store={channels,groupOrder:['VTV','HTV','Trống'],channelOrder:{VTV:['vtv1','vtv2'],HTV:['htv7']},folders:['Trống'],
  collapsedGroups:['HTV'],favorites:['vtv1'],snapshots:{'https://source.test/a':'stored'},sources:[{id:'s1'},{id:'s2'}]};
 const listeners={},stats={saved:0,rendered:0,toasts:[],canSave:true},nodes={};
 function elm(id){return nodes[id]||(nodes[id]={
  id,contains:()=>true,querySelectorAll:()=>[],addEventListener(){},getBoundingClientRect:()=>({top:0,bottom:400}),
  scrollHeight:200,clientHeight:100,scrollTop:0
 });}
 const doc={documentElement:{dataset:{iptvDevice:'mobile'}},body:{append(){}},
  getElementById:elm,querySelector:()=>null,querySelectorAll:()=>[],
  addEventListener:(n,fn)=>{listeners[n]=fn},elementFromPoint:()=>null,
  createElement:tag=>({tagName:tag,classList:{add(){},remove(){}},style:{},remove(){},setAttribute(){}})
 };
 const win={IPTVState:{getStore:()=>store,save:()=>{stats.saved++;return stats.canSave},
  render:()=>{stats.rendered++},toast:(...args)=>stats.toasts.push(args)},
  OpenIPTVChannelOrder:order,IPTVProAdvanced:{canEdit:()=>true},
  addEventListener(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},
  setTimeout:()=>0,clearTimeout(){},navigator:{}};
 class MutationObserver{observe(){}}
 vm.runInNewContext(source,{window:win,document:doc,MutationObserver},{timeout:3000});
 return {win,doc,store,stats,listeners};
}
test('touch channel reorder persists in same folder without touching source or favorites',()=>{
 const f=fixture(),before=JSON.stringify({sources:f.store.sources,favorites:f.store.favorites,snapshots:f.store.snapshots});
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitChannel('vtv2',{group:'VTV',anchorId:'vtv1',after:false}),true);
 assert.deepEqual([...f.store.channelOrder.VTV],['vtv2','vtv1']);
 assert.equal(f.store.channels.find(x=>x.id==='vtv2').group,'VTV');
 assert.equal(JSON.stringify({sources:f.store.sources,favorites:f.store.favorites,snapshots:f.store.snapshots}),before);
 assert.equal(f.stats.saved,1);assert.equal(f.stats.rendered,1);
});
test('move channel into a collapsed or empty folder and reveal it after drop',()=>{
 const f=fixture();
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitChannel('vtv1',{group:'HTV',anchorId:'htv7',after:true}),true);
 assert.deepEqual([...f.store.channelOrder.HTV],['htv7','vtv1']);
 assert.ok(!f.store.collapsedGroups.includes('HTV'));
 assert.equal(f.store.channels[0].group,'HTV');
 assert.equal(f.store.channels[0].url,'https://source.test/a');
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitChannel('vtv2',{group:'Trống',anchorId:'',after:false}),true);
 assert.deepEqual([...f.store.channelOrder.Trống],['vtv2']);
});
test('reorder folder before or after target with no redundant save',()=>{
 const f=fixture();
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitFolder('VTV',{group:'HTV',after:true}),true);
 assert.deepEqual([...f.store.groupOrder],['HTV','VTV','Trống']);
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitFolder('VTV',{group:'HTV',after:true}),false);
 assert.equal(f.stats.saved,1);
});
test('storage quota rollback restores channel group and order with no data loss',()=>{
 const f=fixture();f.stats.canSave=false;
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitChannel('vtv1',{group:'HTV',anchorId:'htv7',after:false}),false);
 assert.deepEqual([...f.store.channelOrder.VTV],['vtv1','vtv2']);
 assert.deepEqual([...f.store.channelOrder.HTV],['htv7']);
 assert.equal(f.store.channels[0].group,'VTV');
 assert.deepEqual([...f.store.collapsedGroups],['HTV']);
 assert.equal(f.win.OpenIPTVMobileTouchSort.commitFolder('VTV',{group:'HTV',after:true}),false);
 assert.deepEqual([...f.store.groupOrder],['VTV','HTV','Trống']);
 assert.equal(f.stats.rendered,1);assert.equal(f.stats.toasts.length,2);
});
test('touch sorting module registers delegated pointer handling but leaves tap/play untouched',()=>{
 const f=fixture();
 for(const name of ['pointerdown','pointermove','pointerup','pointercancel','click']){
  assert.equal(typeof f.listeners[name],'function');
 }
 assert.equal(f.win.OpenIPTVMobileTouchSort.isMobile(),true);
 f.doc.documentElement.dataset.iptvDevice='desktop';
 assert.equal(f.win.OpenIPTVMobileTouchSort.isMobile(),false);
 assert.match(source,/pointerType!=='touch'/);
 assert.match(source,/setPointerCapture/);
 assert.match(source,/280/);
 assert.match(source,/className='folder-sort-grip'/);
 assert.match(source,/getElementById\('channelList'\)/);
});
test('build installs Web-only touch gestures without editing Electron or native sources',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8'),
  css=fs.readFileSync(path.join(root,'web-mobile-touch-sort.css'),'utf8');
 for(const asset of ['web-mobile-touch-sort.css','web-mobile-touch-sort.js']){
  assert.ok(html.includes(asset+'?v=mobile-touch-sort-20261120a'));
  assert.ok(builder.includes(asset+'?v=mobile-touch-sort-20261120a'));
  assert.ok(builder.includes('copy2(touch_sort_root / asset,out / asset)'));
 }
 assert.match(css,/touch-action:none!important/);
 assert.match(css,/\.web-touch-sort-ghost/);
 assert.match(source,/api\.save\(\)/);
 assert.match(source,/api\.render\(true\)/);
});

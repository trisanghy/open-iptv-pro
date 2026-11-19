'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),chrome=process.env.TOUCH_SORT_CHROME;
const fixture=[
 '<!doctype html><html data-iptv-device="mobile"><head><meta name="viewport" content="width=device-width,initial-scale=1"/>',
 '<link rel="stylesheet" href="web-mobile-touch-sort.css"/>',
 '<style>body{background:#0b1520;color:white;font:16px system-ui;margin:0}',
 '#page-tv,#channelList{width:100%;max-width:600px}#channelList{height:660px;overflow-y:auto}',
 '.folder-header,.channel-item{position:relative;box-sizing:border-box;width:100%;min-height:85px;display:flex;align-items:center;border:1px solid #344;gap:12px;background:#112233;color:white}',
 '.folder-header .folder-size{margin-left:auto}.channel-item .channel-move{width:50px;height:50px}</style>',
 '</head><body><section id="page-tv"><div id="channelList">',
 '<button class="folder-header" data-group="VTV"><span>VTV</span><span class="folder-size">2</span></button>',
 '<div class="channel-item" data-channel-id="vtv1" data-group="VTV"><button class="channel-move" type="button">▤</button><b>VTV1</b></div>',
 '<div class="channel-item" data-channel-id="vtv2" data-group="VTV"><button class="channel-move" type="button">▤</button><b>VTV2</b></div>',
 '<button class="folder-header" data-group="HTV"><span>HTV</span><span class="folder-size">1</span></button>',
 '<div class="channel-item" data-channel-id="htv7" data-group="HTV"><button class="channel-move" type="button">▤</button><b>HTV7</b></div>',
 '</div></section><div id="folderManager"></div>',
 '<script src="channel-order.js"></script>',
 '<script>',
 'window.__case={saved:0,rendered:0,errors:[]};',
 'const store={channels:[',
 '{id:"vtv1",name:"VTV1",group:"VTV",sourceId:"s1",url:"https://example.invalid/a"},',
 '{id:"vtv2",name:"VTV2",group:"VTV",sourceId:"s1",url:"https://example.invalid/b"},',
 '{id:"htv7",name:"HTV7",group:"HTV",sourceId:"s1",url:"https://example.invalid/c"}',
 '],sources:[{id:"s1"}],favorites:["vtv1"],groupOrder:["VTV","HTV"],channelOrder:{VTV:["vtv1","vtv2"],HTV:["htv7"]},collapsedGroups:[],folders:[]};',
 'window.__store=store;',
 'window.IPTVState={getStore:()=>store,save(){window.__case.saved++;return true},',
 'render(){window.__case.rendered++},toast(msg){window.__case.errors.push(msg)}};',
 '</script><script src="web-mobile-touch-sort.js"></script>',
 '<script>',
 'const send=(target,type,x,y)=>target.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:"touch",pointerId:71,isPrimary:true,clientX:x,clientY:y,button:0}));',
 'window.addEventListener("load",async()=>{',
 'try{const grip=document.querySelector(".channel-item[data-channel-id=vtv1] .channel-move");',
 'const folderGrip=document.querySelector(".folder-header[data-group=VTV] .folder-sort-grip");',
 'const dest=document.querySelector(".folder-header[data-group=HTV]");',
 'if(!grip.dataset.touchSort||!folderGrip)throw Error("missing grips");',
 'if(getComputedStyle(grip).touchAction!=="none"||getComputedStyle(folderGrip).touchAction!=="none")throw Error("incorrect touch-action");',
 'const a=grip.getBoundingClientRect(),b=dest.getBoundingClientRect();',
 'send(grip,"pointerdown",a.left+15,a.top+15);',
 'await new Promise(resolve=>setTimeout(resolve,340));',
 'send(document,"pointermove",b.left+40,b.top+b.height/2);',
 'send(document,"pointerup",b.left+40,b.top+b.height/2);',
 'if(store.channels[0].group!=="HTV"||!store.channelOrder.HTV.includes("vtv1"))throw Error("channel not moved");',
 'if(!store.favorites.includes("vtv1")||store.channels[0].url!=="https://example.invalid/a")throw Error("data changed");',
 'if(window.__case.saved!==1||window.__case.rendered!==1)throw Error("save/render missing");',
 'document.body.dataset.touchSort="passed";',
 '}catch(e){document.body.dataset.touchSort="failed";document.body.dataset.error=String(e.message||e);}',
 '});',
 '</script></body></html>'
].join('\n');
for(const width of [390,820]){
 test('Chromium mobile '+width+'px long press drag handle moves channel to another folder',{skip:!chrome},()=>{
  const file=path.join(root,'_site','test-touch-sort-'+width+'.html');
  fs.writeFileSync(file,fixture);
  try{
   const output=execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files',
    '--virtual-time-budget=1100','--window-size='+width+',900','--dump-dom','file://'+file],
    {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000});
   assert.match(output,/data-touch-sort="passed"/,output.match(/data-error="[^"]*"/)?.[0]||'No test status');
  }finally{fs.unlinkSync(file);}
 });
}

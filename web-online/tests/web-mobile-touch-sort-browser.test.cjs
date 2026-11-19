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
 'const send=(target,type,x,y)=>{',
 ' const touch=new Touch({identifier:71,target:target,clientX:x,clientY:y});',
 ' const active=type==="touchend"?[]:[touch];',
 ' return target.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:active,targetTouches:active,changedTouches:[touch]}));',
 '};',
 'window.addEventListener("load",async()=>{',
 'try{',
 ' const channel=document.querySelector(".channel-item[data-channel-id=vtv1]");',
 ' const header=document.querySelector(".folder-header[data-group=VTV]");',
 ' const destination=document.querySelector(".folder-header[data-group=HTV]");',
 ' const oldMove=channel.querySelector(".channel-move");',
 ' if(document.querySelector(".folder-sort-grip"))throw Error("unexpected extra folder grip");',
 ' if(getComputedStyle(oldMove).display!=="none")throw Error("extra three-line channel box still shown");',
 ' if(getComputedStyle(channel).touchAction!=="pan-y")throw Error("normal swipe scrolling disabled");',
 ' const a=channel.getBoundingClientRect(),b=destination.getBoundingClientRect();',
 ' send(channel,"touchstart",a.left+80,a.top+30);',
 ' await new Promise(resolve=>setTimeout(resolve,830));',
 ' send(document,"touchmove",b.left+50,b.top+b.height/2);',
 ' send(document,"touchend",b.left+50,b.top+b.height/2);',
 ' if(store.channels[0].group!=="HTV"||!store.channelOrder.HTV.includes("vtv1"))throw Error("channel not moved");',
 ' if(!store.favorites.includes("vtv1")||store.channels[0].url!=="https://example.invalid/a")throw Error("data changed");',
 ' if(window.__case.saved!==1||window.__case.rendered!==1)throw Error("save/render missing");',
 ' document.body.dataset.touchSort="passed";',
 '}catch(e){document.body.dataset.touchSort="failed";document.body.dataset.error=String(e.message||e);}',
 '});',
 '</script></body></html>'
].join('\n');
for(const width of [390,820]){
 test('Chromium mobile '+width+'px: 800ms hold on full row moves channel; no extra grips',{skip:!chrome},()=>{
  const file=path.join(root,'_site','test-touch-sort-'+width+'.html');
  fs.writeFileSync(file,fixture);
  try{
   const output=execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files',
    '--virtual-time-budget=2200','--window-size='+width+',900','--dump-dom','file://'+file],
    {encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000});
   assert.match(output,/data-touch-sort="passed"/,output.match(/data-error="[^"]*"/)?.[0]||'No test status');
  }finally{fs.unlinkSync(file);}
 });
}

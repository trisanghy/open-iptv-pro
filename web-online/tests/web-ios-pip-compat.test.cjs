'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const pip=require(path.join(root,'web-ios-pip-compat.js'));

function fixture({ios=true,standalone=true,readyState=4,nativeSupport=false,nativeMethod=true,standardEnabled=true}={}){
 const handlers={},nodes={},calls={standard:0,native:[],legacy:0,toasts:[],events:[]};
 function element(tag){
  const result={tag,children:[],hidden:false,attrs:{},style:{},value:'',textContent:'',
   append(...items){this.children.push(...items)},
   setAttribute(k,v){this.attrs[k]=v},
   addEventListener(k,f){this['on'+k]=f},
   focus(){calls.focused=this},
   select(){calls.selected=true}
  };
  return result;
 }
 const video={readyState,webkitPresentationMode:'inline',
  requestPictureInPicture(){calls.standard++;return Promise.reject(Object.assign(new Error('unsupported'),{name:'NotSupportedError'}))},
  webkitSupportsPresentationMode:nativeMethod?kind=>{calls.probed=kind;return nativeSupport}:undefined,
  webkitSetPresentationMode:nativeMethod?mode=>{calls.native.push(mode);video.webkitPresentationMode=mode}:undefined};
 nodes.video=video;
 const doc={pictureInPictureEnabled:standardEnabled,
  documentElement:{lang:'vi'},
  body:{children:[],append(node){this.children.push(node);nodes[node.id]=node}},
  getElementById(id){return nodes[id]||null},
  createElement:element,
  addEventListener(name,handler,capture){handlers[name]=handler;calls.capture=capture}};
 const nav={userAgent:ios?'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15':'Mozilla/5.0 (Linux; Android 14)',
  standalone,maxTouchPoints:5,clipboard:{writeText:async value=>{calls.copied=value}}};
 const win={document:doc,navigator:nav,location:{origin:'https://trisanghy.github.io',
  pathname:'/open-iptv-pro/',search:'?token=topsecret&view=mobile'},
  matchMedia:()=>({matches:standalone}),IPTVState:{toast:(message,type)=>calls.toasts.push({message,type})}};
 const click=id=>{
  const state={id,prevented:false,stopped:false};
  handlers.click?.({target:{closest:selector=>selector.includes(id)?{id}:null},
   preventDefault(){state.prevented=true},
   stopImmediatePropagation(){state.stopped=true},
   stopPropagation(){state.stopped=true}});
  return state;
 };
 return {win,doc,video,calls,click,nodes};
}

test('WebKit PiP capability probe detects unsupported standalone iOS even when standard API lies',()=>{
 const f=fixture();
 assert.equal(pip.isIOS(f.win.navigator),true);
 assert.equal(pip.isStandalone(f.win),true);
 assert.equal(pip.capability(f.video,f.doc,f.win.navigator,f.win),'standalone-blocked');
 assert.equal(f.calls.probed,'picture-in-picture');
 assert.equal(f.calls.standard,0,'never attempt a PiP request from a passive capability test');
 assert.equal(pip.safeBrowserURL(f.win),'https://trisanghy.github.io/open-iptv-pro/?view=mobile');
 assert.ok(!pip.safeBrowserURL(f.win).includes('token'));
});

test('tap PiP on iOS Home Screen PWA opens local Safari guidance without calling unsupported API',()=>{
 const f=fixture();
 assert.equal(pip.install(f.win),true);
 assert.equal(f.calls.capture,true,'intercept at capture phase before features.js');
 const hit=f.click('pipBtn');
 assert.equal(hit.prevented,true);
 assert.equal(hit.stopped,true);
 assert.equal(f.calls.standard,0,'must not call known-broken requestPictureInPicture');
 assert.deepEqual(f.calls.native,[]);
 const overlay=f.nodes.webPipIOSHelp;
 assert.ok(overlay&&!overlay.hidden,'must show an actionable dialog');
 const card=overlay.children[0],actions=card.children[3];
 assert.ok(card.children[0].textContent.includes('PiP'));
 assert.match(card.children[1].textContent,/Safari/);
 assert.equal(actions.children[0].href,'https://trisanghy.github.io/open-iptv-pro/?view=mobile');
 assert.equal(actions.children[0].target,'_blank');
 assert.equal(actions.children[0].rel,'noopener noreferrer');
 assert.match(card.children[2].textContent,/danh sách kênh riêng/);
 assert.equal(card.children[5].value,'https://trisanghy.github.io/open-iptv-pro/?view=mobile');
 assert.equal(f.doc.body.children.length,1);
 const fullscreen=f.click('fsPipBtn');
 assert.equal(fullscreen.prevented,true,'fullscreen PiP must use the same safety path');
 assert.equal(f.doc.body.children.length,1,'reuse the same dialog');
 assert.equal(f.calls.standard,0,'do not pass through to legacy handler');
});

test('iPhone Safari uses native WebKit PiP when supported and toggles back to inline',()=>{
 const f=fixture({standalone:false,nativeSupport:true});
 assert.equal(pip.capability(f.video,f.doc,f.win.navigator,f.win),'webkit');
 assert.equal(pip.install(f.win),true);
 f.click('pipBtn');
 f.click('fsPipBtn');
 assert.deepEqual(f.calls.native,['picture-in-picture','inline']);
 assert.equal(f.calls.standard,0,'native WebKit should be preferred to standard API on iOS Safari');
 assert.equal(f.doc.body.children.length,0,'do not display a Safari workaround for working Safari');
});

test('Safari unsupported video shows a local warning; never pretends PiP succeeded',()=>{
 const f=fixture({standalone:false,nativeSupport:false});
 assert.equal(pip.capability(f.video,f.doc,f.win.navigator,f.win),'unsupported');
 assert.equal(pip.install(f.win),true);
 f.click('pipBtn');
 assert.equal(f.calls.standard,0);
 assert.equal(f.calls.toasts.length,1);
 assert.equal(f.calls.toasts[0].type,'warn');
 assert.equal(f.doc.body.children.length,0,'Safari already open, do not suggest opening Safari again');
});

test('not-ready video requests playback instead of triggering the unsupported API',()=>{
 const f=fixture({readyState:0,nativeSupport:true});
 assert.equal(pip.capability(f.video,f.doc,f.win.navigator,f.win),'not-ready');
 assert.equal(pip.install(f.win),true);
 f.click('pipBtn');
 assert.equal(f.calls.standard,0);
 assert.equal(f.calls.native.length,0);
 assert.equal(f.calls.toasts.length,1);
 assert.match(f.calls.toasts[0].message,/phát một kênh/);
});

test('Android, desktop and non-iOS PWAs retain original player PiP implementation',()=>{
 for(const standalone of [true,false]){
  const f=fixture({ios:false,standalone,nativeSupport:false});
  assert.equal(pip.isIOS(f.win.navigator),false);
  assert.equal(pip.install(f.win),false);
  assert.equal(f.calls.capture,undefined);
 }
 assert.equal(pip.isIOS({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',platform:'MacIntel',maxTouchPoints:5}),true,'detect iPad desktop UA');
 assert.equal(pip.isIOS({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',platform:'MacIntel',maxTouchPoints:0}),false);
});

test('PiP fallback offers native UI labels in all 17 languages',()=>{
 for(const lang of ['vi','en','es','pt-BR','zh-CN','th','lo','km','fr','de','it','ja','ko','ru','id','hi','ar']){
  const win={document:{documentElement:{lang}},navigator:{}};
  for(const key of ['title','body','open','copy','close','copied','manual','storage','playFirst','unsupported','failure','safari']){
   assert.ok(pip.text(win,key).trim(),lang+' PiP text missing '+key);
  }
 }
});

test('PiP compatibility module is Web-only, cache-busted and preserved by prepare-web.py',()=>{
 const app=read('index.html'),builder=read('web-online/prepare-web.py');
 assert.equal(read('web-ios-pip-compat.js'),read('web-online/web-ios-pip-compat.js'));
 assert.equal(read('web-ios-pip-compat.css'),read('web-online/web-ios-pip-compat.css'));
 assert.ok(app.includes('src="web-ios-pip-compat.js?v=autopip-crossbrowser-20261120a"'));
 assert.ok(app.includes('href="web-ios-pip-compat.css?v=ios-pwa-pip-20261119a"'));
 assert.ok(builder.includes("for asset in ('web-ios-pip-compat.js','web-ios-pip-compat.css')"));
 assert.ok(builder.includes('web-ios-pip-compat.js?v=ios-pwa-pip-20261119a'));
 assert.ok(builder.includes('web-ios-pip-compat.css?v=ios-pwa-pip-20261119a'));
 assert.ok(app.indexOf('web-ios-pip-compat.js?v=')>app.indexOf('features.js?v='));
 assert.match(read('web-fullscreen-controls.js'),/fsPipBtn[\s\S]{0,100}pipBtn/);
 assert.doesNotMatch(read('web-ios-pip-compat.js'),/localStorage\.setItem|sessionStorage\.setItem|new URL\(.*token/);
 assert.match(read('web-ios-pip-compat.css'),/web-pip-ios-help\[hidden\]/);
});


function autoFixture({ios=false,standalone=false,ready=true,paused=false,audio=false,allowed=true}={}){
 const events={},calls={standard:0,native:[],exit:0};let page='tv';
 const video={readyState:ready?4:0,paused,ended:false,webkitPresentationMode:'inline',
  setAttribute(name,v){this[name]=v;},
  requestPictureInPicture(){calls.standard++;doc.pictureInPictureElement=video;return Promise.resolve(video);},
  webkitSupportsPresentationMode:ios?()=>allowed:undefined,
  webkitSetPresentationMode:ios?mode=>{calls.native.push(mode);video.webkitPresentationMode=mode;}:undefined};
 const doc={pictureInPictureEnabled:allowed,pictureInPictureElement:null,visibilityState:'visible',
  addEventListener(n,fn){(events[n]??=[]).push(fn);},
  getElementById(id){return id==='video'?video:null;},
  querySelector(){return {dataset:{page}};},
  exitPictureInPicture(){calls.exit++;doc.pictureInPictureElement=null;return Promise.resolve();}};
 const win={document:doc,navigator:{userAgent:ios?'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X)':'Mozilla/5.0 (Linux; Android 16)',standalone},
  matchMedia:()=>({matches:standalone}),OpenIPTVBackgroundAudio:{active:audio},
  IPTVProAdvanced:{canEnterPage:()=>allowed}};
 function click(targetPage){for(const fn of events.click||[])fn({target:{closest:()=>({dataset:{page:targetPage}})}});page=targetPage;}
 function visibility(state){doc.visibilityState=state;for(const fn of events.visibilitychange||[])fn();}
 return {win,doc,video,calls,click,visibility};
}
test('auto PiP opens when leaving TV and closes when returning on Android and desktop',async()=>{
 const f=autoFixture();assert.equal(pip.installAuto(f.win),true);assert.equal(pip.installAuto(f.win),false);
 f.click('epg');assert.equal(f.calls.standard,1);f.click('tv');assert.equal(f.calls.exit,1);await Promise.resolve();
});
test('auto PiP on browser hidden and return visible TV',async()=>{
 const f=autoFixture();pip.installAuto(f.win);f.visibility('hidden');assert.equal(f.calls.standard,1);
 f.visibility('visible');assert.equal(f.calls.exit,1);await Promise.resolve();
});
test('auto PiP uses iOS Safari WebKit and avoids unsupported iOS Home Screen PWA',()=>{
 const f=autoFixture({ios:true});pip.installAuto(f.win);f.click('epg');f.click('tv');
 assert.deepEqual(f.calls.native,['picture-in-picture','inline']);assert.equal(f.calls.standard,0);
 const pwa=autoFixture({ios:true,standalone:true,allowed:false});pip.installAuto(pwa.win);pwa.click('epg');
 assert.equal(pwa.calls.standard,0);assert.deepEqual(pwa.calls.native,[]);
});
test('auto PiP skips paused, not-ready, audio-only and restricted playback',()=>{
 for(const o of [{paused:true},{ready:false},{audio:true},{allowed:false}]){
  const f=autoFixture(o);pip.installAuto(f.win);f.click('epg');assert.equal(f.calls.standard,0,JSON.stringify(o));
 }
});

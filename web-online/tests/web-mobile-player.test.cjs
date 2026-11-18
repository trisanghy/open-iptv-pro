'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const code=fs.readFileSync(path.join(root,'web-mobile-player.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-mobile-player.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const vm=require('node:vm');
function harness({mobile=true,ios=false,native=false,hasRequest=false}={}){
 const c=new Set(),d=new Set(),handlers={};
 const box={classList:{add:(...n)=>n.forEach(v=>c.add(v)),remove:(...n)=>n.forEach(v=>c.delete(v)),contains:x=>c.has(x)}};
 const video={readyState:2,webkitEnterFullscreen:native?()=>{video.nativeOpened=true;}:undefined};
 if(hasRequest)box.requestFullscreen=()=>Promise.resolve();
 const button={setAttribute:()=>{}};
 const els={playerBox:box,video,fullscreenBtn:button};
 const doc={fullscreenElement:null,documentElement:{setAttribute:(k,v)=>{if(k==='data-iptv-device')d.mode=v;},classList:{add:x=>d.add(x),remove:x=>d.delete(x),toggle:(x,on)=>on?d.add(x):d.delete(x)}},getElementById:id=>els[id],addEventListener:()=>{},querySelectorAll:()=>[]};
 const root={document:doc,navigator:{userAgent:ios?'iPhone':mobile?'Android Mobile':'Mozilla/5.0 (X11; Linux x86_64)',maxTouchPoints:mobile?5:0},matchMedia:()=>({matches:mobile}),addEventListener:(key,fn)=>{handlers[key]=fn}};
 const sandbox={window:root,module:{exports:{}},console};
 vm.runInNewContext(code,sandbox);
 return {api:sandbox.module.exports,box,video,c,d,root,handlers};
}
test('fullscreen button delegates to the mobile adapter without removing desktop behavior',()=>{
 assert.match(app,/OpenIPTVMobilePlayer\?\.toggle\?\.\(\)/);
 assert.match(html,/id="fullscreenBtn"[^>]+aria-label="Toàn màn hình video"/);
 assert.ok(html.indexOf('src="web-mobile-player.js"')<html.indexOf('src="app.js"'));
});
test('iPhone uses native video fullscreen when possible',()=>{
 const h=harness({ios:true,native:true});assert.equal(h.api.toggle(),true);
 assert.equal(h.video.nativeOpened,true);assert.equal(h.c.has('mobile-theater'),false);
});
test('embedded browsers without native fullscreen get a reversible full viewport mode',()=>{
 const h=harness();assert.equal(h.api.toggle(),true);assert.equal(h.c.has('mobile-theater'),true);
 assert.equal(h.d.has('web-mobile-theater-open'),true);
 assert.equal(h.api.toggle(),true);assert.equal(h.c.has('mobile-theater'),false);
});
test('desktop preserves original fullscreen path',()=>{
 const h=harness({mobile:false});
 assert.equal(h.api.toggle(),false);assert.equal(h.c.has('mobile-theater'),false);
});
test('mobile CSS increases touch target sizes and removes forced 3-column toolbar',()=>{
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
 assert.match(css,/min-height:48px!important/);
 assert.match(css,/mobile-theater/);
 assert.match(css,/safe-area-inset-bottom/);
});

test('real iPhone automatically activates mobile mode without a manual toggle',()=>{
 const h=harness({ios:true,mobile:false});
 assert.equal(h.api.isMobile(),true);
 assert.equal(h.d.mode,'mobile');
});
test('desktop remains isolated from mobile rules',()=>{
 const h=harness({mobile:false,ios:false});
 // A non-mobile desktop UA and a wide viewport must not activate mobile UI.
 h.root.navigator.userAgent='Mozilla/5.0 (X11; Linux x86_64)';
 h.api.syncDevice();
 assert.equal(h.d.mode,'desktop');
});
test('collapsed desktop sidebar cannot override the mobile bottom navigation',()=>{
 assert.match(css,/html\[data-iptv-device="mobile"\] body #appShell > #appSidebar/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #appShell > \.main/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #appShell > \.main > \.content/);
 assert.match(css,/height:calc\(69px \+ env\(safe-area-inset-bottom,0px\)\)!important/);
});
test('HTML loads versioned assets to invalidate iOS cached broken layout',()=>{
 assert.match(html,/web-mobile-player\.css\?v=mobile-scroll-20261118e/);
 assert.match(html,/web-mobile-player\.js\?v=mobile-scroll-20261118e/);
});

test('mobile has five focused bottom tabs with advanced functionality in More',()=>{
 assert.match(code,/function setupMobileNavigation\(\)/);
 assert.match(code,/\['tv','TV'\]/);
 assert.match(code,/\['fav','Yêu thích'\]/);
 assert.match(code,/\['epg','Lịch'\]/);
 assert.match(code,/\['sources','Nguồn'\]/);
 assert.match(code,/iptvMobileMoreTrigger/);
 for(const page of ['multiview','shots','folders','health','doctor','profiles','settings'])
  assert.ok(code.includes('data-mobile-more-page="'+page+'"'),page);
 for(const action of ['fileBtn','urlBtn','exportNav','cloudAccountQuick'])
  assert.ok(code.includes('data-mobile-more-click="'+action+'"'),action);
 assert.match(code,/destination\?\.click\(\)/);
});
test('mobile hides duplicate top toolbar while preserving desktop controls',()=>{
 assert.match(css,/data-iptv-device="mobile"\] body #appShell > \.main > \.topbar\{\s*display:none!important/);
 assert.match(css,/\.mobile-more-trigger,.mobile-more-overlay\{display:none\}/);
});
test('mobile volume mute, Cast, PiP and fullscreen share one compact touch row',()=>{
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
 assert.match(css,/output-controls #webVolumeMute/);
 assert.match(css,/output-controls #castBtn/);
 assert.match(css,/output-controls #pipBtn/);
 assert.match(css,/output-controls #fullscreenBtn/);
 assert.match(css,/output-controls :is\(\.cast-label,\.pip-label,\.mobile-fullscreen-label\)/);
 assert.match(css,/height:46px!important/);
});
test('mobile advanced menu has backdrop close and keyboard escape',()=>{
 assert.match(code,/data-mobile-more-close/);
 assert.match(code,/event.key==='Escape'/);
 assert.match(code,/event.key!=='Tab'/);
 assert.match(css,/mobile-more-overlay\[hidden\]\{display:none!important\}/);
});

test('mobile channel list is placed before timebar and quick tools without DOM moves',()=>{
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv \.watch-panel\{\s*display:contents!important/);
 assert.match(css,/watch-panel>\.player-box\{\s*order:0!important/);
 assert.match(css,/watch-panel>\.player-control-card\{\s*order:1!important/);
 assert.match(css,/body #page-tv \.channel-panel\{[\s\S]*?order:2!important/);
 assert.match(css,/watch-panel>\.advanced-timebar\{\s*order:4!important/);
 assert.match(css,/watch-panel>\.compact-tools\{\s*order:5!important/);
});
test('iOS channel list has a bounded independent vertical touch scroller',()=>{
 assert.match(css,/height:clamp\(350px,50dvh,520px\)!important/);
 assert.match(css,/channel-panel>#channelList\{[\s\S]*?overflow-y:auto!important/);
 assert.match(css,/-webkit-overflow-scrolling:touch!important/);
 assert.match(css,/overscroll-behavior-y:contain!important/);
 assert.match(css,/touch-action:pan-y!important/);
 assert.match(css,/channel-panel \.filter-tabs\{[\s\S]*?touch-action:pan-x!important/);
 assert.match(app,/if\(!\['mouse','pen'\]\.includes\(e\.pointerType\)\)return/);
});
test('notifications are above the fixed bottom tabs on iPhone',()=>{
 assert.match(css,/body #toastArea\{[\s\S]*?bottom:calc\(84px \+ env\(safe-area-inset-bottom,0px\)\)!important/);
 assert.match(css,/body #toastArea\{[\s\S]*?z-index:1800!important/);
 assert.match(css,/body #toastArea>\.toast\{/);
 assert.match(html,/class="toast-area" id="toastArea"/);
});
test('mobile collapse state preserves the ability to hide the channel panel',()=>{
 assert.match(css,/data-channel-panel-visible="false"\] body #page-tv \.channel-panel\{\s*display:none!important/);
});

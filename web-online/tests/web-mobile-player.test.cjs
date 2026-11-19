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
 assert.ok(html.indexOf('src="web-mobile-player.js?')>=0 && html.indexOf('src="web-mobile-player.js?')<html.indexOf('src="app.js?'));
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
 assert.match(html,/web-mobile-player\.css\?v=responsive-desktop-20261118j/);
 assert.match(html,/web-mobile-player\.js\?v=responsive-desktop-20261118j/);
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
 assert.match(css,/\.mobile-more-trigger,\.mobile-more-overlay,\.mobile-tab-caption\{display:none!important\}/);
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

test('mobile channel rows are large and all controls stay touch accessible',()=>{
 assert.match(css,/body #page-tv #channelList \.channel-item\{[\s\S]*?min-height:78px!important/);
 assert.match(css,/body #page-tv #channelList \.chan-logo\{[\s\S]*?width:54px!important;height:52px!important/);
 assert.match(css,/body #page-tv #channelList \.folder-header\{[\s\S]*?min-height:60px!important/);
 assert.match(css,/body #page-tv #channelList \.channel-move,[\s\S]*?min-width:44px!important/);
 assert.match(css,/body #page-tv #channelList \.channel-text b\{[\s\S]*?font-size:15px!important/);
});
test('channel list has independently scrollable space and drag hints are hidden on mobile',()=>{
 assert.match(css,/body #page-tv \.channel-panel\{[\s\S]*?height:clamp\(598\.5px,80\.85dvh,819px\)!important/);
 assert.match(css,/body #page-tv \.channel-panel > #channelList\{[\s\S]*?height:auto!important;min-height:0!important/);
 assert.match(css,/body #page-tv \.channel-panel > #channelList\{[\s\S]*?overflow-y:scroll!important/);
 assert.match(css,/body #page-tv \.channel-panel > #channelList\{[\s\S]*?touch-action:pan-y!important/);
 assert.match(css,/body #page-tv \.channel-panel \.channel-drag-hint\{\s*display:none!important/);
 assert.match(app,/if\(!\['mouse','pen'\]\.includes\(e\.pointerType\)\)return/);
});

test('mobile channel panel is 40 percent shorter in portrait and short landscape',()=>{
 // 0.60 * (997.5,134.75,1365) = (598.5,80.85,819)
 assert.match(css,/height:clamp\(598\.5px,80\.85dvh,819px\)!important;min-height:598\.5px!important/);
 // 0.60 * (630,157.5,945) = (378,94.5,567)
 assert.match(css,/height:clamp\(378px,94\.5dvh,567px\)!important;min-height:378px!important/);
 assert.match(css,/body #page-tv \.channel-panel > #channelList\{[\s\S]*?overflow-y:scroll!important/);
});

test('mobile background tasks remain visible above the fixed bottom tabs',()=>{
 assert.match(code,/function syncTaskDock\(\)/);
 assert.match(code,/doc\.body\?\.appendChild\?\.\(dock\)/);
 assert.match(code,/setupTaskDock\(\)/);
 assert.match(css,/body > #taskDock:not\(\.hidden\)/);
 assert.match(css,/body > #taskDock \.task-cancel/);
});

test('critical mobile bootstrap runs before desktop CSS and saves layout from blank rail',()=>{
 const themeBoot=fs.readFileSync(path.join(root,'theme-boot.js'),'utf8');
 assert.ok(html.indexOf('src="theme-boot.js?v=responsive-desktop-20261118j"')<html.indexOf('href="styles.css"'));
 assert.match(themeBoot,/iptv-mobile-critical-layout/);
 assert.match(themeBoot,/html\[data-iptv-device="mobile"\] body #appShell>\.main/);
 assert.match(themeBoot,/html\[data-iptv-device="mobile"\] body #appShell>#appSidebar/);
 assert.match(code,/root\.OpenIPTVDevice\.isMobile\(\)/);
});
test('iPhone, desktop-website iPhone and narrow browser all switch before app starts',()=>{
 const boot=fs.readFileSync(path.join(root,'theme-boot.js'),'utf8');
 function emulate({ua,width,screenWidth,touch}){
  const rootTag={dataset:{},attributes:{},classList:{toggle:()=>{}},style:{setProperty:()=>{}},
   setAttribute(k,v){this.attributes[k]=v;}};
  const appended=[];
  const doc={documentElement:rootTag,hidden:false,head:{appendChild:x=>appended.push(x)},
   createElement:()=>({id:'',textContent:''}),addEventListener:()=>{}};
  const rootWindow={navigator:{userAgent:ua,maxTouchPoints:touch},
   innerWidth:width,screen:{width:screenWidth,height:844},
   matchMedia:()=>({matches:width<=820}),
   addEventListener:()=>{}};
  vm.runInNewContext(boot,{window:rootWindow,document:doc,localStorage:{getItem:()=>null},console},{filename:'theme-boot.js'});
  return {rootTag,appended,api:rootWindow.OpenIPTVDevice};
 }
 const iphone=emulate({ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X)',width:390,screenWidth:390,touch:5});
 assert.equal(iphone.rootTag.attributes['data-iptv-device'],'mobile');
 assert.equal(iphone.appended[0].id,'iptv-mobile-critical-layout');
 const spoof=emulate({ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X)',width:980,screenWidth:390,touch:5});
 assert.equal(spoof.rootTag.attributes['data-iptv-device'],'desktop');
 const narrow=emulate({ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',width:390,screenWidth:1920,touch:0});
  assert.equal(narrow.rootTag.attributes['data-iptv-device'],'desktop');
 const desktop=emulate({ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',width:1440,screenWidth:1920,touch:0});
 assert.equal(desktop.rootTag.attributes['data-iptv-device'],'desktop');
 assert.equal(desktop.api.isMobile(),false);
});

test('desktop website request takes precedence over physical phone dimensions',()=>{
 const boot=fs.readFileSync(path.join(root,'theme-boot.js'),'utf8');
 function simulate({ua,width,physical,touch=5,search=''}) {
  const attr={},meta={value:'width=device-width,initial-scale=1',
   getAttribute(){return this.value},setAttribute(k,v){this.value=v}};
  const doc={documentElement:{dataset:{},classList:{toggle:()=>{}},style:{setProperty:()=>{}},
    setAttribute(k,v){attr[k]=v}},querySelector:q=>q==='meta[name="viewport"]'?meta:null,
   head:{appendChild:()=>{}},createElement:()=>({}),addEventListener:()=>{}};
  const win={navigator:{userAgent:ua,maxTouchPoints:touch},innerWidth:width,
   screen:{width:physical,height:844},location:{search},addEventListener:()=>{},
   matchMedia:q=>({matches:q.includes('prefers-color-scheme')?true:width<=820})};
  vm.runInNewContext(boot,{window:win,document:doc,localStorage:{getItem:()=>null}},{filename:'theme-boot.js'});
  return {mode:attr['data-iptv-device'],viewport:meta.value,api:win.OpenIPTVDevice};
 }
 const iphone='Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)';
 const desktopUA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
 const normal=simulate({ua:iphone,width:390,physical:390});
 assert.equal(normal.mode,'mobile');
 assert.equal(normal.viewport,'width=device-width,initial-scale=1');
 const browserDesktop=simulate({ua:desktopUA,width:980,physical:390});
 assert.equal(browserDesktop.mode,'desktop');
 assert.equal(browserDesktop.viewport,'width=1024,initial-scale=1');
 const forced=simulate({ua:iphone,width:390,physical:390,search:'?view=desktop'});
 assert.equal(forced.mode,'desktop');
 assert.equal(forced.viewport,'width=1024,initial-scale=1');
 assert.equal(simulate({ua:desktopUA,width:980,physical:390,search:'?view=mobile'}).mode,'mobile');
 const pc=simulate({ua:desktopUA,width:1440,physical:1920,touch:0});
 assert.equal(pc.mode,'desktop');assert.equal(pc.viewport,'width=device-width,initial-scale=1');
});
test('mobile baseline CSS cannot leak into desktop website mode',()=>{
 const first=css.indexOf('@media (max-width:760px), (pointer:coarse) and (max-width:1000px){');
 const end=css.indexOf('/* Full-viewport CSS fallback',first);
 assert.ok(first>=0&&end>first);
 const initial=css.slice(first,end);
 assert.match(initial,/html\[data-iptv-device="mobile"\] body \.app-shell/);
 assert.match(initial,/html\[data-iptv-device="mobile"\] #page-tv \.tv-layout/);
 assert.doesNotMatch(initial,/\n\s+html body \.app-shell/);
 assert.doesNotMatch(initial,/\n\s+#page-tv \.tv-layout/);
 assert.match(css,/\.mobile-tab-caption\{display:none!important\}/);
});

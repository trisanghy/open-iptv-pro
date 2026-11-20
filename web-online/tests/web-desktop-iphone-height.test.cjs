'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const js=fs.readFileSync(path.join(root,'web-desktop-viewport-fix.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-desktop-viewport-fix.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
function fixture({device='desktop',innerWidth=1024,innerHeight=840,screenWidth=393,screenHeight=852,
 visualHeight=840,standalone=false}={}){
 const attrs=new Map([['data-iptv-device',device]]),styles=new Map(),handlers={};
 const el={
  clientWidth:innerWidth,clientHeight:innerHeight,
  getAttribute:k=>attrs.get(k)||null,
  setAttribute:(k,v)=>attrs.set(k,v),
  removeAttribute:k=>attrs.delete(k),
  style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}
 };
 const document={documentElement:el,addEventListener(k,fn){handlers['doc:'+k]=fn}};
 const visualViewport={height:visualHeight,addEventListener(k,fn){handlers['visual:'+k]=fn}};
 const window={
  innerWidth,innerHeight,screen:{width:screenWidth,height:screenHeight},
  navigator:{standalone},visualViewport,
  matchMedia:()=>({matches:false}),
  addEventListener(k,fn){handlers[k]=fn},
  requestAnimationFrame:fn=>fn()
 };
 vm.runInNewContext(js,{window,document});
 return {attrs,styles,handlers,window,document,api:window.OpenIPTVDesktopViewportFix};
}
test('iPhone Request Desktop Website compensates 1024px virtual viewport height',()=>{
 const f=fixture();
 assert.equal(f.attrs.get('data-iptv-handheld-desktop'),'true');
 const height=Number.parseInt(f.styles.get('--iptv-desktop-usable-height'),10);
 assert.ok(height>1800 && height<2600,'must compensate phone-wide zoom: '+height);
 assert.ok(height>f.window.innerHeight*2,'avoid the 100vh upper-screen cutoff');
 assert.equal(f.api.refresh(),true);
});
test('native desktop monitors are never resized or forced into mobile layout',()=>{
 const f=fixture({innerWidth:1440,innerHeight:900,screenWidth:1440,screenHeight:900});
 assert.equal(f.attrs.has('data-iptv-handheld-desktop'),false);
 assert.equal(f.styles.has('--iptv-desktop-usable-height'),false);
});
test('mobile mode stays unchanged and desktop-only fix is removed when mode switches',()=>{
 const f=fixture({device:'mobile',innerWidth:393,screenWidth:393});
 assert.equal(f.attrs.has('data-iptv-handheld-desktop'),false);
 f.document.documentElement.setAttribute('data-iptv-device','desktop');
 f.window.innerWidth=1024;f.document.documentElement.clientWidth=1024;
 f.api.refresh();assert.equal(f.attrs.get('data-iptv-handheld-desktop'),'true');
 f.document.documentElement.setAttribute('data-iptv-device','mobile');
 f.api.refresh();assert.equal(f.attrs.has('data-iptv-handheld-desktop'),false);
 assert.equal(f.styles.has('--iptv-desktop-usable-height'),false);
});
test('standalone Web app uses more vertical space than Safari toolbar mode',()=>{
 const browser=fixture(),pwa=fixture({standalone:true});
 const get=f=>Number.parseInt(f.styles.get('--iptv-desktop-usable-height'),10);
 assert.ok(get(pwa)>get(browser));
});
test('Safari visualViewport resize and rotation recalculate without stale constraints',()=>{
 const f=fixture();
 f.window.visualViewport.height=2400;
 f.handlers['visual:resize']();
 assert.equal(f.styles.get('--iptv-desktop-usable-height'),'2400px');
 f.window.screen.width=852;f.window.screen.height=393;
 f.handlers.orientationchange();
 assert.equal(f.attrs.has('data-iptv-handheld-desktop'),false);
});
test('CSS only changes vertical shell size for desktop on a phone; preserves player',()=>{
 assert.match(css,/data-iptv-device="desktop"\]\[data-iptv-handheld-desktop="true"/);
 assert.match(css,/#appShell/);
 assert.match(css,/overflow-y:auto!important/);
 assert.doesNotMatch(css,/aspect-ratio|#playerBox|\.player-box video/);
 assert.match(html,/web-desktop-viewport-fix\.js\?v=desktop-phone-rollback-20261120b/);
 assert.match(html,/web-desktop-viewport-fix\.css\?v=desktop-phone-rollback-20261120b/);
 assert.match(builder,/Desktop-on-iPhone viewport bootstrap marker changed/);
 assert.match(builder,/copy2\(source,out\/asset\)/);
});

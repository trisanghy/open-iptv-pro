'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const script=fs.readFileSync(path.join(root,'web-desktop-viewport-fix.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web-desktop-viewport-fix.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const marker='/* iPhone requesting desktop layout: replace';
const start=script.indexOf(marker);
assert.ok(start>=0,'iPhone desktop drawer helper is required');
const drawer=script.slice(start);
function eventTarget(properties={}){
 const events={};
 return Object.assign({
  listeners:events,
  addEventListener(name,listener,capture){(events[name]??=[]).push({listener,capture:!!capture});},
  fire(name,data={}){const event={preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...data};
   for(const {listener} of events[name]||[])listener(event);return event;},
  setAttribute(name,value){(this.attrs??=new Map()).set(name,String(value));},
  getAttribute(name){return this.attrs?.get(name)??null;},
  focus(){this.focused=true;},
  append(...children){(this.children??=[]).push(...children)}
 },properties);
}
function scene({mobile=false,phone=true,sidebarVisible='false'}={}){
 const attrs=new Map([['data-iptv-device',mobile?'mobile':'desktop'],['data-sidebar-visible',sidebarVisible]]);
 if(phone&&!mobile)attrs.set('data-iptv-handheld-desktop','true');
 const styles=new Map();
 const htmlRoot={clientWidth:1024,style:{setProperty:(name,v)=>styles.set(name,v)},
  getAttribute:name=>attrs.get(name)||null,hasAttribute:name=>attrs.has(name),
  setAttribute:(name,v)=>attrs.set(name,String(v)),
  removeAttribute:name=>attrs.delete(name)};
 const shell=eventTarget(),sidebar=eventTarget(),edge=eventTarget(),doc=eventTarget({
  readyState:'complete',documentElement:htmlRoot,
  getElementById:name=>({appShell:shell,appSidebar:sidebar,sidebarToggleBtn:edge})[name]||null,
  createElement:tag=>eventTarget({tagName:tag.toUpperCase(),hidden:false,innerHTML:''})
 });
 const win=eventTarget({
  screen:{width:393,height:852},innerWidth:1024,
  requestAnimationFrame:fn=>fn(),
  OpenIPTVDesktopViewportFix:{refresh(){
   if(!phone||mobile)attrs.delete('data-iptv-handheld-desktop');
   else attrs.set('data-iptv-handheld-desktop','true');
  }}
 });
 vm.runInNewContext(drawer,{window:win,document:doc},{timeout:3000});
 const [openButton,veil]=shell.children||[];
 assert.ok(openButton&&veil,'one floating button and scrim are mounted');
 return {attrs,styles,shell,sidebar,edge,doc,win,openButton,veil};
}
test('phone desktop opens full navigation drawer without changing stored sidebarVisible=false',()=>{
 const a=scene();
 assert.equal(a.attrs.get('data-iptv-handheld-menu'),'closed');
 assert.equal(a.attrs.get('data-sidebar-visible'),'false');
 assert.equal(a.openButton.getAttribute('aria-controls'),'appSidebar');
 assert.equal(a.openButton.getAttribute('aria-expanded'),'false');
 assert.equal(a.veil.hidden,true);
 a.openButton.fire('click');
 assert.equal(a.attrs.get('data-iptv-handheld-menu'),'open');
 assert.equal(a.openButton.getAttribute('aria-expanded'),'true');
 assert.equal(a.veil.hidden,false);
 assert.equal(a.attrs.get('data-sidebar-visible'),'false');
 a.veil.fire('click');
 assert.equal(a.attrs.get('data-iptv-handheld-menu'),'closed');
 assert.equal(a.veil.hidden,true);
});
test('original sidebar toggle closes drawer, but does not run persistent desktop handler',()=>{
 const a=scene({sidebarVisible:'true'});
 a.openButton.fire('click');
 const click=a.edge.fire('click');
 assert.equal(click.prevented,true);
 assert.equal(click.stopped,true);
 assert.equal(a.attrs.get('data-iptv-handheld-menu'),'closed');
 assert.equal(a.attrs.get('data-sidebar-visible'),'true');
 assert.equal(a.openButton.focused,true);
});
test('navigation closes the overlay without preventing normal tab handlers',()=>{
 const a=scene();
 a.openButton.fire('click');
 const click=a.sidebar.fire('click',{target:{closest:selector=>selector.includes('.nav[data-page]')?{}:null}});
 assert.equal(a.attrs.get('data-iptv-handheld-menu'),'closed');
 assert.equal(click.stopped,undefined);
 assert.equal(click.prevented,undefined);
 for(const tab of ['tv','epg','sources','profiles','settings','fav']){
  assert.match(html,new RegExp('data-page="'+tab+'"'));
 }
});
test('Escape and phone orientation/desktop-mode changes close the drawer',()=>{
 const a=scene();a.openButton.fire('click');
 a.doc.fire('keydown',{key:'Escape'});
 assert.equal(a.attrs.get('data-iptv-handheld-menu'),'closed');
 a.openButton.fire('click');a.win.screen.width=852;a.win.screen.height=393;
 // The existing viewport helper decides when the handheld-desktop flag ends.
 a.win.OpenIPTVDesktopViewportFix.refresh=()=>a.attrs.delete('data-iptv-handheld-desktop');
 a.win.fire('orientationchange');
 assert.equal(a.attrs.has('data-iptv-handheld-menu'),false);
 assert.equal(a.veil.hidden,true);
});
test('real desktop and actual Mobile mode are unaffected',()=>{
 for(const opt of [{phone:false},{mobile:true}]){
  const a=scene(opt);
  a.openButton.fire('click');
  assert.equal(a.attrs.has('data-iptv-handheld-menu'),false);
  assert.equal(a.attrs.get('data-sidebar-visible'),'false');
 }
});
test('virtual 1024px layout makes overlay controls finger-sized after screen shrink',()=>{
 const a=scene();
 const pixels=Number.parseInt(a.styles.get('--iptv-phone-tap'),10);
 assert.ok(pixels>=110&&pixels<=144,'target should be ~48 device CSS pixels: '+pixels);
 assert.ok(Number.parseInt(a.styles.get('--iptv-phone-font'),10)>=30);
 assert.match(css,/width:min\(790px,84%\)!important/);
 assert.match(css,/#appShell #appSidebar \.nav/);
 assert.match(css,/font-size:var\(--iptv-phone-font/);
});
test('no 78px rail occupies main content and all tabs can scroll',()=>{
 assert.match(css,/#appShell>#appSidebar\{/);
 assert.match(css,/transform:translateX\(-105%\)!important/);
 assert.match(css,/#appShell>\.main\{/);
 assert.match(css,/width:100%!important/);
 assert.match(css,/#appShell>\.main>\.content\{/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/\.page\.active-page\{/);
 assert.match(css,/#page-settings,#page-profiles,#page-health/);
 for(const name of ['TV','EPG','Source','Profile'])assert.ok(name.length>0);
});
test('new cache-busted script and CSS survive the Pages builder',()=>{
 assert.match(html,/web-desktop-viewport-fix\.js\?v=desktop-iphone-drawer-20261120a/);
 assert.match(html,/web-desktop-viewport-fix\.css\?v=desktop-iphone-drawer-20261120a/);
 assert.match(builder,/desktop_viewport_version='desktop-iphone-drawer-20261120a'/);
 assert.match(builder,/copy2\(source,out\/asset\)/);
});

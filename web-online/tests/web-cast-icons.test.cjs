'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('web-cast-icons.js'),css=read('web-cast-v2.css');
const page=read('index.html'),tv=read('tv.html'),modal=read('web-cast-v2.js');

class Element{
 constructor(tag){this.tagName=tag;this.attrs={};this.childNodes=[];this.className='';}
 setAttribute(k,v){this.attrs[k]=String(v);}
 getAttribute(k){return this.attrs[k]||null;}
 get firstElementChild(){return this.childNodes.find(c=>c instanceof Element)||null;}
 get textContent(){return this.childNodes.map(x=>x.textContent||'').join('');}
 set textContent(v){this.childNodes=[{nodeType:3,textContent:String(v)}];}
 appendChild(child){this.childNodes.push(child);return child;}
 replaceChildren(...children){this.childNodes=children;}
 removeChild(child){this.childNodes=this.childNodes.filter(x=>x!==child);}
 querySelector(selector){
  if(selector.includes('[data-iptv-svg-icon="cast"]'))
   return this.childNodes.find(x=>x instanceof Element&&x.getAttribute('data-iptv-svg-icon')==='cast')||null;
  if(selector.includes('.cast-label'))
   return this.childNodes.find(x=>x instanceof Element&&x.className==='cast-label')||null;
  return null;
 }
}
function harness(){
 let button=null,observer=null;
 const doc={
  createElementNS(_ns,name){return new Element(name);},
  createElement(name){return new Element(name);},
  createTextNode(text){return {nodeType:3,textContent:text};},
  getElementById(id){return id==='castBtn'?button:null;},
  querySelector(){return null;}
 };
 const win={document:doc,MutationObserver:class{constructor(callback){observer=callback;}observe(){}}};
 vm.runInNewContext(source,{window:win,console},{filename:'web-cast-icons.js'});
 const api=win.OpenIPTVCastIcons;
 return {api,doc,win,setButton(value){button=value;},notify(){observer?.();}};
}
test('single real vector Cast path is screen plus three recognizable bottom-left arcs',()=>{
 const {api}=harness();
 const cast=api.svg('cast');
 assert.equal(cast.getAttribute('viewBox'),'0 0 24 24');
 assert.equal(cast.getAttribute('fill'),'currentColor');
 assert.equal(cast.childNodes.length,4);
 assert.match(cast.childNodes[0].getAttribute('d'),/M1 18v3h3/);
 assert.match(cast.childNodes[3].getAttribute('d'),/M1 3v5h2/);
 for(const name of ['airplay','pair','search','link','copy','play','pause','stop','close']){
  const icon=api.svg(name);
  assert.equal(icon.getAttribute('data-iptv-svg-icon'),name);
  assert.ok(icon.childNodes.length>=1,name);
 }
 assert.equal(api.svg('airplay').getAttribute('fill'),'none');
 assert.equal(api.svg('pair').getAttribute('stroke'),'currentColor');
});
test('player Cast button preserves click surface and label when glyph is replaced',()=>{
 const h=harness(),btn=new Element('button'),label=new Element('span');
 label.className='cast-label';label.textContent='Cast / AirPlay';
 btn.replaceChildren({nodeType:3,textContent:'▣ '},label);h.setButton(btn);
 h.api.watchPlayerButton();
 assert.equal(btn.querySelector(':scope > svg[data-iptv-svg-icon="cast"]').getAttribute('viewBox'),'0 0 24 24');
 assert.equal(btn.querySelector(':scope > .cast-label'),label);
 assert.equal(btn.getAttribute('aria-label'),'Cast / AirPlay lên TV');
 // app.js may assign textContent after startup: the icon must be restored.
 btn.textContent='▣';h.notify();
 assert.equal(btn.querySelector(':scope > svg[data-iptv-svg-icon="cast"]').getAttribute('data-iptv-svg-icon'),'cast');
});
test('Cast dialog icons, caption and TV link use only a single shared SVG library',()=>{
 const h=harness();
 const selectors=[
 '.cx-icon','#cxTabPair','#cxTabCast','#cxTabAir',
 '#cxPaneCast .cx-featureicon','#cxPaneAir .cx-featureicon',
 '#cxCopyTv','#cxCopyTvOriginal','#cxConnect','#cxRemotePlay','#cxRemotePause',
 '#cxRemoteResume','#cxRemoteStop','#cxCastScan','#cxCastPlay',
 '#cxCastStop','#cxAirOpen','#cxClose','.cx-tvlogo'
 ];
 const nodes=new Map(selectors.map(s=>[s,new Element('div')]));
 const panel={querySelector:selector=>nodes.get(selector)||null};
 h.api.decorateModal(panel);
 for(const selector of selectors){
  const node=nodes.get(selector);
  assert.equal(node.childNodes.filter(x=>x instanceof Element&&x.tagName==='svg').length,1,selector);
 }
 assert.equal(nodes.get('#cxTabCast').firstElementChild.getAttribute('data-iptv-svg-icon'),'cast');
 assert.equal(nodes.get('#cxTabAir').firstElementChild.getAttribute('data-iptv-svg-icon'),'airplay');
 assert.equal(nodes.get('#cxTabPair').firstElementChild.getAttribute('data-iptv-svg-icon'),'pair');
 assert.match(modal,/decorateModal\?\.\(overlay\)/);
 assert.match(modal,/const tvUrl=\(\)=> 'https:\/\/is\.gd\/IPTVTV'/);
 assert.match(modal,/\$\('cxTvUrl'\)\.href=tvUrl\(\)/);
 assert.match(modal,/clipboard\.writeText\(tvUrl\(\)\)/);
});
test('all themes load new SVG and disable old pseudo-element masks everywhere',()=>{
 assert.match(page,/web-cast-icons\.js\?v=dual-links-20261122a/);
 assert.match(page,/web-cast-v2\.css\?v=tv-local-handoff-20261122d/);
 assert.match(tv,/web-cast-icons\.js\?v=dual-links-20261122a/);
 const svgIndex=page.indexOf('web-cast-icons.js?v=');
 assert.ok(svgIndex>0&&svgIndex<page.indexOf('web-cast-v2.js?v='));
 assert.match(css,/html body #page-tv #castBtn::before/);
 assert.match(css,/content:none!important;display:none!important/);
 assert.match(css,/html\[data-iptv-device="mobile"\] body #page-tv/);
 assert.match(css,/#iptvCastPanel \.cx-featureicon > svg\.oip-cast-svg/);
 for(const theme of ['light','dark','amoled'])
  assert.match(css,new RegExp('html\\[data-theme="'+theme+'"\\] #iptvCastOverlay'));
});

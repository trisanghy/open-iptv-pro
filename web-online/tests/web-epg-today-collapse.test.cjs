'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'features.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'web-epg-day.css'),'utf8');
const builder=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const start=source.indexOf(' const expandedEPGChannels=new Set();');
const end=source.indexOf(' async function fetchXML(',start);
assert.ok(start>=0&&end>start,'Daily EPG renderer missing');
const renderer=source.slice(start,end);
const date=(year,month,day,hour,min=0)=>new Date(year,month-1,day,hour,min).getTime();
function fixture(now,items){
 const view={children:[],innerHTML:'',replaceChildren(){this.children=[];this.innerHTML='';},append(frag){this.children.push(...frag.children);}};
 const summary={textContent:'',setAttribute(){}};
 const els={epgGuide:view,epgSummary:summary,epgSearch:{value:''}};
 const channels=[{id:'vtv1',name:'VTV1',tvgId:'vtv1'}];
 const FixedDate=class extends Date{
  constructor(...args){super(...(args.length?args:[now]));}
  static now(){return now;}
 };
 const ctx={
  Date:FixedDate,Intl,Number,String,Set,Array,
  updatedAt:'2026-11-20',guide:{programmes:items},
  ctx:{getChannels:()=>channels},guideLib:{find:()=>items},
  $:selector=>els[selector.slice(1)],esc:x=>String(x),
  window:{IPTVProAdvanced:{}},
  document:{
   createDocumentFragment(){return {children:[],append(node){this.children.push(node)}};},
   createElement(tag){
    const list={innerHTML:'',replaceChildren(){this.innerHTML='';},querySelectorAll(){return []}};
    return {tag,className:'',dataset:{},open:false,innerHTML:'',listeners:{},list,
     querySelector(){return list;},addEventListener(event,fn){this.listeners[event]=fn;}};
   }
  }
 };
 vm.runInNewContext(renderer+';globalThis.epgApi={currentEPGDay,renderEPG,expandedEPGChannels}',ctx);
 return {api:ctx.epgApi,view,summary};
}
test('calendar day uses local 00:00 to next 00:00, not ±12h',()=>{
 const f=fixture(date(2026,11,20,7),[]);
 const range=f.api.currentEPGDay(date(2026,11,20,7));
 assert.equal(range.start,date(2026,11,20,0));
 assert.equal(range.end,date(2026,11,21,0));
 assert.equal(range.end-range.start,24*3600000);
});
test('channel starts closed; only overlapping TODAY entries load when expanded',()=>{
 const now=date(2026,11,20,7);
 const f=fixture(now,[
  {start:date(2026,11,19,8),end:date(2026,11,19,9),title:'Yesterday'},
  {start:date(2026,11,19,23,50),end:date(2026,11,20,0,10),title:'Cross midnight'},
  {start:date(2026,11,20,6),end:date(2026,11,20,7,30),title:'Today live'},
  {start:date(2026,11,20,23),end:date(2026,11,21,1),title:'Tonight'},
  {start:date(2026,11,21,10),end:date(2026,11,21,11),title:'Tomorrow'}
 ]);
 f.api.renderEPG();
 assert.equal(f.view.children.length,1);
 const card=f.view.children[0];
 assert.equal(card.open,false);
 assert.equal(card.list.innerHTML,'','rows must be lazily rendered');
 assert.match(card.innerHTML,/3 chương trình/);
 assert.match(f.summary.textContent,/00:00–24:00/);
 card.open=true;card.listeners.toggle();
 assert.match(card.list.innerHTML,/Cross midnight|Today live/);
 assert.match(card.list.innerHTML,/Tonight/);
 assert.doesNotMatch(card.list.innerHTML,/Yesterday|Tomorrow|epg-record|⏺ Ghi/);
});
test('expanded state persists across minute refresh; closing discards rows',()=>{
 const now=date(2026,11,20,12);
 const f=fixture(now,[{start:now-60000,end:now+60000,title:'Midday'}]);
 f.api.renderEPG();
 let card=f.view.children[0];card.open=true;card.listeners.toggle();
 f.api.renderEPG();card=f.view.children[0];
 assert.equal(card.open,true);assert.match(card.list.innerHTML,/Midday/);
 card.open=false;card.listeners.toggle();assert.equal(card.list.innerHTML,'');
 f.api.renderEPG();assert.equal(f.view.children[0].open,false);
});
test('unsupported Web EPG record controls are hidden but native DVR IDs remain',()=>{
 assert.match(css,/#page-epg #dvrPanel,#page-epg \.epg-record\{display:none!important\}/);
 assert.match(html,/id="dvrPanel"/);
 assert.doesNotMatch(renderer,/epg-record|scheduleFromEPG/);
});
test('mobile/desktop share compact daily view with advanced search folded',()=>{
 assert.match(html,/id="epgToolsFold"/);
 assert.match(html,/web-epg-day\.css\?v=epg-logo-20261120b/);
 assert.match(html,/features\.js\?v=epg-logo-20261120b/);
 assert.match(css,/@media\(max-width:690px\)/);
 assert.match(css,/\.epg-channel-heading/);
 assert.match(builder,/Web EPG daily renderer anchors changed/);
 assert.match(builder,/Web EPG page markup anchors changed/);
 assert.match(builder,/web-epg-day\.css\?v=epg-logo-20261120b/);
});

test('daily EPG renders channel artwork rather than the old glyph',()=>{
 assert.match(renderer,/function epgChannelLogo\(/);
 assert.match(renderer,/channel\.logo/);
 assert.match(renderer,/document\.createElement\('img'\)/);
 assert.match(renderer,/img\.addEventListener\('error'/);
 assert.doesNotMatch(renderer,/aria-hidden="true">▤/);
 assert.match(css,/#page-epg \.epg-channel-logo\{/);
});

test('known VTV logo fallback is used when M3U provides no artwork',()=>{
 assert.match(renderer,/function epgKnownLogo\(/);
 assert.match(renderer,/VTV5_TNB\.png/);
 assert.match(renderer,/VTV5_TN\.png/);
 assert.match(renderer,/img\.dataset\.epgFallback/);
});

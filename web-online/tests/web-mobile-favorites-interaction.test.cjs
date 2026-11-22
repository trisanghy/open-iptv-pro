'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('app.js'),advanced=read('advanced.js'),css=read('web-mobile-player.css'),html=read('index.html'),builder=read('web-online/prepare-web.py');
function favorites(){
 const begin=app.indexOf(' function renderFavorites(){'),end=app.indexOf(' function updatePlayerFavorite(){',begin);
 assert.ok(begin>=0&&end>begin);
 const handlers={};const buttons={star:{}};
 const card={dataset:{},attrs:{},addEventListener(n,cb){handlers[n]=cb},setAttribute(n,v){this.attrs[n]=v},querySelector(q){
  if(q==='.fav-unstar')return buttons.star;
  return null;
 }};
 const target={cards:[],replaceChildren(){this.cards=[]},append(card){this.cards.push(card)}};
 const ch={id:'vtv1',url:'https://iptv.example/live.m3u8',group:'VTV',name:'VTV1 (Nguồn 1)',sourceId:'s'};
 const calls={play:[],pages:[],star:[]};
 const env={document:{createElement:()=>card},$:()=>target,favCore:{visible:()=>[ch]},
  store:{snapshots:{},sources:[{id:'s',name:'Playlist'}]},escape:String,
  snapshotSrc:()=>'',channelThumb:()=>'',attachSnapshotFallback:()=>{},
  setPage:x=>calls.pages.push(x),playChannel:id=>calls.play.push(id),favorite:c=>calls.star.push(c.id),
  window:{IPTVProAdvanced:{decorateRow(){}}}};
 vm.runInNewContext(app.slice(begin,end)+'\nrenderFavorites();',env);
 return {card,handlers,buttons,target,calls};
}
test('tapping favorite name, image or card plays immediately',()=>{
 const h=favorites(),surface={closest:()=>null};
 assert.equal(h.target.cards[0],h.card);assert.equal(h.card.tabIndex,0);
 for(let i=0;i<3;i++)h.handlers.click({target:surface});
 assert.deepEqual(h.calls.pages,['tv','tv','tv']);
 assert.deepEqual(h.calls.play,['vtv1','vtv1','vtv1']);
});
test('star only toggles favorite; tapping title, image or row returns to TV and plays once',()=>{
 const h=favorites();let stopped=0;
 h.buttons.star.onclick({stopPropagation(){stopped++}});
 h.handlers.click({target:{closest:()=>h.buttons.star}});
 assert.deepEqual(h.calls.star,['vtv1']);assert.deepEqual(h.calls.play,[]);
 h.handlers.click({target:{closest:()=>null}});
 assert.deepEqual(h.calls.play,['vtv1']);assert.deepEqual(h.calls.pages,['tv']);assert.equal(stopped,1);
});
test('renderer has no Xem button: only the independent star remains',()=>{
 const h=favorites();
 assert.doesNotMatch(h.card.innerHTML,/▶ Xem/);
 assert.equal((h.card.innerHTML.match(/<button\b/g)||[]).length,1);
 assert.match(h.card.innerHTML,/class="fav-unstar"/);
 assert.equal(h.card.attrs['aria-label'],'Phát kênh VTV1 (Nguồn 1)');
});
test('favorite card keyboard supports Enter and Space, not nested key events',()=>{
 const h=favorites();let prevented=0;
 for(const key of ['Enter',' '])h.handlers.keydown({target:h.card,key,preventDefault(){prevented++}});
 h.handlers.keydown({target:h.buttons.star,key:'Enter',preventDefault(){throw Error('nested button');}});
 assert.deepEqual(h.calls.play,['vtv1','vtv1']);assert.equal(prevented,2);
});
test('iPhone synthesized mouseenter never schedules popup and desktop retains preview',()=>{
 const start=advanced.indexOf(' let previewTimer=null'),end=advanced.indexOf(' // ====== Auto Failover',start);
 assert.ok(start>=0&&end>start);
 const p={classList:{add(){}},replaceChildren(){}},listeners={};
 const row={dataset:{},addEventListener(name,fn){listeners[name]=fn}};
 const document={documentElement:{dataset:{iptvDevice:'mobile'}}};
 const api=vm.runInNewContext(advanced.slice(start,end)+'\n({decorateRow,previewDisabled})',{
  document,window:{},$:()=>p,setTimeout,clearTimeout});
 const ch={id:'vtv1',url:'https://iptv.example/live.m3u8',name:'VTV1'};
 api.decorateRow(ch,row);
 assert.deepEqual(Object.keys(listeners),[]);
 assert.equal(api.previewDisabled(),true);
 document.documentElement.dataset.iptvDevice='desktop';
 api.decorateRow(ch,row);
 assert.equal(typeof listeners.mouseenter,'function');
 assert.equal(typeof listeners.mouseleave,'function');
 document.documentElement.dataset.iptvDevice='mobile';
 listeners.mouseenter();
 assert.equal(api.previewDisabled(),true);
});
test('mobile preview overlay hidden, static build and latest script assets maintained',()=>{
 assert.match(css,/html\[data-iptv-device="mobile"\] body #channelPreview/);
 assert.match(css,/display:none!important;visibility:hidden!important;pointer-events:none!important/);
 assert.match(html,/app\.js\?v=tv-remote-buttons-20261122c/);
 assert.match(html,/advanced\.js\?v=advanced-health-compact-20261120a/);
 assert.match(html,/web-mobile-player\.css\?v=apple-more-20261120a/);
 assert.match(builder,/Preserve Web favorite card tap-to-play/);
 assert.match(builder,/fav_start=' function renderFavorites\(\)\{'/);
 assert.match(builder,/advanced-health-compact-20261120a/);
});

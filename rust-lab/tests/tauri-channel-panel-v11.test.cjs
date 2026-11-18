const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..','renderer');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const css=fs.readFileSync(path.join(base,'channel-panel-toggle.css'),'utf8');
const js=fs.readFileSync(path.join(base,'channel-panel-toggle.js'),'utf8');

test('channel panel collapse and reopen buttons are independent from app sidebar and have ARIA controls',()=>{
 assert.match(html,/id="channelPanelCollapse"[^>]*aria-controls="channelPanel"/);
 assert.match(html,/id="channelPanelReopen"[^>]*aria-controls="channelPanel"/);
 assert.match(html,/class="channel-panel" id="channelPanel"/);
 assert.match(html,/href="channel-panel-toggle.css"/);
 assert.match(html,/src="channel-panel-toggle.js"/);
 assert.match(html,/id="sidebarToggle"/);
});

test('collapsed view hides only channel panel, dedicates freed width to video, and reopens above the player',()=>{
 assert.match(css,/data-channel-panel-collapsed="true"[^\n]*#page-tv \.channel-panel\{display:none!important\}/);
 assert.match(css,/data-channel-panel-collapsed="true"[^\n]*#page-tv \.tv-layout\{[^\n]*grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/data-channel-panel-collapsed="true"[^\n]*#page-tv \.channel-panel-reopen\{display:flex!important\}/);
 assert.match(css,/data-channel-panel-collapsed="true"[^\n]*#page-tv \.watch-panel\{[^\n]*grid-column:1\/-1!important/);
 assert.match(css,/data-ui-style="cinema"/);
});

function harness(initial){
 const data={channelPanelCollapsed:undefined,uiStyle:'current'};
 const els={};
 for(const id of ['channelPanelCollapse','channelPanelReopen','channelPanel','channelList']){
  els[id]={id,attributes:{},handlers:{},scrollTop:id==='channelList'?143:0,
   setAttribute(key,value){this.attributes[key]=value;},
   addEventListener(key,fn){this.handlers[key]=fn;},
   click(){this.handlers.click();}};
 }
 const mem=new Map(initial===undefined?[]:[['openiptv:rustlab:channel-panel-collapsed',initial]]);
 const window={document:{documentElement:{dataset:data},getElementById:id=>els[id]},localStorage:{
  getItem:key=>mem.get(key)??null,setItem:(key,value)=>mem.set(key,value)},
  requestAnimationFrame:fn=>fn()};
 vm.runInNewContext(js,{window}, {filename:'channel-panel-toggle.js'});
 return {window,data,els,mem};
}
test('close, reopen and independent persisted choice without reloading player or channel list',()=>{
 const h=harness();
 assert.equal(h.data.channelPanelCollapsed,'false');
 const oldList=h.els.channelList;
 h.els.channelPanelCollapse.click();
 assert.equal(h.data.channelPanelCollapsed,'true');
 assert.equal(h.els.channelPanelReopen.attributes['aria-expanded'],'false');
 assert.equal(h.mem.get('openiptv:rustlab:channel-panel-collapsed'),'true');
 h.els.channelList.scrollTop=0;
 h.els.channelPanelReopen.click();
 assert.equal(h.data.channelPanelCollapsed,'false');
 assert.equal(h.els.channelList.scrollTop,143);
 assert.equal(h.els.channelList,oldList);
 assert.equal(h.mem.get('openiptv:rustlab:channel-panel-collapsed'),'false');
});
test('remembered collapse is restored without overwriting preference',()=>{
 const h=harness('true');
 assert.equal(h.data.channelPanelCollapsed,'true');
 assert.equal(h.els.channelPanelCollapse.attributes['aria-expanded'],'false');
});
test('localStorage quota does not prevent collapse or reopening',()=>{
 const h=harness();
 h.window.localStorage.setItem=()=>{throw new Error('QuotaExceededError');};
 assert.doesNotThrow(()=>h.els.channelPanelCollapse.click());
 assert.equal(h.data.channelPanelCollapsed,'true');
 assert.doesNotThrow(()=>h.els.channelPanelReopen.click());
 assert.equal(h.data.channelPanelCollapsed,'false');
});
test('media themes still have a single-column grid when list is collapsed',()=>{
 assert.match(css,/data-ui-style="glass"/);
 assert.match(css,/data-ui-style="broadcast"/);
 assert.match(css,/grid-template-areas:"video" "guide" "strip" "time" "tools"!important/);
 assert.match(css,/data-ui-style="bento"/);
});

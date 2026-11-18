'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const guide=require('../renderer/tv-guide-panel-toggle-v42368.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function fixture(saved=null){
 const data=new Map();
 if(saved!==null)data.set(guide.KEY,saved);
 const events=[];
 const storage={
  getItem:key=>data.get(key)||null,
  setItem:(key,value)=>{data.set(key,String(value));}
 };
 function node(id){
  const listeners={};
  return {
   id,listeners,attributes:{},title:'',
   setAttribute(k,v){this.attributes[k]=String(v);},
   addEventListener(k,callback){(listeners[k]??=[]).push(callback);},
   removeEventListener(k,callback){listeners[k]=(listeners[k]||[]).filter(fn=>fn!==callback);},
   click(){for(const cb of listeners.click||[])cb({type:'click',target:this});}
  };
 }
 const nodes=Object.fromEntries(['page-tv','themeGuidePanel','themeGuideHideBtn','themeGuideRestoreBtn']
  .map(id=>[id,node(id)]));
 const doc={documentElement:{dataset:{uiStyle:'cinema'}},
  getElementById:id=>nodes[id]||null};
 const win={Event:class{constructor(type){this.type=type;}},
  dispatchEvent:e=>events.push(e.type)};
 const create=()=>guide.createController({doc,storage,win});
 return {doc,nodes,events,data,create};
}
test('Guide panel: visible by default and offers accessible collapse control',()=>{
 const f=fixture(),c=f.create();
 assert.ok(c);assert.equal(c.isHidden(),false);
 assert.equal(f.doc.documentElement.dataset.tvGuideHidden,'false');
 assert.equal(f.nodes.themeGuideHideBtn.attributes['aria-expanded'],'true');
 assert.equal(f.nodes.themeGuideRestoreBtn.attributes['aria-expanded'],'true');
 c.dispose();
});
test('Guide panel: hide and restore operate with clicks and do not reload video',()=>{
 const f=fixture(),c=f.create();
 const eventCount=f.events.length;
 f.nodes.themeGuideHideBtn.click();
 assert.equal(c.isHidden(),true);
 assert.equal(f.doc.documentElement.dataset.tvGuideHidden,'true');
 assert.equal(f.nodes.themeGuideHideBtn.attributes['aria-expanded'],'false');
 assert.equal(f.data.get(guide.KEY),'1');
 f.nodes.themeGuideRestoreBtn.click();
 assert.equal(c.isHidden(),false);
 assert.equal(f.data.get(guide.KEY),'0');
 assert.equal(f.doc.documentElement.dataset.tvGuideHidden,'false');
 assert.equal(f.events.length,eventCount+2);
 assert.deepEqual(f.events,['resize','resize','resize']);
 c.dispose();
});
test('Guide panel: saved hidden state survives app relaunch and can be reopened',()=>{
 const f=fixture('1'),first=f.create();
 assert.equal(first.isHidden(),true);
 first.dispose();
 const second=f.create();
 assert.equal(second.isHidden(),true);
 f.nodes.themeGuideRestoreBtn.click();
 assert.equal(second.isHidden(),false);
 second.dispose();
});
test('Guide panel: if storage cannot be accessed, toggle stays functional',()=>{
 const f=fixture();
 const fail={
  getItem(){throw Error('storage blocked');},
  setItem(){throw Error('storage blocked');}
 };
 const c=guide.createController({doc:f.doc,storage:fail,win:{Event:class{
  constructor(type){this.type=type;}},dispatchEvent(){} }});
 assert.equal(c.isHidden(),false);
 f.nodes.themeGuideHideBtn.click();
 assert.equal(c.isHidden(),true);
 f.nodes.themeGuideRestoreBtn.click();
 assert.equal(c.isHidden(),false);
 c.dispose();
});
test('Guide panel: after dispose the old handlers do not mutate state',()=>{
 const f=fixture(),c=f.create();
 c.dispose();
 f.nodes.themeGuideHideBtn.click();
 assert.equal(c.isHidden(),false);
 assert.equal(f.data.has(guide.KEY),false);
});
test('Guide panel: only the three layouts with a guide are resized',()=>{
 const css=read('renderer/tv-guide-panel-toggle-v42368.css');
 for(const skin of guide.SUPPORTED){
  assert.match(css,new RegExp('html\\[data-ui-style="'+skin+'"\\]\\[data-tv-guide-hidden="true"\\] #page-tv \\.tv-layout'));
 }
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/grid-template-areas:"video" "controls" "strip" "time" "tools"!important/);
 assert.match(css,/grid-template-areas:"channels video" "channels controls" "channels time" "channels tools"!important/);
 assert.match(css,/grid-template-areas:"channels video" "channels controls" "channels strip" "channels time" "channels tools"!important/);
 assert.doesNotMatch(css,/data-ui-style="(?:bento|current|minimal|material3|hig|liquid|fluent|swiss)"/);
 assert.match(css,/@media\(max-width:760px\)/);
});
test('Guide panel: HTML has one hide and one restore button; scripts/styles load in correct order',()=>{
 const html=read('renderer/index.html');
 assert.equal((html.match(/id="themeGuideHideBtn"/g)||[]).length,1);
 assert.equal((html.match(/id="themeGuideRestoreBtn"/g)||[]).length,1);
 assert.match(html,/id="themeGuidePanel"[^>]*>[\s\S]*?id="themeGuideHideBtn"/);
 assert.match(html,/id="playerBox"[\s\S]*?id="themeGuideRestoreBtn"/);
 assert.ok(html.indexOf('src="theme-stage.js"')<html.indexOf('src="tv-guide-panel-toggle-v42368.js"'));
 assert.ok(html.indexOf('href="ui-refined.css"')<html.indexOf('href="tv-guide-panel-toggle-v42368.css"'));
 const js=read('renderer/tv-guide-panel-toggle-v42368.js');
 assert.doesNotMatch(js,/\.play\(|\.pause\(|srcObject|setAttribute\(['"]src|video\.src/);
});

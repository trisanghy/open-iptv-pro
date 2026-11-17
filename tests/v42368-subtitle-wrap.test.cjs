'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {wrapCaptionText,decorate}=require('../renderer/styled-video-captions-v42368.js');

const source='terbuka di dalam kumpulan. Ini sangat kumpulan, kemudian itu berkumpulan, hanya menggunakan peralatan di pameran yang lebih panjang.';
const target='Bề mặt áo của hiện vật rất thuận tiện, nhanh chóng, và có thể được quét qua mà không cần mở khối xử lý đặc biệt.';
const han='这是没有空格的长字幕需要自动换行而且不能丢失原文的任何一个字符。';

function mockRenderer({width=380,height=220,mode='native'}={}){
 const events={};let w=width,h=height;
 const cue={text:'',line:0,size:0};
 const track={cues:[cue],activeCues:[cue]};
 const overlay={style:{},textContent:'',hidden:false,children:[],appendChild(child){this.children.push(child)}};
 const parent={clientWidth:width,querySelector:()=>overlay};
 const video={
  clientWidth:width,clientHeight:height,parentElement:parent,
  paused:false,ended:false,readyState:4,
  textTracks:[track],classList:{add(){}},
  getBoundingClientRect:()=>({width:w,height:h})
 };
 const style={textContent:'',parentElement:{removeChild(){}}};
 const doc={
  head:{appendChild(){}},createElement:tag=>tag==='canvas'?{getContext:()=>null}:
   tag==='style'?style:{style:{},textContent:''},
  addEventListener:(name,fn)=>events[name]=fn,removeEventListener(){},
  defaultView:{addEventListener:(name,fn)=>events[name]=fn,removeEventListener(){}}
 };
 let rendered='',cleared=0;
 const base={
  show(value){rendered=value;cue.text=value;return mode;},
  clear(){cleared++;rendered='';},destroy(){},
  getMode:()=>mode,getText:()=>rendered
 };
 const captions=decorate(base,{video,doc});
 return {captions,cue,style,overlay,events,base,
  setSize:(newWidth,newHeight)=>{w=newWidth;h=newHeight;},get rendered(){return rendered},
  get cleared(){return cleared}};
}

test('Electron CC: complete Vietnamese and Indonesian long text wraps, without truncation',()=>{
 for(const raw of [source,target]){
  const result=wrapCaptionText(raw,230,25);
  assert.ok(result.includes('\n'),result);
  assert.equal(result.replace(/\n/g,' '),raw);
 }
});

test('Electron CC: long unspaced CJK and URLs break without dropping characters',()=>{
 for(const raw of [han,'https://example.com/some-very-long-no-space-path-123456789abcdef']){
  const result=wrapCaptionText(raw,140,23);
  assert.ok(result.includes('\n'));
  assert.equal(result.replace(/\n/g,''),raw);
 }
});

test('Electron CC: rendered width limits each line even for long words',()=>{
 const input='averyveryveryverylongword withoutbreaksXYZ';
 const result=wrapCaptionText(input,90,20,value=>Array.from(value).length*10);
 for(const line of result.split('\n'))assert.ok(line.length<=9,'Oversized line: '+line);
});

test('Electron CC: native cue displays both languages in multiple lines and grows upward',()=>{
 const ui=mockRenderer({width:420,height:290});
 ui.captions.setPreferences({content:'both',size:'large'});
 ui.captions.show(target,'vi',{translated:true,sourceText:source});
 assert.ok(ui.cue.text.includes('<c.source>'));
 assert.ok(ui.cue.text.includes('<c.translated>'));
 assert.ok(ui.cue.text.split('\n').length>=4);
 assert.equal(ui.cue.size,90);
 assert.equal(ui.cue.position,50);
 assert.equal(ui.cue.lineAlign,'end');
 assert.equal(ui.cue.line,92);
});

test('Electron CC: smaller video auto reduces effective font size to keep long captions visible',()=>{
 const ui=mockRenderer({width:300,height:170});
 ui.captions.setPreferences({content:'both',size:'xlarge'});
 ui.captions.show(target,'vi',{translated:true,sourceText:source});
 const applied=Number(ui.style.textContent.match(/font-size:(\d+)px/)?.[1]);
 assert.ok(applied>=12&&applied<34,'Expected adaptive smaller CC font, got '+applied);
});

test('Electron CC: native cue is re-wrapped after resize/fullscreen changes',()=>{
 const ui=mockRenderer({width:950,height:540});
 ui.captions.show(target,'vi',{translated:true,sourceText:source});
 const wideRows=ui.cue.text.split('\n').length;
 ui.setSize(360,220);
 ui.events.resize();
 assert.ok(ui.cue.text.split('\n').length>wideRows);
 ui.events.fullscreenchange();
 assert.ok(ui.cue.text.includes('<c.translated>'));
});

test('Electron CC: fallback uses separate wrapped source and translation blocks',()=>{
 const ui=mockRenderer({width:380,height:250,mode:'overlay'});
 ui.captions.show(target,'vi',{translated:true,sourceText:source});
 assert.equal(ui.overlay.children.length,2);
 assert.equal(ui.overlay.children[0].style.display,'block');
 assert.equal(ui.overlay.children[1].style.overflowWrap,'anywhere');
 assert.ok(ui.overlay.children[0].textContent.includes('\n'));
 assert.ok(ui.overlay.children[1].textContent.includes('\n'));
 const css=fs.readFileSync(path.join(__dirname,'../renderer/video-only-translated-caption-v42358.css'),'utf8');
 assert.match(css,/flex-direction:column!important/);
 assert.match(css,/overflow-wrap:anywhere/);
});

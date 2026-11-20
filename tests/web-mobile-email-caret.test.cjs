'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../cloud-sync.js'),'utf8');

function harness({mobile=true}={}){
 const start=source.indexOf(' function attachMobileEmailCaret(){');
 const end=source.indexOf('\n attachMobileEmailCaret();',start);
 assert.ok(start>=0&&end>start,'Isolated mobile caret function must exist');
 const caretFunction=source.slice(start,end);
 const listeners=new Map(),docListeners=new Map(),rafQueue=[],timeoutQueue=[];
 const textarea={
  value:'person@example.com',selectionStart:3,selectionEnd:3,scrollLeft:0,
  clientWidth:280,addEventListener:(event,callback,options)=>{
   listeners.set(event,{callback,options});
  }
 };
 const caret={hidden:true,style:{left:'0px'}};
 const doc={
  activeElement:textarea,
  createElement:type=>{
   assert.equal(type,'canvas');
   return {getContext:()=>({font:'',measureText:text=>({width:text.length*10})})};
  },
  addEventListener:(event,fn)=>docListeners.set(event,fn)
 };
 let frameId=0;
 const raf=fn=>{rafQueue.push(fn);return ++frameId;};
 const win={matchMedia:()=>({matches:mobile}),addEventListener:()=>{}};
 const ua=mobile?'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)':'Mozilla/5.0 (X11; Linux x86_64)';
 const nav={userAgent:ua,maxTouchPoints:mobile?5:0};
 const css={font:'16px Arial',paddingLeft:'12px',borderLeftWidth:'1px'};
 const run=new Function('emailInput','emailVisualCaret','navigator','window','document',
  'getComputedStyle','requestAnimationFrame','cancelAnimationFrame','setTimeout',
  caretFunction+'\n attachMobileEmailCaret();');
 run(textarea,caret,nav,win,doc,()=>css,raf,()=>{},fn=>{timeoutQueue.push(fn);});
 const flush=()=>{
  for(let i=0;i<40&&rafQueue.length;i++)rafQueue.shift()();
 };
 const fire=event=>{assert.ok(listeners.has(event),'Missing listener '+event);listeners.get(event).callback();flush();};
 return {textarea,caret,doc,listeners,docListeners,timeoutQueue,fire,flush};
}

test('iPhone cursor blinks at the actual editing position and moves on input',()=>{
 const h=harness();
 h.fire('focus');
 assert.equal(h.caret.hidden,false);
 assert.equal(h.caret.style.left,'43px'); // padding 12 + border 1 + 3 chars × 10
 h.textarea.selectionStart=7;h.textarea.selectionEnd=7;
 h.fire('input');
 assert.equal(h.caret.style.left,'83px');
 h.textarea.scrollLeft=20;
 h.fire('scroll');
 assert.equal(h.caret.style.left,'63px');
});

test('tap and text selection keep native editing intact',()=>{
 const h=harness();
 h.fire('focus');
 h.textarea.selectionStart=2;h.textarea.selectionEnd=8;
 h.fire('select');
 assert.equal(h.caret.hidden,true,'Do not cover selected text with the fake caret');
 h.textarea.selectionStart=4;h.textarea.selectionEnd=4;
 h.docListeners.get('selectionchange')();h.flush();
 assert.equal(h.caret.hidden,false);
 assert.equal(h.caret.style.left,'53px');
 const touch=h.listeners.get('touchend');
 assert.deepEqual(touch.options,{passive:true});
 touch.callback();h.flush();
 assert.equal(h.timeoutQueue.length,1,'WebKit delayed touch selection gets another measurement');
 h.timeoutQueue.shift()();h.flush();
 assert.equal(h.caret.hidden,false);
 h.doc.activeElement=null;
 h.fire('blur');
 assert.equal(h.caret.hidden,true);
});

test('no fake caret or extra touch handlers are installed on desktop browsers',()=>{
 const h=harness({mobile:false});
 assert.equal(h.listeners.size,0);
 assert.equal(h.caret.hidden,true);
});

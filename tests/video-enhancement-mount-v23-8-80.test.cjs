'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

function fakeBrowser(){
  const elements=new Map(),listeners=new Map();
  function create(id=''){
    const el={id,hidden:false,value:'',attrs:{},events:{},children:[],parent:null,
      classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=String(v);},
      getAttribute(k){return this.attrs[k]??null;},
      addEventListener(k,fn){(this.events[k]??=[]).push(fn);},
      click(){for(const fn of this.events.click??[])fn();},
      focus(){},scrollIntoView(){},
      append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);if(node.id)elements.set(node.id,node);}},
      insertAdjacentElement(direction,node){
        assert.equal(direction,'afterend');
        const list=this.parent.children,at=list.indexOf(this);
        assert.ok(at>=0);node.parent=this.parent;list.splice(at+1,0,node);
        if(node.id)elements.set(node.id,node);
      },
      querySelectorAll(){return [];}
    };
    Object.defineProperty(el,'innerHTML',{set(content){
      this.html=content;
      for(const match of content.matchAll(/id="([^"]+)"/g)){
        if(!elements.has(match[1]))elements.set(match[1],create(match[1]));
      }
    }});
    if(id)elements.set(id,el);
    return el;
  }
  const row=create('captionThirdRow');
  const doc={readyState:'loading',getElementById:id=>elements.get(id)||null,
    createElement:()=>create(),addEventListener(type,callback){
      if(!listeners.has(type))listeners.set(type,[]);
      listeners.get(type).push(callback);
    },
    dispatchEvent(event){
      for(const fn of listeners.get(event.type)?.slice()??[])fn(event);
    }
  };
  // Unified AI initializes on renderer-ready, *after* DOMContentLoaded.
  doc.addEventListener('openiptv:renderer-ready',()=>{
    if(!elements.has('unifiedAiToggle')){
      const cc=create('unifiedAiToggle');
      cc.setAttribute('aria-expanded','false');
      cc.addEventListener('click',()=>cc.setAttribute('aria-expanded',cc.getAttribute('aria-expanded')==='true'?'false':'true'));
      row.append(cc);
    }
    doc.dispatchEvent({type:'openiptv:unified-ai-ready'});
  });
  const values=new Map();
  const root={document:doc,localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},streamleaf:{}};
  const source=read('renderer/video-enhancement-v23-8-70.js');
  new Function('window','module',source)(root,{exports:{}});
  return {doc,row,elements,root};
}
test('enhancement waits until unified AI creates its anchor, then inserts beside it',()=>{
  const {doc,row,elements}=fakeBrowser();
  doc.dispatchEvent({type:'DOMContentLoaded'});
  assert.equal(elements.has('videoEnhanceToggle'),false);
  doc.dispatchEvent({type:'openiptv:renderer-ready'});
  assert.deepEqual(row.children.map(e=>e.id),['unifiedAiToggle','videoEnhanceToggle','videoEnhancePanel']);
  assert.equal(elements.get('videoEnhancePanel').hidden,true);
  assert.equal(elements.get('videoEnhanceToggle').getAttribute('aria-expanded'),'false');
  doc.dispatchEvent({type:'openiptv:unified-ai-ready'});
  assert.equal(row.children.length,3,'renderer-ready may be dispatched more than once');
});
test('clicking enhancement opens it and CC toggle closes it without losing CC controls',()=>{
  const {doc,elements}=fakeBrowser();
  doc.dispatchEvent({type:'openiptv:renderer-ready'});
  const ai=elements.get('videoEnhanceToggle'),cc=elements.get('unifiedAiToggle'),panel=elements.get('videoEnhancePanel');
  ai.click();
  assert.equal(panel.hidden,false);
  assert.equal(ai.getAttribute('aria-expanded'),'true');
  cc.click();
  assert.equal(panel.hidden,true);
  assert.equal(ai.getAttribute('aria-expanded'),'false');
  cc.click();
  ai.click();
  assert.equal(cc.getAttribute('aria-expanded'),'false');
  assert.equal(panel.hidden,false);
});
test('unified module emits a lifecycle event; CSS never draws an outer purple frame',()=>{
  const unified=read('renderer/unified-ai-inline-v1.js');
  const style=read('renderer/video-enhancement-v23-8-70.css');
  assert.match(unified,/dispatchEvent\(new Event\('openiptv:unified-ai-ready'\)\)/);
  assert.match(style,/#page-tv \.unified-ai-row \.video-enhance-toggle/);
  assert.match(style,/#page-tv \.unified-ai-row #videoEnhancePanel:not\(\[hidden\]\)/);
  assert.match(style,/border:0!important;outline:0!important;box-shadow:none!important/);
});

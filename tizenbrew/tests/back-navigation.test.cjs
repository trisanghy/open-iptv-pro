'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'),'utf8');
const start = html.indexOf('var lastBackEventAt=0;');
const end = html.indexOf('function keyHandler(e)',start);
assert.ok(start>0 && end>start,'Back handler exists');
const code = html.slice(start,end);
function harness(options={}){
 const state={modal:options.modal||false,player:options.player||false,history:options.history===undefined?2:options.history,active:options.active||'BUTTON'};
 const hits={closedDialog:0,closedPlayer:0,back:0,exited:0,prevent:0};
 const doc={activeElement:{tagName:state.active}};
 const elems={modal:{hidden:!state.modal},player:{hidden:!state.player},video:{pause(){}}};
 const win={history:{length:state.history,back(){hits.back++}},location:{href:''}};
 const tizen={application:{getCurrentApplication(){return {exit(){hits.exited++}}}}};
 const funcs=Function('document','window','byId','closeDialog','closePlayer','stopPair','tizen',code+'; return {handleBack,isRemoteBack};')(
   doc,win,k=>elems[k],()=>hits.closedDialog++,()=>hits.closedPlayer++,()=>{},tizen
 );
 funcs.handleBack({key:'Back',keyCode:10009,preventDefault(){hits.prevent++},stopImmediatePropagation(){}});
 return {hits,funcs,win};
}
test('Back closes a modal first',()=>{const {hits}=harness({modal:true});assert.equal(hits.closedDialog,1);assert.equal(hits.back,0);});
test('Back closes player without leaving',()=>{const {hits}=harness({player:true});assert.equal(hits.closedPlayer,1);assert.equal(hits.back,0);});
test('Back returns to TizenBrew from main screen',()=>{const {hits}=harness();assert.equal(hits.back,1);assert.equal(hits.prevent,1);});
test('Autolaunch back exits app when history is absent',()=>{const {hits}=harness({history:1});assert.equal(hits.exited,1);});
test('Backspace in input edits normally',()=>{const {funcs}=harness({active:'INPUT'});assert.equal(funcs.isRemoteBack({key:'Backspace',keyCode:8}),false);});
test('Tizen hardware Back event is registered',()=>{assert.match(html,/addEventListener\('tizenhwkey'/);assert.match(html,/exitModuleBtn/);});
test('App script remains valid',()=>{const matches=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];assert.ok(matches.length>0);matches.forEach(m=>assert.doesNotThrow(()=>new Function(m[1])));});

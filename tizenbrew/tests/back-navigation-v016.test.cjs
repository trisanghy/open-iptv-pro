'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const test=require('node:test'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const js=html.slice(html.indexOf('var lastBackEventAt=0;'),html.indexOf('function keyHandler(e){'));
function run(opts={}){
 const hits={modal:0,player:0,replace:[],back:0,exit:0};
 const elems={modal:{hidden:!opts.modal},player:{hidden:!opts.player},channelPicker:{hidden:true},video:{pause(){}}};
 const win={history:{length:opts.fail?1:2,back(){hits.back++;}},location:{protocol:'http:',host:'localhost:8081',replace(v){hits.replace.push(v)}}};
 const tizen={application:{getCurrentApplication(){return {exit(){hits.exit++}}}}};
 const f=Function('window','tizen','byId','stopPair','closeDialog','closePlayer','document',js+'return {handleBack,exitModule,isRemoteBack};')(
 win,tizen,id=>elems[id],()=>{},()=>hits.modal++,()=>hits.player++,{activeElement:{tagName:'BUTTON'}});
 f.handleBack({key:'Back',keyCode:10009,preventDefault(){},stopImmediatePropagation(){}});
 return hits;
}
test('Back on home returns via real WebView history',()=>{const r=run();assert.equal(r.back,1);assert.equal(r.replace.length,0);});
test('Back in modal only closes modal',()=>{let h=run({modal:true});assert.equal(h.modal,1);assert.equal(h.replace.length,0)});
test('Back in player only closes player',()=>{let h=run({player:true});assert.equal(h.player,1);assert.equal(h.replace.length,0)});
test('Fallback exits native app',()=>assert.equal(run({fail:true}).exit,1));
test('Single compact bottom exit replaces former duplicate exits',()=>{assert.equal((html.match(/id="exitModuleBtn"/g)||[]).length,1);assert.doesNotMatch(html,/id="navExitBtn"/);assert.doesNotMatch(html,/id="exitPlayer"/);assert.match(html,/id="tizenTubeBtn"/);});
test('App scripts parse',()=>{let chunks=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];assert.ok(chunks.length);for(const m of chunks)assert.doesNotThrow(()=>new Function(m[1]));});

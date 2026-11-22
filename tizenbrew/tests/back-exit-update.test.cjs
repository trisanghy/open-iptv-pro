'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const packageInfo=JSON.parse(fs.readFileSync(path.join(__dirname,'../../package.json'),'utf8'));
function block(a,b){
 const start=html.indexOf(a),end=html.indexOf(b,start+a.length);
 assert.ok(start>=0&&end>start,'Missing code boundary: '+a);
 return html.slice(start,end);
}
test('TizenBrew v0.1.27 metadata matches on-screen header',()=>{
 assert.equal(packageInfo.version,'0.1.27');
 assert.equal(packageInfo.version,packageInfo.tizenbrewEdition);
 assert.ok(html.includes('Samsung Tizen Edition · TizenBrew v0.1.27'));
});
test('Back from the main screen navigates real WebView history (not the proxy port)',()=>{
 const code=block('function exitModule(){','function refreshTizenBrewModules(){');
 let paused=0,stopped=0,backCalls=0;
 const context={
   byId:id=>({pause:()=>{paused++;}}),
   stopPair:()=>{stopped++;},
   window:{history:{length:2,back:()=>{backCalls++;}}},
   notify:()=>{throw Error('Should not show fallback message')}
 };
 const exit=vm.runInNewContext(code+'\nexitModule;',context);
 exit();
 assert.equal(stopped,1);
 assert.equal(paused,1);
 assert.equal(backCalls,1);
 assert.doesNotMatch(code,/loc\.replace|localhost:8081\/tizenbrew-ui|history\.go\(-2\)/);
});
test('Direct launched module with no WebView history can use native exit',()=>{
 const code=block('function exitModule(){','function refreshTizenBrewModules(){');
 let exited=0;
 const exit=vm.runInNewContext(code+'\nexitModule;',{
   stopPair:()=>{},byId:()=>({pause(){}}),
   window:{history:{length:1}},
   tizen:{application:{getCurrentApplication:()=>({exit:()=>{exited++;}})}},
   notify:()=>{throw Error('Unexpected fallback')}
 });
 exit();
 assert.equal(exited,1);
});
test('Remote Back closes modal, closes player then quits app',()=>{
 const code=block('function handleBack(e){','function keyHandler(e){');
 let modal=true,player=true,exits=0,modalClosed=0,playerClosed=0;
 const handler=vm.runInNewContext('var lastBackEventAt=0;\n'+code+'\nhandleBack;',{
   Date:{now:(()=>{let n=1000;return()=>n+=850;})()},
   byId:id=>({modal:{get hidden(){return !modal;}},player:{get hidden(){return !player;}},channelPicker:{hidden:true}})[id],
   closeDialog:()=>{modal=false;modalClosed++;},
   closePlayer:()=>{player=false;playerClosed++;},closeChannelPicker:()=>{},
   exitModule:()=>{exits++;}
 });
 const e={preventDefault(){},stopImmediatePropagation(){}};
 handler(e);assert.equal(modalClosed,1);assert.equal(exits,0);
 handler(e);assert.equal(playerClosed,1);assert.equal(exits,0);
 handler(e);assert.equal(exits,1);
});
test('Module requests GetModules(true) to force TizenBrew server to reload its in-memory catalog',()=>{
 const code=block('function refreshTizenBrewModules(){','function openTizenTube(){');
 const sent=[],timeouts=[],instances=[];
 class WS{
   constructor(url){assert.equal(url,'ws://127.0.0.1:8081');instances.push(this);}
   send(value){sent.push(JSON.parse(value));}
   close(){this.closed=true;}
 }
 const refresh=vm.runInNewContext(code+'\nrefreshTizenBrewModules;',{
  WebSocket:WS,
  setTimeout:(fn)=>{timeouts.push(fn);return 2;},
  clearTimeout:()=>{}
 });
 refresh();
 const ws=instances[0];ws.onopen();
 assert.equal(sent.length,1);assert.equal(sent[0].type,4);assert.equal(sent[0].payload,true);
 ws.onmessage({data:JSON.stringify({type:4,payload:[{appName:'Open IPTV Pro TV',version:'0.1.20'}]})});
 assert.equal(ws.closed,true);
 assert.match(html,/refreshTizenBrewModules\(\);/);
});
test('Keydown and keyup are deduplicated while still listening for Samsung hardware Back',()=>{
 assert.match(html,/var backDownHandled=false,backDownReset=0/);
 assert.match(html,/if\(backDownHandled\)\{\s*backDownHandled=false/);
 assert.match(html,/document\.addEventListener\('tizenhwkey'/);
 assert.match(html,/window\.addEventListener\('tizenhwkey'/);
});

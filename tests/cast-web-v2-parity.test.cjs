'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,'renderer',x),'utf8');
const html=read('index.html'),web=read('web-cast-v2.js');
const css=read('web-cast-v2.css'),icons=read('web-cast-icons.js'),bridge=read('desktop-cast-web-adapter.js');
test('Desktop packages the Web V2 dialog: 3 tabs plus paired TV controls',()=>{
 for(const id of ['cxTabPair','cxTabCast','cxTabAir','cxTvControls','cxDisconnect',
                  'cxCastScan','cxCastPlay','cxAirOpen','cxTvMute','cxTvVolume']){
  assert.ok(web.includes(id),'missing '+id);
 }
 for(const asset of ['web-cast-v2.js','web-cast-v2.css','web-cast-icons.js','desktop-cast-web-adapter.js']){
  assert.ok(html.includes(asset),'asset not loaded: '+asset);
 }
 assert.match(css,/#iptvCastOverlay/);
 assert.match(css,/cx-desktop-device-select/);
 assert.match(css,/\.cx-tabs/);
 for(const item of [web,icons,bridge])assert.doesNotThrow(()=>new vm.Script(item));
});
test('Native bridge uses real Cast and AirPlay; no phantom AirPlay connection',()=>{
 for(const name of ['castDiscover','castPlay','castStop','openAirplay','capabilities',
                    'OpenIPTVDesktopTVPair','onChannelChanged']){
  assert.ok(bridge.includes(name),'missing '+name);
 }
 assert.match(bridge,/getAirplayState:\(\)=>\(\{connected:false\}\)/);
 assert.match(web,/disconnectPair:disconnect/);
 assert.match(web,/state\.selected/);
 assert.match(web,/pair\.connect\(code\)/);
});

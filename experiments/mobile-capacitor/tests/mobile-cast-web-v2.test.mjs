import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mobileCastCapabilities} from '../src/mobile-cast-v2.mjs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const page=read('../index.html');
const app=read('../src/main.js');
const ui=read('../public/web-cast-v2.js');
const css=read('../public/web-cast-v2.css');
const adapter=read('../src/mobile-cast-v2.mjs');
const pair=read('../public/web-tv-pair.js');
const config=JSON.parse(read('../public/cloud-config.json'));

test('Mobile embeds exact Web Cast V2 3-tab popup and ordered dependencies',()=>{
 for(const file of ['web-cast-v2.css','web-tv-pair.js','web-cast-icons.js','web-cast-v2.js']){
  assert.ok(page.includes(file),'missing '+file);
 }
 const pos=['supabase-sdk.js','web-tv-pair.js','web-cast-icons.js','web-cast-v2.js','/src/main.js']
   .map(s=>page.indexOf(s));
 assert.ok(pos.every(x=>x>=0));assert.deepEqual(pos,[...pos].sort((a,b)=>a-b));
 for(const id of ['cxTabPair','cxTabCast','cxTabAir','cxTvControls','cxTvToggle',
   'cxTvPrev','cxTvNext','cxTvMute','cxTvVolume','cxPin','cxConnect','cxDisconnect']){
  assert.ok(ui.includes(id),'missing Web V2 component '+id);
 }
 assert.match(css,/#iptvCastOverlay/);
 assert.match(css,/\.cx-tabs/);
 assert.match(css,/safe-area-inset-top/);
});
test('TV pairing is the same encrypted protocol and uses real Web configuration',()=>{
 assert.equal(config.enabled,true);
 assert.match(config.url,/^https:\/\/[a-z0-9-]+\.supabase\.co$/);
 assert.ok(config.publishableKey?.startsWith('sb_publishable_'));
 assert.match(pair,/namedCurve:'P-256'/);
 assert.match(pair,/name:'AES-GCM'/);
 assert.match(pair,/command-ack/);
 assert.match(pair,/createController/);
 assert.match(ui,/pair\.connect\(code\)/);
 assert.match(ui,/openiptv:remote-playback-state/);
 assert.match(app,/openiptv:remote-player-attached/);
 assert.match(app,/onChannelChanged\?\.\(c,urls\[0\]\)/);
});
test('One Cast button opens the tabs; never directly launches Android/iOS picker',()=>{
 assert.match(app,/installMobileCastV2/);
 assert.match(app,/\$\('#castCurrent'\)\.onclick=\(\)=>\{try\{mobileCast\.open\(\)/);
 assert.doesNotMatch(app,/\$\('#castCurrent'\)\.onclick=\(\)=>\{\s*const v=.*chooseCast/);
 assert.match(ui,/mobileCastVolumeBridge/);
 assert.match(adapter,/webkitShowPlaybackTargetPicker/);
 assert.match(adapter,/launchAndroidCast/);
});
test('Device connection badges require an observed signal, never a simulated device',()=>{
 const android=mobileCastCapabilities({platform:'android'});
 assert.equal(android.googleCastAvailable,true);
 assert.equal(android.googleCastConnected,false);
 assert.equal(android.airplayConnected,false);
 const ios=mobileCastCapabilities({platform:'ios',hasAirplayPicker:true});
 assert.equal(ios.airplayAvailable,true);
 assert.equal(ios.airplayConnected,false);
 const iosConnected=mobileCastCapabilities({platform:'ios',wireless:true});
 assert.equal(iosConnected.airplayConnected,true);
 const remote=mobileCastCapabilities({platform:'web',hasRemotePrompt:true,remoteState:'connected'});
 assert.equal(remote.googleCastConnected,true);
 assert.equal(mobileCastCapabilities({platform:'web',remoteState:'connecting'}).googleCastConnected,false);
 assert.match(adapter,/does not offer a JS device enumeration API/);
 assert.match(adapter,/Safari hoặc Phản chiếu màn hình/);
});
test('Mobile version and Android/iOS build workflow are consistent',()=>{
 const pkg=JSON.parse(read('../package.json'));
 const lock=JSON.parse(read('../package-lock.json'));
 const yaml=read('../../../.github/workflows/mobile-apk.yml');
 assert.equal(pkg.version,'4.23.17-mobile.36');
 assert.equal(lock.version,pkg.version);
 assert.equal(lock.packages[''].version,pkg.version);
 assert.match(yaml,/MOBILE_VERSION: 4\.23\.17-mobile\.36/);
 assert.match(yaml,/MOBILE_TAG: mobile\/v4\.23\.17\.36/);
 assert.match(yaml,/if: false # Stable-only/);
});

'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {rewriteDashManifest}=require('../src/stream-proxy.cjs');
const {headersForStream}=require('../src/hls-relay.cjs');
const html=read('renderer/index.html');

test('4.23.22 appearance and accent are one card immediately after styles',()=>{
 const stylePos=html.indexOf('id="uiStyleSettings"'),appearancePos=html.indexOf('id="appearanceSettings"'),backupPos=html.indexOf('id="backupSettings"');
 assert.ok(stylePos>0&&appearancePos>stylePos&&backupPos>appearancePos);
 assert.equal((html.match(/id="appearanceSettings"/g)||[]).length,1);
 for(const value of ['light','dark','amoled','auto'])assert.match(html,new RegExp('name="appearanceMode" value="'+value+'"'));
 assert.match(html,/id="colorWheel"/);
 assert.match(html,/id="wheelHole"/);
 assert.match(html,/id="wheelShadeIndicator"/);
 assert.match(html,/id="themePicker"/);
 assert.doesNotMatch(html,/id="appearanceAccentSettings"/);
 assert.doesNotMatch(html,/id="accentColorSlider"/);
 assert.doesNotMatch(html,/name="uiNavLayout"/);
 assert.doesNotMatch(html,/id="appearanceModeSlider"/);
 const features=read('renderer/features.js');
 assert.match(features,/function wheelPick\(/);
 assert.match(features,/config\.sidebarVisible/);
 assert.match(features,/sidebarToggleBtn/);
 assert.match(read('renderer/styles.css'),/\.topbar\{display:none!important\}/);
 assert.match(html,/id="sidebarToggleBtn"/);
});

test('check/Snapshot dropdowns synchronize with existing worker selectors',()=>{
 const app=read('renderer/app.js');
 for(const field of ['checkConcurrencySelect','snapshotConcurrencySelect']){
  assert.ok(html.includes('id="'+field+'"'));
  const pos=html.indexOf('id="'+field+'"');const tail=html.slice(pos,html.indexOf('</select>',pos));
  for(const value of ['1','4','8','16','32'])assert.ok(tail.includes('value="'+value+'"'));
  assert.ok(app.includes(field));
 }
 assert.match(app,/store\[key\]=n;controls\.forEach/);
 assert.match(html,/id="checkConcurrencyState"/);
 assert.match(html,/id="snapshotConcurrencyState"/);
 assert.doesNotMatch(html,/data-nav-to="shots"/);
});

test('FFmpeg timeshift minutes are validated and mapped to real rolling segments',()=>{
 const file=read('src/timeshift.cjs'),calls=[];
 const child={on(){},stderr:{on(){}},kill(){}};
 const sandbox={module:{exports:{}},exports:{},setInterval,clearInterval,Buffer,process,URL,console};
 sandbox.require=(name)=>name==='node:child_process'?{spawn:(_binary,args)=>{calls.push(args);return child;}}:require(name);
 vm.runInNewContext(file,sandbox,{filename:'timeshift.cjs'});
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'open-iptv-v42317-test-'));
 try{
  const service=sandbox.module.exports.createTimeshift({baseDir:base,ffmpegPath:'ffmpeg'});
  for(const minutes of [5,10,15,30]){
   service.start('https://example.com/live.m3u8',minutes);
   const args=calls.at(-1),i=args.indexOf('-hls_list_size');
   assert.equal(args[i+1],String(minutes*12));
   assert.equal(service.status().minutes,minutes);
   service.stop();
  }
  assert.throws(()=>service.start('https://example.com/live.m3u8',999),/không hợp lệ/);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
 const preload=read('src/preload.cjs'),main=read('src/main.cjs'),advanced=read('renderer/advanced.js');
 assert.match(preload,/timeshift:start',url,minutes/);
 assert.match(main,/timeshift\.start\(url,minutes\)/);
 assert.match(advanced,/startTimeshift\(ch\.url,replayMinutes\(\)\)/);
 assert.match(advanced,/seekRange\(v,replayMinutes\(\)\*60\)/);
});

test('DASH manifest is detected and gets original HTTPS BaseURL for proxied segment resolution',()=>{
 const xml='<?xml version="1.0"?><MPD type="static"><Period><AdaptationSet><Representation><SegmentTemplate media="video/$Number$.m4s" initialization="video/init.mp4"/></Representation></AdaptationSet></Period></MPD>';
 const result=rewriteDashManifest(xml,'https://example.test/iptv/manifest.mpd?token=private');
 assert.match(result,/<BaseURL>https:\/\/example\.test\/iptv\/<\/BaseURL>/);
 assert.match(result,/video\/\$Number\$\.m4s/);
 assert.throws(()=>rewriteDashManifest('<!DOCTYPE MPD><MPD/>','https://example.test/x.mpd'),/an toàn/);
 assert.equal(headersForStream('https://example.test/manifest.mpd',{range:'bytes=0-200'}).Range,undefined);
 assert.equal(headersForStream('https://example.test/segment.m4s',{range:'bytes=0-200'}).Range,'bytes=0-200');
 assert.match(read('renderer/app.js'),/Dash\.MediaPlayer\(\)\.create\(\)/);
 assert.match(read('renderer/app.js'),/modifyRequestURL/);
 assert.match(html,/node_modules\/dashjs\/dist\/modern\/umd\/dash\.all\.min\.js/);
});

test('Electron relay rewrites a real DASH MPD response through the loopback path',async()=>{
 const {relayStream}=require('../src/stream-proxy.cjs');
 const manifest='<?xml version="1.0"?><MPD xmlns="urn:mpeg:dash:schema:mpd:2011" type="static"><Period><AdaptationSet mimeType="video/mp4"><Representation id="v1" bandwidth="500000"><SegmentTemplate timescale="1" duration="5" media="part/$Number$.m4s" initialization="part/init.mp4"/></Representation></AdaptationSet></Period></MPD>';
 let outgoing=null,status=0,seenUrl='';
 const upstream='https://video.example.test/path/master.mpd';
 const fake=async url=>{
  seenUrl=url;
  const response=new Response(manifest,{status:200,headers:{'content-type':'application/dash+xml'}});
  Object.defineProperty(response,'url',{value:upstream});return response;
 };
 const result={writeHead(code,headers){status=code;this.headers=headers;},end(chunk){outgoing=Buffer.isBuffer(chunk)?chunk.toString('utf8'):String(chunk||'');}};
 await relayStream({req:{headers:{}},res:result,url:upstream,proxyUrl:u=>'http://127.0.0.1:3210/stream?url='+encodeURIComponent(u),fetcher:fake});
 assert.equal(seenUrl,upstream);assert.equal(status,200);
 assert.match(result.headers['Content-Type'],/dash\+xml/);
 assert.match(outgoing,/<BaseURL>https:\/\/video\.example\.test\/path\/<\/BaseURL>/);
 assert.match(outgoing,/part\/\$Number\$\.m4s/);
});

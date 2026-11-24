'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const h=fs.readFileSync('tv-web-v063.html','utf8'),s=fs.readFileSync('tv-web-v063.js','utf8'),r=fs.readFileSync('tv-web-receiver-v063.js','utf8'),original=fs.readFileSync('tizen-web/source-tv-receiver-v063.js','utf8'),page=fs.readFileSync('tizen-web/source-tv-v063.html','utf8');
test('Original TV receiver playback core is copied byte for byte',()=>{
 const start=original.indexOf(' function leaveCinema(){'),end=original.indexOf(' function handleCommand(command)',start);
 a.ok(start>=0&&end>start);a.ok(r.includes(original.slice(start,end)));
 const video=page.match(/<video id="tvVideo"[^>]*><\/video>/)[0];a.ok(h.includes(video));
 for(const src of ['supabase-sdk.js','hls.min.js','dash.all.min.js','web-tv-pair.js?v=tv-local-handoff-20261122d'])a.ok(h.includes('src="'+src+'"'));
 a.match(h,/id="channels"/);a.match(h,/TV Web · v0\.1\.63/);a.doesNotMatch(h,/id="tvPairPin"|id="webLabLegacyHooks"/);
 a.doesNotMatch(s,/new Hls|new root\.Hls|function startNativeVideo|function stagesFor|function loadVideo/);
 a.doesNotMatch(r,/createReceiver\(|void boot\(/);new vm.Script(s);new vm.Script(r);
});
function mock(){
 const events={},calls=[],classes=new Set(),screen={hidden:true},title={},errors=[];
 const video={paused:false,readyState:2,canPlayType:()=>true,addEventListener(k,f){events[k]=f;},pause(){},removeAttribute(){},load(){},set src(v){calls.push(v);},play(){calls.push('play');return Promise.resolve();},requestFullscreen(){calls.push('fullscreen');return Promise.resolve();}};
 const document={getElementById:id=>id==='tvVideo'?video:id==='tvPlayer'?screen:title,body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},documentElement:{}};
 const window={document,location:{protocol:'https:'},OpenIPTVTVPair:{validateUrl:x=>x},setTimeout(){return 1;},clearTimeout(){},addEventListener(){}};
 vm.runInNewContext(r,{window,URL,Promise});return {window,video,screen,calls,events,classes,errors};
}
test('Original receiver loads selected URL and enters video fullscreen on playing event',()=>{
 const m=mock(),p=m.window.OpenIPTVTVWebPlayer;p.open('https://example.org/live.m3u8','Test','1',{});
 a.deepEqual(m.calls,['https://example.org/live.m3u8','play']);m.events.playing();a.deepEqual(m.calls,['https://example.org/live.m3u8','play','fullscreen']);a.ok(m.classes.has('tv-cinema'));p.close();a.equal(m.screen.hidden,true);
});
test('UI delegates directly without another engine or source-selection layer',()=>{
 const i=s.indexOf('function play(c)'),j=s.indexOf('function togglePlayback',i);
 a.match(s.slice(i,j),/OpenIPTVTVWebPlayer\.open\(c\.url,c\.name,c\.id/);
 a.doesNotMatch(s.slice(i,j),/\.src=|\.play\(|requestFullscreen|fetch\(/);
});

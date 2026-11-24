'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const original=read('tizen-web/source-tv-receiver-v065.js'),r=read('tv-web-player-receiver-v065.js'),s=read('tv-web-v065.js'),h=read('tv-web-v065.html'),ph=read('tv-web-player-v065.html'),page=read('tizen-web/source-tv-v065.html');
test('Receiver identical except final local entry point',()=>{
 const end=' void boot();\n})(window);';
 a.ok(original.endsWith(end+'\n')||original.endsWith(end));
 const prefix=original.slice(0,original.lastIndexOf(end));
 a.ok(r.startsWith(prefix));a.match(r,/void loadVideo\(valid,payload\.name,payload\.id\)/);
 a.ok(ph.includes(page.match(/<video id="tvVideo"[^>]*><\/video>/)[0]));
 a.ok(ph.includes(page.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/)[0]));
 a.match(ph,/web-cast-v2\.css\?v=tv-history-keyboard-20261122d/);
 for(const f of ['supabase-sdk.js','hls.min.js','dash.all.min.js','web-tv-pair.js?v=tv-local-handoff-20261122d'])a.ok(ph.includes('src="'+f+'"'));
 a.doesNotMatch(h,/<video|src="(?:hls\.min|dash\.all|tv-web-player-receiver)/);a.doesNotMatch(s,/OpenIPTVTVWebPlayer|function togglePlayback|function closePlayer/);
 a.doesNotMatch(ph,/src="tv-web-v065.js"/);
 new vm.Script(r);new vm.Script(s);
});
test('Channel selection navigates to independent document without exposing URL in address',()=>{
 const i=s.indexOf('function play(c)'),j=s.indexOf('function restorePlayedChannel(',i);
 const data={},calls=[];
 const env={window:{OpenIPTVTVPair:{validateUrl:x=>x}},sessionStorage:{setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]},Date,stopHomePreview(){},notify(){},location:{assign:u=>calls.push(u)}};
 vm.runInNewContext(s.slice(i,j),env);
 env.play({id:'1',name:'test',url:'https://example.org/test?secret=abc'});
 a.deepEqual(calls,['https://trisanghy.github.io/open-iptv-pro/tv-web-player-v065.html']);
 a.equal(JSON.parse(data['openiptv-tv-web-handoff-v1']).url,'https://example.org/test?secret=abc');
});
test('Module launcher does not redirect player document',()=>{
 const p=JSON.parse(read('package.json'));a.match(p.websiteURL,/tv-web-v065\.html$/);
 for(const path of ['/open-iptv-pro/tv-web-v065.html','/open-iptv-pro/tv-web-player-v065.html']){
  let dest='';vm.runInNewContext(read(p.main),{location:{origin:'https://trisanghy.github.io',pathname:path,replace:u=>dest=u}});a.equal(dest,'');
 }
});

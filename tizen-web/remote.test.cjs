'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const original=read('tizen-web/source-tv-receiver-v065.js'),r=read('tv-web-receiver-v066.js'),s=read('tv-web-list-v066.js'),h=read('tv-web-list-v066.html'),ph=read('tv-web-v066.html'),page=read('tizen-web/source-tv-v065.html');
test('Original receiver and video DOM retained in top document',()=>{
 const end=' void boot();\n})(window);',prefix=original.slice(0,original.lastIndexOf(end));
 a.ok(r.startsWith(prefix));a.ok(ph.includes(page.match(/<video id="tvVideo"[^>]*><\/video>/)[0]));
 a.ok(ph.includes(page.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/)[0]));
 a.match(ph,/<iframe id="tvChannelList"/);a.doesNotMatch(h,/<video|src="(?:hls\.min|dash\.all|tv-web-receiver)/);
 a.match(r,/if\(card\)card\.click\(\);\s*else void loadVideo/);new vm.Script(r);new vm.Script(s);
});
test('Channel OK calls parent receiver synchronously, no page or URL handoff',()=>{
 const i=s.indexOf('function play(c)'),j=s.indexOf('window.OpenIPTVTVWebList=',i),calls=[];
 const env={window:{OpenIPTVTVPair:{validateUrl:x=>x},parent:{OpenIPTVTVWebLocal:{play:x=>calls.push(x)}}},stopHomePreview(){},notify(){}};
 vm.runInNewContext(s.slice(i,j),env);env.play({id:'1',name:'Test',url:'https://example.org/test'});
 a.equal(calls.length,1);a.equal(calls[0].url,'https://example.org/test');a.doesNotMatch(s.slice(i,j),/postMessage|location\.assign|setTimeout|sessionStorage/);
});
test('Exact history source invokes original card; other source invokes original loadVideo',()=>{
 const i=r.indexOf(' function bootLocalList(){'),j=r.indexOf(' bootLocalList();',i),calls=[],listeners={};
 const frame={contentWindow:{focus(){}},addEventListener(){}},video={focus(){},addEventListener(){}};
 const node={addEventListener(){},textContent:''};
 const env={root:{addEventListener(){},history:{length:1}},d:{body:{classList:{add(){},remove(){}}},addEventListener(){}},$:(id)=>id==='tvChannelList'?frame:node,video,cinemaButton:node,MutationObserver:class{observe(){}},safeHistoryUrl:x=>x,show:x=>calls.push(x),watchHistory:[{url:'https://example.org/a'}],historyCards:()=>[{click:()=>calls.push('original card')}],loadVideo:(u)=>calls.push(u),cleanupPlayer(){}};
 vm.runInNewContext(r.slice(i,j)+'bootLocalList();',env);
 env.root.OpenIPTVTVWebLocal.play({url:'https://example.org/a'});a.ok(calls.includes('original card'));
 env.root.OpenIPTVTVWebLocal.play({url:'https://example.org/b'});a.ok(calls.includes('https://example.org/b'));a.equal(frame.hidden,true);
});

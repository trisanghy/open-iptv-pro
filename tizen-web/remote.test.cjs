'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=JSON.parse(fs.readFileSync('package.json','utf8')),url='https://trisanghy.github.io/open-iptv-pro/tv.html';
test('actual receiver page, not localhost playback or iframe',()=>{
 a.equal(p.websiteURL,url);a.equal(p.packageType,'mods');a.equal(p.serviceFile,undefined);
 for(const f of ['tizenbrew/index.html','tizenbrew/bootstrap.html']){
 const h=fs.readFileSync(f,'utf8');let dest='';vm.runInNewContext(h.match(/<script>([\s\S]*?)<\/script>/)[1],{location:{replace:u=>dest=u}});a.equal(dest,url);a.doesNotMatch(h,/<iframe|127\.0\.0\.1|new Hls/);}
});
test('remote adapter delegates to receiver buttons',()=>{
 let handler,clicks=[];const nodes={tvVideo:{paused:true},tvPlayer:{hidden:false},tvLocalPlay:{click(){clicks.push('play');}},tvLocalPause:{click(){clicks.push('pause');}}};
 const s=fs.readFileSync(p.main,'utf8');
 vm.runInNewContext(s,{location:{origin:'https://trisanghy.github.io',pathname:'/open-iptv-pro/tv.html'},window:{},document:{addEventListener:(k,f)=>handler=f,getElementById:id=>nodes[id]}});
 const e={key:'MediaPlayPause',preventDefault(){},stopImmediatePropagation(){}};handler(e);nodes.tvVideo.paused=false;handler(e);a.deepEqual(clicks,['play','pause']);
 a.doesNotMatch(s,/new Hls|fetch\(|localStorage|webapis/);
});
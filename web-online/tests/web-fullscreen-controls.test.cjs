'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),css=read('web-fullscreen-controls.css'),js=read('web-fullscreen-controls.js');
const builder=read('web-online/prepare-web.py'),api=require('../../web-fullscreen-controls.js');
test('fullscreen toolbar augments the existing one without duplicate input or player',()=>{
 for(const id of ['fsEpgBtn','fsFitBtn','fsLinkBtn','fsEpgPanel','fsFitPanel','fsLinkPanel','fsEpgItems','fsFitItems','fsLinkItems','fsGuidePage','fsFavBtn','fsMuteBtn','fsVolumeSlider','fsPipBtn','fsExit','video','videoFit','manualStreamSelect']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 }
 assert.ok(html.indexOf('id="fsLinkBtn"')<html.indexOf('id="fsExit"'));
 assert.match(html,/web-fullscreen-controls\.css\?v=epg-player-details-20261120a/);
 assert.match(html,/web-fullscreen-controls\.js\?v=epg-player-details-20261120a/);
 assert.match(builder,/web-fullscreen-controls\.js/);
});
test('new tools only show in fullscreen or mobile theater; exit is on the far right',()=>{
 assert.match(css,/#playerBox:is\(:fullscreen,\.mobile-theater\)/);
 assert.match(css,/#fsExit\{[^}]*order:100!important/);
 assert.match(css,/#fsExit\{[^}]*margin-left:4px!important/);
 assert.match(css,/\.fs-popup\[hidden\]\{display:none!important\}/);
 assert.match(js,/aria-expanded/);
});
test('full EPG uses actual schedule only',()=>{
 const ch={id:'vtv1'},now=1000000,guide={};
 const find=()=>[{start:0,end:20,title:'Expired'},{start:now-1000,end:now+3000,title:'Current'},{start:now+3000,end:now+6000,title:'Next'}];
 assert.deepEqual(api.epgItems(guide,ch,now,{find}).map(x=>x.title),['Current','Next']);
 assert.deepEqual(api.epgItems(null,ch,now,{find}),[]);
 assert.deepEqual(api.epgItems(guide,null,now,{find}),[]);
});
test('manual links mirror the existing select and trigger its change handler',()=>{
 const url='https://example.net/stream?token=abc';
 const picker={disabled:false,value:url,options:[{value:url,textContent:'Link chính · example.net',disabled:false},{value:'https://backup.net/hls',textContent:'Dự phòng 1',disabled:false},{value:'',textContent:'Empty',disabled:false}]};
 assert.deepEqual(api.listChoices(picker),[{value:url,label:'Link chính · example.net',selected:true},{value:'https://backup.net/hls',label:'Dự phòng 1',selected:false}]);
 picker.disabled=true;assert.deepEqual(api.listChoices(picker),[]);
 assert.match(js,/links\.dispatchEvent\(new Event\('change'/);
 assert.match(js,/fit\.dispatchEvent\(new Event\('change'/);
});
test('fullscreen guide exits to original EPG, without changing saved channel data',()=>{
 assert.match(js,/doc.exitFullscreen\(\)\)\.then\(navigate\)/);
 assert.match(js,/exitTheater/);
 assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(/);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createController,KEYS}=require('../renderer/auto-pip-v42363.js');
function fixture(){
 const values=new Map(),listeners=new Map();
 let current='tv',opens=0,closes=0,pendingResolve=null;
 const doc={pictureInPictureEnabled:true,pictureInPictureElement:null,exitPictureInPicture(){
  closes++;doc.pictureInPictureElement=null;return Promise.resolve();
 }};
 const video={readyState:4,paused:false,ended:false,
  addEventListener:(name,fn)=>listeners.set(name,fn),
  requestPictureInPicture(){opens++;doc.pictureInPictureElement=video;return Promise.resolve(video);}
 };
 const storage={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v)};
 const ctrl=createController({video,doc,storage,getPage:()=>current});
 return {video,doc,storage,ctrl,values,get opens(){return opens},get closes(){return closes},
  setPage:p=>{current=p}};
}
test('v4.23.63 PiP sidebar opens by default, TV closes, same video remains playing',async()=>{
 const s=fixture();
 s.setPage('other');s.ctrl.onPageChange('fav','tv');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(s.opens,1);assert.equal(s.doc.pictureInPictureElement,s.video);
 s.setPage('tv');s.ctrl.onPageChange('tv','fav');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(s.closes,1);assert.equal(s.video.paused,false);
});
test('v4.23.63 focus/background options are independently saved and off by default',async()=>{
 const s=fixture();
 assert.equal(s.ctrl.getOption('navigate'),true);
 assert.equal(s.ctrl.getOption('minimize'),false);
 assert.equal(s.ctrl.getOption('blur'),false);
 await s.ctrl.onNativeEvent('minimize');assert.equal(s.opens,0);
 s.ctrl.setOption('minimize',true);
 await s.ctrl.onNativeEvent('minimize');assert.equal(s.opens,1);
 await s.ctrl.onNativeEvent('focus');assert.equal(s.closes,1);
 s.ctrl.setOption('navigate',false);
 s.setPage('other');s.ctrl.onPageChange('sources','tv');
 assert.equal(s.ctrl.getOption('navigate'),false);
 assert.equal(s.opens,1);
});
test('v4.23.63 missing playback and browser PiP do not cause unwanted effects',async()=>{
 const s=fixture();s.video.paused=true;
 s.ctrl.onPageChange('fav','tv');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(s.opens,0);
 s.video.paused=false;s.doc.pictureInPictureEnabled=false;
 delete s.video.requestPictureInPicture;
 assert.equal(await s.ctrl.manual(),false);
});
test('v4.23.63 PiP requests are invalidated when returning TV before promise settles',async()=>{
 const s=fixture();let finish;
 s.video.requestPictureInPicture=()=>{
  return new Promise(resolve=>{finish=()=>{s.doc.pictureInPictureElement=s.video;resolve(s.video);};});
 };
 s.setPage('other');s.ctrl.onPageChange('fav','tv');
 s.setPage('tv');s.ctrl.onPageChange('tv','fav');
 finish();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(s.doc.pictureInPictureElement,null);
 assert.equal(s.closes,1);
});
test('v4.23.63 auto PiP uses existing player and Electron native focus events',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const root=path.join(__dirname,'..');
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 assert.match(read('renderer/app.js'),/OpenIPTVAutoPiP\?\.onPageChange/);
 assert.match(read('src/main.cjs'),/executeJavaScript\(.+true\)/);
 assert.match(read('renderer/features.js'),/OpenIPTVAutoPiP\?\.manual/);
 for(const name of ['Navigate','Minimize','Blur'])
  assert.match(read('renderer/index.html'),new RegExp('id="pipAuto'+name+'"'));
 assert.ok(KEYS.navigate&&KEYS.minimize&&KEYS.blur);
});

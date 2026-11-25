'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
exports.run=async function(page){
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.waitForFunction(()=>!!window.PositronIntelligence&&!!window.IPTVState&&!!window.PositronWatchFlow);
  await page.setViewportSize({width:1920,height:1080});
  await page.evaluate(()=>{
   const native=window.IPTVState;native.setPage('tv');window.PositronWatchFlow.close();
   window.__p356Native=native;
   const channel={id:'p356-qa',name:'QA offline fixture',group:'QA',url:'https://example.invalid/qa',status:'alive'};
   window.IPTVState=Object.freeze({...native,getCurrent:()=>channel,getChannels:()=>[]});
   const v=document.getElementById('video');
   window.__p356Own=['paused','readyState','currentSrc','currentTime','playbackRate','seeking'].map(k=>[k,Object.getOwnPropertyDescriptor(v,k)]);
   const values={paused:false,readyState:4,currentSrc:'blob:qa-controlled-stall',currentTime:10,playbackRate:1,seeking:false};
   for(const k of Object.keys(values))Object.defineProperty(v,k,{configurable:true,get:()=>values[k]});
   window.__p356Restore=()=>{for(const [k,d] of window.__p356Own){if(d)Object.defineProperty(v,k,d);else delete v[k];}};
  });
  await page.evaluate(()=>document.getElementById('poWatchFlowToggle').focus());
  await page.keyboard.press('F6');
  await page.waitForFunction(()=>{const p=document.getElementById('poWatchFlowPanel');return p&&!p.hidden&&p.dataset.poAiActive==='true';});
  const before=await page.evaluate(()=>window.PositronIntelligence.getProfile());
  assert.equal(before.observations,0,'fixture must have fresh model');
  assert.equal(before.enabled,false,'consent must default off');
  await page.locator('#poAIMLConsent').check();
  await page.evaluate(()=>document.getElementById('video').dispatchEvent(new Event('playing')));
  const shots=[];
  const folder='positron-evidence/p5-20-rounds';fs.mkdirSync(folder,{recursive:true});
  const shot=async(tag,width,height)=>{await page.setViewportSize({width,height});const filename='positron-p51356-viewing-clock-'+tag+'-'+width+'x'+height+'-real.png';const b=await page.screenshot({path:folder+'/'+filename,animations:'disabled'});shots.push({filename,sha256:crypto.createHash('sha256').update(b).digest('hex')});};
  await shot('before',1920,1080);await shot('before',720,900);await delay(44000);
  const stalled=await page.evaluate(()=>window.PositronIntelligence.getProfile());
  assert.equal(stalled.observations,0,'controlled frozen media timeline');
  await shot('after',1920,1080);await shot('after',720,900);
  let realMedia=null;
  {
   await page.setViewportSize({width:1920,height:1080});
   await page.evaluate(async()=>{
    window.__p356Restore();const v=document.getElementById('video');
    v.dispatchEvent(new Event('pause'));
    // 55 seconds of locally generated, silent PCM WAV: no network/media rights dependency.
    const rate=8000,n=rate*55,b=new ArrayBuffer(44+n*2),d=new DataView(b);
    const str=(o,s)=>{for(let i=0;i<s.length;i++)d.setUint8(o+i,s.charCodeAt(i));};
    str(0,'RIFF');d.setUint32(4,b.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');
    d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);
    d.setUint32(24,rate,true);d.setUint32(28,rate*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);
    str(36,'data');d.setUint32(40,n*2,true);
    v.muted=true;window.__p356Media=URL.createObjectURL(new Blob([b],{type:'audio/wav'}));v.src=window.__p356Media;
    await v.play();
   });
   await page.waitForFunction(()=>document.getElementById('video').currentTime>1,null,{timeout:12000});
   await page.waitForFunction(()=>window.PositronIntelligence.getProfile().observations===1,null,{timeout:52000});
   realMedia=await page.evaluate(()=>{const v=document.getElementById('video');return {profile:window.PositronIntelligence.getProfile(),time:v.currentTime,ready:v.readyState,local:v.currentSrc===window.__p356Media};});
   assert.ok(realMedia.local&&realMedia.time>=35&&realMedia.ready>=2,'actual local media timeline must advance');
   await shot('after-local-media',1920,1080);
   await page.evaluate(()=>{const v=document.getElementById('video');v.pause();v.removeAttribute('src');v.load();URL.revokeObjectURL(window.__p356Media);});
  }
  assert.equal(errors.length,0,errors.join('; '));
  fs.writeFileSync('positron-evidence/audit-p51356-viewing-clock.json',JSON.stringify({version:'P5.1.356',app:'4.23.441',realElectron:true,pass:true,scope:'Before/after time interval on fixed renderer; pre-fix baseline independently captured in run 45521032519; simulated frozen media and real local PCM, not live IPTV',stalled,realMedia,screenshots:shots,errors},null,2));
};

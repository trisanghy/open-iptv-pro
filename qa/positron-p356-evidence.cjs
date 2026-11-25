'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright-core');
const phase=process.argv[2],port=Number(process.argv[3]),out='positron-preflight-evidence';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 assert.ok(['before','after'].includes(phase));fs.mkdirSync(out,{recursive:true});
 let browser;
 for(let i=0;i<45&&!browser;i++){try{browser=await chromium.connectOverCDP('http://127.0.0.1:'+port,{timeout:1800});}catch{await delay(1000);}}
 assert.ok(browser,'Electron CDP unavailable');
 try{
  let page;for(let i=0;i<45&&!page;i++){page=browser.contexts()[0]?.pages().find(p=>p.url().includes('index.html'));if(!page)await delay(700);}
  assert.ok(page,'Electron renderer unavailable');
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
  await delay(44000);
  const stalled=await page.evaluate(()=>window.PositronIntelligence.getProfile());
  assert.equal(stalled.observations,phase==='before'?1:0,'controlled frozen media timeline');
  const screenshots=[];
  for(const [width,height] of [[1920,1080],[720,900]]){
   await page.setViewportSize({width,height});
   const file=out+'/p356-'+phase+'-stall-'+width+'x'+height+'-real.png';
   const buf=await page.screenshot({path:file,animations:'disabled'});
   assert.equal(buf.readUInt32BE(16),width);assert.equal(buf.readUInt32BE(20),height);
   screenshots.push({file,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
  }
  let realMedia=null;
  if(phase==='after'){
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
   const file=out+'/p356-after-local-media-1920x1080-real.png';
   const buf=await page.screenshot({path:file,animations:'disabled'});
   screenshots.push({file,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
   await page.evaluate(()=>{const v=document.getElementById('video');v.pause();v.removeAttribute('src');v.load();URL.revokeObjectURL(window.__p356Media);});
  }
  assert.equal(errors.length,0,errors.join('; '));
  fs.writeFileSync(out+'/p356-'+phase+'.json',JSON.stringify({phase,realElectron:true,scope:'frozen media DOM timeline simulated; after also plays local PCM audio; not live IPTV or decoded video validation',stalled,realMedia,screenshots,errors},null,2));
 }finally{await browser.close().catch(()=>{});}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});

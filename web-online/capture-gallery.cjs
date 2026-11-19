'use strict';
/**
 * Capture the shipped Web UI, not a mockup. iOS and Android outputs are
 * Chromium browser/device emulations on CI, never real-device Safari photos.
 * The synthetic demo playlist/video is generated locally; no third-party
 * streams, tokens or personal data are included in captures.
 */
const fs=require('node:fs'),os=require('node:os'),http=require('node:http');
const path=require('node:path'),cp=require('node:child_process');
const {chromium,devices}=require('playwright-core');
const root=path.resolve(process.argv[2]||'_site');
const assets=path.join(root,'assets');
const gallery=path.join(assets,'gallery');
const names=['desktop-tv','desktop-sources','desktop-epg','desktop-settings',
             'ios-tv','ios-channels','ios-sources','ios-favorites',
             'android-tv','android-channels','android-epg','android-settings'];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json',
 '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml',
 '.mp4':'video/mp4','.xml':'application/xml'};
const demoFile=path.join(assets,'gallery-demo.mp4');
function makeDemo(){
 const ffmpeg=process.env.CAPTURE_FFMPEG||'ffmpeg';
 const font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
 const vf=fs.existsSync(font)?
  "drawtext=fontfile="+font+":text='OPEN IPTV PRO':fontsize=68:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-45,"+
  "drawtext=fontfile="+font+":text='DEMO STREAM - LOCAL SAMPLE':fontsize=27:fontcolor=0x78e1bd:x=(w-text_w)/2:y=(h-text_h)/2+55":
  "null";
 const r=cp.spawnSync(ffmpeg,['-nostdin','-y','-v','error','-f','lavfi','-i',
   'color=c=0x102939:s=1280x720:r=24','-vf',vf,'-t','8','-pix_fmt','yuv420p',
   '-c:v','libx264','-preset','ultrafast','-movflags','+faststart',demoFile],
   {timeout:60000,stdio:'pipe'});
 if(r.status!==0||!fs.existsSync(demoFile)){
  throw Error('Cannot generate a real original demo video: '+String(r.stderr||'').slice(0,700));
 }
}
function demoStore(){
 const sourceId='gallery_demo_source';
 const channelSpecs=[
 ['DEMO 01 • Trình phát','01 · Demo','demo-01'],
 ['DEMO 02 • Kênh tin tức','01 · Demo','demo-02'],
 ['DEMO 03 • Văn hóa','01 · Demo','demo-03'],
 ['DEMO 04 • Thiên nhiên','02 · Khám phá','demo-04'],
 ['DEMO 05 • Âm nhạc','02 · Khám phá','demo-05'],
 ['DEMO 06 • Công nghệ','02 · Khám phá','demo-06']
 ];
 return {sources:[{id:sourceId,name:'Nguồn minh họa (video tự tạo)',origin:'Nguồn nội bộ phục vụ ảnh tài liệu',type:'file',enabled:true,addedAt:'2026-11-19T00:00:00Z'}],
 channels:channelSpecs.map(([name,group,id])=>({
  id,sourceId,name,group,tvgId:id,logo:'assets/icon.png',
  url:'assets/gallery-demo.mp4',alternates:[],status:'uncertain'
 })),
 favorites:[],snapshots:{},folders:[],groupOrder:[],channelOrder:{},
 collapsedGroups:[],current:'',volume:.75,videoFit:'contain',checkerVersion:2};
}
function deviceOptions(platform){
 const android=devices['Pixel 7'],iphone=devices['iPhone 15 Pro'];
 if(platform==='desktop')return {viewport:{width:1536,height:960},deviceScaleFactor:1,
   isMobile:false,hasTouch:false,colorScheme:'dark'};
 const profile=platform==='ios'?iphone:android;
 return {viewport:platform==='ios'?{width:393,height:852}:{width:412,height:915},
   deviceScaleFactor:1,isMobile:true,hasTouch:true,colorScheme:'dark',
   userAgent:profile.userAgent};
}
function server(){
 return http.createServer((req,res)=>{
  const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const name=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));
  if(!(name===root||name.startsWith(root+path.sep))||!fs.existsSync(name)||!fs.statSync(name).isFile()){
   res.writeHead(404);res.end('Not found');return;
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(name)]||'application/octet-stream',
    'Cache-Control':'no-store'});
  fs.createReadStream(name).pipe(res);
 });
}
async function select(page,destination){
 await page.evaluate(pageId=>{window.IPTVState?.setPage(pageId);},destination);
 await page.waitForTimeout(350);
 const active=await page.locator('#page-'+destination).evaluate(el=>el.classList.contains('active-page'));
 if(!active)throw Error('Target page is not active: '+destination);
}
async function capture(page,name,position='top'){
 await page.evaluate(()=>{document.querySelector('.content')?.scrollTo({top:0,left:0});window.scrollTo(0,0);});
 if(position==='channels'){
   await page.locator('#page-tv .channel-panel').scrollIntoViewIfNeeded();
   await page.waitForTimeout(220);
 }
 if(position==='top')await page.waitForTimeout(180);
 const output=path.join(gallery,name+'.png');
 await page.screenshot({path:output,fullPage:false,animations:'disabled',timeout:25000});
 const b=fs.readFileSync(output);
 if(b.length<12000||b.subarray(1,4).toString()!=='PNG')
   throw Error('Screenshot empty/invalid: '+name+' '+b.length);
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
 if(width<380||height<800)throw Error('Screenshot dimensions unexpected '+name+': '+width+'x'+height);
 console.log('Captured',name,width,height,b.length,'bytes');
}
async function run(){
 if(!fs.existsSync(path.join(root,'index.html')))throw Error('Missing current Web player');
 fs.mkdirSync(gallery,{recursive:true});
 makeDemo();
 const httpServer=server();
 await new Promise(resolve=>httpServer.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+httpServer.address().port+'/';
 const binary=process.env.CAPTURE_CHROME || 'google-chrome';
 let browser;
 try{
  browser=await chromium.launch({executablePath:binary,headless:true,args:[
   '--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'
  ]});
  for(const platform of ['desktop','ios','android']){
   const context=await browser.newContext(deviceOptions(platform));
   await context.addInitScript(({store})=>{
     // A private profile for CI. Never read user IPTV sources or cloud tokens.
     localStorage.setItem('open-iptv-pro-4',JSON.stringify(store));
     localStorage.setItem('open-iptv-pro-settings-v1',
      JSON.stringify({appearanceMode:'dark',sidebarVisible:true,channelPanelVisible:true,
       autoRefreshEPGOnStartup:false,accent:'#bc7cff'}));
     localStorage.setItem('open-iptv-pro-mobile-intro-dismissed-v1','true');
   },{store:demoStore()});
   const page=await context.newPage();
   page.on('pageerror',e=>console.warn(platform,'page exception:',e.message.slice(0,250)));
   await page.goto(url+(platform==='desktop'?'?view=desktop':'?view=mobile'),{
     waitUntil:'domcontentloaded',timeout:30000
   });
   await page.waitForFunction(()=>window.IPTVState&&window.IPTVState.getChannels().length===6,{timeout:16000});
   await page.waitForTimeout(1000);
   await page.evaluate(async()=>{
     const intro=document.querySelector('#softwareDownloadIntroClose');
     if(intro && intro.getClientRects().length)intro.click();
     try{await window.IPTVState.playChannel('demo-01');}catch(e){console.warn('Demo play unavailable',e);}
   });
   await page.waitForTimeout(1000);
   if(platform==='desktop'){
    await capture(page,'desktop-tv');
    await select(page,'sources');await capture(page,'desktop-sources');
    await select(page,'epg');await capture(page,'desktop-epg');
    await select(page,'settings');await capture(page,'desktop-settings');
   }else if(platform==='ios'){
    await capture(page,'ios-tv');
    await capture(page,'ios-channels','channels');
    await select(page,'sources');await capture(page,'ios-sources');
    await select(page,'fav');await capture(page,'ios-favorites');
   }else{
    await capture(page,'android-tv');
    await capture(page,'android-channels','channels');
    await select(page,'epg');await capture(page,'android-epg');
    await select(page,'settings');await capture(page,'android-settings');
   }
   await context.close();
  }
  // Replace old narrow/compressed automated screenshot files with verified gallery
  // images while keeping old asset URLs valid for caches and README links.
  fs.copyFileSync(path.join(gallery,'desktop-tv.png'),path.join(assets,'player-desktop.png'));
  fs.copyFileSync(path.join(gallery,'ios-tv.png'),path.join(assets,'player-mobile.png'));
  const manifest={
   source:'Open IPTV Pro Web Online build from web/online',
   screenshotMethod:'GitHub Actions headless Chromium device emulation; NOT Safari or native Android screenshots',
   channels:'Locally generated demo media; no third-party IPTV streams',
   files:names.map(file=>({file:'assets/gallery/'+file+'.png',viewport:file.split('-')[0]}))
  };
  fs.writeFileSync(path.join(gallery,'README.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log('Gallery verified: '+names.length+' screenshots');
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>httpServer.close(resolve));
  if(fs.existsSync(demoFile))fs.unlinkSync(demoFile);
 }
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;});

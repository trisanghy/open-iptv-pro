from pathlib import Path
import re,shutil,json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]/'renderer'
state={'sources':[{'id':'src','name':'M3U test','type':'file','enabled':True}], 'channels':[{'id':'vtv3','sourceId':'src','name':'VTV3','url':'https://tv.example/vtv3.m3u8','group':'01 - VTV NGUON 1','status':'uncertain'},{'id':'vtv4','sourceId':'src','name':'VTV4','url':'https://tv.example/vtv4.m3u8','group':'01 - VTV NGUON 1','status':'uncertain'}], 'favorites':[],'snapshots':{},'folders':[],'groupOrder':[],'collapsedGroups':[],'current':'','volume':.8,'videoFit':'contain','checkerVersion':3,'autoRefreshM3UOnStart':False}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'index.html').read_text()
 html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>|<link[^>]+>|<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>', '', html)
 page.set_content(html,wait_until='domcontentloaded',timeout=15000)
 page.evaluate('''(state)=>{
  const data={'open-iptv-pro-4':JSON.stringify(state)};
  Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v)}});
  window.IPTVPrimaryPersistence={initialRaw:JSON.stringify(state),nativeReady:false};
  document.documentElement.dataset.desktopRuntime='tauri2-rust';
  window.streamleaf={proxy:async url=>'http://127.0.0.1:9999/stream?key=local&url='+encodeURIComponent(url),mediaKind:async()=>({hls:true,mode:'live',seekable:false}),compatStop:async()=>{},compatStart:async()=>({url:'http://127.0.0.1:9999/compat?key=local&id=one&file=live.m3u8'}),stopTimeshift:async()=>{},capabilities:async()=>({snapshotBase:'',ffmpegExists:true})};
  HTMLMediaElement.prototype.canPlayType=function(){return 'probably'};
  HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
  HTMLMediaElement.prototype.pause=function(){};
  HTMLMediaElement.prototype.load=function(){};
  Object.defineProperty(HTMLMediaElement.prototype,'currentSrc',{configurable:true,get(){return this.__mockCurrentSrc!==undefined?this.__mockCurrentSrc:this.getAttribute('src')||''}});
  Object.defineProperty(HTMLMediaElement.prototype,'error',{configurable:true,get(){return this.__mockError||null}});
 }''',state)
 for file in ['core-browser.js','advanced-core.js','epg.js','favorites-core.js','source-edit.js','adaptive-playback.js','playback-reentry.js','health-evidence.js','snapshot-freshness.js','app.js']:
  page.add_script_tag(content=(root/file).read_text())
 assert page.evaluate('!!window.IPTVState'),errors
 result=page.evaluate('''async()=>{
  const one=()=>window.IPTVState.playChannel('vtv3');
  const two=()=>window.IPTVState.playChannel('vtv4');
  await one(); const first=document.querySelector('#video').getAttribute('src');
  await two(); await one();
  const second=document.querySelector('#video').getAttribute('src');
  const v=document.querySelector('#video');
  v.__mockError={code:4};v.__mockCurrentSrc=first;v.dispatchEvent(new Event('error'));
  await new Promise(r=>setTimeout(r,50));
  const afterOld=document.querySelector('#video').getAttribute('src');
  delete v.__mockCurrentSrc;
  return {first,second,afterOld,current:window.IPTVState.getCurrent()?.name};
 }''')
 print('UI_RESULT',result)
 print('PAGE_ERRORS',errors[:5]);print('first != second?',result['first']!=result['second'],'old error ignored?',result['afterOld']==result['second'])
 assert result['first']!=result['second']
 assert result['second']==result['afterOld'],result
 assert result['current']=='VTV3'
 assert not errors,errors
 b.close()

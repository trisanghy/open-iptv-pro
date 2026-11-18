from pathlib import Path
from io import BytesIO
import base64, json, re
from PIL import Image
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]/'renderer'
def png(rgb):
 im=Image.new('RGB',(3,3),rgb);f=BytesIO();im.save(f,format='PNG');return 'data:image/png;base64,'+base64.b64encode(f.getvalue()).decode()
red,green=png((255,0,0)),png((0,255,0))
url='https://example.test/stream.m3u8'
state={'sources':[{'id':'s1','name':'Nguồn demo','type':'file','enabled':True}], 'channels':[{'id':'c1','sourceId':'s1','name':'VTV Test','url':url,'group':'General','status':'uncertain'}], 'favorites':[],'snapshots':{url:{'data':red,'date':'01:00:00 11/11/2026','method':'FFmpeg'}},'folders':[],'groupOrder':[],'collapsedGroups':[],'current':'','volume':0.8,'videoFit':'contain','checkerVersion':3,'snapshotConcurrency':1,'snapshotSkipExisting':True}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1400,'height':900})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(re.sub(r'<script[^>]+src=\"[^\"]+\"[^>]*></script>|<link[^>]+>|<meta[^>]+http-equiv=\"Content-Security-Policy\"[^>]*>', '', (root/'index.html').read_text()),wait_until='domcontentloaded',timeout=5000)
 page.evaluate('''(input) => {
  const data = new Map([['open-iptv-pro-4',JSON.stringify(input.state)]]);
  Object.defineProperty(window,'localStorage',{value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},configurable:true});
  window.IPTVPrimaryPersistence={initialRaw:JSON.stringify(input.state),nativeReady:false};
  window.streamleaf={snapshot:async()=>({data:input.green,method:'Mock-FFmpeg'}),capabilities:async()=>({snapshotBase:'',ffmpegExists:true}),dvrList:async()=>({jobs:[{id:'j1',status:'scheduled',title:'Bản tin',channelName:'VTV Test',startAt:Date.now()+3600000,endAt:Date.now()+7200000}]})};
 }''', {'state':state,'green':green})
 for mod in ['core-browser.js','favorites-core.js','source-edit.js','adaptive-playback.js','health-evidence.js','snapshot-freshness.js','channel-organizer.js','channel-pointer-dnd.js','app.js','player-ux.js','fullscreen-panels.js']:
  page.add_script_tag(content=(root/mod).read_text())
 print('READY',page.evaluate('!!window.IPTVState && !!window.IPTVFullscreenPanels'))
 print('ERRORS_INITIAL',errors[:10])
 page.evaluate('document.querySelector(".nav[data-page=shots]").click()')
 page.wait_for_selector('.shot-card')
 before=page.evaluate('''() => {window.__shot=document.querySelector('.shot-card');window.__group=document.querySelector('.shot-group');return window.__shot.querySelector('img').src}''')
 page.evaluate('document.querySelector("#shotsAllBtn").click()')
 page.wait_for_function("window.IPTVState.getStore().snapshots['https://example.test/stream.m3u8'].method === 'Mock-FFmpeg'",timeout=6000)
 page.wait_for_timeout(500)
 print('DOM',page.evaluate('''() => ({sameCard:window.__shot===document.querySelector('.shot-card'),sameGroup:window.__group===document.querySelector('.shot-group'),changed:window.__shot.querySelector('img').src===window.IPTVState.getStore().snapshots['https://example.test/stream.m3u8'].data})'''))
 page.evaluate('document.querySelector(".nav[data-page=tv]").click()')
 try:
  page.locator('#fullscreenBtn').click(timeout=4000)
  page.wait_for_timeout(400)
  print('FULLSCREEN',page.evaluate('document.fullscreenElement?.id||"not-open"'))
  page.locator('#fsEPG').click(timeout=3000)
  print('EPG',page.locator('#fsDrawerContent').inner_text()[:130])
  page.locator('#fsDVR').click(timeout=3000)
  page.wait_for_timeout(200)
  print('DVR',page.locator('#fsDrawerContent').inner_text()[:130])
 except Exception as e: print('FULLSCREEN_TEST_LIMITATION',str(e)[:300])
 print('ERRORS_FINAL',errors[:10])
 browser.close()

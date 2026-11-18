from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import re,shutil
root=Path(__file__).resolve().parents[1]
old='#EXTM3U\n#EXTINF:-1 tvg-id="vtv1" group-title="Tin tức",VTV1\nhttps://old.example/1.ts\n#EXTINF:-1 tvg-id="vtv2" group-title="Tin tức",VTV2\nhttps://old.example/2.ts\n'
new='#EXTM3U\n#EXTINF:-1 tvg-id="vtv1" group-title="Tin tức",VTV1\nhttps://new.example/1.ts\n#EXTINF:-1 tvg-id="vtv3" group-title="Giải trí",VTV3\nhttps://new.example/3.ts\n'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=b.new_page(viewport={'width':1440,'height':920});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text();html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html);html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {
  const saved={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=String(v),removeItem:k=>delete saved[k]}});
  window.HTMLMediaElement.prototype.play=()=>Promise.resolve();window.HTMLMediaElement.prototype.pause=function(){};window.confirm=()=>true;
  window.__castCalls=[];
  window.streamleaf={capabilities:async()=>({native:true,platform:'darwin',ffmpegExists:true}),loadURL:async()=>({content:window.__newM3U}),
   proxy:async url=>url,mediaKind:async()=>({hls:false}),castDiscover:async()=>[{id:'test-tv',name:'Living Room Google TV'}],
   castPlay:async(id,url,name)=>{window.__castCalls.push({id,url,name});return {active:{name:'Living Room Google TV'}};},
   openAirplay:async url=>{window.__castCalls.push({airplay:url});return {page:'http://lan/player'};},
   castLan:async url=>({page:'http://192.168.1.3:33333/player/test'}),castStop:async()=>({stopped:true})};
 }''')
 page.evaluate('(text)=>window.__newM3U=text',new)
 for name in ['languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','epg.js','favorites-core.js','source-edit.js','app.js','cast-ui.js','features.js','advanced.js','collector.js','doctor-v2.js']:
  page.add_script_tag(content=(root/'renderer'/name).read_text())
 page.evaluate('text=>window.IPTVState.importSource("Nguồn A","https://old.example/list.m3u",text,"url")',old)
 page.locator('.channel-item .channel-star').first.click()
 expect(page.locator('#favCount')).to_have_text('1')
 page.locator('.nav[data-page="sources"]').click()
 expect(page.locator('.src-edit')).to_have_count(1)
 page.locator('.src-edit').click()
 expect(page.locator('#sourceEditURL')).to_have_value('https://old.example/list.m3u')
 page.locator('#sourceEditURL').fill('https://new.example/list.m3u')
 page.screenshot(path=str(root/'docs/images/edit-m3u-v4-21.png'),full_page=True)
 page.locator('#modalConfirm').click()
 expect(page.locator('#modal')).to_have_class(re.compile('hidden'))
 assert page.evaluate('window.IPTVState.getStore().sources[0].origin')=='https://new.example/list.m3u'
 assert page.evaluate('window.IPTVState.getStore().favoriteKeys.length')==1
 assert page.evaluate('window.IPTVState.getStore().channels.find(x=>x.name==="VTV1").url')=='https://new.example/1.ts'
 assert page.evaluate('window.IPTVState.getStore().channels.find(x=>x.name==="VTV1").group')=='Tin tức'
 page.locator('.nav[data-page="settings"]').click()
 page.locator('#appLanguage').select_option('en')
 page.locator('.nav[data-page="sources"]').click()
 assert 'Edit' in page.locator('.src-edit').inner_text()
 page.locator('#appLanguage').count()
 page.locator('.nav[data-page="tv"]').click()
 ch=page.evaluate('window.IPTVState.getStore().channels.find(x=>x.name==="VTV1").id')
 page.evaluate('(ch)=>window.IPTVState.playChannel(ch)',ch)
 page.locator('#castBtn').click()
 expect(page.locator('#castModal')).not_to_have_class(re.compile('hidden'))
 expect(page.locator('#castDevices option')).to_have_count(1,timeout=7000)
 assert 'Living Room' in page.locator('#castDevices').inner_text()
 page.locator('#castPlay').click()
 expect(page.locator('#castStatus')).to_contain_text('Living Room')
 assert page.evaluate('window.__castCalls.length')==1
 page.screenshot(path=str(root/'docs/images/cast-v4-21.png'),full_page=True)
 page.locator('#castLink').click();expect(page.locator('#castUrl')).to_have_value('http://192.168.1.3:33333/player/test')
 page.locator('#castAirplay').click();assert page.evaluate('window.__castCalls.some(x=>x.airplay)')
 page.locator('#castStop').click()
 assert not errors,errors
 print('UI v4.21 PASSED: editing URL without losing favorites, English locale, Chromecast, LAN and AirPlay controls')
 b.close()

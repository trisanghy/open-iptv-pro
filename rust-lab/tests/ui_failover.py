from pathlib import Path
import re,shutil
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=b.new_page(viewport={'width':1450,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text();html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>';html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {
  const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v)}});
  HTMLMediaElement.prototype.play=function(){return Promise.resolve()}; HTMLMediaElement.prototype.pause=function(){};
  window.Hls=class {static isSupported(){return true}static Events={ERROR:'error',LEVEL_SWITCHED:'level'};loadSource(u){window.__playedUrls=(window.__playedUrls||[]).concat(u)}attachMedia(){}on(){}destroy(){}};
 }''')
 for n in ['core-browser.js','advanced-core.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js','advanced.js']:
  page.add_script_tag(content=(root/'renderer'/n).read_text())
 m3u='#EXTM3U\n#EXTINF:-1 group-title="VTV",VTV1\nhttps://a.invalid/stream.m3u8\n'
 page.locator('#fileInput').set_input_files({'name':'demo.m3u','mimeType':'audio/x-mpegurl','buffer':m3u.encode()})
 page.evaluate("""async()=>{const s=window.IPTVState.getStore(),id=s.channels[0].id;s.alternates[id]=['https://b.invalid/backup.m3u8'];await window.IPTVState.playChannel(id);}""")
 expect(page.locator('#playingTitle')).to_have_text('VTV1')
 page.locator('#video').dispatch_event('error')
 page.wait_for_timeout(150)
 src=page.locator('#video').evaluate('(v)=>v.getAttribute("src")')
 assert src=='https://b.invalid/backup.m3u8',src
 assert not errors,errors
 print('PLAYBACK FAILOVER UI PASSED: primary error switches to fallback URL')
 b.close()

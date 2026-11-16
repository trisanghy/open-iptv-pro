from pathlib import Path
from playwright.sync_api import sync_playwright
import re, shutil, datetime
root=Path(__file__).resolve().parents[1]
html=(root/'renderer/index.html').read_text(encoding='utf8')
html=html.replace('<script src="theme-boot.js"></script>','')
html=html[:html.index('<script src=')]+'</body></html>'
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
now=datetime.datetime.now(datetime.timezone.utc)
fmt=lambda t:t.strftime('%Y%m%d%H%M%S +0000')
xml=f'<tv><channel id="VTV1.vn"><display-name>VTV1</display-name></channel><programme start="{fmt(now-datetime.timedelta(minutes=15))}" stop="{fmt(now+datetime.timedelta(minutes=80))}" channel="VTV1.vn"><title>Test EPG</title></programme></tv>'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 for width in [1000,1360]:
  print("width",width,flush=True)
  page=b.new_page(viewport={'width':width,'height':850});errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  print("content",flush=True);page.set_content(html)
  page.add_style_tag(content=(root/'renderer/styles.css').read_text(encoding='utf8'))
  page.evaluate('''()=>{
   let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
   window.__epgRefreshes=0;
   window.streamleaf={check:async()=>{await new Promise(r=>setTimeout(r,40));return {status:'alive',reason:'HLS verified',confirmedAlive:true}},
    fetchEPG:async()=>{window.__epgRefreshes++;return {xml:window.__xml}},
    capabilities:async()=>({ffmpegExists:true,platform:'darwin',native:true})};
  }''')
  page.evaluate('(v)=>window.__xml=v',xml)
  for name in ['core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js','features.js']:
   page.add_script_tag(content=(root/'renderer'/name).read_text(encoding='utf8'))
  print('scripts done',flush=True);assert page.locator('#epgAutoRefreshStart').is_checked(),'startup EPG should enable on upgrade'
  assert page.locator('#epgSources .epg-source-row').count()>=10,'preset library populated'
  assert page.locator('#epgSources .epg-source-row input:checked').count()==1,'only VN should auto load'
  m3u='#EXTM3U\n'+''.join(f'#EXTINF:-1 tvg-id="VTV1.vn",VTV{i}\nhttps://example.invalid/{i}.m3u8\n' for i in range(6))
  print('importing',flush=True);page.locator('#fileInput').set_input_files({'name':'checks.m3u','mimeType':'application/vnd.apple.mpegurl','buffer':m3u.encode()})
  page.locator('.nav[data-page="tv"]').click()
  print('click checking',flush=True);page.locator('#quickChecks').evaluate('(e)=>e.click()')
  assert page.locator('#page-tv').evaluate('(e)=>e.classList.contains("active-page")'),'check stayed on TV page'
  assert page.locator('#taskDock').evaluate('(e)=>e.parentElement.tagName')=='FOOTER','dock inside footer'
  print('job started',flush=True);page.wait_for_timeout(500)
  page.wait_for_timeout(450)
  print('toggle',flush=True);page.locator('#taskDockMinimize').click()
  assert page.locator('#taskDockBody').is_visible()
  footer=page.locator('footer.footer').bounding_box();dock=page.locator('#taskDock').bounding_box()
  assert abs(footer['y']+footer['height']-(dock['y']+dock['height']))<10,(footer,dock)
  assert dock['x']>=footer['x']-1 and dock['x']+dock['width']<=width+1,(width,footer,dock)
  print('toggle',flush=True);page.locator('#taskDockMinimize').click()
  assert page.locator('#taskDockBody').is_hidden()
  page.wait_for_timeout(2450)
  assert page.evaluate('window.__epgRefreshes')==1,'startup fetched once'
  assert not errs,errs
  page.close()
 print('PASS footer, quick check no navigation, EPG auto, sources and responsive 1000/1360')
 b.close()

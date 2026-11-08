from pathlib import Path
import re,shutil,base64
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
M1='''#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" tvg-logo="https://example.com/1.png" group-title="01 - VTV",VTV1 HD
https://primary.example/1.m3u8
#EXTINF:-1 group-title="02 - Sports",Sports One
https://primary.example/2.m3u8
'''
M2='''#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" group-title="99 - Other",VTV1
https://backup.example/1.m3u8
'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,**({'executable_path':shutil.which('chromium')} if shutil.which('chromium') else {}))
 page=b.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'renderer/index.html').read_text();html=html.replace('<script src="theme-boot.js"></script>', '')[:html.replace('<script src="theme-boot.js"></script>', '').index('<script src=')]+'</body></html>';html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
 page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text())
 page.evaluate('''() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});window.confirm=()=>true;}''')
 for s in ['core-browser.js','collector-core.js','advanced-core.js','epg.js','favorites-core.js','app.js','features.js','advanced.js','collector.js']:
  page.add_script_tag(content=(root/'renderer'/s).read_text())
 assert page.locator('#gitNav').count()==0
 assert page.locator('.nav[data-page="collector"]').count()==0
 assert page.locator('#page-collector').count()==0
 assert page.locator('#collectorRepair').count()==1
 page.locator('#fileInput').set_input_files({'name':'list1.m3u','mimeType':'audio/x-mpegurl','buffer':M1.encode()})
 page.locator('#fileInput').set_input_files({'name':'list2.m3u','mimeType':'audio/x-mpegurl','buffer':M2.encode()})
 expect(page.locator('.folder-header')).to_have_count(3)
 page.locator('.nav[data-page="sources"]').click()
 expect(page.locator('#collectorSources .collector-source')).to_have_count(2)
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.evaluate("document.querySelector('.content').scrollTop=0")
 page.screenshot(path=str(root/'docs/images/source-management-v4-7.png'),full_page=True)

 expect(page.locator('#page-sources')).to_have_class(re.compile('active-page'))
 expect(page.locator('#sourceMergeChoices .collector-source')).to_have_count(2)
 page.locator('#sourceMergeAnalyze').click()
 expect(page.locator('#sourceMergeSummary')).to_contain_text('1 mục trùng')
 page.locator('#sourceMergeExecute').click()
 expect(page.locator('#sourceMergeSummary')).to_contain_text('Đã gộp 3 thành 2')
 page.locator('.nav[data-page="sources"]').click()
 expect(page.locator('#collectorStatus')).to_contain_text('Đã gộp 2 kênh')
 assert page.evaluate('''() => {const s=window.IPTVState.getStore();return s.channels.filter(c=>c.sourceId==='collector_merged')[0].alternates.length}''')==1
 page.evaluate('''()=>{window.streamleaf={check:async(url)=>url.includes('backup.')?{status:'alive',latencyMs:80}:{status:'dead',reason:'bad stream'},listRepoPlaylists:async()=>({owner:'test',repo:'iptv',branch:'main',files:[{path:'playlist.m3u',url:'https://raw.githubusercontent.com/test/iptv/main/playlist.m3u'}]})}}''')
 page.locator('#collectorRepair').click()
 expect(page.locator('#collectorStatus')).to_contain_text('Đã kiểm tra 2 kênh')
 result=page.evaluate('''() => {const s=window.IPTVState.getStore();return s.channels.filter(c=>c.sourceId==='collector_merged').map(c=>({name:c.name,url:c.url,status:c.status}))}''')
 assert result[0]['url']=='https://backup.example/1.m3u8',result
 assert result[0]['status']=='alive',result
 page.locator('#collectorRepoURL').fill('https://github.com/test/iptv');page.locator('#collectorBrowse').click()
 expect(page.locator('#collectorRepoFiles label')).to_have_count(1)
 page.locator('#collectorRepoFiles .btn').click()
 expect(page.locator('#collectorSources .collector-source')).to_have_count(3)
 # HTML test uses no real streaming or internet
 page.locator('.brand-icon img').evaluate('(el,v)=>el.src=v','data:image/png;base64,'+base64.b64encode((root/'assets/icon.png').read_bytes()).decode())
 page.screenshot(path=str(root/'docs/images/source-management-v4-7-workflow.png'),full_page=True)
 assert not errors,errors
 print('COLLECTOR UI v4.7 PASSED: all collector tools within Sources, removed old tab, safe merge, verified backup promotion, public repo discovery')
 b.close()

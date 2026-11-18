"""Chromium-only smoke/regression tests for EPG startup setting and manual imports.
Electron's native chooser/IPC are separately unit-tested; window.streamleaf is mocked here.
"""
from pathlib import Path
import shutil,re,datetime
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
now=datetime.datetime.now(datetime.timezone.utc)
def fmt(t):return t.strftime('%Y%m%d%H%M%S +0000')
def guide(title):
 return f'''<?xml version="1.0"?><tv><channel id="VTV1.vn"><display-name>VTV1</display-name></channel><programme channel="VTV1.vn" start="{fmt(now-datetime.timedelta(minutes=10))}" stop="{fmt(now+datetime.timedelta(minutes=80))}"><title>{title}</title></programme></tv>'''
channels='#EXTM3U\n#EXTINF:-1 tvg-id="VTV1.vn",VTV1 HD\nhttps://example.invalid/stream.m3u8\n'
html=(root/'renderer/index.html').read_text(encoding='utf8')
html=html.replace('<script src="theme-boot.js"></script>','')
html=html[:html.index('<script src=')]+'</body></html>'
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
 for enabled in [False,True]:
  page=b.new_page(viewport={'width':1200,'height':850});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html);page.add_style_tag(content=(root/'renderer/styles.css').read_text(encoding='utf8'))
  page.evaluate('''enabled => {
    const data={};window.__data=data;
    Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
    data['open-iptv-pro-settings-v1']=JSON.stringify({autoRefreshEPGOnStartup:enabled,epgStartupDefaultVersion:'4.23.7',sources:[{name:'Test EPG',url:'https://example.invalid/guide.xml',enabled:true}]});
    data['open-iptv-pro-4']=JSON.stringify({sources:[{id:'demo',name:'demo',type:'file',enabled:true}],channels:[{id:'vtv1',sourceId:'demo',name:'VTV1 HD',tvgId:'VTV1.vn',group:'demo',url:'https://example.invalid/stream.m3u8'}]});
    window.__fetchCount=0;
    window.streamleaf={capabilities:async()=>({native:true,ffmpegExists:true,platform:'win32'}),fetchEPG:async()=>{window.__fetchCount++;return {xml:window.__remoteXml}},importEPGFile:async()=>({name:'manual.xml.gz',xml:window.__localXml})};
    window.__confirmCount=0;window.confirm=()=>{window.__confirmCount++;return true};
  }''',enabled)
  page.evaluate('(xml)=>window.__remoteXml=xml',guide('Auto EPG Program'))
  page.evaluate('(xml)=>window.__localXml=xml',guide('Local XMLTV Program'))
  for filename in ['core-browser.js','epg.js','favorites-core.js','source-edit.js','app.js']:
   page.add_script_tag(content=(root/'renderer'/filename).read_text(encoding='utf8'))
  page.add_script_tag(content=(root/'renderer/features.js').read_text(encoding='utf8'))
  page.locator('.nav[data-page="settings"]').click()
  check=page.locator('#epgAutoRefreshStart');assert check.is_checked()==enabled
  expect(page.locator('#epgImportFileBtn')).to_be_visible()
  for viewport_width in [1000,1360]:
   page.set_viewport_size({'width':viewport_width,'height':850})
   for selector in ['#epgAutoRefreshStart','#epgLoadBtn','#epgImportFileBtn']:
    control=page.locator(selector);control.scroll_into_view_if_needed();bounds=control.bounding_box()
    assert bounds and bounds['x']>=-1 and bounds['x']+bounds['width']<=viewport_width+1,(selector,viewport_width,bounds)
  page.wait_for_timeout(2700)
  assert page.evaluate('window.__fetchCount')==(2 if enabled else 0),f'auto enabled={enabled} count'+str(page.evaluate('window.__fetchCount'))
  # Import overrides existing EPG only after confirmation.
  page.locator('#epgImportFileBtn').click()
  expect(page.locator('#epgImportStatus')).to_contain_text('Đã nhập')
  assert page.evaluate('window.__confirmCount')==1
  page.locator('.nav[data-page="epg"]').click()
  expect(page.locator('.epg-row')).to_have_count(1)
  assert 'Local XMLTV Program' in page.locator('.epg-row').inner_text()
  # Invalid EPG must not replace existing guide.
  page.evaluate("window.streamleaf.importEPGFile=async()=>({name:'bad.xml',xml:'<html>bad</html>'})")
  page.locator('.nav[data-page="settings"]').click();page.locator('#epgImportFileBtn').click()
  expect(page.locator('#epgImportStatus')).to_contain_text('thất bại')
  assert page.evaluate('window.__confirmCount')==1
  page.locator('.nav[data-page="epg"]').click()
  assert 'Local XMLTV Program' in page.locator('.epg-row').inner_text()
  # Cancelled file picker must preserve old guide.
  page.evaluate('window.streamleaf.importEPGFile=async()=>null')
  page.locator('.nav[data-page="settings"]').click();page.locator('#epgImportFileBtn').click()
  expect(page.locator('#epgImportStatus')).to_contain_text('Đã hủy')
  assert page.evaluate('window.__confirmCount')==1
  # auto toggle persists in settings.
  check=page.locator('#epgAutoRefreshStart');check.set_checked(not enabled)
  assert page.evaluate("JSON.parse(localStorage.getItem('open-iptv-pro-settings-v1')).autoRefreshEPGOnStartup")== (not enabled)
  assert not errors,errors
  page.close()
 print('CHROMIUM EPG 4.23.7 PASS: startup opt-in/out, once per launch, manual import, invalid/cancel preserve guide, checkbox persisted')
 b.close()

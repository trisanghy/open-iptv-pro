"""v4.23.9 UI integration: Snapshot-to-player recovery and non-importing muted Discovery hover.
Chromium mocks local saved channels/media and public playlist; no external network, no real installers.
"""
from pathlib import Path
import re, shutil
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parents[1]
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',(root/'renderer/index.html').read_text())
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
files=['app-icons.js','languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','doctor-v3-core.js','epg.js','favorites-core.js','source-edit.js','app.js','cast-ui.js','features.js','advanced.js','collector.js','doctor-v2.js','smart-discovery-ui.js','doctor-v3.js','backup-ui.js','dvr-ui.js','settings-ui.js']
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 for width in [1360,1000]:
  page=b.new_page(viewport={'width':width,'height':850})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html)
  page.add_style_tag(content=(root/'renderer/styles.css').read_text())
  page.evaluate('''()=>{
   const data=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),key:i=>[...data.keys()][i]||null,get length(){return data.size}}});
   window.__qa={confirmations:[],prompts:[],media:[],urls:[]};
   window.confirm=(text)=>{window.__qa.prompts.push(text);return window.__qa.confirmations.length?window.__qa.confirmations.shift():true};
   window.HTMLMediaElement.prototype.pause=function(){this.__pausedByQA=true};
   window.HTMLMediaElement.prototype.play=function(){window.__qa.media.push({src:this.src,muted:this.muted});return Promise.resolve()};
   window.HTMLMediaElement.prototype.load=function(){};
   window.HTMLMediaElement.prototype.canPlayType=function(){return 'maybe'};
   window.streamleaf={capabilities:async()=>({native:true,platform:'darwin',ffmpegExists:false,version:'4.23.9'}),
     proxy:async(url)=>{window.__qa.urls.push(url);return 'data:video/mp4;base64,AAAA';},
     smartCatalogOptions:async()=>[{code:'VN',name:'Việt Nam',flag:'🇻🇳'}],
     smartLoad:async()=>({kind:'country',url:'https://iptv-org.github.io/iptv/countries/vn.m3u',content:'#EXTM3U\\n#EXTINF:-1 group-title="Tin tức",Discovery Demo\\nhttps://example.invalid/discovery.m3u8\\n#EXTINF:-1,Other Demo\\nhttps://example.invalid/other.m3u8',provider:'mock'})};
  }''')
  for f in files:page.add_script_tag(content=(root/'renderer'/f).read_text())
  page.evaluate('''()=>{
   const store=window.IPTVState.getStore();
   store.sources=[{id:'on',name:'Nguồn đang bật',enabled:true,type:'file',origin:'Local'},
                  {id:'off',name:'Nguồn đang tắt',enabled:false,type:'file',origin:'Other'}];
   store.channels=[{id:'a',sourceId:'on',url:'https://example.invalid/active.m3u8',name:'Kênh hoạt động',group:'Tin tức'},
                   {id:'b',sourceId:'off',url:'https://example.invalid/inactive.m3u8',name:'Kênh nguồn tắt',group:'Tin tức'},
                   {id:'c',sourceId:'on',url:'https://example.invalid/new-url.m3u8',name:'Kênh đổi URL',group:'Tin tức'}];
   const s='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E';
   store.snapshots={ 'https://example.invalid/active.m3u8':{name:'Kênh hoạt động',data:s},
     'https://example.invalid/inactive.m3u8':{name:'Kênh nguồn tắt',data:s},
     'https://example.invalid/obsolete-url.m3u8':{name:'Kênh đổi URL',data:s}};
   window.IPTVState.render();
  }''')
  # One-click navigation from an enabled source.
  page.locator('.nav[data-page="shots"]').click()
  card=page.locator('.shot-card[data-channel-id="a"]')
  expect(card).to_be_visible()
  card.click()
  expect(page.locator('#page-tv')).to_have_class(re.compile('active-page'))
  expect(page.locator('#playingTitle')).to_have_text('Kênh hoạt động')
  assert page.evaluate('window.IPTVState.getCurrent()?.id')=='a'
  # Disabled source must never auto-enable on canceled confirmation.
  page.locator('.nav[data-page="shots"]').click()
  page.evaluate('window.__qa.confirmations.push(false)')
  page.locator('.shot-card[data-channel-id="b"]').click()
  expect(page.locator('#page-shots')).to_have_class(re.compile('active-page'))
  assert page.evaluate('window.IPTVState.getStore().sources[1].enabled') is False
  assert 'đang tắt' in page.evaluate('window.__qa.prompts.at(-1)')
  # User accepts: enable source, navigate, play correct channel.
  page.evaluate('window.__qa.confirmations.push(true)')
  page.locator('.shot-card[data-channel-id="b"]').click()
  expect(page.locator('#page-tv')).to_have_class(re.compile('active-page'))
  assert page.evaluate('window.IPTVState.getStore().sources[1].enabled') is True
  assert page.evaluate('window.IPTVState.getCurrent()?.id')=='b'
  # Snapshot retained from changed URL can recover by unique name only after confirmation.
  page.locator('.nav[data-page="shots"]').click()
  orphan=page.locator('.shot-group').last.locator('.shot-card').first
  expect(orphan).to_be_visible()
  orphan.click()
  assert page.evaluate('window.IPTVState.getCurrent()?.id')=='c'
  assert 'không còn liên kết URL' in page.evaluate('window.__qa.prompts.at(-1)')
  # Favorite star must not navigate out of Snapshot screen.
  page.locator('.nav[data-page="shots"]').click()
  page.locator('.shot-card[data-channel-id="a"] .snapshot-star').click()
  expect(page.locator('#page-shots')).to_have_class(re.compile('active-page'))
  # Hover Snapshot (same muted preview engine).
  page.locator('.shot-card[data-channel-id="a"]').hover()
  expect(page.locator('#channelPreview')).to_be_visible(timeout=4000)
  assert page.locator('#channelPreview video').evaluate('(v)=>v.muted && v.defaultMuted')
  # The hover popup must not prevent clicking the actual Snapshot card.
  page.locator('.shot-card[data-channel-id="a"]').click()
  assert page.evaluate('window.IPTVState.getCurrent()?.id')=='a'
  page.locator('.nav[data-page="shots"]').click()
  page.locator('.nav[data-page="sources"]').click()
  expect(page.locator('#channelPreview')).to_be_hidden()
  # Discovery: live candidate can be hovered prior to import, muted and no playlist mutation.
  before=page.evaluate('window.IPTVState.getStore().sources.length')
  page.locator('#smartFind').click()
  expect(page.locator('#smartResults .smart-row')).to_have_count(2)
  assert page.evaluate('window.IPTVState.getStore().sources.length')==before
  row=page.locator('#smartResults .smart-row').first
  row.hover()
  expect(page.locator('#channelPreview')).to_be_visible(timeout=4500)
  expect(page.locator('#channelPreview b')).to_contain_text('Discovery Demo')
  assert page.locator('#channelPreview video').evaluate('(v)=>v.muted && v.defaultMuted && v.volume===0')
  assert page.evaluate('window.IPTVState.getStore().sources.length')==before
  assert 'Chưa kiểm tra' in row.inner_text()
  page.locator('#smartSearch').fill('Other')
  expect(page.locator('#channelPreview')).to_be_hidden()
  assert not errors,errors
  print(f'UI PASS {width}px: Snapshot click, disabled confirm/cancel, orphan recovery, favorite, silent hover preview in Discovery, no auto-import')
  page.close()
 b.close()

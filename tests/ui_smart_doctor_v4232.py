"""Chromium mock integration test. No real IPTV URLs or GitHub operations."""
from pathlib import Path
import re,shutil
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'))
 for width in [1360,1000]:
  page=b.new_page(viewport={'width':width,'height':850})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  html=(root/'renderer/index.html').read_text()
  html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
  html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
  page.set_content(html)
  page.add_style_tag(content=(root/'renderer/styles.css').read_text())
  page.evaluate('''() => {
    const store=new Map();window.__qaStorage=store;
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),
      key:i=>Array.from(store.keys())[i]||null,get length(){return store.size}
    }});
    window.HTMLMediaElement.prototype.pause=function(){};
    window.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
    window.__qa={started:0,inFlight:0,max:0};
    window.streamleaf={
      capabilities:async()=>({native:true,platform:'darwin',ffmpegExists:false,version:'4.23.2'}),
      updateStatus:async()=>({phase:'idle',message:'Chưa kiểm tra'}),onUpdateStatus:()=>()=>{},
      smartCatalogOptions:async()=>[{code:'VN',name:'Vietnam',flag:'🇻🇳'}],
      smartLoad:async()=>({kind:'country',url:'https://iptv-org.github.io/iptv/countries/vn.m3u',provider:'Mock',content:'#EXTM3U\\n'+Array.from({length:1205},(_,i)=>'#EXTINF:-1 group-title="News",Channel '+i+'\\nhttps://example.org/ch'+i+'.m3u8').join('\\n')}),
      smartCheck:async()=>({status:'alive',positiveEvidence:true,reason:'video segment valid'}),
      check:async()=>{const q=window.__qa;q.started++;q.inFlight++;q.max=Math.max(q.max,q.inFlight);await Promise.resolve();q.inFlight--;return {status:'alive',positiveEvidence:true,reason:'video segment valid'};},
    };
  }''')
  for f in ['app-icons.js','languages.bundle.js','i18n.js','core-browser.js','collector-core.js','advanced-core.js','doctor-v2-core.js','doctor-v3-core.js','epg.js','favorites-core.js','source-edit.js','app.js','cast-ui.js','features.js','advanced.js','collector.js','doctor-v2.js','smart-discovery-ui.js','doctor-v3.js','backup-ui.js']:
   page.add_script_tag(content=(root/'renderer'/f).read_text())
  page.locator('.nav[data-page="sources"]').click()
  assert page.locator('#page-sources.active-page').count()==1
  page.locator('#smartFind').click()
  expect(page.locator('#smartMetrics')).to_contain_text('1205')
  page.locator('#smartVerify').click()
  expect(page.locator('#smartImportAlive')).to_be_enabled(timeout=15000)
  expect(page.locator('.smart-more')).to_be_visible()
  page.locator('.smart-more').click()
  assert page.locator('#smartResults .smart-row').count()==300
  page.locator('#smartStatusFilter').select_option('dead')
  assert page.locator('#smartResults .smart-row').count()==0
  page.locator('.nav[data-page="doctor"]').click()
  page.evaluate('''() => {const state=window.IPTVState.getStore();state.sources=[{id:'qa',name:'QA Channels',type:'file',origin:'QA',enabled:true}];state.channels=Array.from({length:1205},(_,i)=>({id:'qa|'+i,sourceId:'qa',name:'QA '+i,url:'https://example.org/qa'+i+'.m3u8',group:'QA',status:'unchecked'}));}''')
  page.locator('#doctor3Limit').select_option('all')
  page.locator('#doctor3Verify').click()
  expect(page.locator('#doctor3Status')).to_contain_text('Hoàn tất 1205 kênh',timeout=15000)
  assert page.evaluate('window.__qa.started')==1205
  assert page.evaluate('window.__qa.max')<=4
  assert not errors,errors
  if width==1000:
   # Controls must remain reachable and content must scroll in its own pane.
   assert page.locator('#doctor3Verify').is_visible()
   page.locator('.nav[data-page="sources"]').click()
   assert page.locator('#smartCatalog').is_visible()
  print(f'UI PASS {width}px: Discovery >1000, progressive results, filters, Doctor ALL >1000, worker cap; JS exceptions 0')
  page.close()
 b.close()

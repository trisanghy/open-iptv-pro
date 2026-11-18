from pathlib import Path
import re,json,sys
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]/'renderer'
channels=[{'id':f'a{i}','name':f'Kênh A{i}','sourceId':'s','group':'A','url':f'https://test.example/A{i}.m3u8'} for i in range(1,5)] +[{'id':f'b{i}','name':f'Kênh B{i}','sourceId':'s','group':'B','url':f'https://test.example/B{i}.m3u8'} for i in range(1,4)]+[{'id':f'c{i}','name':f'Kênh C{i}','sourceId':'s','group':'C','url':f'https://test.example/C{i}.m3u8'} for i in range(1,3)]
state={'sources':[{'id':'s','name':'M3U thử nghiệm','enabled':True,'type':'file'}],'channels':channels,'favorites':[], 'snapshots':{},'folders':['A','B','C'],'groupOrder':['A','B','C'],'collapsedGroups':[],'channelOrder':{},'current':'','volume':.8,'videoFit':'contain','checkerVersion':3,'autoRefreshM3UOnStart':False}
files=['core-browser.js','advanced-core.js','epg.js','favorites-core.js','source-edit.js','adaptive-playback.js','playback-reentry.js','health-evidence.js','snapshot-freshness.js','channel-organizer.js','channel-pointer-dnd.js','app.js']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':950});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'index.html').read_text()
 html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>|<link[^>]+>|<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>', '',html)
 page.set_content(html,wait_until='domcontentloaded',timeout=15000)
 for css in ['styles.css','ui-styles.css','ui-fullsync.css','ui-refined.css','ui-polish.css','channel-organizer.css']:
  page.add_style_tag(content=(root/css).read_text())
 page.evaluate('''(state)=>{
  const data={'open-iptv-pro-4':JSON.stringify(state)};
  window.__saved=data;
  Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=String(v)}});
  window.IPTVPrimaryPersistence={initialRaw:JSON.stringify(state),nativeReady:false};
  document.documentElement.dataset.desktopRuntime='tauri2-rust';
  window.streamleaf={proxy:async url=>url,mediaKind:async()=>({hls:true,mode:'live',seekable:false}),compatStop:async()=>{},stopTimeshift:async()=>{},capabilities:async()=>({snapshotBase:'',ffmpegExists:true})};
  HTMLMediaElement.prototype.canPlayType=function(){return 'probably'};
  HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
  HTMLMediaElement.prototype.pause=function(){};
  HTMLMediaElement.prototype.load=function(){};
 }''',state)
 for file in files: page.add_script_tag(content=(root/file).read_text())
 page.wait_for_function('!!window.IPTVState&&!!window.IPTVPointerDnD',timeout=10000)
 def rows():return page.eval_on_selector_all('.channel-item','els=>els.map(el=>el.dataset.channelId)')
 def saved():return page.evaluate('({groups:window.IPTVState.getStore().groupOrder.slice(),order:window.IPTVState.getStore().channelOrder,channels:window.IPTVState.getStore().channels.map(c=>({id:c.id,group:c.group}))})')
 def drag(a,b,after=False):
  s=page.locator(a).first;t=page.locator(b).first
  s.scroll_into_view_if_needed();t.scroll_into_view_if_needed()
  start=s.bounding_box();end=t.bounding_box()
  assert start and end,(a,b)
  ax=start['x']+start['width']*.3;ay=start['y']+start['height']*.5
  bx=end['x']+end['width']*.3;by=end['y']+end['height']*(.80 if after else .25)
  page.mouse.move(ax,ay);page.mouse.down();page.mouse.move(ax+10,ay+3,steps=3);page.mouse.move(bx,by,steps=12);page.mouse.up();page.wait_for_timeout(110)
 def groupIds(name):
  return page.evaluate('''g=>window.IPTVChannelOrganizer.groupList(window.IPTVState.getStore(),g)''',name)
 assert page.locator('input.channel-select,#channelBulkToolbar,.channel-move').count()==0
 assert rows()[:4]==['a1','a2','a3','a4'],rows()
 # Shift toggles non-contiguous, does not play TV
 page.locator('.channel-item[data-channel-id="a1"]').click(modifiers=['Shift'])
 page.locator('.channel-item[data-channel-id="a3"]').click(modifiers=['Shift'])
 selected=page.eval_on_selector_all('.channel-item.channel-selected','els=>els.map(x=>x.dataset.channelId)')
 assert selected==['a1','a3'],selected
 assert page.evaluate('window.IPTVState.getCurrent()') is None
 drag('.channel-item[data-channel-id="a1"]','.folder-header[data-group="B"]')
 assert groupIds('A')==['a2','a4'],groupIds('A')
 assert groupIds('B')==['b1','b2','b3','a1','a3'],groupIds('B')
 assert page.locator('.channel-item.channel-selected').count()==0
 print('PASS multi Shift selection and pointer drag to B')
 # Move B3 before B1 (same folder)
 drag('.channel-item[data-channel-id="b3"]','.channel-item[data-channel-id="b1"]')
 assert groupIds('B')==['b3','b1','b2','a1','a3'],groupIds('B')
 print('PASS reorder inside folder')
 # Folder C before A
 drag('.folder-header[data-group="C"]','.folder-header[data-group="A"]')
 assert saved()['groups']==['C','A','B'],saved()['groups']
 print('PASS reorder folders')
 # Folder B after C => [C,B,A]
 drag('.folder-header[data-group="B"]','.folder-header[data-group="C"]',after=True)
 assert saved()['groups']==['C','B','A'],saved()['groups']
 print('PASS folder after drop')
 # Organize with folder cards in the Folder manager as well.
 page.evaluate("window.IPTVState.setPage('folders')")
 drag('.folder-card[data-group="A"]','.folder-card[data-group="C"]')
 assert saved()['groups']==['A','C','B'],saved()['groups']
 print('PASS folder cards drag in the Folder manager')
 page.evaluate("window.IPTVState.setPage('tv')")
 # Normal click channel still invokes player; no accidental click from drag
 assert page.evaluate('window.IPTVState.getCurrent()') is None
 page.locator('.channel-item[data-channel-id="a2"]').click()
 assert page.evaluate('window.IPTVState.getCurrent()?.id')=='a2'
 print('PASS regular click opens player')
 # Verify saved values and no runtime errors
 result=saved();print('SAVED',result['groups'],result['order']);print('ERRORS',errors[:5]);assert not errors,errors
 b.close()

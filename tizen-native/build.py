#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
from xml.etree import ElementTree as ET
root=Path(__file__).resolve().parents[1]
pkg=json.loads((root/'package.json').read_text())
html=(root/'tizenbrew/index.html').read_text()
config=(root/'tizen-native/config.xml').read_text()
assert pkg['packageType']=='app' and 'serviceFile' not in pkg
assert 'TV Web Lab · v'+pkg['version'] in html
assert 'function nativeAvplay(){return null;}' in html
assert ET.fromstring(config).get('version')==pkg['version']
needle='applyTvTheme(state.theme);draw();updateBottomActions();'
assert html.count(needle)==1
register="try{if(typeof tizen!=='undefined'&&tizen.tvinputdevice){"+json.dumps(pkg['keys'])+".forEach(function(key){try{tizen.tvinputdevice.registerKey(key);}catch(e){}});}}catch(e){}"
html=html.replace(needle,register+needle,1)
out=root/'dist-tizen-native/Open-IPTV-Pro-TV-Web-Lab-UNSIGNED.wgt'
out.parent.mkdir(exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    z.writestr('index.html',html)
    z.writestr('config.xml',config)
    z.write(root/'assets/icon.png','icon.png')
    z.write(root/'tizenbrew/phone.html','phone.html')
    for f in ['hls.min.js','dash.all.min.js','mpegts.min.js','supabase-sdk.js']:
        z.write(root/f,f)
with ZipFile(out) as z:
    assert z.testzip() is None
    assert 'hls.min.js' in z.namelist()
print(out)

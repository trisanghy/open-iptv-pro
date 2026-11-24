from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
from xml.etree import ElementTree as ET
root=Path(__file__).resolve().parents[1]
p=json.loads((root/'package.json').read_text())
h=(root/'tizenbrew/index.html').read_text()
x=(root/'tizen-native/config.xml').read_text()
assert p['packageType']=='mods' and 'serviceFile' not in p
assert p['websiteURL'] in h and ET.fromstring(x).get('version')==p['version']
out=root/'dist-tizen-native/Open-IPTV-Pro-TV-Web-Lab-UNSIGNED.wgt'
out.parent.mkdir(exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
 z.writestr('index.html',h)
 z.writestr('config.xml',x)
 z.write(root/'assets/icon.png','icon.png')
with ZipFile(out) as z:
 assert z.testzip() is None
print(out)

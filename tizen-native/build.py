#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
from xml.etree import ElementTree as ET
root=Path(__file__).resolve().parents[1]
pkg=json.loads((root/'package.json').read_text())
entry=(root/'tizenbrew/bootstrap.html').read_text()
config=(root/'tizen-native/config.xml').read_text()
assert pkg['packageType']=='mods' and 'serviceFile' not in pkg
assert pkg['websiteURL'] in entry
assert ET.fromstring(config).get('version')==pkg['version']
out=root/'dist-tizen-native/Open-IPTV-Pro-TV-Web-Lab-UNSIGNED.wgt'
out.parent.mkdir(exist_ok=True)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    z.writestr('index.html',entry)
    z.writestr('config.xml',config)
    z.write(root/'assets/icon.png','icon.png')
with ZipFile(out) as z:
    assert z.testzip() is None
    assert set(z.namelist())=={'index.html','config.xml','icon.png'}
print(out)

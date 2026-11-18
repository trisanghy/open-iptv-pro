'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pkg=require('../package.json');
const file=name=>readFileSync(path.join(root,name),'utf8');

test('Desktop release version stays aligned across installer scripts and UI',()=>{
 const version=pkg.version;
 assert.match(version,/^\d+\.\d+\.\d+$/);
 const html=file('renderer/index.html');
 assert.ok(html.includes('<title>Open IPTV Pro '+version+'</title>'));
 assert.ok(html.includes('<span class="version">'+version+'</span>'));
 const mac=file('BUILD_MAC_DMG_ONLY.command');
 assert.ok(mac.includes('p.version'));
 assert.ok(mac.includes(version));
 assert.match(mac,/dist\/Open-IPTV-Pro-/);
 const ps=file('scripts/BUILD_WINDOWS_AUTO.ps1');
 assert.ok(ps.includes("$expectedVersion = '"+version+"'"));
 assert.match(ps,/\$info\.version -ne \$expectedVersion/);
 assert.match(ps,/Open-IPTV-Pro-Setup-\$\{expectedVersion\}-x64\.exe/);
 assert.match(ps,/Open-IPTV-Pro-\$\{expectedVersion\}-x64\.exe/);
 const bat=file('BUILD_WINDOWS.bat');
 assert.ok(bat.includes('v'+version));
 const personal=file('build-mac-electron.sh');
 const publicBuilder=file('build-mac-electron-public.sh');
 for(const script of [personal,publicBuilder]){
  assert.match(script,/REF='build-sources\/electron-desktop'/);
 }
 assert.match(file('docs/RELEASE_SOURCE_MAP_V4_23_68.md'),/build-sources\/electron-desktop/);
});

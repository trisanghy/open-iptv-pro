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
 const mac=file('BUILD_MAC.command');
 assert.match(mac,/PROJECT_VERSION=\$\(sed/);
 assert.match(mac,/"\$PROJECT_VERSION"/);
 const ps=file('scripts/BUILD_WINDOWS_AUTO.ps1');
 assert.ok(ps.includes("$expectedVersion = '"+version+"'"));
 assert.match(ps,/\$info\.version -ne \$expectedVersion/);
 assert.match(ps,/Open-IPTV-Pro-Setup-\$\{expectedVersion\}-x64\.exe/);
 assert.match(ps,/Open-IPTV-Pro-\$\{expectedVersion\}-x64\.exe/);
 const bat=file('BUILD_WINDOWS.bat');
 assert.ok(bat.includes('v'+version));
 assert.ok(file('CAP_NHAT_GITHUB_V4_23_37_MAC.command').includes("TARGET_VERSION='"+version+"'"));
});

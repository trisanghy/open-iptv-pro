'use strict';
/**
 * v4.23.50 macOS distribution profile:
 * build ONLY a DMG. The source ZIP is assembled separately by build-mac-v42349.sh.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const project=process.cwd(),file=path.join(project,'package.json');
const pkg=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(pkg.version,'4.23.50','Expected the already-patched v4.23.50 source');
assert(pkg.build&&typeof pkg.build==='object'&&!Array.isArray(pkg.build),'Missing electron-builder configuration');
assert(!pkg.build.mac||typeof pkg.build.mac==='object','Unexpected mac target configuration');
assert(!pkg.build.dmg||typeof pkg.build.dmg==='object','Unexpected dmg options');
pkg.build.mac={...(pkg.build.mac||{}),target:['dmg']};
pkg.build.dmg={...(pkg.build.dmg||{}),writeUpdateInfo:false};
fs.writeFileSync(file,JSON.stringify(pkg,null,2)+'\n');
const verify=JSON.parse(fs.readFileSync(file,'utf8'));
assert.deepEqual(verify.build.mac.target,['dmg']);
assert.equal(verify.build.dmg.writeUpdateInfo,false);
console.log('macOS targets: DMG only. No app ZIP, blockmap or update metadata. Source ZIP is generated separately.');

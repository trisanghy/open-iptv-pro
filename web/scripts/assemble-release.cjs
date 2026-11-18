'use strict';
/** Assemble GitHub Release assets built natively on each OS/architecture.
 * Usage: node scripts/assemble-release.cjs <stage-dir> <output-dir>
 * Stage folders: windows-x64, mac-arm64, mac-x64 (from actions/download-artifact).
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const pkg=require('../package.json');
const stage=path.resolve(process.argv[2]||'release-stage');
const out=path.resolve(process.argv[3]||'dist-release');
const hash=(file,algo,encoding='hex')=>{
 const h=crypto.createHash(algo),fd=fs.openSync(file,'r'),buf=Buffer.allocUnsafe(4*1024*1024);
 try{let n;while((n=fs.readSync(fd,buf,0,buf.length,null))>0)h.update(buf.subarray(0,n));}
 finally{fs.closeSync(fd);}
 return h.digest(encoding);
};
const dirs={win:path.join(stage,'windows-x64'),arm:path.join(stage,'mac-arm64'),intel:path.join(stage,'mac-x64')};
for(const dir of Object.values(dirs))if(!fs.existsSync(dir))throw Error('Missing output folder: '+dir);
fs.mkdirSync(out,{recursive:true});
function choose(dir,reg){const names=fs.readdirSync(dir).filter(x=>reg.test(x));if(names.length!==1)throw Error(`${dir}: require one ${reg}, found: ${names}`);return path.join(dir,names[0]);}
function copy(file){const dest=path.join(out,path.basename(file));if(fs.existsSync(dest))throw Error('Duplicate asset: '+dest);fs.copyFileSync(file,dest);return dest;}
const armZip=copy(choose(dirs.arm,/^Open-IPTV-Pro-.*-mac-arm64\.zip$/i));
const intelZip=copy(choose(dirs.intel,/^Open-IPTV-Pro-.*-mac-x64\.zip$/i));
copy(choose(dirs.arm,/^Open-IPTV-Pro-.*-mac-arm64\.dmg$/i));
copy(choose(dirs.intel,/^Open-IPTV-Pro-.*-mac-x64\.dmg$/i));
const setup=copy(choose(dirs.win,/^Open-IPTV-Pro-Setup-.*-x64\.exe$/i));
for(const file of fs.readdirSync(dirs.win)){
 if(file.endsWith('.blockmap') || (file.endsWith('.exe')&&!path.basename(setup).endsWith(file)))copy(path.join(dirs.win,file));
}
const winManifest=choose(dirs.win,/^latest\.yml$/);
copy(winManifest);
// Electron updater 6 MacUpdater filters mac update ZIPs by the 'arm64' filename.
// Both architectures must appear in ONE latest-mac.yml to avoid overwriting the
// manifest when combining runner artifacts.
const zipFiles=[armZip,intelZip];
const entries=zipFiles.map(file=>({name:path.basename(file),size:fs.statSync(file).size,sha512:hash(file,'sha512','base64')}));
const lines=[`version: ${pkg.version}`,'files:'];
for(const item of entries)lines.push(`  - url: ${item.name}`,`    sha512: ${item.sha512}`,`    size: ${item.size}`);
lines.push(`path: ${entries[0].name}`,`sha512: ${entries[0].sha512}`,`releaseDate: '${new Date().toISOString()}'`,'');
fs.writeFileSync(path.join(out,'latest-mac.yml'),lines.join('\n'));
const outputs=fs.readdirSync(out).filter(file=>/\.(?:dmg|exe|zip)$/i.test(file)).sort();
const sums=outputs.map(name=>`${hash(path.join(out,name),'sha256')}  ${name}`).join('\n')+'\n';
fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),sums);
const validManifest=fs.readFileSync(path.join(out,'latest.yml'),'utf8');
if(!/\bversion:\s*["']?\d+\.\d+\.\d+/.test(validManifest))throw Error('Windows latest.yml missing version');
for(const file of ['latest.yml','latest-mac.yml','SHA256SUMS.txt'])if(fs.statSync(path.join(out,file)).size<30)throw Error('Empty release manifest: '+file);
console.log(`Release ${pkg.version}: ${outputs.length} installer files + manifests; Windows NSIS and both macOS architectures.`);

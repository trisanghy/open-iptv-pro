import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,writeFileSync,readFileSync,copyFileSync,chmodSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import process from 'node:process';
const dirs={
  'darwin:arm64':'darwin-arm64',
  'darwin:x64':'darwin-x64',
  'win32:x64':'win-x64'
};
function sha256(data){return createHash('sha256').update(data).digest('hex');}
async function fetchData(url){
 const res=await fetch(url,{signal:AbortSignal.timeout(150000),redirect:'follow'});
 if(!res.ok)throw Error(`HTTP ${res.status}: ${url}`);
 if(!res.url.startsWith('https://nodejs.org/dist/'))throw Error(`URL không thuộc trang Node chính thức: ${res.url}`);
 return Buffer.from(await res.arrayBuffer());
}
export async function downloadNodeBinary(){
 const os=dirs[`${process.platform}:${process.arch}`];if(!os)throw Error('Kiến trúc Node không được hỗ trợ');
 const version=process.version, suffix=process.platform==='win32'?'zip':'tar.gz';
 const name=`node-${version}-${os}.${suffix}`, targetDir=resolve('node-cache',`node-${version}-${os}`);
 const exe=join(targetDir,process.platform==='win32'?'node.exe':'node');
 if(existsSync(exe)&&statSync(exe).size>1000000) return exe;
 mkdirSync(targetDir,{recursive:true});
 const url=`https://nodejs.org/dist/${version}/`;
 const [raw,sums]=await Promise.all([fetchData(url+name),fetchData(url+'SHASUMS256.txt')]);
 const expected=sums.toString('utf8').split(/\r?\n/).map(s=>s.trim().split(/\s+/)).find(parts=>parts[1]===name)?.[0];
 if(!expected||sha256(raw)!==expected)throw Error('Node.js tải về có SHA256 không hợp lệ');
 const archive=join(targetDir,name);writeFileSync(archive,raw);
 if(process.platform==='win32'){
  const cmd=`Expand-Archive -LiteralPath '${archive.replaceAll("'","''")}' -DestinationPath '${targetDir.replaceAll("'","''")}' -Force`;
  execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',cmd],{timeout:120000});
 } else execFileSync('tar',['-xzf',archive,'-C',targetDir],{timeout:120000});
 const root=join(targetDir,`node-${version}-${os}`);
 const from=join(root,...(process.platform==='win32'?['node.exe']:['bin','node']));
 if(!existsSync(from))throw Error(`Node trong archive thiếu: ${from}`);
 copyFileSync(from,exe);if(process.platform!=='win32')chmodSync(exe,0o755);
 const license=join(root,'LICENSE');
 if(existsSync(license))copyFileSync(license,join(targetDir,'NODE_LICENSE.txt'));
 const result=execFileSync(exe,['--version'],{encoding:'utf8'}).trim();
 if(result!==version)throw Error('Node binary sai phiên bản');
 console.log(`✓ Official Node ${version} đã xác minh SHA256; cache ${targetDir}`);
 return exe;
}

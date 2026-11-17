'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {catalogFromReleases,versionOf,officialAsset}=require('../src/update-version-catalog.cjs');
const {UpdateManager}=require('../src/update-manager.cjs');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const repo='trisanghy/open-iptv-pro';
const uri=(tag,name)=>'https://github.com/'+repo+'/releases/download/'+tag+'/'+name;
const hash=s=>createHash('sha256').update(s).digest('hex');
function release(tag,prerelease,files,{draft=false}={}){
 return {tag_name:tag,draft,prerelease,published_at:'2026-11-17T07:00:00Z',
  assets:files.map(f=>({name:f.name,browser_download_url:f.url||uri(tag,f.name),
    digest:f.digest||'sha256:'+hash(f.payload||f.name),size:Buffer.byteLength(f.payload||f.name)}))};
}
const macName=v=>'Open-IPTV-Pro-'+v+'-mac-arm64.dmg';
const winName=v=>'Open-IPTV-Pro-Setup-'+v+'-x64.exe';
const stable=release('v4.23.60',false,[{name:macName('4.23.60'),payload:'stable-60'}, {name:winName('4.23.60')}]);
const beta=release('electron-v4.23.66',true,[{name:macName('4.23.66'),payload:'beta-66'}, {name:winName('4.23.66')}]);
const old=release('v4.23.40',false,[{name:macName('4.23.40'),payload:'legacy-40'}]);
test('v4.23.67: GitHub release catalog filters draft, wrong platform, unsigned and unrelated Rust releases',()=>{
 assert.equal(versionOf('electron-v4.23.66'),'4.23.66');
 assert.equal(versionOf('rust-lab/v23.3'),null);
 const draft=release('v4.23.99',false,[{name:macName('4.23.99')}],{draft:true});
 const noIntegrity=release('v4.23.55',false,[{name:macName('4.23.55'),digest:'nope'}]);
 noIntegrity.assets[0].digest='none';
 const malicious=release('v4.23.70',false,[{name:macName('4.23.70'),url:'https://evil.test/unsafe.dmg'}]);
 const r=catalogFromReleases([draft,noIntegrity,malicious,beta,stable,old,release('rust-lab/v23.3',true,[{name:'Rust-Lab-Setup.exe'}])],{platform:'darwin',arch:'arm64'});
 assert.deepEqual(r.map(x=>x.version),['v4.23.66','v4.23.60','v4.23.40']);
 assert.equal(r[0].prerelease,true);
 assert.equal(r[1].prerelease,false);
 assert.ok(officialAsset(beta.assets[0],beta.tag_name));
 assert.equal(officialAsset({browser_download_url:'https://evil.test/a.dmg',name:'a.dmg'},beta.tag_name),false);
 const win=catalogFromReleases([beta,stable,old],{platform:'win32',arch:'x64'});
 assert.deepEqual(win.map(x=>x.version),['v4.23.66','v4.23.60']);
 assert.match(win[0].assetName,/Setup.*x64\.exe/);
 const intel=catalogFromReleases([beta,stable,old],{platform:'darwin',arch:'x64'});
 assert.equal(intel.length,0);
});
test('v4.23.67: manual selection of an older official version preserves SHA-256 and NEVER triggers native installation',async()=>{
 const dir=await fs.promises.mkdtemp(path.join(os.tmpdir(),'iptv-update-picker-'));
 let nativeChecks=0;
 const fakeUpdater={autoDownload:false,autoInstallOnAppQuit:false,
  on:()=>{},setFeedURL:()=>{nativeChecks++;},checkForUpdates:()=>{nativeChecks++;},downloadUpdate:()=>{nativeChecks++;}};
 const fetcher=async url=>{
  if(url.includes('/releases?per_page='))return {ok:true,status:200,json:async()=>[beta,stable,old]};
  if(url===uri(old.tag_name,macName('4.23.40')))return new Response(Buffer.from('legacy-40'),{status:200});
  throw Error('Unexpected fetch: '+url);
 };
 try{
  const m=new UpdateManager({
   app:{getPath:()=>dir,getVersion:()=> '4.23.66',isPackaged:true},
   platform:'darwin',arch:'arm64',downloadsDir:dir,fetcher,updater:fakeUpdater,
   signatureCheck:()=>true
  });
  await assert.rejects(async()=>m.chooseVersion('evil-release'),/tải lại danh sách/);
  const {current,releases}=await m.listVersions();
  assert.equal(current,'v4.23.66');
  assert.equal(releases.find(x=>x.version==='v4.23.40').older,true);
  assert.equal(releases.find(x=>x.version==='v4.23.66').installed,true);
  const chosen=m.chooseVersion('v4.23.40');
  assert.equal(chosen.mode,'manual');
  assert.equal(chosen.isDowngrade,true);
  assert.equal(chosen.latest,'v4.23.40');
  assert.equal(chosen.selectedTag,'v4.23.40');
  assert.equal(chosen.phase,'available');
  const downloaded=await m.download();
  assert.equal(downloaded.phase,'manual-ready');
  assert.equal(nativeChecks,0);
  assert.equal(await fs.promises.readFile(downloaded.downloadedFile,'utf8'),'legacy-40');
  assert.throws(()=>m.install(),/Chưa có bản cập nhật tự động/);
 }finally{await fs.promises.rm(dir,{recursive:true,force:true});}
});
test('v4.23.67: UI version picker and compact two-row controls exist with safe IPC-only wiring',()=>{
 const html=read('renderer/index.html'),js=read('renderer/features.js');
 const css=read('renderer/live-ai-toolbar-v42367.css'),main=read('src/main.cjs'),preload=read('src/preload.cjs');
 for(const id of ['updateVersionSelect','updateVersionsRefreshBtn','updateVersionHint','liveTtsVoice','liveCaptionSetup','playbackExtra'])
  assert.match(html,new RegExp('id="'+id+'"'));
 const a=html.indexOf('class="caption-ai-main"'),tool=html.indexOf('id="playbackExtra"'),
  b=html.indexOf('class="caption-tts-main"');
 assert.ok(a>=0&&tool>a&&b>tool,'Tools belongs to the Caption/Translate row');
 assert.match(html,/live-ai-toolbar-v42367\.css/);
 assert.match(css,/update-version-selector/);
 assert.match(js,/listUpdateVersions/);
 assert.match(js,/selectUpdateVersion/);
 assert.match(js,/choice\.older/);
 assert.match(main,/ipcMain\.handle\('update:versions'/);
 assert.match(main,/ipcMain\.handle\('update:selectVersion'/);
 assert.match(preload,/listUpdateVersions/);
 assert.match(preload,/selectUpdateVersion/);
 assert.equal(require('../package.json').version,'4.23.67');
});

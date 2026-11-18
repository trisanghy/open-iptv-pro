'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ai=require('../src/local-ai-autoinstall.cjs'),tts=require('../src/local-tts-service.cjs');
test('v4.23.44 supported language voices and pinned installers match architectures',()=>{
 assert.equal(ai.VOICES.vi,'vi_VN-25hours_single-low');
 for(const platform of [['darwin','arm64'],['darwin','x64'],['win32','x64']])assert.equal(ai.uvReleaseFor(...platform)[1].length,64);
 assert.equal(ai.uvReleaseFor('sunos','sparc'),null);
});
test('v4.23.44 one-click installer does not download without a click',()=>{
 const folder=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'openiptv-tts-test-'));
 try{const m=ai.createAutoModelInstaller({dataDir:folder});
 assert.equal(m.state('vi').installed,false);assert.equal(m.state('en').translationModelInstalled,true);
 assert.throws(()=>m.state('../etc'));assert.equal(fs.existsSync(path.join(folder,'local-tts','python-env')),false);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test('v4.23.44 TTS validates language and never depends on cloud recognition API',()=>{
 const folder=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'openiptv-tts-test-'));
 try{const m=ai.createAutoModelInstaller({dataDir:folder});
 const t=tts.createLocalSpeechService({dataDir:folder,managed:m.paths()});
 assert.equal(t.availability('vi').ready,false);
 assert.equal(t.availability('en').ready,false);
 assert.match(read('src/local-tts-service.cjs'),/ARGOS_PACKAGES_DIR/);
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test('v4.23.44 Live Caption third row adds opt-in TTS, local model install and source ducking',()=>{
 const h=read('renderer/index.html'),ui=read('renderer/local-tts-v42344.js'),css=read('renderer/local-tts-row-v42344.css');
 const last=h.indexOf('id="captionThirdRow"'),first=h.indexOf('class="control-layout-bottom"');
 assert.ok(last>first);
 for(const id of ['liveTtsToggle','liveTtsLanguage','liveTtsDuck','liveTtsInstall','liveTtsStatus'])assert.match(h,new RegExp('id="'+id+'"'));
 assert.match(ui,/setPlayerVolume\(baseVolume\*scale\(\)\)/);
 assert.match(ui,/restore\(\)/);assert.match(ui,/ttsInstall/);
 assert.match(css,/caption-third-controls/);assert.ok(h.lastIndexOf('local-tts-row-v42344.css')>h.lastIndexOf('live-caption-row-v42343.css'));
});
test('v4.23.44 desktop IPC only permits bounded operations, cleans processes on quit',()=>{
 const main=read('src/main.cjs'),pre=read('src/preload.cjs');
 for(const id of ['tts:status','tts:install','tts:synthesize','tts:stop']){assert.ok(main.includes(id));assert.ok(pre.includes(id));}
 assert.match(main,/localTTS\?\.stop\(\)/);assert.match(main,/localModelInstaller\?\.cancel\(\)/);
 assert.equal(JSON.parse(read('package.json')).version,'4.23.70');
});

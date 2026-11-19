import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {oldStyleLayout} from '../src/legacy-mobile-layout.mjs';

const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const main=read('src/main.js'),css=read('src/styles.css');
const autoPiP=read('src/mobile-auto-pip.mjs'),nativePatch=read('scripts/patch-native.mjs');
const layout=oldStyleLayout();

test('Mobile player fit, primary stream, background audio and favorite share one compact row',()=>{
 const block=layout.match(/<div class="playback-settings">([\s\S]*?)<\/div>/)?.[1]||'';
 const ids=['videoFit','manualStreamSelect','backgroundAudioToggle','nowFavorite'];
 const indices=ids.map(id=>block.indexOf('id="'+id+'"'));
 assert.ok(indices.every(n=>n>=0),'required controls missing');
 assert.deepEqual([...indices].sort((a,b)=>a-b),indices,'controls must follow same visual and accessibility order');
 assert.match(css,/MOBILE_COMPACT_PLAYER_ROW_V27/);
 assert.match(css,/grid-template-columns:minmax\(104px,1fr\) minmax\(105px,1\.1fr\) 42px 42px/);
 for(const id of ['videoFit','manualStreamSelect','backgroundAudioToggle','nowFavorite'])
  assert.equal((layout.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert.match(layout,/id="backgroundAudioStatus"/);
 assert.match(css,/\.background-audio-status\{[\s\S]*?position:absolute/);
});

test('Startup retries last channel after playlist refresh without waiting for XMLTV',()=>{
 const start=main.slice(main.indexOf('async function resumePreviousChannel('),main.indexOf('init();',main.indexOf('async function resumePreviousChannel(')));
 assert.match(start,/state\.resumeUrl,state\.recentlyWatched\?\.\[0\],state\.selected/);
 assert.match(start,/try\{await play\(channel,undefined,\{startup:true\}\);startupPlaybackDone=true/);
 assert.match(start,/await playlist;\s*await resumePreviousChannel\(\);\s*await guide/);
 assert.doesNotMatch(start,/startupPlaybackDone=true;\s*try\{await play/);
 assert.match(main,/startupPlaybackDone=true; \/\/ Explicit channel choice/);
 assert.match(main,/v\.autoplay=startup;v\.preload=startup\?'auto':'metadata'/);
 assert.match(main,/Thiết bị chặn tự phát\. Chạm Phát/);
 assert.match(main,/if\(e\?\.name==='AutoplayBlockedError'\)/);
 assert.match(main,/v\.muted=false;mediaMuted=false;throw Object\.assign/);
 assert.doesNotMatch(main,/Không phát trong khung \(CORS\/codec\)/);
});

test('PiP defaults to on for upgraded Mobile installs, persists explicit off choice',()=>{
 assert.match(main,/autoResumeLast:true,autoPiPOnBackground:true,backgroundAudioEnabled:true/);
 assert.match(main,/if\(!state\.settings\.autoPiPChoiceRecorded\)/);
 assert.match(main,/state\.settings\.autoPiPOnBackground=true;/);
 assert.match(main,/state\.settings\.autoPiPChoiceRecorded=true;/);
 assert.match(main,/pipToggle\.onchange=/);
 assert.match(main,/state\.settings\.autoPiPOnBackground=pipToggle\.checked/);
 assert.match(autoPiP,/window\.addEventListener\('blur',onBackground\)/);
 assert.match(autoPiP,/window\.addEventListener\('focus',onForeground\)/);
 assert.match(autoPiP,/document\.addEventListener\('visibilitychange',visibility\)/);
});

test('iOS uses PiP-capable WKWebView inline player, not an unsolicited native fullscreen player',()=>{
 assert.match(nativePatch,/allowsPictureInPictureMediaPlayback = true/);
 assert.match(nativePatch,/allowsInlineMediaPlayback = true/);
 assert.match(nativePatch,/mediaTypesRequiringUserActionForPlayback = \[\]/);
 assert.match(nativePatch,/customClass="OpenIPTVBridgeViewController"/);
 assert.match(nativePatch,/AVAudioSession\.sharedInstance\(\)\.setActive\(true\)/);
 const inline=main.slice(main.indexOf('async function play(c,requestedURL'),main.indexOf('async function playFullscreen()'));
 assert.doesNotMatch(inline,/VideoPlayer\.initPlayer|requestFullscreen|webkitEnterFullscreen/);
 assert.match(inline,/showInline\(true\)/);
});

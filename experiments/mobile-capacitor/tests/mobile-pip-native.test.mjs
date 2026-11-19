import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
import {oldStyleLayout} from '../src/legacy-mobile-layout.mjs';
const root=path.resolve(import.meta.dirname,'..');
const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
const android=fs.readFileSync(path.join(root,'native/android/MainActivity.java'),'utf8');
const plugin=fs.readFileSync(path.join(root,'native/android/OpenIPTVAutoPipPlugin.java'),'utf8');
const patch=fs.readFileSync(path.join(root,'scripts/patch-native.mjs'),'utf8');
test('Settings expose persisted opt-in switch, off by default',()=>{
 const html=oldStyleLayout();
 assert.match(html,/id="autoPiPOnBackground"/);
 assert.doesNotMatch(html,/id="autoPiPOnBackground"[^>]+checked/);
 assert.match(main,/autoPiPOnBackground:false/);
 assert.match(main,/pipToggle\.onchange/);
 assert.match(main,/state\.settings\.autoPiPOnBackground=pipToggle\.checked;save\(\)/);
});
test('Android 12+ uses OS auto-enter when inline playing; pre-12 uses leave hint',()=>{
 assert.match(android,/setAutoEnterEnabled\(enabled && playing\)/);
 assert.match(android,/onUserLeaveHint\(\)/);
 assert.match(android,/enterPictureInPictureMode\(/);
 assert.match(android,/onPictureInPictureModeChanged/);
 assert.match(plugin,/@CapacitorPlugin\(name = "OpenIPTVAutoPiP"\)/);
 assert.match(patch,/AndroidManifest\.xml/);
 assert.match(patch,/supportsPictureInPicture/);
});
test('iOS enables audio background mode while preserving existing keys',()=>{
 assert.match(patch,/UIBackgroundModes/);
 assert.match(patch,/AVAudioSession\.sharedInstance\(\)\.setCategory/);
 assert.match(main,/createAutoPiPController/);
});
test('toggle is kept independent from fullscreen and normal play',()=>{
 const body=main.slice(main.indexOf('async function play(c,requestedURL'),main.indexOf('async function playFullscreen()'));
 assert.doesNotMatch(body,/VideoPlayer\.initPlayer/);
 assert.match(main,/syncAutoPiP\(\)/);
});

test('manual PiP call is wired to Android native plugin',()=>{assert.match(android,/enterManualPiP\(\)/);assert.match(plugin,/public void enter\(PluginCall call\)/);assert.match(main,/androidPiP\.enter\(\)/);});

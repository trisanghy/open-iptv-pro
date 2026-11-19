import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {oldStyleLayout} from '../src/legacy-mobile-layout.mjs';
const root=path.resolve(import.meta.dirname,'..');
const main=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
const workflow=fs.readFileSync(path.join(root,'../../.github/workflows/mobile-apk.yml'),'utf8');
test('EPG screen ships three checkbox sources and auto update without bundling any IPTV streams',()=>{
 const html=oldStyleLayout();
 for(const id of ['epgSourcesList','epgAutoRefresh','addEPGSource','loadEPG','autoRefreshPlaylists','autoResumeLast'])
 assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(css,/MOBILE_EPG_AUTOSYNC_V8/);
});
test('startup refreshes EPG and all remote M3U sources and resumes previous playback',()=>{
 assert.match(main,/async function startupSync\(\)/);
 assert.match(main,/refreshSources\(\{quiet:true\}\)/);
 assert.match(main,/epgManager\?\.refresh\(true\)/);
 assert.match(main,/resumePreviousChannel\(\)/);
 assert.match(main,/startup:true/);
 assert.match(main,/state\.resumeUrl=c\.url/);
});
test('iOS auto playback falls back to muted inline on NotAllowedError, never auto fullscreen',()=>{
 assert.match(main,/!startup\|\|e\?\.name!=='NotAllowedError'/);
 assert.match(main,/mediaMuted=true;await v\.play\(\)/);
 const play=main.slice(main.indexOf('async function play(c,requestedURL'),main.indexOf('async function playFullscreen()'));
 assert.doesNotMatch(play,/VideoPlayer\.initPlayer\(/);
});
test('native launcher icon generated for Android and iOS from canonical resources',()=>{
 assert.match(workflow,/assets@4\.0\.0 generate --android --assetPath resources/);
 assert.match(workflow,/assets@4\.0\.0 generate --ios --assetPath resources/);
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const expectedTag='mobile/v'+pkg.version.replace('-mobile.','.');
 assert.ok(workflow.includes('MOBILE_TAG: '+expectedTag),'Release tag must match the package version');
});

test('the EPG refresh rejects stale guides and tries another provider',()=>{
 const sync=fs.readFileSync(path.join(root,'src/mobile-epg-autosync.mjs'),'utf8');
 const engine=fs.readFileSync(path.join(root,'src/mobile-epg-auto.mjs'),'utf8');
 assert.match(sync,/guideCoverage\(guide,Date\.now\(\),parseDate\)/);
 assert.match(sync,/if\(!coverage\.usable\)throw Error/);
 assert.match(sync,/for\(const source of enabled\)/);
 assert.match(sync,/candidate\.cache/);
 assert.match(engine,/maxProgrammes\/Math\.max/);
 assert.match(sync,/state\.epgCache=accepted/);
});
test('EPG source and manual channel controls are wired without leaking playlist metadata',()=>{
 const sync=fs.readFileSync(path.join(root,'src/mobile-epg-autosync.mjs'),'utf8');
 assert.match(sync,/epgChannel'\)\.onchange=renderRows/);
 assert.match(sync,/matchGuideChannel\(state\.epgCache,channel\)/);
 assert.match(sync,/Array\.isArray\(result\.data\.data\)/);
});

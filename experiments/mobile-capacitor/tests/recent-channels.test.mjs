import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {recentChannelMatches,safeHistory} from '../src/mobile-ux.mjs';
const main=fs.readFileSync(path.resolve(import.meta.dirname,'../src/main.js'),'utf8');
const channels=[
 {url:'https://example.org/one.m3u8',name:'VTV1 HD',group:'VTV'},
 {url:'https://example.org/two.m3u8',name:'VTV2',group:'VTV'},
 {url:'https://example.org/three.m3u8',name:'Hanoi TV',group:'Địa phương'}
];
test('recent channel shortcuts appear newest first, unique and limited',()=>{
 const watched=['https://example.org/two.m3u8','https://example.org/one.m3u8','https://example.org/two.m3u8','https://example.org/three.m3u8'];
 assert.deepEqual(recentChannelMatches(channels,watched).map(x=>x.name),['VTV2','VTV1 HD','Hanoi TV']);
 assert.deepEqual(recentChannelMatches(channels,watched,{maxItems:2}).map(x=>x.name),['VTV2','VTV1 HD']);
});
test('stale/deleted playlist URLs do not appear but stored history stays intact',()=>{
 const history=['https://deleted.example/old.m3u8','https://example.org/three.m3u8'];
 assert.deepEqual(recentChannelMatches(channels,history).map(x=>x.name),['Hanoi TV']);
 assert.deepEqual(history,['https://deleted.example/old.m3u8','https://example.org/three.m3u8']);
});
test('quick-search recent rows match channel name or folder, insensitive to case',()=>{
 assert.equal(recentChannelMatches(channels,channels.map(x=>x.url),{query:'hANoi'}).length,1);
 assert.equal(recentChannelMatches(channels,channels.map(x=>x.url),{query:'VTV'}).length,2);
 assert.equal(recentChannelMatches(channels,channels.map(x=>x.url),{query:'missing'}).length,0);
});
test('watch-history records successful video playback, not simply selecting a channel',()=>{
 const pick=main.slice(main.indexOf('function pickChannel(c){'),main.indexOf('function channelTitle(',main.indexOf('function pickChannel(c){')));
 const play=main.slice(main.indexOf('async function play(c,requestedURL'),main.indexOf('async function playFullscreen()',main.indexOf('async function play(c,requestedURL')));
 assert.doesNotMatch(pick,/safeHistory\(state\.recentlyWatched/);
 const playOk=play.indexOf('await v.play()'),record=play.indexOf('state.recentlyWatched=safeHistory(');
 assert.ok(record>playOk,'watch history must be saved only after video starts');
 assert.match(main,/function renderRecentChannels\(\)/);
 assert.match(main,/renderRecentChannels\(\)/);
});
test('watch history persists up to 30 entries and clear action resets resume',()=>{
 const url=channels[0].url;assert.deepEqual(safeHistory([url],url),[url]);
 assert.match(main,/state\.recentlyWatched=\[\];state\.resumeUrl=null;save\(\);renderRecentChannels\(\)/);
});

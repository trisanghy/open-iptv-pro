'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const checker=require('../browser-channel-check.js');
const hls='#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXTINF:6.0,\nseg0001.ts\n';
const reply=(body,contentType='application/vnd.apple.mpegurl',status=200)=>
  new Response(body,{status,headers:{'content-type':contentType}});
const mapping=(routes,calls=[])=>async (url,opts)=>{
  calls.push({url,method:opts.method,range:opts.headers?.Range});
  const value=routes[url];
  if(value instanceof Error)throw value;
  if(typeof value==='function')return value(url,opts);
  if(value===undefined)throw new TypeError('Failed to fetch');
  return value.clone ? value.clone() : value;
};
const sample={id:'x1',url:'https://tv.test/live.m3u8',name:'News'};

test('Parses HLS playlist correctly',()=>{
  assert.equal(checker.firstHLSMedia(hls).valid,true);
  assert.equal(checker.firstHLSMedia(hls).segment,'seg0001.ts');
  assert.equal(checker.firstHLSMedia('#EXTM3U\n#EXTINF:2,\nother').valid,false);
});

test('HLS checks real segment bytes and reports alive',async()=>{
  const calls=[];
  const fetch=mapping({
    [sample.url]:reply(hls),
    'https://tv.test/seg0001.ts':reply(new Uint8Array([0x47,0x40,0,0x10]),'video/mp2t')
  },calls);
  const result=await checker.checkChannel(sample,{fetch});
  assert.equal(result.status,'alive');
  assert.equal(result.confirmedAlive,true);
  assert.equal(calls.length,2);
  assert.equal(calls[1].range,'bytes=0-4095');
});

test('HLS master playlist follows variant and checks a segment',async()=>{
  const ch={...sample,url:'https://tv.test/master.m3u8'};
  const fetch=mapping({
    [ch.url]:reply('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1000000\nlow/live.m3u8\n'),
    'https://tv.test/low/live.m3u8':reply(hls),
    'https://tv.test/low/seg0001.ts':reply(new Uint8Array([0x47,1,2,3]),'video/mp2t')
  });
  const result=await checker.checkChannel(ch,{fetch});
  assert.equal(result.status,'alive');
});

test('HLS manifest without accessible segment is inconclusive, never dead',async()=>{
  const fetch=mapping({[sample.url]:reply(hls),
    'https://tv.test/seg0001.ts':new TypeError('Failed to fetch')});
  const result=await checker.checkChannel(sample,{fetch});
  assert.equal(result.status,'uncertain');
  assert.equal(result.blocked,true);
});

test('Explicit 404/410 on all known sources is confirmed dead',async()=>{
  const primary='https://tv.test/a.m3u8',backup='https://tv.test/b.m3u8';
  const fetch=mapping({[primary]:reply('gone','text/plain',404),[backup]:reply('gone','text/plain',410)});
  const result=await checker.checkChannel({url:primary,lastPlaybackAt:new Date().toISOString(),lastPlayableUrl:primary},{
    links:[primary,backup],fetch});
  assert.equal(result.status,'dead');
  assert.equal(result.confirmedDead,true);
});

test('404 primary and valid fallback is alive via alternate link',async()=>{
  const backup='https://tv.test/backup.m3u8';
  const fetch=mapping({[sample.url]:reply('gone','text/plain',404),[backup]:reply(hls),
    'https://tv.test/seg0001.ts':reply(new Uint8Array([0x47,0x01]),'video/mp2t')});
  const result=await checker.checkChannel(sample,{links:[sample.url,backup],fetch});
  assert.equal(result.status,'alive');
  assert.equal(result.usedAlternate,true);
  assert.equal(result.checkedLink,backup);
});

test('403 remains unverified, not dead',async()=>{
  const fetch=mapping({[sample.url]:reply('forbidden','text/plain',403)});
  const result=await checker.checkChannel(sample,{fetch});
  assert.equal(result.status,'uncertain');
  assert.equal(result.confirmedDead,undefined);
});

test('CORS/TypeError remains inconclusive, not an invented dead stream',async()=>{
  const fetch=async()=>{throw new TypeError('Failed to fetch')};
  const result=await checker.checkChannel(sample,{fetch});
  assert.equal(result.status,'uncertain');
  assert.equal(result.blocked,true);
  assert.match(result.reason,/CORS|mạng/i);
});

test('HTTP 200 HTML error pages are not classified alive',async()=>{
  const fetch=mapping({[sample.url]:reply('<html>Error</html>','text/html')});
  const result=await checker.checkChannel(sample,{fetch});
  assert.equal(result.status,'uncertain');
});

test('200 direct MP4 media bytes count as confirmed HTTP media',async()=>{
  const ch={url:'https://tv.test/file.mp4'};
  const fetch=mapping({[ch.url]:reply(new Uint8Array([0,0,0,24,102,116,121,112]),'video/mp4')});
  const result=await checker.checkChannel(ch,{fetch});
  assert.equal(result.status,'alive');
  assert.equal(result.confirmedAlive,true);
});

test('DASH manifests without tested segments are not marked playable',async()=>{
  const ch={url:'https://tv.test/live.mpd'};
  const fetch=mapping({[ch.url]:reply('<?xml version="1.0"?><MPD><Period></Period></MPD>','application/dash+xml')});
  const result=await checker.checkChannel(ch,{fetch});
  assert.equal(result.status,'uncertain');
  assert.equal(result.reason.includes('DASH'),true);
});

test('CORS failure can be verified by Safari native video events',async()=>{
  const events={}; let removed=false;
  const video={
    canPlayType:()=> 'maybe',
    addEventListener:(n,fn)=>{events[n]=fn;},
    removeEventListener:()=>{},
    removeAttribute:()=>{},
    remove:()=>{removed=true;},
    pause:()=>{},
    load:()=>setTimeout(()=>events.loadeddata?.(),0)
  };
  const result=await checker.checkChannel(sample,{
    fetch:async()=>{throw new TypeError('Failed to fetch')},
    makeVideo:()=>video
  });
  assert.equal(result.status,'alive');
  assert.equal(result.confirmedAlive,true);
  assert.equal(removed,true);
});

test('Recent real playback is preserved if CORS cannot recheck a stream',async()=>{
  const ch={...sample,lastPlayableUrl:sample.url,lastPlaybackAt:new Date().toISOString()};
  const result=await checker.checkChannel(ch,{fetch:async()=>{throw new TypeError('Failed to fetch')}});
  assert.equal(result.status,'alive');
  assert.equal(result.fromRecentPlayback,true);
});

test('Unsupported protocols never masquerade as working',async()=>{
  const result=await checker.checkChannel({url:'rtsp://test/stream'},{
    fetch:async()=>{throw new Error('Should not fetch')}
  });
  assert.equal(result.status,'uncertain');
  assert.match(result.reason,/desktop/);
});

test('Abort stops queued checks without overwriting channel state',async()=>{
  const controller=new AbortController();controller.abort();
  await assert.rejects(checker.checkChannel(sample,{
    fetch:async()=>{throw Error('Should not fetch')},
    signal:controller.signal
  }),err=>err?.name==='AbortError');
});

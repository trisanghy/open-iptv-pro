'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../cloud-core.js');
test('snapshot excludes images and auth/session internals',()=>{
 const a={sources:[{url:'https://iptv.example/a.m3u?token=123'}],channels:[{id:'one'}],
   favorites:['one'],snapshots:{large:'x'.repeat(40000)},epgCache:{secret:'x'},
   cloudSession:'s',_internal:'x',volume:.6};
 const b=core.snapshot(a);
 assert.equal(b.snapshots,undefined);assert.equal(b.cloudSession,undefined);
 assert.equal(b._internal,undefined);assert.equal(b.sources[0].url,a.sources[0].url);
 assert.deepEqual(b.favorites,['one']);assert.equal(b.volume,.6);
});
test('snapshot cannot mutate the app store',()=>{
 const a={channels:[{id:'one',name:'Original'}]};const b=core.snapshot(a);
 b.channels[0].name='Changed';assert.equal(a.channels[0].name,'Original');
});
test('per-user conflict policy never silently overwrites two populated states',()=>{
 const local={sources:[{id:'home'}]},remote={payload:{sources:[{id:'cloud'}]},revision:4};
 assert.equal(core.decision({local,remote}),'conflict');
});
test('first cloud login with imported local data asks permission',()=>{
 assert.equal(core.decision({local:{sources:[{id:'a'}]},remote:null}),'ask-first-upload');
});
test('first login on empty browser downloads cloud automatically',()=>{
 assert.equal(core.decision({local:{sources:[],channels:[]},
  remote:{payload:{sources:[{id:'x'}]},revision:1}}),'download');
});
test('if local and remote are already equal, no overwrite required',()=>{
 const data={sources:[{id:'a'}],channels:[]};
 assert.equal(core.decision({local:data,remote:{payload:data,revision:2}}),'synced');
});
test('known same remote revision with offline local edits can upload',()=>{
 const baseline={sources:[{id:'a'}]},local={sources:[{id:'a'},{id:'b'}]};
 assert.equal(core.decision({local,remote:{payload:baseline,revision:3},knownRevision:3,knownPayload:baseline}),'upload');
});
test('known unedited local and newer remote can download',()=>{
 const baseline={sources:[{id:'a'}]};
 assert.equal(core.decision({local:baseline,remote:{payload:{sources:[{id:'b'}]},revision:4},knownRevision:3,knownPayload:baseline}),'download');
});
test('oversized cloud payload is rejected before upload',()=>{
 const huge={channels:[{name:'a'.repeat(core.MAX_BYTES+100)}]};
 assert.throws(()=>core.validate(huge),/quá lớn/);
});
test('JSON snapshot preserves custom folder order and channel links',()=>{
 const a={groupOrder:['Z','A'],channelOrder:{Z:['z2','z1']},autoEnableAudio:true,
  sources:[{url:'https://x.m3u'}]};
 const b=core.validate(a).payload;
 assert.deepEqual(b.groupOrder,['Z','A']);
 assert.deepEqual(b.channelOrder.Z,['z2','z1']);
 assert.equal(b.sources[0].url,'https://x.m3u');
});

test('web login email validation',()=>{
 assert.equal(core.validEmail('  user@example.com '),true);
 assert.equal(core.validEmail('broken-address'),false);
 assert.equal(core.validEmail('x'.repeat(260)+'@example.com'),false);
});
test('recover fresh Supabase confirmation link with localhost redirect',()=>{
 const link='https://project.supabase.co/auth/v1/verify?token=abc123&type=signup&redirect_to=http%3A%2F%2Flocalhost%3A3000';
 assert.deepEqual(core.verificationLink(link,'https://project.supabase.co'),{token_hash:'abc123',type:'signup'});
});
test('reject foreign and malformed verification links',()=>{
 assert.throws(()=>core.verificationLink('https://evil.example/auth/v1/verify?token=abc&type=email','https://project.supabase.co'),/Chỉ chấp nhận/);
 assert.throws(()=>core.verificationLink('http://project.supabase.co/auth/v1/verify?token=abc&type=email','https://project.supabase.co'),/Chỉ chấp nhận/);
 assert.throws(()=>core.verificationLink('https://project.supabase.co/auth/v1/verify?type=email','https://project.supabase.co'),/thiếu mã/);
});
test('auth errors show actionable messages',()=>{
 assert.match(core.authErrorMessage({message:'Token has expired or is invalid'}),/hết hạn/);
 assert.match(core.authErrorMessage({message:'Email rate limit exceeded'}),/quá nhiều/);
 assert.match(core.authErrorMessage({message:'Redirect URL not allowed'}),/URL chuyển hướng/);
});

test('PKCE recovery accepts localhost callback and preserves flow ID',()=>{
 const u='http://localhost:3000/?code=abcdef0123456789abcdef0123456789&sb_flow_id=flow123';
 assert.deepEqual(core.recoveryCode(u,'https://trisanghy.github.io/open-iptv-pro/'),
 {code:'abcdef0123456789abcdef0123456789',flowId:'flow123'});
});
test('PKCE recovery accepts configured website callback but no other hosts',()=>{
 const site='https://trisanghy.github.io/open-iptv-pro/';
 const good=site+'?code=abcdef0123456789abcdef0123456789';
 assert.equal(core.recoveryCode(good,site).code,'abcdef0123456789abcdef0123456789');
 assert.equal(core.recoveryCode('https://attacker.example/?code=abcdef0123456789abcdef0123456789',site),null);
 assert.equal(core.recoveryCode('http://localhost:4000/?code=abcdef0123456789abcdef0123456789',site),null);
 assert.equal(core.recoveryCode('http://localhost:3000/?code=short',site),null);
 assert.equal(core.recoveryCode('http://localhost:3000/?code=abcdef0123456789abcdef0123456789#ignored',site).code,'abcdef0123456789abcdef0123456789');
});

test('email rate-limit errors use HTTP status or Supabase code instead of generic network error',()=>{
 assert.equal(core.isEmailRateLimited({status:429,code:'over_email_send_rate_limit',message:'Failed to fetch'}),true);
 assert.equal(core.isEmailRateLimited({status:429,message:'Too Many Requests'}),true);
 assert.equal(core.isEmailRateLimited({code:'over_email_send_rate_limit'}),true);
 assert.equal(core.isEmailRateLimited({message:'Failed to fetch'}),false);
 assert.match(core.authErrorMessage({status:429,message:'Failed to fetch'}),/HTTP 429/);
});

test('default Supabase mailer can reject non-team email addresses',()=>{
 assert.match(core.authErrorMessage({code:'email_address_not_authorized',message:'Email address not authorized'}),/SMTP riêng/);
});

test('pasted PKCE Magic Link is extracted without opening an external redirect',()=>{
 const url='https://project.supabase.co/auth/v1/verify?token=pkce_0123456789abcdef&type=magiclink&redirect_to=http%3A%2F%2Flocalhost%3A3000';
 assert.deepEqual(core.verificationLink(url,'https://project.supabase.co'),
  {token_hash:'pkce_0123456789abcdef',type:'magiclink'});
});
test('Magic Link parser rejects a foreign project, even with a plausible PKCE token',()=>{
 const url='https://evil.example/auth/v1/verify?token=pkce_0123456789abcdef&type=magiclink';
 assert.throws(()=>core.verificationLink(url,'https://project.supabase.co'),/Chỉ chấp nhận/);
});
test('OTP expired error code provides a meaningful recovery hint',()=>{
 assert.match(core.authErrorMessage({code:'otp_expired',message:'Email link is invalid or has expired'}),/hết hạn/);
});

test('autobootstrap uploads a populated browser when cloud has no record',()=>{
 const local={sources:[{id:'one'}],favorites:['f']};
 assert.equal(core.automaticDecision({local,remote:null,meta:null}),'upload');
});
test('new browser automatically restores remote even when it has unrelated local data',()=>{
 const local={sources:[{id:'guest'}]},remote={payload:{sources:[{id:'cloud'}]},revision:3};
 assert.equal(core.automaticDecision({local,remote,meta:null}),'download');
});
test('ordinary local edits upload against unchanged server revision',()=>{
 const before={sources:[{id:'a'}]};
 const meta={revision:5,hash:core.digest(before),fields:core.fieldHashes(before)};
 const after={sources:[{id:'a'},{id:'b'}]};
 assert.equal(core.automaticDecision({local:after,remote:{payload:before,revision:5},meta}),'upload');
});
test('remote changes download when local matches its last known snapshot',()=>{
 const prev={sources:[{id:'a'}]},newer={sources:[{id:'b'}]};
 const meta={revision:5,hash:core.digest(prev),fields:core.fieldHashes(prev)};
 assert.equal(core.automaticDecision({local:prev,remote:{payload:newer,revision:6},meta}),'download');
});
test('unrelated simultaneous changes merge automatically without losing either setting',()=>{
 const base={sources:[{id:'a'}],theme:'dark',autoPlay:true};
 const local={...base,theme:'light'};
 const remote={...base,autoPlay:false};
 const merged=core.mergeFields({local,remote,baseline:core.fieldHashes(base)});
 assert.deepEqual(merged.merged,{sources:[{id:'a'}],theme:'light',autoPlay:false});
 assert.deepEqual(merged.conflicts,[]);
 assert.deepEqual(merged.applied,['theme']);
});
test('simultaneous same-field edits mark conflict and preserve remote authority',()=>{
 const base={sources:[{id:'old'}],theme:'dark'};
 const local={...base,sources:[{id:'local'}]};
 const remote={...base,sources:[{id:'remote'}]};
 const merged=core.mergeFields({local,remote,baseline:core.fieldHashes(base)});
 assert.deepEqual(merged.conflicts,['sources']);
 assert.deepEqual(merged.merged.sources,[{id:'remote'}]);
});
test('deleted fields merge correctly when only local changed',()=>{
 const base={theme:'dark',extra:'legacy'};
 const local={theme:'dark'};
 const remote={...base,selectedPage:'tv'};
 const merged=core.mergeFields({local,remote,baseline:core.fieldHashes(base)});
 assert.equal(Object.prototype.hasOwnProperty.call(merged.merged,'extra'),false);
 assert.equal(merged.merged.selectedPage,'tv');
});

test('legacy baseline downloads when old browser has no field hashes',()=>{
 const local={sources:[{id:'unsynced'}]},previous={sources:[{id:'old'}]};
 const remote={payload:{sources:[{id:'newer'}]},revision:3};
 const meta={revision:2,hash:core.digest(previous)};
 assert.equal(core.automaticDecision({local,remote,meta}),'download');
});
test('hash-based sync decision ignores identical cloud changes',()=>{
 const local={sources:[{id:'a'}],theme:'light'};
 assert.equal(core.automaticDecision({local,remote:{payload:local,revision:11},meta:null}),'synced');
});

test('serverChannelCount handles confirmed cloud playlists only',()=>{
 assert.equal(core.serverChannelCount({channels:[{id:'a'},{id:'b'}]}),2);
 assert.equal(core.serverChannelCount({channels:[]}),0);
 assert.equal(core.serverChannelCount({sources:[{id:'source'}]}),0);
 assert.equal(core.serverChannelCount(null),0);
 assert.equal(core.serverChannelCount({channels:{length:1184}}),0);
 const payload={channels:[{id:'a'}]};
 assert.equal(core.serverChannelCount(payload),1);
 assert.equal(payload.channels.length,1,'server count must never modify playlists');
});


test('cloud sync never uploads nested image bytes, thumbnails or frame captures',()=>{
 const a={
  channels:[{id:'a',name:'Demo',url:'https://iptv.example/stream.m3u8',
   logo:'https://cdn.example/logo.png',
   snapshot:'data:image/png;base64,'+'a'.repeat(10000),
   previewImage:'data:image/webp;base64,aaaa',
   thumbnail:{buffer:'large-file'},
   nested:{imageData:'fake-base64',subtitle:'kept'},
   lastFrame:'data:image/jpeg;base64,aaaa'}],
  collectorBackup:{channels:[{id:'original',screenshot:'data:image/png;base64,bbbb'}]},
  snapshots:{id:'local-only'},imageCache:{huge:'x'.repeat(50000)},
  sources:[{id:'provider',url:'https://iptv.example/source.m3u'}],
  favorites:['a'],snapshotConcurrency:8,snapshotSkipExisting:true,volume:0.4
 };
 const b=core.snapshot(a);
 assert.equal(b.snapshots,undefined);
 assert.equal(b.imageCache,undefined);
 assert.equal(b.channels[0].snapshot,undefined);
 assert.equal(b.channels[0].previewImage,undefined);
 assert.equal(b.channels[0].thumbnail,undefined);
 assert.equal(b.channels[0].lastFrame,undefined);
 assert.deepEqual(b.channels[0].nested,{subtitle:'kept'});
 assert.equal(b.collectorBackup.channels[0].screenshot,undefined);
 assert.equal(b.channels[0].logo,'https://cdn.example/logo.png');
 assert.equal(b.channels[0].url,'https://iptv.example/stream.m3u8');
 assert.equal(b.snapshotConcurrency,8);
 assert.equal(b.snapshotSkipExisting,true);
 assert.equal(b.volume,0.4);
 assert.ok(a.channels[0].snapshot.startsWith('data:image/png'));
 assert.doesNotMatch(JSON.stringify(core.validate(a).payload),/data:image|fake-base64|large-file/);
});
test('image-only fields are dropped even if future app versions add them',()=>{
 const b=core.snapshot({screenshots:[{jpeg:'huge'}],thumbnailBase64:'aaaa',
  channels:[{id:'a',coverData:'embedded',logo:'data:image/png;base64,AAAA'}],
  groupOrder:['News'],favoriteKeys:['a'],autoEnableAudio:true});
 assert.equal(b.screenshots,undefined);
 assert.equal(b.thumbnailBase64,undefined);
 assert.equal(b.channels[0].coverData,undefined);
 assert.equal(b.channels[0].logo,undefined);
 assert.deepEqual(b.groupOrder,['News']);
 assert.deepEqual(b.favoriteKeys,['a']);
 assert.equal(b.autoEnableAudio,true);
});

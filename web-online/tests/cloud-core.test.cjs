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

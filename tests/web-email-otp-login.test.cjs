'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cloud=require('../cloud-core.js');
const script=fs.readFileSync(path.join(__dirname,'../cloud-sync.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('email OTP preserves zero-prefixed codes and sanitizes paste separators',()=>{
 assert.equal(cloud.normalizeEmailOtp('001234'),'001234');
 assert.equal(cloud.normalizeEmailOtp('001 234'),'001234');
 assert.equal(cloud.normalizeEmailOtp('001-234'),'001234');
 assert.equal(cloud.normalizeEmailOtp(' 001 234 56 '),'00123456');
 assert.equal(cloud.normalizeEmailOtp('123456789'),'12345678');
});
test('email OTP requires six to eight ASCII digits',()=>{
 for(const otp of ['000000','123456','00012345'])assert.ok(cloud.validEmailOtp(otp));
 for(const otp of ['12345','123456789','12x456','１２３４５６',''])assert.equal(cloud.validEmailOtp(otp),false);
});
test('guest UI exposes OTP form while signed-in UI hides it',()=>{
 assert.match(script,/show\(otpForm,!uid&&!!client&&enabledProviders\.email\)/);
 assert.match(html,/id="cloudOtpForm"/);
 assert.match(html,/autocomplete="one-time-code"/);
 assert.match(html,/id="cloudOtpVerify"/);
 assert.match(html,/Gửi mã OTP qua email/);
});
test('OTP verification uses email token not browser-local PKCE link',()=>{
 assert.match(script,/client\.auth\.verifyOtp\(\{email,token,type:'email'\}\)/);
 assert.match(script,/client\.auth\.signInWithOtp\(\{/);
 assert.match(script,/core\.validEmailOtp\(token\)/);
 assert.match(script,/otpVerify\.disabled=true/);
});
test('Magic Link remains a separate, user-triggered fallback',()=>{
 assert.match(script,/core\.verificationLink\(raw,client\.supabaseUrl\)/);
 assert.match(script,/linkHelpOpen/);
 assert.match(script,/client\.auth\.verifyOtp\(verification\)/);
});
test('email OTP does not serialize or log the secret in app state',()=>{
 assert.doesNotMatch(script,/localStorage\.setItem\([^\n]*token/);
 assert.doesNotMatch(script,/console\.log\([^\n]*token/);
});

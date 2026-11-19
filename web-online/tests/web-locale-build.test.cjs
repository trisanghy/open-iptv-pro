'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const build=fs.readFileSync(path.join(root,'web-online/prepare-web.py'),'utf8');
const i18n=fs.readFileSync(path.join(root,'i18n.js'),'utf8');
test('Web build retains current localization and dynamic language options',()=>{
 assert.match(build,/copy2\(Path\(__file__\)\.resolve\(\)\.parent\.parent\/'i18n\.js',out\/'i18n\.js'\)/);
 for(const locale of ['en','fr','de','it','ja','ko','ru','id','hi','ar']) assert.ok(i18n.includes('"'+locale+'":'),locale);
 assert.match(i18n,/const option=document.createElement\('option'\)/);
 assert.match(i18n,/english\[compact\]/);
 assert.match(build,/hashlib\.sha256/);
 assert.match(build,/Missing language resource script/);
});
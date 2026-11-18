'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const os=require('node:os'),fs=require('node:fs/promises'),path=require('node:path');
const {gzipSync}=require('node:zlib');
const {readGuideFile,decodeGuideBuffer,MAX_XML,MAX_COMPRESSED}=require('../src/epg.cjs');
const xml='<?xml version="1.0"?><tv><channel id="vtv1"><display-name>VTV1</display-name></channel><programme start="20261110190000 +0700" stop="20261110200000 +0700" channel="vtv1"><title>Thời sự</title></programme></tv>';
test('manual file import validates and decodes XMLTV and gzip with same rules as HTTP',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'iptv-epg-test-'));
 try{
  for(const [name,data] of [['guide.xml',Buffer.from(xml)],['guide.xmltv',Buffer.from(xml)],['guide.xml.gz',gzipSync(xml)]]){
   const f=path.join(root,name);await fs.writeFile(f,data);const result=await readGuideFile(f);
   assert.equal(result.xml,xml);assert.equal(result.name,name);assert.equal(result.bytes,Buffer.byteLength(xml));assert.ok(result.importedAt);
  }
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('manual file import fails closed on empty / HTML / corrupt gzip',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'iptv-epg-test-'));
 try{
  for(const [name,data] of [['empty.xml',''],['fake.xml','<html>Invalid</html>'],['bad.gz',Buffer.from([0x1f,0x8b,0x08,0x00,0x99])]]){
   const f=path.join(root,name);await fs.writeFile(f,data);await assert.rejects(()=>readGuideFile(f));
  }
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('manual import rejects compressed/decompressed limits before allocating unbounded content',()=>{
 assert.throws(()=>decodeGuideBuffer(Buffer.alloc(MAX_XML+1)),/35 MB/);
 assert.throws(()=>decodeGuideBuffer(gzipSync(Buffer.alloc(MAX_XML+1,65))),/limit|larger|35 MB|larger than|larger|Buffer|decompress|out of range/i);
 const huge=Buffer.concat([Buffer.from([0x1f,0x8b]),Buffer.alloc(MAX_COMPRESSED+1)]);
 assert.throws(()=>decodeGuideBuffer(huge),/12 MB/);
});

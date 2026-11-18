'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const {PassThrough}=require('node:stream');
const {discoverAirplay,parseAirplayLine}=require('../src/airplay-discovery.cjs');
const serviceLine=(action,name)=>`11:05:31.232  ${action}    2   4 local.   _airplay._tcp.  ${name}\n`;
test('AirPlay parser: recognizes video AirPlay service, preserving Vietnamese receiver names',()=>{
 assert.deepEqual(parseAirplayLine(serviceLine('Add','TV Hưng Yên')),{action:'add',name:'TV Hưng Yên'});
 assert.deepEqual(parseAirplayLine(serviceLine('Rmv','Redmi K70E (AirPlay)')),{action:'rmv',name:'Redmi K70E (AirPlay)'});
 assert.equal(parseAirplayLine('11:05:31.232  Add 2 4 local. _googlecast._tcp. TV'),null);
 assert.equal(parseAirplayLine(''),null);
});
test('AirPlay discovery: scans macOS via dns-sd and displays distinct video receiver devices',async()=>{
 let commands=[];
 const fakeSpawn=(path,args)=>{
  commands.push([path,args]);const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.kill=()=>{child.emit('close',null);return true;};
  setImmediate(()=>{child.stdout.write('Browsing for _airplay._tcp.local.\n');child.stdout.write(serviceLine('Add','TV Hưng Yên'));child.stdout.write(serviceLine('Add','Redmi K70E (AirPlay)'));child.stdout.write(serviceLine('Add','TV Hưng Yên'));});
  return child;
 };
 const result=await discoverAirplay({platform:'darwin',spawnImpl:fakeSpawn,waitMs:30});
 assert.equal(commands.length,1);assert.equal(commands[0][0],'/usr/bin/dns-sd');
 assert.deepEqual(commands[0][1],['-B','_airplay._tcp','local.']);
 assert.deepEqual(result.map(x=>x.name),['Redmi K70E (AirPlay)','TV Hưng Yên']);
});
test('AirPlay discovery: not active on non-Mac platforms',async()=>{
 const result=await discoverAirplay({platform:'win32',spawnImpl:()=>{throw Error('must not spawn');}});
 assert.deepEqual(result,[]);
});
test('AirPlay discovery: malformed/no receiver service does not invent a device',async()=>{
 const spawnImpl=()=>{const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.kill=()=>true;setImmediate(()=>{child.stdout.end('Browsing for _airplay._tcp.local.\n');});return child;};
 assert.deepEqual(await discoverAirplay({platform:'darwin',spawnImpl,waitMs:30}),[]);
});

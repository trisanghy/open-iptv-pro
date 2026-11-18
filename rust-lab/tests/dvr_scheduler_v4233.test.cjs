'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const os=require('node:os'),path=require('node:path'),fs=require('node:fs');
const {EventEmitter}=require('node:events');
const {createRecordingScheduler,validateNew,safeUrl,conflict}=require('../src/recording-scheduler.cjs');
const tsPackets=n=>Buffer.concat(Array.from({length:n},()=>Buffer.concat([Buffer.from([0x47]),Buffer.alloc(187)])));
function temp(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'iptv-dvr-'));return {root,clean:()=>fs.rmSync(root,{recursive:true,force:true})};}
function fixture(){const t=temp(),clock={value:Date.now()},children=[];
 const spawnFn=(_cmd,args)=>{const child=new EventEmitter();child.stderr=new EventEmitter();child.args=args;child.kill=(signal)=>{child.killedWith=signal;return true;};children.push(child);return child;};
 const create=()=>createRecordingScheduler({baseDir:t.root,ffmpegPath:'ffmpeg',now:()=>clock.value,spawnFn,tickMs:100000});
 const job=(start=clock.value+60000,end=start+3600000)=>({title:'Thời sự 19h',channelName:'VTV 1',channelId:'vtv-1',url:'https://example.com/live/index.m3u8',startAt:start,endAt:end});
 return {...t,clock,children,create,job};
}
test('DVR refuses dangerous URLs, invalid time, excess duration',()=>{
 const now=Date.now(),j={title:'News',channelName:'Ch',url:'https://example.org/stream.m3u8',startAt:now+100000,endAt:now+200000};
 assert.equal(validateNew(j,now).url,'https://example.org/stream.m3u8');
 assert.throws(()=>safeUrl('file:///etc/passwd'));assert.throws(()=>safeUrl('https://user:pass@example.org/'));
 assert.throws(()=>validateNew({...j,endAt:j.startAt+9*3600000},now));
 assert.throws(()=>validateNew({...j,startAt:now-60000},now));
 assert.equal(conflict({startAt:0,endAt:10},{startAt:10,endAt:20}),false);
 assert.equal(conflict({startAt:0,endAt:10},{startAt:9,endAt:20}),true);
});
test('DVR persists scheduled jobs across app restart without triggering early',()=>{const t=fixture();try{
 const d=t.create();const created=d.create(t.job());assert.equal(created.status,'scheduled');assert.equal(d.list().jobs.length,1);
 const other=t.create();assert.equal(other.list().jobs[0].id,created.id);assert.equal(t.children.length,0);
 d.shutdown();other.shutdown();
}finally{t.clean();}});
test('DVR prevents overlapping jobs but permits sequential jobs',()=>{const t=fixture();try{const d=t.create();d.create(t.job());assert.throws(()=>d.create(t.job(t.clock.value+3600000,t.clock.value+7200000)),/trùng/);assert.equal(d.create(t.job(t.clock.value+3660000,t.clock.value+7200000)).status,'scheduled');d.shutdown();}finally{t.clean();}});
test('DVR marks stale schedule missed rather than recording retrospectively',()=>{const t=fixture();try{const d=t.create();d.create(t.job());t.clock.value+=180000;d.tick();assert.equal(d.list().jobs[0].status,'missed');assert.equal(t.children.length,0);d.shutdown();}finally{t.clean();}});
test('DVR safely captures to TS, then remuxes to a verified MP4 at scheduled end',()=>{const t=fixture();try{
 const d=t.create(),j=d.create(t.job());t.clock.value=j.startAt;d.tick();assert.equal(t.children.length,1);
 const capture=t.children[0],tempPath=capture.args.at(-1);
 assert.match(tempPath,/\.part\.ts$/);fs.writeFileSync(tempPath,tsPackets(100));
 t.clock.value=j.endAt;capture.emit('close',0,null);
 assert.equal(d.list().jobs[0].status,'finalizing');assert.equal(t.children.length,2);
 const remux=t.children[1],mp4Temp=remux.args.at(-1);
 assert.match(mp4Temp,/\.part\.mp4$/);
 assert.ok(remux.args.includes('+faststart'));assert.equal(remux.args.at(-2),'mp4');
 const box=(type,data)=>{const b=Buffer.alloc(8);b.writeUInt32BE(8+data.length,0);b.write(type,4,'ascii');return Buffer.concat([b,data]);};
 fs.writeFileSync(mp4Temp,Buffer.concat([box('ftyp',Buffer.from('isom0000')),box('moov',Buffer.alloc(96)),box('mdat',Buffer.alloc(2048))]));
 remux.emit('close',0,null);
 const result=d.list().jobs[0];assert.equal(result.status,'completed');assert.match(result.file,/\.mp4$/);
 assert.match(result.file,/VTV 1_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}_den_.*Thời sự 19h/);
 assert.ok(fs.existsSync(result.file));assert.equal(fs.existsSync(tempPath),false);d.shutdown();
}finally{t.clean();}});
test('MP4 remux failure preserves the original TS and never reports completed',()=>{const t=fixture();try{
 const d=t.create(),j=d.create(t.job());t.clock.value=j.startAt;d.tick();fs.writeFileSync(t.children[0].args.at(-1),tsPackets(30));
 t.clock.value=j.endAt;t.children[0].emit('close',0,null);assert.equal(d.list().jobs[0].status,'finalizing');
 t.children[1].stderr.emit('data',Buffer.from('Unsupported codec'));t.children[1].emit('close',1,null);
 const result=d.list().jobs[0];assert.equal(result.status,'failed');assert.match(result.file,/\.partial\.ts$/);assert.ok(fs.existsSync(result.file));d.shutdown();
}finally{t.clean();}});
test('DVR does not call early clean FFmpeg exit a completed recording',()=>{const t=fixture();try{
 const d=t.create(),j=d.create(t.job());t.clock.value=j.startAt;d.tick();const child=t.children[0];fs.writeFileSync(child.args.at(-1),tsPackets(40));
 t.clock.value+=20000;child.emit('close',0,null);assert.equal(d.list().jobs[0].status,'failed');assert.match(d.list().jobs[0].file,/\.partial\.ts$/);d.shutdown();
}finally{t.clean();}});
test('DVR FFmpeg failure is non-destructive and leaves partial file with failure label',()=>{const t=fixture();try{
 const d=t.create(),j=d.create(t.job());t.clock.value=j.startAt;d.tick();const child=t.children[0];fs.writeFileSync(child.args.at(-1),Buffer.alloc(1024));child.stderr.emit('data',Buffer.from('Network error'));
 child.emit('close',1,null);assert.equal(d.list().jobs[0].status,'failed');assert.match(d.list().jobs[0].file,/partial.ts$/);d.shutdown();
}finally{t.clean();}});
test('DVR can cancel scheduled task or stop active FFmpeg without deleting partial data',()=>{const t=fixture();try{
 const d=t.create(),j1=d.create(t.job());d.stopJob(j1.id);assert.equal(d.list().jobs[0].status,'cancelled');
 const j2=d.create(t.job());t.clock.value=j2.startAt;d.tick();const child=t.children[0];fs.writeFileSync(child.args.at(-1),Buffer.alloc(800));d.stopJob(j2.id);assert.equal(child.killedWith,'SIGINT');child.emit('close',null,'SIGINT');
 assert.equal(d.list().jobs.find(j=>j.id===j2.id).status,'cancelled');d.shutdown();
}finally{t.clean();}});
test('DVR interrupted on shutdown and recovers an orphan .part.ts on next start',()=>{const t=fixture();try{
 const d=t.create(),job=d.create(t.job());t.clock.value=job.startAt;d.tick();fs.writeFileSync(t.children[0].args.at(-1),Buffer.alloc(188*5));d.shutdown();
 const d2=t.create(),j=d2.list().jobs[0];assert.equal(j.status,'interrupted');assert.match(j.file,/interrupted.ts$/);assert.ok(fs.existsSync(j.file));d2.shutdown();
}finally{t.clean();}});
test('DVR corrupted schedule JSON is quarantined, not discarded',()=>{const t=fixture();try{
 const file=path.join(t.root,'dvr-schedule-v1.json');fs.writeFileSync(file,'invalid JSON');const d=t.create();assert.equal(d.list().jobs.length,0);
 assert.ok(fs.readdirSync(t.root).some(f=>f.startsWith('dvr-schedule-v1.json.corrupt-')));d.shutdown();
}finally{t.clean();}});
test('DVR backup restores only future scheduled jobs without changing recording directory',()=>{const t=fixture();try{
 const d=t.create();d.create(t.job());const backup=d.exportPending();const d2=t.create();const count=d2.importPending(backup);assert.equal(count,1);assert.equal(d2.list().jobs.filter(j=>j.status==='scheduled').length,1);assert.equal(d2.list().directory,path.join(t.root,'recordings'));
 d.shutdown();d2.shutdown();
}finally{t.clean();}});
test('DVR backup rejects corrupted or overlapping schedules, leaves existing jobs unchanged',()=>{const t=fixture();try{
 const d=t.create();d.create(t.job());const backup=JSON.parse(d.exportPending());backup.pending.push({...backup.pending[0],channelName:'Another'});
 const before=d.list().jobs.map(j=>j.id);
 assert.throws(()=>d.importPending(JSON.stringify(backup)),/trùng/);
 assert.deepEqual(d.list().jobs.map(j=>j.id),before);
 assert.throws(()=>d.importPending('{not-json}'),/không hợp lệ/);d.shutdown();
}finally{t.clean();}});
test('Backup format retains DVR schedule payload and validates it on restore',async()=>{
 const service=require('../src/backup-service.cjs'),t=fixture();try{
  const d=t.create();d.create(t.job());const data={sources:[],channels:[],snapshots:{}};
  const {output}=await service.createBackup({'open-iptv-pro-4':JSON.stringify(data),'open-iptv-pro-dvr-v1':d.exportPending()},path.join(t.root,'snapshots'));
  const backupPath=path.join(t.root,'settings.iptvbackup');fs.writeFileSync(backupPath,output);
  const inspect=await service.readBackup(backupPath);
  assert.equal(d.prepareImport(inspect.data.storage['open-iptv-pro-dvr-v1']).length,1);
  const recovered=await service.restoreBackup(inspect.data,path.join(t.root,'restored-images'));
  assert.equal(recovered.storage['open-iptv-pro-dvr-v1'],d.exportPending());
  d.shutdown();
 }finally{t.clean();}
});

'use strict';
const {spawn}=require('node:child_process');
/** Discover video-capable AirPlay services advertised on macOS Bonjour.
 * Discovery does NOT establish an AirPlay video session; Safari owns playback selection.
 */
function parseAirplayLine(line){
 const match=String(line).match(/\b(Add|Rmv)\s+\d+\s+\d+\s+\S+\s+_airplay\._tcp\.?\s+(.+?)\s*$/i);
 if(!match)return null;
 const name=match[2].trim();
 if(!name || name.length>180)return null;
 return {action:match[1].toLowerCase(),name};
}
function discoverAirplay({platform=process.platform,spawnImpl=spawn,waitMs=3800}={}){
 if(platform!=='darwin')return Promise.resolve([]);
 return new Promise((resolve,reject)=>{
  const devices=new Map();let child,done=false,output='';
  const finish=(err)=>{if(done)return;done=true;clearTimeout(timer);try{child?.kill('SIGTERM');}catch{}if(err)reject(err);else resolve([...devices.values()].sort((a,b)=>a.name.localeCompare(b.name)));};
  const parse=(chunk)=>{
   output+=String(chunk).replace(/\r/g,'\n');
   const lines=output.split('\n');output=lines.pop()||'';
   for(const line of lines){const found=parseAirplayLine(line);if(!found)continue;const id=found.name.toLocaleLowerCase();if(found.action==='add')devices.set(id,{id,name:found.name,type:'airplay'});else devices.delete(id);}
   if(output.length>8192)output='';
  };
  // DNS-SD is shipped with macOS and sees the same Bonjour services as Safari.
  const timer=setTimeout(()=>{parse('\n');finish();},Math.max(300,Math.min(12000,waitMs)));
  try{
   child=spawnImpl('/usr/bin/dns-sd',['-B','_airplay._tcp','local.'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
   child.stdout?.on('data',parse);child.stderr?.on('data',parse);
   child.once('error',e=>finish(Error('Không quét được AirPlay qua Bonjour: '+e.message)));
   child.once('close',code=>{if(!done){parse('\n');finish(code===0?null:Error('Công cụ tìm thiết bị AirPlay đã dừng bất ngờ.'))}});
  }catch(e){finish(e);}
 });
}
module.exports={discoverAirplay,parseAirplayLine};

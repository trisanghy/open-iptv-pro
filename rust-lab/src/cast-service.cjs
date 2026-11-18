'use strict';
const {CastRelay,validUrl}=require('./cast-relay.cjs');
class CastService{
 constructor({relay=new CastRelay(),bonjourFactory=null,castLibrary=null}={}){
  this.relay=relay;this.bonjourFactory=bonjourFactory;this.castLibrary=castLibrary;this.devices=new Map();this.client=null;this.player=null;this.active=null;
 }
 deps(){
  if(!this.bonjourFactory){let b;try{b=require('bonjour-service');}catch{throw Error('Thiếu bonjour-service; hãy chạy npm install trước khi đóng gói');}this.bonjourFactory=()=>new (b.Bonjour||b.default||b)();}
  if(!this.castLibrary){try{this.castLibrary=require('castv2-client');}catch{throw Error('Thiếu castv2-client; hãy chạy npm install trước khi đóng gói');}}
 }
 async discover(wait=4200){this.deps();const bonjour=this.bonjourFactory();const results=new Map();let browser;
  try{
   browser=bonjour.find({type:'googlecast',protocol:'tcp'},s=>{
    const address=(s.addresses||[]).find(a=>/^(?:\d{1,3}\.){3}\d{1,3}$/.test(a));
    if(!address)return;
    const port=Number(s.port)||8009,id=`${address}:${port}`;
    results.set(id,{id,name:String(s.name||s.txt?.fn||'Google Cast').slice(0,90),address,port});
   });
   await new Promise(resolve=>setTimeout(resolve,Math.min(12000,Math.max(500,wait))));
  }finally{try{browser?.stop();}catch{}try{bonjour.destroy();}catch{}}
  this.devices=results;return [...results.values()].map(d=>({id:d.id,name:d.name}));
 }
 async play(deviceId,url,name='IPTV'){
  this.deps();validUrl(url);const target=this.devices.get(deviceId);if(!target)throw Error('TV không có trong danh sách tìm thấy. Hãy quét thiết bị lại.');
  await this.stop();const relay=await this.relay.start(url,target.address);
  const {Client,DefaultMediaReceiver}=this.castLibrary;
  const client=new Client();this.client=client;
  client.on('error',e=>{this.lastError=e.message;});
  try{
   await new Promise((resolve,reject)=>{
    const t=setTimeout(()=>reject(Error('Không kết nối được TV trong 9 giây')),9000);
    client.once('error',e=>{clearTimeout(t);reject(e);});
    client.connect(target.address,()=>{clearTimeout(t);resolve();});
   });
   const player=await new Promise((resolve,reject)=>client.launch(DefaultMediaReceiver,(e,p)=>e?reject(e):resolve(p)));
   this.player=player;
   const kind=/\.m3u8?(?:\?|$)/i.test(url)?'application/x-mpegURL':/\.mp4(?:\?|$)/i.test(url)?'video/mp4':'video/mp2t';
   const media={contentId:relay.url,contentType:kind,streamType:'LIVE',metadata:{metadataType:0,title:String(name).slice(0,120)}};
   await new Promise((resolve,reject)=>player.load(media,{autoplay:true},e=>e?reject(e):resolve()));
   this.active={id:target.id,name:target.name,channel:String(name)};return {active:this.active};
  }catch(e){await this.stop();throw Error('Không phát được lên '+target.name+': '+e.message);}
 }
 async openAirplay(url,launchSafari){validUrl(url);await this.stop();const relay=await this.relay.start(url);await launchSafari(relay.page);this.active={id:'airplay',name:'Safari / AirPlay',channel:''};return {page:relay.page};}
 status(){return {active:this.active};}
 async stop(){
  const client=this.client,player=this.player;
  this.client=null;this.player=null;this.active=null;
  // Disconnecting a sender alone does not stop the Cast receiver: send STOP first.
  if(player?.stop){await new Promise(resolve=>{const timer=setTimeout(resolve,1800);try{player.stop(()=>{clearTimeout(timer);resolve();});}catch{clearTimeout(timer);resolve();}});}
  try{client?.close();}catch{}
  await this.relay.stop();return {stopped:true};
 }
}
module.exports={CastService};

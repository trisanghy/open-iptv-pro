'use strict';
/*
 * Open IPTV Pro: ephemeral, consented TV pairing over Supabase Realtime Broadcast.
 * No database tables and no persistent credentials. The six-digit code is discovery
 * only. Commands and media URLs use a fresh ECDH P-256 / AES-GCM session key.
 * The TV may enable one-time auto-pairing after it displays an expiring PIN.
 * A code grants access to that TV session, so never share a code with strangers.
 */
(function(root){
 if(!root||!root.document)return;
 const PREFIX='openiptv-tv-v1-';
 const wc=()=>root.crypto;
 const textEncoder=new TextEncoder(),textDecoder=new TextDecoder();
 const random=n=>{const out=new Uint8Array(n);wc().getRandomValues(out);return out;};
 const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 const id=()=>hex(random(16));
 const pin=()=>String(100000+(new DataView(random(4).buffer).getUint32(0)%900000));
 const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 const decode=value=>{
  const s=String(value).replaceAll('-','+').replaceAll('_','/');
  const raw=atob(s+'='.repeat((4-s.length%4)%4));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
 };
 const validateUrl=value=>{
  try{const u=new URL(String(value));
   if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return '';
   if(/^(localhost|0\.0\.0\.0|127\..*|\[::1\])$/i.test(u.hostname))return '';
   if(u.href.length>4096)return '';
   return u.href;
  }catch{return '';}
 };
 const newKeys=()=>wc().subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);
 const pub=async pair=>encode(await wc().subtle.exportKey('raw',pair.publicKey));
 const derive=async(pair,other)=>{
  const key=await wc().subtle.importKey('raw',decode(other),{name:'ECDH',namedCurve:'P-256'},false,[]);
  return wc().subtle.deriveKey({name:'ECDH',public:key},pair.privateKey,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 };
 const seal=async(key,data)=>{
  const nonce=random(12);
  const ciphertext=await wc().subtle.encrypt({name:'AES-GCM',iv:nonce},key,textEncoder.encode(JSON.stringify(data)));
  return {nonce:encode(nonce),ciphertext:encode(ciphertext)};
 };
 const unseal=async(key,message)=>{
  if(!message||typeof message.ciphertext!=='string'||typeof message.nonce!=='string')throw Error('Bản tin không hợp lệ');
  const plain=await wc().subtle.decrypt({name:'AES-GCM',iv:decode(message.nonce)},key,decode(message.ciphertext));
  return JSON.parse(textDecoder.decode(plain));
 };
 let clientPromise=null;
 async function getClient(){
  if(!wc()?.subtle||!wc()?.getRandomValues)throw Error('TV/trình duyệt cần hỗ trợ HTTPS và Web Crypto để ghép đôi an toàn.');
  if(!root.supabase?.createClient)throw Error('Không có thư viện kết nối TV. Vui lòng tải lại trang.');
  if(!clientPromise)clientPromise=(async()=>{
   const resp=await root.fetch('cloud-config.json',{cache:'no-store'});
   if(!resp.ok)throw Error('Không tải được cấu hình kết nối TV.');
   const cfg=await resp.json();
   if(!cfg.enabled||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url||'')||
      !/^sb_publishable_[\w-]+$/.test(cfg.publishableKey||''))
     throw Error('Ghép đôi TV chưa được cấu hình trên máy chủ.');
   return root.supabase.createClient(cfg.url,cfg.publishableKey,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
    realtime:{params:{eventsPerSecond:8}}
   });
  })().catch(err=>{clientPromise=null;throw err;});
  return clientPromise;
 }
 const send=(ch,event,payload)=>ch.send({type:'broadcast',event,payload});
 const listen=(ch,event,handler)=>{ch.on('broadcast',{event},({payload})=>{
  try{const p=handler(payload);if(p?.catch)p.catch(error=>console.warn('TV pairing event',error));}
  catch(error){console.warn('TV pairing event',error);}
 });};
 const joined=ch=>new Promise((resolve,reject)=>{
  let done=false;
  const timeout=setTimeout(()=>{if(!done){done=true;reject(Error('Kết nối TV quá thời gian. Kiểm tra Internet trên cả hai thiết bị.'));}},12000);
  ch.subscribe((status,err)=>{
   if(done)return;
   if(status==='SUBSCRIBED'){done=true;clearTimeout(timeout);resolve();}
   if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
    done=true;clearTimeout(timeout);reject(Error('Không kết nối được dịch vụ ghép đôi: '+String(err?.message||status)));
   }
  });
 });
 const unsubscribe=async(client,ch)=>{if(!ch)return;try{await client.removeChannel(ch);}catch{}};
 function createReceiver({onStatus=()=>{},onRequest=()=>{},onCommand=()=>{},onConnected=()=>{},autoApprove=false}={}){
  const state={code:pin(),connected:false,closed:false,ready:false,pending:null,channel:null,session:null,client:null,key:null,controllerId:null,seen:new Set(),expiry:null};
  async function start(){
   state.client=await getClient();
   const keys=await newKeys();
   state.keys=keys;
   const topic=PREFIX+'pin-'+state.code;
   const channel=state.client.channel(topic,{config:{broadcast:{ack:true,self:false}}});
   state.channel=channel;
   listen(channel,'pair-request',async request=>{
    if(state.closed||state.connected||state.pending||state.session||!request||
       !/^[a-f0-9]{32}$/.test(String(request.sender||''))||
       typeof request.pub!=='string'||request.pub.length>200)return;
    if(Date.now()>state.expiry)return;
    state.pending={sender:request.sender,pub:request.pub,label:String(request.label||'Trình duyệt').slice(0,70)};
    if(autoApprove){
     onStatus('Đã nhận đúng mã TV. Đang tự động ghép đôi an toàn…');
     void approve().catch(error=>onStatus('Không thể tự ghép đôi: '+String(error?.message||error)));
    }else onRequest(state.pending);
   });
   await joined(channel);
   state.ready=true;
   state.expiry=Date.now()+5*60*1000;
   onStatus('Mã đã sẵn sàng. Nhập mã này trong Open IPTV Pro trên máy tính.');
   return state.code;
  }
  async function approve(){
   const pending=state.pending;
   if(!pending||state.closed||state.connected)throw Error('Không có yêu cầu ghép đôi.');
   try{
    state.key=await derive(state.keys,pending.pub);
    const sessionId=id();
    const session=state.client.channel(PREFIX+'session-'+sessionId,{config:{broadcast:{ack:true,self:false}}});
    state.session=session;
    listen(session,'sealed',async payload=>{
     if(state.closed||!state.key)return;
     let msg;
     try{msg=await unseal(state.key,payload);}catch{return;}
     if(msg?.sender!==state.controllerId||!Number.isInteger(msg.seq)||msg.seq<0||state.seen.has(msg.seq))return;
     state.seen.add(msg.seq);
     if(state.seen.size>300)state.seen.clear();
     if(msg.kind==='hello'){
      state.connected=true;onConnected();
      await send(session,'sealed',await seal(state.key,{kind:'ready',ts:Date.now(),sender:'tv'}));
      // A PIN is one-use only. Stop accepting new pair requests on the public room.
      await unsubscribe(state.client,state.channel);state.channel=null;
      onStatus('Đã ghép đôi an toàn. Bạn có thể chọn kênh trên máy tính.');
     }else if(msg.kind==='command'){
      const kind=String(msg.action||'');
      if(!['play','pause','resume','stop','volume','disconnect'].includes(kind))return;
      if(kind==='play'&&!validateUrl(msg.url)){onStatus('TV từ chối URL luồng không hợp lệ.');return;}
      const commandId=/^[a-f0-9]{32}$/.test(String(msg.commandId||''))?msg.commandId:'';
      try{
       await onCommand({action:kind,url:kind==='play'?validateUrl(msg.url):'',name:String(msg.name||'').slice(0,100),
        mediaId:String(msg.mediaId||'').slice(0,320),
        volume:Number.isFinite(msg.volume)?Math.max(0,Math.min(1,msg.volume)):null,muted:!!msg.muted});
       if(commandId)await send(session,'sealed',await seal(state.key,
        {kind:'command-ack',sender:'tv',commandId,accepted:true,action:kind,ts:Date.now()}));
      }catch(error){
       if(commandId)await send(session,'sealed',await seal(state.key,
        {kind:'command-ack',sender:'tv',commandId,accepted:false,action:kind,ts:Date.now()}));
       onStatus('TV không xử lý được lệnh '+kind+': '+String(error?.message||error));
      }
      if(kind==='disconnect')await close();
     }
    });
    await joined(session);
    state.controllerId=pending.sender;
    await send(state.channel,'pair-approved',{target:pending.sender,pub:await pub(state.keys),topic:sessionId});
    state.pending=null;
    onRequest(null);
    onStatus('Đang xác thực và kết nối với máy tính…');
   }catch(error){
    if(!state.connected){await unsubscribe(state.client,state.session);state.session=null;state.key=null;state.controllerId=null;}
    state.pending=null;onRequest(null);onStatus('Ghép đôi thất bại: '+String(error.message||error));throw error;
   }
  }
  async function reportPlayback(playbackState,name='',mediaId=''){
   if(!state.connected||!state.session||!state.key)return false;
   if(!['playing','paused','error','stopped'].includes(playbackState))return false;
   await send(state.session,'sealed',await seal(state.key,{kind:'playback',sender:'tv',state:playbackState,name:String(name||'').slice(0,100),mediaId:String(mediaId||'').slice(0,320),ts:Date.now()}));
   return true;
  }
  function deny(){
   if(state.pending)void send(state.channel,'pair-denied',{target:state.pending.sender});
   state.pending=null;onRequest(null);onStatus('Đã từ chối ghép đôi. TV đang chờ kết nối mới.');
  }
  async function close(){
   state.closed=true;state.connected=false;state.pending=null;
   await Promise.all([unsubscribe(state.client,state.channel),unsubscribe(state.client,state.session)]);
   state.channel=null;state.session=null;state.key=null;state.controllerId=null;
  }
  return {get code(){return state.code;},get ready(){return state.ready;},get connected(){return state.connected;},start,approve,deny,close,reportPlayback};
 }
 function createController({onStatus=()=>{},onConnected=()=>{},onDisconnected=()=>{},onPlayback=()=>{}}={}){
  const state={client:null,room:null,session:null,key:null,pair:null,peer:null,connected:false,closed:false,seq:0,seen:new Set(),pin:'',timeout:null,pendingAcks:new Map()};
  async function connect(rawCode){
   const code=String(rawCode||'').replace(/\D/g,'');
   if(!/^\d{6}$/.test(code))throw Error('Nhập đúng 6 số hiển thị trên TV.');
   if(state.room||state.session)await disconnect(false);
   state.closed=false;state.connected=false;state.pin=code;state.client=await getClient();
   state.pair=await newKeys();state.peer=id();
   const room=state.client.channel(PREFIX+'pin-'+code,{config:{broadcast:{ack:true,self:false}}});
   state.room=room;
   listen(room,'pair-denied',message=>{
    if(message?.target===state.peer)onStatus('TV đã từ chối yêu cầu ghép đôi.');
   });
   listen(room,'pair-approved',async message=>{
    if(state.closed||state.session||message?.target!==state.peer||
       !/^[a-f0-9]{32}$/.test(String(message.topic||'')))return;
    try{
     state.key=await derive(state.pair,message.pub);
     const session=state.client.channel(PREFIX+'session-'+message.topic,{config:{broadcast:{ack:true,self:false}}});
     state.session=session;
     listen(session,'sealed',async payload=>{
      let msg;try{msg=await unseal(state.key,payload);}catch{return;}
      if(msg?.kind==='ready'&&msg.sender==='tv'){
       state.connected=true;clearTimeout(state.timeout);
       await unsubscribe(state.client,state.room);state.room=null;
       onConnected();onStatus('Ghép đôi TV thành công. Lệnh phát được mã hóa.');
      }else if(msg?.kind==='command-ack'&&msg.sender==='tv'&&state.connected){
       const pending=state.pendingAcks.get(String(msg.commandId||''));
       if(pending){
        state.pendingAcks.delete(msg.commandId);clearTimeout(pending.timer);
        if(msg.accepted)pending.resolve(true);
        else pending.reject(Error('TV từ chối lệnh '+String(msg.action||'')));
       }
      }else if(msg?.kind==='playback'&&msg.sender==='tv'&&state.connected&&
               ['playing','paused','error','stopped'].includes(msg.state)){
       onPlayback({state:msg.state,name:String(msg.name||'').slice(0,100),mediaId:String(msg.mediaId||'').slice(0,320)});
      }
     });
     await joined(session);
     await transmit('hello',{},true);
     onStatus('Đã được TV chấp thuận. Đang xác thực kết nối…');
    }catch(error){onStatus('Không thể hoàn tất ghép đôi: '+String(error.message||error));}
   });
   await joined(room);
   await send(room,'pair-request',{sender:state.peer,pub:await pub(state.pair),label:String(root.navigator?.platform||'Trình duyệt').slice(0,50)});
   onStatus('Đã gửi mã ghép đôi. TV sẽ tự kết nối nếu mã hợp lệ và còn hiệu lực.');
   state.timeout=setTimeout(()=>{if(!state.connected&&!state.closed){onStatus('Chưa kết nối được TV. Kiểm tra mã và nhấn thử lại.');void disconnect(false);}},60000);
  }
  async function transmit(kind,fields={},allowHandshake=false){
   if(!state.session||!state.key||(!state.connected&&!allowHandshake))throw Error('Chưa ghép đôi với TV.');
   const data={kind,sender:state.peer,seq:++state.seq,ts:Date.now(),...fields};
   const result=await send(state.session,'sealed',await seal(state.key,data));
   if(result==='error')throw Error('TV chưa nhận được lệnh. Kiểm tra kết nối.');
  }
  async function command(action,{url='',name='',mediaId='',volume=null,muted=false}={}){
   if(!['play','pause','resume','stop','volume'].includes(action))throw Error('Lệnh không hợp lệ.');
   if(action==='play'){
    url=validateUrl(url);
    if(!url)throw Error('Luồng phải là HTTP/HTTPS truy cập được từ TV; URL nội bộ/blob không hỗ trợ.');
   }
   if(action==='volume'&&(!Number.isFinite(volume)||volume<0||volume>1))throw Error('Âm lượng phải nằm trong khoảng 0–1.');
   const commandId=id();
   let timer;
   let settle;
   const acknowledged=new Promise((resolve,reject)=>{
    settle={resolve,reject};
    timer=setTimeout(()=>{
     state.pendingAcks.delete(commandId);
     reject(Error('TV không phản hồi lệnh '+action+' trong 8 giây. Kiểm tra trình duyệt TV và mạng.'));
    },8000);
   });
   state.pendingAcks.set(commandId,{...settle,timer});
   try{
    await transmit('command',{action,url,name:String(name||'').slice(0,100),mediaId:String(mediaId||'').slice(0,320),
     volume:action==='volume'?volume:null,muted:action==='volume'?!!muted:false,commandId});
   }catch(error){
    clearTimeout(timer);state.pendingAcks.delete(commandId);
    // Attach a rejection handler to the ACK promise created above.
    void acknowledged.catch(()=>{});
    throw error;
   }
   return acknowledged;
  }
  async function disconnect(notify=true){
   clearTimeout(state.timeout);
   if(notify&&state.connected)try{await transmit('command',{action:'disconnect'});}catch{}
   state.closed=true;state.connected=false;
   for(const pending of state.pendingAcks.values()){clearTimeout(pending.timer);pending.reject(Error('TV đã ngắt kết nối.'));}
   state.pendingAcks.clear();
   await Promise.all([unsubscribe(state.client,state.room),unsubscribe(state.client,state.session)]);
   state.room=null;state.session=null;state.key=null;state.pair=null;state.peer=null;
   onDisconnected();
  }
  return {get connected(){return state.connected;},get waiting(){return !!state.room&&!state.connected;},connect,command,disconnect};
 }
 root.OpenIPTVTVPair=Object.freeze({createReceiver,createController,validateUrl});
})(typeof window==='undefined'?null:window);

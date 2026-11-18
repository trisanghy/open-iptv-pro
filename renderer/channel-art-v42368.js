'use strict';
/* One artwork resolver for TV lists and every alternative TV layout.
   Never infer art from a visible row: channel folders may be collapsed.
   Images are display-only and do not cause IPTV network playback. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVChannelArt=api;
})(typeof window!=='undefined'?window:null,function(){
 const validImage=value=>typeof value==='string'&&
  /^(?:https?:\/\/|data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml)[;,]|blob:|file:\/\/)/i.test(value.trim());
 const normalized=value=>typeof value==='string'?value.trim():'';
 function initials(channel){
  const name=String(channel?.name||'').trim().replace(/\s+/g,' ');
  if(!name)return 'TV';
  const first=name.split(' ')[0];
  if(/^[A-Z]{2,5}[- ]?\d{0,2}$/i.test(first))return first.slice(0,5).toUpperCase();
  return Array.from(name).filter(x=>x.trim()).slice(0,3).join('').toUpperCase()||'TV';
 }
 function candidates({channel,snapshots={},snapshotBase=''}={}){
  const shot=snapshots&&channel?.url?snapshots[channel.url]:null,items=[];
  const push=(src,kind)=>{
   const value=normalized(src);
   if(validImage(value)&&!items.some(item=>item.src===value))items.push({src:value,kind});
  };
  if(shot?.file&&snapshotBase){
   const base=String(snapshotBase);
   push(base+encodeURIComponent(shot.file),'snapshot');
  }
  push(shot?.data,'snapshot');
  push(channel?.logo,'logo');
  return items;
 }
 function mount(container,{channel,snapshots={},snapshotBase='',eager=false,doc}={}){
  if(!container)return null;
  const d=doc||container.ownerDocument;
  const sources=candidates({channel,snapshots,snapshotBase});
  let img=null;
  const fallback=()=> {
   const span=d.createElement('span');
   span.className='iptv-art-placeholder';
   span.textContent=initials(channel);
   span.setAttribute?.('aria-hidden','true');
   // Preserve health badge/sibling controls when an image fails late.
   if(img?.parentElement===container)img.replaceWith(span);
   else container.replaceChildren(span);
   container.classList?.remove?.('snapshot-thumb');
   container.classList?.add?.('art-placeholder');
   return span;
  };
  if(!sources.length)return fallback();
  img=d.createElement('img');
  img.alt='';img.decoding='async';img.loading=eager?'eager':'lazy';
  img.referrerPolicy='no-referrer';
  let next=0;
  const tryNext=()=>{
   if(next>=sources.length){fallback();return;}
   const entry=sources[next++];
   container.classList?.toggle?.('snapshot-thumb',entry.kind==='snapshot');
   container.classList?.remove?.('art-placeholder');
   img.src=entry.src;
  };
  img.addEventListener('error',tryNext);
  container.replaceChildren(img);
  tryNext();
  return img;
 }
 return Object.freeze({validImage,initials,candidates,mount});
});

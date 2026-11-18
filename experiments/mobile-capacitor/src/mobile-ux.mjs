// Minimal pure helpers for phone navigation and restored session.
export const UX_VERSION='mobile.4';
export function swipeChannelDelta(dx,dy,elapsedMs=0,threshold=65){
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(elapsedMs))return 0;
  if(elapsedMs>850||Math.abs(dx)<threshold||Math.abs(dx)<=Math.abs(dy)*1.3)return 0;
  return dx<0?1:-1; // swipe left => next channel
}
export function nextChannelIndex(channels,selectedUrl,delta){
  if(!Array.isArray(channels)||!channels.length)return -1;
  const index=channels.findIndex(c=>c?.url===selectedUrl);
  if(index<0)return delta<0?channels.length-1:0;
  return (index+Math.sign(delta)+channels.length)%channels.length;
}
export function safeHistory(items,url,maxItems=30){
  if(typeof url!=='string'||!/^https?:\/\//i.test(url))return Array.isArray(items)?items.slice(0,maxItems):[];
  return [url,...(Array.isArray(items)?items:[]).filter(x=>x!==url)].slice(0,maxItems);
}

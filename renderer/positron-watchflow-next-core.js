'use strict';
/* Positron WatchFlow Plus — pure, offline suggestion engine.
 * Never tests a stream, imports a source, mutates a playlist or autoplays.
 */
(function(root,factory){
  const api=factory(root&&root.PositronWatchFlowCore);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PositronWatchFlowPlusCore=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(base){
  const normalize=base?.normalize||((s)=>String(s||'').toLowerCase().trim());
  const category=base?.category||(()=> 'other');
  const playable=c=>!!(c&&c.id&&String(c.name||'').trim()&&typeof c.url==='string'&&c.url.trim()&&c.status!=='dead');
  const safe=(channels)=>Array.isArray(channels)?channels.filter(playable):[];
  const stamp=c=>{const n=Date.parse(c?.lastPlaybackAt||'');return Number.isFinite(n)?n:0;};
  const score=c=>((c.status==='alive'?300:c.status==='uncertain'?120:140)
    +(stamp(c)?Math.min(50,Math.max(0,50-(Date.now()-stamp(c))/86400000)):0));
  const hash=s=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;};
  const unique=items=>{const used=new Set();return items.filter(c=>{const id=String(c.id);if(used.has(id))return false;used.add(id);return true;});};
  const byEvidence=items=>items.slice().sort((a,b)=>score(b)-score(a)||String(a.name).localeCompare(String(b.name),'vi'));
  function continueWatching(channels,recent=[],limit=5){
    const available=new Map(safe(channels).map(c=>[String(c.id),c]));
    const played=unique((Array.isArray(recent)?recent:[]).map(c=>available.get(String(c?.id))).filter(Boolean));
    // Only the native recent-history service adds an entry after a decoded frame.
    return played.slice(0,Math.max(1,Math.min(8,limit)));
  }
  function similar(channels,current,{limit=5}={}){
    if(!current?.id)return [];
    const group=normalize(current.group||current.groupTitle||'');
    const kind=category(current);
    const pool=safe(channels).filter(c=>String(c.id)!==String(current.id));
    return byEvidence(pool.filter(c=>{
      const sameGroup=!!group&&normalize(c.group||c.groupTitle||'')===group;
      return sameGroup||(kind!=='other'&&category(c)===kind);
    }).sort((a,b)=>{
      const sameA=group&&normalize(a.group||a.groupTitle||'')===group;
      const sameB=group&&normalize(b.group||b.groupTitle||'')===group;
      return Number(sameB)-Number(sameA);
    })).slice(0,Math.max(1,Math.min(8,limit)));
  }
  function dailyMix(channels,{limit=5,date=new Date().toISOString().slice(0,10),seen=[]}={}){
    const excluded=new Set((Array.isArray(seen)?seen:[]).map(String));
    let pool=safe(channels).filter(c=>!excluded.has(String(c.id)));
    if(!pool.length)pool=safe(channels);
    const categories=['news','sport','cinema','music','kids','other'];
    const entries=[],used=new Set(),usedGroups=new Set();
    const rotation=hash(date)%categories.length;
    const ordered=categories.slice(rotation).concat(categories.slice(0,rotation));
    for(const kind of ordered){
      const candidates=byEvidence(pool.filter(c=>category(c)===kind));
      if(!candidates.length)continue;
      const tier=candidates.filter(c=>score(c)>=score(candidates[0])-15);
      const pick=tier[hash(date+'|'+kind)%tier.length];
      if(!used.has(String(pick.id))){entries.push(pick);used.add(String(pick.id));usedGroups.add(normalize(pick.group||pick.groupTitle));}
      if(entries.length>=limit)return entries;
    }
    for(const ch of byEvidence(pool)){
      const group=normalize(ch.group||ch.groupTitle);
      if(used.has(String(ch.id))||usedGroups.has(group))continue;
      entries.push(ch);used.add(String(ch.id));usedGroups.add(group);
      if(entries.length>=limit)return entries;
    }
    for(const ch of byEvidence(pool)){
      if(used.has(String(ch.id)))continue;
      entries.push(ch);used.add(String(ch.id));
      if(entries.length>=limit)break;
    }
    return entries;
  }
  function smartZap(channels,{currentId='',seen=[],preferredCategory='all'}={}){
    const omit=new Set((Array.isArray(seen)?seen:[]).map(String));omit.add(String(currentId));
    const valid=safe(channels).filter(c=>String(c.id)!==String(currentId));
    if(!valid.length)return null;
    let candidates=valid.filter(c=>!omit.has(String(c.id)));
    if(!candidates.length)candidates=valid;
    const focused=preferredCategory!=='all'?candidates.filter(c=>category(c)===preferredCategory):[];
    if(focused.length)candidates=focused;
    // Health is more important than novelty; never skip a proven channel just
    // to suggest one already classified dead.
    return dailyMix(candidates,{limit:1,date:new Date().toISOString().slice(0,10)})[0]||null;
  }
  return Object.freeze({continueWatching,similar,dailyMix,smartZap,playable});
});
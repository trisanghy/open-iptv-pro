import test from 'node:test';
import assert from 'node:assert/strict';
import {oldStyleLayout} from '../src/legacy-mobile-layout.mjs';

test('classic layout has visible player and large controls like v4.23 mobile',()=>{
 const html=oldStyleLayout('/assets/icon.png');
 for(const id of ['heroTitle','heroSubtitle','nowTitle','nowGroup','playCurrent','previousChannel','nextChannel','nowFavorite','channelList','quickFavorite','expandFolders','collapseFolders','webVideo']){
   assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/<nav class="bottom-navigation"/);
 assert.match(html,/Chưa chọn kênh/);
 assert.match(html,/Xem TV/);
 assert.match(html,/4 kênh/);
 assert.match(html,/class="brand-logo"/);
});
test('all mounted document IDs unique in restored layout',()=>{
 const html=oldStyleLayout('/assets/icon.png'),ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,'duplicate IDs in mobile layout');
 assert.ok(ids.length>20);
});
test('keeps all original Mobile M3U / EPG / tools and parity mount identifiers',()=>{
 const html=oldStyleLayout('/assets/icon.png');
 for(const id of ['addURL','file','refresh','sources','sourceCount','favCount','favoritesList','epgURL','epgChannel','loadEPG','epgResults','threadCount','checkBtn','exportBtn','fallbackSource','fallbackURL','saveFallback','snapshot','startMulti','stopMulti','multiGrid','closePlayer','status']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
});

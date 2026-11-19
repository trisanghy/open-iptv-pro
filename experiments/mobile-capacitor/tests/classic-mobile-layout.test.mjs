import test from 'node:test';
import assert from 'node:assert/strict';
import {oldStyleLayout} from '../src/legacy-mobile-layout.mjs';

test('classic layout has visible player and large controls like v4.23 mobile',()=>{
 const html=oldStyleLayout('/assets/icon.png');
 for(const id of ['heroTitle','heroSubtitle','nowTitle','nowGroup','playCurrent','stopCurrent','muteCurrent','previousChannel','nextChannel','nowFavorite','manualStreamSelect','videoFit','epgNowName','epgNextName','openGuideBtn','moreTrigger','moreOverlay','recentChannelsSection','recentChannelList','recentCount','clearRecent','channelList','quickFavorite','expandFolders','collapseFolders','webVideo']){
   assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/<nav class="bottom-navigation"/);
 assert.match(html,/Chưa chọn kênh/);
 assert.match(html,/data-page="tv"/);
 assert.match(html,/4 kênh/);
 assert.doesNotMatch(html,/mobile-topbar|brand-logo|settingsBtn/);
 assert.match(html,/id="moreTrigger"/);
 assert.match(html,/data-more="doctor"/);
 assert.match(html,/data-more="health"/);
});
test('all mounted document IDs unique in restored layout',()=>{
 const html=oldStyleLayout('/assets/icon.png'),ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,'duplicate IDs in mobile layout');
 assert.ok(ids.length>20);
});
test('keeps all original Mobile M3U / EPG / tools and parity mount identifiers',()=>{
 const html=oldStyleLayout('/assets/icon.png');
 for(const id of ['addURL','file','refresh','sources','sourceCount','favCount','favoritesList','epgURL','epgChannel','loadEPG','epgResults','threadCount','checkBtn','exportBtn','fallbackSource','fallbackURL','saveFallback','snapshot','startMulti','stopMulti','multiGrid','webVideo','status']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
});


test('Web parity navigation has exactly five bottom actions and More sheet with all tool entries',()=>{
 const html=oldStyleLayout('/ignored.png');
 const nav=html.match(/<nav class="bottom-navigation"[\s\S]*?<\/nav>/)?.[0]||'';
 const buttons=[...nav.matchAll(/<button/g)];
 assert.equal(buttons.length,5);
 for(const label of ['TV','Yêu thích','Lịch','Nguồn','Thêm'])assert.match(nav,new RegExp(label));
 for(const key of ['multiview','snapshot','folders','health','doctor','backup','file','url','export','settings','fallback','terms'])
   assert.match(html,new RegExp('data-more="'+key+'"'));
});
test('Web media controls and EPG/fallback picker retain distinct IDs',()=>{
 const html=oldStyleLayout();
 for(const id of ['playCurrent','stopCurrent','muteCurrent','castCurrent','pictureInPicture','fullScreenCurrent','epgNowName','epgNowTime','epgNextName','epgNextTime','openGuideBtn','videoFit','manualStreamSelect'])
   assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/value="contain">Vừa khung/);
 assert.match(html,/Link phát/);
});

test('inline video exists within the 16:9 hero, never in a fullscreen overlay',()=>{
 const html=oldStyleLayout();
 const hero=html.match(/<div class="hero-player"[\s\S]*?<\/video>/)?.[0]||'';
 assert.match(hero,/<video[^>]+id="webVideo"[^>]+playsinline[^>]+webkit-playsinline/);
 assert.doesNotMatch(html,/id="webPlayer"|id="closePlayer"/);
 assert.equal([...html.matchAll(/id="webVideo"/g)].length,1);
});


test('recently watched section is above standard folders and includes clear control',()=>{
 const html=oldStyleLayout();
 assert.match(html,/<section class="recent-channels" id="recentChannelsSection"/);
 assert.match(html,/Kênh vừa xem/);
 assert.match(html,/id="clearRecent"/);
 assert.ok(html.indexOf('id="recentChannelsSection"')<html.indexOf('id="channelList"'));
});

test('Web mobile output controls are speaker, Cast/AirPlay, PiP and fullscreen only',()=>{
 const html=oldStyleLayout();const block=html.match(/<div class="playback-actions output-controls"[\s\S]*?<\/div>/)?.[0]||'';
 for(const id of ['muteCurrent','castCurrent','pictureInPicture','fullScreenCurrent'])assert.match(block,new RegExp('id="'+id+'"'));
 assert.equal((block.match(/<button/g)||[]).length,4);
 assert.doesNotMatch(block,/snapshotCurrent/);
 assert.match(html,/data-more="snapshot"/);
});

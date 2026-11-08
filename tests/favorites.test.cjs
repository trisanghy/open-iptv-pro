'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fav=require('../renderer/favorites-core.js');
const channel=(name,url,sourceId,status='unchecked')=>({name,url,sourceId,status});
test('Legacy URL stars migrate into stable channel favorites',()=>{
 const s={sources:[{id:'a',enabled:true}],channels:[channel('VTV1 HD','https://a.tv/1','a')],favorites:['https://a.tv/1']};
 fav.migrate(s);assert.equal(s.favoriteKeys[0],'name:vtv1');assert.equal(fav.visible(s).length,1);
});
test('One favorite for duplicated channels across multiple playlists and best live stream',()=>{
 const s={sources:[{id:'a'},{id:'b'}],channels:[channel('VTV1','https://a.tv/1','a','dead'),channel('VTV1 HD','https://b.tv/1','b','alive')],favorites:[],favoriteKeys:['name:vtv1']};
 fav.sync(s);assert.equal(fav.visible(s).length,1);assert.equal(fav.visible(s)[0].sourceId,'b');assert.equal(s.favorites.length,2);
});
test('Source delete, disable, re-add and URL refresh dynamically sync favorite list',()=>{
 const s={sources:[{id:'a',enabled:true},{id:'b',enabled:true}],channels:[channel('VTV1','https://a/1','a'),channel('VTV1 HD','https://b/1','b')],favorites:['https://a/1']};
 fav.migrate(s);fav.sync(s);assert.equal(fav.visible(s).length,1);
 s.sources=s.sources.filter(x=>x.id!=='a');s.channels=s.channels.filter(x=>x.sourceId!=='a');fav.sync(s);
 assert.equal(fav.visible(s).length,1);assert.deepEqual(s.favorites,['https://b/1']);
 s.channels[0]={...s.channels[0],url:'https://b/NEW'};fav.sync(s);assert.deepEqual(s.favorites,['https://b/NEW']);
 s.sources[0].enabled=false;fav.sync(s);assert.equal(fav.visible(s).length,0);assert.deepEqual(s.favorites,[]);
 s.sources.push({id:'c',enabled:true});s.channels.push(channel('VTV1 FHD','https://c/1','c'));fav.sync(s);assert.equal(fav.visible(s).length,1);assert.deepEqual(s.favorites,['https://c/1']);
});
test('Unstar removes all duplicates in all sources',()=>{
 const s={sources:[{id:'a'},{id:'b'}],channels:[channel('VTV2','https://a/2','a'),channel('VTV2 HD','https://b/2','b')],favorites:[]};
 fav.toggle(s,s.channels[0]);assert.equal(s.favorites.length,2);
 fav.toggle(s,s.channels[1]);assert.equal(fav.visible(s).length,0);assert.equal(s.favorites.length,0);
});

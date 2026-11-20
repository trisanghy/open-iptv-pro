'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const hub=require('../web-tv-channel-hub.js');
const channel={id:'vtv1',name:'VTV1',group:'VTV',logo:'https://example.invalid/vtv1.png',url:'https://example.invalid/vtv1.m3u8'};
const state={favoriteKeys:['tvg:vtv1'],favorites:[],recentChannelIds:['vtv1'],current:'vtv1',health:{}};
const options=['channels','all','','source','grid','',false];
const signature=(channels=[channel],store=state,controls=options,language='vi')=>hub.renderSignature(channels,store,controls,language);
test('playback status and frequent local saves do not recreate channel tiles',()=>{
 const original=signature();
 assert.equal(original,signature([{...channel,status:'alive',checkedAt:'2026-11-20',lastStartupDurationMs:220}],{...state,current:'vtv2',health:{vtv1:[{type:'live'}]}}));
 assert.equal(original,signature());
});
test('channel, favorite, recents and filter edits invalidate only relevant views',()=>{
 const base=signature();
 assert.notEqual(base,signature([{...channel,logo:'https://example.invalid/new.png'}]));
 assert.notEqual(base,signature([{...channel,name:'VTV1 HD'}]));
 assert.notEqual(base,signature([{...channel,url:'https://example.invalid/alternative.m3u8'}]));
 assert.notEqual(base,signature([channel],{...state,favoriteKeys:[]}));
 assert.notEqual(base,signature([channel],{...state,recentChannelIds:['vtv2','vtv1']}));
 assert.notEqual(base,signature([channel],state,['recent','all','','source','grid','',false]));
 assert.notEqual(base,signature([channel],state,options,'en'));
});
test('channel selection remains bounded while expanded view can show all',()=>{
 const many=Array.from({length:300},(_,i)=>({...channel,id:'ch'+i}));
 assert.equal(hub.visible(many).length,hub.LIMIT);
 assert.equal(hub.visible(many,true).length,300);
});

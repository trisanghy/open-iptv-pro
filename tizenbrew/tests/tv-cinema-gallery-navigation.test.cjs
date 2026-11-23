'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function between(from,to){
 const a=html.indexOf(from),b=html.indexOf(to,a+from.length);
 assert.ok(a>=0&&b>a,'missing '+from);return html.slice(a,b);
}
const cinema=between('/* CINEMA TV 2.0','/* CINEMA CHANNEL BROWSER');
const selector=between('function nearestHomeTile(buttons,current,key){','function moveHome(key){');
function card(name,col,row){
 return {dataset:{channelId:name},getBoundingClientRect(){return {
  left:col*300,top:row*190,width:280,height:170
 };}};
}
const cards=[card('a',0,0),card('b',1,0),card('c',2,0),
 card('d',0,1),card('e',1,1),card('f',2,1)];
const nearest=vm.runInNewContext(selector+'\nnearestHomeTile;', {});
test('Homepage is an immersive hero with horizontal poster cards, not a three-column admin panel',()=>{
 assert.match(html,/class="main cinema-home"/);
 assert.match(html,/class="hero-eyebrow"/);
 assert.match(html,/class="hero-label"/);
 assert.match(html,/class="library-eyebrow"/);
 assert.match(html,/id="previewStage"/);
 assert.match(cinema,/#app \.main\.cinema-home\{[\s\S]*grid-template-columns:minmax\(210px,17fr\)/);
 assert.match(cinema,/#app \.main \.details\{grid-column:2;grid-row:1/);
 assert.match(cinema,/#app \.main \.listpane\{grid-column:2;grid-row:2/);
 assert.match(cinema,/#app \.channels\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(cinema,/#app \.channel\{position:relative;display:grid;/);
 assert.match(cinema,/#app \.channel:focus,#app \.channel:focus-visible/);
 assert.match(cinema,/@media\(max-width:1600px\)/);
 assert.match(cinema,/@media\(max-width:1000px\),\(max-height:620px\)/);
});
test('Remote Right/Left navigates within a poster row before leaving the gallery',()=>{
 assert.equal(nearest(cards,cards[0],'ArrowRight'),cards[1]);
 assert.equal(nearest(cards,cards[1],'ArrowRight'),cards[2]);
 assert.equal(nearest(cards,cards[2],'ArrowLeft'),cards[1]);
 assert.equal(nearest(cards,cards[0],'ArrowLeft'),null);
});
test('Remote Up/Down follows poster columns rather than moving sideways',()=>{
 assert.equal(nearest(cards,cards[0],'ArrowDown'),cards[3]);
 assert.equal(nearest(cards,cards[1],'ArrowDown'),cards[4]);
 assert.equal(nearest(cards,cards[4],'ArrowUp'),cards[1]);
 assert.equal(nearest(cards,cards[5],'ArrowDown'),null);
});
test('No measurable card geometry safely falls back to old directional navigation',()=>{
 assert.equal(nearest(cards,{dataset:{channelId:'other'}},'ArrowDown'),null);
 assert.match(html,/if\(spatial\)target=spatial/);
 assert.match(html,/if\(up\)target=list\[index-1\]\|\|selectedGroup\|\|toolbar\[0\]/);
});
test('Streaming controls stay unchanged while the fullscreen picker uses a cinema overlay',()=>{
 const picker=between('/* CINEMA CHANNEL BROWSER','.playerdiag{position:absolute;');
 assert.match(picker,/#channelPicker \.picker-panel\{[^}]*width:min\(1260px,77vw\)/);
 assert.match(picker,/grid-auto-flow:column;grid-template-rows:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(picker,/#channelPicker \.picker-row\.active,#channelPicker \.picker-row:focus/);
 assert.match(html,/pickerPlayTimer=setTimeout\(commitPickerPlay,200\)/);
 assert.match(html,/pickerHideTimer=setTimeout\(function\(\)\{pickerHideTimer=null;/);
 assert.match(html,/function startRelayHlsPlayback\(channel,token\)/);
 assert.match(html,/function stopHomePreview\(\)/);
});

(function(){
'use strict';
if(location.origin!=='https://trisanghy.github.io'||location.pathname.indexOf('/open-iptv-pro/')!==0||window.__oiptvWebRemote)return;
window.__oiptvWebRemote=true;
var selector='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[role="button"],[tabindex],#channelList .channel-item,#channelList .folder-header';
function visible(el){
 if(!el||el.disabled||el.closest('[hidden],[inert],[aria-hidden="true"]')||el.getAttribute('tabindex')==='-1')return false;
 var r=el.getBoundingClientRect(),s=getComputedStyle(el);
 return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';
}
function focusables(){
 var dialogs=document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]');
 var root=document;
 for(var i=dialogs.length-1;i>=0;i--)if(visible(dialogs[i])){root=dialogs[i];break;}
 return Array.prototype.filter.call(root.querySelectorAll(selector),visible);
}
function focus(el){
 if(!el)return false;
 if(el.tabIndex<0)el.tabIndex=0;
 try{el.focus({preventScroll:true});}catch(e){el.focus();}
 try{el.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){el.scrollIntoView(false);}
 return true;
}
function center(el){var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
function next(current,items,key){
 if(!current||items.indexOf(current)<0)return items[0];
 var c=center(current),horizontal=key==='ArrowLeft'||key==='ArrowRight',sign=key==='ArrowLeft'||key==='ArrowUp'?-1:1,best=null,score=Infinity;
 items.forEach(function(el){if(el===current)return;var p=center(el),dx=p.x-c.x,dy=p.y-c.y,forward=(horizontal?dx:dy)*sign,cross=Math.abs(horizontal?dy:dx);
 if(forward<=2)return;var value=forward+cross*3+cross*cross/Math.max(forward,1);
 if(value<score){score=value;best=el;}});
 return best;
}
function click(id){var el=document.getElementById(id);if(!visible(el))return false;el.click();return true;}
function fullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement);}
function consume(e){e.preventDefault();e.stopImmediatePropagation();}
function keyHandler(e){
 if(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey)return;
 var key=e.key||'',code=e.keyCode||0,arrows={37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown'};
 key=arrows[code]||key;
 var el=document.activeElement,typing=el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
 if(typing)return;
 if(code===427||key==='ChannelUp'){if(click(fullscreen()?'fsNext':'nextBtn'))consume(e);return;}
 if(code===428||key==='ChannelDown'){if(click(fullscreen()?'fsPrev':'prevBtn'))consume(e);return;}
 if(code===10252||key==='MediaPlayPause'){if(click(fullscreen()?'fsPlay':'playBtn'))consume(e);return;}
 if(code===415||key==='MediaPlay'||code===19||key==='MediaPause'){
  var v=document.getElementById('video');if(v&&((code===415||key==='MediaPlay')?v.paused:!v.paused)&&click(fullscreen()?'fsPlay':'playBtn'))consume(e);return;
 }
 if(code===413||key==='MediaStop'){if(click('stopBtn'))consume(e);return;}
 if((code===10009||key==='Back')&&fullscreen()){if(click('fsExit'))consume(e);return;}
 if(/^Arrow(Left|Right|Up|Down)$/.test(key)){
  var target=next(el,focusables(),key);if(focus(target))consume(e);return;
 }
 if((key==='Enter'||key==='OK'||code===13)&&el&&visible(el)&&!e.repeat){
  // Native controls and web channel rows already implement Enter. Only
  // synthesize an Enter for remote OK events that are not browser Enter.
  if(key==='OK'){el.click();consume(e);}
 }
}
document.addEventListener('keydown',keyHandler,true);
function init(){
 var css=document.createElement('style');css.textContent=':focus-visible{outline:3px solid #6aaeff!important;outline-offset:3px!important}';
 (document.head||document.documentElement).appendChild(css);
 if(document.activeElement===document.body){var items=focusables();if(items.length)focus(items[0]);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

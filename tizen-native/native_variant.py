"""Native-only TV UI adaptation. The working TizenBrew module is never edited."""

def adapt_native(tv: str, version: str) -> str:
    def patch(old, new):
        nonlocal tv
        if tv.count(old) != 1:
            raise ValueError("Native variant anchor changed: " + old[:100])
        tv = tv.replace(old, new, 1)

    patch("TizenBrew v" + version, "Native WGT v" + version)
    patch("function updateBottomActions(){byId('exitModuleBtn').title='Thoát về TizenBrew';}",
          "function updateBottomActions(){byId('exitModuleBtn').title='Thoát ứng dụng Samsung TV';}")
    patch("var playbackSerial=0,", "var nativeAvplayTried=false;\nvar playbackSerial=0,")
    patch("function startPlaybackStream(channel,token){\n playbackStream=channel;",
          "function startPlaybackStream(channel,token){\n nativeAvplayTried=false;\n playbackStream=channel;")
    patch("if(verified&&launchPlaybackRoute(channel,token,verified)){",
          "if(verified&&verified!=='relay'&&launchPlaybackRoute(channel,token,verified)){")
    patch(" // On unseen or failed sources, probe the bundled format decoder as before.",
          """ // Native TV: prefer firmware AVPlay for new streams, keep proven local decoders.
 if(!nativeAvplayTried&&nativeAvplay()&&startAvplay(channel,token)){
  logPlayback('Native WGT: ưu tiên Samsung AVPlay');
  return;
 }
 // On unseen or failed sources, probe the bundled format decoder as before.""")
    patch(" var hint=!nativeAvplay()&&relayFastStartHint(channel);",
          " var hint=''; // Native application has no TizenBrew relay service.")
    patch(" if(!startAvplay(channel,token)){\n  if(nativeAvplay())logPlayback('AVPlay khởi động thất bại');",
          " if(nativeAvplayTried||!startAvplay(channel,token)){\n  if(nativeAvplay())logPlayback('AVPlay không khả dụng cho lượt phát này');")
    patch("function startAvplay(channel,token){\n var api=nativeAvplay();\n if(!api)return false;",
          "function startAvplay(channel,token){\n var api=nativeAvplay();\n if(!api)return false;\n nativeAvplayTried=true;")
    patch("if(!startAvplay(failedChannel,token))startHtml5Playback(failedChannel,token);",
          "if(nativeAvplayTried||!startAvplay(failedChannel,token))startHtml5Playback(failedChannel,token);")
    patch(" setPlayerStatus('AVPlay không mở được ('+String(message||'lỗi luồng').slice(0,85)+'). Đang thử bộ phát dự phòng…');\n startHtml5Playback(channel,token);",
          """ setPlayerStatus('AVPlay không mở được ('+String(message||'lỗi luồng').slice(0,85)+'). Đang thử bộ phát dự phòng…');
 var route=TV_PLAYBACK_CORE.preferredRoute(channel.url);
 if(route==='hlsjs'&&!hlsAttempted&&launchPlaybackRoute(channel,token,route))return;
 if(route==='dashjs'&&!dashAttempted&&launchPlaybackRoute(channel,token,route))return;
 if(route==='mpegts'&&!mpegtsAttempted&&launchPlaybackRoute(channel,token,route))return;
 startHtml5Playback(channel,token);""")
    patch("function tizenModuleContext(){\n if(typeof location==='undefined')return true;",
          "function tizenModuleContext(){\n if(typeof location==='undefined')return false;")
    patch(" if(hlsRelayAttempted||!playbackActive(token)||playbackEngine!=='html5'||",
          " if(!tizenModuleContext()||hlsRelayAttempted||!playbackActive(token)||playbackEngine!=='html5'||")
    patch("logPlayback('AVPlay: '+(nativeAvplay()?'có API':'không có API'));",
          "logPlayback('Native WGT: AVPlay '+(nativeAvplay()?'có API':'không khả dụng trên thiết bị này'));")
    patch("AVPlay không có trong module TizenBrew/trình duyệt.",
          "AVPlay không khả dụng trong ứng dụng native trên thiết bị này.")
    patch("applyTvTheme(state.theme);draw();updateBottomActions();refreshTizenBrewModules();ensureTizenHlsRelayService();",
          """function registerNativeRemote(){
 try{
  if(typeof tizen==='undefined'||!tizen.tvinputdevice)return;
  var input=tizen.tvinputdevice;
  ['ChannelUp','ChannelDown','MediaPlay','MediaPause','MediaPlayPause','MediaStop','ColorF0Red','ColorF1Green'].forEach(function(key){
   try{input.registerKey(key);}catch(e){}
  });
 }catch(e){}
}
applyTvTheme(state.theme);draw();updateBottomActions();registerNativeRemote();""")
    return tv

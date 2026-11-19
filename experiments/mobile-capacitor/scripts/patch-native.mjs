// Native project patches are applied after Capacitor add/sync, before compilation.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const project=process.cwd();
if(fs.existsSync(path.join(project,'android/app/src/main/AndroidManifest.xml'))){
 const file=path.join(project,'android/app/src/main/AndroidManifest.xml');let xml=fs.readFileSync(file,'utf8');
 if(!xml.includes('android.permission.INTERNET'))xml=xml.replace(/<manifest([^>]*)>/,'<manifest$1>\n    <uses-permission android:name="android.permission.INTERNET" />');
 if(!xml.includes('android:usesCleartextTraffic='))xml=xml.replace(/<application\b/,'<application android:usesCleartextTraffic="true"');
 // Capacitor already defines android:launchMode on MainActivity. Repeating it makes the manifest invalid XML.
 if(!xml.includes('android:supportsPictureInPicture='))xml=xml.replace(/<activity\b/,'<activity android:supportsPictureInPicture="true"');
 // Sanity check on the initial activity tag to prevent duplicate attributes in future updates.
 const activityTag=xml.match(/<activity\b[^>]*>/)?.[0]||'';
 for(const attribute of ['android:launchMode','android:supportsPictureInPicture','android:exported']){
   if((activityTag.match(new RegExp(attribute+'=', 'g'))||[]).length>1)throw Error('Duplicate AndroidManifest activity attribute: '+attribute);
 }

 // Preserve one MainActivity during PiP transition; no duplicate AndroidManifest attributes.
 xml=xml.replace(/android:launchMode="[^"]*"/,'android:launchMode="singleTask"');
 const activity=xml.match(/<activity\b[^>]*>/)?.[0]||'';
 if(!activity.includes('android:resizeableActivity='))xml=xml.replace(/<activity\b/,'<activity android:resizeableActivity="true"');
 if(activity.includes('android:configChanges=')){
   xml=xml.replace(/android:configChanges="([^"]*)"/,(m,flags)=>{
     const required=['screenSize','smallestScreenSize','screenLayout','orientation','uiMode'];
     return 'android:configChanges="'+[...new Set([...flags.split('|'),...required])].join('|')+'"';
   });
 }
 fs.writeFileSync(file,xml);
 const pkg=path.join(project,'android/app/src/main/java/com/trisanghy/openiptvpro/mobile');
 fs.mkdirSync(pkg,{recursive:true});
 for(const name of ['MainActivity.java','OpenIPTVAutoPipPlugin.java']){
   const src=path.join(project,'native/android',name);
   if(!fs.existsSync(src))throw Error('Missing Android PiP native source: '+src);
   fs.copyFileSync(src,path.join(pkg,name));
 }
 console.log('Android manifest and native automatic PiP plugin patched');

}
if(fs.existsSync(path.join(project,'ios/App/App/Info.plist'))){
 const plist=path.join(project,'ios/App/App/Info.plist');
 const code=`import plistlib, sys\np=sys.argv[1]\nwith open(p, 'rb') as f: d=plistlib.load(f)\nd['NSAppTransportSecurity']={'NSAllowsArbitraryLoads': True}\nd['NSLocalNetworkUsageDescription']='Open IPTV Pro tim thiet bi phat tren mang noi bo (Chromecast/AirPlay).';d['NSBonjourServices']=['_googlecast._tcp','_CC1AD845._googlecast._tcp'];d['UIBackgroundModes']=list(dict.fromkeys(d.get('UIBackgroundModes',[])+['audio']))\nwith open(p,'wb') as f: plistlib.dump(d,f,sort_keys=False)\n`;const py=spawnSync('python3',['-c',code,plist],{stdio:'inherit'});if(py.status!==0)throw Error('Could not patch iOS Info.plist');console.log('iOS ATS / Bonjour / background audio patched');
 const delegate=path.join(project,'ios/App/App/AppDelegate.swift');
 if(fs.existsSync(delegate)){
   let swift=fs.readFileSync(delegate,'utf8');
   if(!swift.includes('import AVFoundation'))swift=swift.replace('import UIKit','import UIKit\nimport AVFoundation');
   if(!swift.includes('OpenIPTV-AutoPiP AVAudioSession')){
     const match=/(func application\(_ application: UIApplication, didFinishLaunchingWithOptions[\s\S]*?-> Bool \{)/;
     if(!match.test(swift))throw Error('Unable to configure iOS AppDelegate audio session');
     swift=swift.replace(match, m=>m+"\n        // OpenIPTV-AutoPiP AVAudioSession: allow legitimate media background playback.\n        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback, options: [.allowAirPlay])\n        try? AVAudioSession.sharedInstance().setActive(true)");
   }
   if(!swift.includes('OpenIPTVBridgeViewController')){
     if(!swift.includes('import Capacitor'))swift=swift.replace('import UIKit','import UIKit\nimport Capacitor');
     if(!swift.includes('import WebKit'))swift=swift.replace('import UIKit','import UIKit\nimport WebKit');
     // Capacitor v8 supports overriding this before the WKWebView is created.
     // No AVPlayer fullscreen view may be created when the user taps Play.
     swift += `
\n// Inline autoplay and system PiP for the existing HTML5 player.
class OpenIPTVBridgeViewController: CAPBridgeViewController {
    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let configuration = super.webViewConfiguration(for: instanceConfiguration)
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.allowsPictureInPictureMediaPlayback = true
        configuration.allowsAirPlayForMediaPlayback = true
        return configuration
    }
}
`;
   }
   fs.writeFileSync(delegate,swift);
   const storyboard=path.join(project,'ios/App/App/Base.lproj/Main.storyboard');
   if(!fs.existsSync(storyboard))throw Error('Capacitor iOS storyboard not found: cannot wire PiP-enabled controller');
   let xml=fs.readFileSync(storyboard,'utf8');
   const existing='customClass="CAPBridgeViewController" customModule="Capacitor"';
   if(xml.includes(existing)){
     xml=xml.replace(existing,'customClass="OpenIPTVBridgeViewController" customModule="App"');
     fs.writeFileSync(storyboard,xml);
   }else if(!xml.includes('customClass="OpenIPTVBridgeViewController"')){
     throw Error('Unexpected Capacitor storyboard controller: cannot safely enable inline PiP');
   }
   console.log('iOS WKWebView inline autoplay and Picture-in-Picture enabled');
 }

}

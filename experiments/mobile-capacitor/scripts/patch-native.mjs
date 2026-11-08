// Native project patches are applied after Capacitor add/sync, before compilation.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const project=process.cwd();
if(fs.existsSync(path.join(project,'android/app/src/main/AndroidManifest.xml'))){
 const file=path.join(project,'android/app/src/main/AndroidManifest.xml');let xml=fs.readFileSync(file,'utf8');
 if(!xml.includes('android.permission.INTERNET'))xml=xml.replace(/<manifest([^>]*)>/,'<manifest$1>\n    <uses-permission android:name="android.permission.INTERNET" />');
 if(!xml.includes('android:usesCleartextTraffic='))xml=xml.replace(/<application\b/,'<application android:usesCleartextTraffic="true"');
 if(!xml.includes('android:supportsPictureInPicture'))xml=xml.replace(/<activity\b/,'<activity android:supportsPictureInPicture="true" android:launchMode="singleTask"');
 fs.writeFileSync(file,xml);console.log('Android permissions and PiP patched');
}
if(fs.existsSync(path.join(project,'ios/App/App/Info.plist'))){
 const plist=path.join(project,'ios/App/App/Info.plist');
 const code=`import plistlib, sys\np=sys.argv[1]\nwith open(p, 'rb') as f: d=plistlib.load(f)\nd['NSAppTransportSecurity']={'NSAllowsArbitraryLoads': True}\nd['NSLocalNetworkUsageDescription']='Open IPTV Pro tim thiet bi phat tren mang noi bo (Chromecast/AirPlay).';d['NSBonjourServices']=['_googlecast._tcp','_CC1AD845._googlecast._tcp']\nwith open(p,'wb') as f: plistlib.dump(d,f,sort_keys=False)\n`;const py=spawnSync('python3',['-c',code,plist],{stdio:'inherit'});if(py.status!==0)throw Error('Could not patch iOS Info.plist');console.log('iOS ATS / Bonjour patched');
}

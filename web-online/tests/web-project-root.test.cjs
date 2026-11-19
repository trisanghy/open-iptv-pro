const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Project root remains the actual IPTV application',()=>{
 const player=read('index.html');
 assert.match(player,/id="appShell"/);
 assert.match(player,/id="page-tv"/);
 assert.match(player,/rel="canonical" href="https:\/\/trisanghy.github.io\/open-iptv-pro\/"/);
 const builder=read('web-online/publish-home.py');
 assert.doesNotMatch(builder,/shutil\.copyfile\(here \/ 'project-home.html', out \/ 'index.html'\)/);
 assert.match(builder,/\(out \/ 'player.html'\)\.write_text\(player/);
 assert.match(builder,/http:\/\/127\.0\.0\.1:.*\/?view=\{mode\}/);
});
test('SEO sitemap only includes unique canonical project routes',()=>{
 const map=read('sitemap.xml');
 assert.match(map,/\/open-iptv-pro\/<\/loc>/);
 assert.match(map,/\/open-iptv-pro\/huong-dan.html<\/loc>/);
 assert.doesNotMatch(map,/\/player.html<\/loc>/);
 assert.match(read('robots.txt'),/Sitemap: https:\/\/trisanghy.github.io\/open-iptv-pro\/sitemap.xml/);
});
test('Separate homepage source, preview and live screenshots stay in build',()=>{
 const b=read('web-online/publish-home.py');
 assert.match(b,/gioi-thieu.html/);
 assert.match(b,/noindex, follow/);
 assert.match(b,/player-desktop.png|player-' \+ mode/);
 const workflow=read('.github/workflows/deploy-openiptv-web.yml');
 assert.match(workflow,/test -s _site\/assets\/player-mobile.png/);
 assert.match(workflow,/grep -q 'id="appShell"' _site\/index.html/);
});

test('Independent user homepage includes comprehensive copy and crawler setup',()=>{
 const home=read('web-online/project-home.html');
 for(const id of ['tinh-nang','anh','huong-dan','tai-ve','ma-nguon'])assert.match(home,new RegExp('id="'+id+'"'));
 for(const token of ['player-mobile.png','player-desktop.png','Open IPTV Pro','GitHub','M3U','EPG','CORS','sitemap.xml','releases/latest'])assert.ok(home.includes(token),token);
 assert.match(home,/rel="canonical" href="https:\/\/trisanghy.github.io\/"/);
 assert.match(home,/<meta name="robots" content="index, follow">/);
 assert.match(read('web-online/user-site/robots.txt'),/Sitemap: https:\/\/trisanghy.github.io\/sitemap.xml/);
 assert.match(read('web-online/user-site/sitemap.xml'),/<loc>https:\/\/trisanghy.github.io\/<\/loc>/);
 const wf=read('.github/workflows/deploy-openiptv-web.yml');
 assert.match(wf,/openiptv-user-homepage.zip/);
 assert.match(wf,/cp -p web-online\/project-home.html _user_site\/index.html/);
});

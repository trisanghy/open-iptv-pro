const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('User site updates itself from a pinned web/online revision',()=>{
 const w=read('web-online/user-site/.github/workflows/publish-home.yml');
 for(const fragment of [
   'workflow_dispatch:', "cron: '7,37 * * * *'",
   'actions/configure-pages@v5','enablement: true',
   'actions/upload-pages-artifact@v4','actions/deploy-pages@v4',
   'sha=json.loads(download(api,250000))', 'root+src',
   "index.html':'web-online/project-home.html",
   "robots.txt':'web-online/user-site/robots.txt",
   "sitemap.xml':'web-online/user-site/sitemap.xml"
 ]) assert.ok(w.includes(fragment),fragment);
 assert.ok(!w.includes('secrets.PAT'));
});
test('User site artifact can bootstrap a dedicated repository',()=>{
 const w=read('.github/workflows/deploy-openiptv-web.yml');
 assert.ok(w.includes('web-online/user-site/.github/workflows/publish-home.yml _user_site/.github/workflows/publish-home.yml'));
 assert.ok(w.includes('web-online/user-site/README.md _user_site/README.md'));
 assert.ok(w.includes('openiptv-user-homepage.zip'));
 const app=read('index.html');
 assert.ok(app.includes('id="appShell"'));
 assert.ok(app.includes('id="page-tv"'));
});
test('Root homepage has comprehensive landing sections and valid SEO',()=>{
 const h=read('web-online/project-home.html');
 for(const id of ['tinh-nang','anh','tai-ve','huong-dan','ma-nguon'])assert.ok(h.includes('id="'+id+'"'));
 for(const name of ['desktop-tv.png','ios-tv.png','android-tv.png','EPG','M3U','Windows','macOS','GitHub'])assert.ok(h.includes(name),name);
 assert.ok(h.includes('rel="canonical" href="https://trisanghy.github.io/"'));
 assert.ok(read('web-online/user-site/robots.txt').includes('Sitemap: https://trisanghy.github.io/sitemap.xml'));
 assert.ok(read('web-online/user-site/sitemap.xml').includes('<loc>https://trisanghy.github.io/</loc>'));
});

"""Install the project homepage and capture the player shipped in this build."""
import functools
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

here = pathlib.Path(__file__).resolve().parent
out = pathlib.Path(sys.argv[1]).resolve()
base = 'https://trisanghy.github.io/open-iptv-pro/'
player = (out / 'index.html').read_text()
for attribute in ('rel="canonical" href=', 'property="og:url" content='):
    player = player.replace(attribute + '"' + base + '"', attribute + '"' + base + 'player.html"')
player = player.replace('src="cloud-sync.js"', 'src="cloud-sync.js?v=project-home-20261119"')
(out / 'player.html').write_text(player)
shutil.copyfile(here / 'project-home.html', out / 'index.html')
shutil.copyfile(here / 'home-route.js', out / 'home-route.js')
guide = out / 'huong-dan.html'
guide.write_text(guide.read_text().replace('href="./"', 'href="player.html"').replace('<div class="links">', '<div class="links"><a href="./">Trang chủ</a>'))
manifest = out / 'manifest.webmanifest'
data = json.loads(manifest.read_text())
data.update(id='./', start_url='./player.html')
manifest.write_text(json.dumps(data, ensure_ascii=False))
server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(SimpleHTTPRequestHandler, directory=out))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    chrome = shutil.which('google-chrome') or shutil.which('chromium')
    for mode, size in [('desktop','1440,900'), ('mobile','390,844')]:
        image = out / 'assets' / ('player-' + mode + '.png')
        with tempfile.TemporaryDirectory() as profile:
            subprocess.run([chrome, '--headless', '--no-sandbox', '--disable-dev-shm-usage',
                            '--disable-gpu', '--hide-scrollbars', '--window-size=' + size,
                            '--user-data-dir=' + profile, '--virtual-time-budget=2200',
                            '--screenshot=' + str(image),
                            f'http://127.0.0.1:{server.server_port}/player.html?view={mode}'],
                           timeout=60, check=True)
        if not image.is_file() or image.stat().st_size < 8000:
            raise ValueError('Missing player screenshot: ' + mode)
finally:
    server.shutdown()
    server.server_close()

"""Keep the player as the GitHub Pages project root and capture this build.

The separate user-site (trisanghy.github.io) has its own homepage source in
web-online/project-home.html. NEVER overwrite the player index.html with it.
"""
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
player = (out / 'index.html').read_text(encoding='utf-8')
if 'id="appShell"' not in player or 'id="page-tv"' not in player:
    raise ValueError('Project index must remain the IPTV player')
if 'rel="canonical" href="' + base + '"' not in player:
    raise ValueError('Unexpected player canonical URL')
# Preserve prior player.html bookmarks, Magic Link/PKCE callback URLs.
(out / 'player.html').write_text(player, encoding='utf-8')
# Temporary preview while the separate user-site repository is provisioned.
# Exclude the preview from search indexes; the real homepage is at the user root.
home = (here / 'project-home.html').read_text(encoding='utf-8')
home = home.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex, follow">')
(out / 'gioi-thieu.html').write_text(home, encoding='utf-8')
manifest = out / 'manifest.webmanifest'
data = json.loads(manifest.read_text(encoding='utf-8'))
data.update(id='./', start_url='./')
manifest.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(SimpleHTTPRequestHandler, directory=out))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    chrome = shutil.which('google-chrome') or shutil.which('chromium')
    if not chrome:
        raise RuntimeError('Chrome/Chromium required to capture real web player')
    for mode, size in [('desktop','1440,900'), ('mobile','390,844')]:
        screenshot = out / 'assets' / ('player-' + mode + '.png')
        with tempfile.TemporaryDirectory() as profile:
            subprocess.run([chrome, '--headless', '--no-sandbox', '--disable-dev-shm-usage',
                            '--disable-gpu', '--hide-scrollbars', '--window-size=' + size,
                            '--user-data-dir=' + profile, '--virtual-time-budget=2200',
                            '--screenshot=' + str(screenshot),
                            f'http://127.0.0.1:{server.server_port}/?view={mode}'],
                           timeout=60, check=True)
        if not screenshot.is_file() or screenshot.stat().st_size < 8000:
            raise ValueError('Missing actual player screenshot: ' + mode)
finally:
    server.shutdown()
    server.server_close()

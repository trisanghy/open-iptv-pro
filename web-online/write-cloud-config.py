#!/usr/bin/env python3
"""Write ONLY public Supabase browser configuration, or stay in guest mode."""
import json,os,re,sys
from pathlib import Path
if len(sys.argv)!=2:sys.exit('Usage: write-cloud-config.py <site/cloud-config.json>')
# Only public client configuration is checked in. The root cloud-config.json
# is the source of truth for this Web branch: stale GitHub Actions variables
# MUST NOT silently switch the live website back to an old Supabase project.
source=Path(__file__).resolve().parent.parent/'cloud-config.json'
committed=json.loads(source.read_text(encoding='utf-8')) if source.exists() else {}
defaults=Path(__file__).with_name('cloud-deployment.json')
fallback=json.loads(defaults.read_text(encoding='utf-8')) if defaults.exists() else {}
url=(committed.get('url') or os.environ.get('SUPABASE_URL') or fallback.get('url') or '').strip().rstrip('/')
key=(committed.get('publishableKey') or os.environ.get('SUPABASE_PUBLISHABLE_KEY') or fallback.get('publishableKey') or '').strip()
if committed.get('url') and os.environ.get('SUPABASE_URL') and os.environ['SUPABASE_URL'].rstrip('/')!=url:
    print('Ignoring stale SUPABASE_URL variable; deployed project matches committed web configuration.')
enabled=bool(url and key)
if url or key:
    if not enabled:
        sys.exit('Set BOTH SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or neither.')
    if not re.fullmatch(r'https://[a-z0-9-]+\.supabase\.co',url,re.I):
        sys.exit('Invalid SUPABASE_URL (expected your Supabase project URL).')
    if not (key.startswith('sb_publishable_') or key.startswith('eyJ')):
        sys.exit('Refusing to publish a secret or invalid Supabase API key.')
output=Path(sys.argv[1])
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps({'enabled':enabled,'url':url if enabled else '',
   'publishableKey':key if enabled else ''},separators=(',',':'))+'\n',encoding='utf-8')
print('Cloud auth configured' if enabled else 'Cloud auth inactive (guest mode remains available)')

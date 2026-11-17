#!/usr/bin/env python3
"""Write ONLY public Supabase browser configuration, or stay in guest mode."""
import json,os,re,sys
from pathlib import Path
if len(sys.argv)!=2:sys.exit('Usage: write-cloud-config.py <site/cloud-config.json>')
url=os.environ.get('SUPABASE_URL','').strip().rstrip('/')
key=os.environ.get('SUPABASE_PUBLISHABLE_KEY','').strip()
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

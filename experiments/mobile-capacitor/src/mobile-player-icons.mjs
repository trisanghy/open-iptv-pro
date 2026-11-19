// 24px / 1.75 stroke Web-style SVGs; cast shape comes from Web app-icons.js.
const PATHS={
 previous:'<path d="M5 5v14"/><path d="m19 5-10 7 10 7z" fill="currentColor" stroke="none"/>',
 play:'<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
 pause:'<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
 stop:'<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
 next:'<path d="M19 5v14"/><path d="m5 5 10 7-10 7z" fill="currentColor" stroke="none"/>',
 volume:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',
 muted:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6m0-6-5 6"/>',
 cast:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M4 14a6 6 0 0 1 6 6M4 10a10 10 0 0 1 10 10M4 19.5h.5"/>',
 pip:'<rect x="2.5" y="3.5" width="19" height="17" rx="2"/><rect x="11.5" y="11.5" width="8" height="6.5" rx="1" fill="currentColor"/>',
 fullscreen:'<path d="M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/>',
 headphones:'<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M5 13h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7a4 4 0 0 1-4-4v-2a2 2 0 0 1 2-2ZM19 13h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h0a4 4 0 0 0 4-4v-2a2 2 0 0 0-2-2Z"/>',
 guide:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h8"/>'
};
export function playerSvg(name){
 return '<svg class="player-symbol" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(PATHS[name]||PATHS.play)+'</svg>';
}

/* Applied after the i18n engine to protect native text from legacy overlays. */
'use strict';
(()=>{
const fixes={"es":{"phút":"minutos","🇻🇳 Việt Nam (VN)":"🇻🇳 País: Vietnam (VN)"},"pt-BR":{"phút":"minutos","Bộ đệm":"Memória temporária"},"zh-CN":{"phút":"分钟"},"th":{"phút":"นาที"},"lo":{"phút":"ນາທີ"},"km":{"phút":"នាទី"},"fr":{"phút":"min."},"de":{"🇻🇳 Việt Nam (VN)":"🇻🇳 Land Vietnam (VN)"},"it":{"Bộ đệm":"Memoria temporanea","🇻🇳 Việt Nam (VN)":"🇻🇳 Paese: Vietnam (VN)"},"id":{"Bộ đệm":"Penyangga pemutaran","🇻🇳 Việt Nam (VN)":"🇻🇳 Negara Vietnam (VN)"}};
const dictionaries=window.OPEN_IPTV_TRANSLATIONS||(window.OPEN_IPTV_TRANSLATIONS={});
for(const [lang,phrases] of Object.entries(fixes))Object.assign(dictionaries[lang]||(dictionaries[lang]={}),phrases);
})();

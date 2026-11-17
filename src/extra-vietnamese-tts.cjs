'use strict';
// User-selectable Vietnamese engines beyond the existing Piper and VieNeu voices.
// Explicit allowlist; never pass arbitrary model IDs into a shell or Python command.
const VIETVOICE_VOICES=Object.freeze([
 ['vietvoice:female:northern','VietVoice · Nữ miền Bắc'],
 ['vietvoice:female:central','VietVoice · Nữ miền Trung'],
 ['vietvoice:female:southern','VietVoice · Nữ miền Nam'],
 ['vietvoice:male:northern','VietVoice · Nam miền Bắc'],
 ['vietvoice:male:central','VietVoice · Nam miền Trung'],
 ['vietvoice:male:southern','VietVoice · Nam miền Nam']
]);
const F5_VOICES=Object.freeze([
 ['f5vi:clone','F5-TTS Vietnamese · Giọng mẫu riêng (phi thương mại)']
]);
const SUPPORTED=new Set([...VIETVOICE_VOICES,...F5_VOICES].map(pair=>pair[0]));
function extraVietnameseVoice(id){
 const name=String(id||'');
 if(!name.startsWith('vietvoice:')&&!name.startsWith('f5vi:'))return null;
 if(!SUPPORTED.has(name))throw Error('Mô hình/giọng tiếng Việt chưa được hỗ trợ');
 if(name==='f5vi:clone')return Object.freeze({id:name,engine:'f5vi',requiresReference:true,license:'CC-BY-NC-4.0'});
 const [,gender,area]=name.split(':');
 return Object.freeze({id:name,engine:'vietvoice',gender,area,emotion:'neutral',requiresReference:false,license:'MIT'});
}
module.exports={VIETVOICE_VOICES,F5_VOICES,extraVietnameseVoice};

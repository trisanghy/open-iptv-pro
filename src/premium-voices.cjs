'use strict';
// 24 named presets from the open-source VieNeu v3 Turbo voice catalogue.
const VIENEU_VOICES=Object.freeze([
 'Adam bựa','Trúc Ly','Thiện Minh','Mai Anh','Hải Đăng','Thùy Dung','Thiền Tâm Đức',
 'Ngọc Huyền','Quang Sơn','Ngọc Trân','Minh Đức','Phạm Tuyên',
 'Xuân Vĩnh','Thanh Bình','Ngọc Linh','Đoan Trang','Quỳnh Anh',
 'Quốc Tuấn','Adam','Thái Sơn','Thục Đoan','Minh Triết',
 'Mỹ Duyên','Đức Trí','Kim Thanh'
]);
function premiumName(id){
 const voice=String(id||'');
 if(!voice.startsWith('vieneu:'))return null;
 const name=voice.slice(7);
 if(!VIENEU_VOICES.includes(name))throw Error('Giọng VieNeu chưa được hỗ trợ: '+name.slice(0,35));
 return name;
}
module.exports={VIENEU_VOICES,premiumName};

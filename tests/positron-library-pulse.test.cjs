'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../renderer/positron-library-pulse-core.js');
test('Library Pulse tổng hợp metadata thực, không thay đổi playlist',()=>{
 const rows=[
  {id:'1',name:'A',group:'VTV',sourceId:'s1',logo:'http://example.com/a.png',tvgId:'vtv1',status:'alive'},
  {id:'2',name:'B',groupTitle:'VTV',sourceId:'s1',status:'dead'},
  {id:'3',name:'C',group:'Phim',sourceId:'s2',logo:''},
  {id:'4',name:'D'}
 ];
 const before=JSON.stringify(rows);
 const out=core.summarize(rows);
 assert.equal(out.total,4);
 assert.equal(out.sources,2);
 assert.equal(out.groups,3);
 assert.equal(out.withLogoMeta,1);
 assert.equal(out.withEpgId,1);
 assert.equal(out.knownAlive,1);
 assert.equal(out.knownDead,1);
 assert.deepEqual(out.groupBreakdown.map(x=>x.count),[2,1,1]);
 assert.equal(JSON.stringify(rows),before);
});
test('Library Pulse nhận dữ liệu trống an toàn và không đoán trạng thái stream',()=>{
 const r=core.summarize(null);
 assert.equal(r.total,0);assert.equal(r.sources,0);
 assert.equal(r.withEpgId,0);assert.equal(r.knownAlive,0);
});

test('Library Pulse phân trang nhóm theo lô 5, không thay đổi dữ liệu gốc',()=>{
 const groups=Array.from({length:13},(_,i)=>({name:'Nhóm '+i,count:13-i}));
 const before=JSON.stringify(groups);
 assert.deepEqual(core.pageGroups(groups,5).rows,groups.slice(0,5));
 assert.equal(core.pageGroups(groups,5).remaining,8);
 assert.equal(core.pageGroups(groups,10).remaining,3);
 assert.equal(core.pageGroups(groups,15).remaining,0);
 assert.equal(core.pageGroups(groups,-3).rows.length,0);
 assert.deepEqual(core.pageGroups(null),{rows:[],remaining:0});
 assert.equal(JSON.stringify(groups),before);
});
test('P157 mở thêm nhóm và dùng textContent an toàn',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 assert.match(source,/name\.textContent=group\.name/);
 assert.match(source,/moreGroups\.addEventListener\('click'/);
 assert.match(source,/visibleGroupCount\+=5/);
});

test('P5.1.158 missingLogos phân trang và không truy cập URL nguồn',()=>{
 const channels=[
  {id:'1',name:'VTV1',group:'Tin tức',logo:'',url:'http://s1/secret'},
  {id:'2',name:'VTV2',groupTitle:'Khoa học',url:'http://s2/secret'},
  {id:'3',name:'VTV3',logo:'https://cdn/img.png'},
  {id:'4',name:'VTV4',logo:'   ',group:'Tin tức'},
  {id:'5',name:'VTV5',logo:'https://cdn/abc.png'}
 ];
 const snapshot=JSON.stringify(channels);
 const p1=core.missingLogos(channels,{offset:0,limit:2});
 const p2=core.missingLogos(channels,{offset:2,limit:2});
 assert.equal(p1.total,3);assert.deepEqual(p1.rows.map(x=>x.name),['VTV1','VTV2']);
 assert.deepEqual(p2.rows.map(x=>x.name),['VTV4']);
 assert.equal(p1.rows[0].group,'Tin tức');
 assert.ok(!JSON.stringify(p1).includes('secret'));
 assert.equal(JSON.stringify(channels),snapshot);
 assert.equal(core.missingLogos(null).total,0);
});

test('P5.1.158 Escape luôn khôi phục focus về nút Thư viện kể cả sau điều hướng trang',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 assert.match(source,/const hide=\(restoreFocus=false\)/);
 assert.match(source,/const restore=restoreFocus\|\|panel\.contains\(d\.activeElement\)/);
 assert.match(source,/event\.key==='Escape'\)\{event\.preventDefault\(\);hide\(true\);/);
});

test('P5.1.159 tìm kiếm không dấu theo tên/nhóm, không lộ URL stream',()=>{
 const list=[{name:'Đài Địa phương',group:'Tin tức',url:'https://secret/1'},
  {name:'VTV8',group:'Truyền hình địa phương',logo:' ',url:'https://secret/2'},
  {name:'Đài Thiếu nhi',group:'Giải trí',logo:'https://logo/x.png'},
  {name:'Đài Thể thao',group:'Thể thao',logo:''}];
 const original=JSON.stringify(list);
 const a=core.missingLogos(list,{query:'dai dia phuong'});
 const b=core.missingLogos(list,{query:'truyen hinh dia phuong'});
 assert.equal(a.total,1);assert.equal(a.rows[0].name,'Đài Địa phương');
 assert.equal(b.total,1);assert.equal(b.rows[0].name,'VTV8');
 assert.equal(core.missingLogos(list,{query:'dai'}).total,2);
 assert.equal(core.missingLogos(list,{query:'khong co'}).total,0);
 assert.equal(core.missingLogos(list,{query:'secret'}).total,0);
 assert.equal(core.missingLogos(list,{query:' '}).total,3);
 assert.ok(!JSON.stringify(a).includes('https://secret'));
 assert.equal(JSON.stringify(list),original);
});

test('P5.1.160 chọn nhóm thiếu logo chính xác, kết hợp tìm kiếm không dấu, không đổi playlist',()=>{
 const list=[
  {name:'Đài Một',group:'Tin tức',logo:'',url:'https://private/a'},
  {name:'Đài Hai',group:'Tin tức',logo:'',url:'https://private/b'},
  {name:'Thể thao 1',group:'Thể thao',logo:'',url:'https://private/c'},
  {name:'Tin tức 3',group:'Tin tức',logo:'https://img/logo.png'},
  {name:'Chưa nhóm',logo:''},
  {name:'Không tính',group:'Tin tức',logo:'https://img/a.png'}
 ];
 const snapshot=JSON.stringify(list);
 const groups=core.missingLogoGroups(list);
 assert.deepEqual(groups.map(x=>[x.name,x.count]),[['Tin tức',2],['Chưa phân nhóm',1],['Thể thao',1]]);
 assert.equal(core.missingLogos(list,{group:'Tin tức'}).total,2);
 assert.deepEqual(core.missingLogos(list,{group:'Tin tức',query:'dai hai'}).rows.map(x=>x.name),['Đài Hai']);
 assert.equal(core.missingLogos(list,{group:'Thể thao',query:'dai'}).total,0);
 assert.equal(core.missingLogos(list,{group:'Chưa phân nhóm'}).rows[0].name,'Chưa nhóm');
 assert.equal(core.missingLogos(list,{group:'Tin'}).total,0);
 assert.equal(core.missingLogoGroups(null).length,0);
 assert.ok(!JSON.stringify(core.missingLogoGroups(list)).includes('private'));
 assert.equal(JSON.stringify(list),snapshot);
});

test('P5.1.161 sắp xếp tên kênh thiếu logo, giữ nguyên thứ tự nguồn và không lộ URL',()=>{
 const items=[
  {name:'QA Channel 2',group:'Nhóm',url:'https://private/2'},
  {name:'QA Channel 10',group:'Nhóm',url:'https://private/10'},
  {name:'QA Channel 1',group:'Nhóm',url:'https://private/1'},
  {name:'QA Channel 3',group:'Khác',url:'https://private/3'},
  {name:'QA Channel 4',group:'Nhóm',logo:'https://logo/4'}
 ];
 const original=JSON.stringify(items);
 const rownames=o=>core.missingLogos(items,o).rows.map(x=>x.name);
 assert.deepEqual(rownames({group:'Nhóm'}),['QA Channel 2','QA Channel 10','QA Channel 1']);
 assert.deepEqual(rownames({group:'Nhóm',sort:'name-asc'}),['QA Channel 1','QA Channel 2','QA Channel 10']);
 assert.deepEqual(rownames({group:'Nhóm',sort:'name-desc'}),['QA Channel 10','QA Channel 2','QA Channel 1']);
 assert.deepEqual(rownames({sort:'name-asc',offset:1,limit:2}),['QA Channel 2','QA Channel 3']);
 assert.deepEqual(rownames({sort:'name-unknown'}),rownames({}));
 assert.equal(core.missingLogos(items,{query:'qa',sort:'name-desc',group:'Nhóm'}).total,3);
 assert.equal(JSON.stringify(items),original);
 assert.ok(!JSON.stringify(core.missingLogos(items,{sort:'name-desc'})).includes('https://private/'));
});

test('P5.1.162 đến trang N giới hạn đúng, bỏ qua số không hợp lệ, không sửa playlist',()=>{
 const cases=[
  ['1',44,3,1],['17',44,1,17],['44',44,1,44],['999',44,1,44],
  ['0',44,3,1],['-2',44,3,3],['',44,3,3],['xyz',44,3,3],
  ['1.5',44,3,3],['9999999999999999999999999999999999999',44,3,3],
  ['2',0,1,1],['2',1,1,1]
 ];
 for(const [value,total,current,expected] of cases)
  assert.equal(core.missingPage(value,total,current),expected,JSON.stringify({value,total,current}));
 const original=[{name:'QA 1',logo:''},{name:'QA 2',logo:''}];
 const snapshot=JSON.stringify(original);
 assert.equal(core.missingLogos(original,{offset:(core.missingPage('2',2)-1),limit:1}).rows[0].name,'QA 2');
 assert.equal(JSON.stringify(original),snapshot);
});

test('P5.1.163 CSV chỉ metadata, đủ trên 50 dòng, chống công thức Excel',()=>{
 const items=Array.from({length:62},(_,i)=>({name:'Kênh '+String(i+1).padStart(3,'0'),
  group:i%2?'Tin tức':'Thể thao',url:'https://private-stream.invalid/'+i}));
 items.push({name:'=HYPERLINK("https://bad.invalid")',group:'  +cmd',url:'https://private/secret'});
 items.push({name:'Dấu, "kép"',group:'Tin tức'});
 items.push({name:'Có logo',group:'Tin tức',logo:'https://logo/a.png'});
 const original=JSON.stringify(items),csv=core.missingLogoCsv(items);
 assert.ok(csv.startsWith('\ufeff"Tên kênh","Nhóm"\r\n'));
 assert.equal(csv.trim().split('\r\n').length,65);
 assert.ok(csv.includes('"'+"'" + '=HYPERLINK(""https://bad.invalid"")"'));
 assert.ok(csv.includes('"'+"'" + '+cmd"'));
 assert.ok(csv.includes('"Dấu, ""kép"""'));
 assert.ok(!csv.includes('private-stream.invalid')&&!csv.includes('https://private/secret'));
 assert.ok(!csv.includes('Có logo'));
 const filtered=core.missingLogoCsv(items,{query:'kenh',group:'Tin tức',sort:'name-desc'});
 assert.equal(filtered.trim().split('\r\n').length,32);
 assert.ok(filtered.indexOf('"Kênh 062"')<filtered.indexOf('"Kênh 002"'));
 assert.equal(JSON.stringify(items),original);
 assert.equal(core.missingLogoCsv([]),'\ufeff"Tên kênh","Nhóm"\r\n');
});

test('P5.1.164 phân tích kênh trùng tên bằng metadata, không nhầm dấu hoặc thay đổi nguồn',()=>{
 const list=[
  {name:'VTV 1',group:'Tin tức',sourceId:'A',url:'https://private/a'},
  {name:'vtv 1',group:'Thời sự',sourceId:'B',url:'https://private/b'},
  {name:'VTV1',group:'Tin tức',sourceId:'A'},
  {name:'Hòa Bình',group:'Khác',sourceId:'A'},
  {name:'Hoa Binh',group:'Khác',sourceId:'A'},
  {name:'Kênh   N',group:'Giải trí',sourceId:'A'},
  {name:'KÊNH N',group:'Giải trí',sourceId:'B'},
  {name:'  ',group:'Giải trí'},
 ];
 const snapshot=JSON.stringify(list),out=core.duplicateNames(list);
 assert.equal(out.total,2);
 assert.equal(out.extraChannels,2);
 assert.equal(out.rows[0].name,'Kênh N');
 assert.equal(out.rows[0].count,2);
 assert.equal(out.rows[0].sourceCount,2);
 assert.equal(out.rows[1].name,'VTV 1');
 assert.equal(out.rows[1].groupCount,2);
 assert.equal(core.duplicateNames(list,{query:'tin tuc'}).total,1);
 assert.equal(core.duplicateNames(list,{query:'does-not-exist'}).total,0);
 assert.equal(core.duplicateNames(list,{limit:1}).rows.length,1);
 assert.equal(core.duplicateNames(list,{offset:1,limit:1}).rows[0].name,'VTV 1');
 assert.equal(JSON.stringify(list),snapshot);
 assert.ok(!JSON.stringify(out).includes('https://private/'));
 assert.equal(core.duplicateNames([]).total,0);
});

test('P5.1.165 Xuất CSV tên trùng trên 50 hàng và chống rò URL',()=>{
 const list=Array.from({length:63},(_,i)=>[
  {name:'Kênh '+String(i+1).padStart(3,'0'),group:'Tin tức',sourceId:'S1',url:'https://private.invalid/'+i},
  {name:'kênh '+String(i+1).padStart(3,'0'),group:'Thể thao',sourceId:'S2',url:'https://secret.invalid/'+i}
 ]).flat();
 list.push({name:'=cmd',group:'+Group',sourceId:'S1',url:'https://private.invalid/x'});
 list.push({name:'=CMD',group:'+Group',sourceId:'S2',url:'https://private.invalid/y'});
 const original=JSON.stringify(list),csv=core.duplicateNamesCsv(list);
 assert.ok(csv.startsWith('\ufeff"Tên kênh","Số kênh","Số nhóm","Số nguồn","Nhóm"\r\n'));
 assert.equal(csv.split('\r\n').filter(Boolean).length,65);
 assert.ok(csv.includes("'+Group"));
 assert.ok(csv.includes("'=cmd"));
 assert.ok(csv.includes('"Kênh 063","2","2","2"'));
 assert.ok(!csv.includes('private.invalid')&&!csv.includes('secret.invalid'));
 assert.ok(!csv.includes('S1')&&!csv.includes('S2'));
 const filtered=core.duplicateNamesCsv(list,{query:'kenh 063'});
 assert.equal(filtered.split('\r\n').filter(Boolean).length,2);
 assert.ok(filtered.includes('"Kênh 063"'));
 assert.equal(core.duplicateNamesCsv([]),'\ufeff"Tên kênh","Số kênh","Số nhóm","Số nguồn","Nhóm"\r\n');
 assert.equal(JSON.stringify(list),original);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../renderer/positron-library-pulse-core.js');
const fs=require('node:fs'),path=require('node:path');
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

test('P5.1.166 lọc tên trùng nhiều nguồn, một nguồn, chưa rõ nguồn, CSV không lộ URL',()=>{
 const input=[
  {name:'VTV 1',group:'Tin tức',sourceId:'s1',url:'https://private.invalid/1'},
  {name:'vtv 1',group:'Thời sự',sourceId:'s2',url:'https://private.invalid/2'},
  {name:'Kênh Nội Bộ',group:'Phim',sourceId:'s3'},
  {name:'kênh nội bộ',group:'Phim',sourceId:'s3'},
  {name:'Không rõ',group:'Khác'},
  {name:'KHÔNG RÕ',group:'Khác'},
  {name:'Chỉ một',group:'Khác',sourceId:'s1'}];
 const original=JSON.stringify(input),list=scope=>core.duplicateNames(input,{scope});
 assert.equal(list('').total,3);
 assert.deepEqual(list('cross-source').rows.map(x=>x.name),['VTV 1']);
 assert.deepEqual(list('single-source').rows.map(x=>x.name),['Kênh Nội Bộ']);
 assert.deepEqual(list('unknown-source').rows.map(x=>x.name),['Không rõ']);
 assert.equal(list('not-supported').total,3);
 assert.equal(core.duplicateNames(input,{scope:'cross-source',query:'khong ro'}).total,0);
 const csv=core.duplicateNamesCsv(input,{scope:'cross-source'});
 assert.equal(csv.split('\r\n').filter(Boolean).length,2);
 assert.ok(csv.includes('VTV 1')&&!csv.includes('Kênh Nội Bộ'));
 assert.ok(!csv.includes('private.invalid')&&!csv.includes('https://'));
 assert.equal(JSON.stringify(input),original);
});

test('P5.1.167 phân trang thiếu logo 10/25/50 giữ tên và dữ liệu gốc',()=>{
 const input=Array.from({length:57},(_,i)=>({name:'QA Channel '+String(i+1).padStart(3,'0'),group:'Tin tức',sourceId:'test-'+i}));
 const before=JSON.stringify(input);
 const p10=core.missingLogos(input,{offset:0,limit:10});
 const p25=core.missingLogos(input,{offset:0,limit:25});
 const p50=core.missingLogos(input,{offset:0,limit:50});
 assert.equal(p10.total,57);assert.equal(p10.rows.length,10);
 assert.equal(p25.total,57);assert.equal(p25.rows.length,25);
 assert.equal(p50.total,57);assert.equal(p50.rows.length,50);
 assert.equal(core.missingLogos(input,{offset:50,limit:50}).rows.length,7);
 assert.deepEqual(p25.rows.slice(0,10),p10.rows);
 assert.equal(Math.ceil(p10.total/10),6);
 assert.equal(Math.ceil(p25.total/25),3);
 assert.equal(Math.ceil(p50.total/50),2);
 assert.equal(core.missingPage('3',3,1),3);
 assert.equal(core.missingPage('999',3,1),3);
 const csv=core.missingLogoCsv(input);
 assert.equal(csv.split('\r\n').filter(Boolean).length,58);
 assert.equal(JSON.stringify(input),before);
});


test('P5.1.168 phân trang thiếu logo hiển thị trước danh sách cuộn',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.css'),'utf8');
 assert.ok(js.includes('exportBar,missingNav,missingRange,missingRows'), 'Điều hướng và nhãn phạm vi phải đứng trên danh sách cuộn');
 assert.ok(!js.includes('exportBar,missingRows,missingNav'), 'Không đưa phân trang xuống cuối danh sách');
 assert.ok(css.includes('#poLibraryMissingNav{align-self:stretch;'), 'Thanh điều hướng đủ bề rộng');
 assert.ok(css.includes('#poLibraryMissingRows{scrollbar-gutter:stable}'), 'Giữ scroll độc lập');
 assert.ok(js.includes("missingNext.addEventListener('click'"), 'Giữ nguyên điều hướng');
});


test('P5.1.169 lọc kênh thiếu logo theo mã EPG, CSV giữ đúng bộ lọc và an toàn',()=>{
 const channels=[
  {name:'VTV 1',group:'Tin tức',tvgId:'vtv1',url:'https://secret.example/one'},
  {name:'VTV 2',group:'Tin tức',tvgId:'',url:'https://secret.example/two'},
  {name:'TH địa phương',group:'Địa phương',tvgId:'th-local'},
  {name:'Đã có logo',group:'Tin tức',logo:'https://secret.example/logo.png',tvgId:'logo-epg'}
 ];
 const before=JSON.stringify(channels);
 const withEpg=core.missingLogos(channels,{epg:'with-epg'});
 const noEpg=core.missingLogos(channels,{epg:'missing-epg'});
 assert.equal(withEpg.total,2);assert.deepEqual(withEpg.rows.map(x=>x.name),['VTV 1','TH địa phương']);
 assert.equal(noEpg.total,1);assert.equal(noEpg.rows[0].name,'VTV 2');
 assert.equal(core.missingLogos(channels,{epg:'missing-epg',group:'Địa phương'}).total,0);
 assert.equal(core.missingLogos(channels,{epg:'with-epg',query:'dia phuong'}).rows[0].name,'TH địa phương');
 assert.equal(core.missingLogos(channels,{epg:'invalid'}).total,3);
 const csv=core.missingLogoCsv(channels,{epg:'missing-epg'});
 assert.ok(csv.includes('VTV 2')&&!csv.includes('VTV 1')&&!csv.includes('TH địa phương'));
 assert.ok(!csv.includes('secret.example')&&!csv.includes('https://'));
 assert.equal(JSON.stringify(channels),before,'Không thay đổi playlist');
 const ui=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 assert.ok(ui.includes('poLibraryMissingEpg'));
 assert.ok(ui.includes("missingEpg.addEventListener('change'"));
 assert.ok(ui.includes('epg:missingEpg.value'));
 assert.ok(!ui.includes('importSource(')&&!ui.includes('playChannel('));
});


test('P5.1.170 nút Xóa bộ lọc khôi phục đủ 5 điều kiện mà không sửa playlist',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.css'),'utf8');
 assert.ok(ui.includes('poLibraryMissingReset'));
 assert.ok(ui.includes("missingReset.addEventListener('click'"));
 for(const token of ["missingSearch.value=''", "missingGroup.value=''", "missingEpg.value=''", "missingSort.value='playlist'", "missingSize.value='10'", "missingIndex=0"])
  assert.ok(ui.includes(token),token);
 assert.ok(ui.includes("missingSearch.focus({preventScroll:true})"));
 assert.ok(ui.includes("missingReset.hidden=!("));
 assert.ok(css.includes('#poLibraryMissingReset[hidden]{display:none!important}'));
 assert.ok(!ui.includes('importSource(')&&!ui.includes('playChannel(')&&!ui.includes('deleteChannel('));
});

test('P5.1.171 nhãn phạm vi kênh không sửa danh sách nguồn',()=>{
 const f=core.missingVisibleRange;
 assert.equal(f(561,0,10),'Đang xem 1–10 / 561 kênh');
 assert.equal(f(561,10,10),'Đang xem 11–20 / 561 kênh');
 assert.equal(f(561,550,25),'Đang xem 551–561 / 561 kênh');
 assert.equal(f(8,0,25),'Đang xem 1–8 / 8 kênh');
 assert.equal(f(0,0,10),'Không có kênh phù hợp');
 assert.equal(f(-1,-2,10),'Không có kênh phù hợp');
 assert.equal(f(1,999,25),'Đang xem 1–1 / 1 kênh');
 const channels=[{name:'QA A',group:'Tin',url:'https://secret.test/1'},{name:'QA B',group:'Tin',url:'https://secret.test/2'}];
 const before=JSON.stringify(channels),report=core.missingLogos(channels,{limit:1,offset:1});
 assert.equal(f(report.total,report.offset,report.limit),'Đang xem 2–2 / 2 kênh');
 assert.equal(JSON.stringify(channels),before);
 const js=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.css'),'utf8');
 assert.ok(js.includes('poLibraryMissingRange')&&js.includes("setAttribute('aria-live','polite')"));
 assert.ok(js.includes('core.missingVisibleRange(missingTotal,missingIndex*size,size)'));
 assert.ok(css.includes('#poLibraryMissingRange{'));
 assert.ok(!js.includes('deleteChannel(')&&!js.includes('importSource('));
});

test('P5.1.172 Tìm kênh thiếu logo trong TV an toàn, không tự mở playback',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.js'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../renderer/positron-library-pulse.css'),'utf8');
 assert.ok(js.includes("locate.className='po-pulse-missing-locate'"));
 assert.ok(js.includes("locate.setAttribute('aria-label'"),'Có tên thao tác trợ năng');
 assert.ok(js.includes("d.querySelector('#page-tv .filter-tab[data-filter=\"all\"]')"));
 assert.ok(js.includes("search.value=item.name;search.dispatchEvent(new Event('input',{bubbles:true}))"));
 assert.ok(js.includes("state.setPage('tv')"),'Quay về đúng tab TV');
 assert.ok(js.includes('hide();search.focus({preventScroll:true})'),'Đóng popup, focus ô tìm');
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) auto'),'Nút không tăng chiều cao một hàng');
 assert.ok(css.includes('.po-pulse-missing-locate:focus-visible'),'Nút có focus rõ');
 assert.ok(!js.includes('state.playChannel(')&&!js.includes('deleteChannel('));
});

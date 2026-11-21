"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..","docs","positron-workflow");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"style.css"),"utf8");
const source=fs.readFileSync(path.join(root,"app.js"),"utf8");
const data=JSON.parse(fs.readFileSync(path.join(root,"data.json"),"utf8"));

test("Bộ nguồn Site có thể tải và JavaScript hợp lệ",()=>{
 assert.ok(html.includes('lang="vi"'));
 assert.match(html,/href="\.\/style\.css"/);
 assert.match(html,/src="\.\/app\.js"/);
 assert.ok(css.length>1000);
 assert.doesNotThrow(()=>new vm.Script(source,{filename:"app.js"}));
});
test("Không tự tạo vòng hoặc kết quả hoàn tất giả",()=>{
 assert.equal(data.branch,"Positron");
 assert.equal(data.schemaVersion,1);
 assert.deepEqual(data.records,[]);
 assert.deepEqual(data.history,[]);
});
test("Trạng thái đúng năm giá trị tiếng Việt",()=>{
 for(const s of ["chưa làm","đang làm","đã kiểm thử","đã hoàn thành","chưa xác minh"]){
  assert.ok(source.includes(s));
 }
});
test("Bảng có dữ liệu phiên bản, nhánh, nguyên nhân, ảnh, log và kiểm thử",()=>{
 for(const s of ['name="version"','name="round"','name="commit"','name="tag"','name="cause"','name="fix"','name="tests"','name="buildLog"','name="screenshot"','name="artifact"','name="priority"','name="status"']){
  assert.ok(html.includes(s),"Thiếu trường "+s);
 }
});
test("Cổng hoàn tất đòi đủ bằng chứng và kiểm tra trạng thái nhập",()=>{
 assert.match(source,/function complete\(r\)/);
 assert.match(source,/screenshotChecked/);
 assert.match(source,/reportChecked/);
 assert.match(source,/testsPassed/);
 assert.match(source,/ciPassed/);
 assert.match(source,/artifactChecked/);
 assert.match(source,/o\.status==="đã hoàn thành"&&!complete\(o\)/);
 assert.match(source,/o\.status==="đã kiểm thử"/);
});
test("Chỉ cập nhật đúng nhánh Positron và đúng tệp dữ liệu",()=>{
 assert.match(source,/branch="Positron"/);
 assert.match(source,/dataPath="docs\/positron-workflow\/data\.json"/);
 assert.match(source,/branch:branch,sha:original\.sha/);
 assert.ok(!source.includes("force-push"));
});
test("Có bộ lọc, so sánh, lưu cục bộ, nhập xuất và mở lại",()=>{
 for(const name of ["function table(","function compare(","function loadLocal(","function downloadJSON(","function importData(","function reopen(","function refresh("]){
  assert.ok(source.includes(name),name);
 }
});
test("Token không được ghi vào bản dữ liệu xuất",()=>{
 const start=source.indexOf("function snapshot()");
 const end=source.indexOf("function saveLocal()");
 assert.ok(start>=0);
 assert.ok(end>start);
 assert.ok(!source.slice(start,end).includes("token"));
});

(function(){
"use strict";
var repo="trisanghy/open-iptv-pro",branch="Positron",base="https://api.github.com/repos/"+repo,raw="https://raw.githubusercontent.com/"+repo+"/"+branch+"/",dataPath="docs/positron-workflow/data.json",storageKey="positron-control-data-v1";
var states=["chưa làm","đang làm","đã kiểm thử","đã hoàn thành","chưa xác minh"];
var app={records:[],history:[],catalog:[],head:"",packageVersion:"",packagePositron:"",checked:"",catalogLoaded:false,remoteSha:"",token:"",view:"overview"};
var $=function(id){return document.getElementById(id)},E=function(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
var vnum=function(s){var m=/^P5\.1\.(\d+)$/.exec(s||"");return m?+m[1]:-1},byVersion=function(a,b){return vnum(b.version)-vnum(a.version)};
var normalize=function(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/gi,"d").toLowerCase()};
var allowedUrl=function(s){try{var u=new URL(s);return u.protocol==="https:"?u.href:""}catch(e){return ""}};
var aLink=function(url,label){var a=E("a","",label);a.href=allowedUrl(url)||"#";a.target="_blank";a.rel="noopener noreferrer";return a};
var dateText=function(s){if(!s)return "Chưa rõ";try{return new Date(s).toLocaleString("vi-VN")}catch(e){return s}};
function notify(message,error){var e=$("toast");e.textContent=message;e.className="visible"+(error?" error":"");clearTimeout(notify.timer);notify.timer=setTimeout(function(){e.className=""},5000)}
function complete(r){
 return /^[a-f0-9]{40}$/i.test(r.commit||"")&&/^positron\//.test(r.tag||"")&&
 ["screenshot","report","tests","buildLog","artifact"].every(function(k){return !!allowedUrl(r[k])})&&
 ["screenshotChecked","reportChecked","testsPassed","ciPassed","artifactChecked"].every(function(k){return r[k]===true});
}
function sanitize(r){
 if(!r||typeof r!=="object"||!/^P5\.1\.\d+$/.test(r.version||""))return null;
 var fields=["id","type","round","version","appVersion","platform","commit","tag","priority","status","title","defect","cause","fix","screenshot","report","tests","buildLog","artifact","notes","updatedAt"];
 var o={};fields.forEach(function(k){o[k]=String(r[k]||"")});
 o.id=o.id||"item-"+Date.now()+"-"+Math.random().toString(36).slice(2);
 o.type=o.type==="lỗi"?"lỗi":"vòng";o.branch=branch;
 o.status=states.includes(o.status)?o.status:"chưa xác minh";
 o.platform=o.platform||"Electron UI";o.priority=o.priority||"P3 · Trung bình";o.title=o.title||"Chưa có mô tả";
 ["screenshotChecked","reportChecked","testsPassed","ciPassed","artifactChecked"].forEach(function(k){o[k]=r[k]===true});
 if(o.status==="đã hoàn thành"&&!complete(o))o.status="chưa xác minh";
 if(o.status==="đã kiểm thử"&&!(o.testsPassed&&allowedUrl(o.tests)))o.status="chưa xác minh";
 return o;
}
function snapshot(){return {schemaVersion:1,project:"Open IPTV Pro Positron",branch:branch,records:app.records,history:app.history,exportedAt:new Date().toISOString()}}
function saveLocal(){try{localStorage.setItem(storageKey,JSON.stringify(snapshot()))}catch(e){notify("Không thể lưu trình duyệt. Hãy xuất JSON để sao lưu.",true)}}
function loadLocal(){try{var d=JSON.parse(localStorage.getItem(storageKey)||"{}");if(d.branch===branch&&Array.isArray(d.records)){app.records=d.records.map(sanitize).filter(Boolean);app.history=Array.isArray(d.history)?d.history.slice(0,1500):[]}}catch(e){notify("Dữ liệu lưu không đúng định dạng.",true)}}
function history(action,r,details){app.history.unshift({at:new Date().toISOString(),action:action,version:r&&r.version||"",detail:String(details||"")});app.history=app.history.slice(0,1500)}
function combined(){
 var manualVersions=new Set(app.records.filter(function(r){return r.type==="vòng"}).map(function(r){return r.version}));
 var readOnly=app.catalog.filter(function(c){return !manualVersions.has(c.version)}).map(function(c){return {
  id:"catalog-"+c.version,type:"vòng",readOnly:true,version:c.version,round:"",appVersion:c.appVersion||"",branch:branch,platform:"Electron UI",
  commit:/^[a-f0-9]{40}$/i.test(c.commit||"")?c.commit:"",tag:c.tag||"",priority:"Chưa phân loại",status:"chưa xác minh",
  title:c.title||"Chưa có mô tả",defect:"",cause:"",fix:c.description||"",notes:c.status==="release"?"Có bản phát hành; chưa đủ bằng chứng độc lập để xác nhận hoàn tất.":"Phiên bản trong nhật ký; chưa có đủ bằng chứng hoàn tất.",
  screenshot:c.image?raw+"docs/positron-features/"+c.image:"",report:"",tests:"",buildLog:"",artifact:"",releaseUrl:c.url||"",assets:c.assets||[]
 }});
 return app.records.concat(readOnly).sort(byVersion);
}
function latest(){var rows=combined();return rows.length?rows[0]:null}
function nextVersion(){var rows=combined(),n=rows.reduce(function(a,r){return Math.max(a,vnum(r.version))},-1);return n<0?"":"P5.1."+(n+1)}
function nextApp(){var rows=combined().filter(function(r){return /^4\.23\.\d+$/.test(r.appVersion||"")}).sort(byVersion);if(!rows.length)return "";return "4.23."+(+rows[0].appVersion.split(".")[2]+1)}
function pill(value){var cls=value==="đã hoàn thành"?"good":value==="đang làm"?"blue":value==="chưa làm"?"bad":"orange";return E("span","tag "+cls,value)}
function card(parent,title,subtitle,status){var c=E("div","cardline"),left=E("div");left.append(E("strong","",title),E("small","",subtitle));c.append(left,pill(status));parent.append(c)}
function show(name){app.view=name;document.querySelectorAll(".view").forEach(function(x){x.classList.toggle("active",x.id===name)});document.querySelectorAll(".nav").forEach(function(x){x.classList.toggle("active",x.dataset.view===name)});render()}
function overview(){
 $("statVersions").textContent=app.catalogLoaded?app.catalog.length:"—";
 $("statRecords").textContent=app.records.length;
 $("statDone").textContent=app.records.filter(function(r){return r.status==="đã hoàn thành"&&complete(r)}).length;
 $("statPending").textContent=app.records.filter(function(r){return r.status!=="đã hoàn thành"}).length;
 var row=latest();
 var consistency=!!(app.head&&app.catalogLoaded&&app.packageVersion&&app.packagePositron&&row&&row.version===app.packagePositron&&row.appVersion===app.packageVersion);
 $("currentVersion").textContent=consistency?row.version:"Chưa xác minh";
 $("currentApp").textContent=consistency?"Ứng dụng v"+app.packageVersion:"Cần đối chiếu mã nguồn, phiên bản và nhật ký";
 $("lastSync").textContent=app.checked?"Kiểm tra GitHub "+dateText(app.checked)+(app.head?" · HEAD "+app.head.slice(0,10):" · HEAD chưa rõ"):"Chưa đồng bộ GitHub";
 $("headChip").textContent=app.head?"HEAD "+app.head.slice(0,10):"HEAD CHƯA XÁC MINH";
 var c=$("continuation");c.replaceChildren();
 card(c,"Nhánh phát triển cố định",branch+(app.head?" / "+app.head.slice(0,12):" / SHA chưa đọc"),app.head?"đang làm":"chưa xác minh");
 card(c,"Phiên bản tiếp theo đề xuất",consistency?nextVersion()+" · Ứng dụng "+nextApp():"Không đề xuất khi dữ liệu HEAD chưa khớp","chưa làm");
 card(c,"Bản gần nhất",row?row.version+" · "+row.title:"Chưa tải nhật ký","chưa xác minh");
 var t=$("nextWork");t.replaceChildren();
 app.records.filter(function(r){return r.status!=="đã hoàn thành"}).sort(function(a,b){return (a.priority||"").localeCompare(b.priority||"")||byVersion(a,b)}).slice(0,5).forEach(function(r){card(t,r.title,r.version+" · "+r.priority+" · "+r.status,r.status)});
 if(!t.children.length)card(t,"Chưa có lỗi nhập thủ công","Hãy đối chiếu ảnh, log, commit và CI của bản gần nhất; thêm công việc cần xử lý.","chưa làm");
}
function createFilters(kind){
 var root=$(kind+"Filters");if(root.children.length)return;
 [["q","input","Tìm phiên bản, mô tả, commit..."],["round","select","Mọi vòng"],["platform","select","Mọi nền tảng"],["priority","select","Mọi ưu tiên"],["status","select","Mọi trạng thái"]].forEach(function(spec){
  var f=E(spec[1]);f.id=kind+"-"+spec[0];if(spec[1]==="input"){f.type="search";f.placeholder=spec[2]}else{var o=E("option","",spec[2]);o.value="";f.append(o)}root.append(f);f.addEventListener("input",function(){table(kind)})
 });
}
function options(id,values){
 var x=$(id),previous=x.value,labels={round:"Mọi vòng",platform:"Mọi nền tảng",priority:"Mọi ưu tiên",status:"Mọi trạng thái"},kind=id.split("-")[1];
 x.replaceChildren();var first=E("option","",labels[kind]);first.value="";x.append(first);
 Array.from(new Set(values.filter(Boolean))).sort().forEach(function(v){var o=E("option","",v);o.value=v;x.append(o)});x.value=previous;
}
function evidenceCount(r){return ["screenshot","report","tests","buildLog","artifact"].filter(function(k){return !!allowedUrl(r[k])}).length}
function table(kind){
 createFilters(kind);
 var rows=combined().filter(function(r){return r.type===(kind==="round"?"vòng":"lỗi")});
 ["round","platform","priority","status"].forEach(function(k){options(kind+"-"+k,rows.map(function(r){return r[k]}))});
 var q=normalize($(kind+"-q").value);
 rows=rows.filter(function(r){return (!q||normalize([r.version,r.round,r.title,r.defect,r.cause,r.fix,r.commit,r.tag,r.notes].join(" ")).includes(q))&&["round","platform","priority","status"].every(function(k){var f=$(kind+"-"+k).value;return !f||r[k]===f})});
 var body=$(kind+"Table");body.replaceChildren();
 rows.forEach(function(r){
  var tr=E("tr"),first=E("td");first.append(E("strong","",r.version),E("small","",r.round?"Vòng "+r.round:"Chưa gán vòng"));tr.append(first);
  var git=E("td");git.append(E("strong","",branch),E("small","",r.commit?r.commit.slice(0,12):"Commit chưa xác minh"),E("small","",r.tag||"Tag chưa xác minh"));tr.append(git);
  tr.append(E("td","nowrap",r.platform));
  var descr=E("td");descr.append(E("strong","truncate",r.title),E("small","truncate",r.defect?"Lỗi: "+r.defect:""),E("small","truncate",r.cause?"Nguyên nhân: "+r.cause:""),E("small","truncate",r.fix?"Sửa: "+r.fix:""));tr.append(descr);
  tr.append(E("td","nowrap",r.priority));var st=E("td");st.append(pill(r.status));tr.append(st);
  var proof=E("td","nowrap",evidenceCount(r)+"/5 liên kết");proof.append(E("small","",complete(r)?"Đủ cổng":"Thiếu bằng chứng"));tr.append(proof);
  var action=E("td"),btn=E("button","link-button",r.readOnly?"Tạo hồ sơ →":"Sửa / mở lại →");btn.addEventListener("click",function(){editExisting(r)});action.append(btn);tr.append(action);body.append(tr);
 });
 if(!rows.length){var tr=E("tr"),td=E("td","empty","Không tìm thấy mục phù hợp. Không suy đoán tiến độ từ dữ liệu trống.");td.colSpan=8;tr.append(td);body.append(tr)}
 $(kind+"Count").textContent="Hiển thị "+rows.length+" mục · "+(kind==="round"?"Nhật ký gốc chỉ đọc":"Lỗi nhập / quản lý thủ công");
}
function compare(){
 var rows=combined(),versions=Array.from(new Set(rows.map(function(r){return r.version}))).sort(function(a,b){return vnum(b)-vnum(a)});
 ["compareA","compareB"].forEach(function(id,index){var s=$(id),value=s.value;s.replaceChildren();versions.forEach(function(v){var o=E("option","",v);o.value=v;s.append(o)});s.value=versions.includes(value)?value:versions[Math.min(index,versions.length-1)]||""});
 var box=$("comparison");box.replaceChildren();
 ["compareA","compareB"].forEach(function(id){var version=$(id).value;var r=rows.find(function(x){return x.version===version&&x.type==="vòng"})||rows.find(function(x){return x.version===version}),item=E("div","compare-card");
 if(!r){item.textContent="Chưa có bản ghi.";box.append(item);return}
 item.append(E("h3","",version));var dl=E("dl");
 [["Ứng dụng",r.appVersion],["Nội dung",r.title],["Nhánh",r.branch],["Commit",r.commit],["Tag",r.tag],["Nền tảng",r.platform],["Lỗi",r.defect],["Nguyên nhân",r.cause],["Cách sửa",r.fix],["Trạng thái",r.status],["Bằng chứng",evidenceCount(r)+"/5"],["Ghi chú",r.notes]].forEach(function(p){dl.append(E("dt","",p[0]),E("dd","",p[1]||"Chưa xác minh"))});item.append(dl);
 if(allowedUrl(r.screenshot))item.append(aLink(r.screenshot,"Xem ảnh đúng phiên bản ↗"));if(allowedUrl(r.releaseUrl)){item.append(E("p"));item.append(aLink(r.releaseUrl,"Xem GitHub Release ↗"))}box.append(item);
 });
}
function assetType(name){if(/\.png$|screenshot|\.jpe?g$/i.test(name))return "image";if(/\.exe$/i.test(name))return "exe";if(/\.dmg$/i.test(name))return "dmg";if(/audit|test|log|\.json$/i.test(name))return "qa";return "other"}
function assets(){
 var rows=[];
 app.catalog.forEach(function(r){
  if(r.image)rows.push({version:r.version,name:r.image.split("/").pop(),url:raw+"docs/positron-features/"+r.image,type:"image",checked:false});
  (r.assets||[]).forEach(function(a){if(allowedUrl(a.url))rows.push({version:r.version,name:a.name,url:a.url,type:assetType(a.name),checked:false})});
 });
 app.records.forEach(function(r){var fields={screenshot:"screenshotChecked",report:"reportChecked",tests:"testsPassed",buildLog:"ciPassed",artifact:"artifactChecked"};
  Object.keys(fields).forEach(function(k){if(allowedUrl(r[k]))rows.push({version:r.version,name:k+" · "+r.title,url:r[k],type:k==="screenshot"?"image":k==="artifact"?assetType(r[k]):"qa",checked:r[fields[k]]})});
 });
 var query=normalize($("assetSearch").value),filter=$("assetType").value;
 rows=rows.filter(function(a){return (!filter||a.type===filter)&&normalize(a.name+" "+a.version).includes(query)}).slice(0,150);
 var root=$("assets");root.replaceChildren();
 rows.forEach(function(x){var box=E("div","asset"),head=E("div","row");head.append(E("strong","",x.version+" · "+x.name),pill(x.checked?"đã hoàn thành":"chưa xác minh"));box.append(head,E("p","",x.url),aLink(x.url,"Mở tệp / artefact ↗"));root.append(box)});
 if(!rows.length)root.append(E("div","empty","Không có ảnh hoặc artefact phù hợp. Không tạo bằng chứng giả."));
}
function renderHistory(){
 var root=$("historyList");root.replaceChildren();app.history.forEach(function(h){var row=E("div","history-item"),desc=E("div");desc.append(E("strong","",String(h.action||"Thay đổi")+" · "+String(h.version||"Positron")),E("p","",h.detail||""));row.append(E("time","",dateText(h.at)),desc);root.append(row)});
 if(!app.history.length)root.append(E("div","empty","Chưa có thao tác nào. Lịch sử được ghi khi tạo, sửa, mở lại và đồng bộ."));
}
function render(){overview();table("round");table("issue");compare();assets();renderHistory()}
function editExisting(r){
 var f=$("form");f.reset();var m=r||{};
 if(r&&r.readOnly)m=Object.assign({},r,{id:"",status:"chưa xác minh"});
 Array.from(f.elements).forEach(function(x){if(!x.name)return;if(x.type==="checkbox")x.checked=m[x.name]===true;else x.value=m[x.name]===undefined?"":m[x.name]});
 f.elements.branch.value=branch;
 if(!r){f.elements.version.value=nextVersion();f.elements.appVersion.value=nextApp();f.elements.type.value="vòng";f.elements.status.value="chưa xác minh";f.elements.platform.value="Electron UI";f.elements.priority.value="P3 · Trung bình"}
 $("editTitle").textContent=r?(r.readOnly?"Tạo hồ sơ xác minh":"Chỉnh sửa vòng / lỗi"):"Tạo bản ghi mới";
 $("delete").hidden=!r||r.readOnly;$("reopen").hidden=!r||r.readOnly;
 $("editDialog").showModal();
}
function formObject(){
 var r={};Array.from($("form").elements).forEach(function(x){if(!x.name)return;r[x.name]=x.type==="checkbox"?x.checked:x.value.trim()});
 r.id=r.id||"item-"+Date.now()+"-"+Math.random().toString(36).slice(2);r.branch=branch;r.updatedAt=new Date().toISOString();return sanitize(r);
}
function saveForm(e){
 e.preventDefault();var r=formObject();if(!r){notify("Phiên bản không đúng mẫu P5.1.xxx.",true);return}
 if(r.commit&&!/^[a-f0-9]{40}$/i.test(r.commit)){notify("Commit phải có đúng 40 ký tự hex hoặc để trống.",true);return}
 if(r.tag&&!r.tag.startsWith("positron/")){notify("Tag phải thuộc namespace positron/.",true);return}
 var original=app.records.find(function(x){return x.id===r.id}),wanted=$("form").elements.status.value;
 if(r.type==="vòng"&&app.records.some(function(x){return x.type==="vòng"&&x.version===r.version&&x.id!==r.id})){notify("Phiên bản này đã có hồ sơ vòng. Hãy chỉnh sửa hồ sơ cũ.",true);return}
 if(!original&&r.type==="vòng"&&vnum(r.version)<vnum(nextVersion())-1&&!confirm("Đây là phiên bản lịch sử, không phải phiên bản nâng cấp tiếp theo. Bạn muốn thêm bản ghi?"))return;
 app.records=app.records.filter(function(x){return x.id!==r.id});app.records.push(r);
 history(original?"Cập nhật":"Tạo mới",r,(original?"Trạng thái "+original.status+" → "+r.status:"Ghi nhận")+" · "+r.title);
 saveLocal();$("editDialog").close();render();
 notify(wanted!==r.status?"Thiếu bằng chứng: trạng thái tự chuyển về 'chưa xác minh'.":"Đã lưu trong trình duyệt; có thể đồng bộ lên GitHub.",wanted!==r.status);
}
function reopen(){
 var id=$("form").elements.id.value,r=app.records.find(function(x){return x.id===id});if(!r)return;
 r.status="chưa xác minh";r.updatedAt=new Date().toISOString();history("Mở lại",r,"Trở về chưa xác minh; phải kiểm tra lại ảnh, test và artefact.");saveLocal();$("editDialog").close();render();notify("Đã mở lại mục.");
}
function remove(){
 var id=$("form").elements.id.value,r=app.records.find(function(x){return x.id===id});if(!r||!confirm("Xóa mục này? Lịch sử thao tác vẫn được giữ."))return;
 app.records=app.records.filter(function(x){return x.id!==id});history("Xóa",r,r.title);saveLocal();$("editDialog").close();render();notify("Đã xóa mục quản lý.");
}
function importData(d,mode){
 if(!d||d.schemaVersion!==1||d.branch!==branch||!Array.isArray(d.records))throw Error("JSON không phải dữ liệu Positron schema v1.");
 var cleaned=d.records.map(sanitize).filter(Boolean);if(mode==="replace"){app.records=cleaned;app.history=Array.isArray(d.history)?d.history.slice(0,1400):[]}else{var map=new Map(app.records.map(function(r){return [r.id,r]}));cleaned.forEach(function(r){map.set(r.id,r)});app.records=Array.from(map.values())}
 history("Nhập dữ liệu",null,"Đã nhập "+cleaned.length+" mục; bằng chứng được kiểm lại theo cổng xác minh.");saveLocal();render();return cleaned.length;
}
function downloadJSON(){
 var blob=new Blob([JSON.stringify(snapshot(),null,2)],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob),a=E("a");a.href=url;a.download="positron-workflow-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},500);
}
async function fetchJson(url,headers){var r=await fetch(url,{cache:"no-store",headers:headers||{}});if(!r.ok)throw Error("HTTP "+r.status);return r.json()}
async function refresh(){
 $("refresh").disabled=true;$("refresh").textContent="Đang kiểm tra...";
 var results=await Promise.allSettled([
  fetchJson(base+"/branches/"+branch),fetchJson(raw+"docs/positron-features/catalog.json?ts="+Date.now()),fetchJson(raw+"package.json?ts="+Date.now())
 ]);
 if(results[0].status==="fulfilled")app.head=results[0].value.commit&&results[0].value.commit.sha||"";
 if(results[1].status==="fulfilled"){var cat=results[1].value;if(cat.branch===branch&&Array.isArray(cat.versions)){app.catalog=cat.versions.filter(function(v){return /^P5\.1\.\d+$/.test(v.version||"")});app.catalogLoaded=true}}
 if(results[2].status==="fulfilled"){app.packageVersion=results[2].value.version||"";var match=/P5\.1\.\d+/.exec(results[2].value.description||"");app.packagePositron=match?match[0]:""}
 app.checked=new Date().toISOString();
 $("refresh").disabled=false;$("refresh").textContent="↻ Làm mới GitHub";render();
 if(results.some(function(r){return r.status==="rejected"})||!app.catalogLoaded)notify("Một số nguồn GitHub chưa đọc được. Không xác nhận phiên bản HEAD khi thiếu đối chiếu.",true);
 else notify("Đã cập nhật dữ liệu GitHub, HEAD và nhật ký Positron.");
}
function b64Encode(s){var bytes=new TextEncoder().encode(s),rawString="";for(var i=0;i<bytes.length;i++)rawString+=String.fromCharCode(bytes[i]);return btoa(rawString)}
function b64Decode(s){return new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),function(c){return c.charCodeAt(0)}))}
async function request(path,method,body){
 if(!app.token)throw Error("Chưa nhập token.");
 var r=await fetch(base+path,{method:method||"GET",headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer "+app.token,"X-GitHub-Api-Version":"2022-11-28",...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});
 var json=await r.json().catch(function(){return {}});
 if(!r.ok)throw Error("GitHub "+r.status+": "+(json.message||"Không có quyền hoặc tệp đã được sửa."));
 return json;
}
async function pull(){
 app.token=$("token").value.trim();if(!app.token){notify("Bạn chưa nhập token.",true);return}
 if(!confirm("Đọc bản ghi GitHub sẽ thay bản ghi trong trình duyệt. Hãy xuất JSON trước nếu muốn sao lưu."))return;
 try{var file=await request("/contents/"+dataPath+"?ref="+branch),doc=JSON.parse(b64Decode(file.content));if(doc.branch!==branch)throw Error("Không phải dữ liệu nhánh Positron.");
 app.remoteSha=file.sha;var count=importData(doc,"replace");$("syncDialog").close();notify("Đã tải "+count+" mục từ GitHub Positron.")}
 catch(e){notify(e.message,true)}
}
async function push(){
 app.token=$("token").value.trim();if(!app.token){notify("Bạn chưa nhập token.",true);return}
 if(!app.remoteSha){notify("Trước khi ghi, hãy Đọc bản ghi GitHub để lấy SHA và giải quyết trùng dữ liệu. Có thể Xuất JSON trước rồi nhập lại sau.",true);return}
 if(!confirm("Tạo commit mới chỉ thay data.json trên Positron? Không ghi đè nếu SHA tệp đã thay đổi."))return;
 try{
  var original=await request("/contents/"+dataPath+"?ref="+branch);
  if(app.remoteSha&&app.remoteSha!==original.sha)throw Error("Tệp đã thay đổi từ phiên khác. Cần tải lại và giải quyết xung đột.");
  app.remoteSha=original.sha;
  var body={message:"Positron: cập nhật dữ liệu workflow và bằng chứng tiếng Việt",branch:branch,sha:original.sha,content:b64Encode(JSON.stringify(snapshot(),null,2)+"\n")};
  var result=await request("/contents/"+dataPath,"PUT",body);app.remoteSha=result.content.sha;
  history("Đồng bộ GitHub",null,"Commit "+(result.commit&&result.commit.sha||"")+" · chỉ sửa "+dataPath);saveLocal();$("syncDialog").close();render();
  notify("Đã tạo commit trên Positron: "+(result.commit&&result.commit.sha||"").slice(0,12));
 }catch(e){notify("Không ghi được GitHub: "+e.message,true)}
}
document.querySelectorAll("[data-view]").forEach(function(x){x.addEventListener("click",function(){show(x.dataset.view)})});
document.querySelectorAll("[data-add]").forEach(function(x){x.addEventListener("click",function(){editExisting(null);$("form").elements.type.value=x.dataset.add})});
document.querySelectorAll("[data-close]").forEach(function(x){x.addEventListener("click",function(){$(x.dataset.close).close()})});
$("new").onclick=function(){editExisting(null)};
$("form").addEventListener("submit",saveForm);$("reopen").onclick=reopen;$("delete").onclick=remove;
$("import").onclick=function(){$("fileInput").click()};
$("fileInput").onchange=async function(){if(!this.files[0])return;try{var doc=JSON.parse(await this.files[0].text()),count=importData(doc,"merge");notify("Đã nhập "+count+" mục.")}catch(e){notify("Không nhập được: "+e.message,true)}this.value=""};
$("export").onclick=downloadJSON;$("refresh").onclick=refresh;$("remote").onclick=function(){$("syncDialog").showModal()};
$("pullData").onclick=pull;$("pushData").onclick=push;
$("compareA").onchange=compare;$("compareB").onchange=compare;$("assetSearch").oninput=assets;$("assetType").onchange=assets;
loadLocal();render();refresh();
})();
/* TV Web Lab v0.1.59 — standalone GitHub Pages. */
if(location.origin!=='https://trisanghy.github.io'||location.pathname!=='/open-iptv-pro/tv-web-lab.html'){
 location.replace("https://trisanghy.github.io/open-iptv-pro/tv-web-lab.html");
}else{

var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();

;

'use strict';
/* Web channel search: diacritics-insensitive, typo-tolerant and XMLTV-aware.
 * Never changes M3U/EPG or creates remote network requests. EPG is indexed
 * once per guide revision, rather than rescanned on every keystroke. */
(function(root,build){
 const api=build();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OpenIPTVChannelSearch=api;
})(typeof window!=='undefined'?window:null,function(){
 const emptyIndex={byId:new Map(),aliases:new Map()};
 const cache=new WeakMap();
 function normalize(text){
  return String(text||'').normalize('NFD')
   .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D')
   .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 }
 function compact(text){return normalize(text).replace(/\s+/g,'');}
 function words(text){return normalize(text).split(' ').filter(Boolean);}
 function tidy(text){
  return normalize(text).replace(/\b(?:hd|fhd|uhd|4k|1080p|720p)\b/g,'').replace(/\s+/g,'');
 }
 function distance(a,b,limit=1){
  if(a===b)return 0;
  if(!a||!b||Math.abs(a.length-b.length)>limit)return limit+1;
  // Bounded Damerau-Levenshtein, including adjacent swapped letters.
  const matrix=Array.from({length:a.length+1},()=>new Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++)matrix[i][0]=i;
  for(let j=0;j<=b.length;j++)matrix[0][j]=j;
  for(let i=1;i<=a.length;i++){
   let min=limit+1;
   for(let j=1;j<=b.length;j++){
    let cost=a[i-1]===b[j-1]?0:1;
    let value=Math.min(matrix[i-1][j]+1,matrix[i][j-1]+1,matrix[i-1][j-1]+cost);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])value=Math.min(value,matrix[i-2][j-2]+1);
    matrix[i][j]=value;
    if(value<min)min=value;
   }
   if(min>limit)return limit+1;
  }
  return matrix[a.length][b.length];
 }
 function near(queryTokens,textTokens){
  if(!queryTokens.length||!textTokens.length)return false;
  const set=new Set(textTokens);
  const allowShort=queryTokens.length>1;
  return queryTokens.every(q=>{
   if(set.has(q)||textTokens.some(t=>t.startsWith(q)&&q.length>=3))return true;
   if(q.length<(allowShort?2:4))return false;
   const edits=q.length>=8?2:1;
   return textTokens.some(t=>Math.abs(t.length-q.length)<=edits&&distance(q,t,edits)<=edits);
  });
 }
 function indexGuide(guide,now=Date.now()){
  if(!guide||!Array.isArray(guide.programmes))return emptyIndex;
  const programmes=guide.programmes;
  const hour=Math.floor(now/3600000);
  const old=cache.get(guide);
  if(old&&old.programmes===programmes&&old.count===programmes.length&&old.hour===hour)return old.index;
  const byId=new Map(),aliases=new Map();
  const min=now-3600000,max=now+8*86400000;
  // Only future/current titles from the bounded XMLTV schedule are indexed.
  for(const programme of programmes){
   if(!programme||typeof programme.id!=='string'||!programme.id||typeof programme.title!=='string')continue;
   if(!Number.isFinite(programme.start)||!Number.isFinite(programme.end)||programme.end<min||programme.start>max)continue;
   let bucket=byId.get(programme.id);
   if(!bucket){bucket={entries:[],text:'',tokens:[]};byId.set(programme.id,bucket);}
   if(bucket.entries.length>=650)continue;
   const text=normalize(programme.title+' '+String(programme.description||'').slice(0,96));
   if(!text)continue;
   bucket.entries.push({title:programme.title,start:programme.start,end:programme.end,text,tokens:words(text)});
  }
  for(const bucket of byId.values()){
   bucket.text=bucket.entries.map(p=>p.text).join(' | ');
   bucket.tokens=[...new Set(bucket.entries.flatMap(p=>p.tokens))];
  }
  for(const [id,labels] of Object.entries(guide.aliasesById||{})){
   const candidates=[id,...(Array.isArray(labels)?labels:[])];
   for(const label of candidates){const key=tidy(label);if(key&&!aliases.has(key))aliases.set(key,id);}
  }
  const index={byId,aliases};
  cache.set(guide,{programmes,count:programmes.length,hour,index});
  return index;
 }
 function programmeBucket(index,guide,channel){
  const mapping=guide?.manualMappings?.[channel.id];
  const tvg=String(channel.tvgId||'');
  const names=guide?.names||{};
  const lookup=[mapping,tvg,names[tidy(tvg)],names[tidy(channel.name)],index.aliases.get(tidy(tvg)),index.aliases.get(tidy(channel.name))];
  for(const id of lookup){if(id&&index.byId.has(id))return index.byId.get(id);}
  return null;
 }
 function exactProgramme(bucket,query,queryTokens){
  if(!bucket)return null;
  if(!bucket.text.includes(query)){
   // Match all words in the SAME programme; never combine unrelated titles.
   return bucket.entries.find(entry=>queryTokens.every(w=>entry.tokens.some(t=>t===w||t.startsWith(w)&&w.length>=3)))||null;
  }
  return bucket.entries.find(entry=>entry.text.includes(query))||
   bucket.entries.find(entry=>queryTokens.every(w=>entry.tokens.some(t=>t===w||t.startsWith(w)&&w.length>=3)))||null;
 }
 function approximateProgramme(bucket,queryTokens){
  if(!bucket)return null;
  if(!near(queryTokens,bucket.tokens))return null;
  return bucket.entries.find(entry=>near(queryTokens,entry.tokens))||null;
 }
 function search(channels,query,guide,{clock=Date.now(),categoryFor=null}={}){
  const list=Array.isArray(channels)?channels:[];
  const q=normalize(query),qcompact=compact(query),qTokens=words(query);
  if(!q)return {channels:list,matches:new Map(),approximate:false,usedEPG:false};
  const index=indexGuide(guide,clock);
  const exact=[],candidates=[],fuzzy=[],matches=new Map();
  let usedEPG=false;
  for(const channel of list){
   const title=normalize(channel.name),group=normalize(channel.group);
   const id=normalize(channel.tvgId);
   const extra=typeof categoryFor==='function'?normalize(categoryFor(channel)):'';
   const metadata=[title,group,id,extra].filter(Boolean);
   const exactMeta=metadata.some(text=>text.includes(q))||
    (qcompact.length>=3&&metadata.some(text=>text.replace(/\s+/g,'').includes(qcompact)))||
    qTokens.every(t=>metadata.some(text=>words(text).some(w=>w===t||w.startsWith(t)&&t.length>=3)));
   const bucket=programmeBucket(index,guide,channel);
   const programme=exactProgramme(bucket,q,qTokens);
   if(exactMeta||programme){
    const match={type:exactMeta?'channel':'epg',programme:programme?.title||'',start:programme?.start||0};
    exact.push(channel);matches.set(String(channel.id),match);
    if(programme)usedEPG=true;
    continue;
   }
   candidates.push({channel,metadata,bucket});
  }
  // Do not run fuzzy edit-distance calculations at all when exact matches exist.
  if(exact.length)return {channels:exact,matches,approximate:false,usedEPG};
  for(const {channel,metadata,bucket} of candidates){
   const metadataTokens=[...new Set(metadata.flatMap(words))];
   if(near(qTokens,metadataTokens)){
    fuzzy.push({channel,match:{type:'near',programme:'',start:0}});
    continue;
   }
   const nearby=approximateProgramme(bucket,qTokens);
   if(nearby)fuzzy.push({channel,match:{type:'near-epg',programme:nearby.title,start:nearby.start}});
  }
  return {channels:fuzzy.map(x=>x.channel),matches:new Map(fuzzy.map(x=>[String(x.channel.id),x.match])),
   approximate:fuzzy.length>0,usedEPG:fuzzy.some(x=>x.match.type==='near-epg')};
 }
 return Object.freeze({normalize,compact,words,distance,near,indexGuide,search});
});


;

(function(){
'use strict';
var byId=function(id){return document.getElementById(id);};
var storageKey='openiptv-tizenbrew-tv-v1-hybrid-lab';
var state={sources:[],favorites:{},recent:[],theme:'google'},section='all',group='Tất cả',search='',selected=null,playing=null,showLimit=160,items=[];
try{var old=JSON.parse(localStorage.getItem(storageKey)||'{}');if(old&&typeof old==='object'){state.sources=Array.isArray(old.sources)?old.sources:[];state.favorites=old.favorites||{};state.recent=Array.isArray(old.recent)?old.recent:[];state.theme=['dark','google','apple','minimalist','glass'].indexOf(old.theme)>=0?old.theme:old.theme==='amoled'?'dark':old.theme==='light'?'minimalist':'google';}}catch(e){}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));return true;}catch(e){notify('Không đủ bộ nhớ để lưu danh sách.');return false;}}


/* Five first-class TV visual modes, independent of playback and IPTV storage.
 * Store tiny theme preference separately so a large M3U playlist cannot block
 * a simple UI change when the TV's localStorage quota is almost full. */
var TV_THEME_ORDER=['dark','google','apple','minimalist','glass'];
var TV_THEME_NAMES={dark:'Tối',google:'Google TV',apple:'Apple TV',minimalist:'Minimalist',glass:'Glassmorphism'};
var TV_THEME_KEY='openiptv-tizen-ui-theme-v2-hybrid-lab';
try{
 var savedTheme=localStorage.getItem(TV_THEME_KEY);
 if(TV_THEME_ORDER.indexOf(savedTheme)>=0)state.theme=savedTheme;
}catch(e){}
function applyTvTheme(name){
 if(TV_THEME_ORDER.indexOf(name)<0)name='google';
 state.theme=name;document.body.dataset.theme=name;
 var btn=byId('themeBtn'),label=byId('themeLabel');
 if(label)label.textContent='Giao diện · '+TV_THEME_NAMES[name];
 if(btn){
  var next=TV_THEME_ORDER[(TV_THEME_ORDER.indexOf(name)+1)%TV_THEME_ORDER.length];
  btn.title='Đang dùng '+TV_THEME_NAMES[name]+' · Nhấn OK để chuyển sang '+TV_THEME_NAMES[next];
  btn.setAttribute('aria-label','Đổi giao diện · '+TV_THEME_NAMES[name]+' · tiếp theo '+TV_THEME_NAMES[next]);
 }
}
function nextTvTheme(){
 var current=TV_THEME_ORDER.indexOf(state.theme);
 var next=TV_THEME_ORDER[(current+1)%TV_THEME_ORDER.length];
 applyTvTheme(next);
 try{localStorage.setItem(TV_THEME_KEY,next);}
 catch(e){notify('Đã đổi giao diện nhưng bộ nhớ TV không đủ để lưu lựa chọn.');return next;}
 notify('Giao diện: '+TV_THEME_NAMES[next]);
 return next;
}

var SOURCE_CONFIG={url:'https://zjbsvqryaxtafuffpifu.supabase.co',key:'sb_publishable_j_aWS273AgxBi0JYj4O-WA_bNxHFxM7'};
var SOURCE_PAGE='https://trisanghy.github.io/open-iptv-pro/tizen/phone.html?v=023';
var sourcePair=null,pairSeq=0,pairTimer=0,sourceSdkPromise=null;
function sourceStatus(s){byId('sourceQRStatus').textContent=s;}
function newToken(){if(!window.crypto||!window.crypto.getRandomValues)throw Error('TV không hỗ trợ tạo mã QR an toàn.');
var a=new Uint8Array(16);window.crypto.getRandomValues(a);return Array.prototype.map.call(a,function(n){return('0'+n.toString(16)).slice(-2);}).join('');}
function loadSourceSdk(){if(window.supabase&&window.supabase.createClient)return Promise.resolve(window.supabase);
if(sourceSdkPromise)return sourceSdkPromise;
sourceSdkPromise=new Promise(function(resolve,reject){
var links=['https://trisanghy.github.io/open-iptv-pro/supabase-sdk.js','https://cdn.jsdelivr.net/gh/trisanghy/open-iptv-pro@tizen-hybrid-experiment/supabase-sdk.js'];
function loadNext(){if(!links.length){reject(Error('Không tải được thư viện kết nối.'));return;}
var sc=document.createElement('script');sc.src=links.shift();sc.onload=function(){if(window.supabase&&window.supabase.createClient)resolve(window.supabase);else loadNext();};sc.onerror=loadNext;document.head.appendChild(sc);}loadNext();
}).catch(function(e){sourceSdkPromise=null;throw e;});
return sourceSdkPromise;}

/* Tizen QR Manager protocol v2: TV presence challenge + request/progress/result.
 * This prevents a phone from treating Supabase server ACK as proof the TV is online.
 * Changes are saved on TV first, and only then confirmed to the phone.
 */
var managerRevision=0,managerBusy={},managerCache={},playlistTransfer=null;
function managerIds(){
 var changed=false;state.sources.forEach(function(source,i){
  if(!source.id){source.id='src-'+hash('legacy|'+i+'|'+source.name+'|'+((source.channels||[])[0]||{}).id);changed=true;}
 });
 if(changed)save();
}
function managerGroups(source){
 var counts={},order=[],folders=(source&&source.folders||[]).filter(function(x){return typeof x==='string'&&x.trim();});
 if(source)(source.channels||[]).forEach(function(c){var g=String(c.group||'Khác').slice(0,80);counts[g]=(counts[g]||0)+1;if(order.indexOf(g)<0)order.push(g);});
 folders.forEach(function(g){if(order.indexOf(g)<0)order.push(g);});
 var preferred=(source&&source.groupOrder||[]).filter(function(g){return order.indexOf(g)>=0;});
 order=preferred.concat(order.filter(function(g){return preferred.indexOf(g)<0;}));
 return order.map(function(g){return {name:g,count:counts[g]||0};});
}
function orderedManagerEntries(source){
 // Keep physical indexes for QR mutations while honoring the saved folder order.
 var entries=(source&&source.channels||[]).map(function(channel,index){return {channel:channel,index:index};});
 var groups=managerGroups(source).map(function(group){return group.name;});
 var position={};groups.forEach(function(name,i){position[name]=i;});
 entries.sort(function(a,b){
  var ga=String(a.channel.group||'Khác'),gb=String(b.channel.group||'Khác');
  var ia=Object.prototype.hasOwnProperty.call(position,ga)?position[ga]:groups.length;
  var ib=Object.prototype.hasOwnProperty.call(position,gb)?position[gb]:groups.length;
  return ia-ib||a.index-b.index;
 });
 return entries;
}
function managerSnapshot(opts){
 opts=opts||{};managerIds();
 var sources=state.sources.map(function(source){
  var c=source.channels||[];return {id:source.id,name:source.name,address:source.address||'',count:c.length,visible:c.filter(function(x){return !x.hidden;}).length};
 });
 var src=state.sources.find(function(x){return x.id===opts.sourceId;})||state.sources[0];
 var q=String(opts.query||'').trim().toLowerCase().slice(0,90),mode=String(opts.filter||'all');
 var group=String(opts.group||'').slice(0,80),recent=state.recent||[];
 if(['all','fav','recent','visible','hidden'].indexOf(mode)<0)mode='all';
 var matches=[],offset=Math.max(0,Math.min(10000,Number(opts.offset)||0)),pageSize=30;
 if(src)orderedManagerEntries(src).forEach(function(entry){
  var c=entry.channel,i=entry.index;
  if(group&&String(c.group||'Khác')!==group)return;
  if(mode==='fav'&&!state.favorites[c.id]||mode==='recent'&&recent.indexOf(c.id)<0||
     mode==='hidden'&&!c.hidden||mode==='visible'&&c.hidden)return;
  if(q&&(String(c.name||'')+' '+String(c.group||'')).toLowerCase().indexOf(q)<0)return;
  matches.push({channel:c,index:i});
 });
 if(mode==='recent')matches.sort(function(a,b){return recent.indexOf(a.channel.id)-recent.indexOf(b.channel.id);});
 var page=matches.slice(offset,offset+pageSize).map(function(entry){
  var c=entry.channel;
  return {index:entry.index,id:c.id,name:c.name,group:String(c.group||'Khác'),url:String(c.url||'').slice(0,1800),logo:String(c.logo||'').slice(0,1200),hidden:!!c.hidden,
   favorite:!!state.favorites[c.id],recent:recent.indexOf(c.id)>=0,playing:typeof playing!=='undefined'&&!!playing&&playing.id===c.id};
 });
 return {revision:managerRevision,sources:sources,sourceId:src?src.id:'',channels:page,total:matches.length,offset:offset,
  hasMore:matches.length>offset+page.length,query:q,filter:mode,group:group,groups:managerGroups(src)};
}
function managerMutation(change){
 var before=JSON.stringify(state);try{
  var result=change();if(!save())throw Error('TV không đủ bộ nhớ lưu thay đổi.');
  managerRevision++;draw();return {ok:true,value:result};
 }catch(e){try{state=JSON.parse(before);}catch(ignored){}
  draw();return {ok:false,error:String(e.message||e).slice(0,250)};}
}
function findManagerSource(id){
 var s=state.sources.find(function(x){return x.id===id;});
 if(!s)throw Error('Không tìm thấy nguồn, hãy đồng bộ lại danh sách.');
 return s;
}
function findManagerChannel(source,index,id){
 var i=Number(index),list=source.channels||[],c=list[i];
 if(!Number.isInteger(i)||i<0||!c||c.id!==id)throw Error('Kênh đã thay đổi. Nhấn Làm mới để thử lại.');
 return {channel:c,index:i,list:list};
}

function managerGroupName(value){
 var name=String(value||'').trim().slice(0,80);
 if(!name)throw Error('Nhập tên thư mục.');
 return name;
}
function managerEnsureGroup(source,name){
 if(!Array.isArray(source.folders))source.folders=[];
 if(!Array.isArray(source.groupOrder))source.groupOrder=[];
 if(source.folders.indexOf(name)<0)source.folders.push(name);
 if(source.groupOrder.indexOf(name)<0)source.groupOrder.push(name);
}
function managerItems(source,items){
 if(!Array.isArray(items)||!items.length||items.length>60)throw Error('Chọn từ 1 đến 60 kênh mỗi lượt.');
 var used={},found=[];
 items.forEach(function(v){
  var entry=findManagerChannel(source,v.index,v.id);
  if(used[entry.index])throw Error('Có kênh bị chọn trùng.');
  used[entry.index]=true;found.push(entry);
 });
 return found.sort(function(a,b){return a.index-b.index;});
}

function managerPerform(action,payload){
 var data=payload||{},source=null,entry=null;

 if(action==='create-folder')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  var name=managerGroupName(data.name);
  if(managerGroups(source).some(function(g){return g.name===name;}))throw Error('Thư mục đã tồn tại.');
  if(managerGroups(source).length>=100)throw Error('Đã đạt giới hạn 100 thư mục.');
  managerEnsureGroup(source,name);
 });
 if(action==='rename-folder')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  var old=managerGroupName(data.oldName),name=managerGroupName(data.name);
  if(old===name)return;
  if(managerGroups(source).some(function(g){return g.name===name;}))throw Error('Thư mục mới đã tồn tại.');
  if(!managerGroups(source).some(function(g){return g.name===old;}))throw Error('Không tìm thấy thư mục cũ.');
  (source.channels||[]).forEach(function(c){if(String(c.group||'Khác')===old)c.group=name;});
  source.folders=(source.folders||[]).map(function(x){return x===old?name:x;});
  source.groupOrder=(source.groupOrder||[]).map(function(x){return x===old?name:x;});
  managerEnsureGroup(source,name);
 });
 if(action==='delete-folder')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  var name=managerGroupName(data.name);
  if(name==='Khác')throw Error('Không thể xóa thư mục Khác.');
  if(!managerGroups(source).some(function(g){return g.name===name;}))throw Error('Không tìm thấy thư mục.');
  (source.channels||[]).forEach(function(c){if(String(c.group||'Khác')===name)c.group='Khác';});
  source.folders=(source.folders||[]).filter(function(x){return x!==name;});
  source.groupOrder=(source.groupOrder||[]).filter(function(x){return x!==name;});
 });

 if(action==='reorder-folder')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  var name=managerGroupName(data.name),anchor=managerGroupName(data.anchor);
  var groups=managerGroups(source).map(function(g){return g.name;});
  var index=groups.indexOf(name),target=groups.indexOf(anchor);
  if(index<0||target<0)throw Error('Thư mục đã thay đổi, hãy đồng bộ lại.');
  if(name===anchor)throw Error('Không thể kéo thư mục lên chính nó.');
  groups.splice(index,1);
  target=groups.indexOf(anchor)+(data.after===true?1:0);
  groups.splice(target,0,name);
  source.groupOrder=groups;
 });
 if(action==='move-folder')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  var name=managerGroupName(data.name),names=managerGroups(source).map(function(x){return x.name;});
  var i=names.indexOf(name),n=i+(data.direction==='up'?-1:1);
  if(i<0||n<0||n>=names.length)throw Error('Thư mục đang ở đầu hoặc cuối.');
  var temp=names[i];names[i]=names[n];names[n]=temp;
  source.groupOrder=names;
 });
 if(action==='batch-move'||action==='batch-visibility'||action==='batch-favorite'||action==='batch-delete'){
  return managerMutation(function(){
   source=findManagerSource(data.sourceId);
   var entries=managerItems(source,data.items),ids=entries.map(function(x){return x.channel.id;});
   if(action==='batch-delete'){
    source.channels=source.channels.filter(function(c){return ids.indexOf(c.id)<0;});
   }else if(action==='batch-visibility'){
    entries.forEach(function(x){x.channel.hidden=!!data.hidden;});
   }else if(action==='batch-favorite'){
    entries.forEach(function(x){if(data.favorite)state.favorites[x.channel.id]=true;else delete state.favorites[x.channel.id];});
   }else{
    var to=managerGroupName(data.group),list=source.channels,chosen=entries.map(function(x){return x.channel;});
    managerEnsureGroup(source,to);
    var kept=list.filter(function(c){return chosen.indexOf(c)<0;});
    chosen.forEach(function(c){c.group=to;});
    var position=data.position===null||data.position===undefined||data.position===''?null:Number(data.position);
    if(position!==null&&(!Number.isInteger(position)||position<1||position>5001))throw Error('Vị trí bắt đầu phải từ 1.');
    var groupEntries=kept.filter(function(c){return String(c.group||'Khác')===to;});
    var at=position===null?groupEntries.length:Math.min(position-1,groupEntries.length);
    var insertion=at<groupEntries.length?kept.indexOf(groupEntries[at]):groupEntries.length?kept.indexOf(groupEntries[groupEntries.length-1])+1:kept.length;
    kept.splice.apply(kept,[insertion,0].concat(chosen));source.channels=kept;
   }
  });
 }
 if(action==='relocate-channel')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  entry=findManagerChannel(source,data.index,data.channelId);
  var to=managerGroupName(data.group),item=entry.channel;
  managerEnsureGroup(source,to);
  var list=source.channels;list.splice(entry.index,1);item.group=to;
  var anchor=data.anchorId?list.findIndex(function(c){return c.id===data.anchorId&&String(c.group||'Khác')===to;}):-1;
  if(data.anchorId&&anchor<0)throw Error('Kênh đích đã thay đổi. Hãy làm mới danh sách.');
  if(anchor>=0)list.splice(anchor+(data.after?1:0),0,item);
  else{
   var last=-1;list.forEach(function(c,i){if(String(c.group||'Khác')===to)last=i;});
   list.splice(last<0?list.length:last+1,0,item);
  }
 });
 if(action==='play-channel'){
  source=findManagerSource(data.sourceId);
  entry=findManagerChannel(source,data.index,data.channelId);
  if(entry.channel.hidden)throw Error('Kênh đang bị ẩn. Hãy bật hiển thị trước.');
  play(entry.channel);
  return {ok:true,value:'Đang phát trên TV.'};
 }

 if(action==='rename-source'){
  var name=String(data.name||'').trim().slice(0,80);if(!name)throw Error('Tên nguồn không được để trống.');
  return managerMutation(function(){findManagerSource(data.sourceId).name=name;});
 }
 if(action==='delete-source')return managerMutation(function(){
  var i=state.sources.findIndex(function(s){return s.id===data.sourceId;});
  if(i<0)throw Error('Không tìm thấy nguồn.');state.sources.splice(i,1);
 });
 if(action==='move-source')return managerMutation(function(){
  var i=state.sources.findIndex(function(s){return s.id===data.sourceId;});
  var n=i+(data.direction==='up'?-1:1);
  if(i<0||n<0||n>=state.sources.length)throw Error('Nguồn đang ở đầu hoặc cuối danh sách.');
  var t=state.sources[i];state.sources[i]=state.sources[n];state.sources[n]=t;
 });
 if(['edit-channel','favorite-channel','toggle-channel','delete-channel','move-channel'].indexOf(action)>=0){
  return managerMutation(function(){
   source=findManagerSource(data.sourceId);
   entry=findManagerChannel(source,data.index,data.channelId);
   if(action==='edit-channel'){
    var name=String(data.name||'').trim().slice(0,140);
    var group=String(data.group||'Khác').trim().slice(0,80)||'Khác';
    if(!name)throw Error('Tên kênh không được trống.');
    var address=data.url===undefined?entry.channel.url:url(data.url);
    if(!address)throw Error('URL kênh không hợp lệ.');
    entry.channel.name=name;entry.channel.group=group;entry.channel.url=address;
   }else if(action==='favorite-channel'){
    if(state.favorites[entry.channel.id])delete state.favorites[entry.channel.id];
    else state.favorites[entry.channel.id]=true;
   }else if(action==='toggle-channel'){entry.channel.hidden=!entry.channel.hidden;}
   else if(action==='delete-channel'){entry.list.splice(entry.index,1);}
   else if(action==='move-channel'){
    var n=entry.index+(data.direction==='up'?-1:1);
    if(n<0||n>=entry.list.length)throw Error('Kênh đang ở đầu hoặc cuối danh sách.');
    var temp=entry.list[n];entry.list[n]=entry.channel;entry.list[entry.index]=temp;
   }
  });
 }
 if(action==='add-channel')return managerMutation(function(){
  source=findManagerSource(data.sourceId);
  var name=String(data.name||'').trim().slice(0,140),group=String(data.group||'Khác').trim().slice(0,80)||'Khác',address=url(data.url);
  if(!name||!address)throw Error('Điền đúng tên kênh và URL HTTP(S).');
  if(source.channels.length>=5000)throw Error('Nguồn đã đạt 5000 kênh.');
  source.channels.push({id:hash(address+name),name:name,group:group,url:address,logo:''});
 });
 return {ok:false,error:'Thao tác không hợp lệ.'};
}
function stopPair(){
 pairSeq++;clearTimeout(pairTimer);pairTimer=0;
 var p=sourcePair;sourcePair=null;
 if(p&&p.channel&&p.client){try{p.client.removeChannel(p.channel);}catch(e){}}
 managerBusy={};managerCache={};playlistTransfer=null;
}
async function pairSend(channel,event,payload){
 try{var outcome=await channel.send({type:'broadcast',event:event,payload:payload});
  if(outcome==='error'||outcome==='timed out')throw Error('Máy chủ kết nối không xác nhận tin nhắn.');
  return true;
 }catch(e){sourceStatus('Lỗi gửi phản hồi: '+String(e.message||e));return false;}
}

/* Bounded, ordered and acknowledged playlist upload for the active QR session. */
function sourceDisplayName(value){return String(value==null?'':value).trim().slice(0,80)||('Nguồn IPTV '+(state.sources.length+1));}
function playlistStart(req){
 if(req.rights!==true)throw Error('Cần xác nhận quyền sử dụng danh sách.');
 if(state.sources.length>=15)throw Error('Đã đạt tối đa 15 nguồn.');
 if(!/^[a-f0-9]{32}$/i.test(String(req.transferId||'')))throw Error('Mã gửi tệp không hợp lệ.');
 var name=sourceDisplayName(req.name),parts=Number(req.parts),total=Number(req.total),address=String(req.address||'').trim();
 if(!Number.isInteger(parts)||parts<1||parts>300||!Number.isInteger(total)||total<1||total>3000000)throw Error('M3U vượt 3 MB hoặc số phần không hợp lệ.');
 if(address&&(!url(address)||address.length>4096))throw Error('Địa chỉ gốc không hợp lệ.');
 if(playlistTransfer&&playlistTransfer.id!==req.transferId)playlistTransfer=null; // Permit retry after a failed or abandoned transfer.
 if(playlistTransfer)return;
 playlistTransfer={id:req.transferId,name:name,address:address?url(address):'',parts:parts,total:total,checksum:String(req.checksum||''),chunks:[],length:0,next:0};
 sourceStatus('Đang chờ tệp M3U: 0/'+parts+' phần.');
}
function playlistChunk(req){
 var t=playlistTransfer,i=Number(req.index),part=req.chunk;
 if(!t||t.id!==req.transferId)throw Error('Phiên gửi M3U đã hết.');
 if(!Number.isInteger(i)||i<0||i>=t.parts||typeof part!=='string'||!part.length||part.length>12000)throw Error('Phần M3U không hợp lệ.');
 if(i<t.next){if(t.chunks[i]!==part)throw Error('Phần gửi lại không khớp.');return t.next;}
 if(i!==t.next)throw Error('Sai thứ tự M3U.');
 if(t.length+part.length>t.total||t.length+part.length>3000000)throw Error('M3U vượt 3 MB.');
 t.chunks.push(part);t.length+=part.length;t.next++;
 if(t.next%10===0||t.next===t.parts)sourceStatus('Đang nhận M3U: '+t.next+'/'+t.parts+' phần.');
 return t.next;
}
function playlistFinish(req){
 var t=playlistTransfer;
 if(!t||t.id!==req.transferId)throw Error('Không còn phiên gửi M3U.');
 if(t.next!==t.parts||t.length!==t.total)throw Error('Tệp nhận chưa đủ ('+t.next+'/'+t.parts+').');
 var raw=t.chunks.join('');
 if(t.checksum!==hash(raw))throw Error('M3U lỗi kiểm tra toàn vẹn. Gửi lại.');
 if(/^\s*(?:<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>])/i.test(raw))throw Error('Tệp HTML không phải danh sách M3U.');
 var list=parse(raw,t.name);
 if(!list.length)throw Error('Không tìm thấy kênh HTTP(S) hợp lệ trong M3U.');
 if(state.sources.length>=15)throw Error('Đã đạt 15 nguồn.');
 var saved={id:'src-'+newToken(),name:t.name,address:t.address,channels:list};
 state.sources.push(saved);if(!save()){state.sources.pop();throw Error('TV thiếu bộ nhớ lưu playlist.');}
 playlistTransfer=null;managerRevision++;search='';group='Tất cả';section='all';selected=null;draw();
 notify('Đã lưu '+list.length+' kênh qua QR.');sourceStatus('✓ TV đã nhận và lưu '+list.length+' kênh.');
 return {count:list.length,state:managerSnapshot({sourceId:saved.id})};
}

async function onManagerRequest(req,channel,seq,token){
 if(seq!==pairSeq||!sourcePair||sourcePair.token!==token||byId('modal').hidden)return;
 if(!req||!/^[a-f0-9]{32}$/i.test(String(req.id||'')))return;
 var action=String(req.action||'');
 if(managerCache[req.id]){await pairSend(channel,'manager-result',managerCache[req.id]);return;}
 if(managerBusy[req.id]){await pairSend(channel,'manager-progress',{id:req.id,progress:'TV đang xử lý yêu cầu…'});return;}
 managerBusy[req.id]=true;
 var answer={id:req.id,ok:true};
 try{
  if(action==='hello'){
   answer.online=true;answer.message='TV đã nhận tín hiệu ghép QR.';
   answer.state=managerSnapshot(req);
  }else if(action==='snapshot')answer.state=managerSnapshot(req);
  else if(action==='add-source'){
   if(req.rights!==true)throw Error('Bạn phải xác nhận quyền sử dụng danh sách.');
   sourceStatus('TV đã nhận nguồn từ điện thoại, đang tải M3U…');
   await pairSend(channel,'manager-progress',{id:req.id,progress:'TV đã nhận yêu cầu và đang tải danh sách M3U…'});
   var result=await addSource({name:req.name,address:req.address,rights:req.rights},true);
   if(!result.ok)throw Error(result.error||'Không tải được nguồn');
   managerRevision++;
   answer.count=result.count||0;
   answer.state=managerSnapshot({sourceId:state.sources[state.sources.length-1].id});
   sourceStatus('✓ Đã thêm '+answer.count+' kênh. Có thể tiếp tục quản lý trên điện thoại.');
  }else if(action==='playlist-start'){
   playlistStart(req);answer.message='TV đã sẵn sàng nhận M3U.';
  }else if(action==='playlist-chunk'){
   answer.received=playlistChunk(req);
  }else if(action==='playlist-finish'){
   var imported=playlistFinish(req);answer.count=imported.count;answer.state=imported.state;
  }else{
   var operation=managerPerform(action,req);
   if(!operation.ok)throw Error(operation.error||'Không lưu được thay đổi.');
   answer.state=managerSnapshot({sourceId:req.sourceId,query:req.query,offset:req.offset,filter:req.filter,group:req.viewGroup===undefined?req.group:req.viewGroup});
  }
 }catch(e){answer.ok=false;answer.error=String(e.message||e).slice(0,250);sourceStatus(action==='add-source'&&/truy cập|CORS|Network|HTTPS|Tải M3U/i.test(answer.error)?'✕ URL không tải được trên TV. Dùng mục gửi tệp hoặc dán M3U ở điện thoại.':'Lỗi: '+answer.error.slice(0,130));}
 finally{delete managerBusy[req.id];}
 managerCache[req.id]=answer;
 if(Object.keys(managerCache).length>60)managerCache={};
 await pairSend(channel,'manager-result',answer);
}
async function openPair(){
 stopPair();var seq=pairSeq,token;
 try{token=newToken();}catch(e){sourceStatus(String(e.message||e));return;}
 var qrLink=SOURCE_PAGE+'#code='+token;byId('sourceQR').textContent='';
 byId('sourcePhoneLink').textContent='Đường dẫn dự phòng: '+SOURCE_PAGE;
 if(typeof QRCode!=='function'){sourceStatus('Không tạo được QR. Hãy nhập URL bằng remote.');return;}
 try{new QRCode(byId('sourceQR'),{text:qrLink,width:420,height:420,correctLevel:QRCode.CorrectLevel.M});}
 catch(e){sourceStatus('Lỗi QR: '+String(e.message||e));return;}
 sourceStatus('QR đã tạo nhưng TV chưa kết nối. Đang mở kênh quản lý…');
 try{
  var sdk=await loadSourceSdk();
  if(seq!==pairSeq)return;
  var client=sdk.createClient(SOURCE_CONFIG.url,SOURCE_CONFIG.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:8}}});
  var channel=client.channel('openiptv-tizen-source-v1-'+token,{config:{broadcast:{ack:true,self:false}}});
  sourcePair={client:client,channel:channel,token:token};
  channel.on('broadcast',{event:'manager-request'},function(event){var message=event&&event.payload;void onManagerRequest(message,channel,seq,token);});
  // Backwards compatibility for the v0.1.4 phone page.
  channel.on('broadcast',{event:'source-submit'},async function(event){var message=event&&event.payload;
   if(seq!==pairSeq||!sourcePair||byId('modal').hidden||!message||!/^[a-f0-9]{32}$/i.test(String(message.id||'')))return;
   sourceStatus('TV đã nhận danh sách từ điện thoại…');
   var result=await addSource({name:message.name,address:message.address,rights:message.rights},true);
   await pairSend(channel,'source-result',{id:message.id,ok:result.ok,count:result.count||0,error:result.error||''});
   if(result.ok)managerRevision++;
  });
  channel.subscribe(function(status){
   if(seq!==pairSeq)return;
   if(status==='SUBSCRIBED')sourceStatus('✓ TV đã trực tuyến. Quét QR để quản lý nguồn và kênh trên điện thoại.');
   else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')sourceStatus('TV mất kết nối máy chủ ('+status+'). Nhấn Tạo QR mới.');
  });
  pairTimer=setTimeout(function(){
   if(seq!==pairSeq)return;stopPair();sourceStatus('Mã QR hết hạn sau 10 phút. Nhấn Tạo mã QR mới.');
  },600000);
 }catch(e){if(seq===pairSeq)sourceStatus('TV không kết nối được: '+String(e.message||e)+'. Thử làm mới mã QR.');}
}
var timer=0;function notify(t){var el=byId('toast');el.textContent=t;el.hidden=false;clearTimeout(timer);timer=setTimeout(function(){el.hidden=true;},4100);}
function url(s){
 var value=String(s==null?'':s).replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
 if(!value||value.length>4096)return '';
 value=value.replace(/\\/g,'/');
 var match=value.match(/^(h+t+p+s*)\s*(?::\s*\/{0,2}|\/{1,2}|\s+)(.*)$/i);
 if(match)value=(/s$/i.test(match[1])?'https':'http')+'://'+match[2].replace(/^\/+/,'');
 else if(/^\/\//.test(value))value='https:'+value;
 else if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)){
  if(/^[a-z][a-z0-9+.-]*:/i.test(value)&&!/^[\w.-]+:\d+(?:[/?#]|$)/i.test(value))return '';
  value='https://'+value;
 }
 if(/\s/.test(value))return '';
 try{var u=new URL(value);return(u.protocol==='https:'||u.protocol==='http:')&&u.hostname?u.href:'';}catch(e){return '';}
}
/* Mirror the web/online app.js readSourceURL() exact public-shortlink mapping.
 * Preserve the user's original URL in storage; never rewrite private URLs
 * or send private playlists to a third-party relay. */
function webPlaylistAlias(address){
 var known={
  'https://d.org.vn/listiptv':'https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/main/vmttv',
  'https://nts12.s.gy/iptv':'https://gist.githubusercontent.com/trisanghy/e63b2927598a4b932b3708ddd3183aaa/raw/iptv.m3u'
 };
 return known[String(address||'').replace(/^http:/i,'https:')]||'';
}
async function fetchM3UText(address){
 var target=webPlaylistAlias(address);
 var targets=target&&/^http:\/\//i.test(address)?[target]:target?[address,target]:[address];
 var lastError=null;
 for(var i=0;i<targets.length;i++){
  var current=targets[i],deadline;
  try{
   if(i>0)sourceStatus('URL rút gọn bị chặn. TV đang thử playlist HTTPS trực tiếp như bản Web…');
   var response=await Promise.race([
    fetch(current,{cache:'no-store'}),
    new Promise(function(_resolve,reject){deadline=setTimeout(function(){reject(Error('Tải M3U quá 25 giây. Kiểm tra mạng TV/URL/CORS.'));},25000);})
   ]);
   clearTimeout(deadline);deadline=null;
   if(!response.ok)throw Error('Máy chủ trả HTTP '+response.status+(response.status===403?' (nguồn chặn truy cập)':response.status===404?' (không tìm thấy playlist)':''));
   var raw=await Promise.race([
    response.text(),
    new Promise(function(_resolve,reject){deadline=setTimeout(function(){reject(Error('Đọc M3U quá 25 giây.'));},25000);})
   ]);
   if(raw.length>3000000)throw Error('Danh sách M3U vượt 3 MB.');
   if(/^\s*(?:<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>])/i.test(raw))
    throw Error('URL trả về trang HTML thay vì danh sách M3U.');
   if(!/^\s*(?:\uFEFF)?#EXTM3U\b/i.test(raw)&&!/#EXTINF:/i.test(raw))
    throw Error('URL không trả về danh sách M3U hợp lệ.');
   return {text:raw,usedFallback:!!target&&current===target,loadedFrom:current};
  }catch(e){lastError=e;}
  finally{clearTimeout(deadline);}
 }
 throw lastError||Error('Không thể tải playlist M3U.');
}
function sourceError(e,address){
 var message=String(e&&e.message||e||'Không xác định');
 if(/Failed to fetch|NetworkError|Load failed|Network request failed|fetch failure/i.test(message))
  return 'TV không truy cập được máy chủ M3U. Kiểm tra mạng TV, HTTPS/chứng chỉ, CORS hoặc HTTP bị chặn ('+address+').';
 return message.slice(0,220);
}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
function attr(line,key){var r=new RegExp(key+'="([^"]*)"','i'),m=line.match(r);return m?m[1]:'';}
function parse(text,title){if(text.length>3000000)throw Error('M3U lớn hơn 3 MB');var arr=text.replace(/\r/g,'').split('\n'),out=[],meta=null;
for(var i=0;i<arr.length&&out.length<5000;i++){var s=arr[i].trim();if(/^#EXTINF:/i.test(s)){var p=s.lastIndexOf(',');meta={name:attr(s,'tvg-name')||s.slice(p+1),group:attr(s,'group-title')||'Khác',logo:url(attr(s,'tvg-logo')),tvgId:attr(s,'tvg-id')||''};}
else if(s&&s[0]!=='#'){var u=url(s);if(u){var name=(meta&&meta.name||title||'IPTV').trim();out.push({id:hash(u+name),name:name.slice(0,140),group:meta?meta.group:'Khác',logo:meta?meta.logo:'',tvgId:meta?meta.tvgId:'',url:u});}meta=null;}}
return out;}

/* BEGIN TIZEN EPG LITE V1
 * Default feed matches Web/online features.js: VNEPG Gzip; .xml is a format fallback.
 * A single daily attempt, max 8MB download, 24MB decompressed, 4500 bounded programme rows.
 * EPG stored separately in one IndexedDB record, never the IPTV localStorage source key.
 */
var EPG_DEFAULT='https://epg.io.vn/epg.xml.gz';
var EPG_PLAIN='https://epg.io.vn/epg.xml';
var EPG_BACKUP='https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz';
var EPG_DB='openiptv-tizen-epg-bounded-v1-hybrid-lab';
var EPG_DAY_KEY='openiptv-tizen-epg-day-v1-hybrid-lab';
var epgGuide={names:{},aliasesById:{},programmes:[]},epgRowsById={};
var epgReady=false,epgLoading=false,epgAttemptInSession=false,epgDay='',epgError='';
function epgNorm(v){var s=String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d');
 return s.replace(/\b(?:hd|fhd|uhd|1080p|720p|4k)\b/g,'').replace(/[^a-z0-9]/g,'');}
function epgClock(v){var m=String(v||'').match(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*(Z|[+-]\d{4})?/);
 if(!m)return NaN;var tz=m[7]||'Z',offset=tz==='Z'?0:(tz.charAt(0)==='-'?-1:1)*(Number(tz.slice(1,3))*60+Number(tz.slice(3,5)));
 return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))-offset*60000;}
function epgEntity(raw){return String(raw||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
 .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,function(_,entity){
 if(entity[0]==='#'){var n=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
 return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}
 return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[entity.toLowerCase()]||'';
 }).replace(/<[^>]*>/g,'').trim();}
function epgAttr(attrs,name){var found=String(attrs||'').match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*["\\x27]([^"\\x27]+)["\\x27]','i'));return found?epgEntity(found[1]):'';}
function epgParse(xml,channels,now){
 if(typeof xml!=='string'||xml.length<100||xml.length>24000000||!/<tv(?:\s|>)/i.test(xml))throw Error('XMLTV không hợp lệ hoặc vượt 24 MB.');
 now=Number(now)||Date.now();
 var wanted={},names={},aliasesById={},matched={},rows=[],counts={},maxRows=4500;
 (channels||[]).forEach(function(c){[c.tvgId,c.name].forEach(function(v){var k=epgNorm(v);if(k)wanted[k]=true;});});
 var matchedChannels=0, m;
 var channelPattern=/<channel\b([^>]*)>([\s\S]*?)<\/channel>/gi;
 while((m=channelPattern.exec(xml))){
  var id=epgAttr(m[1],'id');if(!id)continue;
  var aliases=[id],n,labels=/<display-name\b[^>]*>([\s\S]*?)<\/display-name>/gi;
  while((n=labels.exec(m[2]))&&aliases.length<8)aliases.push(epgEntity(n[1]));
  if(!aliases.some(function(x){return !!wanted[epgNorm(x)];}))continue;
  matched[id]=true;matchedChannels++;aliasesById[id]=aliases;
  aliases.forEach(function(a){var key=epgNorm(a);if(key&&!names[key])names[key]=id;});
 }
 // Also map channels with direct tvg-id equal to the programme channel ID.
 (channels||[]).forEach(function(c){if(c.tvgId&&wanted[epgNorm(c.tvgId)]){var id=c.tvgId;
  if(!matched[id]&&xml.indexOf('channel="'+id+'"')>=0){matched[id]=true;names[epgNorm(c.name)]=id;names[epgNorm(c.tvgId)]=id;aliasesById[id]=[c.name,id];}
 }});
 var pat=/<programme\b([^>]*)>([\s\S]*?)<\/programme>/gi;
 var min=now-4*3600000,max=now+72*3600000;
 while((m=pat.exec(xml))){
  var ch=epgAttr(m[1],'channel');if(!matched[ch])continue;
  var start=epgClock(epgAttr(m[1],'start')),end=epgClock(epgAttr(m[1],'stop'));
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end<min||start>max)continue;
  if((counts[ch]||0)>=32||rows.length>=maxRows)continue;
  var label=/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(m[2]),title=epgEntity(label&&label[1]||'').slice(0,120);
  if(!title)continue;
  rows.push({id:ch,start:start,end:end,title:title});
  counts[ch]=(counts[ch]||0)+1;
 }
 rows.sort(function(a,b){return a.start-b.start;});
 if(!rows.length)throw Error('Không tìm thấy chương trình EPG phù hợp với các kênh đã nhập.');
 return {names:names,aliasesById:aliasesById,programmes:rows,matchedChannels:matchedChannels};
}
function epgIndex(guide){
 epgRowsById={};
 (guide.programmes||[]).forEach(function(p){if(!epgRowsById[p.id])epgRowsById[p.id]=[];epgRowsById[p.id].push(p);});
}
function epgSet(guide){if(!guide||!Array.isArray(guide.programmes)||!guide.programmes.length)return false;
 epgGuide=guide;epgIndex(guide);epgReady=true;return true;}
function epgForChannel(channel,now){
 if(!channel)return {now:null,next:null};
 var id=epgGuide.names[epgNorm(channel.tvgId)]||epgGuide.names[epgNorm(channel.name)]||'';
 if(!id&&epgRowsById[channel.tvgId])id=channel.tvgId;
 var rows=epgRowsById[id]||[],current=null,next=null,clock=now||Date.now();
 for(var i=0;i<rows.length;i++){var p=rows[i];if(p.start<=clock&&p.end>clock)current=p;
  else if(p.start>clock){next=p;break;}}
 return {now:current,next:next};
}
function epgTime(ts){if(!Number.isFinite(ts))return '';var d=new Date(ts);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function renderSelectedEPG(){
 var c=selected,g=epgForChannel(c);
 byId('guideNowTitle').textContent=g.now?g.now.title:epgReady?'Chưa có lịch phát':'Đang chờ EPG';
 byId('guideNowTime').textContent=g.now?epgTime(g.now.start)+' – '+epgTime(g.now.end):epgError||'';
 byId('guideNextTitle').textContent=g.next?g.next.title:'Chưa có dữ liệu';
 byId('guideNextTime').textContent=g.next?epgTime(g.next.start)+' – '+epgTime(g.next.end):'';
 var percent=g.now?Math.min(100,Math.max(0,(Date.now()-g.now.start)/(g.now.end-g.now.start)*100)):0;
 byId('guideProgress').style.width=percent.toFixed(1)+'%';
 var icon=byId('selectedChannelLogo'),fallback=byId('selectedChannelPlaceholder'),url=c&&c.logo||'';
 if(url){icon.hidden=false;if(icon.getAttribute('src')!==url)icon.src=url;}else{icon.hidden=true;icon.removeAttribute('src');}
 fallback.hidden=!icon.hidden;fallback.textContent=c?c.name.slice(0,3).toUpperCase():'TV';
}
function epgStatus(msg){var n=byId('epgIndicator');if(n)n.textContent=msg;}
function epgDate(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function epgMeta(){try{return JSON.parse(localStorage.getItem(EPG_DAY_KEY)||'{}')||{};}catch(e){return {};}}
function epgSaveMeta(patch){try{var m=epgMeta();Object.keys(patch).forEach(function(k){m[k]=patch[k];});localStorage.setItem(EPG_DAY_KEY,JSON.stringify(m));}catch(e){}}
function epgDatabase(){
 return new Promise(function(resolve,reject){
  if(typeof indexedDB==='undefined'){reject(Error('IndexedDB không hỗ trợ'));return;}
  var req=indexedDB.open(EPG_DB,1);
  req.onupgradeneeded=function(){if(!req.result.objectStoreNames.contains('guide'))req.result.createObjectStore('guide');};
  req.onsuccess=function(){resolve(req.result);};
  req.onerror=function(){reject(req.error||Error('Không mở được cache EPG'));};
  req.onblocked=function(){reject(Error('Cache EPG đang bận'));};
 });
}
async function epgReadCache(){
 var db=await epgDatabase();try{
  return await new Promise(function(resolve,reject){
   var tx=db.transaction('guide','readonly'),req=tx.objectStore('guide').get('current');
   req.onsuccess=function(){resolve(req.result||null);};req.onerror=function(){reject(req.error||Error('Không đọc được EPG'));};
  });
 }finally{db.close();}
}
async function epgWriteCache(day,guide){
 var json=JSON.stringify(guide);
 if(json.length>750000)throw Error('EPG quá lớn để cache; chỉ lưu trong RAM phiên này.');
 var db=await epgDatabase();
 try{await new Promise(function(resolve,reject){
  var tx=db.transaction('guide','readwrite');
  tx.objectStore('guide').put({day:day,guide:guide},'current');
  tx.oncomplete=function(){resolve();};tx.onabort=function(){reject(tx.error||Error('Bộ nhớ EPG đầy'));};
  tx.onerror=function(){reject(tx.error||Error('Không thể lưu EPG'));};
 });}finally{db.close();}
}
async function epgLimitedBytes(response,max){
 var header=Number(response.headers&&response.headers.get&&response.headers.get('content-length')||0);
 if(header>max)throw Error('EPG vượt giới hạn tải '+Math.round(max/1048576)+' MB.');
 var reader=response.body&&typeof response.body.getReader==='function'?response.body.getReader():null;
 if(!reader){
  if(!header||header>max)throw Error('TV không hỗ trợ đọc EPG có giới hạn dung lượng.');
  var blob=await response.arrayBuffer();if(blob.byteLength>max)throw Error('EPG quá lớn.');return new Uint8Array(blob);
 }
 var parts=[],total=0,chunk;
 try{while(!(chunk=await reader.read()).done){
  var value=chunk.value;total+=value.byteLength;
  if(total>max){try{await reader.cancel();}catch(e){}throw Error('EPG vượt giới hạn bộ nhớ tải.');}
  parts.push(value);
 }}finally{try{reader.releaseLock();}catch(e){}}
 var result=new Uint8Array(total),offset=0;
 parts.forEach(function(part){result.set(part,offset);offset+=part.byteLength;});
 return result;
}
async function epgDecompress(raw){
 if(raw[0]!==0x1f||raw[1]!==0x8b)return raw;
 if(typeof DecompressionStream!=='function'||typeof Blob!=='function')throw Error('TV không hỗ trợ giải nén gzip, thử XML thường.');
 var stream=new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'));
 return epgLimitedBytes({body:stream,headers:{get:function(){return '';}}},24000000);
}
async function epgDownload(url){
 var controller=typeof AbortController!=='undefined'?new AbortController():null;
 var timeout=setTimeout(function(){if(controller)controller.abort();},20000);
 try{
  var response=await fetch(url,{cache:'no-store',signal:controller?controller.signal:undefined});
  if(!response.ok)throw Error('HTTP '+response.status);
  var raw=await epgLimitedBytes(response,8000000);
  var unzipped=await epgDecompress(raw);
  if(unzipped.length>24000000)throw Error('EPG lớn hơn 24 MB giải nén.');
  return new TextDecoder('utf-8').decode(unzipped);
 }finally{clearTimeout(timeout);}
}
async function epgStartup(){
 if(epgLoading||epgAttemptInSession)return;
 epgLoading=true;epgStatus('EPG: đang đọc lịch đã lưu…');
 try{
  var saved;try{saved=await epgReadCache();}catch(e){}
  if(saved&&saved.guide&&epgSet(saved.guide)){epgDay=saved.day||'';epgStatus('EPG: lịch đã lưu '+epgDay);}
  var today=epgDate(),meta=epgMeta();
  if(meta.lastAttempt===today){epgStatus(epgReady?'EPG: đã dùng lịch trong bộ nhớ hôm nay':'EPG: đã kiểm tra hôm nay; sẽ thử lại ngày mai');return;}
  if(!all().length){epgStatus('EPG: sẽ tự tải khi có nguồn kênh');return;}
  epgAttemptInSession=true;epgSaveMeta({lastAttempt:today});
  epgStatus('EPG: đang tải VNEPG (1 lần/ngày)…');
  var raw,error;try{raw=await epgDownload(EPG_DEFAULT);}catch(e){error=e;}
  if(!raw){epgStatus('EPG: thử bản XML tiêu chuẩn…');try{raw=await epgDownload(EPG_PLAIN);}catch(e){error=e;}}
  if(!raw){epgStatus('EPG: VNEPG lỗi, đang thử EPGShare01 dự phòng…');try{raw=await epgDownload(EPG_BACKUP);}catch(e){error=e;}}
  if(!raw)throw error||Error('Không tải được VNEPG hoặc EPGShare01.');
  var guide=epgParse(raw,all(),Date.now());
  epgSet(guide);epgError='';epgDay=today;epgSaveMeta({lastSuccess:today});
  epgStatus('EPG: cập nhật '+guide.programmes.length+' chương trình · '+today);
  try{await epgWriteCache(today,guide);}catch(e){epgStatus('EPG đã cập nhật trong RAM; bộ nhớ lưu EPG hạn chế.');}
 }catch(e){epgError='EPG: '+String(e.message||e).slice(0,100);epgStatus(epgError);}
 finally{epgLoading=false;if(typeof selected!=='undefined')renderSelectedEPG();if(search&&typeof draw==='function')draw();}
}
/* END TIZEN EPG LITE V1 */

function elem(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function all(){var seen={},out=[];state.sources.forEach(function(source){orderedManagerEntries(source).forEach(function(entry){var c=entry.channel;if(c.id&&!c.hidden&&!seen[c.id]){seen[c.id]=true;out.push(c);}});});return out;}
var focusStorageKey='open-iptv-tizen-focus-v1-hybrid-lab';
var pickerFocusStorageKey='open-iptv-tizen-picker-v1-hybrid-lab';
var lastHomeFocus='nav:all',lastPickerPosition={group:'Tất cả',id:''};
try{
 var rememberedFocus=localStorage.getItem(focusStorageKey);
 if(rememberedFocus&&rememberedFocus.length<180)lastHomeFocus=rememberedFocus;
 var rememberedPicker=JSON.parse(localStorage.getItem(pickerFocusStorageKey)||'{}');
 if(rememberedPicker&&typeof rememberedPicker.group==='string'&&typeof rememberedPicker.id==='string')
  lastPickerPosition={group:rememberedPicker.group.slice(0,80),id:rememberedPicker.id.slice(0,140)};
}catch(e){}
function focusIdentity(node){
 if(!node)return '';
 var data=node.dataset||{};
 if(data.channelId)return 'channel:'+data.channelId;
 if(data.groupName)return 'group:'+data.groupName;
 if(data.nav)return 'nav:'+data.nav;
 if(node.id)return 'id:'+node.id;
 return '';
}
function rememberHomeFocus(node){
 if(!byId('modal').hidden||!byId('player').hidden)return;
 var key=focusIdentity(node);
 if(!key||key===lastHomeFocus)return;
 lastHomeFocus=key;
 try{localStorage.setItem(focusStorageKey,key);}catch(e){}
}
function restoreHomeFocus(){
 if(!byId('modal').hidden||!byId('player').hidden)return false;
 var nodes=Array.prototype.slice.call(document.querySelectorAll('[data-nav],#groups button,#channels button,button[id]'));
 function usable(node){return node&&!node.disabled&&(!node.getClientRects||node.getClientRects().length>0);}
 var target=nodes.find(function(node){return usable(node)&&focusIdentity(node)===lastHomeFocus;});
 if(!target&&selected)target=nodes.find(function(node){return usable(node)&&focusIdentity(node)==='channel:'+selected.id;});
 if(!target)target=nodes.find(function(node){return usable(node)&&focusIdentity(node)==='nav:'+section;});
 if(!target)target=nodes.find(function(node){return usable(node)&&focusIdentity(node)==='nav:all';});
 if(!target)return false;
 if(document.activeElement!==target){
  try{target.focus({preventScroll:true});}catch(e){target.focus();}
 }
 try{target.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}
 return true;
}
function rememberPickerPosition(){
 var channel=pickerChannels[pickerIndex];
 if(!channel)return;
 lastPickerPosition={group:pickerGroup,id:channel.id};
 try{localStorage.setItem(pickerFocusStorageKey,JSON.stringify(lastPickerPosition));}catch(e){}
}
function select(c){
 selected=c;
 byId('channelTitle').textContent=c?c.name:'Chọn kênh';
 var channelGroup=byId('channelGroup');
 channelGroup.textContent=c?c.group:'';
 channelGroup.hidden=!c;
 var logo=byId('previewLogo'),fallback=byId('previewText');
 fallback.textContent=c?c.name.slice(0,4).toUpperCase():'TV';
 var nextLogo=c&&c.logo||'';
 if((logo.getAttribute('src')||'')!==nextLogo){
  logo.hidden=!nextLogo;
  if(nextLogo)logo.src=nextLogo;
  else logo.removeAttribute('src');
 }
 fallback.hidden=!logo.hidden;
 byId('watchBtn').disabled=!c;
 var favorite=byId('favBtn'),isFavorite=!!(c&&state.favorites[c.id]);
 favorite.disabled=!c;
 favorite.querySelector('.fav-label').textContent=isFavorite?'Bỏ yêu thích':'Thêm yêu thích';
 favorite.setAttribute('aria-pressed',String(isFavorite));
 var rows=byId('channels').children;
 for(var i=0;i<rows.length;i++){
  if(rows[i].dataset&&rows[i].dataset.channelId)
   rows[i].classList.toggle('is-selected',!!(c&&rows[i].dataset.channelId===c.id));
 }
 renderSelectedEPG();
 scheduleHomePreview(c);
}

/* Muted preview uses the same TV-local HLS relay, isolated from fullscreen playback. */
var previewTimer=0,previewFallback=0,previewToken=0,previewAttempt=0,previewHls=null,previewMpegts=null,previewKey='',previewNativeTried=false,previewRelayTried=false,previewMpegtsTried=false;
function previewStatus(message){var el=byId('previewStatus');el.textContent=String(message||'');el.hidden=!message;}
function stopHomePreview(){
 previewToken++;previewAttempt++;clearTimeout(previewTimer);clearTimeout(previewFallback);
 previewTimer=0;previewFallback=0;
 if(previewHls){try{previewHls.destroy();}catch(e){}previewHls=null;}
 if(previewMpegts){try{previewMpegts.pause();}catch(e){}try{previewMpegts.unload();}catch(e){}try{previewMpegts.destroy();}catch(e){}previewMpegts=null;}
 var v=byId('homePreviewVideo');v.onplaying=null;v.ontimeupdate=null;v.onerror=null;v.onloadedmetadata=null;v.onresize=null;
 try{v.pause();v.removeAttribute('src');v.load();}catch(e){}
 v.hidden=true;byId('previewStage').classList.remove('preview-playing');byId('previewArt').hidden=false;
 previewKey='';previewNativeTried=false;previewRelayTried=false;previewMpegtsTried=false;
 var stage=byId('previewStage');if(stage&&stage.dataset){delete stage.dataset.videoShape;delete stage.dataset.videoRatio;}
}
function previewIsCurrent(channel,token,attempt){
 return token===previewToken&&(!attempt||attempt===previewAttempt)&&byId('player').hidden&&
 byId('modal').hidden&&selected&&selected.id===channel.id&&selected.url===channel.url;
}

/* Metadata is informational only. The browser/TV composites video inside its
 * full-size element using object-fit:contain. Never set pixel width/height here:
 * Samsung video surfaces may ignore translate(), leaving the frame at top-left. */
function fitHomePreviewVideo(video){
 var stage=byId('previewStage'),width=Number(video&&video.videoWidth),height=Number(video&&video.videoHeight);
 if(!stage||!stage.dataset||width<=0||height<=0)return;
 var ratio=width/height;
 if(!Number.isFinite(ratio))return;
 stage.dataset.videoShape=ratio<0.9?'portrait':ratio<1.49?'standard':ratio>2?'wide':'landscape';
 stage.dataset.videoRatio=width+':'+height;
}
function previewPlayed(channel,token,attempt){
 if(!previewIsCurrent(channel,token,attempt))return;
 var v=byId('homePreviewVideo');if(v.paused||v.readyState<2)return;
 clearTimeout(previewFallback);previewFallback=0;fitHomePreviewVideo(v);byId('previewArt').hidden=true;
 byId('previewStage').classList.add('preview-playing');previewStatus('');
 // Only fullscreen playback with sustained frame progress validates a route.
}
function previewFailed(channel,token,attempt){
 if(!previewIsCurrent(channel,token,attempt))return;
 clearTimeout(previewFallback);previewFallback=0;
 if(previewMpegts){var old=previewMpegts;previewMpegts=null;
  try{old.pause();}catch(e){}try{old.unload();}catch(e){}try{old.detachMediaElement();}catch(e){}try{old.destroy();}catch(e){}}

 if(!previewNativeTried){startNativePreview(channel,token);return;}
 if(hlsAddress(channel.url)&&!previewRelayTried){startWebHlsPreview(channel,token);return;}
 var v=byId('homePreviewVideo');v.onerror=null;v.onplaying=null;v.ontimeupdate=null;v.onloadedmetadata=null;v.onresize=null;
 try{v.pause();v.removeAttribute('src');v.load();}catch(e){}
 v.hidden=true;byId('previewArt').hidden=false;
 if(previewHls){try{previewHls.destroy();}catch(e){}previewHls=null;}
 if(previewMpegts){try{previewMpegts.unload();}catch(e){}try{previewMpegts.destroy();}catch(e){}previewMpegts=null;}
 byId('previewStage').classList.remove('preview-playing');
 previewStatus('Không phát thử được · Chọn Xem toàn màn hình');
}
function attachPreviewEvents(v,channel,token,attempt){
 v.onplaying=function(){previewPlayed(channel,token,attempt);};
 v.ontimeupdate=function(){if(!v.paused&&v.readyState>=2)previewPlayed(channel,token,attempt);};
 v.onerror=function(){previewFailed(channel,token,attempt);};
 v.onloadedmetadata=function(){if(previewIsCurrent(channel,token,attempt))fitHomePreviewVideo(v);};
 v.onresize=function(){if(previewIsCurrent(channel,token,attempt))fitHomePreviewVideo(v);};
 // Clear sizing retained from older app sessions before attaching the next source.
 if(v.style){v.style.width='';v.style.height='';v.style.aspectRatio='';v.style.transform='';}
 v.muted=true;v.volume=0;v.hidden=false;
}
function startNativePreview(channel,token){
 if(!previewIsCurrent(channel,token)||previewNativeTried)return;
 previewNativeTried=true;var attempt=++previewAttempt,v=byId('homePreviewVideo');
 clearTimeout(previewFallback);
 if(previewHls){try{previewHls.destroy();}catch(e){}previewHls=null;}
 try{v.pause();v.removeAttribute('src');v.load();}catch(e){}
 attachPreviewEvents(v,channel,token,attempt);previewStatus('Đang xem thử '+channel.name+'…');
 previewFallback=setTimeout(function(){
  if(previewIsCurrent(channel,token,attempt)&&!byId('previewStage').classList.contains('preview-playing'))
   previewFailed(channel,token,attempt);
 },3500);
 try{v.src=channel.url;v.load();var p=v.play();
  if(p&&typeof p.catch==='function')p.catch(function(){previewFailed(channel,token,attempt);});
 }catch(e){previewFailed(channel,token,attempt);}
}
function startWebHlsPreview(channel,token){
 if(!previewIsCurrent(channel,token)||previewRelayTried)return;
 previewRelayTried=true;var attempt=++previewAttempt,v=byId('homePreviewVideo');
 clearTimeout(previewFallback);
 try{v.pause();v.removeAttribute('src');v.load();}catch(e){}
 if(previewHls){try{previewHls.destroy();}catch(e){}previewHls=null;}
 attachPreviewEvents(v,channel,token,attempt);
 previewStatus('Đang xem thử bằng HLS.js trực tiếp…');
 previewFallback=setTimeout(function(){previewFailed(channel,token,attempt);},8000);
 Promise.all([loadHlsLibrary(),Promise.resolve({url:channel.url})]).then(function(data){
  if(!previewIsCurrent(channel,token,attempt))return;
  var Hls=data[0],address=String(data[1]&&data[1].url||'');
  if(!Hls||!Hls.isSupported||!Hls.isSupported())throw Error('HLS unavailable');
  if(!/^https?:\/\//i.test(address))throw Error('Invalid web media URL');
  var hls=new Hls({enableWorker:false,lowLatencyMode:false,maxBufferLength:12});
  previewHls=hls;
  hls.on(Hls.Events.MANIFEST_PARSED,function(){
   if(!previewIsCurrent(channel,token,attempt))return;
   var p=v.play();if(p&&typeof p.catch==='function')p.catch(function(){previewFailed(channel,token,attempt);});
  });
  hls.on(Hls.Events.ERROR,function(_evt,error){if(error&&error.fatal)previewFailed(channel,token,attempt);});
  hls.attachMedia(v);hls.loadSource(address);
 }).catch(function(){previewFailed(channel,token,attempt);});
}

function startMpegtsPreview(channel,token){
 if(!previewIsCurrent(channel,token)||previewMpegtsTried)return;
 previewMpegtsTried=true;var attempt=++previewAttempt,v=byId('homePreviewVideo');
 clearTimeout(previewFallback);
 try{v.pause();v.removeAttribute('src');v.load();}catch(e){}
 attachPreviewEvents(v,channel,token,attempt);
 previewStatus('Đang xem thử MPEG-TS/FLV…');
 previewFallback=setTimeout(function(){previewFailed(channel,token,attempt);},9000);
 loadMpegtsLibrary().then(function(lib){
  if(!previewIsCurrent(channel,token,attempt))return;
  if(!lib.isSupported||!lib.isSupported())throw Error('TV không hỗ trợ mpegts.js');
  var player=lib.createPlayer({type:mpegtsType(channel.url),url:channel.url,isLive:true},
   {enableWorker:false,enableStashBuffer:false,lazyLoad:false,autoCleanupSourceBuffer:true});
  previewMpegts=player;
  if(lib.Events&&lib.Events.ERROR)player.on(lib.Events.ERROR,function(){
   if(previewIsCurrent(channel,token,attempt))previewFailed(channel,token,attempt);
  });
  player.attachMediaElement(v);player.load();var value=player.play();
  if(value&&typeof value.catch==='function')value.catch(function(){
   if(previewIsCurrent(channel,token,attempt))previewFailed(channel,token,attempt);
  });
 }).catch(function(){if(previewIsCurrent(channel,token,attempt))previewFailed(channel,token,attempt);});
}

function startHomePreview(channel,token){
 if(!previewIsCurrent(channel,token))return;
 if(!/^https?:\/\//i.test(String(channel.url||''))){previewStatus('Nguồn này không hỗ trợ xem thử');return;}
 // Avoid a competing decoder on the older TV; direct playback starts only on OK.
 previewStatus('Nhấn OK / Xem để phát bằng Receiver TV HTTPS');
}
function scheduleHomePreview(channel){
 if(!channel||!byId('player').hidden||!byId('modal').hidden){
  if(previewKey)stopHomePreview();
  if(!channel)previewStatus('Chọn kênh để xem thử');
  return;
 }
 var key=String(channel.id||'')+'|'+String(channel.url||'');
 if(key===previewKey)return;
 stopHomePreview();previewKey=key;previewStatus('Đang chuẩn bị xem thử…');
 var token=previewToken;
 // Avoid opening a new stream for every rapid arrow-key event.
 previewTimer=setTimeout(function(){startHomePreview(channel,token);},400);
}


/* Local-only recommendations from recent/favorites and currently airing EPG. */
function recommendChannels(channels){
 var list=Array.isArray(channels)?channels:[],recent=state.recent||[],now=Date.now();
 var ranked=list.map(function(c,i){
  var history=recent.indexOf(c.id),guide=epgForChannel(c,now);
  var score=(state.favorites[c.id]?10:0)+(history>=0?6/(1+history*.4):0)+(guide.now?1.4:0)+(playing&&playing.id===c.id?2:0);
  if(!recent.length&&!Object.keys(state.favorites).length)score+=guide.next?.3:0;
  return {c:c,i:i,score:score};
 });
 ranked.sort(function(a,b){return b.score-a.score||a.i-b.i;});
 return ranked.map(function(x){return x.c;});
}
function renderSearchSuggestions(term){
 var holder=byId('searchSuggestions');if(!holder)return;holder.textContent='';
 var pool=all(),q=String(term||'').trim(),found=null;
 if(q){found=window.OpenIPTVChannelSearch.search(pool,q,epgGuide);pool=found.channels.slice(0,7);}
 else pool=recommendChannels(pool).slice(0,7);
 if(!pool.length){holder.textContent='Không thấy kênh phù hợp. Thử từ khóa khác.';return;}
 pool.forEach(function(channel){
  var button=elem('button','suggest-chip',(q?'▶ ':'☆ ')+channel.name.slice(0,40));
  button.onclick=function(){search='';group='Tất cả';section='all';closeDialog();draw();play(channel);};
  holder.appendChild(button);
 });
 if(found&&found.approximate)holder.appendChild(elem('span','search-correction','Đã sửa lỗi gõ · kết quả gần đúng.'));
}

function draw(){
 rememberHomeFocus(document.activeElement);
 items=all();
 var list=items.filter(function(c){
  if(section==='favorites')return !!state.favorites[c.id];
  if(section==='recent')return state.recent.indexOf(c.id)>=0;
  return true;
 });
 if(section==='recent')list.sort(function(a,b){return state.recent.indexOf(a.id)-state.recent.indexOf(b.id);});
 var groups=['Tất cả'];
 if(section==='all'&&list.length)groups.push('✨ Gợi ý');
 list.forEach(function(c){if(groups.indexOf(c.group)<0)groups.push(c.group);});
 if(groups.indexOf(group)<0)group='Tất cả';
 var groupBar=byId('groups');
 groupBar.hidden=groups.length<=1;
 groupBar.replaceChildren();
 groups.slice(0,80).forEach(function(g){
  var button=elem('button',g===group?'active':'',g);
  button.dataset.groupName=g;
  button.setAttribute('aria-pressed',String(g===group));
  button.onclick=function(){
   group=g;
   rememberHomeFocus(button);
   showLimit=160;
   byId('channels').scrollTop=0;
   draw();
  };
  groupBar.appendChild(button);
 });
 if(group==='✨ Gợi ý')list=recommendChannels(list).slice(0,24);
 else if(group!=='Tất cả')list=list.filter(function(c){return c.group===group;});
 var channelSearch={channels:list,matches:new Map(),approximate:false,usedEPG:false};
 if(search){
  try{channelSearch=window.OpenIPTVChannelSearch.search(list,search,epgGuide);}catch(e){
   channelSearch={channels:list.filter(function(c){return epgNorm(c.name+' '+c.group).indexOf(epgNorm(search))>=0;}),matches:new Map(),approximate:false,usedEPG:false};
  }
  list=channelSearch.channels;
 }
 var notice=byId('searchNotice');notice.hidden=!search;
 if(search)notice.textContent=channelSearch.approximate?'Đã tự sửa lỗi gõ: kết quả gần đúng.':
  channelSearch.usedEPG?'Tìm thấy chương trình trong lịch EPG.':'Kết quả theo tên kênh / nhóm.';

 byId('count').textContent=list.length+' kênh';
 byId('heading').textContent=section==='favorites'?'Yêu thích':section==='recent'?'Đã xem':'Trực tiếp';
 var visible=list.slice(0,showLimit),holder=byId('channels');
 var preview=selected&&visible.find(function(c){return c.id===selected.id;});
 holder.replaceChildren();
 holder.hidden=!list.length;
 visible.forEach(function(c,i){
  var b=elem('button','channel');
  b.dataset.channelId=c.id;
  b.appendChild(elem('span','num',String(i+1).padStart(3,'0')));
  if(c.logo){
   var image=elem('img','logo');
   image.loading='lazy';
   image.src=c.logo;
   image.alt='';
   image.onerror=function(){image.replaceWith(elem('span','placeholder','TV'));};
   b.appendChild(image);
  }else b.appendChild(elem('span','placeholder','TV'));
  var meta=elem('span','chtext');
  meta.appendChild(elem('strong','',c.name));
  meta.appendChild(elem('small','',c.group));
  var match=channelSearch.matches&&channelSearch.matches.get(String(c.id));
  if(match&&match.programme)meta.appendChild(elem('small','match-programme','EPG: '+match.programme.slice(0,105)));
  b.appendChild(meta);
  if(state.favorites[c.id])b.appendChild(elem('span','heart','♥'));
  b.onfocus=function(){select(c);};
  b.onclick=function(){select(c);play(c);};
  holder.appendChild(b);
 });
 byId('more').hidden=list.length<=showLimit;
 byId('empty').hidden=!!list.length;
 if(!list.length){
  var needsSource=!items.length&&!search&&section==='all';
  byId('emptyTitle').textContent=search?'Không tìm thấy kênh':section==='favorites'?'Chưa có kênh yêu thích':section==='recent'?'Chưa xem kênh nào':'Chưa có kênh IPTV';
  byId('emptyHint').textContent=search?'Thử từ khóa khác hoặc xóa nội dung tìm kiếm.':
   section==='favorites'?'Chọn một kênh rồi bấm Thêm yêu thích.':
   section==='recent'?'Kênh đã phát sẽ xuất hiện ở đây.':'Thêm nguồn bằng URL hoặc quét QR bằng điện thoại.';
  byId('emptyAdd').hidden=!needsSource;
  byId('sampleBtn').hidden=!needsSource;
 }
 select(preview||visible[0]||null);
 document.querySelectorAll('[data-nav]').forEach(function(b){
  var active=b.dataset.nav===section;
  b.classList.toggle('active',active);
  if(active)b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 });
 restoreHomeFocus();
}
function openDialog(kind){if(typeof stopHomePreview==='function')stopHomePreview();byId('modal').hidden=false;byId('sourceDialog').hidden=kind==='search';byId('searchDialog').hidden=kind!=='search';
byId('modal').firstElementChild.classList.toggle('source-mode',kind!=='search');
byId('dialogTitle').textContent=kind==='search'?'Tìm kiếm kênh':'Thêm nguồn IPTV';
if(kind==='source'){setRightsChecked(false);void openPair();}else {stopPair();if(typeof renderSearchSuggestions==='function')renderSearchSuggestions(byId('searchInput').value);}
setTimeout(function(){byId(kind==='search'?'searchInput':'toSourceUrl').focus();},40);}
function setRightsChecked(on){byId('rights').setAttribute('aria-checked',on?'true':'false');}
function toggleRights(){setRightsChecked(byId('rights').getAttribute('aria-checked')!=='true');}
function closeDialog(){stopPair();byId('modal').hidden=true;if(!restoreHomeFocus())byId('addBtn').focus();if(typeof scheduleHomePreview==='function')scheduleHomePreview(selected);}
async function addSource(data,fromPhone){
var rights=fromPhone?data&&data.rights:byId('rights').getAttribute('aria-checked')==='true';
if(rights!==true){notify('Cần xác nhận quyền sử dụng danh sách.');return {ok:false,error:'Cần xác nhận quyền sử dụng.'};}
var name=sourceDisplayName(fromPhone?data.name:byId('sourceName').value);
var originalAddress=fromPhone?data.address:byId('sourceUrl').value;
var address=url(originalAddress);
if(!address){notify('URL M3U không hợp lệ.');return {ok:false,error:'URL không hợp lệ. Nhập tên miền hoặc địa chỉ HTTP(S), ví dụ example.com/list.m3u'};}
if(!fromPhone)byId('sourceUrl').value=address;
try{byId('saveSource').disabled=true;byId('saveSource').textContent='Đang tải...';
var raw,webAliasUsed=false;
if(/\.m3u8(?:[?#]|$)/i.test(address)){raw='#EXTM3U\n#EXTINF:-1,'+name+'\n'+address;}
else{
 var loaded=await fetchM3UText(address);
 raw=loaded.text;webAliasUsed=loaded.usedFallback;
}
var list=parse(raw,name);if(!list.length)throw Error('M3U không chứa URL hợp lệ');if(state.sources.length>=15)throw Error('Đã đạt 15 nguồn');
state.sources.push({id:'src-'+newToken(),name:name,address:address,channels:list});if(!save()){state.sources.pop();throw Error('Bộ nhớ TV đầy, không thể lưu nguồn.');}search='';group='Tất cả';section='all';selected=null;draw();
if(typeof epgStartup==='function')void epgStartup();if(!fromPhone)closeDialog();notify('Đã thêm '+list.length+' kênh'+(webAliasUsed?' qua nguồn HTTPS của bản Web':'')+'.');if(fromPhone&&webAliasUsed)sourceStatus('✓ TV tải được '+list.length+' kênh qua nguồn HTTPS giống bản Web.');
return {ok:true,count:list.length,usedFallback:webAliasUsed};}
catch(e){var error=sourceError(e,address);notify('Không tải được URL. Quét QR trên điện thoại để gửi tệp hoặc dán M3U.');if(fromPhone)sourceStatus('✕ TV không tải được URL. Trên điện thoại hãy chọn tệp hoặc dán M3U qua QR.');return {ok:false,error:error};}
finally{byId('saveSource').disabled=false;byId('saveSource').textContent='Lưu và tải';}}
function setPlayerStatus(message){var status=byId('playerStatus');status.textContent=message||'';status.hidden=true;}
function browserFallbackUrl(){
 var address=String(playbackStream&&playbackStream.url||(playing&&playing.url)||'');
 if(!/^https?:\/\//i.test(address))return '';
 return address;
}
function browserCastHandoffUrl(){
 // This is the ACTUAL receiver used by the functioning Web Cast flow.
 // The hosted-player standalone page was never equivalent to the paired
 // receiver and can fail when it receives an outdated M3U8 URL.
 // Do not place a private stream URL in browser history or a URL fragment.
 return 'https://trisanghy.github.io/open-iptv-pro/tv.html';
}
function openChannelInSamsungBrowser(){
 var address=browserCastHandoffUrl();
 if(!address){notify('Không tìm thấy trang Cast TV.');return false;}
 try{
  if(typeof tizen!=='undefined'&&tizen.application&&typeof tizen.ApplicationControl==='function'&&
     typeof tizen.application.launchAppControl==='function'){
   var control=new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view',address);
   tizen.application.launchAppControl(control,null,function(){
    // Only the Cast page remains active when leaving TizenBrew: no audio overlap.
    stopPlaybackEngine();
    notify('Đã mở Cast chuẩn. Trên điện thoại/máy tính chọn Cast, nhập mã 6 số hiện trên TV để phát đúng nguồn đang dùng.');
   },function(error){
    notify('Samsung Internet không nhận được yêu cầu: '+String(error&&error.message||'không hỗ trợ trên TV này').slice(0,90));
   });
   return true;
  }
 }catch(error){notify('Không gọi được Samsung Internet: '+String(error&&error.message||error).slice(0,90));return false;}
 try{
  var opened=window.open(address,'_blank');
  if(opened){stopPlaybackEngine();return true;}
 }catch(e){}
 notify('Hãy mở is.gd/openiptv trên Samsung Internet hoặc trang Cast TV rồi ghép đôi bằng mã 6 số.');
 return false;
}
function updateBottomActions(){byId('exitModuleBtn').title='Thoát ứng dụng TV Web Lab';}

/* Samsung playback engines: AVPlay is preferred for IPTV. HTML5 and HLS.js
 * are fallbacks, not the only engine. Never send playlist URLs to a proxy. */
var playbackSerial=0,playbackEngine='',avplayInstance=null,hlsInstance=null,dashInstance=null,playbackTimer=0,hlsLibraryPromise=null,dashLibraryPromise=null,dashAttempted=false;
var html5Video=null,videoRevealTimer=0,videoFrameCallback=null,mpegtsInstance=null,mpegtsLibraryPromise=null,mpegtsAttempted=false;
var preferredDecoderAttempts={hlsjs:0,relay:0,dashjs:0},preferredDecoderEpoch=0;
var PREFERRED_HLS_DIRECT_MAX=3,PREFERRED_HLS_RELAY_MAX=2,PREFERRED_DASH_MAX=3;
var preferredCycleAt=0,PREFERRED_CYCLE_LIMIT_MS=55000;
function resetPreferredDecoderAttempts(){
 preferredDecoderAttempts={hlsjs:0,relay:0,dashjs:0};
 preferredCycleAt=Date.now();
}
function preferredRetryAllowed(){
 return Date.now()-preferredCycleAt<PREFERRED_CYCLE_LIMIT_MS;
}
function preferredRetryStatus(route){
 var count=preferredDecoderAttempts[route]||0,limit=route==='hlsjs'?PREFERRED_HLS_DIRECT_MAX:
  route==='relay'?PREFERRED_HLS_RELAY_MAX:PREFERRED_DASH_MAX;
 return (route==='dashjs'?'DASH.js':route==='relay'?'HLS.js nội bộ':'HLS.js')+' '+count+'/'+limit;
}
function retryPreferredDecoder(channel,token,route,reason,canRepeat){
 if(!playbackActive(token)||playbackConfirmed||!preferredRetryAllowed()||canRepeat===false)return false;
 if(route==='hlsjs'&&preferredDecoderAttempts.hlsjs<PREFERRED_HLS_DIRECT_MAX){
  hlsAttempted=false;return startHlsPlayback(channel,token,'thử lại');
 }
 if(route==='dashjs'&&preferredDecoderAttempts.dashjs<PREFERRED_DASH_MAX){
  dashAttempted=false;return startDashPlayback(channel,token);
 }
 return false;
}

var html5Mode='',hlsAttempted=false,nativeAttempted=false,playbackEvidence=[],playbackFailed=false;
var playbackConfirmed=false,playbackGraceTimer=0,playbackStreamUrls=[],playbackStreamIndex=0,playbackStream=null,nativeReplayUsed=false;
var hlsRelayAttempted=false,hlsRelayUrl='',hlsRelayServer='';
// RAM-only hints: never persist or expose source URLs or playlist credentials.
var provenRelayUrls={},provenRelayHosts={},provenDirectUrls={};
var fastRelayActive=false,fastRelayRecovered=false;

// Verified route profiles, not raw stream URLs or credentials, survive restarts.
var routeMemoryKey='openiptv-tizen-playback-path-v3-hybrid-lab',routeProfiles={};
try{
 var storedRoutes=typeof localStorage!=='undefined'&&localStorage.getItem(routeMemoryKey);
 if(storedRoutes){
  var decoded=JSON.parse(storedRoutes);
  if(decoded&&typeof decoded==='object'&&!Array.isArray(decoded))routeProfiles=decoded;
 }
}catch(e){routeProfiles={};}
function playbackRouteFingerprint(address){
 var text=String(address||''),h=2166136261;
 for(var i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
 return (h>>>0).toString(36)+'-'+text.length.toString(36);
}
function currentPlaybackRoute(){return playbackEngine==='avplay'?'avplay':html5Mode==='hls-relay'?'relay':html5Mode==='hlsjs'?'hlsjs':html5Mode==='dashjs'?'dashjs':html5Mode==='mpegts'?'mpegts':'native';}
function usablePlaybackProfile(p){
 if(!p||['relay','hlsjs','dashjs','mpegts','native','avplay'].indexOf(p.route)<0)return false;
 var now=Date.now();
 return !!p.at&&now-p.at<=10*24*3600*1000&&!(p.blockedUntil&&now<p.blockedUntil);
}
function playbackProfileKey(channel){
 return 'channel:'+playbackRouteFingerprint(String(channel.id||'')+'\n'+String(channel.url||''));
}
function savedPlaybackRoute(channel){
 var source=playbackRouteFingerprint(channel&&channel.url);
 var profile=channel&&routeProfiles[playbackProfileKey(playing&&playing.id===channel.id?playing:channel)];
 if(!profile||profile.source!==source)profile=routeProfiles[source];
 return usablePlaybackProfile(profile)?profile.route:'';
}
function preferVerifiedSource(channel,urls){
 var profile=routeProfiles[playbackProfileKey(channel)];
 if(!usablePlaybackProfile(profile))return urls;
 var index=urls.findIndex(function(address){return playbackRouteFingerprint(address)===profile.source;});
 if(index>0)urls.unshift(urls.splice(index,1)[0]);
 return urls;
}
function savePlaybackProfiles(){
 try{
  if(typeof localStorage==='undefined')return;
  var keys=Object.keys(routeProfiles).sort(function(a,b){return routeProfiles[b].at-routeProfiles[a].at;});
  keys.slice(120).forEach(function(k){delete routeProfiles[k];});
  localStorage.setItem(routeMemoryKey,JSON.stringify(routeProfiles));
 }catch(e){}
}
function markVerifiedPlaybackRoute(){
 var source=playbackStream&&playbackStream.url;if(!source||!playbackEngine)return;
 var key=playbackRouteFingerprint(source),route=currentPlaybackRoute();
 var profile={source:key,route:route,at:Date.now(),blockedUntil:0};
 if(playing)routeProfiles[playbackProfileKey(playing)]=profile;
 // Existing installations may have a verified profile keyed by URL only.
 delete routeProfiles[key];
 savePlaybackProfiles();
 learnPlaybackRoute();
}
function markPlaybackRouteBad(route){
 var source=playbackStream&&playbackStream.url;if(!source)return;
 var key=playbackRouteFingerprint(source),changed=false;
 [routeProfiles[key],playing&&routeProfiles[playbackProfileKey(playing)]].forEach(function(profile){
  if(profile&&(!profile.source||profile.source===key)&&profile.route===route){
   profile.blockedUntil=Date.now()+45*1000;changed=true;
  }
 });
 if(changed)savePlaybackProfiles();
 if(route==='relay'){
  delete provenRelayUrls[source];
  var host=playbackSafeHost(source),hint=host&&provenRelayHosts[host];
  if(hint)hint.blockedAt=Date.now();
 }
 if(route==='native'||route==='hlsjs'||route==='dashjs'||route==='mpegts')delete provenDirectUrls[source];
}
var playbackWatchdogTimer=0,playbackLastProgressAt=0,playbackLastMediaTime=null;
var playbackProgressSeconds=0,playbackStableAt=0,playbackRecoveryAttempts={},playbackRecoveries=0;
var playbackStartedAt=0,playbackFrameProgress=0,playbackRouteVerified=false;
var playbackClockReliable=false,playbackWaitingSince=0,playbackLastDecodedFrames=null;
var playbackHlsSoftRecoveries=0,playbackHlsRecoveryTimer=0;
function clearPlaybackWatchdog(){
 if(playbackWatchdogTimer){clearTimeout(playbackWatchdogTimer);playbackWatchdogTimer=0;}
}
function resetPlaybackProgress(){
 clearPlaybackWatchdog();playbackLastProgressAt=0;playbackLastMediaTime=null;
 playbackProgressSeconds=0;playbackStableAt=0;playbackClockReliable=false;
 playbackStartedAt=0;playbackFrameProgress=0;playbackRouteVerified=false;
 playbackWaitingSince=0;playbackLastDecodedFrames=null;
 if(playbackHlsRecoveryTimer)clearTimeout(playbackHlsRecoveryTimer);
 playbackHlsSoftRecoveries=0;playbackHlsRecoveryTimer=0;
}
function verifyPlaybackProgress(now){
 if(!playbackRouteVerified&&now-playbackStartedAt>=1500&&
    (playbackProgressSeconds>=1.25||playbackFrameProgress>=2)){
  playbackRouteVerified=true;markVerifiedPlaybackRoute();
 }
}
function notePlaybackProgress(token,mediaTime){
 if(!playbackActive(token)||!playbackConfirmed||!isFinite(mediaTime)||mediaTime<0)return;
 var now=Date.now(),time=Number(mediaTime);
 if(playbackLastMediaTime===null){playbackLastMediaTime=time;return;}
 var moved=time-playbackLastMediaTime;
 // Live streams may wrap their PTS. An actual wrap is still new frame progress.
 if(moved>0.12||moved< -2){
  playbackClockReliable=true;
  playbackProgressSeconds+=moved>0?Math.min(moved,2):0.5;
  playbackLastMediaTime=time;playbackLastProgressAt=now;playbackWaitingSince=0;
  verifyPlaybackProgress(now);
  if(playbackProgressSeconds>=5.5&&!playbackStableAt)playbackStableAt=now;
  // Do not reset failure counts after just 5.5s: intermittent 403 streams
  // would otherwise restart the same failed player forever.
  if(playbackStableAt&&now-playbackStableAt>=60000&&playbackRecoveries){
   playbackRecoveryAttempts={};playbackRecoveries=0;playbackStableAt=now;
  }
 }
}

// Recover an HLS hiccup without discarding a healthy image and its decoder.
// A failed recovery still enters the existing bounded fallback chain.
function tryRecoverHlsInPlace(engine,data,token){
 if(!playbackActive(token)||!playbackConfirmed||engine!==hlsInstance)return false;
 if(playbackHlsRecoveryTimer)return true;
 if(playbackHlsSoftRecoveries>=2)return false;
 var code=Number(data&&data.response&&data.response.code||0);
 if(code===401||code===403||code===404)return false;
 var type=String(data&&data.type||'').toLowerCase();
 var detail=String(data&&data.details||'').toLowerCase(),method='';
 if((type.indexOf('media')>=0||detail.indexOf('buffer')>=0)&&
    typeof engine.recoverMediaError==='function')method='recoverMediaError';
 else if((type.indexOf('network')>=0||detail.indexOf('load')>=0)&&
    typeof engine.startLoad==='function')method='startLoad';
 if(!method)return false;
 // Let hls.js finish its fatal error handlers before restarting a bad live
 // playlist refresh. Keep the current buffer and skip an initial seek.
 if(detail==='levelparsingerror'||detail==='levelemptyerror'){
  if(method!=='startLoad')return false;
  playbackHlsSoftRecoveries++;
  playbackHlsRecoveryTimer=setTimeout(function(){
   playbackHlsRecoveryTimer=0;
   if(!playbackActive(token)||engine!==hlsInstance)return;
   try{engine.startLoad(-1,true);}
   catch(e){finishPlaybackError(token,'Không thể tải lại playlist HLS.');}
  },750*playbackHlsSoftRecoveries);
  return true;
 }
 try{
  engine[method]();
  playbackHlsSoftRecoveries++;
  logPlayback('HLS phục hồi tại chỗ: '+method+' ('+playbackHlsSoftRecoveries+'/2)');
  return true;
 }catch(e){return false;}
}

function playbackDecodedFrames(video){
 try{
  if(video&&typeof video.getVideoPlaybackQuality==='function'){
   var q=video.getVideoPlaybackQuality(),n=Number(q&&q.totalVideoFrames);
   if(isFinite(n)&&n>0)return n;
  }
  var webkit=Number(video&&video.webkitDecodedFrameCount);
  if(isFinite(webkit)&&webkit>0)return webkit;
 }catch(e){}
 return null;
}
function playbackWatchdog(token){
 if(!playbackActive(token)||!playbackConfirmed)return;
 var now=Date.now(),shouldRecover=false,reason='';
 if(playbackEngine==='html5'){
  var v=byId('video');
  if(!v.paused&&Number.isFinite(Number(v.currentTime)))
   notePlaybackProgress(token,Number(v.currentTime));
  var frames=playbackDecodedFrames(v);
  if(frames!==null){
   if(playbackLastDecodedFrames!==null&&frames>playbackLastDecodedFrames){
    playbackLastProgressAt=now;playbackWaitingSince=0;playbackClockReliable=true;
    if(!v.paused){playbackFrameProgress++;verifyPlaybackProgress(now);}
   }
   playbackLastDecodedFrames=frames;
  }
  // Tizen can report a fixed currentTime for an actively decoded live HLS
  // stream. Never blank good video solely because that clock stays at zero.
  if(!v.paused){
   var elapsed=now-playbackLastProgressAt;
   if(v.error){shouldRecover=true;reason='HTML5 báo lỗi giải mã';}
   else if(playbackWaitingSince&&now-playbackWaitingSince>18000&&elapsed>18000){
    shouldRecover=true;reason='Luồng đang chờ dữ liệu trên 18 giây';
   }else if(playbackClockReliable&&elapsed>30000){
    shouldRecover=true;reason='Không có khung hình mới trong 30 giây';
   }else if(!playbackClockReliable&&v.readyState<2&&elapsed>25000){
    shouldRecover=true;reason='Không nhận được hình trong 25 giây';
   }
  }
 }else if(playbackEngine==='avplay'){
  // AVPlay's media clock can freeze on older Samsung firmware.
  if(playbackWaitingSince&&now-playbackWaitingSince>22000&&now-playbackLastProgressAt>22000){
   shouldRecover=true;reason='AVPlay đệm quá 22 giây không lên hình';
  }else if(playbackClockReliable&&now-playbackLastProgressAt>30000){
   shouldRecover=true;reason='AVPlay không tiến hình trong 30 giây';
  }
 }
 if(shouldRecover){
  if(recoverStalledPlayback(token,reason))return;
  // Failed recovery is terminal; don't silently leave a dead watchdog running.
  finishPlaybackError(token,reason);return;
 }
 playbackWatchdogTimer=setTimeout(function(){playbackWatchdog(token);},1500);
}
function startPlaybackWatchdog(token){
 resetPlaybackProgress();playbackLastProgressAt=Date.now();
 playbackStartedAt=playbackLastProgressAt;
 playbackWatchdogTimer=setTimeout(function(){playbackWatchdog(token);},1500);
}
/* Unified playback core: four real playback adapters and the HLS relay.
 * HLS.js and dash.js are bundled JS; HTML5 and AVPlay are built into the TV.
 * Only one instance is attached at a time, with a token for stale callbacks.
 * The framework does not bypass DRM, CORS or unavailable hardware codecs. */
var TV_PLAYBACK_CORE={
 version:'0.1.59',
 libraries:{hlsjs:'1.6.15',dashjs:'5.3.0',mpegts:'1.8.2',native:'TV browser',avplay:'Samsung firmware'},
 preferredRoute:function(address){return dashAddress(address)?'dashjs':hlsAddress(address)?'hlsjs':mpegtsAddress(address)?'mpegts':'';},
 engines:{
  hlsjs:{name:'HLS.js',start:function(c,t){playbackEngine='html5';html5Mode='native';return startHlsPlayback(c,t,'bộ phát lõi HLS');}},
  dashjs:{name:'DASH.js',start:function(c,t){playbackEngine='html5';html5Mode='native';return startDashPlayback(c,t);}},
  mpegts:{name:'mpegts.js (MPEG-TS/FLV)',start:function(c,t){playbackEngine='html5';html5Mode='native';return startMpegtsPlayback(c,t);}},
  native:{name:'HTML5',start:function(c,t){startHtml5Playback(c,t);return true;}}
 },
 capabilities:function(){
  return {hlsjs:!!(window.MediaSource||window.ManagedMediaSource),
   dashjs:!!(window.MediaSource||window.ManagedMediaSource),
   mpegts:!!(window.MediaSource||window.ManagedMediaSource),native:!!byId('video'),avplay:!!nativeAvplay()};
 }
};
function launchPlaybackRoute(channel,token,route){
 if(!playbackActive(token)||['hlsjs','dashjs','mpegts','native'].indexOf(route)<0)return false;
 var adapter=TV_PLAYBACK_CORE.engines[route];
 return !!(adapter&&adapter.start(channel,token));
}
function recoverStalledPlayback(token,reason){
 if(!playbackActive(token)||playbackRecoveries>=6)return false;
 var route=currentPlaybackRoute(),count=playbackRecoveryAttempts[route]||0;
 playbackRecoveryAttempts[route]=count+1;playbackRecoveries++;
 // Retry a stale player once with a brand-new relay session, then move to
 // another decoder. No URL mixing and no unbounded reload loop.
 var candidates=mpegtsAddress(playbackStream&&playbackStream.url)?['mpegts','native']:
  dashAddress(playbackStream&&playbackStream.url)?['dashjs','native']:
  route==='native'?['native','hlsjs']:['hlsjs','native'];
 var next=count<(route==='relay'||route==='hlsjs'||route==='dashjs'||route==='mpegts'?2:1)?route:'';
 if(!next){
  markPlaybackRouteBad(route);
  for(var i=0;i<candidates.length;i++){
   var candidate=candidates[i];
   if(candidate==='avplay'&&!nativeAvplay())continue;
   if(!playbackRecoveryAttempts[candidate]){next=candidate;break;}
  }
 }
 if(!next)return false;
 logPlayback('Khôi phục luồng '+(playbackRecoveries)+' · '+String(reason||'').slice(0,85));
 playbackSerial++;var nextToken=playbackSerial,channel=playbackStream||playing;
 stopPlaybackEngine();
 playbackConfirmed=false;playbackFailed=false;hlsAttempted=false;dashAttempted=false;mpegtsAttempted=false;nativeAttempted=false;
 hlsRelayAttempted=false;fastRelayActive=false;fastRelayRecovered=false;nativeReplayUsed=false;
 byId('player').classList.remove('is-playing');
 setPlayerStatus('Đang khôi phục hình ảnh bằng '+next+'…');
 if(!launchPlaybackRoute(channel,nextToken,next)){
  return recoverStalledPlayback(nextToken,'Bộ phát không khả dụng');
 }
 return true;
}
function learnPlaybackRoute(){
 var url=String(playbackStream&&playbackStream.url||'');
 if(!url||playbackEngine!=='html5')return;
 var host=playbackSafeHost(url);
 if(html5Mode==='hls-relay'){
  provenRelayUrls[url]=Date.now();
  delete provenDirectUrls[url];
  if(host&&hlsAddress(url)){
   var hint=provenRelayHosts[host]||(provenRelayHosts[host]={urls:[],at:0,blockedAt:0});
   if(hint.urls.indexOf(url)<0){hint.urls.push(url);if(hint.urls.length>8)hint.urls.shift();}
   hint.at=Date.now();hint.blockedAt=0;
  }
 }else if(html5Mode==='native'||html5Mode==='hlsjs'||html5Mode==='dashjs'||html5Mode==='mpegts'){
  provenDirectUrls[url]=Date.now();delete provenRelayUrls[url];
 }
}
function relayFastStartHint(){return '';}
function recoverFastRelay(){return false;}
var hostedCastAttempted=false,hostedCastSession='',hostedCastToken=0,hostedCastSent=false,hostedCastPlaying=false;
var hostedCastOrigin='https://trisanghy.github.io';
var hostedCastPage=hostedCastOrigin+'/open-iptv-pro/tizen/hosted-player.html?v=20261122c';
function nativeAvplay(){return null;}
function hlsAddress(address){return /\.m3u8?(?:[?#]|$)/i.test(String(address||''));}
function dashAddress(address){return /\.mpd(?:[?#]|$)/i.test(String(address||''));}
function mpegtsAddress(address){return /\.(?:ts|m2ts|mpegts|flv)(?:[?#]|$)/i.test(String(address||''));}
function mpegtsType(address){return /\.flv(?:[?#]|$)/i.test(String(address||''))?'flv':'mse';}
function logPlayback(text){
 var message=String(text||'').replace(/[\r\n\u0000-\u001f]/g,' ')
  .replace(/https?:\/\/[^\s<>"']+/gi,function(value){try{return new URL(value).origin;}catch(e){return '[URL ẩn]';}})
  .replace(/([?&](?:token|key|password|auth|signature|sig)=)[^\s&]+/gi,'$1[ẩn]').slice(0,350);
 if(message&&playbackEvidence.indexOf(message)<0)playbackEvidence.push(message);
 if(playbackEvidence.length>28)playbackEvidence.shift();
 var label=byId('playbackDiag');
 label.textContent=playbackEvidence.map(function(line,i){return (i+1)+'. '+line;}).join('\n');
 label.hidden=true;
}
function playbackChannelKey(channel){
 return String(channel&&channel.name||'').trim().toLowerCase().replace(/\s+/g,' ');
}
function playbackCandidates(channel){
 // Channel names do not identify the same stream across independent playlists.
 // Keep the user's selected URL. Backup URLs must be explicitly attached to
 // this channel, rather than collected from every same-name channel.
 var urls=[];
 function add(value){
  var candidate=String(value||'').trim();
  if(/^https?:\/\/\S+$/i.test(candidate)&&candidate.length<=4096&&
     urls.indexOf(candidate)<0&&urls.length<5)urls.push(candidate);
 }
 add(channel&&channel.url);
 var backups=channel&&(channel.backupUrls||channel.fallbackUrls);
 if(Array.isArray(backups))backups.forEach(add);
 return urls;
}
function playbackSafeHost(address){
 try{
  var parsed=new URL(String(address||''));
  return (parsed.protocol==='https:'||parsed.protocol==='http:')?parsed.hostname.slice(0,100):'';
 }catch(e){return '';}
}
function describeHlsError(data){
 var code=Number(data&&data.response&&data.response.code||0),details=String(data&&data.details||'lỗi mạng');
 var tag=details;
 if(code===401||code===403)tag+=' (HTTP '+code+': máy chủ từ chối)';
 else if(code===404)tag+=' (HTTP 404: nguồn không tồn tại)';
 else if(code>=500&&code<=599)tag+=' (HTTP '+code+': máy chủ lỗi)';
 else if(code>0)tag+=' (HTTP '+code+')';
 else if(/loaderror|loadtimeout/i.test(details))tag+=' (mạng/CORS hoặc kết nối bị chặn)';
 return tag.slice(0,145);
}
function clearPlaybackGrace(){
 if(playbackGraceTimer){clearTimeout(playbackGraceTimer);playbackGraceTimer=0;}
}
 var stageAvailable=stage=>{
  if(stage==='hlsjs')return !!(window.Hls?.isSupported?.());
  if(stage==='dashjs')return !!(window.dashjs?.MediaPlayer);
  if(stage==='native-hls')return !!byId('video').canPlayType?.('application/vnd.apple.mpegurl');
  return true;
 };
 function stagesFor(url){
  const path=new URL(url).pathname.toLowerCase();
  const isHls=/\.m3u8?$/.test(path),isDash=/\.mpd$/.test(path);
  const stages=isHls?['native-hls','hlsjs']:
   isDash?['dashjs','native']:
   /\.(?:mp4|m4v|webm|mp3|aac|m4a|ts)$/.test(path)?['native']:
   ['native','hlsjs','dashjs'];
  // Some Samsung devices advertise native HLS but reject specific channels.
  // Always keep a second engine for HLS where MSE is supported.
  return stages.filter(stageAvailable);
 }

/* Receiver port: preserve the official TV receiver stage ordering and
 * attach/manifest/STREAM_INITIALIZED readiness, adapted to WGT UI sessions.
 * No pairing, iframe, AVPlay or relay; the chosen channel is passed directly. */
var webStageGeneration=0,webStages=[],webStageIndex=-1,webStage='',webEngineReady=false,webPendingGesture=false;
var webFullscreenAttempted=false,webFullscreenActive=false;
function enterWebCinema(video){
 var screen=byId('player');
 if(screen.hidden)return;
 document.body.classList.add('web-tv-cinema');
 // Enter a stable, video-only fullscreen surface synchronously on channel OK.
 // HLS fallback may replace the video node, so fullscreen belongs to its parent.
 if(webFullscreenAttempted)return;
 var active=document.fullscreenElement||document.webkitFullscreenElement;
 if(active===screen){webFullscreenAttempted=true;return;}
 var request=screen.requestFullscreen||screen.webkitRequestFullscreen||screen.webkitRequestFullScreen;
 if(request){
  webFullscreenAttempted=true;
  try{var result=request.call(screen);if(result&&result.catch)result.catch(function(){});}catch(e){}
  return;
 }
 // Older TV video-native fullscreen may require actual decoded frames.
 if(playbackConfirmed&&video){
  webFullscreenAttempted=true;
  try{
   var result;
   if(typeof video.requestFullscreen==='function')result=video.requestFullscreen();
   else if(typeof video.webkitEnterFullscreen==='function')video.webkitEnterFullscreen();
   if(result&&result.catch)result.catch(function(){});
  }catch(e){}
 }
 // CSS fills the viewport even when the browser rejects native fullscreen.
}
function leaveWebCinema(){
 document.body.classList.remove('web-tv-cinema');
 webFullscreenAttempted=false;webFullscreenActive=false;
 try{
  var active=document.fullscreenElement||document.webkitFullscreenElement;
  if(active){
   var exit=document.exitFullscreen||document.webkitExitFullscreen;
   if(exit){var result=exit.call(document);if(result&&result.catch)result.catch(function(){});}
  }else{
   var video=byId('video');
   if(video&&video.webkitDisplayingFullscreen&&video.webkitExitFullscreen)video.webkitExitFullscreen();
  }
 }catch(e){}
}
function onWebFullscreenChange(){
 var active=document.fullscreenElement||document.webkitFullscreenElement;
 if(active){if(byId('player').hidden){leaveWebCinema();return;}webFullscreenActive=true;return;}
 if(webFullscreenActive){webFullscreenActive=false;if(playing&&!byId('player').hidden)closePlayer();}
}
document.addEventListener('fullscreenchange',onWebFullscreenChange);
document.addEventListener('webkitfullscreenchange',onWebFullscreenChange);

function webStageActive(token,attempt,video){
 return playbackActive(token)&&attempt===webStageGeneration&&isActiveHtml5Video(video,token);
}
function webFinalFailure(token,reason){
 if(!playbackActive(token))return;
 clearPlaybackTimer();clearPlaybackGrace();
 if(tryNextChannelSource(token))return;
 playbackFailed=true;playbackConfirmed=false;
 stopPlaybackEngine();
 playbackFailure(token,'Receiver Web HTTPS: '+String(reason||'không hỗ trợ nguồn').slice(0,120));
}
function webStageIssue(token,attempt,video,reason){
 if(!webStageActive(token,attempt,video))return;
 logPlayback(webStage+': '+String(reason||'không hỗ trợ nguồn').slice(0,130));
 if(!playbackConfirmed&&webStageIndex+1<webStages.length){
  webNextStage(token);return;
 }
 webFinalFailure(token,reason);
}
function webPlayReady(token,attempt,video){
 if(!webStageActive(token,attempt,video)||!webEngineReady)return;
 try{
  var result=video.play();
  if(result&&result.catch)result.catch(function(error){
   if(!webStageActive(token,attempt,video)||error&&error.name==='AbortError')return;
   if(error&&error.name==='NotAllowedError'){
    webPendingGesture=true;clearPlaybackTimer();setPlayerStatus('TV chặn tự phát. Nhấn OK để phát.');return;
   }
   webStageIssue(token,attempt,video,error&&error.message||error);
  });
 }catch(error){webStageIssue(token,attempt,video,error&&error.message||error);}
}
function webNextStage(token){
 if(!playbackActive(token))return;
 clearPlaybackTimer();
 var attempt=++webStageGeneration,mode=webStages[++webStageIndex],url=playbackStream.url;
 webStage=mode;webEngineReady=false;webPendingGesture=false;
 if(!mode){webFinalFailure(token,'Không có bộ phát phù hợp');return;}
 playbackEngine='html5';html5Mode=mode==='native-hls'?'native':mode;
 var video=prepareHtml5Video(token);
 video.onplaying=function(){
  if(!webStageActive(token,attempt,video)||video.paused||video.readyState<2)return;
  clearPlaybackTimer();webPendingGesture=false;playbackWaitingSince=0;playbackReady(token);enterWebCinema(video);
 };
 video.ontimeupdate=function(){
  if(webStageActive(token,attempt,video)&&!video.paused&&video.readyState>=2){
   clearPlaybackTimer();playbackReady(token);enterWebCinema(video);notePlaybackProgress(token,Number(video.currentTime));
  }
 };
 video.onerror=function(){
  if(webStageActive(token,attempt,video)&&video.error)webStageIssue(token,attempt,video,'HTML5 '+video.error.code+' · '+String(video.error.message||'nguồn hoặc codec không hỗ trợ'));
 };
 logPlayback('Receiver TV · '+mode);setPlayerStatus('Đang thử '+mode+' cho '+playing.name+'…');
 playbackTimer=setTimeout(function(){
  if(webStageActive(token,attempt,video)&&!playbackConfirmed&&!webPendingGesture)webStageIssue(token,attempt,video,mode+' không nhận dữ liệu sau 18 giây');
 },18000);
 try{
  if(mode==='hlsjs'){
   var engine=new window.Hls({enableWorker:false,lowLatencyMode:false,maxBufferLength:22});
   hlsInstance=engine;
   engine.on(window.Hls.Events.MEDIA_ATTACHED,function(){if(webStageActive(token,attempt,video))engine.loadSource(url);});
   engine.on(window.Hls.Events.MANIFEST_PARSED,function(){if(webStageActive(token,attempt,video)){webEngineReady=true;webPlayReady(token,attempt,video);}});
   engine.on(window.Hls.Events.ERROR,function(_event,data){
    if(!webStageActive(token,attempt,video)||!data||!data.fatal)return;
    var detail=String(data.details||data.type||'HLS không phát được'),code=Number(data.response&&data.response.code||0);
    webStageIssue(token,attempt,video,detail+(code?' HTTP '+code:'; có thể là CORS/mạng'));
   });
   engine.attachMedia(video);return;
  }
  if(mode==='dashjs'){
   var factory=window.dashjs.MediaPlayer,engine=factory().create();dashInstance=engine;
   var events=factory.events||{};
   engine.on(events.STREAM_INITIALIZED||'streamInitialized',function(){
    if(webStageActive(token,attempt,video)){webEngineReady=true;webPlayReady(token,attempt,video);}
   });
   engine.on(events.ERROR||'error',function(data){if(webStageActive(token,attempt,video))webStageIssue(token,attempt,video,'DASH: '+String(data&&data.error&&data.error.message||'không phát được'));});
   engine.initialize(video,url,false);return;
  }
  video.src=url;webEngineReady=true;webPlayReady(token,attempt,video);
 }catch(error){webStageIssue(token,attempt,video,error&&error.message||error);}
}
function startPlaybackStream(channel,token){
 playbackStream=channel;
 webStageGeneration++;webStages=[];webStageIndex=-1;webEngineReady=false;webPendingGesture=false;
 logPlayback('Receiver TV · origin '+String(location.origin||location.protocol));
 if(location.protocol!=='https:'){webFinalFailure(token,'Trang này yêu cầu HTTPS');return;}
 var url;
 try{url=new URL(channel.url);}catch(e){webFinalFailure(token,'URL không hợp lệ');return;}
 if(url.protocol!=='https:'&&url.protocol!=='http:'){webFinalFailure(token,'URL không hợp lệ');return;}
 if(url.protocol==='http:'&&location.protocol==='https:'){webFinalFailure(token,'Nguồn HTTP bị giới hạn trên trang HTTPS. Chọn nguồn HTTPS.');return;}
 // Old OTA/cached app manifests may still run on localhost; never assume globals.
 var generation=webStageGeneration,path=url.pathname.toLowerCase();
 var jobs=[];
 if(!/\.(?:mp4|m4v|webm|mp3|aac|m4a|ts|mpd)$/.test(path))jobs.push(loadHlsLibrary().then(function(){logPlayback('HLS.js đã tải');},function(){logPlayback('Không tải được HLS.js');}));
 if(!/\.(?:mp4|m4v|webm|mp3|aac|m4a|ts|m3u8?)$/.test(path))jobs.push(loadDashLibrary().then(function(){logPlayback('DASH.js đã tải');},function(){logPlayback('Không tải được DASH.js');}));
 setPlayerStatus('Đang chuẩn bị trình phát Web…');
 Promise.all(jobs).then(function(){
  if(!playbackActive(token)||generation!==webStageGeneration)return;
  logPlayback('Khả năng: HLS.js '+(stageAvailable('hlsjs')?'có':'không')+' · DASH '+(stageAvailable('dashjs')?'có':'không'));
  webStages=stagesFor(url.href);
  if(!webStages.length){webFinalFailure(token,'TV không có bộ phát phù hợp');return;}
  webNextStage(token);
 });
}
function tryNextChannelSource(token){
 if(!playbackActive(token)||playbackConfirmed)return false;
 if(playbackStreamIndex+1>=playbackStreamUrls.length)return false;
 playbackStreamIndex++;
 playbackSerial++;
 var nextToken=playbackSerial,original=playing,urlValue=playbackStreamUrls[playbackStreamIndex];
 stopPlaybackEngine();
 if(!original||byId('player').hidden)return false;
 playbackFailed=false;playbackConfirmed=false;hlsAttempted=false;dashAttempted=false;nativeAttempted=false;nativeReplayUsed=false;hostedCastAttempted=false;hlsRelayAttempted=false;hlsRelayUrl='';fastRelayActive=false;fastRelayRecovered=false;
 playbackRecoveryAttempts={};playbackRecoveries=0;resetPreferredDecoderAttempts();
 playbackEvidence=[];
 byId('playbackDiag').hidden=true;byId('playbackDiag').textContent='';
 setPlayerStatus('Đang thử URL dự phòng được gắn với kênh '+(playbackStreamIndex+1)+' / '+playbackStreamUrls.length+'…');
 startPlaybackStream(Object.assign({},original,{url:urlValue}),nextToken);
 return true;
}
/* Isolated HTTPS playback origin: the Samsung Browser Cast page succeeds on
 * sources that fail inside TizenBrew's trang cũ WebView origin.
 * Keep playlist URLs in memory; postMessage to our exact GitHub Pages origin.
 * The existing Tizen controls stay outside the iframe. */
function castFrame(){
 try{return byId('castPlayerFrame')||null;}catch(e){return null;}
}
function hostedCastSend(type){
 var frame=castFrame();
 if(!frame||!frame.contentWindow||!hostedCastSession)return false;
 try{
  var data={app:'openiptv-tizen-hosted',type:type,session:hostedCastSession};
  if(type==='play'){
   data.url=String(playbackStream&&playbackStream.url||'');
   data.name=String(playing&&playing.name||'');
  }
  frame.contentWindow.postMessage(data,hostedCastOrigin);
  return true;
 }catch(e){return false;}
}
function hostedCastPlayRequest(){
 if(playbackEngine!=='hosted-cast'||hostedCastSent||!playbackActive(hostedCastToken))return;
 if(hostedCastSend('play'))hostedCastSent=true;
}
function startHostedCastPlayback(channel,token){
 if(hostedCastAttempted||!playbackActive(token)||!channel||!/^https:\/\//i.test(channel.url))return false;
 var frame=castFrame();
 if(!frame)return false;
 hostedCastAttempted=true;
 stopPlaybackEngine();
 playbackFailed=false;playbackConfirmed=false;
 playbackEngine='hosted-cast';
 hostedCastToken=token;
 hostedCastSession='cast-'+token+'-'+Date.now();
 hostedCastSent=false;hostedCastPlaying=false;
 byId('video').hidden=true;byId('avplayObject').hidden=true;
 frame.hidden=false;
 frame.onload=hostedCastPlayRequest;
 frame.src=hostedCastPage;
 setPlayerStatus('Đang thử cùng bộ phát HTTPS/HLS/DASH với trang Cast Samsung Browser…');
 logPlayback('Đang thử nguồn gốc HTTPS của trang Cast');
 playbackTimer=setTimeout(function(){
  if(playbackActive(token)&&playbackEngine==='hosted-cast'&&!playbackConfirmed)
   finishPlaybackError(token,'Bộ phát Cast HTTPS quá thời gian chờ');
 },27000);
 return true;
}
function onHostedCastMessage(event){
 var frame=castFrame();
 if(!frame||!frame.contentWindow||event.origin!==hostedCastOrigin||event.source!==frame.contentWindow)return;
 if(playbackEngine!=='hosted-cast'||!playbackActive(hostedCastToken))return;
 var data=event.data;
 if(!data||data.app!=='openiptv-tizen-hosted')return;
 if(data.type==='ready'){hostedCastPlayRequest();return;}
 if(data.session!==hostedCastSession)return;
 if(data.type==='playing'){
  hostedCastPlaying=true;playbackReady(hostedCastToken);
 }else if(data.type==='paused'){
  hostedCastPlaying=false;byId('player').classList.remove('is-playing');
 }else if(data.type==='buffering'){
  if(!playbackConfirmed)setPlayerStatus('Bộ phát Cast đang tải dữ liệu…');
 }else if(data.type==='blocked'){
  setPlayerStatus('TV yêu cầu nhấn OK để bắt đầu phát Cast.');
 }else if(data.type==='error'){
  logPlayback('Cast HTTPS: '+String(data.detail||'không phát được').slice(0,110));
  finishPlaybackError(hostedCastToken,'Cast HTTPS: '+String(data.detail||'không phát được').slice(0,100));
 }
}
if(window&&typeof window.addEventListener==='function')window.addEventListener('message',onHostedCastMessage,false);
function finishPlaybackError(token,message){
 if(!playbackActive(token)||playbackFailed)return;
 if(playbackConfirmed){
  if(recoverStalledPlayback(token,message))return;
  playbackConfirmed=false;
 }
 if(playbackRecoveries>0&&recoverStalledPlayback(token,message))return;
 if(recoverFastRelay(token,message))return;
 if(!nativeAttempted&&playbackEngine==='html5'&&html5Mode!=='native'){
  // HLS.js/DASH.js and local HLS relay take priority, then AVPlay, then HTML5.
  // Never leave a failed MediaSource attached while trying another decoder.
  var failedChannel=playbackStream||playing,failedRoute=currentPlaybackRoute();
  markPlaybackRouteBad(failedRoute);
  stopPlaybackEngine();
  if(!playbackActive(token))return;
  setPlayerStatus('Bộ phát '+failedRoute+' không hỗ trợ nguồn, đang thử HTML5…');
  startHtml5Playback(failedChannel,token);
  return;
 }
 playbackFailed=true;
 var video=byId('video');
 var code=video&&video.error&&video.error.code||0;
 logPlayback('Lỗi '+(code?('HTML5 '+code+' '):'')+String(message||'').slice(0,105));
 var hasAlternate=playbackStreamIndex+1<playbackStreamUrls.length;
 if(hasAlternate)setPlayerStatus('Nguồn này không phát được. Đang chuẩn bị nguồn dự phòng…');
 else setPlayerStatus('Đang xác minh lỗi phát; TV có thể vẫn đang kết nối…');
 clearPlaybackGrace();
 playbackGraceTimer=setTimeout(function(){
  playbackGraceTimer=0;
  if(!playbackActive(token)||playbackConfirmed)return;
  if(playbackEngine==='html5'||playbackEngine==='avplay')markPlaybackRouteBad(currentPlaybackRoute());
  // Do not auto-open the experimental hosted HTTPS iframe. It is not
  // the 6-digit paired Cast receiver and is known to repeat manifestLoadError.
  if(tryNextChannelSource(token))return;
  var tip='Bộ phát Web trực tiếp. ';
  var last=playbackEvidence.length?playbackEvidence[playbackEvidence.length-1]:'nguồn không phát được';
  playbackFailure(token,tip+last+' · Kiểm tra nguồn, codec, CORS hoặc HTTP.');
 },2400);
}

function playbackActive(token){return token===playbackSerial&&!byId('player').hidden;}
function clearPlaybackTimer(){if(playbackTimer)clearTimeout(playbackTimer);playbackTimer=0;}
function stopPlaybackEngine(){
 webStageGeneration++;webEngineReady=false;webPendingGesture=false;
 clearPlaybackTimer();clearPlaybackGrace();resetPlaybackProgress();
 var engine=playbackEngine;playbackEngine='';
 var hostedFrame=castFrame();
 if(hostedFrame){
  hostedFrame.onload=null;hostedFrame.hidden=true;
  if(hostedFrame.getAttribute&&hostedFrame.getAttribute('src')){
   try{hostedFrame.src='about:blank';}catch(e){}
  }
 }
 hostedCastSession='';hostedCastSent=false;hostedCastPlaying=false;
 resetHtml5Video();
 html5Mode='';
 if(avplayInstance){
  var av=avplayInstance;avplayInstance=null;
  try{var st=av.getState&&av.getState();if(st&&st!=='NONE'&&st!=='IDLE')av.stop();}catch(e){}
  try{av.close();}catch(e){}
 }
 byId('player').classList.remove('is-tuning-video');
 byId('avplayObject').hidden=true;
}
function isActiveHtml5Video(video,token){
 return playbackActive(token)&&playbackEngine==='html5'&&html5Video===video;
}
function cancelVideoReveal(video){
 if(videoRevealTimer)clearTimeout(videoRevealTimer);
 videoRevealTimer=0;
 if(videoFrameCallback!==null&&typeof video.cancelVideoFrameCallback==='function')
  video.cancelVideoFrameCallback(videoFrameCallback);
 videoFrameCallback=null;
}
function resetHtml5Video(){
 var video=html5Video,engine=hlsInstance,dash=dashInstance,transmux=mpegtsInstance;
 // Invalidate callbacks before detaching the old MediaSource or pausing.
 html5Video=null;hlsInstance=null;dashInstance=null;mpegtsInstance=null;
 if(video){
  cancelVideoReveal(video);
  video.onplaying=video.ontimeupdate=video.onpause=video.onwaiting=video.onstalled=video.onerror=null;
 }
 if(engine){try{engine.destroy();}catch(e){}}
 if(dash){try{dash.reset();}catch(e){try{dash.destroy();}catch(ignore){}}}
 if(transmux){try{transmux.pause();}catch(e){}try{transmux.unload();}catch(e){}try{transmux.detachMediaElement();}catch(e){}try{transmux.destroy();}catch(e){}}
 if(!video)return;
 try{video.pause();video.removeAttribute('src');video.load();}catch(e){}
 // A different media element cannot deliver queued events from the old URL.
 if(video.parentNode){
  if(document.activeElement===video)byId('player').focus();
  video.parentNode.replaceChild(video.cloneNode(false),video);
 }
}
function revealHtml5Video(video,token){
 if(playbackConfirmed){playbackReady(token);return;}
 if(videoRevealTimer)return;
 function reveal(){
  if(!isActiveHtml5Video(video,token))return;
  cancelVideoReveal(video);
  if(!video.paused&&!video.seeking&&video.readyState>=2)playbackReady(token);
 }
 // Older Samsung WebViews have no frame callback. Give their decoder a
 // short settling window, also covering audio-only streams on newer TVs.
 var canObserveFrames=typeof video.requestVideoFrameCallback==='function'&&video.videoWidth>0;
 videoRevealTimer=setTimeout(reveal,canObserveFrames?450:220);
 if(canObserveFrames){
  videoFrameCallback=video.requestVideoFrameCallback(function(){
   if(!isActiveHtml5Video(video,token))return;
   videoFrameCallback=video.requestVideoFrameCallback(reveal);
  });
 }
}
function prepareHtml5Video(token){
 byId('player').classList.add('is-tuning-video');
 preferredDecoderEpoch++;
 resetHtml5Video();
 var video=byId('video');
 html5Video=video;video.hidden=false;
 byId('avplayObject').hidden=true;
 video.onplaying=function(){
  if(!isActiveHtml5Video(video,token)||video.paused||video.readyState<2)return;
  playbackWaitingSince=0;revealHtml5Video(video,token);
 };
 video.ontimeupdate=function(){
  if(!isActiveHtml5Video(video,token)||video.paused||video.readyState<2)return;
  revealHtml5Video(video,token);notePlaybackProgress(token,Number(video.currentTime));
 };
 video.onpause=function(){
  if(!isActiveHtml5Video(video,token)||!video.paused)return;
  if(!playbackConfirmed)cancelVideoReveal(video);
 };
 video.onwaiting=function(){
  if(!isActiveHtml5Video(video,token))return;
  if(!playbackConfirmed)cancelVideoReveal(video);
  if(!playbackWaitingSince)playbackWaitingSince=Date.now();
 };
 video.onstalled=function(){
  if(!isActiveHtml5Video(video,token))return;
  if(!playbackConfirmed)cancelVideoReveal(video);
  if(!playbackWaitingSince)playbackWaitingSince=Date.now();
 };
 video.onerror=function(){
  if(isActiveHtml5Video(video,token)&&video.error)
   handleHtml5Error(token,'HTML5 không giải mã được nguồn (codec/HTTPS).');
 };
 return video;
}
function playbackReady(token){
 if(!playbackActive(token))return;
 if(playbackConfirmed&&!playbackFailed&&byId('player').classList.contains('is-playing')&&byId('playerStatus').hidden)return;
 var browserButton=byId('browserFallback');
 if(document.activeElement===browserButton&&byId('player').focus)byId('player').focus();
 browserButton.hidden=true;
 var firstFrame=!playbackConfirmed;
 playbackConfirmed=true;playbackFailed=false;
 if(firstFrame)resetPreferredDecoderAttempts();
 clearPlaybackTimer();clearPlaybackGrace();
 byId('player').classList.remove('is-tuning-video');
 byId('player').classList.remove('is-playback-error');
 byId('player').classList.add('is-playing');setPlayerStatus('');
 byId('playbackDiag').hidden=true;
 // Receiver TV uses actual media events; no legacy Tizen decoder watchdog.
}
function playbackFailure(token,message){
 if(!playbackActive(token))return;
 // Keep technical evidence in console, not a full-screen error UI.
 var name=playing&&playing.name||'kênh';
 var detail=String(message||'không hỗ trợ nguồn').replace(/https?:\/\/[^\s<>"']+/gi,function(value){try{return new URL(value).origin;}catch(e){return '[URL ẩn]';}}).slice(0,160);
 try{console.warn('Web Lab: '+detail,playbackEvidence.slice());}catch(e){}
 closePlayer();
 notify('Không phát được '+name+'. Kiểm tra nguồn hoặc thử kênh khác.');
}
function fallbackFromAvplay(channel,token,message){
 if(!playbackActive(token)||playbackEngine!=='avplay')return;
 logPlayback('AVPlay: '+String(message||'lỗi luồng').slice(0,90));
 if(playbackConfirmed){finishPlaybackError(token,message);return;}
 markPlaybackRouteBad('avplay');
 stopPlaybackEngine();
 if(!playbackActive(token))return;
 setPlayerStatus('AVPlay không mở được ('+String(message||'lỗi luồng').slice(0,85)+'). Đang thử bộ phát dự phòng…');
 startHtml5Playback(channel,token);
}
function nativeHtml5Play(video,token){
 if(!isActiveHtml5Video(video,token))return;
 try{
  var result=video.play();
  if(result&&typeof result.catch==='function')result.catch(function(err){
   if(!isActiveHtml5Video(video,token))return;
   var name=String(err&&err.name||'');
   if(name==='AbortError')return; // Pause and source changes can cancel play().
   if(name==='NotAllowedError')setPlayerStatus('Nhấn OK để bắt đầu phát kênh.');
   else handleHtml5Error(token,'HTML5: '+String(err&&err.message||name||'không hỗ trợ').slice(0,100));
  });
 }catch(err){handleHtml5Error(token,'HTML5: '+String(err&&err.message||err));}
}
function loadHlsLibrary(){
 if(window.Hls)return Promise.resolve(window.Hls);
 if(hlsLibraryPromise)return hlsLibraryPromise;
 hlsLibraryPromise=new Promise(function(resolve,reject){
  // The first URL is bundled into both WGT archives; remote TizenBrew pages
  // can fall back to the identical Web asset hosted on GitHub Pages.
  var urls=['./hls.min.js'];
  function next(){
   if(window.Hls){resolve(window.Hls);return;}
   if(!urls.length){reject(Error('Không tải được HLS.js'));return;}
   var script=document.createElement('script'),finished=false;
   var timeout=setTimeout(function(){done(false);},7000);
   function done(ok){
    if(finished)return;finished=true;clearTimeout(timeout);
    if(ok&&window.Hls)resolve(window.Hls);
    else {if(script.parentNode)script.parentNode.removeChild(script);next();}
   }
   script.src=urls.shift();script.async=true;
   script.onload=function(){done(true);};script.onerror=function(){done(false);};
   document.head.appendChild(script);
  }
  next();
 }).catch(function(e){hlsLibraryPromise=null;throw e;});
 return hlsLibraryPromise;
}

/* DASH.js bundle is the same SHA as web/online:dash.all.min.js.
 * Lazy-load the local WGT file on the first .mpd channel; avoid startup RAM use. */
function loadDashLibrary(){
 if(window.dashjs&&window.dashjs.MediaPlayer)return Promise.resolve(window.dashjs);
 if(dashLibraryPromise)return dashLibraryPromise;
 dashLibraryPromise=new Promise(function(resolve,reject){
  var urls=['./dash.all.min.js'];
  function next(){
   if(window.dashjs&&window.dashjs.MediaPlayer){resolve(window.dashjs);return;}
   if(!urls.length){reject(Error('Không tải được DASH.js đã đóng gói'));return;}
   var script=document.createElement('script'),settled=false;
   var limit=setTimeout(function(){done(false);},7000);
   function done(ok){
    if(settled)return;settled=true;clearTimeout(limit);
    if(ok&&window.dashjs&&window.dashjs.MediaPlayer)resolve(window.dashjs);
    else{if(script.parentNode)script.parentNode.removeChild(script);next();}
   }
   script.async=true;script.src=urls.shift();
   script.onload=function(){done(true);};script.onerror=function(){done(false);};
   document.head.appendChild(script);
  }
  next();
 }).catch(function(e){dashLibraryPromise=null;throw e;});
 return dashLibraryPromise;
}
function startDashPlayback(channel,token){
 if(!playbackActive(token)||dashAttempted||preferredDecoderAttempts.dashjs>=PREFERRED_DASH_MAX)return false;
 dashAttempted=true;preferredDecoderAttempts.dashjs++;playbackEngine='html5';html5Mode='dashjs';
 clearPlaybackTimer();
 var video=prepareHtml5Video(token),attempt=preferredDecoderEpoch;
 function active(){return isActiveHtml5Video(video,token)&&html5Mode==='dashjs'&&attempt===preferredDecoderEpoch;}
 function fallback(reason){
  if(!active())return;
  logPlayback('DASH.js: '+String(reason||'không hỗ trợ').slice(0,95));
  if(playbackConfirmed&&recoverStalledPlayback(token,reason))return;
  var permanent=/không hỗ trợ MediaSource|không khả dụng|không có MediaPlayer/i.test(String(reason||''));
  if(retryPreferredDecoder(channel,token,'dashjs',reason,!permanent))return;
  finishPlaybackError(token,'DASH.js: '+reason);
 }
 setPlayerStatus('Ưu tiên '+preferredRetryStatus('dashjs')+' · phát trực tiếp qua Web…');
 playbackTimer=setTimeout(function(){if(active()&&!playbackConfirmed)fallback('quá thời gian chờ 12 giây');},12000);
 loadDashLibrary().then(function(lib){
  if(!active())return;
  if(typeof window.MediaSource==='undefined'){fallback('TV không hỗ trợ MediaSource');return;}
  var factory=lib&&lib.MediaPlayer,instance;
  try{
   if(typeof factory!=='function')throw Error('DASH.js không có MediaPlayer');
   instance=factory().create();
   if(!instance||typeof instance.initialize!=='function')throw Error('DASH.js không khởi tạo được');
   dashInstance=instance;
   // Never introduce DRM bypass, licence keys or unrestricted retries.
   var events=factory.events||{},errorEvent=events.ERROR||'error';
   instance.on(errorEvent,function(event){
    if(!active()||instance!==dashInstance)return;
    var reason=event&&event.error;
    if(!reason)return;
    var code=typeof reason==='object'?reason.code||reason.message||'DASH không đọc được manifest/segment':reason;
    fallback(String(code).slice(0,90));
   });
   instance.initialize(video,channel.url,true);
  }catch(e){
   fallback(String(e&&e.message||e));
  }
 }).catch(function(e){fallback('Thư viện DASH không khả dụng: '+String(e&&e.message||e).slice(0,80));});
 return true;
}


/* Apache-2.0 mpegts.js: transmux HTTP MPEG-TS and FLV to MSE/fMP4.
 * A compiled 1.8.2 build is vendored into the WGT during Actions builds.
 * HTML5 and AVPlay are TV system APIs, not distributable codec binaries. */
function loadMpegtsLibrary(){
 if(window.mpegts&&typeof window.mpegts.createPlayer==='function')return Promise.resolve(window.mpegts);
 if(mpegtsLibraryPromise)return mpegtsLibraryPromise;
 mpegtsLibraryPromise=new Promise(function(resolve,reject){
  var urls=['mpegts.min.js',
   'https://cdn.jsdelivr.net/npm/mpegts.js@1.8.2/dist/mpegts.min.js',
   'https://raw.githubusercontent.com/trisanghy/open-iptv-pro/tizen-hybrid-experiment/mpegts.min.js'];
  function next(){
   if(window.mpegts&&typeof window.mpegts.createPlayer==='function'){resolve(window.mpegts);return;}
   if(!urls.length){reject(Error('Không tải được thư viện MPEG-TS'));return;}
   var script=document.createElement('script'),finished=false;
   var timer=setTimeout(function(){done(false);},6500);
   function done(ok){
    if(finished)return;finished=true;clearTimeout(timer);
    if(ok&&window.mpegts&&typeof window.mpegts.createPlayer==='function')resolve(window.mpegts);
    else{if(script.parentNode)script.parentNode.removeChild(script);next();}
   }
   script.async=true;script.src=urls.shift();script.onload=function(){done(true);};script.onerror=function(){done(false);};
   document.head.appendChild(script);
  }
  next();
 }).catch(function(error){mpegtsLibraryPromise=null;throw error;});
 return mpegtsLibraryPromise;
}
function startMpegtsPlayback(channel,token){
 if(!playbackActive(token)||mpegtsAttempted)return false;
 mpegtsAttempted=true;playbackEngine='html5';html5Mode='mpegts';
 clearPlaybackTimer();
 var video=prepareHtml5Video(token);
 function active(){return isActiveHtml5Video(video,token)&&html5Mode==='mpegts';}
 function fallback(error){
  if(!active())return;
  logPlayback('MPEG-TS: '+String(error||'').slice(0,90));
  if(playbackConfirmed&&recoverStalledPlayback(token,error))return;
  finishPlaybackError(token,'MPEG-TS: '+error);
 }
 setPlayerStatus('Đang thử mpegts.js (MPEG-TS/FLV) trong lõi ứng dụng…');
 playbackTimer=setTimeout(function(){if(active()&&!playbackConfirmed)fallback('quá thời gian chờ 13 giây');},13000);
 loadMpegtsLibrary().then(function(lib){
  if(!active())return;
  if(typeof lib.isSupported==='function'&&!lib.isSupported()){fallback('MediaSource/codec TV không hỗ trợ');return;}
  if(!window.MediaSource&&!window.ManagedMediaSource){fallback('TV không hỗ trợ MediaSource');return;}
  try{
   var player=lib.createPlayer({type:mpegtsType(channel.url),url:channel.url,isLive:true},
    {enableWorker:false,enableStashBuffer:false,lazyLoad:false,autoCleanupSourceBuffer:true});
   if(!player||typeof player.attachMediaElement!=='function')throw Error('Không khởi tạo được bộ MPEG-TS');
   mpegtsInstance=player;
   if(lib.Events&&lib.Events.ERROR)player.on(lib.Events.ERROR,function(type,detail,info){
    if(!active()||player!==mpegtsInstance)return;
    fallback(String(detail||type||info&&info.msg||'MPEG-TS lỗi').slice(0,100));
   });
   player.attachMediaElement(video);player.load();
   var playResult=player.play();
   if(playResult&&typeof playResult.catch==='function')playResult.catch(function(e){fallback(String(e&&e.message||e));});
  }catch(e){fallback(String(e&&e.message||e));}
 }).catch(function(e){fallback('Không tải được mpegts.js: '+String(e&&e.message||e).slice(0,90));});
 return true;
}

function retryNativeHls(channel,token){
 if(!playbackActive(token)||nativeReplayUsed||playbackEngine!=='html5')return false;
 nativeReplayUsed=true;
 nativeAttempted=true;
 html5Mode='native';
 clearPlaybackTimer();
 var video=prepareHtml5Video(token);
 logPlayback('Đang thử lại HLS trực tiếp của TV');
 setPlayerStatus('Đang thử bộ phát HLS gốc của Samsung lần cuối…');
 try{
  video.src=channel.url;
  playbackTimer=setTimeout(function(){
   if(playbackActive(token)&&!playbackConfirmed)finishPlaybackError(token,'HLS gốc quá thời gian chờ.');
  },14000);
  nativeHtml5Play(video,token);
  return true;
 }catch(e){finishPlaybackError(token,String(e&&e.message||e));return true;}
}
/*
 * An AVPlay-less TizenBrew web module can still play HLS by fetching it
 * through the optional TV-local TizenBrew Node service. It avoids browser
 * CORS without forwarding private M3U8 URLs to any external relay.
 * Activated only after direct HLS.js fails to fetch its manifest.
 */
var hlsRelayServiceLastLaunch=0;
var relayReadyUntil=0,relayDownUntil=0,relayDownReason='',relayProbePromise=null;
var relayStartState='chưa gọi',relayHealthState='chưa kiểm tra';
// Known immutable source on our own tizenbrew branch. Different service
// registry key lets TizenBrew recover from a stale branch-name VM.
var relayPinnedName='gh/trisanghy/open-iptv-pro@d53667ee24af8a247f04bad60827aa491c93be81';
var relayPinnedTried=false,relayRegistryState='chưa nhận phản hồi';
function tizenModuleContext(){return false;}
function serviceFullName(){return '';}
function relayOfflineError(message){
 var err=Error(message);err.relayOffline=true;return err;
}
function ensureTizenHlsRelayService(){return false;}
function requestLocalHlsSession(){return Promise.reject(Error('Web Lab không dùng relay'));}
function loadRelayDiagnostics(){}

function startRelayHlsPlayback(channel,token){return false;}
function startHlsPlayback(channel,token,why){
 if(!playbackActive(token)||playbackEngine!=='html5'||hlsAttempted||
    preferredDecoderAttempts.hlsjs>=PREFERRED_HLS_DIRECT_MAX)return false;
 hlsAttempted=true;preferredDecoderAttempts.hlsjs++;html5Mode='hlsjs';
 logPlayback('Đang thử HLS.js'+(why?' sau lỗi HTML5':''));
 setPlayerStatus('Ưu tiên '+preferredRetryStatus('hlsjs')+' · phát trực tiếp qua Web…');
 clearPlaybackTimer();
 var video=prepareHtml5Video(token),attempt=preferredDecoderEpoch;
 function active(){return isActiveHtml5Video(video,token)&&html5Mode==='hlsjs'&&attempt===preferredDecoderEpoch;}
 playbackTimer=setTimeout(function(){
  if(!active()||playbackConfirmed)return;
  if(retryPreferredDecoder(channel,token,'hlsjs','quá thời gian chờ',true))return;
  finishPlaybackError(token,'HLS.js quá thời gian chờ.');
 },11000);
 loadHlsLibrary().then(function(Hls){
  if(!active())return;
  var supported=false;
  try{supported=!!Hls&&!!Hls.isSupported&&Hls.isSupported();}catch(e){}
  if(!supported){
   logPlayback('HLS.js không hỗ trợ MediaSource trên TV này');
   finishPlaybackError(token,'HLS cần MediaSource hoặc HTML5 tương thích.');
   return;
  }
  try{
   var engine=new Hls({enableWorker:false,lowLatencyMode:false,maxBufferLength:15});
   hlsInstance=engine;
   engine.on(Hls.Events.MANIFEST_PARSED,function(){
    if(active()&&engine===hlsInstance)nativeHtml5Play(video,token);
   });
   engine.on(Hls.Events.ERROR,function(event,data){
    if(!active()||engine!==hlsInstance||!data||!data.fatal)return;
    var cause=describeHlsError(data);
    logPlayback('HLS.js '+cause);
    if(tryRecoverHlsInPlace(engine,data,token))return;
    var videoElement=byId('video');
    if(playbackConfirmed){
     if(recoverStalledPlayback(token,'HLS.js: '+cause))return;
    }
    // A 403 can be a genuine access denial; manifestLoadError with code 0
    // can also mean CORS. Retry exactly the selected URL on the TV's local
    // Node service, never silently choose another same-name channel.
    var manifestIssue=/manifestLoadError|manifestLoadTimeout|levelLoadError|levelLoadTimeout/i.test(String(data.details||''));
    var permanentCode=Number(data.response&&data.response.code||0);
    // On CORS/manifest problems try local HLS.js relay without repeating
    // an identical denied direct request. Other transient errors get 3 direct rounds.
    if(retryPreferredDecoder(channel,token,'hlsjs',cause,!manifestIssue&&![401,403,404].includes(permanentCode)))return;
    if(!playbackConfirmed)markPlaybackRouteBad('hlsjs');
    if(/manifestLoadError|manifestLoadTimeout/i.test(String(data.details||''))&&!nativeReplayUsed){
     var supportsNative=false;
     try{supportsNative=!!videoElement.canPlayType('application/vnd.apple.mpegurl');}catch(e){}
     if(supportsNative&&retryNativeHls(channel,token))return;
    }
    finishPlaybackError(token,'HLS.js '+cause);
   });
   engine.attachMedia(video);
   engine.loadSource(channel.url);
  }catch(e){
   logPlayback('HLS.js '+String(e&&e.message||e).slice(0,85));
   if(retryPreferredDecoder(channel,token,'hlsjs','lỗi khởi tạo',true))return;
   finishPlaybackError(token,'Không khởi động được HLS.js.');
  }
 }).catch(function(e){
  if(!active())return;
  logPlayback('Không tải được HLS.js: '+String(e&&e.message||e).slice(0,75));
  finishPlaybackError(token,'Bộ phát HLS.js không tải được.');
 });
 return true;
}
function handleHtml5Error(token,reason){
 if(!playbackActive(token)||playbackFailed||playbackEngine!=='html5')return;
 if(playbackConfirmed&&recoverStalledPlayback(token,reason))return;
 if(html5Mode==='native'&&!hlsAttempted&&!dashAddress(playbackStream&&playbackStream.url)){
  if(!playbackConfirmed)markPlaybackRouteBad('native');
  logPlayback(String(reason||'HTML5 không hỗ trợ').slice(0,100));
  if(startHlsPlayback(playbackStream||playing,token,true))return;
 }
 finishPlaybackError(token,reason);
}
function startHtml5Playback(channel,token){
 if(!playbackActive(token))return;
 playbackEngine='html5';html5Mode='native';nativeAttempted=true;
 clearPlaybackTimer();
 var video=prepareHtml5Video(token);
 // Fetch HLS.js during native probing to avoid another network wait on failure.
 if(hlsAddress(channel.url)&&!window.Hls)loadHlsLibrary().catch(function(){});
 setPlayerStatus('Đang thử HTML5'+(hlsAddress(channel.url)?'/HLS.js':'')+'…');
 playbackTimer=setTimeout(function(){
  if(isActiveHtml5Video(video,token)&&!playbackConfirmed)
   handleHtml5Error(token,'HTML5 quá thời gian chờ.');
 },22000);
 var nativeHls=false;
 try{nativeHls=!!video.canPlayType&&!!video.canPlayType('application/vnd.apple.mpegurl');}catch(e){}
 logPlayback('HTML5 native HLS: '+(nativeHls?'có':'không'));
 // Luôn thử bộ giải mã native của Samsung trước. Một số firmware Tizen
 // trả canPlayType(HLS) rỗng dù video element vẫn phát HLS trực tiếp được.
 // Chỉ chuyển sang HLS.js sau khi native phát lỗi/thời gian chờ.
 if(dashAddress(channel.url)){
  logPlayback('MPEG-DASH cần bộ phát DASH tương thích');
 }
 video.src=channel.url;
 nativeHtml5Play(video,token);
}
function startAvplay(channel,token){return false;}
function play(c){
 if(!c)return;
 var continuing=!byId('player').hidden;
 if(!continuing){leaveWebCinema();}
 if(typeof stopHomePreview==='function')stopHomePreview();
 byId('browserFallback').hidden=true;
 playbackSerial++;var token=playbackSerial;stopPlaybackEngine();playing=c;
 dashAttempted=false;hlsAttempted=false;mpegtsAttempted=false;nativeAttempted=false;playbackEvidence=[];playbackFailed=false;playbackConfirmed=false;nativeReplayUsed=false;hostedCastAttempted=false;hlsRelayAttempted=false;hlsRelayUrl='';fastRelayActive=false;fastRelayRecovered=false;
 playbackRecoveryAttempts={};playbackRecoveries=0;resetPreferredDecoderAttempts();
 playbackStreamUrls=playbackCandidates(c);playbackStreamIndex=0;
 byId('playbackDiag').textContent='';byId('playbackDiag').hidden=true;
 logPlayback('Web Lab: receiver TV · '+location.protocol+' · fullscreen video');
 byId('player').hidden=false;byId('player').classList.remove('is-playing');byId('player').classList.remove('is-playback-error');
 updateBottomActions();byId('playingName').textContent=c.name;
 byId('player').focus();enterWebCinema(byId('video'));
 setPlayerStatus('');
 var address=playbackStreamUrls[0];
 startPlaybackStream(address&&address!==c.url?Object.assign({},c,{url:address}):c,token);
 state.recent=[c.id].concat(state.recent.filter(function(id){return id!==c.id;})).slice(0,60);save();
}
function togglePlayback(){
 if(!playing)return;
 if(playbackFailed){play(playing);return;}
 if(playbackEngine==='html5'){
  var media=byId('video');
  if(media.paused){if(webEngineReady)webPlayReady(playbackSerial,webStageGeneration,media);else setPlayerStatus('Đang chờ bộ phát nhận dữ liệu…');}
  else{media.pause();byId('player').classList.remove('is-playing');}
  return;
 }
 if(playbackEngine==='hosted-cast'){
  hostedCastSend('toggle');
  return;
 }
 if(playbackEngine==='avplay'&&avplayInstance){
  try{
   var stateNow=avplayInstance.getState&&avplayInstance.getState();
   if(stateNow==='PLAYING'){avplayInstance.pause();byId('player').classList.remove('is-playing');}
   else if(stateNow==='PAUSED'||stateNow==='READY'){avplayInstance.play();playbackReady(playbackSerial);}
   else {play(playing);}
  }catch(e){fallbackFromAvplay(playing,playbackSerial,e&&e.message||e);}
  return;
 }
 if(playbackEngine==='html5'){
  var video=byId('video');
  if(video.paused)nativeHtml5Play(video,playbackSerial);
  else{video.pause();byId('player').classList.remove('is-playing');}
  return;
 }
 play(playing);
}
/* Samsung TV channel picker: any D-pad arrow opens this overlay.
 * Up/Down play the next channel immediately while leaving the picker visible.
 * Left/Right switch folders; OK/Back dismiss the picker without undoing playback. */
var pickerGroup='Tất cả',pickerIndex=0,pickerChannels=[],pickerHideTimer=null;
var pickerPlayTimer=null,pickerQueuedChannel=null;
function cancelPickerPlay(){
 if(pickerPlayTimer!==null)clearTimeout(pickerPlayTimer);
 pickerPlayTimer=null;pickerQueuedChannel=null;
}
function commitPickerPlay(){
 if(pickerPlayTimer!==null)clearTimeout(pickerPlayTimer);
 pickerPlayTimer=null;
 var target=pickerQueuedChannel;pickerQueuedChannel=null;
 if(target&&(!playing||playing.id!==target.id)){select(target);play(target);}
}
function queuePickerPlay(channel){
 cancelPickerPlay();
 if(!channel||playing&&channel.id===playing.id)return;
 pickerQueuedChannel=channel;
 // 200ms debounce: rapid remote navigation never opens/disposes every stream.
 pickerPlayTimer=setTimeout(commitPickerPlay,200);
}
function schedulePickerAutoHide(){
 if(pickerHideTimer!==null)clearTimeout(pickerHideTimer);
 pickerHideTimer=null;
 if(byId('channelPicker').hidden)return;
 pickerHideTimer=setTimeout(function(){pickerHideTimer=null;if(!byId('channelPicker').hidden)closeChannelPicker();},3000);
}
function pickerGroupsAll(){
 var out=['Tất cả'];
 items.forEach(function(ch){var name=String(ch.group||'Khác');if(out.indexOf(name)<0)out.push(name);});
 return out;
}
function pickerSetGroup(name,preferredId){
 pickerGroup=name||'Tất cả';
 pickerChannels=items.filter(function(ch){return pickerGroup==='Tất cả'||String(ch.group||'Khác')===pickerGroup;});
 var currentlyPlaying=preferredId||(playing&&playing.id)||'';
 var idx=pickerChannels.findIndex(function(ch){return ch.id===currentlyPlaying;});
 pickerIndex=idx>=0?idx:0;
 renderChannelPicker();
}
function renderChannelPicker(){
 var picker=byId('channelPicker');
 if(picker.hidden)return;
 var groups=pickerGroupsAll();
 var container=byId('pickerGroups');container.replaceChildren();
 groups.forEach(function(name){
  var b=elem('button',name===pickerGroup?'active':'',name);
  b.type='button';b.onclick=function(){pickerSetGroup(name);picker.focus();schedulePickerAutoHide();};
  container.appendChild(b);
  if(name===pickerGroup){try{b.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}}
 });
 var list=byId('pickerList');list.replaceChildren();
 if(!pickerChannels.length){
  list.appendChild(elem('p','picker-info','Chưa có kênh trong thư mục này.'));
  byId('pickerInfo').textContent=pickerGroup+' · 0 kênh';
  return;
 }
 if(pickerIndex>=pickerChannels.length)pickerIndex=pickerChannels.length-1;
 if(pickerIndex<0)pickerIndex=0;
 byId('pickerInfo').textContent=pickerGroup+' · '+(pickerIndex+1)+' / '+pickerChannels.length+' kênh';
 // Large playlists remain responsive by rendering only a window around selection.
 var start=Math.max(0,Math.min(pickerIndex-9,pickerChannels.length-21));
 var end=Math.min(pickerChannels.length,start+21);
 for(var i=start;i<end;i++){
  (function(index){
   var ch=pickerChannels[index],active=index===pickerIndex;
   var button=elem('button','picker-row'+(active?' active':''));button.type='button';
   button.appendChild(elem('span','picker-number',String(index+1).padStart(3,'0')));
   button.appendChild(elem('span','picker-name',ch.name||'Kênh TV'));
   if(playing&&playing.id===ch.id)button.appendChild(elem('span','picker-onair','● ĐANG XEM'));
   button.onclick=function(){pickerIndex=index;confirmPickerChannel();};
   list.appendChild(button);
   if(active){try{button.scrollIntoView({block:'nearest'});}catch(e){}}
  })(i);
 }
}
function openChannelPicker(anchorToPlaying){
 if(byId('player').hidden||!items.length)return false;
 byId('channelPicker').hidden=false;
 // Start the very first Up/Down from the channel actually on air.
 var desiredGroup=anchorToPlaying?'Tất cả':pickerGroupsAll().indexOf(lastPickerPosition.group)>=0?lastPickerPosition.group:'Tất cả';
 var preferredId=anchorToPlaying&&playing?playing.id:lastPickerPosition.id;
 pickerSetGroup(desiredGroup,preferredId);
 byId('channelPicker').focus();
 schedulePickerAutoHide();
 return true;
}
function closeChannelPicker(){
 // Honor the last highlighted channel even when OK/Back arrives <200ms later.
 commitPickerPlay();
 if(pickerHideTimer!==null)clearTimeout(pickerHideTimer);
 pickerHideTimer=null;
 byId('channelPicker').hidden=true;
 pickerChannels=[];
 if(!byId('player').hidden)byId('player').focus();
}
function pickerMove(key){
 if(byId('channelPicker').hidden)return;
 schedulePickerAutoHide();
 if(key==='ArrowLeft'||key==='ArrowRight'){
  var groups=pickerGroupsAll(),index=groups.indexOf(pickerGroup);
  cancelPickerPlay();
  pickerSetGroup(groups[(index+(key==='ArrowRight'?1:-1)+groups.length)%groups.length]);
  rememberPickerPosition();
 }else if(pickerChannels.length&&(key==='ArrowUp'||key==='ArrowDown')){
  pickerIndex=(pickerIndex+(key==='ArrowDown'?1:-1)+pickerChannels.length)%pickerChannels.length;
  var nextChannel=pickerChannels[pickerIndex];
  rememberPickerPosition();
  if(nextChannel){
   select(nextChannel);
   queuePickerPlay(nextChannel);
  }
  // Playback changes underneath, but the channel list stays visible.
  renderChannelPicker();
 }
}
function confirmPickerChannel(){
 if(byId('channelPicker').hidden)return false;
 var channel=pickerChannels[pickerIndex];
 rememberPickerPosition();closeChannelPicker();
 if(channel){select(channel);if(!playing||playing.id!==channel.id)play(channel);}
 byId('player').focus();
 return !!channel;
}
function closePlayer(){
 leaveWebCinema();
 cancelPickerPlay();
 byId('browserFallback').hidden=true;
 if(!byId('channelPicker').hidden)closeChannelPicker();
 playbackSerial++;stopPlaybackEngine();byId('player').hidden=true;
 hlsAttempted=false;playbackEvidence=[];playbackFailed=false;playbackConfirmed=false;hostedCastAttempted=false;playbackRecoveryAttempts={};playbackRecoveries=0;playbackStreamUrls=[];playbackStream=null;byId('playbackDiag').textContent='';byId('playbackDiag').hidden=true;
 byId('player').classList.remove('is-playing');byId('player').classList.remove('is-playback-error');setPlayerStatus('');
 playing=null;draw();updateBottomActions();restoreHomeFocus();
}
function resumeLastChannel(){
 // Watch history is already persisted in localStorage by play(). Only restore a channel still visible in the current M3U lists.
 var id=state.recent&&state.recent[0];
 if(!id||playing||!byId('modal').hidden)return false;
 var channel=items.find(function(c){return c.id===id;});
 if(!channel)return false;
 select(channel);play(channel);
 return true;
}
function changeChannel(offset){var i=items.findIndex(function(c){return playing&&c.id===playing.id;});if(i>=0)play(items[(i+offset+items.length)%items.length]);}
function homeButtons(selector){
 return Array.from(document.querySelectorAll(selector)).filter(function(button){
  return !button.disabled&&button.getClientRects().length>0;
 });
}
function focusHomeButton(button){
 if(!button)return;
 try{button.focus({preventScroll:true});}catch(e){button.focus();}
 try{button.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}
}
function moveHome(key){
 var active=document.activeElement;
 var toolbar=homeButtons('#app .toolbar button');
 var menu=homeButtons('#app .nav button');
 var groups=homeButtons('#groups button');
 var list=homeButtons('#channels button,#empty button,#more');
 var actions=homeButtons('#app .actions button');
 var selectedMenu=menu.find(function(button){return button.dataset.nav===section;})||menu[0];
 var selectedGroup=groups.find(function(button){return button.dataset.groupName===group;})||groups[0];
 var selectedRow=list.find(function(button){return selected&&button.dataset.channelId===selected.id;})||list[0];
 var up=key==='ArrowUp',down=key==='ArrowDown',left=key==='ArrowLeft',right=key==='ArrowRight';
 var index=toolbar.indexOf(active),target;
 if(index>=0){
  if(left||right)target=toolbar[index+(left?-1:1)];
  if(down)target=(index===0?selectedGroup||selectedRow:actions[0])||selectedGroup||selectedRow||selectedMenu;
 }else if((index=menu.indexOf(active))>=0){
  if(up)target=menu[index-1]||toolbar[0];
  if(down)target=menu[index+1];
  if(right)target=selectedRow||selectedGroup||toolbar[0];
 }else if((index=groups.indexOf(active))>=0){
  if(up)target=toolbar[0];
  if(down)target=selectedRow;
  if(left)target=groups[index-1]||selectedMenu;
  if(right)target=groups[index+1]||actions[0];
 }else if((index=list.indexOf(active))>=0){
  if(up)target=list[index-1]||selectedGroup||toolbar[0];
  if(down)target=list[index+1];
  if(left)target=selectedMenu;
  if(right)target=actions[0];
 }else if((index=actions.indexOf(active))>=0){
  if(up)target=actions[index-1]||toolbar[2];
  if(down)target=actions[index+1];
  if(left)target=selectedRow||selectedGroup||selectedMenu;
 }else target=selectedRow||selectedMenu||toolbar[0];
 focusHomeButton(target);
}
function move(key){var scope=byId('modal');var nodes=Array.from(scope.querySelectorAll('button:not([disabled]),input:not([disabled])')).filter(function(e){return e.getClientRects().length>0;});
var active=document.activeElement,r=active&&active.getBoundingClientRect();if(!r||nodes.indexOf(active)<0){if(nodes.length)nodes[0].focus();return;}var x=r.left+r.width/2,y=r.top+r.height/2,best=null,min=Infinity;
nodes.forEach(function(el){if(el===active)return;var q=el.getBoundingClientRect(),dx=q.left+q.width/2-x,dy=q.top+q.height/2-y;if(key==='ArrowLeft'&&dx>=0||key==='ArrowRight'&&dx<=0||key==='ArrowUp'&&dy>=0||key==='ArrowDown'&&dy<=0)return;var s=(key==='ArrowLeft'||key==='ArrowRight')?Math.abs(dx)+Math.abs(dy)*2.3:Math.abs(dy)+Math.abs(dx)*2.3;if(s<min){min=s;best=el;}});if(best){best.focus();best.scrollIntoView({block:'nearest',inline:'nearest'});}}
var lastBackEventAt=0;
function isRemoteBack(e){
 var key=String(e.key||''),code=e.keyCode||e.which||0;
 if(key==='Backspace'&&document.activeElement&&/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName))return false;
 return code===10009||code===461||['Escape','Back','Return','BrowserBack','GoBack','XF86Back','Backspace'].indexOf(key)!==-1;
}
function exitModule(){
 if(typeof stopHomePreview==='function')stopHomePreview();
 // In TizenBrew the launcher navigates with location.href to this module.
 // Back through the WebView history returns to the real bundled launcher.
 // The website can return to the previous page using browser history.
 try{stopPair();}catch(e){}
 try{byId('video').pause();}catch(e){}
 try{
  if(window.history&&window.history.length>1){
   window.history.back();
   return;
  }
 }catch(e){}
 // Standalone launch with no launcher history: leave the native app rather
 // than navigating to the local module proxy and showing a blank screen.
 try{
  if(typeof tizen!=='undefined'&&tizen.application){
   tizen.application.getCurrentApplication().exit();
   return;
  }
 }catch(e){}
 try{window.close();}catch(e){}
 notify('Không tìm thấy lịch sử TizenBrew. Nhấn Home rồi mở lại TizenBrew.');
}
function openTizenTube(){notify('TizenTube là module riêng. Nhấn Back để trở lại TizenBrew và mở.');}
function handleBack(e){
 if(e){if(typeof e.preventDefault==='function')e.preventDefault();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();}
 // A Samsung remote may report one Back press via keydown, keyup and tizenhwkey.
 // 650 ms cooldown prevents a single physical press from closing player AND exiting app.
 var now=Date.now();if(now-lastBackEventAt<650)return;lastBackEventAt=now;
 if(!byId('modal').hidden){closeDialog();return;}
 if(!byId('channelPicker').hidden){closeChannelPicker();return;}
 if(!byId('player').hidden){closePlayer();return;}
 exitModule();
}
function keyHandler(e){if(isRemoteBack(e)){handleBack(e);return;}var k=e.key||'',c=e.keyCode;var keys={37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown'};if(keys[c])k=keys[c];
if(!byId('modal').hidden){
var active=document.activeElement,isText=active&&active.tagName==='INPUT'&&active.type!=='checkbox';
if(active===byId('sourceName')&&(k==='ArrowDown'||k==='Enter')){e.preventDefault();e.stopPropagation();byId('sourceUrl').focus();return;}
if(active===byId('toSourceUrl')&&k==='ArrowDown'){e.preventDefault();e.stopPropagation();byId('sourceUrl').focus();return;}
if(active===byId('sourceUrl')&&k==='ArrowUp'){e.preventDefault();e.stopPropagation();byId('sourceName').focus();return;}
if(active===byId('sourceUrl')&&k==='ArrowDown'){e.preventDefault();e.stopPropagation();byId('rights').focus();return;}
if(active===byId('rights')&&(k==='Enter'||k==='OK'||k===' '||k==='Spacebar'||c===13||c===32)){e.preventDefault();e.stopPropagation();if(!e.repeat)toggleRights();return;}
if(active===byId('rights')&&k==='ArrowUp'){e.preventDefault();e.stopPropagation();byId('sourceUrl').focus();return;}
if(active===byId('rights')&&k==='ArrowDown'){e.preventDefault();e.stopPropagation();byId('saveSource').focus();return;}
if(active===byId('saveSource')&&k==='ArrowUp'){e.preventDefault();e.stopPropagation();byId('rights').focus();return;}
if(isText&&(k==='ArrowLeft'||k==='ArrowRight'))return;
if(k.indexOf('Arrow')===0){e.preventDefault();e.stopPropagation();move(k);}return;}
if(!byId('player').hidden){
 // No legacy WGT player panel or channel-picker overlay.
 if(c===427||k==='ChannelUp'||k==='ArrowUp'){e.preventDefault();if(!e.repeat)changeChannel(1);return;}
 if(c===428||k==='ChannelDown'||k==='ArrowDown'){e.preventDefault();if(!e.repeat)changeChannel(-1);return;}
 if(k==='ArrowLeft'||k==='ArrowRight'||c===403||k==='ColorF0Red'){e.preventDefault();return;}
 if(c===413||k==='MediaStop'){e.preventDefault();closePlayer();return;}
 if(k==='Enter'||k==='OK'||c===13||c===415||c===10252){e.preventDefault();if(!e.repeat)togglePlayback();return;}
 return;
}
if(k.indexOf('Arrow')===0){e.preventDefault();moveHome(k);return;}
if((k==='Enter'||k==='OK'||c===13)&&document.activeElement&&
 document.activeElement.tagName==='BUTTON'&&byId('app').contains(document.activeElement)){
 e.preventDefault();
 if(!e.repeat)document.activeElement.click();
}}
document.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){var which=b.dataset.nav;if(which==='help'){notify('Điều khiển bằng ↑↓←→, OK, Back, CH±. Thêm M3U bằng + Nguồn.');return;}section=which;group='Tất cả';showLimit=160;byId('channels').scrollTop=0;draw();};});
byId('addBtn').onclick=function(){openDialog('source');};byId('emptyAdd').onclick=byId('addBtn').onclick;
byId('searchBtn').onclick=function(){byId('searchInput').value=search;openDialog('search');};
byId('cancelSource').onclick=closeDialog;byId('cancelSearch').onclick=closeDialog;byId('saveSource').onclick=function(){void addSource(null,false);};
byId('rights').onclick=toggleRights;
byId('toSourceUrl').onclick=function(){byId('sourceUrl').focus();};
byId('refreshSourceQR').onclick=function(){void openPair();};
byId('applySearch').onclick=function(){search=byId('searchInput').value.trim();group='Tất cả';showLimit=160;byId('channels').scrollTop=0;closeDialog();draw();};
byId('clearSearch').onclick=function(){search='';byId('searchInput').value='';group='Tất cả';closeDialog();draw();};
var searchTypingTimer=0;
byId('searchInput').oninput=function(){clearTimeout(searchTypingTimer);var value=this.value;searchTypingTimer=setTimeout(function(){if(!byId('searchDialog').hidden)renderSearchSuggestions(value);},250);};
byId('searchInput').onkeydown=function(event){if(event.key==='Enter'){event.preventDefault();byId('applySearch').click();}};
byId('appsBtn').onclick=exitModule;
byId('exitModuleBtn').onclick=exitModule;
byId('browserFallback').onclick=openChannelInSamsungBrowser;
byId('tizenTubeBtn').onclick=openTizenTube;
byId('themeBtn').onclick=nextTvTheme;
byId('watchBtn').onclick=function(){play(selected);};
byId('guideBtn').onclick=function(){if(!selected)return;renderSelectedEPG();byId('guideCard').scrollIntoView({block:'nearest'});notify(epgReady?'Lịch phát sóng đang hiển thị.':epgError||'EPG tự tải một lần mỗi ngày.');};
byId('infoBtn').onclick=function(){if(selected)notify(selected.name+' · '+selected.group+(epgReady?' · Đã cập nhật EPG':''));};
byId('selectedChannelLogo').onerror=function(){this.hidden=true;byId('selectedChannelPlaceholder').hidden=false;};
byId('favBtn').onclick=function(){if(!selected)return;var id=selected.id,old=state.favorites[id];if(old)delete state.favorites[id];else state.favorites[id]=true;if(!save()){if(old===undefined)delete state.favorites[id];else state.favorites[id]=old;}draw();};
byId('more').onclick=function(){
 var firstNew=showLimit;
 showLimit+=160;
 draw();
 focusHomeButton(byId('channels').children[firstNew]);
};byId('sampleBtn').onclick=function(){if(!state.sources.some(function(s){return s.name==='Thử nghiệm';})){state.sources.push({name:'Thử nghiệm',channels:parse('#EXTM3U\n#EXTINF:-1,Mux Test HLS\nhttps://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8','Thử nghiệm')});if(!save()){state.sources.pop();draw();return;}}draw();notify('Đã thêm luồng thử nghiệm HLS.');};
byId('previewLogo').onerror=function(){this.hidden=true;byId('previewText').hidden=false;};
var backDownHandled=false,backDownReset=0;
window.addEventListener('keydown',function(e){
 if(isRemoteBack(e)){
  if(backDownHandled){if(e.preventDefault)e.preventDefault();return;}
  backDownHandled=true;
  clearTimeout(backDownReset);backDownReset=setTimeout(function(){backDownHandled=false;},1800);
 }
 keyHandler(e);
},true);
window.addEventListener('keyup',function(e){
 if(!isRemoteBack(e))return;
 if(backDownHandled){
  backDownHandled=false;clearTimeout(backDownReset);
  if(e.preventDefault)e.preventDefault();
  return;
 }
 handleBack(e);
},true);
document.addEventListener('tizenhwkey',function(e){if(String(e.keyName||'').toLowerCase()==='back')handleBack(e);},true);
window.addEventListener('tizenhwkey',function(e){if(String(e.keyName||'').toLowerCase()==='back')handleBack(e);},true);
document.addEventListener('focusin',function(event){rememberHomeFocus(event.target);},true);
applyTvTheme(state.theme);draw();updateBottomActions();setTimeout(function(){restoreHomeFocus();},50);
function clock(){var d=new Date();byId('clock').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}clock();setInterval(clock,30000);void epgStartup();setInterval(function(){if(selected)renderSelectedEPG();},60000);
})();

}

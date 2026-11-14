// 芒果TV片库 CapyPlayer Widget v1.1.0
// 固定安装：https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/mgtv.js
// 使用官方公开片库获取列表，经 TMDB 匹配后展示详情；不解析受保护播放流。
var WidgetMetadata = {
  id: "mgtv.video.pc.makka",
  title: "芒果TV片库",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "芒果TV六大频道：组合筛选、分页、官方封面回退与 TMDB 详情",
  site: "https://www.mgtv.com",
  icon: "https://raw.githubusercontent.com/luestr/IconResource/main/App_icon/120px/Mango_TV.png",
  author: "MakkaPakka",
  modules: [
    {
      id: "mgTv",
      title: "电视剧",
      functionName: "loadMgTv",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "kind", title: "类型", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "爱情", value: "3094" }, { title: "都市", value: "3093" }, { title: "青春", value: "3003" }, { title: "奇幻", value: "3092" }, { title: "军旅", value: "3091" }, { title: "武侠", value: "3090" }, { title: "古装", value: "148" }, { title: "科幻", value: "3088" }, { title: "竞技", value: "3087" }, { title: "传奇", value: "3086" }, { title: "家庭", value: "3007" }, { title: "历史", value: "3085" }, { title: "仙侠", value: "3084" }, { title: "喜剧", value: "3005" }, { title: "革命", value: "3083" }, { title: "悬疑", value: "3002" }, { title: "民国", value: "3153" }, { title: "现实", value: "3082" }, { title: "乡村", value: "3010" }, { title: "权谋", value: "3080" }, { title: "商战", value: "3078" }, { title: "逆袭", value: "3077" }, { title: "年代剧", value: "3116" }, { title: "神话", value: "3076" } ] },
        { name: "area", title: "地区", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "内地", value: "10" }, { title: "港台", value: "12" }, { title: "泰国", value: "193" } ] },
        { name: "year", title: "年份", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [ { title: "全部", value: "all" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "2019", value: "2019" }, { title: "2018", value: "2018" }, { title: "2017", value: "2017" }, { title: "2016", value: "2016" }, { title: "2015", value: "2015" }, { title: "2010-2014", value: "2014t2010" }, { title: "2000-2009", value: "2009t2000" }, { title: "90年代", value: "1990s" }, { title: "更早", value: "1989e" } ] },
        { name: "feature", title: "状态", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [ { title: "全部", value: "all" }, { title: "已完结", value: "0" } ] },
        { name: "chargeInfo", title: "资费", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "免费", value: "b1" }, { title: "VIP", value: "b2" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "c2", defaultValue: "c2", enumOptions: [ { title: "最热", value: "c2" }, { title: "最新", value: "c1" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "mgMovie",
      title: "电影",
      functionName: "loadMgMovie",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "kind", title: "类型", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "爱情", value: "175" }, { title: "喜剧", value: "176" }, { title: "青春", value: "39" }, { title: "奇幻", value: "3027" }, { title: "剧情", value: "3028" }, { title: "国漫", value: "3096" }, { title: "科幻", value: "178" }, { title: "动作", value: "177" }, { title: "励志", value: "34" }, { title: "历史", value: "46" }, { title: "古装", value: "35" }, { title: "家庭", value: "36" }, { title: "战争", value: "44" }, { title: "犯罪", value: "3097" }, { title: "悬疑", value: "3029" }, { title: "经典", value: "3098" }, { title: "冒险", value: "3099" }, { title: "灾难", value: "3100" } ] },
        { name: "edition", title: "版本", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "院线大片", value: "182" }, { title: "独播影院", value: "183" } ] },
        { name: "area", title: "地区", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "内地", value: "27" }, { title: "中国香港", value: "3036" }, { title: "欧美", value: "3073" }, { title: "其他", value: "other" } ] },
        { name: "year", title: "年份", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [ { title: "全部", value: "all" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" }, { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" }, { title: "2019", value: "2019" }, { title: "2018", value: "2018" }, { title: "2017", value: "2017" }, { title: "2016", value: "2016" }, { title: "2015", value: "2015" }, { title: "2010-2014", value: "2014t2010" }, { title: "2000-2009", value: "2009t2000" }, { title: "90年代", value: "1990s" }, { title: "更早", value: "1989e" } ] },
        { name: "chargeInfo", title: "资费", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "免费", value: "b1" }, { title: "VIP", value: "b2" }, { title: "VIP用券", value: "b3" }, { title: "付费点播", value: "b4" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "c2", defaultValue: "c2", enumOptions: [ { title: "最热", value: "c2" }, { title: "最新", value: "c1" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "mgVariety",
      title: "综艺",
      functionName: "loadMgVariety",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "kind", title: "类型", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "音乐", value: "8" }, { title: "推理", value: "3075" }, { title: "生活", value: "9" }, { title: "情感", value: "7" }, { title: "旅游", value: "170" }, { title: "播客", value: "3157" }, { title: "文化", value: "3143" }, { title: "美食", value: "3011" }, { title: "语言", value: "3152" }, { title: "亲子", value: "179" }, { title: "游戏", value: "3144" }, { title: "演唱会", value: "4" }, { title: "竞技", value: "174" }, { title: "表演", value: "180" } ] },
        { name: "chargeInfo", title: "资费", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "免费", value: "b1" }, { title: "VIP", value: "b2" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "c2", defaultValue: "c2", enumOptions: [ { title: "最热", value: "c2" }, { title: "最新", value: "c1" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "mgAnime",
      title: "动漫",
      functionName: "loadMgAnime",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "kind", title: "类型", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "恋爱", value: "84" }, { title: "冒险", value: "87" }, { title: "魔法", value: "64" }, { title: "青春", value: "63" }, { title: "搞笑", value: "62" }, { title: "玄幻", value: "3150" }, { title: "武侠", value: "195" }, { title: "科幻", value: "90" }, { title: "经典", value: "71" }, { title: "特摄", value: "66" }, { title: "悬疑", value: "3112" } ] },
        { name: "area", title: "地区", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "内地", value: "52" }, { title: "欧美", value: "53" }, { title: "其他", value: "55" } ] },
        { name: "edition", title: "版本", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "TV版", value: "57" }, { title: "剧场版", value: "165" }, { title: "真人版", value: "167" }, { title: "其他", value: "58" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "c1", defaultValue: "c1", enumOptions: [ { title: "最新", value: "c1" }, { title: "最热", value: "c2" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "mgDoc",
      title: "纪录片",
      functionName: "loadMgDoc",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "kind", title: "类型", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "文化", value: "98" }, { title: "励志", value: "99" }, { title: "历史", value: "100" }, { title: "生活", value: "97" }, { title: "乡村", value: "3147" }, { title: "职业", value: "3148" }, { title: "青春", value: "3149" }, { title: "旅游", value: "103" }, { title: "科普", value: "3146" }, { title: "军事", value: "101" }, { title: "运动", value: "104" }, { title: "动物", value: "3026" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "c1", defaultValue: "c1", enumOptions: [ { title: "最新", value: "c1" }, { title: "最热", value: "c2" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "mgKids",
      title: "少儿",
      functionName: "loadMgKids",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "kind", title: "类型", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "儿歌", value: "184" }, { title: "冒险", value: "87" }, { title: "益智", value: "83" }, { title: "魔法", value: "3103" }, { title: "机甲", value: "3104" }, { title: "经典", value: "95" }, { title: "竞技", value: "88" }, { title: "搞笑", value: "62" }, { title: "励志", value: "194" }, { title: "科幻", value: "90" }, { title: "早教", value: "3101" } ] },
        { name: "fitAge", title: "年龄段", type: "enumeration", default: "a1", defaultValue: "a1", enumOptions: [ { title: "全部", value: "a1" }, { title: "0-3岁", value: "74" }, { title: "4-6岁", value: "75" }, { title: "7-10岁", value: "76" }, { title: "11-14岁", value: "77" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "c1", defaultValue: "c1", enumOptions: [ { title: "最新", value: "c1" }, { title: "最热", value: "c2" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    }
  ]
};

var MG_API = "https://pianku.api.mgtv.com/rider/list/pcweb/v3";
var MG_KEYS = ["kind", "area", "year", "feature", "chargeInfo", "sort", "edition", "fitAge"];
var MG_CH = { tv: 2, movie: 3, variety: 1, anime: 50, doc: 51, kids: 10 };

var MG_TMDB_SLOT = 4;
var MG_TMDB_BUSY = 0;
var MG_TMDB_QUEUE = [];

function mgHasStorage() {
  return typeof Widget !== "undefined" && !!(Widget.storage && typeof Widget.storage.get === "function");
}

function mgAcquire() {
  if (MG_TMDB_BUSY < MG_TMDB_SLOT) { MG_TMDB_BUSY++; return Promise.resolve(); }
  return new Promise(function (res) { MG_TMDB_QUEUE.push(res); });
}

function mgRelease() {
  var next = MG_TMDB_QUEUE.shift();
  if (next) next(); else MG_TMDB_BUSY--;
}

function mgSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function mgQs(o) {
  var p = [];
  for (var k in o) {
    if (!o.hasOwnProperty(k)) continue;
    p.push(encodeURIComponent(k) + "=" + encodeURIComponent(o[k]));
  }
  return p.join("&");
}

function mgJson(input) {
  if (typeof input === "string") {
    try { return JSON.parse(input); }
    catch (e) { throw new Error("芒果TV片库接口返回非 JSON 内容"); }
  }
  return input || {};
}
function mgImage(input) {
  if (!input) return "";
  var v = typeof input === "string" ? input : (input.url || input.src || "");
  var u = String(v).trim();
  if (u.slice(0,2) === "//") u = "https:" + u;
  return /^https?:\/\/\S+$/i.test(u) ? u : "";
}
function mgFirstImage(d, keys) {
  for (var i=0; i<keys.length; i++) {
    var u=mgImage(d[keys[i]]);
    if (u) return u;
  }
  return "";
}
function mgDefaultParams(channelId, params) {
  var channelIds = [2,3,1,50,51,10];
  var index = channelIds.indexOf(Number(channelId));
  var out = {}, supplied = params || {};
  if (index >= 0) {
    var defs = WidgetMetadata.modules[index].params || [];
    for (var i=0; i<defs.length; i++) {
      var def=defs[i], val=def.defaultValue !== undefined ? def.defaultValue : def.default;
      if (val !== undefined && MG_KEYS.indexOf(def.name)>=0) out[def.name]=val;
    }
  }
  for (var k in supplied) {
    if (Object.prototype.hasOwnProperty.call(supplied,k) && MG_KEYS.indexOf(k)>=0 &&
       supplied[k] !== undefined && supplied[k] !== null) out[k]=supplied[k];
  }
  return out;
}
function mgBuildQuery(channelId, params, page) {
  var filters = mgDefaultParams(channelId,params);
  var q = {
    allowedRC:"1", platform:"pcweb", channelId:channelId,
    pn:Math.max(1,Math.min(100,parseInt(page,10)||1)),
    pc:24, hudong:1, _support:"10000000"
  };
  for (var i=0;i<MG_KEYS.length;i++) {
    var k=MG_KEYS[i], v=filters[k];
    if (v!==undefined && v!==null && String(v).trim()!=="") q[k]=String(v);
  }
  return q;
}
function mgParseCards(body) {
  if (!body || typeof body!=="object") throw Error("芒果TV接口数据缺失");
  if (body.code !== undefined && ![0,"0",200,"200"].includes(body.code))
    throw Error("芒果TV接口返回错误码 "+body.code);
  if (body.success === false) throw Error("芒果TV接口请求未成功");
  var data = body.data || {};
  var docs = data.hitDocs || data.hitdocs || data.docs || [];
  if (!Array.isArray(docs)) throw Error("芒果TV hitDocs 字段格式异常");
  var out = [],seen={};
  for (var i=0;i<docs.length;i++) {
    var d=docs[i] || {};
    var title=String(d.title || d.clipName || d.name || "").trim();
    var id=String(d.clipId || d.clip_id || d.videoId || d.id || "").trim();
    if (!title || !id || seen[id]) continue;
    seen[id]=true;
    var date=String(d.year || d.releaseYear || d.showYear || d.publishYear || "");
    var year=/^\d{4}/.test(date) ? date.slice(0,4) : "";
    out.push({
      cid:"mg"+id, title:title, year:year,
      poster:mgFirstImage(d,["imgUrlV","imgUrl_v","verticalImg","imgVertical","posterUrl","poster","pic","coverUrl","cover","imgUrlH","imgUrl"]),
      backdrop:mgFirstImage(d,["imgUrlH","imgUrl_h","horizontalImg","imgHorizontal","backdropUrl","backdrop","imgUrl"]),
      description:String(d.story || d.description || d.desc || d.intro || d.subTitle || "").slice(0,280)
    });
  }
  return out;
}
async function mgFetch(cid,params,page) {
  var query=mgBuildQuery(cid,params,page),url=MG_API+"?"+mgQs(query),err;
  for (var attempt=0;attempt<2;attempt++) {
    try {
      var res=await Widget.http.get(url,{
        headers:{Referer:"https://www.mgtv.com/lib/"+cid,Accept:"application/json"}
      });
      if (res && res.ok===false) throw Error("芒果TV接口 HTTP "+(res.status || "?"));
      var body=mgJson(res && res.data!==undefined ? res.data : res);
      return mgParseCards(body);
    } catch(e) {err=e; if(attempt===0)await mgSleep(350);}
  }
  throw err;
}

function mgNorm(s) {
  return String(s || "").toLowerCase()
    .replace(/[\s·・:：!！?？,，.。'"、]/g, "")
    .replace(/[（(][^)）]*[)）]/g, "");
}

function mgVariants(title) {
  var raw = String(title || "").trim();
  if (!raw) return [];
  var list = [];
  function add(x) {
    x = String(x || "").trim();
    if (x.length >= 2 && list.indexOf(x) < 0) list.push(x);
  }
  add(raw);
  var a = raw.replace(/[（(][^)）]*[)）]/g, "").replace(/【[^】]*】/g, "").replace(/\[[^\]]*\]/g, "").trim();
  add(a);
  var b = a.replace(/[·・].*$/, "").trim();
  add(b);
  var c = b.replace(/第\s*[0-9一二三四五六七八九十]+\s*[季期部篇].*$/, "").trim();
  add(c);
  var d = c.replace(/\s*(年番|完结季|完结篇|特别篇|普通话版|国语版|日语版|粤语版|中配版)$/, "").trim();
  add(d);
  var e = d.replace(/\s*(爽看版|精编版|加更版|会员版|悠享版|抢先版|完整版|导演剪辑版|速看版|高能版|纯享版|竖屏版|横屏版|特辑|番外|大结局)$/, "").trim();
  add(e);
  return list;
}

function mgJunk(title) {
  return /(拆解|解说|盘点|大赏|合集|预告|花絮|精选|混剪|周周看|名场面|彩蛋|剧情回顾|幕后)/i.test(String(title || ""));
}

function mgGrams(s) {
  var t = mgNorm(s);
  var set = {};
  for (var i = 0; i < t.length - 1; i++) set[t.substr(i, 2)] = 1;
  if (t.length === 1) set[t] = 1;
  return set;
}

function mgSim(a, b) {
  var ga = mgGrams(a), gb = mgGrams(b);
  var ka = Object.keys(ga), kb = Object.keys(gb);
  if (!ka.length || !kb.length) return 0;
  var inter = 0;
  for (var i = 0; i < ka.length; i++) if (gb[ka[i]]) inter++;
  return inter / (ka.length + kb.length - inter);
}

function mgBest(results,names,year,kind) {
  var best=null,scoreBest=-1;
  for (var i=0;i<(results || []).length;i++) {
    var r=results[i]; if(!r || !r.id)continue;
    var title=r.name || r.title || "",original=r.original_name || r.original_title || "";
    var sim=0;
    for(var j=0;j<names.length;j++)
      sim=Math.max(sim,mgSim(names[j],title),original?mgSim(names[j],original):0);
    // 不能只靠年份和热度误关联不同作品。
    if(sim<0.63)continue;
    var date=String(r.first_air_date || r.release_date || ""), score=sim;
    if(year && /^\d{4}/.test(date)){
      var diff=Math.abs(Number(date.slice(0,4))-Number(year));
      if(diff===0)score+=0.14;
      else if(diff===1)score+=0.05;
      else if(diff>3)score-=0.14;
    }
    score+=Math.min(0.03,Number(r.popularity || 0)/50000);
    if(score>scoreBest){scoreBest=score;best=r}
  }
  return best?{id:best.id,kind:kind,poster:best.poster_path || "",
    backdrop:best.backdrop_path || "",date:best.first_air_date || best.release_date || "",
    vote:Number(best.vote_average || 0)}:null;
}

async function mgSearch(kind,query) {
  var error;
  for(var i=0;i<2;i++) {
    await mgAcquire();
    try {
      if(!Widget.tmdb || typeof Widget.tmdb.get!=="function") throw Error("TMDB API 不可用");
      var response=await Widget.tmdb.get("/search/"+kind,{
        params:{query:query,language:"zh-CN",include_adult:false}
      });
      var body=mgJson(response && response.data!==undefined ? response.data : response);
      return Array.isArray(body.results) ? body.results : [];
    } catch(e){error=e}
    finally{mgRelease()}
    if(i===0)await mgSleep(280);
  }
  // 网络不可用时直接抛错，不能写入“无结果”负缓存。
  throw Error("TMDB 查询失败: "+(error && error.message || error));
}

async function mgCacheGet(key) {
  if(!mgHasStorage())return null;
  try {
    var v=Widget.storage.get(key);
    if(v && typeof v.then==="function")v=await v;
    var o=v?mgJson(v):{};
    return o.ts && Date.now()-o.ts<(o.id?604800000:7200000) ? o : null;
  } catch(e){return null}
}
async function mgCacheSet(key,obj) {
  if(!mgHasStorage() || typeof Widget.storage.set!=="function")return;
  try {
    var o={};
    for(var k in obj)if(Object.prototype.hasOwnProperty.call(obj,k))o[k]=obj[k];
    o.ts=Date.now();
    var r=Widget.storage.set(key,JSON.stringify(o));
    if(r && typeof r.then==="function")await r;
  }catch(e){}
}

async function mgMatchOne(card,kind) {
  if(mgJunk(card.title))return null;
  var key="mgpc:v2:tmdb:"+kind+":"+card.cid,cached=await mgCacheGet(key);
  if(cached)return cached.id ? cached : null;
  var names=mgVariants(card.title).slice(0,3);
  if(!names.length)return null;
  var hit=null;
  for(var i=0;i<names.length && !hit;i++)
    hit=mgBest(await mgSearch(kind,names[i]),names,card.year,kind);
  if(!hit) {
    var other=kind==="tv"?"movie":"tv";
    hit=mgBest(await mgSearch(other,names[0]),names,card.year,other);
  }
  await mgCacheSet(key,hit || {id:0});
  return hit;
}
function mgToItem(card,hit) {
  var poster=(hit.poster?"https://image.tmdb.org/t/p/w500"+hit.poster:"") || card.poster || "";
  var backdrop=(hit.backdrop?"https://image.tmdb.org/t/p/w780"+hit.backdrop:"") || card.backdrop || poster;
  var item={
    id:String(hit.id),type:"tmdb",title:card.title,mediaType:hit.kind,tmdbId:String(hit.id),
    releaseDate:hit.date || card.year || ""
  };
  if(poster)item.posterUrl=poster;
  if(backdrop)item.backdropUrl=backdrop;
  if(card.year)item.year=card.year;
  if(card.description)item.description=card.description;
  if(hit.vote>0)item.rating=hit.vote;
  return item;
}
async function mgResolveAll(cards,kind) {
  var results=new Array(cards.length),idx=0,failures=0;
  async function worker(){
    while(idx<cards.length){
      var i=idx++;
      try {
        var hit=await mgMatchOne(cards[i],kind);
        if(hit && hit.id)results[i]=mgToItem(cards[i],hit);
      } catch(e){failures++;console.warn("[mgtv] 单条 TMDB 匹配失败",cards[i].cid,e && e.message);}
    }
  }
  var workers=[];
  for(var i=0;i<MG_TMDB_SLOT && i<cards.length;i++)workers.push(worker());
  await Promise.all(workers);
  var items=[],seen={};
  for(var j=0;j<results.length;j++){
    var item=results[j],key=item && item.mediaType+":"+item.id;
    if(!item || seen[key])continue;
    seen[key]=1;items.push(item);
  }
  if(failures)console.warn("[mgtv] 本页 TMDB 失败数",failures);
  return items;
}

async function loadMgChannel(chKey, params) {
  params = params || {};
  var cid = MG_CH[chKey];
  if (!cid) return [];
  var page = parseInt(params.page, 10) || 1;
  try {
    var cards = await mgFetch(cid, params, page);
    if(!cards.length){console.warn("[mgtv] 片库无数据",chKey,page);return []}
    var kind=chKey==="movie"?"movie":"tv";
    var items=await mgResolveAll(cards,kind);
    console.log("[mgtv] 分类",chKey,"原始",cards.length,"匹配",items.length);
    return items;
  } catch (e) {
    console.error("[mgtv] channel load failed", chKey, e && e.message);
    return [];
  }
}

async function loadMgTv(params) { return await loadMgChannel("tv", params); }
async function loadMgMovie(params) { return await loadMgChannel("movie", params); }
async function loadMgVariety(params) { return await loadMgChannel("variety", params); }
async function loadMgAnime(params) { return await loadMgChannel("anime", params); }
async function loadMgDoc(params) { return await loadMgChannel("doc", params); }
async function loadMgKids(params) { return await loadMgChannel("kids", params); }
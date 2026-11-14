// ===== 优酷片库 (CapyPlayer Widget) =====
// 安装地址：https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/youku.js
// 需要 youku-worker 中转（优酷签名无法在客户端计算）
// 若是自己部署的 Worker，在组件参数「API 地址」填写完整地址
var WidgetMetadata = {
  id: "youku.video.pc.makka",
  title: "优酷片库",
  version: "1.3.0",
  description: "优酷六大分类 · 地区年份筛选 · TMDB 详情（需要 Worker）",
  site: "https://www.youku.com",
  icon: "https://raw.githubusercontent.com/luestr/IconResource/main/App_icon/120px/YouKu_Video.png",
  author: "MakkaPakka",
  globalParams: [
    { name: "base", title: "API 地址", type: "string", defaultValue: "", description: "留空尝试原版 Worker（未验证可用）；也可填写自己的 Worker 完整 URL" }
  ],
  modules: [
    {
      id: "ykTv",
      title: "电视剧",
      functionName: "loadYkTv",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "mainArea", title: "地区", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国内地", value: "中国内地" }, { title: "中国香港", value: "中国香港" },
          { title: "中国台湾", value: "中国台湾" }, { title: "韩国", value: "韩国" }, { title: "美国", value: "美国" },
          { title: "英国", value: "英国" }, { title: "日本", value: "日本" }, { title: "泰国", value: "泰国" } ] },
        { name: "year", title: "年份", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" },
          { title: "2019", value: "2019" }, { title: "2018", value: "2018" }, { title: "2017", value: "2017" },
          { title: "更早", value: "更早" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "ykMovie",
      title: "电影",
      functionName: "loadYkMovie",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "mainArea", title: "地区", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国内地", value: "中国内地" }, { title: "中国香港", value: "中国香港" },
          { title: "中国台湾", value: "中国台湾" }, { title: "韩国", value: "韩国" }, { title: "美国", value: "美国" },
          { title: "英国", value: "英国" }, { title: "日本", value: "日本" }, { title: "泰国", value: "泰国" } ] },
        { name: "year", title: "年份", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" },
          { title: "更早", value: "更早" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "ykVariety",
      title: "综艺",
      functionName: "loadYkVariety",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "mainArea", title: "地区", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国内地", value: "中国内地" }, { title: "中国香港", value: "中国香港" },
          { title: "中国台湾", value: "中国台湾" }, { title: "韩国", value: "韩国" }, { title: "美国", value: "美国" },
          { title: "英国", value: "英国" }, { title: "日本", value: "日本" }, { title: "泰国", value: "泰国" } ] },
        { name: "year", title: "年份", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" },
          { title: "更早", value: "更早" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "ykAnime",
      title: "动漫",
      functionName: "loadYkAnime",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "mainArea", title: "地区", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国内地", value: "中国内地" }, { title: "韩国", value: "韩国" },
          { title: "美国", value: "美国" }, { title: "日本", value: "日本" }, { title: "泰国", value: "泰国" } ] },
        { name: "year", title: "年份", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" },
          { title: "更早", value: "更早" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "ykDoc",
      title: "纪录片",
      functionName: "loadYkDoc",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "mainArea", title: "地区", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国内地", value: "中国内地" }, { title: "美国", value: "美国" },
          { title: "英国", value: "英国" }, { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" } ] },
        { name: "year", title: "年份", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "更早", value: "更早" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "ykKids",
      title: "少儿",
      functionName: "loadYkKids",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "mainArea", title: "地区", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国内地", value: "中国内地" }, { title: "美国", value: "美国" },
          { title: "日本", value: "日本" }, { title: "韩国", value: "韩国" } ] },
        { name: "year", title: "年份", type: "enumeration", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "更早", value: "更早" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    }
  ]
};

var YK_FALLBACK = "https://youku.518518.qzz.io";
var YK_CAT = { tv: "电视剧", movie: "电影", variety: "综艺", anime: "动漫", doc: "纪录片", kids: "少儿" };

var YK_SLOT = 4, YK_BUSY = 0, YK_QUEUE = [];

function ykHasStorage() {
  return typeof Widget !== "undefined" && !!(Widget.storage && typeof Widget.storage.get === "function");
}
function ykAcquire() {
  if (YK_BUSY < YK_SLOT) { YK_BUSY++; return Promise.resolve(); }
  return new Promise(function (res) { YK_QUEUE.push(res); });
}
function ykRelease() {
  var next = YK_QUEUE.shift();
  if (next) next(); else YK_BUSY--;
}
function ykSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function ykJson(x) {
  if (typeof x === "string") {try{return JSON.parse(x)}catch(e){throw Error("Worker 响应非 JSON")}}
  return x || {};
}
function ykImage(x) {
  if (!x)return "";
  var u=String(typeof x==="string" ? x : x.url || x.src || "").trim();
  if(u.slice(0,2)==="//")u="https:"+u;
  return /^https?:\/\/\S+$/.test(u) ? u : "";
}
function ykUrl(cat,params,page) {
  params=params || {};
  var base=String(params.base || YK_FALLBACK).trim();
  if(!/^https?:\/\/[^/?#\s]+/i.test(base) || base.indexOf("#")>=0)throw Error("无效 Worker API 地址");
  base=base.replace(/\/+$/,"");
  var sep=base.indexOf("?")>=0 ? (/[?&]$/.test(base) ? "" : "&") : "?";
  var u=base+sep+"category="+encodeURIComponent(cat)+"&page="+Math.max(1,Math.min(100,parseInt(page,10)||1));
  if(params.mainArea)u+="&area="+encodeURIComponent(String(params.mainArea));
  if(params.year)u+="&year="+encodeURIComponent(String(params.year));
  return u;
}
function ykCards(raw,cat) {
  var body=ykJson(raw), d=body.data && typeof body.data==="object" ? body.data : {};
  if(body.ok===false || body.success===false || body.error)throw Error("Worker 接口错误: "+String(body.error || body.message || "?"));
  var items=body.items || body.list || body.results || d.items || d.list || d.videos || [];
  if(!Array.isArray(items))throw Error("Worker items 结构异常");
  var cards=[],seen={};
  for(var i=0;i<items.length;i++){
    var v=typeof items[i]==="string" ? {title:items[i]} : (items[i]||{});
    var title=String(v.title||v.name||v.videoTitle||v.showName||v.albumName||"").trim();
    if(!title)continue;
    var yr=String(v.year||v.releaseYear||v.publishYear||"");
    var year=/^\d{4}/.test(yr)?yr.slice(0,4):"";
    var key=ykNorm(title)+":"+year;
    if(seen[key])continue;
    seen[key]=1;
    cards.push({cid:"yk:"+cat+":"+String(v.id||v.vid||v.showId||v.albumId||key),title:title,year:year,
      poster:ykImage(v.posterUrl||v.poster_url||v.poster||v.cover||v.coverUrl||v.pic||v.picUrl||v.image||v.imageUrl||v.img),
      backdrop:ykImage(v.backdropUrl||v.backdrop||v.horizontalPic||v.landscape||v.hPic),
      description:String(v.description||v.desc||v.intro||"").slice(0,240)});
  }
  return cards;
}
function ykKey(u){var h=5381;for(var i=0;i<u.length;i++)h=((h<<5)+h+u.charCodeAt(i))|0;return "youku:v3:list:"+(h>>>0).toString(16)}
async function ykCacheList(key,rows) {
  if(!ykHasStorage())return null;
  try{
    if(rows){
      var w=Widget.storage.set(key,JSON.stringify({ts:Date.now(),rows:rows}));
      if(w&&typeof w.then==="function")await w;
      return rows;
    }
    var r=Widget.storage.get(key);
    if(r&&typeof r.then==="function")r=await r;
    var o=r?ykJson(r):{};
    return o.ts&&Date.now()-o.ts<21600000&&Array.isArray(o.rows)?o.rows:null;
  }catch(e){return null}
}
async function ykFetch(category,params,page) {
  var u=ykUrl(category,params,page),key=ykKey(u),error;
  for(var i=0;i<2;i++){
    try{
      var r=await Widget.http.get(u,{headers:{Accept:"application/json"}});
      if(r&&r.ok===false)throw Error("Worker HTTP "+(r.status||"?"));
      var cards=ykCards(r&&r.data!==undefined?r.data:r,category);
      await ykCacheList(key,cards);
      return cards;
    }catch(e){error=e;if(i===0)await ykSleep(350)}
  }
  var cached=await ykCacheList(key);
  if(cached&&cached.length){console.warn("[youku] Worker 无法连接，返回 6 小时内缓存",category);return cached}
  throw Error("优酷 Worker 请求失败（请检查「API 地址」）: "+(error&&error.message||error));
}

function ykNorm(s) {
  return String(s || "").toLowerCase().replace(/[\s·・:：!！?？,，.。'"、]/g, "").replace(/[（(][^)）]*[)）]/g, "");
}

function ykVariants(title) {
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
  return list;
}

function ykJunk(title) {
  return /(拆解|解说|盘点|大赏|合集|预告|花絮|精选|混剪|周周看|名场面|彩蛋|剧情回顾|幕后)/i.test(String(title || ""));
}

function ykGrams(s) {
  var t = ykNorm(s), set = {};
  for (var i = 0; i < t.length - 1; i++) set[t.substr(i, 2)] = 1;
  if (t.length === 1) set[t] = 1;
  return set;
}

function ykSim(a, b) {
  var ga = ykGrams(a), gb = ykGrams(b);
  var ka = Object.keys(ga), kb = Object.keys(gb);
  if (!ka.length || !kb.length) return 0;
  var inter = 0;
  for (var i = 0; i < ka.length; i++) if (gb[ka[i]]) inter++;
  return inter / (ka.length + kb.length - inter);
}

function ykBest(results,names,year,kind){
  var best=null,top=-1;
  for(var i=0;i<(results||[]).length;i++){
    var r=results[i];if(!r||!r.id)continue;
    var sim=0,title=r.name||r.title||"",alt=r.original_name||r.original_title||"";
    for(var j=0;j<names.length;j++)sim=Math.max(sim,ykSim(names[j],title),alt?ykSim(names[j],alt):0);
    if(sim<0.63)continue;
    var date=String(r.first_air_date||r.release_date||""),score=sim;
    if(year&&/^\d{4}/.test(date)){
      var dif=Math.abs(Number(year)-Number(date.slice(0,4)));
      score+=dif===0?0.14:dif===1?0.05:dif>3?-0.14:0;
    }
    score+=Math.min(0.03,Number(r.popularity||0)/50000);
    if(score>top){top=score;best=r}
  }
  return best?{id:best.id,kind:kind,poster:best.poster_path||"",backdrop:best.backdrop_path||"",
    date:best.first_air_date||best.release_date||"",vote:Number(best.vote_average||0)}:null;
}

async function ykSearch(kind,query){
  var err;
  for(var i=0;i<2;i++){
    await ykAcquire();
    try{
      if(!Widget.tmdb||typeof Widget.tmdb.get!=="function")throw Error("TMDB 不可用");
      var r=await Widget.tmdb.get("/search/"+kind,{params:{query:query,language:"zh-CN",include_adult:false}});
      var body=ykJson(r&&r.data!==undefined?r.data:r);
      return Array.isArray(body.results)?body.results:[];
    }catch(e){err=e}finally{ykRelease()}
    if(i===0)await ykSleep(280);
  }
  throw Error("TMDB 查询失败: "+(err&&err.message||err));
}

async function ykCacheGet(key){
  if(!ykHasStorage())return null;
  try{
    var r=Widget.storage.get(key);
    if(r&&typeof r.then==="function")r=await r;
    var o=r?ykJson(r):{};
    return o.ts&&Date.now()-o.ts<(o.id?604800000:7200000)?o:null;
  }catch(e){return null}
}
async function ykCacheSet(key,obj){
  if(!ykHasStorage()||typeof Widget.storage.set!=="function")return;
  try{
    var value={};for(var k in obj)if(Object.prototype.hasOwnProperty.call(obj,k))value[k]=obj[k];
    value.ts=Date.now();
    var r=Widget.storage.set(key,JSON.stringify(value));
    if(r&&typeof r.then==="function")await r;
  }catch(e){}
}

async function ykMatchOne(card,kind){
  if(ykJunk(card.title))return null;
  var key="youku:v3:tmdb:"+kind+":"+card.cid,cached=await ykCacheGet(key);
  if(cached)return cached.id?cached:null;
  var names=ykVariants(card.title).slice(0,3);
  if(!names.length)return null;
  var hit=null;
  for(var i=0;i<names.length&&!hit;i++)hit=ykBest(await ykSearch(kind,names[i]),names,card.year,kind);
  if(!hit){var alt=kind==="tv"?"movie":"tv";hit=ykBest(await ykSearch(alt,names[0]),names,card.year,alt)}
  await ykCacheSet(key,hit||{id:0});
  return hit;
}
function ykToItem(card,hit){
  var poster=(hit.poster?"https://image.tmdb.org/t/p/w500"+hit.poster:"")||card.poster||"";
  var backdrop=(hit.backdrop?"https://image.tmdb.org/t/p/w780"+hit.backdrop:"")||card.backdrop||poster;
  var item={id:String(hit.id),type:"tmdb",title:card.title,mediaType:hit.kind,tmdbId:String(hit.id),
    releaseDate:hit.date||card.year||""};
  if(poster)item.posterUrl=poster;
  if(backdrop)item.backdropUrl=backdrop;
  if(card.year)item.year=card.year;
  if(card.description)item.description=card.description;
  if(hit.vote>0)item.rating=hit.vote;
  return item;
}
async function ykResolveAll(cards,kind){
  var out=new Array(cards.length),ptr=0,errors=0;
  async function worker(){
    while(ptr<cards.length){
      var i=ptr++;
      try{var match=await ykMatchOne(cards[i],kind);if(match&&match.id)out[i]=ykToItem(cards[i],match)}
      catch(e){errors++;console.warn("[youku] TMDB 匹配失败",cards[i].cid,e&&e.message)}
    }
  }
  var jobs=[];for(var j=0;j<YK_SLOT&&j<cards.length;j++)jobs.push(worker());
  await Promise.all(jobs);
  var items=[],seen={};
  for(var k=0;k<out.length;k++){
    var item=out[k];if(!item)continue;
    var id=item.mediaType+":"+item.id;
    if(seen[id])continue;
    seen[id]=1;items.push(item);
  }
  if(errors)console.warn("[youku] 匹配异常条目数",errors);
  return items;
}

async function loadYkChannel(chKey, params) {
  params = params || {};
  var cat = YK_CAT[chKey];
  if (!cat) return [];
  try {
    var cards = await ykFetch(cat, params, parseInt(params.page, 10) || 1);
    if (!cards.length){console.warn("[youku] Worker 当前页无数据",chKey);return []}
    var items=await ykResolveAll(cards,chKey==="movie"?"movie":"tv");
    console.log("[youku] 分类",chKey,"原始",cards.length,"有效",items.length);
    return items;
  } catch (e) {
    console.error("[youku] load fail", chKey, e && e.message);
    return [];
  }
}

async function loadYkTv(params) { return await loadYkChannel("tv", params); }
async function loadYkMovie(params) { return await loadYkChannel("movie", params); }
async function loadYkVariety(params) { return await loadYkChannel("variety", params); }
async function loadYkAnime(params) { return await loadYkChannel("anime", params); }
async function loadYkDoc(params) { return await loadYkChannel("doc", params); }
async function loadYkKids(params) { return await loadYkChannel("kids", params); }
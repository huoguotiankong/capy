/*
 * CapyPlayer Widget: 红果短剧（官网目录适配）
 * Based on the supplied FongMi/TVBox source 红果短剧(弹幕+显季版).py.
 *
 * IMPORTANT: the original Python playback depends on signed video-model requests,
 * CENC decryption, byte-range rewriting and a local HTTP server. The documented
 * CapyPlayer Widget sandbox cannot provide that stream server. This widget never
 * invents playable media URLs. Playback requires a separately deployed and
 * authorized streaming bridge with Range support (see README).
 */
var HG_SITE = "https://hongguoduanju.com";
var HG_STREAM_BRIDGE = ""; // Optional: e.g. https://your-own-authorized-stream-service.example
var HG_UA = "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
var HG_HEADERS = {
  "User-Agent": HG_UA,
  "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9",
  "Referer": HG_SITE + "/"
};
var HG_CATEGORIES = {
  "real-drama": [
    ["", "全部"], ["romance", "爱情"], ["period", "年代"], ["comeback", "逆袭"],
    ["legend", "传奇"], ["growth", "成长"], ["family", "家庭"], ["clan", "家族"],
    ["cute-kids", "萌宝"], ["suspense", "悬疑"], ["thriller", "惊悚"],
    ["horror", "恐怖"], ["supernatural", "志怪"], ["costume", "古装"],
    ["fantasy", "玄幻"], ["wonder", "奇幻"], ["urban", "都市"],
    ["youth", "青春"], ["comedy", "喜剧"], ["sci-fi", "科幻"],
    ["disaster", "灾难"], ["action-adventure", "动作冒险"],
    ["war", "战争"], ["variety", "综艺"], ["drama", "剧情"]
  ],
  "comic-drama": [
    ["", "全部"], ["creative", "脑洞"], ["fantasy", "玄幻"],
    ["drama", "剧情"], ["apocalypse", "末世"], ["wealthy-family", "豪门"],
    ["wonder", "奇幻"], ["sci-fi", "科幻"], ["adventure", "冒险"]
  ],
  "ai-drama": [
    ["", "全部"], ["creative", "脑洞"], ["fantasy", "玄幻"],
    ["drama", "剧情"], ["apocalypse", "末世"], ["wealthy-family", "豪门"],
    ["wonder", "奇幻"], ["sci-fi", "科幻"], ["adventure", "冒险"]
  ],
  "comic": [["", "全部"]]
};

function hgGenres(route) {
  return HG_CATEGORIES[route].map(function (g) { return { title: g[1], value: g[0] }; });
}
function hgCategoryParams(route) {
  var ps = [{ name: "page", label: "页码", type: "page" }];
  if (HG_CATEGORIES[route].length > 1) ps.push({
    name: "genre", label: "题材", type: "enum", defaultValue: "", enumOptions: hgGenres(route)
  });
  return ps;
}
var WidgetMetadata = {
  id: "mx.hongguo",
  title: "红果短剧",
  description: "官网分类、搜索、跨季导航与官网已开放集直链；完整剧集播放需合法可用的流服务。",
  author: "MX / huoguotiankong",
  version: "0.3.0",
  icon: "https://syimg.3dmgame.com/uploadimg/ico/2024/0524/1716534162709037.png",
  site: HG_SITE,
  // User-configured only. Never store the bridge token in this public script.
  globalParams: [
    {name:"hgBridgeUrl",label:"播放桥接地址（局域网）",type:"string",
     description:"例如 http://192.168.1.10:8931，需自己启动受信任的播放服务"},
    {name:"hgBridgeToken",label:"桥接访问口令",type:"string",
     description:"本地桥接服务启动时显示的 HG_BRIDGE_TOKEN，请勿上传到 GitHub"}
  ],
  modules: [
    { id: "hg_hot", title: "红果热播", type: "media_list", functionName: "getHongguoHot", cacheDuration: 900, timeoutSeconds: 30, params: [{ name: "page", label: "页码", type: "page" }] },
    { id: "hg_real", title: "真人剧", type: "media_list", functionName: "getHongguoReal", cacheDuration: 900, timeoutSeconds: 30, params: hgCategoryParams("real-drama") },
    { id: "hg_comic_drama", title: "漫剧", type: "media_list", functionName: "getHongguoComicDrama", cacheDuration: 900, timeoutSeconds: 30, params: hgCategoryParams("comic-drama") },
    { id: "hg_ai_drama", title: "AI剧", type: "media_list", functionName: "getHongguoAiDrama", cacheDuration: 900, timeoutSeconds: 30, params: hgCategoryParams("ai-drama") },
    { id: "hg_comic", title: "漫画", type: "media_list", functionName: "getHongguoComic", cacheDuration: 900, timeoutSeconds: 30, params: hgCategoryParams("comic") },
    { id: "hg_search", title: "搜索短剧", type: "media_list", functionName: "searchHongguo", cacheDuration: 180, timeoutSeconds: 30, params: [
      { name: "query", label: "剧名关键词", type: "string", required: true },
      { name: "page", label: "页码", type: "page" }
    ] }
  ]
};

function hgArray(value) { return Array.isArray(value) ? value : []; }
function hgObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function hgString(value) { return value === undefined || value === null ? "" : String(value).trim(); }
function hgPage(params) { return Math.max(1, Math.min(999, Math.floor(Number((params || {}).page) || 1))); }
function hgUnique(items) {
  var ids = {};
  return items.filter(function (item) {
    if (!item || !item.id || !item.title || ids[item.id]) return false;
    ids[item.id] = true;
    return true;
  });
}
function hgId(row) {
  var vd = hgObject(row.video_data);
  return hgString(vd.series_id || row.series_id || row.keyword || vd.keyword);
}
function hgMedia(row) {
  row = hgObject(row);
  var vd = Object.keys(hgObject(row.video_data)).length ? row.video_data : row;
  var id = hgId(row);
  if (!id) return null;
  var title = hgString(vd.series_title || vd.series_name || row.series_name || row.name);
  if (!title) return null;
  var count = Number(vd.episode_cnt || row.episode_cnt) || 0;
  var intro = hgString(vd.series_intro || row.series_intro);
  return {
    id: "hg-" + id,
    title: title,
    type: "link",
    link: HG_SITE + "/detail?series_id=" + encodeURIComponent(id),
    mediaType: "tv",
    posterUrl: hgString(vd.series_cover || row.series_cover),
    description: intro,
    episodeCount: count > 0 ? count : undefined
  };
}
function hgMediaList(rows) { return hgUnique(hgArray(rows).map(hgMedia).filter(Boolean)); }

function hgBalancedJSON(text, pos) {
  // Parse an object literal following _ROUTER_DATA= without relying on eval or DOM.
  var start = text.indexOf("{", pos), depth = 0, quoted = false, escaped = false;
  if (start < 0) throw new Error("红果页面未找到路由 JSON 起点");
  for (var i = start; i < text.length; i++) {
    var ch = text.charAt(i);
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quoted = false;
    } else if (ch === '"') quoted = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  throw new Error("红果页面路由 JSON 不完整");
}
function hgRouter(html) {
  if (html && typeof html === "object" && html.loaderData) return html;
  var text = hgString(html);
  var match = /(?:window\.)?_ROUTER_DATA\s*=\s*/.exec(text);
  if (!match) throw new Error("红果页面未包含 _ROUTER_DATA，可能触发风控或页面升级");
  return hgBalancedJSON(text, match.index + match[0].length);
}

function hgDecode(text) {
  return String(text || "").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">");
}
function hgText(html) {
  return hgDecode(String(html||"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
    .replace(/<\/(?:div|p|h\d|span)>/gi,"\n").replace(/<[^>]+>/g," ")
    .replace(/[ \t]+/g," ").trim());
}
function hgAttr(tag, attr) {
  var patt=new RegExp("\\b"+attr+"\\s*=\\s*([\"'])(.*?)\\1","i"),m=patt.exec(tag);
  return m?hgDecode(m[2]):"";
}
function hgCardsHTML(html) {
  if(typeof html!=="string" || html.indexOf("series_id=")<0) return [];
  var links=[],docId=null;
  if(Widget.dom && Widget.dom.parse && Widget.dom.select) try {
    docId=Widget.dom.parse(html);
    var nodes=Widget.dom.select(docId,'a[href*="series_id="]');
    hgArray(nodes).forEach(function(n) {
      var href=Widget.dom.attr?Widget.dom.attr(n,"href"):"";
      links.push({href:href||hgObject(n.attributes).href,body:n.outerHtml||n.html||n.text||""});
    });
  }catch(e){console.warn("[红果] DOM 提取失败",String(e));}
  finally{if(docId && Widget.dom.remove)try{Widget.dom.remove(docId);}catch(_){}}
  var rex=/<a\b[^>]*href\s*=\s*(["'])([^"']*series_id=[^"']*)\1[^>]*>([\s\S]*?)<\/a>/gi,m;
  while((m=rex.exec(html))!==null)links.push({href:m[2],body:m[3]});
  var rows=[],seen={};
  links.forEach(function(link) {
    var id=/[?&]series_id=(\d+)/.exec(hgDecode(link.href||""));
    if(!id || seen[id[1]]) return;
    var inner=link.body||"",img=/<img\b[^>]*>/i.exec(inner), imgTag=img?img[0]:"";
    var cover=hgAttr(imgTag,"src")||hgAttr(imgTag,"data-src");
    if(/^data:/.test(cover))cover=hgAttr(imgTag,"data-src");
    if(cover.indexOf("//")===0)cover="https:"+cover;
    else if(cover.charAt(0)==="/")cover=HG_SITE+cover;
    var title="",titleTag=/<(?:h2|h3|h4|span|div)[^>]*class\s*=\s*["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h2|h3|h4|span|div)>/i.exec(inner);
    if(titleTag)title=hgText(titleTag[1]).trim();
    if(!title)title=hgAttr(imgTag,"alt");
    var t=hgText(inner);
    if(!title) {
      var lines=t.split(/\n+/);
      for(var i=0;i<lines.length;i++){
        var x=lines[i].trim().replace(/^(?:全|更新至)\s*\d+\s*集\s*/,"");
        if(x.length>1 && x.length<100){title=x;break;}
      }
    }
    if(!title)return;
    var count=/(?:全|更新至)\s*(\d+)\s*集/.exec(t);
    seen[id[1]]=true;
    rows.push({series_id:id[1],series_name:title,series_cover:cover,episode_cnt:count?Number(count[1]):0});
  });
  return hgMediaList(rows);
}
function hgDetailHTML(html,sid) {
  if(typeof html!=="string")return null;
  var m=/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  var title=m?hgText(m[1]).trim():"";
  if(!title)return null;
  var meta=/<meta\b[^>]*name=["']description["'][^>]*>/i.exec(html);
  var desc=meta?hgAttr(meta[0],"content"):"";
  var image=/<meta\b[^>]*property=["']og:image["'][^>]*>/i.exec(html);
  var cover=image?hgAttr(image[0],"content"):"";
  var count=/(?:全|更新至)\s*(\d+)\s*集/.exec(hgText(html));
  return {series_id:sid,series_name:title,series_intro:desc,series_cover:cover,
    episode_cnt:count?Number(count[1]):0,vid_list:[]};
}

var HG_PAGE_CACHE = {};
async function hgPageResponse(url, bot) {
  var cached=HG_PAGE_CACHE[url];
  if(!bot && cached && Date.now()-cached.at<15000)return cached.data;
  var hdr=Object.assign({},HG_HEADERS);
  if(bot)hdr["User-Agent"]="Googlebot";
  var raw=await hgGet(url,hdr);
  var data=raw;
  if(data && typeof data==="object" && typeof data.html==="string")data=data.html;
  var html=typeof data==="string"?data:"";
  var router=null;
  if(data && typeof data==="object" && data.loaderData)router=data;
  else try{router=hgRouter(data);}catch(_){}
  var obj={router:router,html:html};
  if(!bot)HG_PAGE_CACHE[url]={at:Date.now(),data:obj};
  return obj;
}
async function hgHomeCategory(route) {
  var p=await hgPageResponse(HG_SITE+"/",false);
  var all=hgArray(hgLoader(p.router,"page").homeSections);
  var types={"real-drama":"human","comic-drama":"comic","ai-drama":"ai"};
  var rows=[];
  all.forEach(function(section) {
    if(hgString(hgObject(section).tab_type)===types[route])rows=rows.concat(hgArray(section.video_list));
  });
  return hgMediaList(rows);
}

async function hgGet(url, headers) {
  var response = await Widget.http.get(url, { headers: headers || HG_HEADERS, timeout: 8500 });
  if (!response || !response.ok) throw new Error("HTTP " + (response ? response.status : "no response") + " " + url);
  return response.data;
}
async function hgPageData(url) {
  var raw = await hgGet(url);
  return hgRouter(raw);
}
function hgLoader(obj, key) { return hgObject(hgObject(obj.loaderData)[key]); }
async function hgCategory(route, params) {
  params=params||{};
  hgBridgeConfig(params);
  var genre=hgString(params.genre),allowed=HG_CATEGORIES[route]||[];
  if(!allowed.some(function(g){return g[0]===genre;}))genre="";
  var page=hgPage(params);
  var base=HG_SITE+"/category/"+route+(genre?"/"+encodeURIComponent(genre):"");
  var urls=page===1?[base,base+"?page=1"]:[base+"?page="+page],errors=[];
  for(var i=0;i<urls.length;i++){
    try {
      var res=await hgPageResponse(urls[i],false);
      if(res.router){
        var ld=hgLoader(res.router,"category_$");
        if(!Object.keys(ld).length)ld=hgLoader(res.router,"category_page");
        var mapped=hgMediaList(ld.recommendList);
        if(mapped.length)return mapped;
      }
      var fromHTML=hgCardsHTML(res.html);
      if(fromHTML.length){console.warn("[红果] 分类 HTML 兜底",route,fromHTML.length);return fromHTML;}
    }catch(e){errors.push(String(e));}
  }
  // In particular, /category/comic sometimes responds with challenge HTML
  // for Android UA. Retry once as a crawler before returning an empty array.
  if(route==="comic" && page===1)try {
    var bot=await hgPageResponse(base,true);
    if(bot.router){
      var raw=hgLoader(bot.router,"category_$");
      var items=hgMediaList(raw.recommendList);
      if(items.length)return items;
    }
    var htmlItems=hgCardsHTML(bot.html);
    if(htmlItems.length)return htmlItems;
  }catch(e){errors.push(String(e));}
  if(page===1 && !genre)try {
    var home=await hgHomeCategory(route);
    if(home.length){console.warn("[红果] 分类首页板块兜底",route,home.length);return home;}
  }catch(e){errors.push(String(e));}
  console.warn("[红果] 分类无有效结果",route,page,errors.join(" | "));
  return [];
}
async function getHongguoHot(params) {
  hgBridgeConfig(params);
  var page = hgPage(params);
  if (page > 1) return hgCategory("real-drama", { page: page });
  try {
    var data = await hgPageData(HG_SITE + "/");
    var sections = hgArray(hgLoader(data, "page").homeSections);
    var items = [];
    sections.forEach(function (section) { items = items.concat(hgMediaList(hgObject(section).video_list)); });
    if (items.length) return hgUnique(items);
    return hgCategory("real-drama", { page: 1 });
  } catch (e) {
    console.warn("[红果] 首页失败，尝试分类兜底", String(e));
    return hgCategory("real-drama", { page: 1 });
  }
}
async function getHongguoReal(params) { return hgCategory("real-drama", params); }
async function getHongguoComicDrama(params) { return hgCategory("comic-drama", params); }
async function getHongguoAiDrama(params) { return hgCategory("ai-drama", params); }
async function getHongguoComic(params) { return hgCategory("comic", params); }

async function hgSearchAPI(query, page) {
  // Like the Python source, warm up the main site first: the search API may
  // require a site cookie. Cookie persistence depends on Widget.http behavior.
  try { await hgGet(HG_SITE + "/"); } catch (_) { /* search might still succeed */ }
  var url = HG_SITE + "/api/search/result?aid=8662&query=" + encodeURIComponent(query) + "&page=" + page;
  var data = await hgGet(url, {
    "User-Agent": HG_UA, "Referer": HG_SITE + "/", "Accept": "application/json, text/plain, */*"
  });
  if (typeof data === "string") data = JSON.parse(data);
  return hgObject(data);
}
async function searchHongguo(params) {
  params = params || {};
  hgBridgeConfig(params);
  var key = hgString(params.query || params.keyword);
  if (!key) return [];
  var page = hgPage(params);
  try {
    var data = await hgSearchAPI(key, page);
    if (hgArray(data.searchList).length) return hgMediaList(data.searchList);
  } catch (e) { console.warn("[红果] 搜索 API 失败，使用分类兜底", String(e)); }
  // Bounded fallback, not the 32-page concurrent scan used by Python.
  var routes = ["real-drama", "comic-drama", "ai-drama", "comic"];
  var results = await Promise.all(routes.map(async function (route) {
    try { return await hgCategory(route, { page: page }); }
    catch (_) { return []; }
  }));
  return hgUnique([].concat.apply([], results).filter(function (item) {
    return item.title.indexOf(key) >= 0;
  }));
}

function hgSeasonNumber(title) {
  var m = /第\s*([0-9]{1,3}|[一二三四五六七八九十]{1,3})\s*[季部]/.exec(hgString(title));
  if (!m) return 0;
  var v = m[1];
  if (/^\d+$/.test(v)) return Number(v);
  var digits = "零一二三四五六七八九十";
  if (v === "十") return 10;
  var split = v.split("十");
  if (split.length === 2) return (split[0] ? digits.indexOf(split[0]) : 1) * 10 + (split[1] ? digits.indexOf(split[1]) : 0);
  return digits.indexOf(v) > 0 ? digits.indexOf(v) : 0;
}
function hgBaseName(title) {
  return hgString(title).replace(/第\s*([0-9]{1,3}|[一二三四五六七八九十]{1,3})\s*[季部]/g, "").replace(/^[：:·\-—_\s]+|[：:·\-—_\s]+$/g, "");
}
function hgGroupId(sd) { return hgString(hgObject(sd.season_info).series_group_id); }
function hgSeriesId(link) {
  var val = hgString(link);
  var match = /[?&]series_id=([^&#]+)/.exec(val);
  if (match) return decodeURIComponent(match[1]);
  return /^(hg-|hg-series-v1:)?\d+$/.test(val) ? val.replace(/^(hg-|hg-series-v1:)/, "") : "";
}

function hgDeepDetail(obj, sid) {
  if (!obj || typeof obj!=="object") return {};
  var stack=[obj],visited=0;
  while(stack.length && visited++<500){
    var x=stack.pop();
    if (!x || typeof x!=="object") continue;
    if (x.seriesDetail && typeof x.seriesDetail==="object") {
      var sd=x.seriesDetail;
      if(!sd.series_id || String(sd.series_id)===String(sid)) return sd;
    }
    if (x.vid_list && x.series_name && (!x.series_id || String(x.series_id)===String(sid))) return x;
    if(Array.isArray(x)){for(var i=0;i<x.length && i<12;i++) if(x[i] && typeof x[i]==="object")stack.push(x[i]);}
    else Object.keys(x).forEach(function(k){if(x[k] && typeof x[k]==="object")stack.push(x[k]);});
  }
  return {};
}
function hgVidListHTML(html) {
  if(typeof html!=="string")return [];
  var m=/"vid_list"\s*:\s*(\[[^\]]{1,40000}\])/i.exec(html);
  if(!m)return [];
  try{return hgArray(JSON.parse(m[1])).map(hgString).filter(function(x){return /^\d+$/.test(x);});}
  catch(_){return [];}
}
function hgMergeDetail(primary,alt,sid) {
  var a=hgObject(primary),b=hgObject(alt),out=Object.assign({},b,a);
  out.series_id=hgString(a.series_id||b.series_id||sid);
  var ac=hgArray(a.vid_list),bc=hgArray(b.vid_list);
  out.vid_list=ac.length?ac:bc;
  if(!out.series_name)out.series_name=hgString(b.series_name);
  if(!out.series_cover)out.series_cover=hgString(b.series_cover);
  if(!out.series_intro)out.series_intro=hgString(b.series_intro);
  out.episode_cnt=Number(out.episode_cnt||out.episodeCount||out.vid_list.length||0);
  return out;
}
async function hgSeriesDetail(sid) {
  var urls=[HG_SITE+"/detail?series_id="+encodeURIComponent(sid),HG_SITE+"/player/"+encodeURIComponent(sid)];
  var best={},err="";
  for(var i=0;i<urls.length;i++){
    try {
      var p=await hgPageResponse(urls[i],false);
      var obj=hgDeepDetail(p.router,sid),plain=hgDetailHTML(p.html,sid);
      if(p.html && !hgArray(obj.vid_list).length)obj.vid_list=hgVidListHTML(p.html);
      if(!Object.keys(obj).length)obj=hgObject(plain);
      if(Object.keys(obj).length)best=hgMergeDetail(best,obj,sid);
      if(hgArray(best.vid_list).length && best.series_name)return best;
    } catch(e){err=String(e);}
  }
  if(best.series_name)return best;
  try {
    var bot=await hgPageResponse(urls[0],true);
    var fallback=hgDeepDetail(bot.router,sid);
    if(!Object.keys(fallback).length)fallback=hgDetailHTML(bot.html,sid);
    if(fallback)return hgMergeDetail(best,fallback,sid);
  }catch(e){err=String(e);}
  throw new Error("红果详情不可用("+sid+"): "+err);
}
function hgSeasonRef(id,title,poster) {
  var sid=hgString(id),name=hgString(title);
  if(!/^\d+$/.test(sid)||!name)return null;
  return {id:sid,title:name,number:hgSeasonNumber(name),posterUrl:hgString(poster)};
}
function hgSeasonReferences(sd,html) {
  var base=hgBaseName(sd.series_name),sid=hgString(sd.series_id),refs=[],seen={};
  if(!base || base.length<2)return [];
  function add(id,name,poster){
    var original=hgString(name);
    var p=original.indexOf(base);
    if(p<0 || p>2)return;
    var rest=original.slice(p+base.length);
    var season=/^第\s*([0-9]{1,3}|[一二三四五六七八九十百]{1,4})\s*[季部]/.exec(rest);
    if(!season)return;
    var core=base+season[0],ref=hgSeasonRef(id,core,poster);
    if(!ref || ref.id===sid || !ref.number || seen[ref.id])return;
    seen[ref.id]=true;refs.push(ref);
  }
  // The official /player page lists related seasons as real /player/{series_id} links.
  if(typeof html==="string"){
    var re=/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi,m;
    while((m=re.exec(html))!==null){
      var url=hgDecode(m[2]),id=/\/player\/(\d+)(?:\/|[?#]|$)/.exec(url)
        || /[?&]series_id=(\d+)/.exec(url);
      if(!id)continue;
      var img=/<img\b[^>]*>/i.exec(m[3]),tag=img?img[0]:"",name=hgAttr(tag,"alt");
      if(name.indexOf(base)<0)name=hgText(m[3]);
      var cover=hgAttr(tag,"src")||hgAttr(tag,"data-src");
      if(cover.indexOf("//")===0)cover="https:"+cover;
      if(cover.charAt(0)==="/")cover=HG_SITE+cover;
      add(id[1],name,cover);
    }
  }
  return refs.sort(function(a,b){return a.number-b.number;}).slice(0,29);
}
async function hgSeasonSearch(sd) {
  var base=hgBaseName(sd.series_name);
  if(!base||base.length<2)return [];
  var pages=[];
  try {
    var first=await hgSearchAPI(base,1);
    pages.push(first);
    if(first.hasMore) {
      var second=await hgSearchAPI(base,2);
      pages.push(second);
    }
  }catch(e){console.warn("[红果] 季搜索降级",String(e));}
  var rows=[];
  pages.forEach(function(p){rows=rows.concat(hgArray(p.searchList));});
  var seen={},refs=[];
  rows.forEach(function(r){
    var v=hgObject(r.video_data),id=hgId(r),name=hgString(v.series_title||v.series_name||r.name||r.series_name);
    var no=hgSeasonNumber(name);
    if(!id||id===hgString(sd.series_id)||!no||seen[id]||hgBaseName(name)!==base)return;
    seen[id]=true;refs.push(hgSeasonRef(id,name,hgString(v.series_cover||r.series_cover)));
  });
  return refs.filter(Boolean).sort(function(a,b){return a.number-b.number;}).slice(0,29);
}
function hgValidVideoURL(input) {
  var url=hgString(input);
  if(url.indexOf("//")===0)url="https:"+url;
  if(!/^https?:\/\/[a-z0-9][^\s"<>]+/i.test(url))return "";
  if(/hongguoduanju\.com\/(?:player|detail|category)/i.test(url))return "";
  if(/\.(?:jpg|jpeg|png|webp|svg|gif)(?:[?#]|$)/i.test(url))return "";
  return url;
}

function hgVideoValue(value,depth) {
  if(depth>5||value===null||value===undefined)return "";
  if(typeof value==="string"){
    var valueURL=hgValidVideoURL(value);
    if(valueURL)return valueURL;
    if(value.charAt(0)==="{")try{return hgVideoValue(JSON.parse(value),depth+1);}catch(_){}
    return "";
  }
  if(Array.isArray(value)){
    for(var i=0;i<value.length && i<12;i++){
      var nested=hgVideoValue(value[i],depth+1);
      if(nested)return nested;
    }
    return "";
  }
  if(typeof value==="object"){
    var keys=["main_url","mainUrl","video_url","videoUrl","url_list","urlList",
      "backup_url","backup_url_1","play_addr","play_url","download_url","url"];
    for(var j=0;j<keys.length;j++){
      if(value[keys[j]]!==undefined) {
        var found=hgVideoValue(value[keys[j]],depth+1);
        if(found)return found;
      }
    }
  }
  return "";
}
function hgDeepVideo(obj) {
  if(!obj||typeof obj!=="object")return "";
  var stack=[obj],visited=0;
  while(stack.length && visited++<400){
    var current=stack.shift();
    if(!current||typeof current!=="object")continue;
    // Prioritize video_player_info to avoid grabbing unrelated trailer media.
    if(current.video_player_info){
      var direct=hgVideoValue(current.video_player_info,0);
      if(direct)return direct;
    }
    if(current.videoPlayerInfo){
      var alt=hgVideoValue(current.videoPlayerInfo,0);
      if(alt)return alt;
    }
    if(current.main_url||current.video_url||current.play_addr){
      var directObj=hgVideoValue(current,0);
      if(directObj)return directObj;
    }
    if(Array.isArray(current))
      current.slice(0,10).forEach(function(x){if(x&&typeof x==="object")stack.push(x);});
    else Object.keys(current).forEach(function(k){
      if(current[k]&&typeof current[k]==="object")stack.push(current[k]);
    });
  }
  return "";
}
function hgVideoHTML(html) {
  if(typeof html!=="string")return "";
  var v=/<video\b[^>]*(?:src|data-src)\s*=\s*(["'])(.*?)\1/i.exec(html);
  if(v)return hgValidVideoURL(hgDecode(v[2]));
  var source=/<source\b[^>]*src\s*=\s*(["'])(.*?)\1/i.exec(html);
  return source?hgValidVideoURL(hgDecode(source[2])):"";
}
function hgPlayerEntriesHTML(html,sid) {
  var found={},re=/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi,m;
  while((m=re.exec(html||""))!==null){
    var match=new RegExp("/player/"+sid+"/(\\d+)(?:[?#]|$)").exec(hgDecode(m[2]));
    if(!match)continue;
    var number=Number(hgText(m[3]));
    if(number>0 && number<=2000)found[number]=match[1];
  }
  return found;
}
async function hgPlayerSnapshot(sid) {
  try{
    var p=await hgPageResponse(HG_SITE+"/player/"+encodeURIComponent(sid),false);
    return {html:p.html,router:p.router,detail:hgDeepDetail(p.router,sid),
      video:hgDeepVideo(p.router)||hgVideoHTML(p.html),
      links:hgPlayerEntriesHTML(p.html,sid)};
  }catch(e){console.warn("[红果] 官网播放页不可用",sid,String(e));
    return {html:"",router:null,detail:{},video:"",links:{}};}
}
async function hgOfficialOpenEpisodes(sid,sd,player) {
  var found={};
  if(player.video)found[1]=player.video;
  var vids=hgArray(sd.vid_list),links=hgObject(player.links);
  var announced=Number(sd.accessible_episode_cnt||player.detail.accessible_episode_cnt||0);
  // Official site often exposes up to three web-viewable episodes. Request
  // only entries which the site itself marks accessible through links.
  var pages=[];
  for(var ep=2;ep<=3;ep++){
    if(announced && ep>announced)break;
    var vid=hgString(vids[ep-1]||links[ep]);
    if(!/^\d+$/.test(vid))continue;
    pages.push({ep:ep,vid:vid});
  }
  var matches=await Promise.all(pages.map(async function(item){
    try{
      var p=await hgPageResponse(HG_SITE+"/player/"+encodeURIComponent(sid)+"/"+encodeURIComponent(item.vid),false);
      var url=hgDeepVideo(p.router)||hgVideoHTML(p.html);
      return url?{ep:item.ep,url:url}:null;
    }catch(_){return null;}
  }));
  matches.filter(Boolean).forEach(function(item){found[item.ep]=item.url;});
  return found;
}


function hgBridgeConfig(params) {
  params=params||{};
  try {
    if(Object.prototype.hasOwnProperty.call(params,"hgBridgeUrl")) {
      Widget.storage.set("mx.hongguo.streamBridge",hgString(params.hgBridgeUrl));
    }
    if(Object.prototype.hasOwnProperty.call(params,"hgBridgeToken")) {
      Widget.storage.set("mx.hongguo.streamToken",hgString(params.hgBridgeToken));
    }
  }catch(e){console.warn("[红果] 播放配置存储不可用",String(e));}
}
function hgBridgeToken() {
  try {return hgString(Widget.storage.get("mx.hongguo.streamToken",""));}
  catch(_) {return "";}
}
async function hgBridgeAvailable(base) {
  if(!base||!hgBridgeToken())return false;
  // Local HTTP (LAN) or HTTPS: never send bridge secrets over a remote
  // unencrypted public HTTP origin.
  var hostname=/^http:\/\/([^/:]+)/i.exec(base),h=hostname?hostname[1]:"";
  var isLAN=/^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/i.test(h);
  if(base.indexOf("http://")===0&&!isLAN) {
    console.warn("[红果] 非局域网地址必须使用 HTTPS");
    return false;
  }
  try {
    var resp=await Widget.http.get(base+"/health",{timeout:3500});
    var data=typeof resp.data==="string"?JSON.parse(resp.data):resp.data;
    return !!(resp&&resp.ok&&hgObject(data).service==="capy-hongguo-bridge");
  }catch(e){console.warn("[红果] 播放服务不可用",String(e));return false;}
}
async function hgBridgeWarm(bridge,vids) {
  if(!bridge||!hgBridgeToken())return;
  var seen={},selected=[];
  hgArray(vids).slice(0,3).forEach(function(v){
    var vid=hgString(v);
    if(/^\d+$/.test(vid)&&!seen[vid]){selected.push(vid);seen[vid]=true;}
  });
  await Promise.all(selected.map(async function(vid){
    try{
      await Widget.http.get(bridge+"/v1/hongguo/warm?vid="+encodeURIComponent(vid)+
        "&q=1080&token="+encodeURIComponent(hgBridgeToken()),{timeout:4000});
    }catch(e){console.warn("[红果] 预热未完成",String(e));}
  }));
}

function hgBridgeBase() {
  // Optional site-owner authorized streaming bridge; no default third-party relay.
  var base = hgString(HG_STREAM_BRIDGE);
  try {
    var stored = Widget.storage.get("mx.hongguo.streamBridge", "");
    if (stored) base = hgString(stored);
  } catch (_) { /* storage may be unavailable in test runner */ }
  return /^https?:\/\//.test(base) ? base.replace(/\/+$/, "") : "";
}
function hgStreamUrl(bridge, vid, quality) {
  return bridge + "/v1/hongguo/stream?vid=" + encodeURIComponent(vid) + "&q=" + encodeURIComponent(quality) + "&token=" + encodeURIComponent(hgBridgeToken());
}
function hgEpisodes(group,index,bridge,multiSeason,official) {
  var ids=hgArray(group.sd.vid_list),count=Math.min(2500,Math.max(ids.length,Number(group.sd.episode_cnt)||0));
  var out=[],id=hgString(group.id),season=group.number||index+1;
  for(var i=0;i<count;i++){
    var vid=hgString(ids[i]),n=i+1,url=hgValidVideoURL(hgObject(official)[n]);
    // Only an authorized bridge or a real public CDN URL creates a player item.
    if(!url && (!bridge || !/^\d+$/.test(vid)))continue;
    var item={id:"hg-episode-"+id+"-"+n,seasonNumber:season,episodeNumber:n,title:"第"+n+"集"};
    if(bridge && /^\d+$/.test(vid)){
      var qualities=multiSeason?[["1080","超清"]]:[["1080","超清"],["720","高清"],["540","标准"]];
      item.playSources=qualities.map(function(q,j){
        return {id:"q-"+q[0],title:q[1],videoUrl:hgStreamUrl(bridge,vid,q[0]),isDefault:j===0};
      });
    }else{
      item.videoUrl=url;
      item.customHeaders={"Referer":HG_SITE+"/","User-Agent":HG_UA};
    }
    out.push(item);
  }
  return out;
}
async function loadDetail(link) {
  var sid=hgSeriesId(link);
  if(!sid||!/^\d+$/.test(sid))throw new Error("无效的 series_id: "+hgString(link));
  // The page returned to CapyPlayer must contain actual videoUrl(s);
  // metadata-only episode placeholders are deliberately excluded by the app.
  var sd=await hgSeriesDetail(sid);
  var player=await hgPlayerSnapshot(sid);
  sd=hgMergeDetail(sd,player.detail,sid);
  if(!hgArray(sd.vid_list).length)sd.vid_list=hgVidListHTML(player.html);
  // If SSR has been degraded to HTML, preserve IDs from publicly
  // visible episode links as an incremental fallback.
  if(!hgArray(sd.vid_list).length) {
    var known=hgObject(player.links),keys=Object.keys(known).map(Number).sort(function(a,b){return a-b;});
    var consecutive=[],expected=1;
    keys.forEach(function(n){if(n===expected && /^\d+$/.test(hgString(known[n]))) {
      consecutive.push(hgString(known[n]));expected++;
    }});
    if(consecutive.length)sd.vid_list=consecutive;
  }
  var base=hgBaseName(sd.series_name),configuredBridge=hgBridgeBase();
  var bridge=await hgBridgeAvailable(configuredBridge)?configuredBridge:"";
  if(bridge)await hgBridgeWarm(bridge,sd.vid_list);
  var related=hgSeasonReferences(sd,player.html);
  if(!related.length && hgSeasonNumber(sd.series_name))related=await hgSeasonSearch(sd);
  var group={id:sid,sd:sd,number:hgSeasonNumber(sd.series_name)||1};
  var groups=[group];
  if(bridge && related.length){
    // Populate other playable seasons only if a bridge is configured.
    var others=await Promise.all(related.slice(0,12).map(async function(r){
      try{
        var ds=await hgSeriesDetail(r.id);
        if(!hgArray(ds.vid_list).length)return null;
        if(hgGroupId(sd) && hgGroupId(ds) && hgGroupId(ds)!==hgGroupId(sd))return null;
        return {id:r.id,sd:ds,number:r.number};
      }catch(_){return null;}
    }));
    groups=groups.concat(others.filter(Boolean));
  }
  var openVideos=bridge?{}:await hgOfficialOpenEpisodes(sid,sd,player);
  var seasons=groups.map(function(g,i){
    var episodes=hgEpisodes(g,i,bridge,groups.length>1,g.id===sid?openVideos:{});
    return {id:"hg-season-"+g.id,seasonNumber:g.number,title:"第"+g.number+"季",
      episodeCount:episodes.length,episodes:episodes};
  }).filter(function(g){return g.episodes.length>0;}).sort(function(a,b){return a.seasonNumber-b.seasonNumber;});
  var recommendations=related.map(function(r){
    return {id:"hg-related-"+r.id,title:r.title,type:"link",mediaType:"tv",
      posterUrl:r.posterUrl||"",link:HG_SITE+"/detail?series_id="+encodeURIComponent(r.id)};
  });
  var actors=hgArray(sd.celebrities).map(function(a,i){
    var name=hgString(hgObject(a).nickname);
    return name?{id:"hg-cast-"+i,name:name}:null;
  }).filter(Boolean);
  var tags=hgArray(sd.tags).map(function(t){
    return typeof t==="string"?t:hgString(hgObject(t).name||hgObject(t).tag_name);
  }).filter(Boolean);
  var description=hgString(sd.series_intro);
  var playable=seasons.reduce(function(total,g){return total+g.episodes.length;},0);
  if(!bridge){
    description+=(description?"\n\n":"")+
      (playable?"[官网播放] 当前仅提供官网已开放并返回有效直链的 "+playable+
        " 集；其余剧集需官方应用或另外授权的流服务。":
        "[播放说明] 官网未提供可用直链；未授权剧集不生成假资源。");
  }
  if(configuredBridge&&!bridge)description+="\n[桥接状态] 地址已配置但未检测到可用播放服务，请确认电脑运行中、同一局域网及口令正确。";
  if(related.length)description+="\n[换季] 下方「推荐作品」中可点击其他季进入该季详情。";
  return {
    id:"hg-"+sid,title:hgString(sd.series_name),type:"link",
    link:HG_SITE+"/detail?series_id="+encodeURIComponent(sid),mediaType:"tv",
    posterUrl:hgString(sd.series_cover),description:description,
    episodeCount:Number(sd.episode_cnt)||hgArray(sd.vid_list).length||playable,
    seasonCount:seasons.length||1,currentSeason:group.number,currentSeasonId:"hg-season-"+sid,
    currentEpisode:1,tags:tags,credits:{cast:actors},seasons:seasons,recommendations:recommendations
  };
}

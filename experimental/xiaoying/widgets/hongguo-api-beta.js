/* CapyPlayer 红果短剧 - 纯组件版，无需启动电脑或桥接服务。 */
var HG_SITE = "https://hongguoduanju.com";
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
  id: "mx.hongguo.xiaoying.beta",
  title: "红果短剧 · API试验版",
  description: "独立测试入口；在已获授权的服务账号与 Vercel 签名后端就绪时尝试临时播放地址。",
  author: "MX / huoguotiankong",
  version: "0.5.0-beta.2",
  icon: "https://syimg.3dmgame.com/uploadimg/ico/2024/0524/1716534162709037.png",
  site: HG_SITE,
  globalParams:[
    {name:"hgApiBase",label:"授权 API 后端 HTTPS 地址",type:"string",defaultValue:""},
    {name:"hgApiKey",label:"个人访问口令（非供应商密钥）",type:"string",defaultValue:""}
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
    ] },
    { id: "hg_series", title: "系列换季搜索", type: "media_list", functionName: "getHongguoSeries", cacheDuration: 300, timeoutSeconds: 30, params: [
      { name: "query", label: "系列名称", type: "string", required: true },
      { name: "page", label: "页码", type: "page" }
    ] },
    { id:"hg_api_rank",title:"API 榜单（实验）",type:"media_list",functionName:"hgApiRank",cacheDuration:300,
      params:[{name:"type",label:"榜单",type:"enum",defaultValue:"hot-drama",enumOptions:[
        {title:"热播榜",value:"hot-drama"},{title:"真人剧",value:"real-drama"},{title:"AI剧",value:"ai-drama"},{title:"漫剧",value:"comic-drama"}]},
        {name:"page",label:"页码",type:"page"}]},
    { id:"hg_api_search",title:"API 搜索（实验）",type:"media_list",functionName:"hgApiSearch",cacheDuration:120,
      params:[{name:"query",label:"关键词",type:"string",required:true}]} 
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
  hgApiRemember(params);
  params=params||{};
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
  hgApiRemember(params);
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
  hgApiRemember(params);
  params = params || {};
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


async function getHongguoSeries(params) {
  hgApiRemember(params);
  params=params||{};
  var term=hgString(params.query);if(!term)return [];
  try {
    var data=await hgSearchAPI(term,hgPage(params));
    var key=hgBaseName(term);
    return hgMediaList(data.searchList).filter(function(item){
      return hgBaseName(item.title).indexOf(key)>=0;
    }).sort(function(a,b){
      var x=hgBaseName(a.title),y=hgBaseName(b.title);
      return x!==y?x.localeCompare(y):hgSeasonNumber(a.title)-hgSeasonNumber(b.title);
    });
  }catch(e){console.warn("[红果] 系列换季搜索失败",String(e));return [];}
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



function hgEpisodes(group, official) {
  var n=group.number||1;
  return Object.keys(hgObject(official)).map(Number).filter(function(x){return x>0&&x<=2000;})
    .sort(function(a,b){return a-b;}).map(function(e){
      var url=hgValidVideoURL(official[e]);if(!url)return null;
      return {id:"hg-ep-"+group.id+"-"+e,seasonNumber:n,episodeNumber:e,
        title:"第"+e+"集",videoUrl:url,customHeaders:{"Referer":HG_SITE+"/","User-Agent":HG_UA}};
    }).filter(Boolean);
}

async function hgOtherSeasons(sd,player) {
  var list=hgSeasonReferences(sd,player.html),seen={};
  list.forEach(function(r){seen[r.id]=true;});
  if(hgSeasonNumber(sd.series_name)&&list.length<16)try{
    var found=await hgSeasonSearch(sd);
    found.forEach(function(r){if(!seen[r.id]){list.push(r);seen[r.id]=true;}});
  }catch(e){console.warn("[红果] 无法获取更多季",String(e));}
  return list.filter(function(r){
    return r&&r.id!==hgString(sd.series_id)&&r.number>0
      &&hgBaseName(r.title)===hgBaseName(sd.series_name);
  }).sort(function(a,b){return a.number-b.number;}).slice(0,25);
}
async function hgOpenSeason(ref,group) {
  try {
    var sd=await hgSeriesDetail(ref.id);
    if(group&&hgGroupId(sd)&&group!==hgGroupId(sd))return null;
    var p=await hgPlayerSnapshot(ref.id);
    sd=hgMergeDetail(sd,p.detail,ref.id);
    var links=await hgOfficialOpenEpisodes(ref.id,sd,p);
    var eps=hgEpisodes({id:ref.id,number:ref.number},links);
    return eps.length?{id:"hg-season-"+ref.id,seasonNumber:ref.number,
      title:"第"+ref.number+"季",episodeCount:eps.length,episodes:eps}:null;
  }catch(e){return null;}
}
async function loadDetailSite(link) {
  var sid=hgSeriesId(link);
  if(!sid||!/^\d+$/.test(sid))throw new Error("红果剧集 ID 无效");
  var sd=await hgSeriesDetail(sid),p=await hgPlayerSnapshot(sid);
  sd=hgMergeDetail(sd,p.detail,sid);
  if(!hgArray(sd.vid_list).length)sd.vid_list=hgVidListHTML(p.html);
  var no=hgSeasonNumber(sd.series_name)||1;
  var related=await hgOtherSeasons(sd,p),links=await hgOfficialOpenEpisodes(sid,sd,p);
  var eps=hgEpisodes({id:sid,number:no},links),seasons=eps.length?[{
    id:"hg-season-"+sid,seasonNumber:no,title:"第"+no+"季",
    episodeCount:eps.length,episodes:eps}]:[];
  if(seasons.length&&related.length){
    var siblings=await Promise.all(related.slice(0,2).map(function(r){return hgOpenSeason(r,hgGroupId(sd));}));
    siblings.filter(Boolean).forEach(function(r){seasons.push(r);});
    seasons.sort(function(a,b){return a.seasonNumber-b.seasonNumber;});
  }
  var recommendations=related.map(function(r){
    return {id:"hg-related-"+r.id,title:r.title,type:"link",mediaType:"tv",
      posterUrl:r.posterUrl||sd.series_cover||"",
      link:HG_SITE+"/detail?series_id="+encodeURIComponent(r.id)};
  });
  var cast=hgArray(sd.celebrities).map(function(a,i){
    var name=hgString(hgObject(a).nickname);
    return name?{id:"hg-cast-"+i,name:name}:null;
  }).filter(Boolean);
  var tags=hgArray(sd.tags).map(function(t){
    return typeof t==="string"?t:hgString(hgObject(t).name||hgObject(t).tag_name);
  }).filter(Boolean);
  var playCount=seasons.reduce(function(n,g){return n+g.episodes.length;},0);
  var desc=hgString(sd.series_intro);
  desc+=(desc?"\n\n":"")+(playCount?"[官网开放集] 找到"+playCount+"个候选直链，播放效果需要手机验证。":
    "[播放说明] 官网未提供普通播放器可以直接使用的视频流，受保护视频需要原生播放器支持。");
  if(related.length)desc+="\n[换季] 点击下方「类似作品」中的其他季即可进入对应详情。";
  return {id:"hg-"+sid,title:hgString(sd.series_name),type:"link",mediaType:"tv",
    link:HG_SITE+"/detail?series_id="+encodeURIComponent(sid),
    posterUrl:hgString(sd.series_cover),description:desc,
    episodeCount:Number(sd.episode_cnt)||hgArray(sd.vid_list).length||playCount,
    seasonCount:seasons.length||1,currentSeason:no,currentSeasonId:"hg-season-"+sid,
    currentEpisode:1,tags:tags,credits:{cast:cast},seasons:seasons,recommendations:recommendations};
}


/* Authorized third-party API adapter. This is NOT a DRM decryptor.
 * The stable playback URL redirects on-demand to the provider's own media URL.
 * Signing secrets stay on the server, never in this public Widget script. */
function hgApiRemember(params) {
  params=params||{};
  try {
    if (typeof params.hgApiBase==="string") Widget.storage.set("mx.hg.xyb.base",params.hgApiBase.trim());
    if (typeof params.hgApiKey==="string") Widget.storage.set("mx.hg.xyb.key",params.hgApiKey.trim());
  } catch(e){console.warn("[API测试] 配置存储失败",String(e));}
}
function hgApiConfig() {
  try {
    var base=hgString(Widget.storage.get("mx.hg.xyb.base","")).replace(/\/+$/,"");
    var key=hgString(Widget.storage.get("mx.hg.xyb.key",""));
    if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(base) || !key)return null;
    return {base:base,key:key};
  } catch(e){return null;}
}
function hgApiURL(config,op,params) {
  var parts=["op="+encodeURIComponent(op)];
  Object.keys(params||{}).forEach(function(k){
    var v=params[k];if(v!==undefined && v!==null && v!=="")parts.push(encodeURIComponent(k)+"="+encodeURIComponent(String(v)));
  });
  return config.base+"/api/hongguo?"+parts.join("&");
}
async function hgApiGet(op,params) {
  var config=hgApiConfig();
  if(!config)throw new Error("尚未配置授权服务地址和个人访问口令");
  var r=await Widget.http.get(hgApiURL(config,op,params),{timeout:10000,
    headers:{"X-Capy-Access-Key":config.key,"Accept":"application/json"}});
  if(!r||!r.ok)throw new Error("后端 HTTP "+(r&&r.status));
  var d=typeof r.data==="string"?JSON.parse(r.data):r.data;
  if(!d||d.code!==10000||!d.data)throw new Error("后端 API 未返回有效数据");
  return d.data;
}
function hgApiMap(x) {
  var sid=hgString(x.series_id),title=hgString(x.name);
  if(!/^\d+$/.test(sid)||!title)return null;
  return {id:"hg-api-"+sid,title:title,type:"link",link:HG_SITE+"/detail?series_id="+sid,
    mediaType:"tv",posterUrl:hgString(x.cover),description:hgString(x.intro)};
}
async function hgApiRank(params) {
  params=params||{};hgApiRemember(params);
  try{
    var d=await hgApiGet("rank",{type:params.type||"hot-drama",page:hgPage(params)});
    return hgUnique(hgArray(d.results).map(hgApiMap).filter(Boolean));
  }catch(e){console.warn("[API测试] 榜单不可用",String(e));return [];}
}
async function hgApiSearch(params) {
  params=params||{};hgApiRemember(params);
  if(!hgString(params.query))return [];
  try{
    var d=await hgApiGet("search",{keyword:params.query,page:1});
    return hgUnique(hgArray(d.results).map(hgApiMap).filter(Boolean));
  }catch(e){console.warn("[API测试] 搜索不可用",String(e));return [];}
}
function hgApiEpisodes(seriesId,detail,config,season) {
  return hgArray(detail.episodes).filter(function(x) {
    return x && x.playable===true && Number(x.ep)>0 && Number(x.ep)<=9999;
  }).map(function(ep){
    var n=Number(ep.ep),sources=hgArray(ep.play_sources).map(function(line,index){
      var ticket=hgString(line.ticket);
      if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(ticket))return null;
      return {id:hgString(line.id)||("line-"+index),title:hgString(line.title)||"高清",
        videoUrl:hgApiURL(config,"play",{ticket:ticket}),isDefault:index===0};
    }).filter(Boolean);
    if(!sources.length)return null;
    return {id:"hg-api-ep-"+seriesId+"-"+n,episodeNumber:n,seasonNumber:season,
      title:"第"+n+"集",playSources:sources,videoUrl:sources[0].videoUrl};
  }).filter(Boolean);
}
async function loadDetail(link) {
  var sid=hgSeriesId(link);
  if(!sid||!/^\d+$/.test(sid))return loadDetailSite(link);
  var cfg=hgApiConfig();
  if(!cfg)return loadDetailSite(link);
  var detail;
  try {detail=await hgApiGet("detail",{series_id:sid});}
  catch(e){console.warn("[API测试] 授权详情不可用，回退官网",String(e));return loadDetailSite(link);}
  var site={};
  try {site=await loadDetailSite(link);}catch(e){console.warn("[API测试] 官网详情未返回",String(e));}
  var name=hgString(detail.name||site.title),season=hgSeasonNumber(name)||1;
  var episodes=hgApiEpisodes(sid,detail,cfg,season);
  if(!episodes.length) {
    if(site&&site.title)return site;
    throw new Error("供应商未提供可用的授权播放集数");
  }
  var result={
    id:"hg-api-"+sid,title:name,mediaType:"tv",type:"link",
    link:HG_SITE+"/detail?series_id="+sid,posterUrl:hgString(detail.cover||site.posterUrl),
    description:hgString(detail.intro||site.description)+"\n[实验线路] 播放地址由个人授权签名后端按需获取，尚需真机验证。",
    episodeCount:Number(detail.episode_cnt)||episodes.length,
    seasonCount:1,currentSeason:season,currentEpisode:1,
    seasons:[{id:"hg-api-season-"+sid,seasonNumber:season,title:"第"+season+"季",episodeCount:episodes.length,episodes:episodes}],
    recommendations:hgArray(site.recommendations),tags:hgArray(detail.tags),
    credits:site.credits||{cast:[]}
  };
  return result;
}

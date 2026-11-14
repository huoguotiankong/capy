// ===== 腾讯视频片库 (CapyPlayer Widget) =====
// 固定安装：https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/qq.js
// 基于 MakkaPakka 原版改进；负责片库与 TMDB 详情匹配，不含视频播放解析。
var WidgetMetadata = {
  id: "qq.video.pc.makka",
  title: "腾讯视频片库",
  version: "1.1.0",
  description: "腾讯片库分类筛选、游标分页及 TMDB 详情匹配",
  site: "https://v.qq.com",
  icon: "https://raw.githubusercontent.com/luestr/IconResource/main/App_icon/120px/Tencent_Video.png",
  author: "MakkaPakka",
  modules: [
    {
      id: "qqTv",
      title: "电视剧",
      functionName: "loadQqTv",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "itype", title: "类型", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "爱情", value: "1" }, { title: "都市", value: "2" },
          { title: "青春", value: "3" }, { title: "奇幻", value: "4" }, { title: "武侠", value: "5" },
          { title: "古装", value: "6" }, { title: "科幻", value: "7" }, { title: "悬疑", value: "14" },
          { title: "喜剧", value: "13" }, { title: "家庭", value: "12" }, { title: "军旅", value: "11" } ] },
        { name: "iarea", title: "地区", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "内地", value: "0" }, { title: "中国香港", value: "14" },
          { title: "中国台湾", value: "4" }, { title: "美国", value: "8" }, { title: "韩国", value: "5" },
          { title: "日本", value: "10" }, { title: "英国", value: "1" }, { title: "泰国", value: "9" } ] },
        { name: "iyear", title: "年份", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "2024", value: "2" }, { title: "2023", value: "3" },
          { title: "2022", value: "4" }, { title: "2021", value: "5" }, { title: "2020-2016", value: "6" },
          { title: "2015-2011", value: "7" }, { title: "2010-2000", value: "8" }, { title: "更早", value: "9" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "75", defaultValue: "75", enumOptions: [
          { title: "最热", value: "75" }, { title: "最新上架", value: "79" }, { title: "高分好评", value: "85" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "qqMovie",
      title: "电影",
      functionName: "loadQqMovie",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "itype", title: "类型", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "动作", value: "4" }, { title: "喜剧", value: "3" },
          { title: "爱情", value: "5" }, { title: "科幻", value: "12" }, { title: "犯罪", value: "6" },
          { title: "冒险", value: "7" }, { title: "恐怖", value: "11" }, { title: "动画", value: "15" },
          { title: "战争", value: "8" }, { title: "悬疑", value: "10" } ] },
        { name: "iarea", title: "地区", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "内地", value: "100024" }, { title: "中国香港", value: "100025" },
          { title: "中国台湾", value: "100026" }, { title: "美国", value: "100029" }, { title: "日本", value: "100027" },
          { title: "韩国", value: "100028" }, { title: "英国", value: "15" }, { title: "法国", value: "16" } ] },
        { name: "iyear", title: "年份", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "2020" },
          { title: "2019", value: "20" }, { title: "2018", value: "2018" }, { title: "更早", value: "7" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "75", defaultValue: "75", enumOptions: [
          { title: "最热", value: "75" }, { title: "最新", value: "83" }, { title: "高分好评", value: "81" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "qqVariety",
      title: "综艺",
      functionName: "loadQqVariety",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "itype", title: "类型", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "游戏", value: "10" }, { title: "脱口秀", value: "2" },
          { title: "音乐舞台", value: "11" }, { title: "情感", value: "12" }, { title: "生活", value: "22" },
          { title: "喜剧", value: "14" }, { title: "竞技", value: "24" }, { title: "推理", value: "25" } ] },
        { name: "iarea", title: "地区", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "国内", value: "1" }, { title: "海外", value: "2" } ] },
        { name: "iyear", title: "年份", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "2026", value: "2026" }, { title: "2025", value: "2025" }, { title: "2024", value: "2024" }, { title: "2023", value: "2023" },
          { title: "2022", value: "2022" }, { title: "2021", value: "2021" }, { title: "2020", value: "50" },
          { title: "更早", value: "99" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "75", defaultValue: "75", enumOptions: [
          { title: "最热", value: "75" }, { title: "最近更新", value: "23" }, { title: "高分好评", value: "85" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "qqAnime",
      title: "动漫",
      functionName: "loadQqAnime",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "iarea", title: "地区", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "国漫", value: "1" }, { title: "日本", value: "2" },
          { title: "欧美", value: "3" }, { title: "其他", value: "4" } ] },
        { name: "itype", title: "类型", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "玄幻", value: "9" }, { title: "仙侠", value: "23" },
          { title: "恋爱", value: "7" }, { title: "搞笑", value: "1" }, { title: "冒险", value: "2" },
          { title: "科幻", value: "4" }, { title: "武侠", value: "13" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "75", defaultValue: "75", enumOptions: [
          { title: "最热", value: "75" }, { title: "最近更新", value: "23" }, { title: "高分好评", value: "85" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "qqDoc",
      title: "纪录片",
      functionName: "loadQqDoc",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "itype", title: "类型", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "自然", value: "4" }, { title: "美食", value: "10" },
          { title: "社会", value: "3" }, { title: "人文", value: "6" }, { title: "历史", value: "1" },
          { title: "军事", value: "2" }, { title: "科技", value: "8" } ] },
        { name: "sort", title: "排序", type: "enumeration", default: "75", defaultValue: "75", enumOptions: [
          { title: "最热", value: "75" }, { title: "最新", value: "74" }, { title: "高分好评", value: "85" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "qqKids",
      title: "少儿",
      functionName: "loadQqKids",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "iyear", title: "年龄段", type: "enumeration", default: "all", defaultValue: "all", enumOptions: [
          { title: "全部", value: "all" }, { title: "0-3岁", value: "1" }, { title: "4-6岁", value: "2" },
          { title: "7-9岁", value: "3" }, { title: "10岁以上", value: "4" }, { title: "全年龄", value: "7" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    }
  ]
};

var PC_API = "https://pbaccess.video.qq.com/trpc.multi_vector_layout.mvl_controller.MVLPageHTTPService/getMVLPage?&vversion_platform=18";
var PC_HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://v.qq.com",
  "Referer": "https://v.qq.com/tv-series-list/v-index.html",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
};
var CHANNELS = { tv: "100113", movie: "100173", variety: "100109", anime: "100119", doc: "100105", kids: "100150" };
var FILTER_KEYS = { sort: 1, itype: 1, iarea: 1, iyear: 1, anime_status: 1, item: 1, itrailer: 1, iregion: 1, characteristic: 1, exclusive: 1 };

var QQ_SLOT = 4, QQ_BUSY = 0, QQ_QUEUE = [];

function qqHasStorage() {
  return typeof Widget !== "undefined" && !!(Widget.storage && typeof Widget.storage.get === "function");
}
function qqAcquire() {
  if (QQ_BUSY < QQ_SLOT) { QQ_BUSY++; return Promise.resolve(); }
  return new Promise(function (res) { QQ_QUEUE.push(res); });
}
function qqRelease() {
  var next = QQ_QUEUE.shift();
  if (next) next(); else QQ_BUSY--;
}
function qqSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function pcBody(ch, filterParams, ctx) {
  return {
    page_params: { page_type: "operation", page_id: "channel_list", channel_id: ch, filter_params: filterParams || "" },
    page_bypass_params: {
      params: { platform_id: "2", caller_id: "3000010", data_mode: "default", user_mode: "default", specified_strategy: "" },
      scene: "operation"
    },
    page_context: ctx || {}
  };
}

function qqJson(v) {
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch (e) { throw new Error("腾讯返回了非 JSON 内容"); }
  }
  return v || {};
}
async function pcRequest(ch, filterParams, ctx) {
  var error;
  for (var n = 0; n < 2; n++) {
    try {
      var r = await Widget.http.post(PC_API, JSON.stringify(pcBody(ch, filterParams, ctx)), { headers: PC_HEADERS });
      if (r && r.ok === false) throw new Error("腾讯 HTTP " + (r.status || "?"));
      var j = qqJson(r && r.data !== undefined ? r.data : r);
      if (!j.data || typeof j.data !== "object") throw new Error("腾讯接口数据结构异常");
      return j;
    } catch (e) { error = e; if (n === 0) await qqSleep(300); }
  }
  throw error;
}
function qqImage(v) {
  if (!v) return "";
  var url = String(typeof v === "string" ? v : (v.url || v.src || "")).trim();
  if (url.slice(0, 2) === "//") url = "https:" + url;
  return /^https?:\/\/\S+$/i.test(url) ? url : "";
}
function pcCards(json) {
  var d = json.data || {};
  var groups = d.modules && d.modules.normal && d.modules.normal.cards || [];
  if (!Array.isArray(groups)) return [];
  var out = [], seen = {};
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i] || {}, child = g.children_list || {};
    var p = child.poster_card || g.poster_card;
    if (!p) continue;
    var list = Array.isArray(p) ? p : (p.cards || []);
    if (!Array.isArray(list)) continue;
    for (var j = 0; j < list.length; j++) {
      var raw = list[j] || {}, v = raw.params || raw;
      var id = String(v.cid || v.cover_id || v.coverId || "").trim();
      var title = String(v.title || v.video_title || v.name || "").trim();
      if (!id || !title || seen[id]) continue;
      seen[id] = 1;
      var y = String(v.year || v.release_year || "");
      out.push({
        cid: id, title: title, year: /^\d{4}/.test(y) ? y.slice(0,4) : "",
        poster: qqImage(v.new_pic_vt || v.vertical_pic || v.v_pic || v.poster || v.pic_vt || v.cover || v.pic || v.image_url),
        backdrop: qqImage(v.new_pic_hz || v.h_pic || v.landscape_pic || v.pic_hz),
        description: String(v.description || v.desc || v.sub_title || "").slice(0, 240)
      });
    }
  }
  return out;
}

function buildFilterParams(params) {
  var keys = Object.keys(params || {});
  var parts = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i], v = params[k];
    if (k === "page" || !FILTER_KEYS[k]) continue;
    if (v === undefined || v === null) continue;
    v = String(v).trim();
    if (!v || v === "all" || v === "-1") continue;
    parts.push(k + "=" + v);
  }
  return parts.join("&");
}

function qqNextContext(raw, n) {
  if (!raw || typeof raw !== "object" || !Object.keys(raw).length) return null;
  var c = {};
  for (var k in raw) if (Object.prototype.hasOwnProperty.call(raw,k)) c[k] = raw[k];
  var provided = parseInt(c._ctrl_page_index || c.page_index, 10);
  if (!provided || provided < n) {
    c.page_index = String(n);
    c._ctrl_page_index = String(n);
    for (var key in c) if (/_offset$/.test(key) && /^\d+$/.test(String(c[key]))) c[key] = String((n-1)*12);
  }
  return c;
}
function qqCtxKey(ch, filters, p) {
  return "qqpc:v2:ctx:" + ch + ":" + (filters || "-") + ":" + p;
}
async function qqReadContext(ch, filters, p) {
  if (!qqHasStorage()) return null;
  try {
    var x = Widget.storage.get(qqCtxKey(ch,filters,p));
    if (x && typeof x.then === "function") x = await x;
    var o = x ? qqJson(x) : {};
    return o.ctx && Date.now() - o.ts < 1200000 ? o.ctx : null;
  } catch(e) { return null; }
}
async function qqSaveContext(ch, filters, p, ctx) {
  if (!ctx || !qqHasStorage() || typeof Widget.storage.set !== "function") return;
  try {
    var r = Widget.storage.set(qqCtxKey(ch,filters,p), JSON.stringify({ts:Date.now(),ctx:ctx}));
    if (r && typeof r.then === "function") await r;
  } catch(e) {}
}
async function fetchPage(ch, filters, page) {
  var target = Math.max(1, Math.min(30, parseInt(page,10) || 1));
  var start = 1, ctx = {};
  for (var k = target; k > 1; k--) {
    var saved = await qqReadContext(ch,filters,k);
    if (saved) { start = k; ctx = saved; break; }
  }
  for (var p = start; p <= target; p++) {
    var response = await pcRequest(ch,filters,ctx);
    var cards = pcCards(response);
    var raw = response.data.page_context || response.data.pageContext || {};
    var next = qqNextContext(raw,p+1);
    if (next) await qqSaveContext(ch,filters,p+1,next);
    if (p === target) return cards;
    if (!next) { console.warn("[qq] 没有下一页游标",ch,p); return []; }
    ctx = next;
  }
  return [];
}

function qqNorm(s) {
  return String(s || "").toLowerCase().replace(/[\s·・:：!！?？,，.。'"、]/g, "").replace(/[（(][^)）]*[)）]/g, "");
}

function qqVariants(title) {
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

function qqJunk(title) {
  return /(拆解|解说|盘点|大赏|合集|预告|花絮|精选|混剪|周周看|名场面|彩蛋|剧情回顾|幕后)/i.test(String(title || ""));
}

function qqGrams(s) {
  var t = qqNorm(s), set = {};
  for (var i = 0; i < t.length - 1; i++) set[t.substr(i, 2)] = 1;
  if (t.length === 1) set[t] = 1;
  return set;
}

function qqSim(a, b) {
  var ga = qqGrams(a), gb = qqGrams(b);
  var ka = Object.keys(ga), kb = Object.keys(gb);
  if (!ka.length || !kb.length) return 0;
  var inter = 0;
  for (var i = 0; i < ka.length; i++) if (gb[ka[i]]) inter++;
  return inter / (ka.length + kb.length - inter);
}

function qqBest(results, names, year, kind) {
  var best = null, max = -1;
  for (var i = 0; i < (results || []).length; i++) {
    var r = results[i]; if (!r || !r.id) continue;
    var title = r.title || r.name || "", original = r.original_title || r.original_name || "";
    var sim = 0;
    for (var j = 0; j < names.length; j++) sim = Math.max(sim,qqSim(names[j],title),original ? qqSim(names[j],original) : 0);
    if (sim < 0.62) continue; // 强制名称相似，避免年份加分造成错配
    var score = sim, date = String(r.release_date || r.first_air_date || "");
    if (year && /^\d{4}/.test(date)) {
      var delta = Math.abs(Number(year)-Number(date.slice(0,4)));
      if (delta === 0) score += 0.14;
      else if (delta === 1) score += 0.05;
      else if (delta > 3) score -= 0.14;
    }
    score += Math.min(0.03, Number(r.popularity || 0)/50000);
    if (score > max) { max = score; best = r; }
  }
  if (!best) return null;
  return {id:best.id,kind:kind,poster:best.poster_path || "",backdrop:best.backdrop_path || "",
    date:best.release_date || best.first_air_date || "",vote:Number(best.vote_average || 0)};
}

async function qqSearch(kind, query) {
  var err;
  for (var n = 0; n < 2; n++) {
    await qqAcquire();
    try {
      if (!Widget.tmdb || typeof Widget.tmdb.get !== "function") throw new Error("TMDB 服务不可用");
      var r = await Widget.tmdb.get("/search/" + kind,
        {params:{query:query,language:"zh-CN",include_adult:false}});
      var d = qqJson(r && r.data !== undefined ? r.data : r);
      return Array.isArray(d.results) ? d.results : [];
    } catch(e) { err = e; }
    finally { qqRelease(); }
    if (n === 0) await qqSleep(280);
  }
  throw new Error("TMDB 查询失败: " + (err && err.message || err));
}

async function qqCacheGet(key) {
  if (!qqHasStorage()) return null;
  try {
    var x = Widget.storage.get(key);
    if (x && typeof x.then === "function") x = await x;
    var o = x ? qqJson(x) : {};
    return o.ts && Date.now()-o.ts < (o.id ? 604800000 : 7200000) ? o : null;
  } catch(e) { return null; }
}
async function qqCacheSet(key,obj) {
  if (!qqHasStorage() || typeof Widget.storage.set !== "function") return;
  try {
    var data = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj,k)) data[k] = obj[k];
    data.ts = Date.now();
    var p = Widget.storage.set(key,JSON.stringify(data));
    if (p && typeof p.then === "function") await p;
  } catch(e) {}
}

async function qqMatchOne(card,kind) {
  if (qqJunk(card.title)) return null;
  var key = "qqpc:v2:tmdb:" + kind + ":" + card.cid;
  var cached = await qqCacheGet(key);
  if (cached) return cached.id ? cached : null;
  var names = qqVariants(card.title).slice(0,3);
  if (!names.length) return null;
  var hit = null;
  for (var i = 0; i < names.length && !hit; i++)
    hit = qqBest(await qqSearch(kind,names[i]),names,card.year || null,kind);
  if (!hit) {
    var other = kind === "tv" ? "movie" : "tv";
    hit = qqBest(await qqSearch(other,names[0]),names,card.year || null,other);
  }
  await qqCacheSet(key,hit || {id:0});
  return hit;
}
function qqToItem(card,hit) {
  var poster = (hit.poster ? "https://image.tmdb.org/t/p/w500"+hit.poster : "") || card.poster || "";
  var backdrop = (hit.backdrop ? "https://image.tmdb.org/t/p/w780"+hit.backdrop : "") || card.backdrop || poster;
  if (!poster && !backdrop) return null;
  var item = {id:String(hit.id),type:"tmdb",title:card.title,mediaType:hit.kind,tmdbId:String(hit.id),
    posterUrl:poster,backdropUrl:backdrop,releaseDate:hit.date || card.year || ""};
  if (card.year) item.year = card.year;
  if (card.description) item.description = card.description;
  if (hit.vote > 0) item.rating = hit.vote;
  return item;
}
async function qqResolveAll(cards,kind) {
  var out = new Array(cards.length),cursor = 0,errors = 0;
  async function worker() {
    while (cursor < cards.length) {
      var idx = cursor++;
      try {
        var hit = await qqMatchOne(cards[idx],kind);
        if (hit && hit.id) out[idx] = qqToItem(cards[idx],hit);
      } catch(e) { errors++; console.warn("[qq] 匹配失败",cards[idx].cid,e && e.message); }
    }
  }
  var tasks = [];
  for (var i = 0; i < QQ_SLOT && i < cards.length; i++) tasks.push(worker());
  await Promise.all(tasks);
  var items = [], seen = {};
  for (var j = 0; j < out.length; j++) {
    var item = out[j], key = item && item.mediaType + ":" + item.id;
    if (!item || seen[key]) continue;
    seen[key] = 1; items.push(item);
  }
  if (errors) console.warn("[qq] 本页匹配失败数",errors);
  return items;
}

async function loadChannel(chKey, params) {
  params = params || {};
  var ch = CHANNELS[chKey];
  if (!ch) return [];
  try {
    var filters = buildFilterParams(params);
    if (chKey !== "kids" && !params.sort) filters += (filters ? "&" : "") + "sort=75";
    var cards = await fetchPage(ch, filters, parseInt(params.page, 10) || 1);
    if (!cards.length) { console.warn("[qq] 官方片库没有返回条目",chKey); return []; }
    var items = await qqResolveAll(cards,chKey === "movie" ? "movie" : "tv");
    console.log("[qq] 分类",chKey,"原始",cards.length,"匹配",items.length);
    return items;
  } catch (e) {
    console.error("[qq] load fail", chKey, e && e.message);
    return [];
  }
}

async function loadQqTv(params) { return await loadChannel("tv", params); }
async function loadQqMovie(params) { return await loadChannel("movie", params); }
async function loadQqVariety(params) { return await loadChannel("variety", params); }
async function loadQqAnime(params) { return await loadChannel("anime", params); }
async function loadQqDoc(params) { return await loadChannel("doc", params); }
async function loadQqKids(params) { return await loadChannel("kids", params); }
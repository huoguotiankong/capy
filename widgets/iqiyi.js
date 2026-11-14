// ===== 爱奇艺片库 (CapyPlayer Widget) =====
// 固定安装地址：https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/iqiyi.js
// 基于 MakkaPakka 原组件改进：爱奇艺片库筛选 + TMDB 详情匹配，不解析视频播放流
var WidgetMetadata = {
  id: "iqiyi.video.pc.makka",
  title: "爱奇艺片库",
  version: "1.1.0",
   description: "爱奇艺片库六大频道、多条件筛选、分页、海报回退和 TMDB 详情匹配",
  site: "https://www.iqiyi.com",
  icon: "https://raw.githubusercontent.com/luestr/IconResource/main/App_icon/120px/iQiYi_Video.png",
  author: "MakkaPakka",
  modules: [
    {
      id: "iqTv",
      title: "电视剧",
      functionName: "loadIqTv",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "sort", title: "排序", type: "enumeration", default: "{\"mode\":24}", defaultValue: "{\"mode\":24}", enumOptions: [
          { title: "综合排序", value: "{\"mode\": 24}" }, { title: "热播榜", value: "{\"mode\": 11}" },
          { title: "新上线", value: "{\"mode\": 4}" } ] },
        { name: "1800233", title: "地区", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "内地", value: "cid:15" }, { title: "港剧", value: "cid:16" },
          { title: "韩剧", value: "cid:17" }, { title: "美剧", value: "cid:18" }, { title: "日剧", value: "cid:309" },
          { title: "泰剧", value: "cid:1114" }, { title: "英剧", value: "cid:28916" }, { title: "其它", value: "cid:19" } ] },
        { name: "1800333", title: "类型", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部类型", value: "" }, { title: "古装", value: "cid:24" }, { title: "言情", value: "cid:20" },
          { title: "武侠", value: "cid:23" }, { title: "悬念", value: "cid:32" }, { title: "都市", value: "cid:24064" },
          { title: "喜剧", value: "cid:135" }, { title: "战争", value: "cid:27916" }, { title: "历史", value: "cid:21" },
          { title: "科幻", value: "cid:34" }, { title: "罪案", value: "cid:149" }, { title: "青春", value: "cid:1653" } ] },
        { name: "year", title: "年份", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" },
          { title: "2026", value: "{\"market_release_date_level\": \"2026\"}" },
          { title: "2025", value: "{\"market_release_date_level\": \"2025\"}" },
          { title: "2024", value: "{\"market_release_date_level\": \"2024\"}" },
          { title: "2023", value: "{\"market_release_date_level\": \"2023\"}" },
          { title: "2022", value: "{\"market_release_date_level\": \"2022\"}" },
          { title: "2021", value: "{\"market_release_date_level\": \"2021\"}" },
          { title: "2020", value: "{\"market_release_date_level\": \"2020\"}" },
          { title: "2019", value: "{\"market_release_date_level\": \"2019\"}" },
          { title: "更早", value: "{\"market_release_date_level\": \"1949-1979\"}" } ] },
        { name: "purchase", title: "资费", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部资费", value: "" }, { title: "免费", value: "{\"is_purchase\": \"0\"}" },
          { title: "付费", value: "{\"is_purchase\": \"1\"}" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "iqMovie",
      title: "电影",
      functionName: "loadIqMovie",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "sort", title: "排序", type: "enumeration", default: "{\"mode\":24}", defaultValue: "{\"mode\":24}", enumOptions: [
          { title: "综合排序", value: "{\"mode\": 24}" }, { title: "热播榜", value: "{\"mode\": 11}" },
          { title: "好评榜", value: "{\"mode\": 8}" }, { title: "新上线", value: "{\"mode\": 4}" } ] },
        { name: "1800033", title: "地区", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "华语", value: "cid:1" }, { title: "美国", value: "cid:2" },
          { title: "欧洲", value: "cid:3" }, { title: "韩国", value: "cid:4" }, { title: "日本", value: "cid:308" },
          { title: "泰国", value: "cid:1115" }, { title: "其它", value: "cid:5" } ] },
        { name: "1800133", title: "类型", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部类型", value: "" }, { title: "喜剧", value: "cid:8" }, { title: "爱情", value: "cid:6" },
          { title: "动作", value: "cid:11" }, { title: "犯罪", value: "cid:291" }, { title: "惊悚", value: "cid:128" },
          { title: "恐怖", value: "cid:10" }, { title: "悬念", value: "cid:289" }, { title: "动画", value: "cid:12" },
          { title: "科幻", value: "cid:9" }, { title: "战争", value: "cid:7" } ] },
        { name: "year", title: "年份", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部年份", value: "" },
          { title: "2026", value: "{\"market_release_date_level\": \"2026\"}" },
          { title: "2025", value: "{\"market_release_date_level\": \"2025\"}" },
          { title: "2024", value: "{\"market_release_date_level\": \"2024\"}" },
          { title: "2023", value: "{\"market_release_date_level\": \"2023\"}" },
          { title: "2022", value: "{\"market_release_date_level\": \"2022\"}" },
          { title: "2021", value: "{\"market_release_date_level\": \"2021\"}" },
          { title: "2020", value: "{\"market_release_date_level\": \"2020\"}" },
          { title: "更早", value: "{\"market_release_date_level\": \"1949-1979\"}" } ] },
        { name: "purchase", title: "资费", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部资费", value: "" }, { title: "免费", value: "{\"is_purchase\": \"0\"}" },
          { title: "付费", value: "{\"is_purchase\": \"1\"}" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "iqVariety",
      title: "综艺",
      functionName: "loadIqVariety",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "sort", title: "排序", type: "enumeration", default: "{\"mode\":24}", defaultValue: "{\"mode\":24}", enumOptions: [
          { title: "综合排序", value: "{\"mode\": 24}" }, { title: "热播榜", value: "{\"mode\": 11}" },
          { title: "新上线", value: "{\"mode\": 4}" } ] },
        { name: "1801333", title: "地区", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "内地", value: "cid:151" }, { title: "港台", value: "cid:152" },
          { title: "韩国", value: "cid:33306" }, { title: "欧美", value: "cid:154" }, { title: "其它", value: "cid:1113" } ] },
        { name: "1801433", title: "类型", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部类型", value: "" }, { title: "真人秀", value: "cid:2224" }, { title: "脱口秀", value: "cid:2118" },
          { title: "访谈", value: "cid:156" }, { title: "游戏", value: "cid:158" }, { title: "晚会", value: "cid:292" },
          { title: "竞技", value: "cid:30278" } ] },
        { name: "purchase", title: "资费", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部资费", value: "" }, { title: "免费", value: "{\"is_purchase\": \"0\"}" },
          { title: "付费", value: "{\"is_purchase\": \"1\"}" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "iqAnime",
      title: "动漫",
      functionName: "loadIqAnime",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "sort", title: "排序", type: "enumeration", default: "{\"mode\":24}", defaultValue: "{\"mode\":24}", enumOptions: [
          { title: "综合排序", value: "{\"mode\": 24}" }, { title: "热播榜", value: "{\"mode\": 11}" },
          { title: "新上线", value: "{\"mode\": 4}" } ] },
        { name: "1800533", title: "地区", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "中国大陆", value: "cid:37" }, { title: "日本", value: "cid:38" },
          { title: "韩国", value: "cid:1106" }, { title: "欧美", value: "cid:30218" }, { title: "其它", value: "cid:40" } ] },
        { name: "3021933", title: "版本", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部版本", value: "" }, { title: "动画", value: "cid:30220" }, { title: "特摄", value: "cid:30223" },
          { title: "特别篇", value: "cid:32782" }, { title: "动画电影", value: "cid:32784" }, { title: "短剧", value: "cid:33483" } ] },
        { name: "3022533", title: "风格", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部风格", value: "" }, { title: "搞笑", value: "cid:30230" }, { title: "热血", value: "cid:30232" },
          { title: "治愈", value: "cid:30234" }, { title: "恋爱", value: "cid:30243" }, { title: "科幻", value: "cid:30245" },
          { title: "悬疑", value: "cid:30248" }, { title: "日常", value: "cid:30252" } ] },
        { name: "purchase", title: "资费", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部资费", value: "" }, { title: "免费", value: "{\"is_purchase\": \"0\"}" },
          { title: "付费", value: "{\"is_purchase\": \"1\"}" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "iqDoc",
      title: "纪录片",
      functionName: "loadIqDoc",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "sort", title: "排序", type: "enumeration", default: "{\"mode\":24}", defaultValue: "{\"mode\":24}", enumOptions: [
          { title: "综合排序", value: "{\"mode\": 24}" }, { title: "热播榜", value: "{\"mode\": 11}" },
          { title: "新上线", value: "{\"mode\": 4}" } ] },
        { name: "1800433", title: "类型", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部类型", value: "" }, { title: "人文", value: "cid:70" }, { title: "自然", value: "cid:33933" },
          { title: "美食", value: "cid:33908" }, { title: "历史", value: "cid:74" }, { title: "军事", value: "cid:72" },
          { title: "科技", value: "cid:28119" }, { title: "旅游", value: "cid:310" } ] },
        { name: "2032233", title: "地区", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部地区", value: "" }, { title: "国内", value: "cid:20323" }, { title: "国外", value: "cid:20324" } ] },
        { name: "2846733", title: "出品方", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部出品方", value: "" }, { title: "BBC", value: "cid:28468" }, { title: "探索频道", value: "cid:28471" },
          { title: "央视记录", value: "cid:28472" }, { title: "NHK", value: "cid:28480" }, { title: "Netflix", value: "cid:31286" } ] },
        { name: "purchase", title: "资费", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部资费", value: "" }, { title: "免费", value: "{\"is_purchase\": \"0\"}" },
          { title: "付费", value: "{\"is_purchase\": \"1\"}" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    },
    {
      id: "iqKids",
      title: "少儿",
      functionName: "loadIqKids",
      type: "media_list",
      timeoutSeconds: 60,
      cacheDuration: 600,
      params: [
        { name: "sort", title: "排序", type: "enumeration", default: "{\"mode\":24}", defaultValue: "{\"mode\":24}", enumOptions: [
          { title: "综合排序", value: "{\"mode\": 24}" }, { title: "热播榜", value: "{\"mode\": 11}" },
          { title: "新上线", value: "{\"mode\": 4}" } ] },
        { name: "1811133", title: "语种", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部语种", value: "" }, { title: "普通话", value: "cid:4487" }, { title: "英语", value: "cid:4486" },
          { title: "日语", value: "cid:4488" }, { title: "其他", value: "cid:28932" } ] },
        { name: "2028833", title: "年龄段", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部年龄段", value: "" }, { title: "0-3岁", value: "cid:4489" }, { title: "4-6岁", value: "cid:28929" },
          { title: "7-10岁", value: "cid:4493" }, { title: "11-13岁", value: "cid:4494" } ] },
        { name: "3095533", title: "类型", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部类型", value: "" }, { title: "动画", value: "cid:31020" }, { title: "电影", value: "cid:31013" },
          { title: "有声绘本", value: "cid:31014" }, { title: "儿童综艺", value: "cid:31016" } ] },
        { name: "purchase", title: "资费", type: "enumeration", default: "", defaultValue: "", enumOptions: [
          { title: "全部资费", value: "" }, { title: "免费", value: "{\"is_purchase\": \"0\"}" },
          { title: "付费", value: "{\"is_purchase\": \"1\"}" } ] },
        { name: "page", title: "页码", type: "page" }
      ]
    }
  ]
};

var IQ_API = "https://pub.m.iqiyi.com/h5/main/recVideos/lib/";
var IQ_CH = { tv: 2, movie: 1, variety: 6, anime: 4, doc: 3, kids: 15 };
var IQ_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

var IQ_SLOT = 4, IQ_BUSY = 0, IQ_QUEUE = [];

function iqHasStorage() {
  return typeof Widget !== "undefined" && !!(Widget.storage && typeof Widget.storage.get === "function");
}
function iqAcquire() {
  if (IQ_BUSY < IQ_SLOT) { IQ_BUSY++; return Promise.resolve(); }
  return new Promise(function (res) { IQ_QUEUE.push(res); });
}
function iqRelease() {
  var next = IQ_QUEUE.shift();
  if (next) next(); else IQ_BUSY--;
}
function iqSleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function iqQs(o) {
  var parts = [];
  for (var k in o) {
    if (!o.hasOwnProperty(k)) continue;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(o[k]));
  }
  return parts.join("&");
}

function iqPlan(params) {
  var plan = { mode: 24, three: [], year: "", buy: "" }, seen = {};
  params = params || {};
  for (var k in params) {
    if (!Object.prototype.hasOwnProperty.call(params, k) || k === "page") continue;
    var value = params[k];
    if (value === null || value === undefined) continue;
    var v = String(value).trim();
    if (!v || v === "all" || v === "-1") continue;
    if (v.slice(0, 4) === "cid:") {
      var cid = v.slice(4);
      if (/^\d+$/.test(cid) && !seen[cid]) { plan.three.push(cid); seen[cid] = 1; }
      continue;
    }
    try {
      var o = JSON.parse(v);
      if (o && typeof o === "object") {
        if (o.mode !== undefined && /^\d+$/.test(String(o.mode))) plan.mode = Number(o.mode);
        if (o.market_release_date_level) plan.year = String(o.market_release_date_level);
        if (o.is_purchase !== undefined && o.is_purchase !== null) plan.buy = String(o.is_purchase);
      }
    } catch (e) { console.warn("[iqiyi] 已忽略不支持的筛选值", k); }
  }
  return plan;
}
function iqSafeJson(value) {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch (e) { throw new Error("爱奇艺接口返回非 JSON 内容"); }
  }
  return value || {};
}
function iqImage(value) {
  if (!value) return "";
  var url = typeof value === "string" ? value : (value.url || value.src || "");
  url = String(url).trim();
  if (url.slice(0, 2) === "//") url = "https:" + url;
  return /^https?:\/\/\S+$/i.test(url) ? url : "";
}
function iqPoster(v) {
  return iqImage(v.imageUrl || v.albumPic || v.posterUrl || v.poster || v.img || v.image ||
    v.pic || v.picUrl || v.cover || v.coverImg || v.thumbnail || v.thumbnailUrl ||
    v.albumImgUrl || v.image_url || v.image_v || "");
}
function iqBackdrop(v) {
  return iqImage(v.backdropUrl || v.horizonPic || v.landscape || v.albumPicH ||
    v.picH || v.image_h || v.hPic || "");
}
function iqParseCards(body) {
  var data = body && body.data ? body.data : {};
  var vids = data.videos || data.videoList || data.video_list || data.list || [];
  if (vids && !Array.isArray(vids) && Array.isArray(vids.list)) vids = vids.list;
  if (!Array.isArray(vids)) throw new Error("爱奇艺列表字段不是数组");
  var cards = [], seen = {};
  for (var i = 0; i < vids.length; i++) {
    var v = vids[i] || {};
    var aid = String(v.albumId || v.album_id || v.qipuId || v.qipu_id || v.aid || "").trim();
    var title = String(v.albumName || v.shortTitle || v.vt || v.title || v.name || "").trim();
    if (!aid || !title || seen[aid]) continue;
    seen[aid] = 1;
    var rawYear = String(v.year || v.releaseYear || v.showYear || "");
    var year = /^\d{4}/.test(rawYear) ? rawYear.slice(0,4) : "";
    cards.push({
      cid: "iq" + aid, title: title, year: year,
      poster: iqPoster(v), backdrop: iqBackdrop(v),
      description: String(v.description || v.desc || v.intro || "").slice(0, 250)
    });
  }
  return cards;
}
async function iqFetch(ch, params, page) {
  var plan = iqPlan(params);
  var number = Math.max(1, Math.min(200, parseInt(page, 10) || 1));
  var q = {
    page_id: number, mode: plan.mode, channel_id: ch, ret_num: 21, pos: 1,
    type: "list", post: "list", from: "mobile_videolib",
    is_unified_interface: 1, version: "1.0.0", play_platform: "H5_QIYI"
  };
  if (plan.three.length) q.three_category_id = plan.three.join(",");
  if (plan.year) q.market_release_date_level = plan.year;
  if (plan.buy !== "") q.is_purchase = plan.buy;

  var error, url = IQ_API + "?" + iqQs(q);
  for (var attempt = 0; attempt < 2; attempt++) {
    try {
      var res = await Widget.http.get(url, {
        headers: { "User-Agent": IQ_UA, Referer: "https://m.iqiyi.com/", Accept: "application/json" }
      });
      if (res && res.ok === false) throw new Error("爱奇艺 HTTP " + (res.status || "?"));
      var body = iqSafeJson(res && res.data !== undefined ? res.data : res);
      if (!body || typeof body.data !== "object" || !body.data) throw new Error("爱奇艺接口响应结构异常");
      return iqParseCards(body);
    } catch(e) {
      error = e;
      if (attempt === 0) await iqSleep(350);
    }
  }
  throw error;
}

function iqNorm(s) {
  return String(s || "").toLowerCase().replace(/[\s·・:：!！?？,，.。'"、]/g, "").replace(/[（(][^)）]*[)）]/g, "");
}

function iqVariants(title) {
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

function iqJunk(title) {
  return /(拆解|解说|盘点|大赏|合集|预告|花絮|精选|混剪|周周看|名场面|彩蛋|剧情回顾|幕后)/i.test(String(title || ""));
}

function iqGrams(s) {
  var t = iqNorm(s), set = {};
  for (var i = 0; i < t.length - 1; i++) set[t.substr(i, 2)] = 1;
  if (t.length === 1) set[t] = 1;
  return set;
}

function iqSim(a, b) {
  var ga = iqGrams(a), gb = iqGrams(b);
  var ka = Object.keys(ga), kb = Object.keys(gb);
  if (!ka.length || !kb.length) return 0;
  var inter = 0;
  for (var i = 0; i < ka.length; i++) if (gb[ka[i]]) inter++;
  return inter / (ka.length + kb.length - inter);
}

function iqBest(results, names, year, kind) {
  var best = null, bestScore = -1;
  for (var i = 0; i < (results || []).length; i++) {
    var r = results[i];
    if (!r || !r.id) continue;
    var title = r.name || r.title || "", alternate = r.original_name || r.original_title || "";
    var sim = 0;
    for (var j = 0; j < names.length; j++)
      sim = Math.max(sim, iqSim(names[j], title), alternate ? iqSim(names[j], alternate) : 0);
    if (sim < 0.63) continue; // 必须名称相似，年份与热度不能单独造成误匹配
    var date = String(r.first_air_date || r.release_date || ""), score = sim;
    if (year && /^\d{4}/.test(date)) {
      var diff = Math.abs(Number(year) - Number(date.slice(0,4)));
      if (diff === 0) score += 0.14;
      else if (diff === 1) score += 0.05;
      else if (diff > 3) score -= 0.14;
    }
    score += Math.min(0.03, Number(r.popularity || 0) / 50000);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  if (!best) return null;
  return {
    id: best.id, kind: kind,
    poster: best.poster_path || "", backdrop: best.backdrop_path || "",
    date: best.first_air_date || best.release_date || "",
    vote: Number(best.vote_average || 0)
  };
}

async function iqSearch(kind, query) {
  var error;
  for (var attempt = 0; attempt < 2; attempt++) {
    await iqAcquire();
    try {
      if (!Widget.tmdb || typeof Widget.tmdb.get !== "function") throw new Error("TMDB API 不可用");
      var res = await Widget.tmdb.get("/search/" + kind,
        {params:{query:query,language:"zh-CN",include_adult:false}});
      var result = iqSafeJson(res && res.data !== undefined ? res.data : res);
      return Array.isArray(result.results) ? result.results : [];
    } catch(e) { error = e; }
    finally { iqRelease(); }
    if (attempt === 0) await iqSleep(280);
  }
  // 网络错误不负缓存，恢复网络后可以立即重试。
  throw new Error("TMDB 查询失败("+kind+"): "+(error && error.message || error));
}

async function iqCacheGet(key) {
  if (!iqHasStorage()) return null;
  try {
    var v = Widget.storage.get(key);
    if (v && typeof v.then === "function") v = await v;
    var o = v ? iqSafeJson(v) : {};
    return o.ts && Date.now()-o.ts < (o.id ? 604800000 : 7200000) ? o : null;
  } catch(e) { return null; }
}
async function iqCacheSet(key, obj) {
  if (!iqHasStorage() || typeof Widget.storage.set !== "function") return;
  try {
    var o = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj,k)) o[k] = obj[k];
    o.ts = Date.now();
    var r = Widget.storage.set(key,JSON.stringify(o));
    if (r && typeof r.then === "function") await r;
  } catch(e) {}
}

async function iqMatchOne(card, kind) {
  if (iqJunk(card.title)) return null;
  var key = "iqpc:v2:tmdb:" + kind + ":" + card.cid;
  var cache = await iqCacheGet(key);
  if (cache) return cache.id ? cache : null;
  var names = iqVariants(card.title).slice(0,3);
  if (!names.length) return null;
  var hit = null;
  for (var i = 0; i < names.length && !hit; i++) {
    hit = iqBest(await iqSearch(kind,names[i]),names,card.year,kind);
  }
  if (!hit) {
    var alt = kind === "tv" ? "movie" : "tv";
    hit = iqBest(await iqSearch(alt,names[0]),names,card.year,alt);
  }
  await iqCacheSet(key,hit || {id:0});
  return hit;
}
function iqToItem(card, hit) {
  var poster = (hit.poster ? "https://image.tmdb.org/t/p/w500"+hit.poster : "") || card.poster || "";
  var backdrop = (hit.backdrop ? "https://image.tmdb.org/t/p/w780"+hit.backdrop : "") || card.backdrop || poster;
  if (!poster && !backdrop) return null;
  var result = {
    id:String(hit.id), type:"tmdb", title:card.title, mediaType:hit.kind, tmdbId:String(hit.id),
    posterUrl:poster, backdropUrl:backdrop, releaseDate:hit.date || card.year || ""
  };
  if (card.year) result.year = card.year;
  if (card.description) result.description = card.description;
  if (hit.vote > 0) result.rating = hit.vote;
  return result;
}
async function iqResolveAll(cards, kind) {
  var results = new Array(cards.length), index = 0, errors = 0;
  async function worker() {
    while (index < cards.length) {
      var i = index++;
      try {
        var hit = await iqMatchOne(cards[i],kind);
        if (hit && hit.id) results[i] = iqToItem(cards[i],hit);
      } catch(e) { errors++; console.warn("[iqiyi] 单条匹配失败",cards[i].cid,e && e.message); }
    }
  }
  var workers = [];
  for (var i = 0; i < IQ_SLOT && i < cards.length; i++) workers.push(worker());
  await Promise.all(workers);
  var items = [], seen = {};
  for (var j = 0; j < results.length; j++) {
    var item = results[j];
    if (!item) continue;
    var key = item.mediaType + ":" + item.id;
    if (seen[key]) continue;
    seen[key] = 1; items.push(item);
  }
  if (errors) console.warn("[iqiyi] 本页 TMDB 匹配失败数",errors);
  return items;
}

async function loadIqChannel(chKey, params) {
  params = params || {};
  var ch = IQ_CH[chKey];
  if (!ch) return [];
  try {
    var cards = await iqFetch(ch, params, parseInt(params.page, 10) || 1);
    if (!cards.length) { console.warn("[iqiyi] 上游返回空列表",chKey); return []; }
    var out = await iqResolveAll(cards, chKey === "movie" ? "movie" : "tv");
    console.log("[iqiyi] 频道",chKey,"原始",cards.length,"成功匹配",out.length);
    return out;
  } catch (e) {
    console.error("[iqiyi] load fail", chKey, e && e.message);
    return [];
  }
}

async function loadIqTv(params) { return await loadIqChannel("tv", params); }
async function loadIqMovie(params) { return await loadIqChannel("movie", params); }
async function loadIqVariety(params) { return await loadIqChannel("variety", params); }
async function loadIqAnime(params) { return await loadIqChannel("anime", params); }
async function loadIqDoc(params) { return await loadIqChannel("doc", params); }
async function loadIqKids(params) { return await loadIqChannel("kids", params); }
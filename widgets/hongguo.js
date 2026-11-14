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
  title: "红果短剧 · 官网目录",
  description: "官网热播、真人剧、漫剧、AI剧、漫画、搜索与季集信息；完整播放需要独立的授权流服务。",
  author: "MX / huoguotiankong",
  version: "0.1.0",
  site: HG_SITE,
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
async function hgGet(url, headers) {
  var response = await Widget.http.get(url, { headers: headers || HG_HEADERS, timeout: 25000 });
  if (!response || !response.ok) throw new Error("HTTP " + (response ? response.status : "no response") + " " + url);
  return response.data;
}
async function hgPageData(url) {
  var raw = await hgGet(url);
  return hgRouter(raw);
}
function hgLoader(obj, key) { return hgObject(hgObject(obj.loaderData)[key]); }
async function hgCategory(route, params) {
  params = params || {};
  var genre = hgString(params.genre);
  var allowed = HG_CATEGORIES[route] || [];
  if (!allowed.some(function (g) { return g[0] === genre; })) genre = "";
  var page = hgPage(params);
  var url = HG_SITE + "/category/" + route + (genre ? "/" + encodeURIComponent(genre) : "") + "?page=" + page;
  try {
    var data = await hgPageData(url);
    var loader = hgLoader(data, "category_$");
    if (!Object.keys(loader).length) loader = hgLoader(data, "category_page");
    return hgMediaList(loader.recommendList);
  } catch (e) {
    console.error("[红果] 分类失败", route, genre, page, String(e));
    throw e;
  }
}
async function getHongguoHot(params) {
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
async function hgSeriesDetail(sid) {
  var obj = await hgPageData(HG_SITE + "/detail?series_id=" + encodeURIComponent(sid));
  var sd = hgObject(hgLoader(obj, "detail_page").seriesDetail);
  if (!Object.keys(sd).length) throw new Error("红果详情数据为空: " + sid);
  return sd;
}
async function hgSeasons(sd) {
  var sid = hgString(sd.series_id);
  var base = hgBaseName(sd.series_name);
  var gid = hgGroupId(sd);
  var original = [{ id: sid, sd: sd, number: hgSeasonNumber(sd.series_name) || 1 }];
  if (!gid || !base || base.length < 2) return original;
  try {
    var results = await hgSearchAPI(base, 1);
    var candidates = hgArray(results.searchList).map(function (row) {
      var v = hgObject(row.video_data);
      return {
        id: hgId(row),
        name: hgString(v.series_title || v.series_name || row.series_name || row.name)
      };
    }).filter(function (c) {
      return c.id && c.id !== sid && hgSeasonNumber(c.name) && hgBaseName(c.name) === base;
    }).slice(0, 8);
    var more = await Promise.all(candidates.map(async function (candidate) {
      try {
        var item = await hgSeriesDetail(candidate.id);
        if (hgGroupId(item) !== gid) return null;
        return { id: candidate.id, sd: item, number: hgSeasonNumber(item.series_name) || 1 };
      } catch (_) { return null; }
    }));
    var seen = {};
    return original.concat(more.filter(Boolean)).filter(function (item) {
      if (seen[item.id]) return false;
      seen[item.id] = true;
      return true;
    }).sort(function (a, b) { return a.number - b.number; });
  } catch (e) {
    console.warn("[红果] 跨季检索失败，回退当前季", String(e));
    return original;
  }
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
  return bridge + "/v1/hongguo/stream?vid=" + encodeURIComponent(vid) + "&q=" + encodeURIComponent(quality);
}
function hgEpisodes(group, index, bridge, multiSeason) {
  var vids = hgArray(group.sd.vid_list);
  return vids.map(function (v, i) {
    var vid = hgString(v), item = {
      id: "hg-episode-" + group.id + "-" + vid,
      seasonNumber: group.number || index + 1,
      episodeNumber: i + 1,
      title: "第" + (i + 1) + "集"
    };
    if (!/^\d+$/.test(vid)) return null;
    if (bridge) {
      var qualities = multiSeason ? [["1080", "超清"]] : [["1080", "超清"], ["720", "高清"], ["540", "标准"], ["480", "流畅"], ["360", "极速"]];
      var sources = qualities.map(function (line, n) {
        return { id: "q-" + line[0], title: line[1], videoUrl: hgStreamUrl(bridge, vid, line[0]), isDefault: n === 0 };
      });
      item.playSources = sources;
      item.videoUrl = sources[0].videoUrl;
    }
    return item;
  }).filter(Boolean);
}
async function loadDetail(link) {
  var sid = hgSeriesId(link);
  if (!sid || !/^\d+$/.test(sid)) throw new Error("无效的红果 series_id: " + hgString(link));
  var sd = await hgSeriesDetail(sid);
  var groups = await hgSeasons(sd);
  var bridge = hgBridgeBase();
  var seasons = groups.map(function (group, i) {
    var eps = hgEpisodes(group, i, bridge, groups.length > 1);
    return { id: "hg-season-" + group.id, seasonNumber: group.number || i + 1,
      title: "第" + (group.number || i + 1) + "季", episodeCount: eps.length, episodes: eps };
  }).filter(function (group) { return group.episodes.length > 0; });
  var actors = hgArray(sd.celebrities).map(function (person, i) {
    var name = hgString(hgObject(person).nickname);
    return name ? { id: "hg-cast-" + i, name: name } : null;
  }).filter(Boolean);
  var tags = hgArray(sd.tags).map(function (t) {
    return typeof t === "string" ? t : hgString(hgObject(t).name || hgObject(t).tag_name);
  }).filter(Boolean);
  var description = hgString(sd.series_intro);
  if (!bridge) description += (description ? "\n\n" : "") + "[目录预览] 当前未配置授权播放桥接服务：本组件可查看分类、搜索、剧集信息，但无法解密原 PY 源使用的 CENC 视频，因此不提供无效的播放链接。";
  return {
    id: "hg-" + sid,
    title: hgString(sd.series_name),
    type: "link",
    link: HG_SITE + "/detail?series_id=" + encodeURIComponent(sid),
    mediaType: "tv",
    posterUrl: hgString(sd.series_cover),
    description: description,
    episodeCount: seasons.reduce(function (n, group) { return n + group.episodeCount; }, 0),
    seasonCount: seasons.length,
    currentSeason: hgSeasonNumber(sd.series_name) || 1,
    currentEpisode: 1,
    tags: tags,
    credits: { cast: actors },
    seasons: seasons
  };
}

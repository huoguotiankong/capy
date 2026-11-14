/* CapyPlayer Jable.tv Widget v1.0.0
 * Official contract: https://capyplayer.feifeiduck.com/zh/dev/widget/widgetdev
 * No external server or credentials required; third-party availability is not guaranteed.
 */
var JB_SITE = "https://jable.tv";
var JB_HEADERS = {
  "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.7",
  "Referer": "https://jable.tv/",
  "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"
};
var JB_TAGS = [
  { title: "Cosplay", value: "cosplay" },
  { title: "女仆", value: "maid" },
  { title: "兔女郎", value: "bunny-girl" },
  { title: "泳装", value: "swimsuit" },
  { title: "眼镜", value: "glasses" },
  { title: "校服", value: "school-uniform" },
  { title: "兽耳", value: "kemonomimi" },
  { title: "巨乳", value: "big-tits" },
  { title: "球队经理", value: "team-manager" }
];

var WidgetMetadata = {
  id: "mx.jable",
  title: "Jable",
  description: "Jable 最近更新、热门、关键词搜索、标签筛选及视频 HLS 直链解析。仅限成年人；需可访问原站。",
  author: "MX / huoguotiankong",
  version: "1.0.0",
  site: JB_SITE,
  icon: JB_SITE + "/favicon.ico",
  modules: [
    {
      id: "jb_latest", title: "最近更新", type: "media_list",
      functionName: "getJableLatest", cacheDuration: 600,
      timeoutSeconds: 30, retryCount: 1,
      params: [{ name: "page", label: "页码", type: "page" }]
    },
    {
      id: "jb_hot", title: "热门影片", type: "media_list",
      functionName: "getJableHot", cacheDuration: 900,
      timeoutSeconds: 30, retryCount: 1,
      params: [{ name: "page", label: "页码", type: "page" }]
    },
    {
      id: "jb_tags", title: "标签分类", type: "media_list",
      functionName: "getJableTag", cacheDuration: 900,
      timeoutSeconds: 30, retryCount: 1,
      params: [
        { name: "tag", label: "选择标签", type: "enum", defaultValue: "cosplay", enumOptions: JB_TAGS },
        { name: "page", label: "页码", type: "page" }
      ]
    },
    {
      id: "jb_search", title: "搜索影片 / 番号", type: "media_list",
      functionName: "searchJable", cacheDuration: 180,
      timeoutSeconds: 30, retryCount: 1,
      params: [
        { name: "query", label: "影片名 / 番号 / 演员", type: "string", required: true },
        { name: "page", label: "页码", type: "page" }
      ]
    }
  ]
};

function jbStr(x) { return x == null ? "" : String(x); }
function jbTrim(x) { return jbStr(x).replace(/^\s+|\s+$/g, ""); }
function jbPage(params) {
  var n = Math.floor(Number((params || {}).page) || 1);
  return Math.max(1, Math.min(999, n));
}
function jbDecode(s) {
  return jbStr(s)
    .replace(/&#x([0-9a-f]+);?/gi, function (_, n) { var v = parseInt(n, 16); return v > 0 && v <= 0x10ffff ? String.fromCodePoint(v) : ""; })
    .replace(/&#([0-9]+);?/g, function (_, n) { var v = parseInt(n, 10); return v > 0 && v <= 0x10ffff ? String.fromCodePoint(v) : ""; })
    .replace(/&(?:amp|#0*38);/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&apos;|&#0*39;/gi, "'").replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}
function jbPlain(html) {
  return jbTrim(jbDecode(jbStr(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")));
}
function jbAttr(html, key) {
  var m = new RegExp("(?:^|\\s)" + key + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i").exec(jbStr(html));
  if (m) return jbDecode(m[2]);
  m = new RegExp("(?:^|\\s)" + key + "\\s*=\\s*([^\\s>]+)", "i").exec(jbStr(html));
  return m ? jbDecode(m[1]) : "";
}
function jbAbsolute(u) {
  var s = jbTrim(jbDecode(u).replace(/\\\//g, "/"));
  if (!s || /^data:|^blob:|^javascript:/i.test(s)) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return "https:" + s;
  if (s.charAt(0) === "/") return JB_SITE + s;
  return JB_SITE + "/" + s.replace(/^\.\//, "");
}
function jbValidDetail(url) {
  return /^https:\/\/(?:[a-z0-9-]+\.)?jable\.tv\/videos\/[a-z0-9-]+\/?(?:[?#].*)?$/i.test(jbStr(url));
}
function jbValidMedia(url) {
  return /^https?:\/\/[^ "'<>\\]+\/[^ "'<>\\]*\.m3u8(?:[?#][^ "'<>\\]*)?$/i.test(jbStr(url));
}
function jbImg(html) {
  var m, re = /<img\b[^>]*>/gi;
  while ((m = re.exec(html))) {
    var img = m[0];
    var u = jbAttr(img, "data-src") || jbAttr(img, "data-original") ||
      jbAttr(img, "data-lazy-src") || jbAttr(img, "src");
    u = jbAbsolute(u);
    if (u && !/^data:/i.test(u) && !/base64/i.test(u)) return u;
  }
  return "";
}
function jbFirstLink(html) {
  var re = /<a\b[^>]*>/gi, m;
  while ((m = re.exec(html))) {
    var url = jbAbsolute(jbAttr(m[0], "href"));
    if (jbValidDetail(url)) return url;
  }
  return "";
}
function jbCard(raw) {
  raw = jbStr(raw);
  var link = jbFirstLink(raw);
  if (!link) return null;
  var title = "";
  var match = /<h[1-6]\b[^>]*class\s*=\s*["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(raw);
  if (match) title = jbPlain(match[1]);
  if (!title) {
    match = /<(?:div|span)\b[^>]*class\s*=\s*["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i.exec(raw);
    if (match) title = jbPlain(match[1]);
  }
  if (!title) {
    match = /<a\b[^>]*href\s*=\s*["'][^"']*\/videos\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/i.exec(raw);
    if (match) title = jbPlain(match[1]);
  }
  if (!title) title = jbAttr((/<img\b[^>]*>/i.exec(raw) || [""])[0], "alt");
  if (!title) title = (link.match(/\/videos\/([^/]+)/) || [,""])[1].toUpperCase();
  title = jbTrim(title);
  if (!title) return null;
  return {
    id: link.replace(/[?#].*$/, ""),
    type: "link",
    link: link,
    title: title,
    mediaType: "movie",
    posterUrl: jbImg(raw)
  };
}
function jbListParse(html) {
  var result = [], seen = {};
  var docId = Widget.dom.parse(jbStr(html));
  try {
    var cards = Widget.dom.select(docId, ".video-img-box") || [];
    if (!cards.length) cards = Widget.dom.select(docId, ".video-item") || [];
    for (var i = 0; i < cards.length; i++) {
      var card = jbCard(cards[i].outerHtml || cards[i].html || "");
      if (card && !seen[card.id]) {
        seen[card.id] = true;
        result.push(card);
      }
    }
    if (result.length) return result;
    var anchors = Widget.dom.select(docId, "h6.title a") || [];
    if (!anchors.length) anchors = Widget.dom.select(docId, "a[href*='/videos/']") || [];
    for (var j = 0; j < anchors.length; j++) {
      var node = anchors[j];
      var link = jbAbsolute(jbAttr(node.outerHtml || "", "href") ||
        ((node.attributes || node.attrs || {}).href || ""));
      if (!jbValidDetail(link) || seen[link]) continue;
      var title = jbTrim(jbPlain(node.text || node.html || ""));
      if (!title) title = (link.match(/\/videos\/([^/]+)/) || [,""])[1].toUpperCase();
      result.push({ id: link, link: link, type: "link", title: title, mediaType: "movie" });
      seen[link] = true;
    }
    return result;
  } finally {
    Widget.dom.remove(docId);
  }
}
function jbPageURL(path, page) {
  return JB_SITE + path + (page > 1 ? (path.indexOf("?") >= 0 ? "&" : "?") + "page=" + page : "");
}
async function jbHTML(url) {
  var r = await Widget.http.get(url, { headers: JB_HEADERS, timeout: 25000 });
  if (!r || !r.ok) throw new Error("Jable HTTP " + (r ? r.status : "no response"));
  var html = typeof r.data === "string" ? r.data : jbStr((r.data || {}).html || (r.data || {}).body || "");
  if (!html) throw new Error("Jable 返回空页面");
  if (/(?:cf-chl-|Just a moment|Checking your browser|Attention Required|captcha-delivery)/i.test(html)) {
    throw new Error("Jable 触发了反爬验证，请确认网站可在设备上直接打开");
  }
  return html;
}
async function jbList(path, params) {
  var url = jbPageURL(path, jbPage(params));
  try {
    var html = await jbHTML(url);
    var items = jbListParse(html);
    if (!items.length) console.warn("Jable 列表为空或页面结构变更", path);
    return items;
  } catch (err) {
    console.error("Jable 列表获取失败", url, err && err.message ? err.message : err);
    throw err;
  }
}
async function getJableLatest(params) { return jbList("/latest-updates/", params); }
async function getJableHot(params) { return jbList("/hot/", params); }
async function getJableTag(params) {
  var tag = jbStr((params || {}).tag || "cosplay").toLowerCase();
  if (!/^[a-z0-9-]{1,64}$/.test(tag)) throw new Error("无效的 Jable 标签");
  return jbList("/tags/" + tag + "/", params);
}
async function searchJable(params) {
  var q = jbTrim((params || {}).query);
  if (!q) return [];
  var safeQ = encodeURIComponent(q);
  try {
    var items = await jbList("/search/" + safeQ + "/", params);
    if (items.length) return items;
    return await jbList("/search/?q=" + safeQ, params);
  } catch (err) {
    console.error("Jable 搜索失败", err && err.message ? err.message : err);
    throw err;
  }
}
function jbMeta(html, property) {
  var re = /<meta\b[^>]*>/gi, m;
  while ((m = re.exec(html))) {
    var tag = m[0];
    if (jbAttr(tag, "property").toLowerCase() === property.toLowerCase() ||
        jbAttr(tag, "name").toLowerCase() === property.toLowerCase()) {
      return jbAttr(tag, "content");
    }
  }
  return "";
}
function jbHls(html) {
  var patterns = [
    /\b(?:var|let|const)\s+hlsUrl\s*=\s*(['"])([\s\S]*?)\1/i,
    /\bhlsUrl\s*[:=]\s*(['"])([\s\S]*?)\1/i,
    /<source\b[^>]*\bsrc\s*=\s*(['"])([\s\S]*?\.m3u8(?:\?[^'"]*)?)\1/i,
    /<video\b[^>]*\bsrc\s*=\s*(['"])([\s\S]*?\.m3u8(?:\?[^'"]*)?)\1/i
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = patterns[i].exec(html);
    if (!m) continue;
    var src = jbAbsolute(jbDecode(m[2]).replace(/\\u0026/gi, "&").replace(/\\\//g, "/"));
    if (jbValidMedia(src)) return src;
  }
  return "";
}
async function loadDetail(link) {
  var url = jbAbsolute(link);
  if (!jbValidDetail(url)) throw new Error("无效的 Jable 视频详情地址");
  try {
    var html = await jbHTML(url);
    var hls = jbHls(html);
    if (!hls) throw new Error("详情页没有可识别的 HLS 播放链接；可能已过期、遭遇反爬或页面结构更新");
    var title = jbTrim(jbMeta(html, "og:title")) ||
      jbPlain((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [,""])[1]);
    title = title.replace(/\s*[-|]\s*Jable(?:\.TV)?[\s\S]*$/i, "");
    if (!title) title = (url.match(/\/videos\/([^/]+)/) || [,""])[1].toUpperCase();
    var poster = jbAbsolute(jbMeta(html, "og:image"));
    var description = jbTrim(jbMeta(html, "og:description") || jbMeta(html, "description"));
    return {
      id: url,
      title: title,
      type: "url",
      mediaType: "movie",
      posterUrl: poster,
      description: description,
      videoUrl: hls,
      customHeaders: {
        "Referer": JB_SITE + "/",
        "Origin": JB_SITE,
        "User-Agent": JB_HEADERS["User-Agent"]
      }
    };
  } catch (err) {
    console.error("Jable 详情播放地址解析失败", url, err && err.message ? err.message : err);
    throw err;
  }
}

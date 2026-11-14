/* CapyPlayer Jable.tv Widget v1.0.2
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
  { title: "Cosplay", value: "Cosplay" },
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
  version: "1.0.2",
  site: JB_SITE,
  modules: [
    {
      id: "jb_diagnostic", title: "网络诊断 · HTTP状态", type: "media_list",
      functionName: "getJableDiagnostic", cacheDuration: 0,
      timeoutSeconds: 30, retryCount: 0, params: []
    },
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
        { name: "tag", label: "选择标签", type: "enum", defaultValue: "Cosplay", enumOptions: JB_TAGS },
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
function jbErrorStatus(err) {
  var e = err || {};
  var response = e.response || {};
  var code = Number(response.statusCode || response.status ||
    e.statusCode || e.status || 0);
  if (code >= 100 && code <= 599) return code;
  var text = jbStr(e.message || e);
  var m = /(?:status code(?: of|:)?|statusCode\s*[:=]|HTTP\s*)(?:\s+)?([1-5]\d\d)\b/i.exec(text);
  return m ? Number(m[1]) : 0;
}
function jbHTTPError(status, url, cause) {
  var suffix = " (" + url.replace(/\?.*$/, "") + ")";
  if (status === 403 || status === 429 || status === 503) {
    return new Error("Jable HTTP " + status + "：站点拒绝独立HTTP请求，可能是Cloudflare验证/访问限制。请先在手机浏览器检查 jable.tv；普通组件无法自动通过网站的人机挑战。" + suffix);
  }
  if (status) return new Error("Jable HTTP " + status + "：源站请求失败" + suffix);
  return new Error("Jable 连接失败：" + jbStr(cause && (cause.message || cause)).slice(0, 180) + suffix);
}
async function jbHTML(url) {
  var r;
  try {
    r = await Widget.http.get(url, { headers: JB_HEADERS, timeout: 25000 });
  } catch (err) {
    var code = jbErrorStatus(err);
    console.error("Jable HTTP 请求异常", code || "unknown", url.replace(/\?.*$/, ""));
    throw jbHTTPError(code, url, err);
  }
  if (!r || !r.ok) throw jbHTTPError(Number(r && r.status) || 0, url);
  var html = typeof r.data === "string" ? r.data : jbStr((r.data || {}).html || (r.data || {}).body || "");
  if (!html) throw new Error("Jable 返回空页面：" + url);
  if (/(?:cf-chl-|Just a moment|Checking your browser|Attention Required|captcha-delivery)/i.test(html)) {
    throw new Error("Jable 页面触发了Cloudflare人机验证：独立组件请求无法完成浏览器验证");
  }
  return html;
}

function jbDiagnosticText(name, code, detail) {
  var title = name + "：";
  if (code === 200) title += "HTTP 200 可访问";
  else if (code) title += "HTTP " + code;
  else title += "连接失败 / 未知状态";
  return {
    id: "jable-diagnostic-" + name.replace(/\s+/g, "-"),
    title: title,
    mediaType: "movie",
    description: detail
  };
}
async function jbDiagnosticCheck(name, url) {
  try {
    var r = await Widget.http.get(url, {
      headers: url.indexOf(JB_SITE) === 0 ? JB_HEADERS : { "Accept": "*/*" },
      timeout: 12000
    });
    var code = Number(r && r.status) || (r && r.ok ? 200 : 0);
    var detail = r && r.ok ? "HTTP请求成功；如列表仍为空，需继续检查HTML解析。" :
      ((code === 403 || code === 429 || code === 503) ?
       "独立HTTP请求遭到站点拒绝。浏览器与组件不共享Cookie/验证会话。" :
       "请求返回非成功状态。请检查网络、DNS或URL。");
    return jbDiagnosticText(name, code, detail);
  } catch (err) {
    var status = jbErrorStatus(err);
    var message = (err && (err.message || err.toString && err.toString())) || "";
    var detail = status === 403 || status === 429 || status === 503 ?
      "站点可能限制脚本请求；请检查代理是否覆盖卡皮巴拉，无法仅靠更改User-Agent解决。" :
      "请求异常：" + jbStr(message).slice(0, 140) + "。请检查卡皮巴拉网络/代理分应用设置。";
    console.warn("Jable诊断", name, status || "unknown", jbStr(message).slice(0, 100));
    return jbDiagnosticText(name, status, detail);
  }
}
async function getJableDiagnostic() {
  // Three independent probes allow distinguishing regional/APP network issues
  // from an upstream HTTP anti-bot refusal without leaking cookies or tokens.
  return await Promise.all([
    jbDiagnosticCheck("Jable首页", JB_SITE + "/"),
    jbDiagnosticCheck("Jable列表", JB_SITE + "/latest-updates/"),
    jbDiagnosticCheck("GitHub组件源", "https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/jable.js")
  ]);
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
  var tag = jbStr((params || {}).tag || "Cosplay");
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

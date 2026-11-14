'use strict';
// Experimental authenticated catalogue/playback adapter for a licensed provider.
// Set XY_APP_ID, XY_APP_SECRET and CAPY_ACCESS_KEY in Vercel environment only.
const crypto = require('node:crypto');
const API_ORIGIN = 'https://www.xiaoyingapi.com';
const ROUTES = Object.freeze({
  rank: '/api/dramas/hongguo/rank',
  categories: '/api/dramas/hongguo/categories',
  list: '/api/dramas/hongguo/list',
  search: '/api/dramas/hongguo/search',
  detail: '/api/dramas/hongguo/detail',
  play: '/api/dramas/hongguo/play'
});
function sign(method, path, params, secret) {
  const canonical = Object.keys(params).filter(k => k !== 'sign' && params[k] !== undefined && params[k] !== null && String(params[k]) !== '')
    .sort().map(k => k + '=' + String(params[k])).join('&');
  return crypto.createHmac('sha256', secret).update(method.toUpperCase() + '\n' + path + '\n' + canonical,'utf8').digest('hex');
}
function secureEq(actual, expected) {
  const a = Buffer.from(String(actual || '')), b = Buffer.from(String(expected || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function respond(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}
function requireParam(value, re, name) {
  const s = String(value || '');
  if (!re.test(s)) throw new Error('Invalid ' + name);
  return s;
}
function paramsFor(op, input) {
  if (op === 'categories') return {};
  if (op === 'detail') return { series_id: requireParam(input.get('series_id'), /^\d{6,26}$/, 'series_id') };
  if (op === 'play') {
    return {
      series_id: requireParam(input.get('series_id'), /^\d{6,26}$/, 'series_id'),
      ep: requireParam(input.get('ep'), /^(?:[1-9]\d{0,3})$/, 'ep'),
      q: requireParam(input.get('q') || '720', /^(360|480|540|720|1080)$/, 'q'),
      codec: requireParam(input.get('codec') || 'hevc', /^(hevc|h264)$/, 'codec'),
      mode: requireParam(input.get('mode') || 'file', /^(pipe|file)$/, 'mode')
    };
  }
  if (op === 'rank') return {
    type: requireParam(input.get('type') || 'hot-drama', /^[a-z-]{2,40}$/, 'type'),
    page: requireParam(input.get('page') || '1', /^[1-9]\d?$/, 'page')
  };
  if (op === 'list') return {
    category: requireParam(input.get('category'), /^[a-z-]+(?:\/[a-z-]+)?$/, 'category'),
    page: requireParam(input.get('page') || '1', /^[1-9]\d?$/, 'page')
  };
  if (op === 'search') {
    const keyword = String(input.get('keyword') || '').trim();
    if (!keyword || keyword.length > 80) throw new Error('Invalid keyword');
    return {keyword, page: requireParam(input.get('page') || '1', /^[1-9]\d?$/, 'page')};
  }
  throw new Error('Unsupported operation');
}
async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return respond(res, 405, {error:'Method not allowed'});
  }
  const input = new URL(req.url || '/', 'https://localhost').searchParams;
  if (input.get('op') === 'status')
    return respond(res, 200, {service:'capy-xiaoying-adapter',ready:Boolean(process.env.XY_APP_ID && process.env.XY_APP_SECRET && process.env.CAPY_ACCESS_KEY)});
  const key = process.env.CAPY_ACCESS_KEY;
  if (!key || !secureEq(input.get('access_key'), key)) return respond(res, 401, {error:'Unauthorized'});
  const appId = process.env.XY_APP_ID, appSecret = process.env.XY_APP_SECRET;
  if (!appId || !appSecret) return respond(res, 503, {error:'Provider credentials not configured'});
  let op, biz;
  try { op = requireParam(input.get('op'), /^[a-z]+$/, 'op'); biz = paramsFor(op, input); }
  catch (e) { return respond(res, 400, {error:e.message}); }
  const path = ROUTES[op], all = {
    ...biz, app_id:appId, timestamp:String(Math.floor(Date.now()/1000)), nonce:crypto.randomBytes(12).toString('hex')
  };
  all.sign = sign('GET', path, all, appSecret);
  const upstream = new URL(path, API_ORIGIN);
  for (const [k,v] of Object.entries(all)) upstream.searchParams.set(k,String(v));
  let response, payload;
  try {
    response = await fetch(upstream,{headers:{Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(12000)});
    if (!response.ok) return respond(res, 502, {error:'Provider HTTP ' + response.status});
    payload = await response.json();
  } catch (_) { return respond(res, 502, {error:'Provider unreachable or invalid response'}); }
  if (!payload || payload.code !== 10000)
    return respond(res, 502, {error:'Provider declined request',code:payload && payload.code || 0});
  if (op === 'play') {
    let target;
    try { target = new URL(payload.data && payload.data.url); }
    catch (_) { return respond(res, 502, {error:'Missing video URL'}); }
    if (target.protocol !== 'https:' || target.username || target.password)
      return respond(res, 502, {error:'Unsafe video URL'});
    res.statusCode = 302;
    res.setHeader('Location',target.href);
    return res.end();
  }
  return respond(res,200,{code:10000,data:payload.data});
}
module.exports = handler;
module.exports._test = {sign,paramsFor,secureEq};

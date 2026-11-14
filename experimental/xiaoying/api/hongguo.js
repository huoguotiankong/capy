'use strict';
/*
 * Isolated CapyPlayer -> authorized Xiaoying adapter.
 * Provider APPSECRET, client access key and ticket secret ONLY in server env.
 * No media decoding, bypass, buffering, or video proxying here.
 */
const crypto=require('node:crypto');
const PROVIDER='https://www.xiaoyingapi.com';
const RESOURCE=Object.freeze({
  rank:'rank',categories:'categories',list:'list',search:'search',
  detail:'detail',play:'play'
});
const SCOPED_SOURCE=Object.freeze([
  {id:'hevc-1080',title:'1080P · HEVC',q:'1080',codec:'hevc',mode:'pipe'},
  {id:'hevc-720',title:'720P · HEVC',q:'720',codec:'hevc',mode:'pipe'},
  {id:'h264-360',title:'360P · 兼容',q:'360',codec:'h264',mode:'pipe'}
]);
const MAX_AGE_SEC=14400; // tickets issued on detail fetch, 4 hours
const requireEnv=()=>Boolean(process.env.XY_APP_ID && process.env.XY_APP_SECRET
  && process.env.CAPY_ACCESS_KEY && process.env.CAPY_TICKET_SECRET);
function paramsFor(op,input) {
  const valid=(key,re,fallback)=>{
    const raw=String(input.get(key)??fallback??'').trim();
    if(!re.test(raw))throw Error('Invalid '+key);
    return raw;
  };
  switch(op){
    case 'rank':return {type:valid('type',/^[a-z-]{2,40}$/,'hot-drama'),
      page:valid('page',/^[1-9]\d?$/,'1')};
    case 'categories':return {};
    case 'list':return {category:valid('category',/^[a-z-]+(?:\/[a-z-]+)?$/),
      page:valid('page',/^[1-9]\d?$/,'1')};
    case 'search': {
      const keyword=String(input.get('keyword')||'').trim();
      if(!keyword||keyword.length>80)throw Error('Invalid keyword');
      return {keyword,page:valid('page',/^[1-9]\d?$/,'1')};
    }
    case 'detail':return {series_id:valid('series_id',/^\d{6,26}$/)};
    case 'play':return {
      series_id:valid('series_id',/^\d{6,26}$/),
      ep:valid('ep',/^[1-9]\d{0,3}$/),
      q:valid('q',/^(360|480|540|720|1080)$/,'720'),
      codec:valid('codec',/^(h264|hevc)$/,'hevc'),
      mode:valid('mode',/^(pipe|file)$/,'pipe')
    };
    default:throw Error('Unsupported operation');
  }
}
function safeEqual(a,b){
  const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));
  return x.length===y.length && crypto.timingSafeEqual(x,y);
}
function signature(method,path,params,secret) {
  const canonical=Object.keys(params).filter(k=>k!=='sign' && params[k]!==null
    && params[k]!==undefined && String(params[k])!=='')
    .sort().map(k=>k+'='+String(params[k])).join('&');
  return crypto.createHmac('sha256',secret)
    .update(method.toUpperCase()+'\n'+path+'\n'+canonical,'utf8').digest('hex');
}
function apiPath(op) {
  if(!Object.hasOwn(RESOURCE,op))throw Error('Unsupported operation');
  // Provider guide says signing path includes the ending slash. Override only
  // if the provider verifies the actual route uses no trailing slash.
  const suffix=process.env.XY_PATH_TRAILING_SLASH==='false'?'':'/';
  return '/api/dramas/hongguo/'+RESOURCE[op]+suffix;
}
function mintTicket(payload,secret,now=Math.floor(Date.now()/1000)) {
  const data={v:1,sid:payload.series_id,ep:Number(payload.ep),q:payload.q,
    codec:payload.codec,mode:payload.mode,exp:now+MAX_AGE_SEC};
  if(!Number.isInteger(data.ep)||data.ep<1||data.ep>9999
    ||!/^\d{6,26}$/.test(String(data.sid))
    ||!['360','480','540','720','1080'].includes(data.q)
    ||!['h264','hevc'].includes(data.codec)||!['pipe','file'].includes(data.mode))
    throw Error('Invalid ticket scope');
  const encoded=Buffer.from(JSON.stringify(data)).toString('base64url');
  const mac=crypto.createHmac('sha256',secret).update(encoded).digest('base64url');
  return encoded+'.'+mac;
}
function readTicket(token,secret,now=Math.floor(Date.now()/1000)) {
  if(typeof token!=='string'||token.length>1024||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))
    throw Error('Invalid ticket');
  const [data,providedMac]=token.split('.');
  const expected=crypto.createHmac('sha256',secret).update(data).digest('base64url');
  if(!safeEqual(providedMac,expected))throw Error('Invalid ticket');
  let parsed;
  try{parsed=JSON.parse(Buffer.from(data,'base64url').toString('utf8'));}catch(_){throw Error('Invalid ticket');}
  if(parsed.v!==1||!Number.isSafeInteger(parsed.exp)||parsed.exp<now
    ||parsed.exp>now+MAX_AGE_SEC||!Number.isSafeInteger(parsed.ep)
    ||parsed.ep<1||parsed.ep>9999)throw Error('Expired or invalid ticket');
  return paramsFor('play',new URLSearchParams({
    series_id:String(parsed.sid),ep:String(parsed.ep),q:String(parsed.q),
    codec:String(parsed.codec),mode:String(parsed.mode)
  }));
}
async function providerGet(op,biz) {
  const path=apiPath(op),all={...biz,
    app_id:process.env.XY_APP_ID,
    timestamp:String(Math.floor(Date.now()/1000)),
    nonce:crypto.randomBytes(12).toString('hex')};
  all.sign=signature('GET',path,all,process.env.XY_APP_SECRET);
  const url=new URL(path,PROVIDER);
  for(const [k,v] of Object.entries(all))url.searchParams.set(k,String(v));
  const response=await fetch(url,{
    headers:{Accept:'application/json'},redirect:'error',
    signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)throw Error('Provider HTTP '+response.status);
  const json=await response.json();
  if(!json||json.code!==10000||!json.data)
    throw Error('Provider code '+(json&&json.code||0));
  return json.data;
}
function fail(res,status,message) {
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify({error:message}));
}
function videoUrlOK(value) {
  if(typeof value!=='string'||value.length>6000)return false;
  let url;
  try{url=new URL(value);}catch(_){return false;}
  if(url.protocol!=='https:'||url.username||url.password||url.port)return false;
  const host=url.hostname.toLowerCase();
  if(host==='localhost'||host.endsWith('.local')||host.endsWith('.internal')||
     /^(?:127|10|192\.168|169\.254)\./.test(host))return false;
  return true;
}
function augmentDetail(data,secret) {
  const original=JSON.parse(JSON.stringify(data));
  const id=String(original.series_id||'');
  if(!/^\d{6,26}$/.test(id))return original;
  if(!Array.isArray(original.episodes))original.episodes=[];
  original.episodes=original.episodes.map(ep=>{
    if(ep.playable!==true||!Number.isSafeInteger(Number(ep.ep))||Number(ep.ep)<1)return ep;
    const sources=SCOPED_SOURCE.map(x=>({
      id:x.id,title:x.title,expires_in:MAX_AGE_SEC,
      ticket:mintTicket({series_id:id,ep:ep.ep,q:x.q,codec:x.codec,mode:x.mode},secret)
    }));
    return {...ep,play_sources:sources};
  });
  return original;
}
async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  const query=new URL(req.url||'/', 'https://localhost').searchParams;
  const op=query.get('op');
  // Media engines may issue HEAD before GET. Only allow HEAD for a valid
  // playback ticket, never for metadata or diagnostics.
  if(req.method!=='GET' && !(req.method==='HEAD' && op==='play')){
    res.setHeader('Allow',op==='play'?'GET, HEAD':'GET');
    return fail(res,405,'Method not allowed');
  }
  if(op==='status'){
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.end(JSON.stringify({service:'capy-xiaoying-adapter',
      ready:requireEnv(),version:'0.2.1'}));
  }
  if(!requireEnv())return fail(res,503,'Provider not configured');
  let biz;
  if(op==='play'){
    try{biz=readTicket(query.get('ticket'),process.env.CAPY_TICKET_SECRET);}
    catch(_){return fail(res,401,'Invalid or expired playback ticket');}
  }else{
    if(!safeEqual(req.headers && req.headers['x-capy-access-key'],
      process.env.CAPY_ACCESS_KEY))return fail(res,401,'Unauthorized');
    try{biz=paramsFor(op==='diagnose'?'detail':op,query);}
    catch(e){return fail(res,400,e.message);}
  }
  let data;
  try{data=await providerGet(op==='diagnose'?'detail':op,biz);}
  catch(e){return fail(res,502,String(e.message).slice(0,100));}
  if(op==='play'){
    if(!videoUrlOK(data.url))return fail(res,502,'Provider returned unsafe media URL');
    res.statusCode=302;
    res.setHeader('Location',data.url);
    return res.end();
  }
  if(op==='diagnose'){
    const episodes=Array.isArray(data.episodes)?data.episodes:[];
    res.statusCode=200;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.end(JSON.stringify({
      service:'capy-xiaoying-adapter',providerReachable:true,
      seriesId:String(data.series_id||biz.series_id),
      episodeCount:episodes.length,
      playableCount:episodes.filter(x=>x && x.playable===true).length,
      originCount:episodes.filter(x=>x && x.playable===true && x.source==='origin').length,
      streamCount:episodes.filter(x=>x && x.playable===true && x.source==='stream').length,
      mediaPlaybackVerified:false
    }));
  }
  if(op==='detail')data=augmentDetail(data,process.env.CAPY_TICKET_SECRET);
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.statusCode=200;
  return res.end(JSON.stringify({code:10000,data}));
}
module.exports=handler;
module.exports._test={signature,apiPath,paramsFor,mintTicket,readTicket,
  augmentDetail,safeEqual,videoUrlOK};

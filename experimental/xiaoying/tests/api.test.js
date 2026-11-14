'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const server=require('../api/hongguo');
const {signature,apiPath,paramsFor,mintTicket,readTicket,augmentDetail,
  safeEqual,videoUrlOK}=server._test;
const ENV=['XY_APP_ID','XY_APP_SECRET','CAPY_ACCESS_KEY','CAPY_TICKET_SECRET','XY_PATH_TRAILING_SLASH'];
const origin=Object.fromEntries(ENV.map(k=>[k,process.env[k]]));
const setEnv=()=>{
  process.env.XY_APP_ID='app_test';
  process.env.XY_APP_SECRET='sk_test';
  process.env.CAPY_ACCESS_KEY='client_secret_123';
  process.env.CAPY_TICKET_SECRET='ticket_secret_456';
  delete process.env.XY_PATH_TRAILING_SLASH;
};
test.after(()=>{
  for(const k of ENV)if(origin[k]===undefined)delete process.env[k];
  else process.env[k]=origin[k];
});
function resp(){
  return {statusCode:200,headers:{},body:'',
    setHeader(k,v){this.headers[String(k).toLowerCase()]=v;},
    end(b){this.body=b===undefined?'':String(b);return this;}};
}
async function req(url,header){
  const r=resp();await server({method:'GET',url,headers:header||{}},r);return r;
}
test('canonical signature includes trailing slash and exact sorted fields',()=>{
  setEnv();
  assert.equal(apiPath('play'),'/api/dramas/hongguo/play/');
  const fields={nonce:'xy',page:'2',timestamp:'1770000000',app_id:'app_test'};
  const message='GET\n/api/dramas/hongguo/play/\napp_id=app_test&nonce=xy&page=2&timestamp=1770000000';
  assert.equal(signature('GET',apiPath('play'),fields,'sk_test'),
    crypto.createHmac('sha256','sk_test').update(message).digest('hex'));
  process.env.XY_PATH_TRAILING_SLASH='false';
  assert.equal(apiPath('play'),'/api/dramas/hongguo/play');
  delete process.env.XY_PATH_TRAILING_SLASH;
});
test('strict query validation and constant-time comparison',()=>{
  assert.equal(safeEqual('abc','abc'),true);
  assert.equal(safeEqual('abc','cba'),false);
  assert.deepEqual(paramsFor('detail',new URLSearchParams('series_id=123456789')),{
    series_id:'123456789'
  });
  assert.throws(()=>paramsFor('detail',new URLSearchParams('series_id=x')),/series_id/);
  assert.throws(()=>paramsFor('play',new URLSearchParams('series_id=123456789&ep=0')),/ep/);
  assert.equal(videoUrlOK('https://cdn.example.test/1.mp4?token=x'),true);
  assert.equal(videoUrlOK('http://cdn.example.test/1.mp4'),false);
  assert.equal(videoUrlOK('https://127.0.0.1/secret'),false);
});
test('playback tickets bind a single episode, quality, codec and expiry',()=>{
  const scope={series_id:'123456789',ep:3,q:'720',codec:'hevc',mode:'pipe'};
  const ticket=mintTicket(scope,'ticket_secret',10000);
  assert.deepEqual(readTicket(ticket,'ticket_secret',10001),{...scope,ep:'3'});
  assert.throws(()=>readTicket(ticket,'wrong_secret',10001),/ticket/i);
  assert.throws(()=>readTicket(ticket,'ticket_secret',24401),/Expired/);
  const [payload,mac]=ticket.split('.');
  assert.throws(()=>readTicket(payload+'A.'+mac,'ticket_secret',10001),/ticket/i);
});
test('augment detail only signs playable episodes',()=>{
  const detail={series_id:'123456789',name:'示例剧',episode_cnt:4,
    episodes:[{ep:1,playable:true},{ep:2,playable:false},{ep:3,playable:true}]};
  const safe=augmentDetail(detail,'ticket_secret');
  assert.equal(safe.episodes[0].play_sources.length,3);
  assert.equal(safe.episodes[1].play_sources,undefined);
  assert.equal(safe.episodes[2].play_sources.length,3);
  assert.equal(detail.episodes[0].play_sources,undefined); // no mutation
  assert.ok(safe.episodes[0].play_sources.every(x=>!x.ticket.includes('ticket_secret')));
});
test('status works without env; no secrets are leaked',async()=>{
  for(const k of ENV)delete process.env[k];
  const status=await req('/api/hongguo?op=status');
  assert.equal(status.statusCode,200);
  assert.equal(JSON.parse(status.body).ready,false);
  const missing=await req('/api/hongguo?op=detail&series_id=123456789');
  assert.equal(missing.statusCode,503);
  assert.equal(JSON.parse(missing.body).error,'Provider not configured');
});
test('deny unauthenticated and invalid requests before upstream fetch',async()=>{
  setEnv();
  const oldFetch=global.fetch;
  global.fetch=()=>{throw Error('upstream must never be called');};
  try{
    let r=await req('/api/hongguo?op=detail&series_id=123456789');
    assert.equal(r.statusCode,401);
    r=await req('/api/hongguo?op=detail&series_id=nope',
      {'x-capy-access-key':'client_secret_123'});
    assert.equal(r.statusCode,400);
    r=await req('/api/hongguo?op=play&ticket=invalid');
    assert.equal(r.statusCode,401);
    r=await req('/api/hongguo?op=play&access_key=client_secret_123&ep=1');
    assert.equal(r.statusCode,401);
  }finally{global.fetch=oldFetch;}
});
test('authorized detail adds tickets and signs provider call',async()=>{
  setEnv();let called;
  const oldFetch=global.fetch;
  global.fetch=async url=>{
    called=new URL(url);
    return {ok:true,json:async()=>({code:10000,data:{series_id:'123456789',
      name:'测试第十季',episodes:[{ep:1,playable:true},{ep:2,playable:false}]}})};
  };
  try{
    const r=await req('/api/hongguo?op=detail&series_id=123456789',
      {'x-capy-access-key':'client_secret_123'});
    assert.equal(r.statusCode,200);
    assert.equal(called.pathname,'/api/dramas/hongguo/detail/');
    assert.equal(called.searchParams.get('sign').length,64);
    const data=JSON.parse(r.body).data;
    assert.equal(data.episodes[0].play_sources.length,3);
    assert.equal(data.episodes[1].play_sources,undefined);
    assert.ok(!r.body.includes('sk_test'));
    assert.ok(!r.body.includes('client_secret_123'));
    const signed=data.episodes[0].play_sources[0].ticket;
    assert.equal(readTicket(signed,'ticket_secret_456').ep,'1');
  }finally{global.fetch=oldFetch;}
});
test('signed playback ticket redirects to provider URL without streaming data',async()=>{
  setEnv();const oldFetch=global.fetch;let called;
  global.fetch=async url=>{
    called=new URL(url);
    return {ok:true,json:async()=>({code:10000,data:{
      playable:true,source:'stream',url:'https://cdn.example.test/stream.mp4?exp=123'}})};
  };
  try{
    const ticket=mintTicket({series_id:'123456789',ep:4,q:'720',codec:'hevc',mode:'pipe'},
      'ticket_secret_456');
    const r=await req('/api/hongguo?op=play&ticket='+encodeURIComponent(ticket));
    assert.equal(r.statusCode,302);
    assert.equal(r.headers.location,'https://cdn.example.test/stream.mp4?exp=123');
    assert.equal(called.pathname,'/api/dramas/hongguo/play/');
    assert.equal(called.searchParams.get('ep'),'4');
    assert.equal(called.searchParams.get('mode'),'pipe');
    assert.equal(r.body,'');
    assert.equal(r.headers['cache-control'],'private, no-store, max-age=0');
  }finally{global.fetch=oldFetch;}
});
test('provider failure and unsafe redirect are rejected',async()=>{
  setEnv();const oldFetch=global.fetch;
  const header={'x-capy-access-key':'client_secret_123'};
  try{
    global.fetch=async()=>({ok:true,json:async()=>({code:20011,data:null})});
    let r=await req('/api/hongguo?op=detail&series_id=123456789',header);
    assert.equal(r.statusCode,502);
    assert.ok(!r.body.includes('sk_test'));
    const ticket=mintTicket({series_id:'123456789',ep:4,q:'720',codec:'hevc',mode:'pipe'},
      'ticket_secret_456');
    global.fetch=async()=>({ok:true,json:async()=>({code:10000,data:{url:'http://127.0.0.1/video.mp4'}})});
    r=await req('/api/hongguo?op=play&ticket='+ticket);
    assert.equal(r.statusCode,502);
    assert.equal(r.headers.location,undefined);
  }finally{global.fetch=oldFetch;}
});

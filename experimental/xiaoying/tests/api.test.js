'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const handler=require('../api/hongguo');
const {sign,paramsFor,secureEq}=handler._test;
function response(){
  return {statusCode:200,headers:{},body:'',setHeader(k,v){this.headers[k.toLowerCase()]=v;},end(v){this.body=v||'';return this;}};
}
test('HMAC canonicalization',()=>{
  const params={nonce:'x',page:'2',app_id:'app_123',timestamp:'1770000000'};
  const msg='GET\n/api/dramas/hongguo/rank\napp_id=app_123&nonce=x&page=2&timestamp=1770000000';
  assert.equal(sign('GET','/api/dramas/hongguo/rank',params,'sk_test'),
    crypto.createHmac('sha256','sk_test').update(msg).digest('hex'));
});
test('input validation and constant time equality',()=>{
  assert.equal(secureEq('alpha','alpha'),true);
  assert.equal(secureEq('alpha','beta'),false);
  assert.throws(()=>paramsFor('play',new URLSearchParams('series_id=../../&ep=5')),/series_id/);
  assert.deepEqual(paramsFor('detail',new URLSearchParams('series_id=12345678')),{series_id:'12345678'});
});
test('fail closed without credentials',async()=>{
  process.env.CAPY_ACCESS_KEY='testkey';delete process.env.XY_APP_ID;delete process.env.XY_APP_SECRET;
  let r=response();await handler({method:'GET',url:'/api/hongguo?op=detail&access_key=testkey&series_id=12345678'},r);
  assert.equal(r.statusCode,503);
  r=response();await handler({method:'GET',url:'/api/hongguo?op=play&series_id=12345678&ep=1'},r);
  assert.equal(r.statusCode,401);
});
test('signed play redirects but does not proxy MP4',async()=>{
  process.env.CAPY_ACCESS_KEY='testkey';process.env.XY_APP_ID='app_test';process.env.XY_APP_SECRET='sk_test';
  const old=global.fetch;let seen;
  global.fetch=async(url)=>{seen=new URL(url);return {ok:true,json:async()=>({code:10000,data:{url:'https://cdn.example.com/vid.mp4?expiry=1'}})};};
  try {
    const r=response();await handler({method:'GET',url:'/api/hongguo?op=play&access_key=testkey&series_id=12345678&ep=4'},r);
    assert.equal(r.statusCode,302);
    assert.equal(r.headers.location,'https://cdn.example.com/vid.mp4?expiry=1');
    assert.equal(seen.searchParams.get('sign').length,64);
    assert.equal(seen.searchParams.get('ep'),'4');
    assert.equal(r.headers['cache-control'],'no-store');
  } finally {global.fetch=old;}
});
test('provider error exposes no secret',async()=>{
  process.env.CAPY_ACCESS_KEY='testkey';process.env.XY_APP_ID='app_test';process.env.XY_APP_SECRET='sk_test';
  const old=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({code:20011,data:null})});
  try {
    const r=response();await handler({method:'GET',url:'/api/hongguo?op=detail&access_key=testkey&series_id=12345678'},r);
    assert.equal(r.statusCode,502);assert.equal(JSON.parse(r.body).code,20011);assert.ok(!r.body.includes('sk_test'));
  }finally{global.fetch=old;}
});

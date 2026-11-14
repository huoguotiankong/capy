"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../widgets/iqiyi.js"), "utf8");
function harness() {
  const urls = [], storage = {};
  const Widget = {
    http: { async get(url) {
      urls.push(url);
      const u = new URL(url);
      const page = Number(u.searchParams.get("page_id"));
      const channel = u.searchParams.get("channel_id");
      return {ok:true,status:200,data:{data:{videos:[
        {albumId:channel+"-"+page+"-one",albumName:"测试剧集",year:2026,imageUrl:"//image.example/one.jpg"},
        {albumId:channel+"-"+page+"-two",albumName:"第二剧集",year:2026,imageUrl:"//image.example/two.jpg"}
      ]}}};
    }},
    tmdb: { async get(path, options) {
      const q = options.params.query;
      if (q === "测试剧集") return {results:[{id:100,name:q,first_air_date:"2026-01-01",poster_path:"/one.jpg"}]};
      if (q === "第二剧集") return {results:[{id:200,name:q,first_air_date:"2026-01-01"}]};
      return {results:[]};
    }},
    storage: {get(k){return storage[k];},set(k,v){storage[k]=v;}}
  };
  const context = vm.createContext({Widget,URL,Date,Promise,setTimeout,console:{log(){},warn(){},error(){}}});
  vm.runInContext(source,context,{timeout:2000});
  return {context,urls,storage,Widget};
}
test("六个原有模块及图标可识别", () => {
  const {context:c}=harness();
  assert.equal(c.WidgetMetadata.id,"iqiyi.video.pc.makka");
  assert.equal(c.WidgetMetadata.version,"1.1.0");
  assert.match(c.WidgetMetadata.icon,/iQiYi_Video\.png$/);
  assert.deepEqual(Array.from(c.WidgetMetadata.modules, x=>x.id),
    ["iqTv","iqMovie","iqVariety","iqAnime","iqDoc","iqKids"]);
  for(const m of c.WidgetMetadata.modules)assert.equal(typeof c[m.functionName],"function");
});
test("默认综合排序正确，叠加地区/类型/年份/资费筛选", async () => {
  const h=harness();
  await h.context.loadIqTv({page:1});
  const p=new URL(h.urls[0]).searchParams;
  assert.equal(p.get("mode"),"24");
  await h.context.loadIqTv({page:1,sort:'{"mode":4}',"1800233":"cid:15","1800333":"cid:24",
    year:'{"market_release_date_level":"2026"}',purchase:'{"is_purchase":"0"}'});
  const q=new URL(h.urls[1]).searchParams;
  assert.equal(q.get("mode"),"4");
  assert.equal(q.get("three_category_id"),"15,24");
  assert.equal(q.get("market_release_date_level"),"2026");
  assert.equal(q.get("is_purchase"),"0");
});
test("分页及六个频道使用不同的对应 channel_id", async () => {
  const h=harness();
  const names=["loadIqTv","loadIqMovie","loadIqVariety","loadIqAnime","loadIqDoc","loadIqKids"];
  const ids=["2","1","6","4","3","15"];
  for(let i=0;i<names.length;i++){
    const result=await h.context[names[i]]({page:i===0?2:1});
    assert.equal(result.length,2);
    assert.equal(new URL(h.urls[i]).searchParams.get("channel_id"),ids[i]);
  }
  assert.equal(new URL(h.urls[0]).searchParams.get("page_id"),"2");
});
test("TMDB 匹配、官方封面回退及保序", async () => {
  const h=harness();
  const result=await h.context.loadIqTv({page:1});
  assert.equal(result[0].id,"100");
  assert.equal(result[0].type,"tmdb");
  assert.equal(result[0].posterUrl,"https://image.tmdb.org/t/p/w500/one.jpg");
  assert.equal(result[1].id,"200");
  assert.equal(result[1].posterUrl,"https://image.example/two.jpg");
  assert.equal(h.context.iqBest([{id:99,name:"火星生活",first_air_date:"2026-01-01"}],
    ["开心超人"],"2026","tv"),null);
});
test("TMDB 网络故障不写负缓存", async () => {
  const h=harness();
  h.Widget.tmdb.get=async () => {throw Error("network down");};
  const items=await h.context.loadIqTv({page:1});
  assert.equal(items.length,0);
  assert.equal(Object.keys(h.storage).filter(k=>k.includes(":tmdb:")).length,0);
});

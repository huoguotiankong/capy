"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../widgets/mgtv.js"), "utf8");

function fixture() {
  const requests = [], memory = {};
  const state = {tmdbDown:false, upstreamDown:false};
  const Widget = {
    http: {
      async get(url) {
        requests.push(url);
        if (state.upstreamDown) throw Error("network offline");
        const query = new URL(url).searchParams;
        const ch = query.get("channelId"), pg = Number(query.get("pn"));
        return {ok:true,status:200,data:{code:200,data:{hitDocs:[
          {clipId:ch+"-"+pg+"-A",title:"测试作品",year:"2026",imgUrlV:"//example.org/a.jpg",imgUrlH:"//example.org/a-wide.jpg"},
          {clipId:ch+"-"+pg+"-B",title:"另一部作品",year:"2026",imgUrlV:"//example.org/b.jpg",imgUrlH:"//example.org/b-wide.jpg"},
          {clipId:ch+"-"+pg+"-duplicate",title:"另一部作品",year:"2026",imgUrlV:"//example.org/b.jpg"}
        ]}}};
      }
    },
    tmdb: {
      async get(route,options) {
        if (state.tmdbDown) throw Error("TMDB unavailable");
        const query=options.params.query;
        if (query==="测试作品") return {results:[{id:100,name:query,first_air_date:"2026-01-01",poster_path:"/a.jpg"}]};
        if (query==="另一部作品") return {results:[{id:200,name:query,first_air_date:"2026-01-01"}]};
        return {results:[]};
      }
    },
    storage:{get(key){return memory[key]},set(key,v){memory[key]=v}}
  };
  const c=vm.createContext({Widget,Promise,Date,setTimeout,console:{log(){},warn(){},error(){}}});
  vm.runInContext(source,c,{timeout:2000});
  return {c,requests,memory,state};
}

test("保留组件 ID 和六大模块，正确设置图标",()=>{
  const {c}=fixture();
  assert.equal(c.WidgetMetadata.id,"mgtv.video.pc.makka");
  assert.equal(c.WidgetMetadata.version,"1.1.0");
  assert.match(c.WidgetMetadata.icon,/Mango_TV\.png$/);
  assert.deepEqual(Array.from(c.WidgetMetadata.modules,x=>x.id),
    ["mgTv","mgMovie","mgVariety","mgAnime","mgDoc","mgKids"]);
  for (const m of c.WidgetMetadata.modules) assert.equal(typeof c[m.functionName],"function");
});

test("电视剧、电影新增 2025/2026 年份；其他模块保留原有筛选",()=>{
  const {c}=fixture();
  for (const module of c.WidgetMetadata.modules.slice(0,2)) {
    const years=module.params.find(x=>x.name==="year").enumOptions;
    assert.ok(years.some(x=>x.value==="2025"));
    assert.ok(years.some(x=>x.value==="2026"));
  }
  assert.ok(c.WidgetMetadata.modules[5].params.some(x=>x.name==="fitAge"));
  assert.ok(c.WidgetMetadata.modules[1].params.some(x=>x.name==="edition"));
});

test("组合筛选、默认值和分页准确生成官方请求",async()=>{
  const f=fixture();
  await f.c.loadMgTv({page:2,kind:"3094",area:"10",year:"2026",feature:"0",chargeInfo:"b1",sort:"c1"});
  let p=new URL(f.requests[0]).searchParams;
  assert.equal(p.get("channelId"),"2");
  assert.equal(p.get("pn"),"2");
  assert.equal(p.get("kind"),"3094");
  assert.equal(p.get("area"),"10");
  assert.equal(p.get("year"),"2026");
  assert.equal(p.get("feature"),"0");
  assert.equal(p.get("chargeInfo"),"b1");
  assert.equal(p.get("sort"),"c1");
  await f.c.loadMgAnime({page:1});
  p=new URL(f.requests[1]).searchParams;
  assert.equal(p.get("channelId"),"50");
  assert.equal(p.get("sort"),"c1");
});

test("TMDB 标识、官方封面回退、原始顺序和去重正确",async()=>{
  const f=fixture();
  const data=await f.c.loadMgMovie({page:1});
  assert.equal(data.length,2);
  assert.deepEqual(Array.from(data,x=>x.id),["100","200"]);
  assert.equal(data[0].type,"tmdb");
  assert.equal(data[0].posterUrl,"https://image.tmdb.org/t/p/w500/a.jpg");
  assert.equal(data[1].posterUrl,"https://example.org/b.jpg");
  assert.equal(data[1].backdropUrl,"https://example.org/b-wide.jpg");
  assert.equal(f.c.mgBest([{id:99,name:"宇宙奇观",first_air_date:"2026-01-01"}],["开心超人"],"2026","tv"),null);
});

test("上游异常会重试，最终返回数组",async()=>{
  const f=fixture();
  f.state.upstreamDown=true;
  const data=await f.c.loadMgDoc({page:1});
  assert.equal(data.length,0);
  assert.equal(f.requests.length,2);
});

test("TMDB 临时故障不会被错误缓存为无匹配",async()=>{
  const f=fixture();
  f.state.tmdbDown=true;
  const data=await f.c.loadMgTv({page:1});
  assert.equal(data.length,0);
  assert.equal(Object.keys(f.memory).filter(x=>x.startsWith("mgpc:v2:tmdb:")).length,0);
});

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../widgets/youku.js"), "utf8");
function fixture() {
  const requests = [];
  const memory = {};
  const state = { workerDown: false, tmdbDown: false };
  const Widget = {
    http: { async get(url) {
      requests.push(url);
      if (state.workerDown) throw Error("worker connection refused");
      const q = new URL(url).searchParams;
      const cat = q.get("category");
      const page = Number(q.get("page"));
      return { ok: true, data: { items: [
        { id: cat + page + "A", title: "测试影片", year: 2026, posterUrl: "//example.org/a.png" },
        { id: cat + page + "B", title: "另一部影片", year: 2026, cover: "//example.org/b.png" },
        { id: cat + page + "B2", title: "另一部影片", year: 2026 }
      ] } };
    } },
    tmdb: { async get(route, opt) {
      if (state.tmdbDown) throw Error("tmdb connection refused");
      const q = opt.params.query;
      if (q === "测试影片") return { results: [{ id: 101, title: q, release_date: "2026-01-01", poster_path: "/t.jpg" }] };
      if (q === "另一部影片") return { results: [{ id: 202, title: q, release_date: "2026-01-01" }] };
      return { results: [] };
    } },
    storage: { get(key) { return memory[key]; }, set(key, value) { memory[key] = value; } }
  };
  const context = vm.createContext({
    Widget, Date, Promise, setTimeout, console: { log() {}, warn() {}, error() {} }
  });
  vm.runInContext(source, context, { timeout: 2000 });
  return { context, requests, memory, state };
}

test("保留原始 ID、六大模块，加入真实图标和 2025/2026 筛选", () => {
  const { context: c } = fixture();
  assert.equal(c.WidgetMetadata.id, "youku.video.pc.makka");
  assert.equal(c.WidgetMetadata.version, "1.3.0");
  assert.match(c.WidgetMetadata.icon, /YouKu_Video\.png$/);
  assert.deepEqual(Array.from(c.WidgetMetadata.modules, m => m.id),
    ["ykTv", "ykMovie", "ykVariety", "ykAnime", "ykDoc", "ykKids"]);
  for (const m of c.WidgetMetadata.modules) {
    assert.equal(typeof c[m.functionName], "function");
    const p = m.params.find(x => x.name === "year");
    assert.ok(p.enumOptions.some(x => x.value === "2025"));
    assert.ok(p.enumOptions.some(x => x.value === "2026"));
  }
});

test("Worker 自定义 URL、地区年份筛选及分页参数正确", async () => {
  const f = fixture();
  const args = { base: "https://my-worker.example/api", mainArea: "中国内地", year: "2026" };
  await f.context.loadYkTv({ ...args, page: 1 });
  await f.context.loadYkTv({ ...args, page: 2 });
  assert.equal(f.requests.length, 2);
  const first = new URL(f.requests[0]), second = new URL(f.requests[1]);
  assert.equal(first.origin, "https://my-worker.example");
  assert.equal(first.pathname, "/api");
  assert.equal(first.searchParams.get("category"), "电视剧");
  assert.equal(first.searchParams.get("area"), "中国内地");
  assert.equal(first.searchParams.get("year"), "2026");
  assert.equal(second.searchParams.get("page"), "2");
});

test("TMDB ID、优酷原始图片回退、去重和顺序正确", async () => {
  const f = fixture();
  const items = await f.context.loadYkTv({ page: 1 });
  assert.equal(items.length, 2);
  assert.deepEqual(Array.from(items, x => x.id), ["101", "202"]);
  assert.equal(items[0].type, "tmdb");
  assert.equal(items[0].posterUrl, "https://image.tmdb.org/t/p/w500/t.jpg");
  assert.equal(items[1].posterUrl, "https://example.org/b.png");
  assert.equal(f.context.ykBest([{ id: 88, title: "火星秘密", release_date: "2026-01-01" }],
    ["快乐超人"], "2026", "tv"), null);
});

test("断网时读取同一筛选页最近六小时成功缓存", async () => {
  const f = fixture();
  const p = { base: "https://my-worker.example/api", year: "2026" };
  const result = await f.context.ykFetch("电视剧", p, 1);
  f.state.workerDown = true;
  const cached = await f.context.ykFetch("电视剧", p, 1);
  assert.equal(result.length, 2);
  assert.equal(cached.length, 2);
});

test("TMDB 临时网络错误不会写入持久负缓存", async () => {
  const f = fixture();
  f.state.tmdbDown = true;
  const items = await f.context.loadYkAnime({ page: 1 });
  assert.equal(items.length, 0);
  assert.equal(Object.keys(f.memory).filter(k => k.startsWith("youku:v3:tmdb:")).length, 0);
});

test("阻止无效 Worker URL", () => {
  const f = fixture();
  assert.throws(() => f.context.ykUrl("电影", { base: "file://x" }, 1));
});

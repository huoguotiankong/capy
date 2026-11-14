"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const widgetSource = fs.readFileSync(path.join(__dirname, "../widgets/qq.js"), "utf8");

function createHarness() {
  const calls = [];
  const memory = {};
  const logger = { log() {}, warn() {}, error() {} };
  const Widget = {
    storage: {
      get(k) { return memory[k]; },
      set(k, v) { memory[k] = v; }
    },
    http: {
      async post(url, body) {
        const b = JSON.parse(body);
        calls.push(b);
        const page = Number(b.page_context.page_index || 1);
        const cid = b.page_params.channel_id;
        return {
          ok: true,
          data: {
            data: {
              modules: {
                normal: {
                  cards: [{ children_list: { poster_card: { cards: [
                    { params: { cid: cid + "-A-" + page, title: "测试剧集", year: "2026", new_pic_vt: "//img.example/a.jpg" } },
                    { params: { cid: cid + "-B-" + page, title: "第二剧集", year: "2026", new_pic_vt: "//img.example/b.jpg" } }
                  ] } } }]
                }
              },
              page_context: { page_index: String(page + 1), _ctrl_page_index: String(page + 1), list_offset: String(page * 12) }
            }
          }
        };
      }
    },
    tmdb: {
      async get(route, opts) {
        if (opts.params.query === "测试剧集") return { results: [{ id: 11, name: "测试剧集", first_air_date: "2026-01-01", poster_path: "/poster.jpg" }] };
        if (opts.params.query === "第二剧集") return { results: [{ id: 22, name: "第二剧集", first_air_date: "2026-02-01" }] };
        return { results: [] };
      }
    }
  };
  const ctx = vm.createContext({ Widget, console: logger, setTimeout, Promise, Date });
  vm.runInContext(widgetSource, ctx, { timeout: 2000 });
  return { ctx, calls, memory };
}

test("元数据和原始六个模块保持兼容", () => {
  const { ctx } = createHarness();
  assert.equal(ctx.WidgetMetadata.id, "qq.video.pc.makka");
  assert.equal(ctx.WidgetMetadata.version, "1.1.0");
  assert.match(ctx.WidgetMetadata.icon, /Tencent_Video\.png$/);
  assert.deepEqual(Array.from(ctx.WidgetMetadata.modules, m => m.id),
    ["qqTv", "qqMovie", "qqVariety", "qqAnime", "qqDoc", "qqKids"]);
  for (const m of ctx.WidgetMetadata.modules) assert.equal(typeof ctx[m.functionName], "function");
});

test("筛选参数实际进入腾讯请求，不同分类使用不同频道", async () => {
  const h = createHarness();
  await h.ctx.loadQqTv({ itype: "1", iarea: "0", page: 1 });
  await h.ctx.loadQqMovie({ itype: "4", page: 1 });
  assert.equal(h.calls.length, 2);
  assert.notEqual(h.calls[0].page_params.channel_id, h.calls[1].page_params.channel_id);
  assert.match(h.calls[0].page_params.filter_params, /itype=1/);
  assert.match(h.calls[0].page_params.filter_params, /iarea=0/);
  assert.match(h.calls[1].page_params.filter_params, /itype=4/);
});

test("分页使用上一页返回的游标，而非永远显示第一页", async () => {
  const h = createHarness();
  const first = await h.ctx.loadQqTv({ page: 1 });
  const second = await h.ctx.loadQqTv({ page: 2 });
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].page_context.page_index, "2");
  assert.equal(first.length, 2);
  assert.equal(second.length, 2);
});

test("TMDB 无海报时回退腾讯封面，严格名称匹配避免错条目", async () => {
  const h = createHarness();
  const list = await h.ctx.loadQqTv({ page: 1 });
  assert.equal(list[0].posterUrl, "https://image.tmdb.org/t/p/w500/poster.jpg");
  assert.equal(list[1].posterUrl, "https://img.example/b.jpg");
  assert.equal(list[0].type, "tmdb");
  const wrong = h.ctx.qqBest([{ id: 99, name: "宇宙生活", first_air_date: "2026-01-01" }], ["开心超人"], "2026", "tv");
  assert.equal(wrong, null);
});

test("TMDB 临时故障不会被永久缓存为无匹配", async () => {
  const h = createHarness();
  h.ctx.Widget.tmdb.get = async () => { throw Error("network down"); };
  const list = await h.ctx.loadQqTv({ page: 1 });
  assert.equal(list.length, 0);
  assert.ok(!Object.keys(h.memory).some(k => k.includes(":tmdb:")));
});

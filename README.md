# CapyPlayer 组件仓库

## 爱奇艺片库 v1.1.0 — CapyPlayer Widget

**固定安装 URL：** https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/iqiyi.js

**源码：** [widgets/iqiyi.js](widgets/iqiyi.js)

基于原 MakkaPakka 爱奇艺组件升级，保留组件 ID `iqiyi.video.pc.makka` 和电视剧、电影、综艺、动漫、纪录片、少儿六个分类。增加爱奇艺图标，修正综合排序默认值，电视剧/电影增加 2025 和 2026 年份选项，保留地区/类型/资费组合筛选；优化页码、解析结构、海报回退、TMDB 匹配阈值、并发顺序与缓存。

**安装：** 在 CapyPlayer「组件」页面粘贴安装 URL，预览后安装。该组件输出 **TMDB 媒体条目**，用于展示与查看详情，**不包含爱奇艺播放流解析**；TMDB 无可信匹配时条目可能被跳过。

**验证：** 已完成 JavaScript 语法及模拟接口回归测试，未完成真实爱奇艺 API/安卓 CapyPlayer 真机的端到端验证。上游筛选 ID、图片字段等有变化时应通过实际响应继续适配。可用 `node --test tests/iqiyi-widget.test.js` 运行自动模拟测试。

---


## 腾讯视频片库 v1.1.0 — CapyPlayer Widget

**固定安装 URL：** https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/qq.js

**源码：** [widgets/qq.js](widgets/qq.js)

在原 MakkaPakka 腾讯组件上升级，保留组件 ID `qq.video.pc.makka` 和原有六个分类：电视剧、电影、综艺、动漫、纪录片、少儿。增加腾讯视频图标（来自 [IconResource 图标库](https://github.com/luestr/IconResource)）；完善默认筛选、电影与综艺 2025/2026 年份选项、后台游标分页、海报字段回退、TMDB 匹配置信度、缓存失效时间、并发保序和错误日志。

**使用说明：** 在 CapyPlayer 的组件管理页面添加上述 JS URL。组件返回的是已匹配的 **TMDB 媒体条目**，用于展示与进入 TMDB 详情，**不解析腾讯视频播放流**；TMDB 未找到可信匹配时该作品可能不显示。腾讯接口筛选值（包括最新年份）可能调整，实际可用性以 App 中的真实请求为准。

**验证范围：** 已执行 JS 语法、模块、筛选、分页游标、海报回退、误匹配防护的模拟测试；尚未完成腾讯线上接口和 Android CapyPlayer 真机端到端验收。模拟回归测试可通过 `node --test tests/qq-widget.test.js` 执行。

---


此仓库集中维护卡皮巴拉 JavaScript 组件；可直接安装的脚本在 `widgets/`。

## 红果短剧 v0.4.0 — 无电脑纯组件版

**固定安装 URL：** https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js

**源码：** [widgets/hongguo.js](widgets/hongguo.js)

### 已开发（目录与导航）

- 首页热播、真人剧、漫剧、AI 剧、漫画；题材、分页。
- 按关键词搜索短剧、新增「系列换季搜索」模块；相同剧名的季按季号排序。
- 详情页的海报、简介、演员/标签（按官网返回情况）；解析季号、剧集 ID。
- 关联季同时参考官网播放页和搜索 API；在详情页「类似作品」中点击跳转另一季。
- 官网播放页**直接公开、且可由普通播放器识别**的资源：作为候选播放项返回。若相关季也提供公开直链，则可组成原生 `seasons` 多季列表。

### 已知限制（重要）

**不依赖电脑，但不等于红果全集已能播放。**

原始红果视频多数采用 CENC 受保护 MP4。`openhongguo` SDK 能返回播放模型，但拿到加密媒体 URL 并不代表 CapyPlayer 普通播放器可以解码。`kaixinguo-android` 使用 Android 原生 Media3 的自定义 CENC DataSource，不能原样移植到纯 Widget 沙箱。当前公开 Widget API 未提供自定义原生视频 DataSource 或完整受保护视频流处理。缺少直链时，资源区可能依然显示「暂无可播放资源」，这是已知限制，不是需要配置电脑。

当季无公开播放地址时，原生多季选集也不会强行显示空的选集；用户可以通过「类似作品」跳转其他季。

该版本还**未通过红果真实视频播放与 CapyPlayer Android 真机端到端验收**；自动测试只验证 JS 的数据契约和模拟官网响应。

### 安装与升级

1. 在 CapyPlayer 组件管理中添加上述 Raw URL，或检查已安装组件更新。
2. 如仍看到旧的局域网桥接参数，可以删除旧组件并重新使用相同 URL 安装，刷新首页缓存。
3. 点击「系列换季搜索」输入剧名测试排序；详情页的「类似作品」用于切换同系列。
4. 检查「资源」区域有无普通直链；如仍显示空，说明没有取得可直接播放的流，不要使用伪造播放地址。

### 版本与参考

- `archive/hongguo-lan-v0.3.0.js`：实验性 Windows LAN 桥接旧版，仅存档，不作为当前组件使用。
- `server/`：过去的播放桥接实验代码，不是 v0.4.0 的依赖。
- [CapyPlayer 官方组件开发指南](https://capyplayer.feifeiduck.com/zh/dev/widget/widgetdev)
- [openhongguo](https://github.com/beilunyang/openhongguo)：数据模型与季/合集概念参考。
- [kaixinguo-android](https://github.com/kadaliao/kaixinguo-android)：手机端原生媒体处理架构参考。

仅用于学习与个人使用；请尊重视频版权与平台访问规则。

## 进行中的播放实验（尚未上线）

为解决 v0.4.0「暂无可播放资源」，新增了**不覆盖稳定组件**的第三方供应商 API 试验分支：

- [实验项目说明](experimental/xiaoying/README.md)
- [独立 Beta Widget](experimental/xiaoying/widgets/hongguo-api-beta.js)，组件 ID `mx.hongguo.xiaoying.beta`
- [Vercel 签名/播放跳转 API](experimental/xiaoying/api/hongguo.js)，只生成临时媒体 URL 跳转，不代理视频流。

**当前实验版本：v0.5.0-beta.3。** 已改为请求头身份认证 + 每集 4 小时限定票据，长期口令不再写入播放器 URL。已补充 Node 模拟测试与 GitHub Actions 检查工作流。**仍未取得供应商项目凭证，尚未确认费用与版权/播放授权，也未部署或在 Android 上验证实片播放。** 不要以 Beta 脚本替换稳定版。

**实验部署：** 已创建独立 Vercel 项目 `capy-hongguo-lab`，部署构建状态 READY；尚未配置供应商项目凭证，Vercel 部署认证保护仍开启，不能视为卡皮巴拉可直接使用的播放接口。已补充 HEAD 支持和受认证的 `diagnose` 诊断入口，详情见实验说明。

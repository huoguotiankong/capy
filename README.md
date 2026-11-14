# CapyPlayer 组件仓库

存放个人使用的 CapyPlayer（卡皮巴拉）JavaScript 组件。源码集中在 `widgets/`，后续更新保留稳定安装地址。

## 红果短剧（v0.2.1）

**固定组件 URL：** `https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js`

### v0.2.0–0.2.1 播放与跨季

- 根据原 PY 源保留分类、搜索与 `series_id`；通过官网 `/detail?series_id={id}` 和 `/player/{id}` 的 SSR 数据识别 `seriesDetail.vid_list`、`accessible_episode_cnt` 和 `video_player_info.main_url`。
- 实际播放资源：对官网开放且返回真实 CDN URL 的集数创建 CapyPlayer `seasons[].episodes[].videoUrl`，最多探测前 3 集。对于未开放集、无源集，不再输出空的播放项（不会假装全集能放）。
- 换季：优先解析官网播放页相关季的 `/player/{series_id}` 链接，按季号排序并生成 `recommendations`；点击可进入其他季详情。关联列表缺失时回退官方搜索 API。
- 官方宿主限制：完整的原生“季切换”列表依赖真实可播放季集数据；若没有每一季可播放链接，不能仅靠给出季号强行显示有效原生选集。当前可用的换季入口是详情页“推荐作品”。
- 原 TVBox/PY 源的全剧播放依赖私有取流、签名、CENC 处理及 Range HTTP 服务；**该 JS 版本尚未移植这一后端**。如需完整播放，必须另有经过许可、可用的流媒体服务，不能直接把 PY 的本地 127.0.0.1 地址填入 CapyPlayer。
- v0.2.1 加强媒体 URL 结构兼容、关联季标题解析与短时页面缓存，减少详情请求重复发送。
- CDN 临时链接可能过期；需要重新打开详情页重新获取。原 PY 源的弹幕也未迁移。

**测试范围：** 静态语法检查与模拟官网响应单元测试通过；真实 Android 宿主、源站直链有效性和播放器内核仍需人工验证。

### 安装与更新

1. 在卡皮巴拉组件管理中粘贴以上固定 URL。
2. 如果已经安装，先检查更新；没有更新入口时可以重新安装，再刷新缓存。
3. 进入首页的“红果热播” → 任选剧集 → 检查资源是否有“第 1 集”，以及下方是否出现对应季的推荐卡片。
4. 如仍显示“暂无可播放资源”，代表源站当次没有返回可用 CDN 直链；不代表可以伪造一个浏览页面 URL 来播放。


### 开发参考

- 组件文件：`widgets/hongguo.js`
- CapyPlayer 官方组件文档：https://capyplayer.feifeiduck.com/zh/dev/widget/widgetdev
- 原始数据与算法参考：用户提供的《红果短剧(弹幕+显季版).py》。

原 PY 源的完整取流依赖移动端请求签名、CENC 处理及支持 HTTP Range 的流服务。可选的 `HG_STREAM_BRIDGE` 仅为预留接口，目前没有公开或自动部署后端；其约定路径为 `/v1/hongguo/stream?vid=<id>&q=<quality>`。对于没有合法可用播放源的集数，组件不会虚构链接。
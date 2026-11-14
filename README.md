# CapyPlayer 组件仓库

存放个人使用的 CapyPlayer（卡皮巴拉）JavaScript 组件。源码集中在 `widgets/`，后续更新保留稳定安装地址。

## 红果短剧（v0.2.0）

**固定组件 URL：** `https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js`

### v0.2.0 播放与跨季

- 根据原 PY 源保留分类、搜索与 `series_id`；通过官网 `/detail?series_id={id}` 和 `/player/{id}` 的 SSR 数据识别 `seriesDetail.vid_list`、`accessible_episode_cnt` 和 `video_player_info.main_url`。
- 实际播放资源：对官网开放且返回真实 CDN URL 的集数创建 CapyPlayer `seasons[].episodes[].videoUrl`，最多探测前 3 集。对于未开放集、无源集，不再输出空的播放项（不会假装全集能放）。
- 换季：优先解析官网播放页相关季的 `/player/{series_id}` 链接，按季号排序并生成 `recommendations`；点击可进入其他季详情。关联列表缺失时回退官方搜索 API。
- 官方宿主限制：完整的原生“季切换”列表依赖真实可播放季集数据；若没有每一季可播放链接，不能仅靠给出季号强行显示有效原生选集。当前可用的换季入口是详情页“推荐作品”。
- 原 TVBox/PY 源的全剧播放依赖私有取流、签名、CENC 处理及 Range HTTP 服务；**该 JS 版本尚未移植这一后端**。如需完整播放，必须另有经过许可、可用的流媒体服务，不能直接把 PY 的本地 127.0.0.1 地址填入 CapyPlayer。
- CDN 临时链接可能过期；需要重新打开详情页重新获取。原 PY 源的弹幕也未迁移。

**测试范围：** 静态语法检查与模拟官网响应单元测试通过；真实 Android 宿主、源站直链有效性和播放器内核仍需人工验证。

### 安装与更新

1. 在卡皮巴拉组件管理中粘贴以上固定 URL。
2. 如果已经安装，先检查更新；没有更新入口时可以重新安装，再刷新缓存。
3. 进入首页的“红果热播” → 任选剧集 → 检查资源是否有“第 1 集”，以及下方是否出现对应季的推荐卡片。
4. 如仍显示“暂无可播放资源”，代表源站当次没有返回可用 CDN 直链；不代表可以伪造一个浏览页面 URL 来播放。


- 组件文件：`widgets/hongguo.js`
- 固定安装地址：`https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js`
- 官方组件文档：https://capyplayer.feifeiduck.com/zh/dev/widget/widgetdev
- 依据：用户提供的《红果短剧(弹幕+显季版).py》中的官网数据接口与季集映射逻辑

### v0.1.1 历史修复

- 分类新增 SSR HTML 卡片解析；真人剧、漫剧、AI 剧新增首页同类别推荐兜底；漫画增加 Googlebot 请求尝试。
- 详情新增 `/player/{series_id}` 与 HTML 元数据兜底，避免因缺失 `_ROUTER_DATA` 直接崩溃。若网页不提供完整季集，可能只能显示剧名、简介和总集数。
- 新增 `WidgetMetadata.icon` 图标，组件名称缩短为「红果短剧」，保留组件 ID 和 Raw 安装地址。
- 网络请求超时优化。完成模拟响应解析测试，**尚未进行真实手机端和实时源站验收**。
- App 原生页面标题位置无法由组件脚本直接调整。

### 已实现

首页热播、真人剧、漫剧、AI 剧、漫画、题材筛选、分页、关键词搜索（含受限兜底）、详情元数据、按官网 `season_info.series_group_id` 关联季及各季 `vid_list` 集数。

### 尚未支持

**该版本仅用于目录/结构测试，不是已验证的完整播放组件。** 原 PY 源取流需要移动端请求签名、CENC 解密、视频数据重写与支持 Range 的本机流媒体服务器；官方 Widget 沙箱没有公开这些能力。未配置播放桥接时，集数没有 `videoUrl`，CapyPlayer 可能不显示或不能播放集数。原来源的弹幕功能也尚未移植。

脚本保留可选 `HG_STREAM_BRIDGE` 设置，未来有**经过授权且实际部署的**流媒体服务时可启用，地址约定为：

`<bridge>/v1/hongguo/stream?vid=<episode_id>&q=<1080|720|540|480|360>`

上述是接口约定，并不代表本仓库已经提供服务器。必须由服务端返回真正可播放的内容并支持 HTTP Range/206。不要用视频详情页 URL 冒充视频 URL。

### 安装

1. 确认仓库为 Public，GitHub Raw URL 能匿名访问。
2. 打开卡皮巴拉 → 组件 → `+`。
3. 粘贴上述固定安装地址，预览后添加。
4. 先验证分类、搜索和详情。播放相关功能需要额外适配并在真机测试。

升级时保持文件路径不变、递增 `WidgetMetadata.version`，利用 Git 版本记录回退。

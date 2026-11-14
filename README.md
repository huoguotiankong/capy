# CapyPlayer 组件仓库

存放个人使用的 CapyPlayer（卡皮巴拉）JavaScript 组件。源码集中在 `widgets/`，后续更新保留稳定安装地址。

## 红果短剧 · 官网目录（v0.1.0）

- 组件文件：`widgets/hongguo.js`
- 固定安装地址：`https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js`
- 官方组件文档：https://capyplayer.feifeiduck.com/zh/dev/widget/widgetdev
- 依据：用户提供的《红果短剧(弹幕+显季版).py》中的官网数据接口与季集映射逻辑

### 已实现

首页热播、真人剧、漫剧、AI 剧、漫画、题材筛选、分页、关键词搜索（含受限兜底）、详情元数据、按官网 `season_info.series_group_id` 关联季及各季 `vid_list` 集数。

### 尚未支持

**该版本仅用于目录/结构测试，不是已验证的完整播放组件。** 原 PY 源取流需要移动端请求签名、CENC 解密、视频数据重写与支持 Range 的本机流媒体服务器；官方 Widget 沙箱没有公开这些能力。未配置播放桥接时，集数没有 `videoUrl`，CapyPlayer 可能不显示或不能播放集数。原来源的弹幕功能也尚未移植。

脚本保留可选 `HG_STREAM_BRIDGE` 设置，未来有**经过授权且实际部署的**流媒体服务时可启用，地址约定为：

`<bridge>/v1/hongguo/stream?vid=<episode_id>&q=<1080|720|540|480|360>`

上述是接口约定，并不代表本仓库已经提供服务器。必须由服务端返回真正可播放的内容并支持 HTTP Range/206。不要用视频详情页 URL 冒充视频 URL。

### 安装

1. 在 GitHub 仓库 Settings → General → Danger Zone → Change repository visibility 将本仓库设为 **Public**。私有仓库无法匿名通过 Raw URL 安装。
2. 打开卡皮巴拉 → 组件 → `+`。
3. 粘贴上述固定安装地址，预览后添加。
4. 先验证分类、搜索和详情。播放相关功能需要额外适配并在真机测试。

升级时保持文件路径不变、递增 `WidgetMetadata.version`，利用 Git 版本记录回退。

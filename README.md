# CapyPlayer 组件仓库

CapyPlayer 组件集中在 `widgets/`，可选播放辅助服务在 `server/`。

## 红果短剧 v0.3.0（局域网播放桥接测试版）

- 组件固定安装 URL：https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js
- 组件源码：[widgets/hongguo.js](widgets/hongguo.js)
- 桥接服务：[server/bridge.py](server/bridge.py)
- Windows 使用说明：[server/README.md](server/README.md)
- CapyPlayer 官方组件开发文档：https://capyplayer.feifeiduck.com/zh/dev/widget/widgetdev

### 问题根因

原 TVBox/FongMi Python 源使用签名取流、加密视频处理和 HTTP Range 本地服务器，纯 CapyPlayer JS 沙箱不能直接实现全部操作。v0.2.1 对官网公开直链的尝试在手机端仍无法稳定获取视频，因此 v0.3.0 添加**需要单独运行**的本地播放服务。

### 配置方法

1. 下载本次对话中的 `capy_hongguo_bridge_v0.3.0.zip` 并解压，包含原 PY 源、桥接器和测试。
2. Windows 10 / 11 按 [server/README.md](server/README.md) 安装依赖、启动服务，记录服务所在电脑的 LAN IP 和随机口令。
3. 在组件全局参数填入 `hgBridgeUrl=http://192.168.1.10:8931`（换成实际 IP）与 `hgBridgeToken=<启动服务时输出的口令>`。
4. 刷新组件列表以保存参数，再打开短剧详情。组件检测服务状态，预热前几集，并为可获取 `vid_list` 的剧集提供桥接播放线路。

### 当前限制

- 需要电脑持续开机、同一局域网，尚未部署云服务。
- 仅验证 Python 桥接协议中的 HTTP Range/206、HEAD、口令认证与健康检查；**真实红果取流和卡皮巴拉安卓播放仍待验证**。
- 原生多季选集依赖真实的季集和可用播放资源；当前其他季可以通过详情页的相关推荐跳转。
- 不要将服务端口直接开放到公网，不要把访问口令上传到公开 GitHub；仅用于合法授权内容。

### 历史版本

- v0.1.1：修复分类/详情 HTML 解析与图标。
- v0.2.1：公开集直链尝试、跨季推荐导航。
- v0.3.0：桥接地址/口令设置、健康检查、播放会话预热和独立 Windows LAN 服务。

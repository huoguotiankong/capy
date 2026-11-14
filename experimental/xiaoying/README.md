# 红果短剧 API 播放实验（不影响 v0.4.0 稳定版）

目的：研究在无需开启个人电脑的情况下，通过**已经取得使用授权的第三方媒体服务**为 CapyPlayer 提供短剧集数与按需播放地址。本实验不实现 DRM 解密或视频字节流转发。

## 当前结论（2026-11-14）

- 小影 API 文档：https://www.xiaoyingapi.com/docs/drama/
- 接入向导：https://www.xiaoyingapi.com/guide/
- 文档包含 rank/categories/list/search/detail/play/stream 接口及字段说明，但文档在「开放·免签名」和「需项目签名」的标注上存在矛盾；正式接入按**需要签名**处理。
- 官网要求由管理员开通项目，提供 APPID 和 APPSECRET；**尚未取得项目凭证，也尚未确认 API 授权范围、资费/调用额度及生产可用性**。
- 当前无法证明该服务能够合法、稳定地提供全集资源；**不得把模拟测试当成真实播放验收**。

## 目录

- `api/hongguo.js`：Vercel Node.js Serverless API。HMAC-SHA256 项目签名、访问口令、输入校验；播放模式只进行 302 跳转，不在 Vercel 上传、下载或转码 MP4。
- `widgets/hongguo-api-beta.js`：单独的 CapyPlayer 测试组件（ID 为 `mx.hongguo.xiaoying.beta`），不覆盖现有 `widgets/hongguo.js`；复用官网分类和换季，只有服务端返回 `playable=true` 时才生成可点击的按需解析 URL。
- `tests/api.test.js`：Node 单测。

## Vercel 试验部署说明（未部署）

1. **先确认接入方具有相关视频数据、播放地址的使用与分发授权，明确费用和调用配额。** 未确认前不要运行或启用直播流。
2. Vercel 新建单独的测试项目，以本仓库 GitHub 为来源，把 **Root Directory 设置为 `experimental/xiaoying`**，Framework 为 Other，Node.js 20 或更高。
3. 在 Vercel 项目的环境变量中设置 `XY_APP_ID`、`XY_APP_SECRET`、`CAPY_ACCESS_KEY`。前三者均不得写入 GitHub、公共 URL 或聊天内容；`CAPY_ACCESS_KEY` 自行生成高熵个人口令并只保存在该测试项目和手机组件配置里。
4. 首先访问 `https://<your-vercel-host>/api/hongguo?op=status`；仅检查 JSON `ready:true`，这并不意味着供应商接口可以访问或视频能播放。
5. 使用你自己的访问口令测试 `op=detail&series_id=<id>&access_key=<personal-token>`。不要公开带 token 的完整 URL。
6. 完成 detail 的实际响应测试后，才配置 CapyPlayer Beta 组件 `hgApiBase=https://<your-vercel-host>` 和 `hgApiKey=<personal-token>`；刷新列表保存配置。
7. 通过真实手机测试第 1 集、第 4 集、换季、画质、临时 URL 过期、播放器 302 跟随能力。通过前不要替换 v0.4.0。

## 风险与限制

- 认证后端的客户端访问口令在视频 URL 查询参数中，可能被播放器或代理记录。仅适合个人实验，建议使用独立、可轮换的低权限口令；此口令**不能**和供应商的 APPSECRET 相同。请勿公开任何真实视频链接或口令。
- 服务无分布式配额/限流机制；不能直接开放给多人使用，避免产生无法控制的调用费用。
- `mode=file` 可能让首次播放返回 202 等待生成；第三方还可能返回 503、403。CapyPlayer 不一定自动重试这些状态。
- Vercel 只负责取得真实有效的临时媒体 URL 并跳转，不保证第三方对 HEVC/MP4 Range 或设备 DRM 的兼容性。
- 供应商如果不能证明内容授权和正式使用条款，应停止该实验，而不是通过 DRM 绕过来实现播放。

## 本地单元测试

安装 Node.js 20+，在当前目录运行：`npm test`。测试范围：签名串、输入验证、未授权拒绝、未配置拒绝、上游播放 302 重定向、错误状态；模拟数据不代表源站真实响应。

稳定组件仍是：`https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js`。
实验组件（仅用于授权测试）：`https://raw.githubusercontent.com/huoguotiankong/capy/main/experimental/xiaoying/widgets/hongguo-api-beta.js`。

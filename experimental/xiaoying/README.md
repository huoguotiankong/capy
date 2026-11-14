# 红果短剧授权播放 API：独立实验分支

此目录供学习、测试与**经许可的第三方媒体服务**接入使用，**不代表已拥有提供红果内容的版权或播放授权**。稳定版 `widgets/hongguo.js` 保持 v0.4.0。

## 已核对的外部条件

- 小影文档：https://www.xiaoyingapi.com/docs/drama/
- 接入向导：https://www.xiaoyingapi.com/guide/
- 文档标注有“开放·免签名”，但红果播放与总说明明确要求 HMAC-SHA256 项目签名；因此本实验按**必须取得项目凭证**设计。
- 项目由管理员开通，提供 `APPID` 和 `APPSECRET`。调用费用、额度、内容与再分发授权均尚未核实；**不能宣称视频已经可播放、永久免费或获授权**。
- 签名说明要求方法大写、实际请求路径、按 ASCII 键序组合的字段，路径尾斜杠必须一致。当前默认请求 `/api/dramas/hongguo/<operation>/`，若服务商确认生产路由无结尾斜杠，可设置 `XY_PATH_TRAILING_SLASH=false`。

## 文件

- `api/hongguo.js`：Vercel Node.js 函数。接收卡皮巴拉请求，按提供商规范签名调用。`detail` 返回每集候选画质所需的**临时、限定集号的签名票据**，`play` 使用票据取得上游临时地址并 302 跳转。
- `widgets/hongguo-api-beta.js`：独立的 `mx.hongguo.xiaoying.beta` 组件，版本 v0.5.0-beta.2，不覆盖正式组件；保存个人配置，使用 `X-Capy-Access-Key` 请求头访问自己的后端，而不是在视频 URL 放长期访问口令。
- `tests/api.test.js`：签名、请求校验、票据篡改与过期、未授权拒绝、详情票据、302、供应商异常模拟测试。
- `.github/workflows/hongguo-api-check.yml`：GitHub Actions 自动运行 Node 语法检查与测试。

## 运行方式（目前未部署）

1. 先向服务商确认并获得 API 使用权限、媒体转发授权和可接受的计费额度。不能自行假定任何接口可匿名使用。
2. 在 Vercel 新建**单独的测试项目**，GitHub 仓库选择 `huoguotiankong/capy`，Root Directory 选择 `experimental/xiaoying`，Framework 选 Other，Node.js 20+。
3. 配置服务器环境变量（只在 Vercel 设置，不要上传 GitHub）：
   - `XY_APP_ID`：服务商项目 ID
   - `XY_APP_SECRET`：服务商项目签名密钥
   - `CAPY_ACCESS_KEY`：自己生成的高熵、仅供 CapyPlayer 调用后端的访问口令
   - `CAPY_TICKET_SECRET`：另一个独立的高熵密钥，用于签发播放票据
   - `XY_PATH_TRAILING_SLASH`：可选，默认 true；经服务商确认后才设 false
4. 访问 `/api/hongguo?op=status`：返回 `ready:true` 仅代表环境变量完整，并**不代表实片播放成功**。
5. 从卡皮巴拉 Beta 组件的参数输入 `hgApiBase=https://你的域名`、`hgApiKey=你的CAPY_ACCESS_KEY`，刷新模块使配置保存到本机。
6. 用实际短剧核对 API 搜索、详情、选集、第一集与第 4 集播放；验证播放器支持 HTTP 302、分片 MP4、HEVC，不可用时尝试 360P 兼容线路。

## 播放安全流程

1. 组件通过 HTTPS 自定义请求头 `X-Capy-Access-Key` 读取详情；长期客户端口令**不出现在 URL**。
2. 后端只对 `episodes[].playable === true` 的集数签发播放票据，票据绑定剧 ID、集号、画质、编码、流模式与过期时间，4 小时后失效。
3. 播放器打开 `https://你的域名/api/hongguo?op=play&ticket=...`，后端临时调用服务商 `play` 接口，并以 HTTP 302 跳转到上游返回的 HTTPS 视频地址；Vercel **不会转发/转码整段媒体**。
4. 线路默认包括 1080P HEVC、720P HEVC 与 360P H264（是否支持取决于供应商）。默认使用 `pipe` 流，部分内核不支持跳转、流式视频或 HEVC，需在安卓真机验证。

## 限制与注意事项

- 票据是短期 Bearer URL，可以被转发使用至过期，并非真正的一次性密码；请勿分享。
- 票据会过期，播放数小时后可能需要重新打开详情页以刷新；上游流首次加载、并发、配额与限流均未知。
- Beta 没有跨实例的全局配额控制，不适合多人共享。避免意外流量和计费。
- 文档中的官方路由有斜杠标注不一致风险、真实生产签名的正确性待有效凭证验证。
- 不能自动完成项目开通、服务商授权确认、费用同意或真实端到端播放验证；在取得批准之前**不启动云部署**。

## 无凭证时执行测试

Node.js 20+，运行 `cd experimental/xiaoying && npm test`。测试只使用模拟数据。

**稳定组件 URL：** https://raw.githubusercontent.com/huoguotiankong/capy/main/widgets/hongguo.js

**实验组件 URL：** https://raw.githubusercontent.com/huoguotiankong/capy/main/experimental/xiaoying/widgets/hongguo-api-beta.js
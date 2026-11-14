# 红果短剧 / CapyPlayer 局域网播放桥接

利用用户已有的 `红果短剧(弹幕+显季版).py` 中的 Range 视频输出模块，为 CapyPlayer 的 JS 组件提供独立服务。**本文件不是纯 JS 播放器，也不是已部署的在线服务。**

## 下载配套包

ChatGPT 对话内的 `capy_hongguo_bridge_v0.3.0.zip` 包含：
- `bridge.py`：HTTP 服务桥接器（本仓库已提交）。
- `红果短剧(弹幕+显季版).py`：用户此前提供的原始脚本，桥接器运行时依赖它。
- `test_bridge.py`：本地 HTTP Range 模拟测试。
- `README.md`：更详细的 Windows 启动指导。

## Windows 10 / 11 使用

首先安装 Python 3.10+，将 ZIP 解压至同一目录，打开 PowerShell：

```powershell
py -3 -m pip install requests pycryptodome
$env:HG_BRIDGE_TOKEN = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
py -3 .\bridge.py --source ".\红果短剧(弹幕+显季版).py" --host 0.0.0.0 --port 8931
```

**务必私下保存口令，不要提交仓库。** 手机与电脑连接同一 Wi-Fi，通过 `ipconfig` 取得电脑的局域网 IPv4 地址，例如 `192.168.1.10`。手机浏览器打开 `http://192.168.1.10:8931/health`，返回 `{"ok":true,"service":"capy-hongguo-bridge"}` 即表明已连接到服务器。

在 CapyPlayer 组件的全局参数填入 `hgBridgeUrl=http://192.168.1.10:8931` 与 `hgBridgeToken=<启动时的口令>`。先刷新组件分类/首页以便保存参数，再打开详情页。桥接健康检查成功且官网返回剧集 vid 列表时，组件会显示集数和清晰度线路。

**注意：** 如果 CapyPlayer 客户端没有全局参数编辑功能，或受限于 Android 对明文 HTTP 的限制，则需要进一步适配；尚未完成真实 Android 设备的端到端验证。

## API

- `GET /health` → 服务状态。
- `GET /v1/hongguo/warm?vid=<id>&q=1080&token=<secret>` → 202，异步预热。
- `GET|HEAD /v1/hongguo/stream?vid=<id>&q=1080&token=<secret>` → Range 视频流，返回 200 或 206。

## 重要限制

1. PC 必须一直运行。此配置**只适合可信局域网**；不要把 8931 端口转发到公网。外网访问需要 HTTPS 和更严格的认证保护。
2. 服务的 CENC 解密、签名取流逻辑仍依赖原 Python 源；若上游变动，可能返回 502 或超时。
3. 仅用于你有合法访问权的视频内容。不得用作公开转播和分发服务。
4. Vercel Serverless 不适合直接托管原 PY 的长连接 MP4 Range 处理；目前没有配置自动化云部署。
5. 已通过桥接协议的 HTTP Range/206、HEAD、401、健康检查模拟测试；尚未验证真实红果取流和安卓端实际播放。

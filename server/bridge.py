#!/usr/bin/env python3
"""LAN playback bridge for CapyPlayer, reusing the user-supplied Hongguo Python source.

Run: python bridge.py --source "红果短剧(弹幕+显季版).py" --host 0.0.0.0 --port 8931
Set HG_BRIDGE_TOKEN to a strong random secret. LAN use only.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import secrets
import sys
import threading
from http.server import ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode, urlparse


def load_source(path: str):
    spec = importlib.util.spec_from_file_location("capy_hongguo_source", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("无法载入原始红果 PY 源")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    if not hasattr(module, "_StreamHandler") or not hasattr(module, "Spider"):
        raise RuntimeError("该 PY 源版本缺少本地 Range 播放服务")
    return module


def build_handler(source, token: str, did: str, iid: str):
    class BridgeHandler(source._StreamHandler):
        server_version = "capy-hongguo-bridge"

        def _serve(self, body: bool) -> None:
            parsed = urlparse(self.path)
            if parsed.path == "/health":
                data = json.dumps({"ok": True, "service": "capy-hongguo-bridge"}).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                if body:
                    self.wfile.write(data)
                return

            if parsed.path not in ("/v1/hongguo/stream", "/v1/hongguo/warm"):
                self._fail(404, b"not found")
                return

            query = parse_qs(parsed.query)
            supplied_token = (query.get("token") or [""])[0]
            if not secrets.compare_digest(supplied_token, token):
                self._fail(401, b"unauthorized")
                return

            vid = (query.get("vid") or [""])[0]
            quality = (query.get("q") or ["1080"])[0]
            if not vid.isdigit() or quality not in {"360", "480", "540", "720", "1080"}:
                self._fail(400, b"invalid vid or quality")
                return

            if parsed.path == "/v1/hongguo/warm":
                def warm():
                    try:
                        source._stream_session(vid, {"device_id": did, "install_id": iid}, quality)
                    except Exception:
                        pass
                threading.Thread(target=warm, daemon=True).start()
                self.send_response(202)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

            # All stream processing stays within the original Python source.
            # The bridge does not expose device identifiers to the client.
            self.path = "/hg.mp4?" + urlencode({
                "vid": vid, "q": quality, "did": did, "iid": iid,
            })
            super()._serve(body)

        def log_message(self, *_):
            # Query strings contain access tokens and must not be logged.
            pass

    return BridgeHandler


def main() -> None:
    parser = argparse.ArgumentParser(description="CapyPlayer Hongguo LAN playback bridge")
    parser.add_argument("--source", default="红果短剧(弹幕+显季版).py")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8931, type=int)
    options = parser.parse_args()
    token = os.environ.get("HG_BRIDGE_TOKEN") or secrets.token_urlsafe(32)
    source = load_source(options.source)
    spider = source.Spider()
    spider.init()
    handler = build_handler(source, token, spider.device_id, spider.install_id)
    server = ThreadingHTTPServer((options.host, options.port), handler)
    server.daemon_threads = True
    print("Bridge started at http://%s:%d" % (options.host, options.port))
    print("HG_BRIDGE_TOKEN=" + token)
    if options.host not in ("127.0.0.1", "localhost"):
        print("WARNING: LAN HTTP only. Do NOT expose this port directly to the Internet.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

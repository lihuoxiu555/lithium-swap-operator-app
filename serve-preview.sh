#!/usr/bin/env bash
# 从仓库根启动，保证 doc.html 可加载 ../docs 与 ../decisions
cd "$(dirname "$0")"
exec python3 -m http.server "${1:-8788}"

#!/usr/bin/env /Library/Frameworks/Python.framework/Versions/3.14/bin/python3
"""
图片搜索下载脚本
使用 pyimagedl 从多个图片来源搜索并下载图片

用法：
    python3 image_search.py [关键词] [下载数量]

示例：
    python3 image_search.py 篮球 10
    python3 image_search.py 足球        # 使用默认数量 5
    python3 image_search.py             # 使用默认关键词和数量
"""

import sys
from imagedl.imagedl import ImageClient

# 从命令行参数读取，fallback 到默认值
KEYWORD = sys.argv[1] if len(sys.argv) > 1 else "篮球"
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 5

# 图片来源
SOURCES = [
    'BaiduImageClient',
]

# 客户端配置
client = ImageClient(
    image_sources=SOURCES,
    init_image_clients_cfg={
        source: {
            'work_dir': f'outputs/{KEYWORD}',
            'auto_set_proxies': False,
            'max_retries': 3,
        }
        for source in SOURCES
    },
    clients_threadings={source: 5 for source in SOURCES},
)

# 搜索
print(f"开始搜索：{KEYWORD}，限制 {LIMIT} 张")
results = client.search(keyword=KEYWORD, search_limits_per_source=LIMIT)

for source, imgs in results.items():
    print(f"  {source}: 找到 {len(imgs)} 张")

# 下载
print("开始下载...")
client.download(image_infos=results)
print(f"下载完成，图片保存至 outputs/{KEYWORD}/")

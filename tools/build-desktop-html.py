#!/usr/bin/env python3
"""把网页版转歌词工具 (space.html) 改写为桌面版离线页面。

只改写桌面版副本，绝不改动 ~/workspace/your_files/space/space.html 原件。
改动点：
 1. 去掉 Google Fonts CDN 依赖，改系统字体栈；
 2. tesseract.js / pdf.js / pinyin-pro 的 CDN 引用改为本地 vendor/；
 3. Tesseract worker / core / 语言数据全部指向本地（gzip 关掉，用明文 .traineddata）；
 4. 文案里“首次联网加载组件/词库”改为本机内置；
 5. 翻译加离线提示：无网时直接提示“翻译需要联网”，接口失败也显示同样含义。
"""
import io
import sys

SRC = "/home/hatch/workspace/your_files/space/space.html"
DST = "/home/hatch/workspace/your_files/desktop-lyric-tool/app/index.html"

with io.open(SRC, encoding="utf-8") as f:
    s = f.read()

repls = [
    # 1. 去掉字体 CDN
    ('<link rel="preconnect" href="https://fonts.googleapis.com" />\n', ''),
    ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n', ''),
    ('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@600;700;900&display=swap" rel="stylesheet" />\n', ''),
    # 2. 系统字体栈
    ('font-family:"Noto Sans SC",-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;',
     'font-family:-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;'),
    ('"Noto Serif SC",serif', '"Songti SC","STSong","SimSun",serif'),
    # 3. tesseract.js 本地化
    ('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', 'vendor/tesseract.min.js'),
    # 4. pdf.js 本地化（worker 直接用本地文件，不再 fetch CDN 生成 blob）
    ('''return loadScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js").then(function () {
var workerUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
return fetch(workerUrl)
.then(function (r) { return r.blob();})
.then(function (b) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(b);})
.catch(function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;});
});''',
     '''return loadScript("vendor/pdf.min.js").then(function () {
window.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
});'''),
    # 5. Tesseract 本地 worker / core / 语言数据
    # 注意：tesseract.js v5 默认用 blob worker + importScripts(workerPath) 方式启动，
    # blob worker 里相对路径是非法的，必须传绝对 URL（用 new URL 相对当前页面解析）。
    ('''return Tesseract.createWorker(lang, 1, {
logger: function (m) {''',
     '''return Tesseract.createWorker(lang, 1, {
workerPath: new URL("vendor/worker.min.js", window.location.href).href,
corePath: new URL("vendor", window.location.href).href,
langPath: new URL("tessdata", window.location.href).href,
gzip: false,
logger: function (m) {'''),
    # 6. pinyin-pro 本地化
    ('https://cdn.jsdelivr.net/npm/pinyin-pro@3/dist/index.js', 'vendor/pinyin-pro.js'),
    # 7. 文案：组件/词库已内置本机
    ('识别在本机进行；首次使用要联网加载识别组件，会稍慢。',
     '识别在本机离线进行，无需联网；首次加载模型会稍慢。'),
    ('识别组件加载失败，请检查网络后重试；也可以直接在第 2 步粘贴歌词。',
     '识别组件加载失败，请重试；也可以直接在第 2 步粘贴歌词。'),
    ('首次生成要联网加载拼音词库。多音字按常用读音注音',
     '拼音词库已内置本机，无需联网。多音字按常用读音注音'),
    ('拼音词库加载失败，请检查网络后重试；预览和导出仍是原文。',
     '拼音词库加载失败，请重试；预览和导出仍是原文。'),
    # 8. 翻译离线提示：失败文案明确说“翻译需要联网”
    ('翻译失败，请检查网络后重试；预览和导出仍是原文。',
     '翻译需要联网：当前无法连接翻译服务，请联网后再试；预览和导出仍是原文。'),
]

for old, new in repls:
    n = s.count(old)
    if n == 0:
        print("MISS (not found):", old[:80].replace("\n", "\\n"))
        sys.exit(1)
    s = s.replace(old, new)
    print("ok x%d: %s" % (n, old[:60].replace("\n", "\\n")))

# 9. 翻译函数开头加 navigator.onLine 前置检查
anchor = 'if (!langs.length) { toast("先添加至少一种目标语言"); return;}'
n = s.count(anchor)
assert n == 1, "translate langs anchor count=%d" % n
s = s.replace(anchor, anchor + '\nif (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) { setTransStatus(1, "翻译需要联网：当前没有网络连接，请联网后再试；预览和导出仍是原文。", "err"); return;}')
print("ok: navigator.onLine guard added")

with io.open(DST, "w", encoding="utf-8") as f:
    f.write(s)
print("wrote", DST, len(s), "bytes")

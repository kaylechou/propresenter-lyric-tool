![转歌词工具](docs/images/banner.png)

# 转歌词工具

把歌词文本、歌谱图片、字幕文件，整理成 ProPresenter 可直接导入的分页歌词。只要歌词，不要音符。

## 用法

### 1. 导入

![导入](docs/images/step-import.png)

- 粘贴歌词文本，或打开 `.txt` 文件（歌名自动取文件名）
- 歌谱图片、PDF 也能识别，只取歌词，不认音符
- 字幕文件 `.srt` / `.lrc` / `.vtt` / `.ass` 直接导

### 2. 校对与智能整理

![校对与智能整理](docs/images/step-organize.png)

- 自动去掉时间轴、序号与句间空行
- 重复段标副歌，其余依次标主歌；晚出现的独立段标桥段，结尾短段标尾声
- 一键「智能整理结构」，段落名可再改
- 智能清理：只去汉字间空格，英文、韩文词间空格原样保留

### 3. 拆页与样式设置

![拆页与样式设置](docs/images/step-style.png)

- 按段落、行数或字数拆页（字数 6–80 可调，默认 24，整行装页不拆行）
- 字体（微软雅黑 / 黑体 / 宋体 / 楷体 / Arial）、字号 80%–140%、粗细、对齐、文字颜色
- 每个段落标签的颜色逐个改（默认主歌蓝、副歌粉红）
- 改动同步进预览与 `.pro` / `.pro6`

### 4. 翻译 / 拼音（可选）

- 两个独立开关：只翻译、只拼音、两者都选、两者都不选
- 翻译：36 种语言多选 + 自定义语言代码，最多 4 种（默认英语），逐页逐语言翻译，分页不变
- 拼音：逐字注音、只注汉字，位置可选中文行下方 / 上方 / 行尾括号，声调默认不带
- 翻译走免费接口，无需 key；歌词机翻需校对

### 5. 预览与导出

![预览与导出](docs/images/step-export.png)

- 16:9 分页预览，点页放大看
- 导出三选一：`txt`（纯文本，不带样式）、`.pro`（ProPresenter 7）、`.pro6`（ProPresenter 6）
- 段落名作分组，标签颜色一并写入

### 完整使用说明

![完整使用说明](docs/images/howto-guide.png)

## 下载（当前版本 1.0.0）

| 包 | 适用 | 用法 |
| --- | --- | --- |
| [lyric-tool-setup-1.0.0.exe](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-setup-1.0.0.exe) | Windows | 安装包，双击按向导安装 |
| [lyric-tool-portable-1.0.0.exe](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-portable-1.0.0.exe) | Windows | 便携版，双击直接运行 |
| [lyric-tool-windows-portable.zip](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-windows-portable.zip) | Windows | 免安装版，解压后运行 `win-unpacked/转歌词.exe` |
| [lyric-tool-1.0.0-win.zip](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-1.0.0-win.zip) | Windows | 解压即用版，解压后直接运行 `转歌词.exe` |
| [lyric-tool-mac-intel.zip](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-mac-intel.zip) | Mac（Intel 芯片） | 解压得 `转歌词-Intel.app`，首次右键 → 打开 |
| [lyric-tool-mac-applesilicon.zip](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-mac-applesilicon.zip) | Mac（Apple Silicon，M1 / M2 / M3 / M4） | 解压得 `转歌词-AppleSilicon.app`，首次右键 → 打开 |
| [lyric-tool-1.0.0-mac.zip](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-1.0.0-mac.zip) | Mac（Intel 芯片） | 解压得 `转歌词.app`，首次右键 → 打开 |
| [lyric-tool-1.0.0-arm64-mac.zip](https://github.com/kaylechou/propresenter-lyric-tool/releases/download/v1.0.0/lyric-tool-1.0.0-arm64-mac.zip) | Mac（Apple Silicon） | 解压得 `转歌词.app`，首次右键 → 打开 |

八个包怎么用，详见下图：

![八个包怎么用](docs/images/usage-guide.png)

## 桌面版说明

- Windows、Mac 桌面版除翻译需联网外，全部离线可用（OCR 中英日韩繁体词库内置）
- 安装包未签名：Windows 首次运行若弹出 SmartScreen，点“更多信息”→“仍要运行”；Mac 首次打开请右键 → 打开，仍被拦截时到“系统设置 → 隐私与安全性”点“仍要打开”
- Mac 芯片查看方法：左上角苹果菜单 → 关于本机 → 芯片一栏

## 导入 ProPresenter

- `txt`：导入时选 Paragraph Break、1 delimiter per slide
- `.pro`：ProPresenter 7 直接导入；`.pro6`：ProPresenter 6 直接导入
- 段落名作分组，标签颜色随分组写入

## 注意

- 歌词内容以第 2 步校对为准，导出前请对照原文看一遍
- 翻译是机翻，重要场合请校对；多音字按常用读音注音，重要场合请再检查

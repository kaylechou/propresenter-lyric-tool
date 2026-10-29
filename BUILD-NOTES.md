# 构建说明（桌面版打包时的环境变通，产品本身不受影响）

## 1. 本机 Wine 已损坏，导致标准 NSIS 流程走不通
本 Linux 容器里 32 位 Wine 加载器一运行就段错误（`wine --version` 即 segfault，
32 位库齐全，属容器内核/兼容层限制，无法从容器内修复）。
electron-builder 打 NSIS 安装包的标准流程最后一步要在 Wine 下运行一次安装程序
（静默写出卸载程序），Wine 一死这步就失败（`wine process failed`）。

## 2. 变通：改走纯 JS 提取卸载程序的路径
只改了本机构建工具（node_modules，不进安装包）的一行：
`node_modules/app-builder-lib/out/targets/nsis/NsisTarget.js` 里，
把原来只在 macOS Catalina 走的 `UninstallerReader.exec` 分支，
改成在 Linux 下也走（`|| process.platform === "linux"`）。
UninstallerReader 是纯 JS 解析 PE 文件、从安装程序里抽出卸载程序，
抽出的文件与 Wine 运行得到的是同一份数据，装出来的安装包是标准 NSIS 安装包。
在 Windows 机器或 Wine 正常的 Linux 机器上不需要这个变通，
直接 `npx electron-builder --win` 即可。

## 3. DMG 在本机无法生成的原因（已改用 zip）
electron-builder 的 dmgbuild 工具包里带的 Python 是 macOS Mach-O 格式，
且 dmgbuild 创建镜像要调 macOS 专用的 hdiutil，在 Linux 上根本跑不起来。
因此 Mac 改出 zip（解压后把 .app 拖到应用程序即可），DMG 需在 Mac 上打。
package.json 里 mac target 目前是 zip；dmg 配置（backgroundColor 等）保留，
在 Mac 上把 target 改回 dmg 即可出 dmg。

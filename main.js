// 转歌词 桌面版主进程
// 本地页面通过 app:// 自定义协议加载（standard + secure），
// 这样 Tesseract.js / pdf.js 的 worker、fetch 本地文件都能像 https 页面一样正常工作，
// 又不需要真的联网，也不需要关掉 webSecurity。
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

const APP_DIR = path.join(__dirname, 'app');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// 以 root 身份跑时 Chromium 沙箱会拒绝启动（仅测试环境会命中，用户机器不受影响）
if (typeof process.getuid === 'function' && process.getuid() === 0) {
  app.commandLine.appendSwitch('no-sandbox');
}
app.commandLine.appendSwitch('disable-gpu');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: '转歌词',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadURL('app://localhost/index.html');
  return win;
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    try {
      let rel = request.url.replace(/^app:\/\//, '');
      if (rel.startsWith('localhost/')) rel = rel.slice('localhost/'.length);
      if (rel.endsWith('/')) rel = rel.slice(0, -1);
      if (rel === '') rel = 'index.html';
      rel = decodeURI(rel);
      const resolved = path.normalize(path.join(APP_DIR, rel));
      // 防止路径穿越逃出 app 目录
      if (!resolved.startsWith(APP_DIR + path.sep) && resolved !== APP_DIR) {
        callback({ error: -6 });
        return;
      }
      callback({ path: resolved });
    } catch (e) {
      callback({ error: -2 });
    }
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

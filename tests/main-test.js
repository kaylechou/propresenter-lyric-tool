// 桌面版测试驱动（仅用于本机验证，不打包进安装包）。
// 注意：Electron 45 在此环境下预加载脚本里 require('fs') 会报 module not found，
// 因此驱动全部放在主进程，用 executeJavaScript 操作页面 DOM，不依赖预加载脚本。
// 用法：LYRIC_TEST_MODE=offline|online xvfb-run -a electron --no-sandbox tests/main-test.js
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

const MODE = process.env.LYRIC_TEST_MODE || 'offline';
const APP_DIR = path.join(__dirname, '..', 'app');
const OUT_DIR = path.join(__dirname, 'out');
fs.mkdirSync(OUT_DIR, { recursive: true });

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);
if (typeof process.getuid === 'function' && process.getuid() === 0) app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
if (MODE === 'offline') {
  app.commandLine.appendSwitch('host-rules', 'MAP translate.googleapis.com 127.0.0.1,MAP api.mymemory.translated.net 127.0.0.1');
}

let win;
const extReqs = [];
const dlFiles = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function js(code) {
  return win.webContents.executeJavaScript(code);
}
async function waitFor(label, fn, timeout) {
  const t0 = Date.now();
  for (;;) {
    let ok = false;
    try { ok = await fn(); } catch (e) { /* retry */ }
    if (ok) return;
    if (Date.now() - t0 > timeout) throw new Error('timeout: ' + label);
    await sleep(500);
  }
}
function feedFileCode(name, type, b64) {
  return '(' + (function (name, type, b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const file = new File([bytes], name, { type });
    const dt = new DataTransfer();
    dt.items.add(file);
    const fi = document.getElementById('fileInput');
    fi.files = dt.files;
    fi.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }).toString() + ')(' + JSON.stringify(name) + ',' + JSON.stringify(type) + ',' + JSON.stringify(b64) + ')';
}

async function run() {
  const results = {};
  try {
    await sleep(1000);
    console.log('TESTLOG mode=' + MODE);

    await js("document.getElementById('demoBtn').click()");
    await waitFor('demo load', () => js("document.getElementById('lyricText').value.includes('奇异恩典')"), 10000);
    results.demoChars = await js("document.getElementById('lyricText').value.length");
    console.log('TESTLOG demo ok chars=' + results.demoChars);

    await js("document.getElementById('cleanBtn').click()");
    await sleep(800);
    const cleaned = await js("document.getElementById('lyricText').value");
    results.cleanPunctRemoved = !/[，。！？；：、]/.test(cleaned);
    console.log('TESTLOG clean ok punctRemoved=' + results.cleanPunctRemoved);

    results.slidesByLines = await js('window.state.slides.length');
    console.log('TESTLOG slides by lines=' + results.slidesByLines);

    await js("document.getElementById('byChars').click()");
    await sleep(500);
    results.slidesByChars = await js('window.state.slides.length');
    results.charVal = await js("document.getElementById('charVal').textContent");
    console.log('TESTLOG slides by chars=' + results.slidesByChars + ' charVal=' + results.charVal);
    await js("document.getElementById('byLines').click()");
    await sleep(500);

    await js("document.getElementById('xfPinyin').click()");
    await sleep(300);
    await js("document.getElementById('pinyinBtn').click()");
    await waitFor('pinyin', () => js("document.getElementById('pyStatus').textContent.includes('拼音已生成')"), 60000);
    const pyItems = await js("window.state.slides.flatMap(s => s.items).filter(it => it.k === 'py').map(it => it.t)");
    results.pinyinSample = pyItems.slice(0, 2);
    results.pinyinHasTone = pyItems.some((t) => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(t));
    console.log('TESTLOG pinyin ok sample=' + JSON.stringify(results.pinyinSample));

    await js("document.getElementById('downloadBtn').click()");
    await waitFor('download', () => Promise.resolve(dlFiles.length > 0), 20000);
    const dlPath = dlFiles[0];
    const content = fs.readFileSync(dlPath, 'utf-8');
    results.exportBytes = content.length;
    results.exportHasPinyin = /[āáǎà]/.test(content);
    results.exportHasLyrics = content.includes('奇异恩典');
    console.log('TESTLOG export ok bytes=' + content.length + ' hasPinyin=' + results.exportHasPinyin);
    await js("document.getElementById('xfNone').click()");
    await sleep(300);

    await js("document.getElementById('lyricText').value = ''");
    await js(feedFileCode('test-zh.png', 'image/png', fs.readFileSync(path.join(__dirname, 'assets', 'test-zh.png')).toString('base64')));
    await waitFor('ocr image', () => js("document.getElementById('lyricText').value.includes('奇异恩典')"), 240000);
    results.ocrImage = (await js("document.getElementById('lyricText').value")).replace(/\s+/g, ' ').slice(0, 150);
    console.log('TESTLOG ocr image ok: ' + results.ocrImage);

    await js("document.getElementById('lyricText').value = ''");
    await js(feedFileCode('test-text.pdf', 'application/pdf', fs.readFileSync(path.join(__dirname, 'assets', 'test-text.pdf')).toString('base64')));
    await waitFor('pdf text', () => js("document.getElementById('lyricText').value.includes('Amazing grace')"), 120000);
    results.pdfText = (await js("document.getElementById('lyricText').value")).replace(/\s+/g, ' ').slice(0, 150);
    console.log('TESTLOG pdf text ok: ' + results.pdfText);

    await js("document.getElementById('lyricText').value = ''");
    await js(feedFileCode('test-scan.pdf', 'application/pdf', fs.readFileSync(path.join(__dirname, 'assets', 'test-scan.pdf')).toString('base64')));
    await waitFor('pdf scan ocr', () => js("document.getElementById('lyricText').value.includes('奇异恩典')"), 240000);
    results.pdfScan = (await js("document.getElementById('lyricText').value")).replace(/\s+/g, ' ').slice(0, 150);
    console.log('TESTLOG pdf scan ocr ok: ' + results.pdfScan);

    await js("document.getElementById('xfTranslate').click()");
    await sleep(300);
    await js("document.getElementById('translateBtn').click()");
    if (MODE === 'offline') {
      await waitFor('offline translate msg', () => js("document.getElementById('transMsg').textContent.includes('翻译需要联网')"), 120000);
      results.translateOfflineMsg = await js("document.getElementById('transMsg').textContent");
      console.log('TESTLOG translate offline msg ok');
    } else {
      await waitFor('online translate', () => js("document.getElementById('transMsg').textContent.includes('翻译完成')"), 180000);
      results.translateSample = (await js("window.state.slides.flatMap(s => s.items).filter(it => it.k === 'tr' || it.k === 'tr2').map(it => it.t)")).slice(0, 4);
      console.log('TESTLOG translate online ok: ' + JSON.stringify(results.translateSample));
    }

    console.log('RESULT ' + JSON.stringify({ ok: true, results }));
    console.log('EXTREQ_SUMMARY ' + JSON.stringify(extReqs));
    process.exit(0);
  } catch (e) {
    console.log('TESTLOG FAILED: ' + (e && e.stack ? e.stack : e));
    console.log('RESULT ' + JSON.stringify({ ok: false, error: String((e && e.stack) || e), results }));
    console.log('EXTREQ_SUMMARY ' + JSON.stringify(extReqs));
    process.exit(1);
  }
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
      if (!resolved.startsWith(APP_DIR + path.sep) && resolved !== APP_DIR) return callback({ error: -6 });
      callback({ path: resolved });
    } catch (e) { callback({ error: -2 }); }
  });

  win = new BrowserWindow({ width: 1280, height: 900, show: true, webPreferences: { nodeIntegration: false, contextIsolation: true } });
  win.webContents.session.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (details, cb) => {
    extReqs.push(details.url);
    console.log('EXTREQ ' + details.url);
    cb({});
  });
  win.webContents.on('console-message', (e, a, b) => {
    const message = (a && typeof a === 'object' && 'message' in a) ? a.message : b;
    if (message && message.startsWith('TESTLOG ')) console.log(message);
  });
  win.webContents.session.on('will-download', (e, item) => {
    const p = path.join(OUT_DIR, item.getFilename());
    item.setSavePath(p);
    item.on('done', (ev, state) => {
      console.log('DOWNLOAD done: ' + p + ' state=' + state);
      dlFiles.push(p);
    });
  });
  let started = false;
  win.webContents.on('did-finish-load', () => { console.log('DID_FINISH_LOAD'); if (started) return; started = true; run(); });
  win.webContents.on('did-fail-load', (e, code, desc, url) => { console.log('DID_FAIL_LOAD ' + code + ' ' + desc + ' ' + url); process.exit(2); });
  win.loadURL('app://localhost/index.html');
  setTimeout(() => { console.log('GLOBAL TIMEOUT'); process.exit(2); }, 900000);
});

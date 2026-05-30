import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath || '';
const tempRoot = path.join(root, '.tmp', 'consumer-smoke');
const packDir = path.join(tempRoot, 'pack');
const appDir = path.join(tempRoot, 'app');
const npmCacheDir = path.join(tempRoot, 'npm-cache');

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to touch path outside project root: ${target}`);
  }
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
}

function runNpm(args, options = {}) {
  const npmOptions = {
    ...options,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
      npm_config_update_notifier: 'false',
      ...(options.env || {})
    }
  };
  if (npmCli && existsSync(npmCli)) {
    return run(process.execPath, [npmCli, ...args], npmOptions);
  }
  return run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, npmOptions);
}

function getBrowserCandidates() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env.ProgramFiles || '', 'Microsoft/Edge/Application/msedge.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft/Edge/Application/msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/snap/bin/chromium',
    '/opt/google/chrome/chrome'
  ].filter(Boolean);

  return [...new Set(candidates)];
}

function encodeWebSocketFrame(text, opcode = 0x1) {
  const payload = Buffer.from(text);
  const mask = randomBytes(4);
  let header;

  if (payload.length < 126) {
    header = Buffer.from([0x80 | opcode, 0x80 | payload.length]);
  } else if (payload.length <= 0xffff) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }

  const masked = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    masked[index] = payload[index] ^ mask[index % 4];
  }
  return Buffer.concat([header, mask, masked]);
}

function connectCdpWithSocket(wsUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(wsUrl);
    if (url.protocol !== 'ws:') {
      reject(new Error(`Unsupported DevTools WebSocket protocol: ${url.protocol}`));
      return;
    }

    const socket = net.createConnection({
      host: url.hostname,
      port: Number(url.port || 80)
    });
    const key = randomBytes(16).toString('base64');
    const accept = createHash('sha1')
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');
    const requestPath = `${url.pathname}${url.search}`;
    const pending = new Map();
    let nextId = 0;
    let settled = false;
    let connected = false;
    let buffer = Buffer.alloc(0);

    const rejectPending = (error) => {
      for (const { rej } of pending.values()) rej(error);
      pending.clear();
    };

    const fail = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      } else {
        rejectPending(error);
      }
      socket.destroy();
    };

    const sendFrame = (value, opcode = 0x1) => {
      socket.write(encodeWebSocketFrame(value, opcode));
    };

    const handleMessage = (text) => {
      const message = JSON.parse(text);
      if (!message.id || !pending.has(message.id)) return;
      const { res, rej } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rej(new Error(`${message.error.message}: ${message.error.data || ''}`));
      else res(message.result);
    };

    const readFrames = () => {
      while (buffer.length >= 2) {
        const first = buffer[0];
        const second = buffer[1];
        const opcode = first & 0x0f;
        const masked = Boolean(second & 0x80);
        let length = second & 0x7f;
        let offset = 2;

        if (length === 126) {
          if (buffer.length < offset + 2) return;
          length = buffer.readUInt16BE(offset);
          offset += 2;
        } else if (length === 127) {
          if (buffer.length < offset + 8) return;
          const bigLength = buffer.readBigUInt64BE(offset);
          if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
            fail(new Error('DevTools WebSocket frame is too large'));
            return;
          }
          length = Number(bigLength);
          offset += 8;
        }

        let mask;
        if (masked) {
          if (buffer.length < offset + 4) return;
          mask = buffer.subarray(offset, offset + 4);
          offset += 4;
        }
        if (buffer.length < offset + length) return;

        let payload = buffer.subarray(offset, offset + length);
        buffer = buffer.subarray(offset + length);
        if (masked) {
          const unmasked = Buffer.alloc(payload.length);
          for (let index = 0; index < payload.length; index += 1) {
            unmasked[index] = payload[index] ^ mask[index % 4];
          }
          payload = unmasked;
        }

        if (opcode === 0x1) {
          handleMessage(payload.toString('utf8'));
        } else if (opcode === 0x8) {
          socket.end();
          rejectPending(new Error('DevTools WebSocket closed'));
        } else if (opcode === 0x9) {
          sendFrame(payload, 0x0a);
        }
      }
    };

    const api = {
      send(method, params = {}) {
        nextId += 1;
        const messageId = nextId;
        sendFrame(JSON.stringify({ id: messageId, method, params }));
        return new Promise((res, rej) => pending.set(messageId, { res, rej }));
      },
      close() {
        sendFrame('', 0x8);
        socket.end();
      }
    };

    socket.setTimeout(8000, () => fail(new Error('DevTools WebSocket timed out')));
    socket.on('connect', () => {
      socket.write([
        `GET ${requestPath} HTTP/1.1`,
        `Host: ${url.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '',
        ''
      ].join('\r\n'));
    });
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (!connected) {
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;
        const header = buffer.subarray(0, headerEnd).toString('utf8');
        buffer = buffer.subarray(headerEnd + 4);
        if (!/^HTTP\/1\.1 101\b/.test(header) || !header.toLowerCase().includes(`sec-websocket-accept: ${accept.toLowerCase()}`)) {
          fail(new Error('DevTools WebSocket handshake failed'));
          return;
        }
        connected = true;
        settled = true;
        resolve(api);
      }
      readFrames();
    });
    socket.on('error', fail);
    socket.on('close', () => {
      rejectPending(new Error('DevTools WebSocket closed'));
      if (!settled) reject(new Error('DevTools WebSocket closed before connecting'));
    });
  });
}

function connectCdpWithNativeWebSocket(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    let id = 0;
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          id += 1;
          const messageId = id;
          ws.send(JSON.stringify({ id: messageId, method, params }));
          return new Promise((res, rej) => pending.set(messageId, { res, rej }));
        },
        close() {
          ws.close();
        }
      });
    });
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const { res, rej } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rej(new Error(`${message.error.message}: ${message.error.data || ''}`));
      else res(message.result);
    });
    ws.addEventListener('error', reject);
    ws.addEventListener('close', () => {
      for (const { rej } of pending.values()) rej(new Error('DevTools WebSocket closed'));
      pending.clear();
    });
  });
}

function connectCdp(wsUrl) {
  if (typeof WebSocket === 'function' && process.env.USUZUMI_FORCE_SOCKET_FALLBACK !== '1') {
    return connectCdpWithNativeWebSocket(wsUrl);
  }
  return connectCdpWithSocket(wsUrl);
}

function requestJson(port, endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: '127.0.0.1',
      port,
      path: endpoint,
      method
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`${endpoint} ${response.statusCode || 0}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.setTimeout(8000, () => {
      request.destroy(new Error(`${endpoint} timed out`));
    });
    request.on('error', reject);
    request.end();
  });
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createConsumerCheck() {
  const source = String.raw`
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readPackageFile(packageRoot, relativePath) {
  const fullPath = path.join(packageRoot, relativePath);
  assert(existsSync(fullPath), 'Missing package file: ' + relativePath);
  return readFileSync(fullPath, 'utf8');
}

await import('usuzumi');
await import('usuzumi/usuzumi.js');

const rootEntry = fileURLToPath(await import.meta.resolve('usuzumi'));
const jsEntry = fileURLToPath(await import.meta.resolve('usuzumi/usuzumi.js'));
const cssEntry = fileURLToPath(await import.meta.resolve('usuzumi/usuzumi.css'));
const signatureEntry = fileURLToPath(await import.meta.resolve('usuzumi/usuzumi-signature.css'));
const cdnCssEntry = fileURLToPath(await import.meta.resolve('usuzumi/ui/usuzumi.css'));
const dtsEntry = fileURLToPath(await import.meta.resolve('usuzumi/ui/usuzumi.d.ts'));
const packageRoot = path.resolve(path.dirname(jsEntry), '..');

assert(rootEntry === jsEntry, 'Root package import does not resolve to ui/usuzumi.js');
assert(cssEntry === path.join(packageRoot, 'ui', 'usuzumi.css'), 'CSS export resolves to an unexpected file');
assert(signatureEntry === path.join(packageRoot, 'ui', 'usuzumi-signature.css'), 'Signature CSS export resolves to an unexpected file');
assert(cdnCssEntry === cssEntry, 'CDN-style ui/usuzumi.css path does not resolve to the published CSS file');
assert(dtsEntry === path.join(packageRoot, 'ui', 'usuzumi.d.ts'), 'Type declaration path does not resolve to ui/usuzumi.d.ts');

const packageJson = JSON.parse(readPackageFile(packageRoot, 'package.json'));
assert(packageJson.style === './ui/usuzumi.css', 'package.json style field must point to ui/usuzumi.css');
assert(packageJson.types === './ui/usuzumi.d.ts', 'package.json types field must point to ui/usuzumi.d.ts');
assert(packageJson.exports['./usuzumi.css'] === './ui/usuzumi.css', 'Missing usuzumi/usuzumi.css export');
assert(packageJson.exports['./usuzumi-signature.css'] === './ui/usuzumi-signature.css', 'Missing usuzumi/usuzumi-signature.css export');

const css = readPackageFile(packageRoot, 'ui/usuzumi.css');
assert(css.includes('.uzu-app'), 'Published CSS is missing app styles');
assert(css.includes('.uzu-callout'), 'Published CSS is missing callout styles');
assert(css.includes('.uzu-toolbar'), 'Published CSS is missing toolbar styles');
assert(css.includes('.uzu-breadcrumb'), 'Published CSS is missing breadcrumb styles');
assert(css.includes('.uzu-pagination'), 'Published CSS is missing pagination styles');
assert(css.includes('.uzu-page-panel'), 'Published CSS is missing pagination panel styles');
assert(css.includes('.uzu-stat'), 'Published CSS is missing stat styles');
assert(css.includes('.uzu-code'), 'Published CSS is missing inline code styles');
assert(css.includes('.uzu-kbd'), 'Published CSS is missing keyboard hint styles');
assert(css.includes('.uzu-segment[aria-pressed="true"]'), 'Published CSS is missing segmented ARIA active styles');
assert(css.includes('.uzu-progress-indeterminate'), 'Published CSS is missing indeterminate progress styles');
assert(css.includes('.uzu-activity-dot'), 'Published CSS is missing activity indicator styles');
assert(css.includes('.uzu-process-step.is-active'), 'Published CSS is missing process step styles');
assert(css.includes('.uzu-input-group'), 'Published CSS is missing input group styles');
assert(css.includes('.uzu-search'), 'Published CSS is missing search styles');
assert(css.includes('.uzu-password'), 'Published CSS is missing password input styles');
assert(css.includes('.uzu-stepper'), 'Published CSS is missing stepper styles');
assert(css.includes('.uzu-stack'), 'Published CSS is missing stack layout styles');
assert(css.includes('.uzu-menu'), 'Published CSS is missing menu styles');
assert(css.includes('.uzu-menubar'), 'Published CSS is missing menubar styles');
assert(css.includes('.uzu-command'), 'Published CSS is missing command menu styles');
assert(css.includes('.uzu-combobox'), 'Published CSS is missing combobox styles');
assert(css.includes('.uzu-data-grid'), 'Published CSS is missing data grid styles');
assert(css.includes('.uzu-tree'), 'Published CSS is missing tree view styles');
assert(css.includes('.uzu-split-pane'), 'Published CSS is missing split pane styles');
assert(css.includes('.uzu-resizable'), 'Published CSS is missing resizable panel styles');
assert(css.includes('.uzu-json-viewer'), 'Published CSS is missing JSON viewer styles');
assert(css.includes('.uzu-diff-viewer'), 'Published CSS is missing diff viewer styles');
assert(css.includes('.uzu-editor'), 'Published CSS is missing editor styles');
assert(css.includes('.uzu-markdown-editor'), 'Published CSS is missing markdown editor styles');
assert(css.includes('.uzu-sidebar'), 'Published CSS is missing sidebar styles');
assert(css.includes('.uzu-list'), 'Published CSS is missing list styles');
assert(css.includes('.uzu-avatar'), 'Published CSS is missing avatar styles');
assert(css.includes('.uzu-tag'), 'Published CSS is missing tag styles');
assert(css.includes('.uzu-accordion'), 'Published CSS is missing accordion styles');
assert(css.includes('.uzu-hover-card'), 'Published CSS is missing hover card styles');
assert(css.includes('.uzu-alert-dialog'), 'Published CSS is missing alert dialog styles');
assert(css.includes('.uzu-drawer'), 'Published CSS is missing drawer styles');
assert(css.includes('.uzu-sheet'), 'Published CSS is missing sheet styles');
assert(css.includes('.uzu-spinner'), 'Published CSS is missing spinner styles');
assert(css.includes('.uzu-step-nav'), 'Published CSS is missing step navigation styles');
assert(css.includes('.uzu-empty-state'), 'Published CSS is missing empty state styles');
assert(css.includes('.uzu-error-state'), 'Published CSS is missing error state styles');

const js = readPackageFile(packageRoot, 'ui/usuzumi.js');
assert(js.includes('window.Usuzumi'), 'Runtime does not expose window.Usuzumi');
assert(js.includes('data-uzu-tabs'), 'Runtime is missing tabs initialization support');
assert(js.includes('data-uzu-segmented'), 'Runtime is missing segmented initialization support');
assert(js.includes('data-uzu-pagination'), 'Runtime is missing pagination initialization support');
assert(js.includes('data-uzu-search'), 'Runtime is missing search initialization support');
assert(js.includes('data-uzu-password'), 'Runtime is missing password initialization support');
assert(js.includes('data-uzu-stepper'), 'Runtime is missing stepper initialization support');
assert(js.includes('data-uzu-menu'), 'Runtime is missing menu initialization support');
assert(js.includes('data-uzu-context-menu'), 'Runtime is missing context menu initialization support');
assert(js.includes('data-uzu-menubar'), 'Runtime is missing menubar initialization support');
assert(js.includes('data-uzu-command'), 'Runtime is missing command initialization support');
assert(js.includes('data-uzu-combobox'), 'Runtime is missing combobox initialization support');
assert(js.includes('data-uzu-data-grid'), 'Runtime is missing data grid initialization support');
assert(js.includes('data-uzu-tree'), 'Runtime is missing tree initialization support');
assert(js.includes('data-uzu-split-pane'), 'Runtime is missing split pane initialization support');
assert(js.includes('data-uzu-resizable'), 'Runtime is missing resizable initialization support');
assert(js.includes('data-uzu-json-viewer'), 'Runtime is missing JSON viewer initialization support');
assert(js.includes('data-uzu-diff-viewer'), 'Runtime is missing diff viewer initialization support');
assert(js.includes('data-uzu-markdown-editor'), 'Runtime is missing editor initialization support');
assert(js.includes('data-uzu-accordion'), 'Runtime is missing accordion initialization support');
assert(js.includes('data-uzu-hover-card'), 'Runtime is missing hover card initialization support');
assert(js.includes('data-uzu-tag'), 'Runtime is missing tag initialization support');
assert(js.includes('data-uzu-step-nav'), 'Runtime is missing step navigation initialization support');

const dts = readPackageFile(packageRoot, 'ui/usuzumi.d.ts');
assert(dts.includes('interface UsuzumiApi'), 'Types are missing UsuzumiApi');
assert(dts.includes('"uzu-tabs-change"'), 'Types are missing tabs event declarations');
assert(dts.includes('"uzu-segmented-change"'), 'Types are missing segmented event declarations');
assert(dts.includes('"uzu-pagination-change"'), 'Types are missing pagination event declarations');
assert(dts.includes('"uzu-password-toggle"'), 'Types are missing password event declarations');
assert(dts.includes('"uzu-stepper-change"'), 'Types are missing stepper event declarations');
assert(dts.includes('"uzu-menu-select"'), 'Types are missing menu select event declarations');
assert(dts.includes('"uzu-command-select"'), 'Types are missing command select event declarations');
assert(dts.includes('"uzu-combobox-change"'), 'Types are missing combobox event declarations');
assert(dts.includes('"uzu-data-grid-sort"'), 'Types are missing data grid event declarations');
assert(dts.includes('"uzu-tree-select"'), 'Types are missing tree event declarations');
assert(dts.includes('"uzu-split-resize"'), 'Types are missing split pane event declarations');
assert(dts.includes('"uzu-resizable-resize"'), 'Types are missing resizable event declarations');
assert(dts.includes('"uzu-markdown-editor-render"'), 'Types are missing markdown editor event declarations');
assert(dts.includes('"uzu-accordion-change"'), 'Types are missing accordion event declarations');
assert(dts.includes('"uzu-hover-card-open"'), 'Types are missing hover card event declarations');
assert(dts.includes('"uzu-tag-change"'), 'Types are missing tag event declarations');
assert(dts.includes('"uzu-step-nav-change"'), 'Types are missing step nav event declarations');

const signatureCss = readPackageFile(packageRoot, 'ui/usuzumi-signature.css');
assert(signatureCss.includes('./css/fonts.css'), 'Signature CSS must import packaged fonts.css');

const fontsCss = readPackageFile(packageRoot, 'ui/css/fonts.css');
assert(fontsCss.includes('../assets/Meddon-Regular.ttf'), 'Fonts CSS must reference the packaged signature font');
assert(existsSync(path.join(packageRoot, 'ui/assets/Meddon-Regular.ttf')), 'Packaged signature font is missing');

console.log('Consumer import smoke passed.');
`;
  writeFileSync(path.join(appDir, 'consumer-check.mjs'), source.trimStart(), 'utf8');
}

function findBrowserExecutable() {
  for (const candidate of getBrowserCandidates()) {
    if (existsSync(candidate)) return candidate;
  }

  const playwrightRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(playwrightRoot)) return '';

  const matches = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === 'chrome.exe') {
        matches.push(fullPath);
      }
    }
  };
  walk(playwrightRoot);
  return matches.sort().at(-1) || '';
}

async function browserSmoke() {
  const browser = findBrowserExecutable();
  if (!browser) {
    console.log('Consumer browser smoke skipped: no Chromium/Chrome/Edge executable found.');
    return;
  }

  const htmlPath = path.join(appDir, 'browser-check.html');
  writeFileSync(htmlPath, `<!doctype html>
<html class="uzu-root" lang="zh-CN" data-theme="light" data-language="zh" data-uzu-lang="zh">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="./node_modules/usuzumi/ui/usuzumi.css">
  <script src="./node_modules/usuzumi/ui/usuzumi.js" defer></script>
  <script>try { localStorage.setItem('consumer-theme', 'dark'); } catch (_) {}</script>
</head>
<body class="uzu-app">
  <main class="uzu-page">
    <section id="consumer-page-width" class="uzu-page" style="--uzu-page-max-width: 640px">Scoped page width</section>
    <section id="consumer-theme-root" class="uzu-scope" data-theme="light" data-uzu-theme-key="consumer-theme">
      <button id="consumer-theme-toggle" class="uzu-icon-button" type="button" data-uzu-theme-toggle data-uzu-theme-target="#consumer-theme-root" aria-label="Theme">T</button>
    </section>
    <button id="consumer-button" class="uzu-button" type="button">Hover target</button>
    <button id="consumer-primary" class="uzu-button uzu-button-primary" type="button">Primary</button>
    <a id="consumer-ghost" class="uzu-button uzu-button-ghost" href="#ghost">Ghost</a>
    <a id="consumer-danger" class="uzu-button uzu-button-danger" href="#danger">Danger</a>
    <button class="uzu-icon-button" type="button" data-uzu-tooltip="Tooltip text" aria-label="Tooltip target">?</button>
    <button id="consumer-tooltip-zh" class="uzu-icon-button" type="button" data-uzu-tooltip="短提示" aria-label="Chinese tooltip target">?</button>
    <nav aria-label="Consumer breadcrumb">
      <ol class="uzu-breadcrumb" id="consumer-breadcrumb">
        <li><a href="#home">Home</a></li>
        <li><span aria-current="page">Components</span></li>
      </ol>
    </nav>
    <div class="uzu-toolbar" id="consumer-toolbar" role="toolbar" aria-label="Consumer actions">
      <div class="uzu-toolbar-group">
        <button class="uzu-button uzu-button-primary" id="consumer-toolbar-button" type="button">New</button>
        <button class="uzu-button" type="button">Import</button>
      </div>
      <div class="uzu-toolbar-group">
        <button class="uzu-icon-button" type="button" aria-label="List view">≡</button>
      </div>
    </div>
    <article class="uzu-stat" id="consumer-stat">
      <p class="uzu-stat-label">Components</p>
      <p class="uzu-stat-value">42</p>
      <p class="uzu-stat-note">Public primitives.</p>
    </article>
    <p><code class="uzu-code" id="consumer-code">.uzu-scope</code> <kbd class="uzu-kbd" id="consumer-kbd">Ctrl</kbd></p>
    <p id="consumer-plain-backticks">Plain \`raw\` text should stay untouched.</p>
    <div class="uzu-code-block" id="consumer-code-block">
      <pre class="uzu-code-block-body uzu-scroll"><code>const label = 'Usuzumi';</code></pre>
      <button class="uzu-icon-button uzu-code-block-copy" type="button" data-uzu-code-copy aria-label="Copy code">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><rect x="8" y="8" width="10" height="10" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M6 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        <span data-uzu-code-copy-label>Copy</span>
      </button>
    </div>
    <div class="consumer-panel-layout" id="consumer-panel-layout">
      <nav class="uzu-panel-nav" id="consumer-panel-nav" data-uzu-panel-nav data-uzu-panel-selector=".consumer-panel" aria-label="Consumer panels">
        <section class="uzu-panel-nav-section" aria-labelledby="consumer-panel-nav-title">
          <p class="uzu-panel-nav-title" id="consumer-panel-nav-title">Docs</p>
          <button class="uzu-panel-nav-button is-active" type="button" data-uzu-panel-target="#consumer-panel-one" aria-pressed="true">One<span class="uzu-panel-nav-meta">Intro</span></button>
          <button class="uzu-panel-nav-button" type="button" data-uzu-panel-target="#consumer-panel-two" aria-pressed="false">Two<span class="uzu-panel-nav-meta">API</span></button>
        </section>
      </nav>
      <div>
        <section class="uzu-panel consumer-panel" id="consumer-panel-one">Panel one</section>
        <section class="uzu-panel consumer-panel" id="consumer-panel-two" hidden>Panel two</section>
      </div>
    </div>
    <div class="consumer-panel-layout" id="consumer-panel-layout-secondary">
      <nav class="uzu-panel-nav" id="consumer-panel-nav-secondary" data-uzu-panel-nav data-uzu-panel-selector=".consumer-panel-secondary" aria-label="Secondary consumer panels">
        <section class="uzu-panel-nav-section" aria-labelledby="consumer-panel-nav-title-secondary">
          <p class="uzu-panel-nav-title" id="consumer-panel-nav-title-secondary">More docs</p>
          <button class="uzu-panel-nav-button is-active" type="button" data-uzu-panel-target="#consumer-panel-three" aria-pressed="true">Three</button>
          <button class="uzu-panel-nav-button" type="button" data-uzu-panel-target="#consumer-panel-four" aria-pressed="false">Four</button>
        </section>
      </nav>
      <div>
        <section class="uzu-panel consumer-panel-secondary" id="consumer-panel-three">Panel three</section>
        <section class="uzu-panel consumer-panel-secondary" id="consumer-panel-four" hidden>Panel four</section>
      </div>
    </div>
    <div class="consumer-panel-layout" id="consumer-panel-layout-hash">
      <nav class="uzu-panel-nav" id="consumer-panel-nav-hash" data-uzu-panel-nav data-uzu-panel-hash="true" data-uzu-panel-selector=".consumer-panel-hash" aria-label="Hash consumer panels">
        <section class="uzu-panel-nav-section" aria-labelledby="consumer-panel-nav-title-hash">
          <p class="uzu-panel-nav-title" id="consumer-panel-nav-title-hash">Hash docs</p>
          <button class="uzu-panel-nav-button is-active" type="button" data-uzu-panel-target="#consumer-panel-hash-one" aria-pressed="true">Default</button>
          <button class="uzu-panel-nav-button" type="button" data-uzu-panel-target="#consumer-panel-hash-two" aria-pressed="false">Hash target</button>
        </section>
      </nav>
      <div>
        <section class="uzu-panel consumer-panel-hash" id="consumer-panel-hash-one">Default hash panel</section>
        <section class="uzu-panel consumer-panel-hash" id="consumer-panel-hash-two" hidden>Hash target panel</section>
      </div>
    </div>
    <div class="uzu-prose" id="consumer-markdown" data-uzu-markdown>
# Rendered

Use \`.uzu-code\` inside copy.

[Safe link](https://example.com) [Bad link](javascript:alert(1))

- First
- Second

\`\`\`html
<button class="uzu-button">Save</button>
\`\`\`
    </div>
    <hr class="uzu-separator" id="consumer-separator">
    <span class="uzu-separator-vertical" id="consumer-separator-vertical" aria-hidden="true"></span>
    <nav aria-label="Consumer pagination">
      <ol class="uzu-pagination" id="consumer-pagination" data-uzu-pagination data-uzu-pagination-target="#consumer-page-panels">
        <li><button class="uzu-page-button" type="button" data-uzu-page-prev aria-label="Previous page">‹</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="1" aria-current="page">1</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="2">2</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page-next aria-label="Next page">›</button></li>
      </ol>
    </nav>
    <div id="consumer-page-panels">
      <article class="uzu-page-panel" data-uzu-page-panel="1">
        First page
        <div data-uzu-page-panel="nested">Nested panel should stay visible.</div>
      </article>
      <article class="uzu-page-panel" data-uzu-page-panel="2" hidden>Second page</article>
    </div>
    <a class="uzu-page-button" id="consumer-page-link" href="#linked-page">Linked page</a>
    <nav aria-label="Disabled page pagination">
      <ol class="uzu-pagination" id="consumer-disabled-pagination" data-uzu-pagination>
        <li><button class="uzu-page-button" type="button" data-uzu-page-prev aria-label="Previous page">‹</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="1" aria-current="page">1</button></li>
        <li><button class="uzu-page-button is-disabled" type="button" data-uzu-page="2" aria-disabled="true">2</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page="3">3</button></li>
        <li><button class="uzu-page-button" type="button" data-uzu-page-next aria-label="Next page">›</button></li>
      </ol>
    </nav>
    <div class="uzu-tabs" data-uzu-tabs>
      <button class="uzu-tab is-active" type="button" data-uzu-tab-value="one" aria-selected="true"><span data-lang="zh">一</span><span data-lang="en">One</span></button>
      <button class="uzu-tab" type="button" data-uzu-tab-value="two" aria-selected="false"><span data-lang="zh">第二项</span><span data-lang="en">Two</span></button>
    </div>
    <div class="uzu-segmented" data-uzu-segmented>
      <button class="uzu-segment is-active" type="button" data-uzu-segment-value="alpha" aria-pressed="true"><span data-lang="zh">今天</span><span data-lang="en">Today</span></button>
      <button class="uzu-segment" type="button" data-uzu-segment-value="beta" aria-pressed="false"><span data-lang="zh">计划</span><span data-lang="en">Planning</span></button>
    </div>
    <div class="uzu-stack" id="consumer-stack" style="--uzu-stack-gap: 10px">
      <div class="uzu-flex uzu-flex-between" id="consumer-flex"><span>Left</span><span>Right</span></div>
      <div class="uzu-aspect" id="consumer-aspect" style="--uzu-aspect-ratio: 2 / 1"><div class="uzu-scroll-area" id="consumer-scroll-area" style="--uzu-scroll-area-max-height: 64px">Scrollable area</div></div>
    </div>
    <form class="uzu-form" id="consumer-form">
      <fieldset class="uzu-fieldset">
        <legend>Account</legend>
        <div class="uzu-field">
          <label class="uzu-label" for="consumer-search-input">Search</label>
          <div class="uzu-search" id="consumer-search" data-uzu-search>
            <input class="uzu-input uzu-search-input" id="consumer-search-input" type="search" value="query">
            <button class="uzu-icon-button uzu-search-clear" type="button" data-uzu-search-clear aria-label="Clear search">x</button>
          </div>
        </div>
        <div class="uzu-field">
          <label class="uzu-label" for="consumer-password-input">Password</label>
          <div class="uzu-password" id="consumer-password" data-uzu-password>
            <input class="uzu-input uzu-password-input" id="consumer-password-input" type="password" value="secret">
            <button class="uzu-icon-button uzu-password-toggle" type="button" data-uzu-password-toggle aria-label="Toggle password">••</button>
          </div>
        </div>
        <div class="uzu-field">
          <label class="uzu-label" for="consumer-stepper-input">Count</label>
          <div class="uzu-stepper" id="consumer-stepper" data-uzu-stepper>
            <input class="uzu-input uzu-stepper-input" id="consumer-stepper-input" type="number" min="1" max="3" step="1" value="2">
            <span class="uzu-stepper-controls">
              <button class="uzu-icon-button uzu-stepper-button" type="button" data-uzu-stepper-decrement aria-label="Decrease">-</button>
              <button class="uzu-icon-button uzu-stepper-button" type="button" data-uzu-stepper-increment aria-label="Increase">+</button>
            </span>
          </div>
        </div>
      </fieldset>
    </form>
    <div class="uzu-input-group" id="consumer-input-group"><span class="uzu-input-addon">$</span><input class="uzu-input" value="128"><span class="uzu-input-addon">USD</span></div>
    <label class="uzu-file-upload" id="consumer-file-upload"><span class="uzu-label">File</span><input class="uzu-file-input" type="file"><span class="uzu-file-summary">Native file input.</span></label>
    <input class="uzu-slider" id="consumer-slider" type="range" value="50">
    <div class="uzu-select" data-uzu-select data-uzu-select-name="density">
      <button class="uzu-select-trigger" type="button" data-uzu-select-trigger aria-expanded="false">Balanced</button>
      <div class="uzu-select-menu" role="listbox">
        <div class="uzu-select-option is-selected" data-uzu-select-option data-value="balanced" role="option" aria-selected="true">Balanced</div>
        <div class="uzu-select-option" data-uzu-select-option data-value="compact" role="option" aria-selected="false">Compact</div>
      </div>
    </div>
    <div class="uzu-combobox" id="consumer-combobox" data-uzu-combobox data-uzu-combobox-name="component">
      <input class="uzu-input uzu-combobox-input" id="consumer-combobox-input" data-uzu-combobox-input autocomplete="off" value="">
      <div class="uzu-combobox-list" data-uzu-combobox-list>
        <button class="uzu-combobox-option is-selected" type="button" data-uzu-combobox-option data-uzu-combobox-value="button">Button</button>
        <button class="uzu-combobox-option" type="button" data-uzu-combobox-option data-uzu-combobox-value="dialog">Dialog</button>
        <button class="uzu-combobox-option" type="button" data-uzu-combobox-option data-uzu-combobox-value="tree">Tree View</button>
        <p class="uzu-combobox-empty" hidden>No matches</p>
      </div>
    </div>
    <div class="uzu-field">
      <label class="uzu-label" for="consumer-field">Project name</label>
      <input class="uzu-input" id="consumer-field" placeholder="Untitled project">
      <span class="uzu-help">Field helper text.</span>
    </div>
    <section class="uzu-disclosure" data-uzu-disclosure>
      <button class="uzu-disclosure-trigger" type="button" data-uzu-disclosure-trigger aria-expanded="false">Details</button>
      <div class="uzu-disclosure-panel" data-uzu-disclosure-panel hidden>Disclosure content</div>
    </section>
    <aside class="uzu-callout uzu-callout-note" style="--uzu-callout-border-color: rgb(10, 20, 30); --uzu-callout-bg: rgb(240, 241, 242); --uzu-callout-title-color: rgb(30, 40, 50); --uzu-callout-text-color: rgb(60, 70, 80);">
      <h3 class="uzu-callout-title">Consumer page</h3>
      <p>Loaded from node_modules.</p>
    </aside>
    <article class="uzu-alert" id="consumer-alert" style="--uzu-alert-max-width: 420px; --uzu-alert-accent-color: rgb(10, 20, 30); --uzu-alert-bg: rgb(240, 241, 242); --uzu-alert-title-color: rgb(30, 40, 50); --uzu-alert-text-color: rgb(60, 70, 80);">
      <div class="uzu-title-pair">
        <h3>Custom alert</h3>
        <p>Alert colors are set with custom properties.</p>
      </div>
    </article>
    <article class="uzu-alert uzu-alert-success" id="consumer-alert-success">
      <div class="uzu-title-pair">
        <h3>Success alert</h3>
        <p>Preset success alert.</p>
      </div>
    </article>
    <article class="uzu-alert uzu-alert-warning" id="consumer-alert-warning">
      <div class="uzu-title-pair">
        <h3>Warning alert</h3>
        <p>Preset warning alert.</p>
      </div>
    </article>
    <div class="uzu-progress uzu-progress-indeterminate" role="progressbar" aria-label="Syncing changes">
      <span class="uzu-progress-bar"></span>
    </div>
    <span class="uzu-activity" role="status" aria-label="Syncing">
      <span class="uzu-activity-dot" aria-hidden="true"></span>
      <span class="uzu-activity-dot" aria-hidden="true"></span>
      <span class="uzu-activity-dot" aria-hidden="true"></span>
    </span>
    <ol class="uzu-process" aria-label="Publish progress">
      <li class="uzu-process-step is-complete">Validate tokens</li>
      <li class="uzu-process-step is-active" aria-current="step">Build CSS bundle</li>
      <li class="uzu-process-step">Package release</li>
    </ol>
    <span class="uzu-spinner" id="consumer-spinner" role="status" aria-label="Loading"></span>
    <ul class="uzu-list" id="consumer-list">
      <li class="uzu-list-item"><span>Design tokens</span><span class="uzu-list-meta">Ready</span><button class="uzu-button uzu-list-action" type="button">Open</button></li>
      <li class="uzu-list-item"><span>Runtime</span><span class="uzu-list-meta">Loaded</span></li>
    </ul>
    <div class="uzu-data-grid-wrap">
      <table class="uzu-data-grid" id="consumer-data-grid" data-uzu-data-grid>
        <thead><tr><th data-uzu-grid-sort>Name</th><th data-uzu-grid-sort>Count</th></tr></thead>
        <tbody>
          <tr data-uzu-grid-row="beta"><td>Beta</td><td>2</td></tr>
          <tr data-uzu-grid-row="alpha"><td>Alpha</td><td>1</td></tr>
        </tbody>
      </table>
    </div>
    <div class="uzu-data-grid-wrap">
      <table class="uzu-data-grid" id="consumer-data-grid-plain" data-uzu-data-grid>
        <thead><tr><th data-uzu-grid-sort>Plain name</th><th>State</th></tr></thead>
        <tbody>
          <tr><td>One</td><td>Ready</td></tr>
          <tr><td>Two</td><td>Queued</td></tr>
        </tbody>
      </table>
    </div>
    <ul class="uzu-tree" id="consumer-tree" data-uzu-tree aria-label="Consumer tree">
      <li class="uzu-tree-item is-open" data-uzu-tree-item data-uzu-tree-value="docs">
        <div class="uzu-tree-row"><button class="uzu-tree-toggle" type="button" data-uzu-tree-toggle aria-label="Toggle docs"></button><span class="uzu-tree-label" data-uzu-tree-label>docs</span></div>
        <ul class="uzu-tree-group">
          <li class="uzu-tree-item is-selected" data-uzu-tree-item data-uzu-tree-value="overview"><div class="uzu-tree-row"><span class="uzu-tree-label" data-uzu-tree-label>Overview</span></div></li>
        </ul>
      </li>
    </ul>
    <div class="uzu-split-pane" id="consumer-split-pane" data-uzu-split-pane data-uzu-split-size="40" data-uzu-split-min="20" data-uzu-split-max="80">
      <section class="uzu-split-panel">Left panel</section>
      <button class="uzu-split-resizer" type="button" data-uzu-split-resizer aria-label="Resize split pane"></button>
      <section class="uzu-split-panel">Right panel</section>
    </div>
    <div class="uzu-resizable" id="consumer-resizable" data-uzu-resizable data-uzu-resizable-width="260" data-uzu-resizable-height="140" data-uzu-resizable-min-width="180" data-uzu-resizable-min-height="100">
      <div class="uzu-resizable-content">Resizable content</div>
      <button class="uzu-resizable-handle" type="button" data-uzu-resizable-handle aria-label="Resize panel"></button>
    </div>
    <div class="uzu-json-viewer" id="consumer-json-viewer" data-uzu-json-viewer><script type="application/json">{"name":"Usuzumi","enabled":true,"count":2}</script></div>
    <pre class="uzu-diff-viewer" id="consumer-diff-viewer" data-uzu-diff-viewer>@@ file
- old
+ new</pre>
    <section class="uzu-editor" id="consumer-rich-editor" data-uzu-rich-editor>
      <div class="uzu-editor-toolbar" role="toolbar" aria-label="Editor tools"><button class="uzu-toolbar-button" type="button" data-uzu-editor-command="bold">B</button></div>
      <div class="uzu-editor-surface" data-uzu-editor-surface>Editable text</div>
    </section>
    <section class="uzu-editor uzu-markdown-editor" id="consumer-markdown-editor" data-uzu-markdown-editor>
      <textarea class="uzu-markdown-source" data-uzu-markdown-source># Editor markdown</textarea>
      <div class="uzu-markdown-preview" data-uzu-markdown-preview></div>
    </section>
    <span class="uzu-inline-editor" id="consumer-inline-editor" data-uzu-inline-editor data-placeholder="Untitled">Inline text</span>
    <span class="uzu-avatar" id="consumer-avatar" aria-label="Usuzumi">U</span>
    <aside class="uzu-sidebar" id="consumer-sidebar" aria-label="Consumer sidebar">
      <section class="uzu-sidebar-section">
        <p class="uzu-micro-label">Project</p>
        <ul class="uzu-sidebar-nav">
          <li><a href="#overview" aria-current="page">Overview</a></li>
          <li><button type="button">Settings</button></li>
        </ul>
      </section>
    </aside>
    <div class="uzu-menu" id="consumer-menu" data-uzu-menu>
      <button class="uzu-button uzu-menu-trigger" type="button" data-uzu-menu-trigger>More</button>
      <div class="uzu-menu-content" data-uzu-menu-content>
        <button class="uzu-menu-item" type="button" data-uzu-menu-value="rename">Rename</button>
        <button class="uzu-menu-item" type="button" data-uzu-menu-value="duplicate">Duplicate</button>
      </div>
    </div>
    <div class="uzu-menu" id="consumer-context-menu" data-uzu-context-menu data-uzu-context-menu-trigger="#consumer-context-target">
      <button class="uzu-button" id="consumer-context-target" type="button">Context target</button>
      <div class="uzu-menu-content" data-uzu-menu-content>
        <button class="uzu-menu-item" type="button" data-uzu-menu-value="open">Open</button>
      </div>
    </div>
    <div class="uzu-menubar" id="consumer-menubar" data-uzu-menubar aria-label="Consumer menubar">
      <button class="uzu-menubar-item is-active" type="button" data-uzu-menubar-value="file">File</button>
      <button class="uzu-menubar-item" type="button" data-uzu-menubar-value="edit">Edit</button>
      <button class="uzu-menubar-item" type="button" data-uzu-menubar-value="view">View</button>
    </div>
    <div class="uzu-command" id="consumer-command" data-uzu-command>
      <label class="uzu-label uzu-sr-only" for="consumer-command-input">Command</label>
      <input class="uzu-command-input" id="consumer-command-input" data-uzu-command-input value="">
      <div class="uzu-command-list" data-uzu-command-list>
        <button class="uzu-command-item" type="button" data-uzu-command-value="new">New page</button>
        <button class="uzu-command-item" type="button" data-uzu-command-value="theme">Toggle theme</button>
        <button class="uzu-command-item" type="button" data-uzu-command-value="publish">Publish draft</button>
        <p class="uzu-command-empty" hidden>No matches</p>
      </div>
    </div>
    <ol class="uzu-step-nav" id="consumer-step-nav" data-uzu-step-nav aria-label="Consumer steps">
      <li class="uzu-step-nav-item"><button class="uzu-step-nav-button is-active" type="button" data-uzu-step-value="profile">Profile</button></li>
      <li class="uzu-step-nav-item"><button class="uzu-step-nav-button" type="button" data-uzu-step-value="plan">Plan</button></li>
      <li class="uzu-step-nav-item"><button class="uzu-step-nav-button" type="button" data-uzu-step-value="review">Review</button></li>
    </ol>
    <div class="uzu-accordion" id="consumer-accordion" data-uzu-accordion>
      <section class="uzu-disclosure is-open" data-uzu-disclosure>
        <button class="uzu-disclosure-trigger" type="button" data-uzu-disclosure-trigger aria-expanded="true">First</button>
        <div class="uzu-disclosure-panel" data-uzu-disclosure-panel>First content</div>
      </section>
      <section class="uzu-disclosure" data-uzu-disclosure>
        <button class="uzu-disclosure-trigger" type="button" data-uzu-disclosure-trigger>Second</button>
        <div class="uzu-disclosure-panel" data-uzu-disclosure-panel hidden>Second content</div>
      </section>
    </div>
    <span class="uzu-hover-card" id="consumer-hover-card" data-uzu-hover-card data-uzu-hover-card-delay="20" data-uzu-hover-card-close-delay="20">
      <button class="uzu-button" type="button" data-uzu-hover-card-trigger>Hover info</button>
      <span class="uzu-hover-card-content" data-uzu-hover-card-content>Supporting information.</span>
    </span>
    <span class="uzu-tag" id="consumer-tag-static" data-uzu-tag>Docs</span>
    <button class="uzu-tag is-selected" id="consumer-tag-selectable" type="button" data-uzu-tag data-uzu-tag-selectable="true" data-uzu-tag-value="active" aria-pressed="true">Active</button>
    <span class="uzu-tag" id="consumer-tag-closeable" data-uzu-tag data-uzu-tag-value="filter">Filter<button class="uzu-tag-close" type="button" data-uzu-tag-close aria-label="Remove filter">x</button></span>
    <section class="uzu-empty-state" id="consumer-empty-state"><div class="uzu-title-pair"><h3>No projects</h3><p>Create one to continue.</p></div></section>
    <section class="uzu-error-state" id="consumer-error-state" role="alert"><div class="uzu-title-pair"><h3>Load failed</h3><p>Try again.</p></div></section>
    <article class="uzu-toast" data-uzu-toast>
      <div class="uzu-toast-content">
        <div class="uzu-title-pair">
          <h3>Saved</h3>
          <p>Dismissible toast message with a longer body line for wrapping checks.</p>
        </div>
      </div>
      <button class="uzu-icon-button uzu-toast-close" type="button" data-uzu-toast-close aria-label="Dismiss toast">x</button>
    </article>
    <div class="uzu-grid uzu-grid-2">
      <article class="uzu-card" id="consumer-tall-card" style="min-height: 180px">Tall sibling</article>
      <article class="uzu-toast" id="consumer-grid-toast" data-uzu-toast>
        <div class="uzu-toast-content">
          <div class="uzu-title-pair">
            <h3>Saved</h3>
            <p>Compact grid toast.</p>
          </div>
        </div>
        <button class="uzu-icon-button uzu-toast-close" type="button" data-uzu-toast-close aria-label="Dismiss grid toast">x</button>
      </article>
    </div>
    <button class="uzu-button" type="button" data-uzu-dialog-target="#consumer-dialog">Open dialog</button>
    <button class="uzu-button" type="button" data-uzu-dialog-target="#consumer-dialog-two">Open second dialog</button>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <section class="uzu-modal" id="consumer-dialog" data-uzu-dialog hidden tabindex="-1" aria-labelledby="consumer-dialog-title">
        <h2 id="consumer-dialog-title">Consumer dialog</h2>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Close</button>
      </section>
    </div>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <section class="uzu-modal" id="consumer-dialog-two" data-uzu-dialog hidden tabindex="-1" aria-labelledby="consumer-dialog-two-title">
        <h2 id="consumer-dialog-two-title">Second dialog</h2>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Close</button>
      </section>
    </div>
    <button class="uzu-button" id="consumer-drawer-trigger" type="button" data-uzu-dialog-target="#consumer-drawer">Open drawer</button>
    <button class="uzu-button uzu-button-danger" id="consumer-alert-dialog-trigger" type="button" data-uzu-dialog-target="#consumer-alert-dialog">Open alert dialog</button>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <aside class="uzu-drawer uzu-drawer-end" id="consumer-drawer" data-uzu-dialog hidden tabindex="-1" aria-labelledby="consumer-drawer-title">
        <h2 id="consumer-drawer-title">Consumer drawer</h2>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Close drawer</button>
      </aside>
    </div>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <section class="uzu-modal uzu-alert-dialog" id="consumer-alert-dialog" data-uzu-dialog hidden tabindex="-1" role="alertdialog" aria-labelledby="consumer-alert-dialog-title" aria-describedby="consumer-alert-dialog-desc">
        <h2 id="consumer-alert-dialog-title">Delete item</h2>
        <p id="consumer-alert-dialog-desc">This action is dangerous.</p>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Cancel</button>
      </section>
    </div>
  </main>
</body>
</html>
`, 'utf8');

  const { spawn } = await import('node:child_process');
  const { pathToFileURL } = await import('node:url');
  const profile = path.join(appDir, 'browser-profile');
  const activePortFile = path.join(profile, 'DevToolsActivePort');
  const targetUrl = `${pathToFileURL(htmlPath).href}#consumer-panel-hash-two`;

  rmSync(profile, { recursive: true, force: true });
  mkdirSync(profile, { recursive: true });

  const child = spawn(browser, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const readBrowserPort = () => {
    if (!existsSync(activePortFile)) return 0;
    const [portText] = readFileSync(activePortFile, 'utf8').split(/\r?\n/);
    return Number.parseInt(portText, 10) || 0;
  };
  const waitForBrowser = async () => {
    for (let index = 0; index < 60; index += 1) {
      const port = readBrowserPort();
      if (!port) {
        await delay(100);
        continue;
      }
      try {
        return await requestJson(port, '/json/version');
      } catch (_) {
        await delay(100);
      }
    }
    throw new Error('Browser did not expose a DevTools endpoint');
  };
  try {
    const browserInfo = await waitForBrowser();
    const port = Number.parseInt(new URL(browserInfo.webSocketDebuggerUrl).port, 10) || readBrowserPort();
    const target = await requestJson(port, `/json/new?${encodeURIComponent(targetUrl)}`, 'PUT');
    const cdp = await connectCdp(target.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await delay(800);

    const expression = `(async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const events = [];
      const themeToggle = document.querySelector('#consumer-theme-toggle');
      const pageWidthTarget = document.querySelector('#consumer-page-width');
      const pageWidth = pageWidthTarget.getBoundingClientRect().width;
      pageWidthTarget.style.setProperty('--uzu-page-max-width', '520px');
      const pageWidthCustom = pageWidthTarget.getBoundingClientRect().width;
      const tabs = document.querySelector('[data-uzu-tabs]');
      const segmented = document.querySelector('[data-uzu-segmented]');
      const paginationRoot = document.querySelector('#consumer-pagination');
      const select = document.querySelector('[data-uzu-select]');
      const selectTrigger = document.querySelector('[data-uzu-select-trigger]');
      const selectMenu = document.querySelector('.uzu-select-menu');
      const combobox = document.querySelector('#consumer-combobox');
      const comboboxInput = combobox.querySelector('[data-uzu-combobox-input]');
      const comboboxList = combobox.querySelector('[data-uzu-combobox-list]');
      const dataGrid = document.querySelector('#consumer-data-grid');
      const plainDataGrid = document.querySelector('#consumer-data-grid-plain');
      const tree = document.querySelector('#consumer-tree');
      const splitPane = document.querySelector('#consumer-split-pane');
      const splitResizer = splitPane.querySelector('[data-uzu-split-resizer]');
      const resizable = document.querySelector('#consumer-resizable');
      const resizableHandle = resizable.querySelector('[data-uzu-resizable-handle]');
      const jsonViewer = document.querySelector('#consumer-json-viewer');
      const diffViewer = document.querySelector('#consumer-diff-viewer');
      const richEditor = document.querySelector('#consumer-rich-editor');
      const markdownEditor = document.querySelector('#consumer-markdown-editor');
      const markdownEditorSource = markdownEditor.querySelector('[data-uzu-markdown-source]');
      const markdownEditorPreview = markdownEditor.querySelector('[data-uzu-markdown-preview]');
      const inlineEditor = document.querySelector('#consumer-inline-editor');
      const disclosure = document.querySelector('[data-uzu-disclosure]');
      const disclosureTrigger = document.querySelector('[data-uzu-disclosure-trigger]');
      const disclosurePanel = document.querySelector('[data-uzu-disclosure-panel]');
      const search = document.querySelector('#consumer-search');
      const searchInput = document.querySelector('#consumer-search-input');
      const searchClear = search.querySelector('[data-uzu-search-clear]');
      const password = document.querySelector('#consumer-password');
      const passwordInput = document.querySelector('#consumer-password-input');
      const passwordToggle = password.querySelector('[data-uzu-password-toggle]');
      const stepper = document.querySelector('#consumer-stepper');
      const stepperInput = document.querySelector('#consumer-stepper-input');
      const stepperIncrement = stepper.querySelector('[data-uzu-stepper-increment]');
      const newEvents = [];
      const menu = document.querySelector('#consumer-menu');
      const menuTrigger = menu.querySelector('[data-uzu-menu-trigger]');
      const menuContent = menu.querySelector('[data-uzu-menu-content]');
      const menuRename = menu.querySelector('[data-uzu-menu-value="rename"]');
      const contextMenu = document.querySelector('#consumer-context-menu');
      const contextTarget = document.querySelector('#consumer-context-target');
      const contextContent = contextMenu.querySelector('[data-uzu-menu-content]');
      const menubar = document.querySelector('#consumer-menubar');
      const command = document.querySelector('#consumer-command');
      const commandInput = command.querySelector('[data-uzu-command-input]');
      const accordion = document.querySelector('#consumer-accordion');
      const stepNav = document.querySelector('#consumer-step-nav');
      const hoverCard = document.querySelector('#consumer-hover-card');
      const tagSelectable = document.querySelector('#consumer-tag-selectable');
      const tagCloseable = document.querySelector('#consumer-tag-closeable');
      menu.addEventListener('uzu-menu-select', (event) => newEvents.push('menu:' + event.detail.value));
      contextMenu.addEventListener('uzu-menu-select', (event) => newEvents.push('context:' + event.detail.value));
      menubar.addEventListener('uzu-menubar-change', (event) => newEvents.push('menubar:' + event.detail.value));
      command.addEventListener('uzu-command-filter', (event) => newEvents.push('command-filter:' + event.detail.visibleCount));
      command.addEventListener('uzu-command-select', (event) => newEvents.push('command:' + event.detail.value));
      combobox.addEventListener('uzu-combobox-change', (event) => newEvents.push('combobox:' + event.detail.value));
      dataGrid.addEventListener('uzu-data-grid-sort', (event) => newEvents.push('grid-sort:' + event.detail.direction));
      dataGrid.addEventListener('uzu-data-grid-select', (event) => newEvents.push('grid-select:' + event.detail.value));
      plainDataGrid.addEventListener('uzu-data-grid-select', (event) => newEvents.push('plain-grid-select:' + event.detail.value));
      tree.addEventListener('uzu-tree-toggle', (event) => newEvents.push('tree-toggle:' + event.detail.expanded));
      splitPane.addEventListener('uzu-split-resize', (event) => newEvents.push('split:' + Math.round(event.detail.size)));
      resizable.addEventListener('uzu-resizable-resize', () => newEvents.push('resizable'));
      richEditor.addEventListener('uzu-editor-command', (event) => newEvents.push('editor:' + event.detail.command));
      richEditor.addEventListener('uzu-editor-change', () => newEvents.push('editor-change'));
      markdownEditor.addEventListener('uzu-markdown-editor-render', () => newEvents.push('markdown-editor'));
      inlineEditor.addEventListener('uzu-inline-editor-change', () => newEvents.push('inline-editor'));
      accordion.addEventListener('uzu-accordion-change', (event) => newEvents.push('accordion:' + event.detail.open));
      stepNav.addEventListener('uzu-step-nav-change', (event) => newEvents.push('step-nav:' + event.detail.value));
      hoverCard.addEventListener('uzu-hover-card-open', () => newEvents.push('hover:open'));
      tagSelectable.addEventListener('uzu-tag-change', (event) => newEvents.push('tag:' + event.detail.selected));
      tagCloseable.addEventListener('uzu-tag-close', (event) => newEvents.push('tag-close:' + event.detail.value));
      tabs.addEventListener('uzu-tabs-change', (event) => events.push(event.detail.value));
      segmented.addEventListener('uzu-segmented-change', (event) => events.push(event.detail.value));
      paginationRoot.addEventListener('uzu-pagination-change', (event) => events.push('page:' + event.detail.value));
      password.addEventListener('uzu-password-toggle', (event) => events.push('password:' + event.detail.visible));
      stepper.addEventListener('uzu-stepper-change', (event) => events.push('stepper:' + event.detail.value));
      const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      const secondTab = tabs.querySelector('[data-uzu-tab-value="two"]');
      const betaSegment = segmented.querySelector('[data-uzu-segment-value="beta"]');
      click(secondTab);
      click(betaSegment);
      const secondPage = paginationRoot.querySelector('[data-uzu-page="2"]');
      const nextPage = paginationRoot.querySelector('[data-uzu-page-next]');
      click(secondPage);
      const paginationPage = paginationRoot.dataset.uzuPaginationPage;
      const paginationSecondCurrent = secondPage.getAttribute('aria-current');
      const paginationSecondPanelHidden = document.querySelector('[data-uzu-page-panel="2"]').hidden;
      const paginationFirstPanelHidden = document.querySelector('[data-uzu-page-panel="1"]').hidden;
      const nestedPanelHidden = document.querySelector('[data-uzu-page-panel="nested"]').hidden;
      const paginationNextDisabled = nextPage.getAttribute('aria-disabled');
      const disabledPaginationRoot = document.querySelector('#consumer-disabled-pagination');
      click(disabledPaginationRoot.querySelector('[data-uzu-page-next]'));
      const disabledPaginationPage = disabledPaginationRoot.dataset.uzuPaginationPage;
      const disabledPaginationActiveText = disabledPaginationRoot.querySelector('[aria-current="page"]').textContent.trim();
      click(selectTrigger);
      const selectOpenAnimation = getComputedStyle(selectMenu).animationName;
      click(selectTrigger);
      const selectCloseAnimation = getComputedStyle(selectMenu).animationName;
      const selectClosing = select.classList.contains('is-closing');
      const selectExpandedAfterClose = selectTrigger.getAttribute('aria-expanded');
      comboboxInput.value = 'tree';
      comboboxInput.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(60);
      const comboboxOpenAnimation = getComputedStyle(comboboxList).animationName;
      const comboboxListDisplayOpen = getComputedStyle(comboboxList).display;
      const comboboxVisibleCount = [...combobox.querySelectorAll('[data-uzu-combobox-option]')].filter((item) => !item.hidden).length;
      click(combobox.querySelector('[data-uzu-combobox-value="tree"]'));
      await wait(60);
      const comboboxValue = combobox.dataset.uzuComboboxValue;
      const comboboxHiddenValue = combobox.querySelector('input[type="hidden"]')?.value || '';
      const comboboxClosedAfterSelect = comboboxList.hidden && !combobox.classList.contains('is-open') && comboboxInput.getAttribute('aria-expanded') === 'false';
      click(dataGrid.querySelector('[data-uzu-grid-sort]'));
      await wait(60);
      const dataGridFirstCellAfterSort = dataGrid.tBodies[0].rows[0].cells[0].textContent.trim();
      click(dataGrid.querySelector('[data-uzu-grid-row="alpha"]'));
      const dataGridSelectedValue = dataGrid.querySelector('[aria-selected="true"]')?.dataset.uzuGridRow || '';
      const plainDataGridFirstValue = plainDataGrid.tBodies[0].rows[0].dataset.uzuGridRow || '';
      click(plainDataGrid.tBodies[0].rows[1]);
      const plainDataGridSelectedValue = plainDataGrid.querySelector('[aria-selected="true"]')?.dataset.uzuGridRow || '';
      const treeToggle = tree.querySelector('[data-uzu-tree-toggle]');
      click(treeToggle);
      await wait(60);
      const treeClosed = tree.querySelector('.uzu-tree-group').hidden;
      click(treeToggle);
      await wait(60);
      const treeOpen = !tree.querySelector('.uzu-tree-group').hidden;
      const treeSelected = tree.querySelector('[data-uzu-tree-value="overview"]');
      treeSelected.focus();
      treeSelected.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      const treeKeyboardFocusValue = document.activeElement?.dataset.uzuTreeValue || '';
      window.Usuzumi.setSplitPaneSize(splitPane, 58);
      window.Usuzumi.setResizableSize(resizable, 300, 150);
      const splitSize = splitPane.dataset.uzuSplitSize;
      const splitAriaValue = splitResizer.getAttribute('aria-valuenow');
      const resizableWidth = Math.round(resizable.getBoundingClientRect().width);
      const resizableHeight = Math.round(resizable.getBoundingClientRect().height);
      const jsonToggle = jsonViewer.querySelector('.uzu-json-toggle');
      const jsonNodeCount = jsonViewer.querySelectorAll('.uzu-json-node').length;
      click(jsonToggle);
      const jsonCollapsed = jsonToggle.classList.contains('is-collapsed');
      const diffAddRows = diffViewer.querySelectorAll('.uzu-diff-line-add').length;
      const diffRemoveRows = diffViewer.querySelectorAll('.uzu-diff-line-remove').length;
      click(richEditor.querySelector('[data-uzu-editor-command]'));
      markdownEditorSource.value = '## Updated';
      markdownEditorSource.dispatchEvent(new Event('input', { bubbles: true }));
      markdownEditorSource.value = '';
      markdownEditorSource.dispatchEvent(new Event('input', { bubbles: true }));
      const markdownEditorCleared = markdownEditorPreview.textContent.trim();
      markdownEditorSource.value = '## Updated';
      markdownEditorSource.dispatchEvent(new Event('input', { bubbles: true }));
      inlineEditor.textContent = 'Changed inline';
      inlineEditor.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(80);
      const markdownEditorHeading = markdownEditorPreview.querySelector('h2')?.textContent.trim() || '';
      const markdownFence = String.fromCharCode(96, 96, 96);
      const markdownLineBreak = String.fromCharCode(10);
      markdownEditorSource.value = markdownFence + 'js' + markdownLineBreak + 'const copied = true;' + markdownLineBreak + markdownFence;
      markdownEditorSource.dispatchEvent(new Event('input', { bubbles: true }));
      const markdownEditorCopyButton = markdownEditorPreview.querySelector('[data-uzu-code-copy]');
      const markdownEditorCopyInitialized = markdownEditorCopyButton?.dataset.uzuCodeCopyInitialized === 'true';
      const inlineEditorValue = inlineEditor.textContent;
      const searchClearInitiallyHidden = searchClear.hidden;
      click(searchClear);
      const searchValueAfterClear = searchInput.value;
      const searchClearHiddenAfterClear = searchClear.hidden;
      click(passwordToggle);
      const passwordTypeAfterToggle = passwordInput.type;
      const passwordPressedAfterToggle = passwordToggle.getAttribute('aria-pressed');
      click(stepperIncrement);
      const stepperValueAfterIncrement = stepperInput.value;
      const stepperIncrementDisabledAfterMax = stepperIncrement.disabled;
      const stepperInputAppearance = getComputedStyle(stepperInput).appearance || getComputedStyle(stepperInput).webkitAppearance || '';
      const consumerSlider = document.querySelector('#consumer-slider');
      const sliderValueBefore = consumerSlider.style.getPropertyValue('--uzu-slider-value').trim();
      consumerSlider.value = '75';
      consumerSlider.dispatchEvent(new Event('input', { bubbles: true }));
      const sliderValueAfter = consumerSlider.style.getPropertyValue('--uzu-slider-value').trim();
      click(menuTrigger);
      await wait(60);
      const menuOpenAnimation = getComputedStyle(menuContent).animationName;
      const menuExpandedAfterOpen = menuTrigger.getAttribute('aria-expanded');
      click(menuRename);
      await wait(40);
      const menuCloseAnimation = getComputedStyle(menuContent).animationName;
      contextTarget.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, view: window, clientX: 24, clientY: 24 }));
      await wait(60);
      const contextMenuOpen = contextMenu.classList.contains('is-open');
      const contextMenuLeft = contextContent.getBoundingClientRect().left;
      click(contextMenu.querySelector('[data-uzu-menu-value="open"]'));
      click(menubar.querySelector('[data-uzu-menubar-value="edit"]'));
      const menubarActiveValue = menubar.querySelector('.uzu-menubar-item.is-active')?.dataset.uzuMenubarValue || '';
      commandInput.value = 'theme';
      commandInput.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(40);
      const commandVisibleCount = [...command.querySelectorAll('.uzu-command-item')].filter((item) => !item.hidden).length;
      click(command.querySelector('[data-uzu-command-value="theme"]'));
      const stepNavReview = stepNav.querySelector('[data-uzu-step-value="review"]');
      click(stepNavReview);
      const stepNavValue = stepNav.dataset.uzuStepNavValue;
      const stepNavReviewCurrent = stepNavReview.getAttribute('aria-current');
      const accordionSecond = accordion.querySelectorAll('[data-uzu-disclosure]')[1];
      click(accordionSecond.querySelector('[data-uzu-disclosure-trigger]'));
      await wait(260);
      const accordionFirstOpen = accordion.querySelectorAll('[data-uzu-disclosure]')[0].classList.contains('is-open');
      const accordionSecondOpen = accordionSecond.classList.contains('is-open');
      hoverCard.querySelector('[data-uzu-hover-card-trigger]').focus();
      await wait(80);
      const hoverCardOpen = hoverCard.classList.contains('is-open');
      click(tagSelectable);
      const tagSelectablePressed = tagSelectable.getAttribute('aria-pressed');
      click(tagCloseable.querySelector('[data-uzu-tag-close]'));
      const tagCloseableHidden = tagCloseable.hidden;
      click(disclosureTrigger);
      const disclosureOpenAnimation = getComputedStyle(disclosurePanel).animationName;
      const disclosurePanelTargetHeight = Number.parseFloat(disclosurePanel.style.getPropertyValue('--uzu-disclosure-panel-height'));
      click(disclosureTrigger);
      const disclosureCloseAnimation = getComputedStyle(disclosurePanel).animationName;
      const disclosureClosing = disclosure.classList.contains('is-closing');
      const disclosureHiddenWhileClosing = disclosurePanel.hidden;
      const dialogTrigger = document.querySelector('[data-uzu-dialog-target]');
      const secondDialogTrigger = document.querySelector('[data-uzu-dialog-target="#consumer-dialog-two"]');
      const dialog = document.querySelector('[data-uzu-dialog]');
      const secondDialog = document.querySelector('#consumer-dialog-two');
      const overlay = document.querySelector('[data-uzu-dialog-overlay]');
      const dialogCloseEvents = [];
      dialog.addEventListener('uzu-dialog-close', (event) => {
        dialogCloseEvents.push(event.detail.trigger === dialogTrigger ? 'first-trigger' : 'wrong-trigger');
      });
      click(dialogTrigger);
      const callout = document.querySelector('.uzu-callout');
      const style = getComputedStyle(callout);
      const calloutTitle = getComputedStyle(callout.querySelector('.uzu-callout-title'));
      const calloutBody = getComputedStyle(callout.querySelector('p'));
      const alert = document.querySelector('#consumer-alert');
      const alertStyle = getComputedStyle(alert);
      const alertTitle = getComputedStyle(alert.querySelector('h3'));
      const alertBody = getComputedStyle(alert.querySelector('p'));
      const alertSuccess = getComputedStyle(document.querySelector('#consumer-alert-success'));
      const alertWarning = getComputedStyle(document.querySelector('#consumer-alert-warning'));
      const alertWidth = alert.getBoundingClientRect().width;
      const alertSuccessWidth = document.querySelector('#consumer-alert-success').getBoundingClientRect().width;
      const consumerButton = getComputedStyle(document.querySelector('#consumer-button'));
      const consumerPrimary = getComputedStyle(document.querySelector('#consumer-primary'));
      const consumerGhost = getComputedStyle(document.querySelector('#consumer-ghost'));
      const consumerDanger = getComputedStyle(document.querySelector('#consumer-danger'));
      const buttonTransform = consumerButton.transform;
      const breadcrumb = getComputedStyle(document.querySelector('#consumer-breadcrumb'));
      const toolbar = document.querySelector('#consumer-toolbar');
      const toolbarStyle = getComputedStyle(toolbar);
      const toolbarButton = document.querySelector('#consumer-toolbar-button');
      const toolbarButtonStyle = getComputedStyle(toolbarButton);
      const stat = getComputedStyle(document.querySelector('#consumer-stat'));
      const statValue = getComputedStyle(document.querySelector('.uzu-stat-value'));
      const codeStyle = getComputedStyle(document.querySelector('#consumer-code'));
      const codeBlock = document.querySelector('#consumer-code-block');
      const codeBlockStyle = getComputedStyle(codeBlock.querySelector('.uzu-code-block-body'));
      const codeCopyButton = codeBlock.querySelector('[data-uzu-code-copy]');
      click(codeCopyButton);
      await wait(80);
      const codeBlockCopyLabelExists = Boolean(codeCopyButton.querySelector('[data-uzu-code-copy-label]'));
      const codeBlockCopySvgExists = Boolean(codeCopyButton.querySelector('svg'));
      const codeBlockCopyDisplay = getComputedStyle(codeCopyButton).position;
      const codeBlockPaddingTop = Number.parseFloat(codeBlockStyle.paddingTop);
      const panelNav = document.querySelector('#consumer-panel-nav');
      const panelNavSecond = panelNav.querySelector('[data-uzu-panel-target="#consumer-panel-two"]');
      const hashBeforePanelNav = window.location.hash;
      let panelNavEvent = '';
      panelNav.addEventListener('uzu-panel-nav-change', (event) => { panelNavEvent = event.detail.target; }, { once: true });
      click(panelNavSecond);
      await wait(80);
      const hashAfterPanelNav = window.location.hash;
      const secondaryPanelThreeHidden = document.querySelector('#consumer-panel-three').hidden;
      const secondaryPanelFourHidden = document.querySelector('#consumer-panel-four').hidden;
      const hashPanelOneHidden = document.querySelector('#consumer-panel-hash-one').hidden;
      const hashPanelTwoHidden = document.querySelector('#consumer-panel-hash-two').hidden;
      const hashPanelSecondPressed = document.querySelector('#consumer-panel-nav-hash [data-uzu-panel-target="#consumer-panel-hash-two"]').getAttribute('aria-pressed');
      const markdown = document.querySelector('#consumer-markdown');
      const markdownHeading = markdown.querySelector('h1');
      const markdownInlineCode = markdown.querySelector('p .uzu-code');
      const markdownCodeBlock = markdown.querySelector('.uzu-code-block');
      const markdownSafeLink = [...markdown.querySelectorAll('a')].find((anchor) => anchor.textContent.trim() === 'Safe link');
      const markdownUnsafeLink = [...markdown.querySelectorAll('a')].find((anchor) => anchor.textContent.trim() === 'Bad link');
      const renderedFragment = window.Usuzumi.renderMarkdown('Hello ' + String.fromCharCode(96) + 'api' + String.fromCharCode(96));
      const plainBackticks = document.querySelector('#consumer-plain-backticks');
      const plainBackticksCodeExists = Boolean(plainBackticks.querySelector('.uzu-code'));
      const kbdStyle = getComputedStyle(document.querySelector('#consumer-kbd'));
      const separator = document.querySelector('#consumer-separator');
      const separatorStyle = getComputedStyle(separator);
      const verticalSeparator = document.querySelector('#consumer-separator-vertical');
      const verticalSeparatorStyle = getComputedStyle(verticalSeparator);
      const pagination = getComputedStyle(paginationRoot);
      const plainPageButton = document.querySelector('#consumer-page-link');
      const plainPageButtonStyle = getComputedStyle(plainPageButton);
      const pageButton = document.querySelector('.uzu-page-button[aria-current="page"]');
      const pageButtonStyle = getComputedStyle(pageButton);
      const pagePanelStyle = getComputedStyle(document.querySelector('[data-uzu-page-panel="2"]'));
      const tabsIndicator = getComputedStyle(tabs, '::after');
      const segmentedIndicator = getComputedStyle(segmented, '::before');
      const segmentedWidthBeforeLanguage = Number.parseFloat(segmentedIndicator.width);
      const segmentedActiveWidthBeforeLanguage = betaSegment.getBoundingClientRect().width;
      window.Usuzumi.applyLanguage(document.documentElement, 'en');
      await wait(60);
      const segmentedIndicatorAfterLanguage = getComputedStyle(segmented, '::before');
      const tabsIndicatorAfterLanguage = getComputedStyle(tabs, '::after');
      const segmentedWidthAfterLanguage = Number.parseFloat(segmentedIndicatorAfterLanguage.width);
      const segmentedActiveWidthAfterLanguage = betaSegment.getBoundingClientRect().width;
      const tabsWidthAfterLanguage = Number.parseFloat(tabsIndicatorAfterLanguage.width);
      const tabsActiveWidthAfterLanguage = secondTab.getBoundingClientRect().width;
      const progressBar = getComputedStyle(document.querySelector('.uzu-progress-indeterminate .uzu-progress-bar'));
      const activityDot = getComputedStyle(document.querySelector('.uzu-activity-dot'));
      const processStep = getComputedStyle(document.querySelector('.uzu-process-step.is-active'), '::before');
      const spinnerStyle = getComputedStyle(document.querySelector('#consumer-spinner'));
      const listStyle = getComputedStyle(document.querySelector('#consumer-list'));
      const listItemStyle = getComputedStyle(document.querySelector('#consumer-list .uzu-list-item'));
      const avatarBox = document.querySelector('#consumer-avatar').getBoundingClientRect();
      const avatarStyle = getComputedStyle(document.querySelector('#consumer-avatar'));
      const sidebarStyle = getComputedStyle(document.querySelector('#consumer-sidebar'));
      const dataGridStyle = getComputedStyle(dataGrid);
      const treeStyle = getComputedStyle(tree);
      const splitPaneStyle = getComputedStyle(splitPane);
      const resizableStyle = getComputedStyle(resizable);
      const jsonViewerStyle = getComputedStyle(jsonViewer);
      const diffViewerStyle = getComputedStyle(diffViewer);
      const editorStyle = getComputedStyle(richEditor);
      const markdownEditorStyle = getComputedStyle(markdownEditor);
      const tagStaticStyle = getComputedStyle(document.querySelector('#consumer-tag-static'));
      const emptyStateStyle = getComputedStyle(document.querySelector('#consumer-empty-state'));
      const errorStateStyle = getComputedStyle(document.querySelector('#consumer-error-state'));
      const field = document.querySelector('.uzu-field');
      const fieldLabel = field.querySelector('.uzu-label');
      const fieldInput = field.querySelector('.uzu-input');
      const fieldGap = Number.parseFloat(getComputedStyle(field).gap);
      const fieldLabelBottom = fieldLabel.getBoundingClientRect().bottom;
      const fieldInputTop = fieldInput.getBoundingClientRect().top;
      const selectOpenTransform = getComputedStyle(selectMenu).transform;
      const dialogOpenAnimation = getComputedStyle(dialog).animationName;
      const dialogOpenTransform = getComputedStyle(dialog).transform;
      const toast = document.querySelector('[data-uzu-toast]');
      const toastContent = toast.querySelector('.uzu-toast-content');
      const toastClose = toast.querySelector('.uzu-toast-close');
      const toastTitle = toast.querySelector('h3');
      const toastWidthDefault = toast.getBoundingClientRect().width;
      const toastLeftDefault = toast.getBoundingClientRect().left;
      const toastRightDefault = toast.getBoundingClientRect().right;
      const toastContentLeftDefault = toastContent.getBoundingClientRect().left;
      const toastContentRightDefault = toastContent.getBoundingClientRect().right;
      const toastCloseRightDefault = toastClose.getBoundingClientRect().right;
      const toastCloseWidth = toastClose.getBoundingClientRect().width;
      const toastTitlePaddingRight = Number.parseFloat(getComputedStyle(toastTitle).paddingRight);
      toast.style.setProperty('--uzu-toast-content-end-offset', '8px');
      const toastContentRightCustom = toastContent.getBoundingClientRect().right;
      const toastCloseRightCustom = toastClose.getBoundingClientRect().right;
      const toastOpenTransform = getComputedStyle(toast).transform;
      const tooltipTransform = getComputedStyle(document.querySelector('[data-uzu-tooltip]'), '::after').transform;
      const tooltipZh = getComputedStyle(document.querySelector('#consumer-tooltip-zh'), '::after');
      const tooltipZhWidth = Number.parseFloat(tooltipZh.width);
      const tooltipZhHeight = Number.parseFloat(tooltipZh.height);
      const gridToastHeight = document.querySelector('#consumer-grid-toast').getBoundingClientRect().height;
      const gridTallCardHeight = document.querySelector('#consumer-tall-card').getBoundingClientRect().height;
      click(dialog.querySelector('[data-uzu-dialog-close]'));
      const dialogCloseAnimation = getComputedStyle(dialog).animationName;
      const dialogCloseTransform = getComputedStyle(dialog).transform;
      const dialogClosing = dialog.classList.contains('is-closing');
      const dialogHiddenWhileClosing = dialog.hidden;
      const overlayClosing = overlay.classList.contains('is-closing');
      click(toast.querySelector('[data-uzu-toast-close]'));
      const toastCloseTransform = getComputedStyle(toast).transform;
      click(secondDialogTrigger);
      const closeEventsBeforeAnimationEnd = dialogCloseEvents.length;
      await wait(260);
      const secondDialogOpenBeforeOverlayChecks = secondDialog.classList.contains('is-open');
      const focusedSecondDialogBeforeOverlayChecks = document.activeElement === secondDialog.querySelector('[data-uzu-dialog-close]');
      click(secondDialog.querySelector('[data-uzu-dialog-close]'));
      await wait(260);
      const drawerTrigger = document.querySelector('#consumer-drawer-trigger');
      const drawer = document.querySelector('#consumer-drawer');
      click(drawerTrigger);
      await wait(80);
      const drawerOpenAnimation = getComputedStyle(drawer).animationName;
      const drawerOpenTransform = getComputedStyle(drawer).transform;
      const drawerWidth = Math.round(drawer.getBoundingClientRect().width);
      click(drawer.querySelector('[data-uzu-dialog-close]'));
      await wait(120);
      const alertDialogTrigger = document.querySelector('#consumer-alert-dialog-trigger');
      const alertDialog = document.querySelector('#consumer-alert-dialog');
      click(alertDialogTrigger);
      await wait(80);
      const alertDialogRole = alertDialog.getAttribute('role');
      const alertDialogBorderLeftWidth = Math.round(Number.parseFloat(getComputedStyle(alertDialog).borderLeftWidth));
      const alertDialogAccentColor = getComputedStyle(alertDialog).borderLeftColor;
      click(alertDialog.querySelector('[data-uzu-dialog-close]'));
      await wait(80);
      return {
        hasApi: Boolean(window.Usuzumi && window.Usuzumi.init),
        rootClass: document.documentElement.classList.contains('uzu-root'),
        restoredTheme: document.querySelector('#consumer-theme-root').getAttribute('data-theme'),
        pageWidth,
        pageWidthCustom,
        themeToggleDark: themeToggle.classList.contains('is-dark'),
        tabValue: tabs.dataset.uzuTabsValue,
        tabSelected: tabs.querySelector('[data-uzu-tab-value="two"]').getAttribute('aria-selected'),
        tabsIndicator: tabs.dataset.uzuTabsIndicator,
        tabsIndicatorWidth: Number.parseFloat(tabsIndicator.width),
        tabsIndicatorTransform: tabsIndicator.transform,
        tabsIndicatorWidthAfterLanguage: tabsWidthAfterLanguage,
        tabsActiveWidthAfterLanguage,
        segmentValue: segmented.dataset.uzuSegmentedValue,
        segmentPressed: segmented.querySelector('[data-uzu-segment-value="beta"]').getAttribute('aria-pressed'),
        segmentedIndicator: segmented.dataset.uzuSegmentedIndicator,
        segmentedIndicatorWidth: Number.parseFloat(segmentedIndicator.width),
        segmentedIndicatorTransform: segmentedIndicator.transform,
        segmentedIndicatorWidthBeforeLanguage: segmentedWidthBeforeLanguage,
        segmentedActiveWidthBeforeLanguage,
        segmentedIndicatorWidthAfterLanguage: segmentedWidthAfterLanguage,
        segmentedActiveWidthAfterLanguage,
        selectOpenAnimation,
        selectCloseAnimation,
        selectOpenTransform,
        selectClosing,
        selectExpandedAfterClose,
        comboboxOpenAnimation,
        comboboxVisibleCount,
        comboboxValue,
        comboboxHiddenValue,
        comboboxClosedAfterSelect,
        comboboxListDisplayOpen,
        dataGridFirstCellAfterSort,
        dataGridSelectedValue,
        plainDataGridFirstValue,
        plainDataGridSelectedValue,
        dataGridDisplay: dataGridStyle.display,
        treeClosed,
        treeOpen,
        treeKeyboardFocusValue,
        treeDisplay: treeStyle.display,
        splitSize,
        splitAriaValue,
        splitPaneDisplay: splitPaneStyle.display,
        resizableWidth,
        resizableHeight,
        resizablePosition: resizableStyle.position,
        jsonNodeCount,
        jsonCollapsed,
        jsonViewerBorderStyle: jsonViewerStyle.borderTopStyle,
        diffAddRows,
        diffRemoveRows,
        diffViewerDisplay: diffViewerStyle.display,
        editorDisplay: editorStyle.display,
        markdownEditorDisplay: markdownEditorStyle.display,
        markdownEditorHeading,
        markdownEditorCleared,
        markdownEditorCopyInitialized,
        inlineEditorValue,
        disclosureOpenAnimation,
        disclosureCloseAnimation,
        disclosurePanelTargetHeight,
        disclosureClosing,
        disclosureHiddenWhileClosing,
        buttonTransform,
        calloutBorderStyle: style.borderTopStyle,
        calloutBorderColor: style.borderTopColor,
        calloutBackground: style.backgroundColor,
        calloutTitleColor: calloutTitle.color,
        calloutBodyColor: calloutBody.color,
        alertAccentColor: alertStyle.borderLeftColor,
        alertBackground: alertStyle.backgroundColor,
        alertTitleColor: alertTitle.color,
        alertBodyColor: alertBody.color,
        alertSuccessAccentColor: alertSuccess.borderLeftColor,
        alertWarningAccentColor: alertWarning.borderLeftColor,
        alertWidth,
        alertSuccessWidth,
        fieldGap,
        stackDisplay: getComputedStyle(document.querySelector('#consumer-stack')).display,
        flexDisplay: getComputedStyle(document.querySelector('#consumer-flex')).display,
        aspectRatio: getComputedStyle(document.querySelector('#consumer-aspect')).aspectRatio,
        scrollAreaMaxHeight: getComputedStyle(document.querySelector('#consumer-scroll-area')).maxHeight,
        formDisplay: getComputedStyle(document.querySelector('#consumer-form')).display,
        inputGroupDisplay: getComputedStyle(document.querySelector('#consumer-input-group')).display,
        fileUploadBorderStyle: getComputedStyle(document.querySelector('#consumer-file-upload')).borderStyle,
        sliderAccentColor: getComputedStyle(document.querySelector('#consumer-slider')).accentColor,
        sliderValueBefore,
        sliderValueAfter,
        searchClearInitiallyHidden,
        searchValueAfterClear,
        searchClearHiddenAfterClear,
        passwordTypeAfterToggle,
        passwordPressedAfterToggle,
        stepperValueAfterIncrement,
        stepperIncrementDisabledAfterMax,
        stepperInputAppearance,
        menuOpenAnimation,
        menuCloseAnimation,
        menuExpandedAfterOpen,
        contextMenuOpen,
        contextMenuLeft,
        menubarActiveValue,
        commandVisibleCount,
        stepNavValue,
        stepNavReviewCurrent,
        accordionFirstOpen,
        accordionSecondOpen,
        hoverCardOpen,
        tagSelectablePressed,
        tagCloseableHidden,
        fieldLabelToInputGap: fieldInputTop - fieldLabelBottom,
        progressAnimation: progressBar.animationName,
        activityAnimation: activityDot.animationName,
        processAnimation: processStep.animationName,
        spinnerAnimation: spinnerStyle.animationName,
        listBorderStyle: listStyle.borderTopStyle,
        listItemDisplay: listItemStyle.display,
        avatarWidth: Math.round(avatarBox.width),
        avatarHeight: Math.round(avatarBox.height),
        avatarDisplay: avatarStyle.display,
        sidebarWidth: Math.round(document.querySelector('#consumer-sidebar').getBoundingClientRect().width),
        sidebarDisplay: sidebarStyle.display,
        tagStaticDisplay: tagStaticStyle.display,
        emptyStateDisplay: emptyStateStyle.display,
        errorStateColor: errorStateStyle.color,
        dialogOpenAnimation,
        dialogCloseAnimation,
        dialogOpenTransform,
        dialogCloseTransform,
        toastWidthDefault,
        toastLeftDefault,
        toastRightDefault,
        toastContentLeftDefault,
        toastContentRightDefault,
        toastCloseRightDefault,
        toastContentRightCustom,
        toastCloseRightCustom,
        toastCloseWidth,
        toastTitlePaddingRight,
        toastOpenTransform,
        toastCloseTransform,
        tooltipTransform,
        tooltipZhWidth,
        tooltipZhHeight,
        gridToastHeight,
        gridTallCardHeight,
        consumerButtonFontSize: consumerButton.fontSize,
        consumerButtonHeight: Math.round(document.querySelector('#consumer-button').getBoundingClientRect().height),
        consumerPrimaryBackground: consumerPrimary.backgroundColor,
        consumerPrimaryColor: consumerPrimary.color,
        consumerGhostColor: consumerGhost.color,
        consumerDangerColor: consumerDanger.color,
        breadcrumbDisplay: breadcrumb.display,
        toolbarDisplay: toolbarStyle.display,
        toolbarButtonWidth: Math.round(toolbarButton.getBoundingClientRect().width),
        toolbarButtonBackground: toolbarButtonStyle.backgroundColor,
        statDisplay: stat.display,
        statValueFontSize: statValue.fontSize,
        codeFontFamily: codeStyle.fontFamily,
        codeBlockBorderStyle: codeBlockStyle.borderTopStyle,
        codeBlockCopyText: codeCopyButton.textContent.trim(),
        codeBlockCopyLabelExists,
        codeBlockCopySvgExists,
        codeBlockCopyDisplay,
        codeBlockCopyButtonWidth: Math.round(codeCopyButton.getBoundingClientRect().width),
        codeBlockCopyButtonHeight: Math.round(codeCopyButton.getBoundingClientRect().height),
        codeBlockPaddingTop,
        panelNavDisplay: getComputedStyle(panelNav).display,
        panelNavEvent,
        panelNavSecondPressed: panelNavSecond.getAttribute('aria-pressed'),
        panelTwoHidden: document.querySelector('#consumer-panel-two').hidden,
        hashBeforePanelNav,
        hashAfterPanelNav,
        secondaryPanelThreeHidden,
        secondaryPanelFourHidden,
        hashPanelOneHidden,
        hashPanelTwoHidden,
        hashPanelSecondPressed,
        markdownHeadingText: markdownHeading?.textContent.trim() || '',
        markdownInlineCodeText: markdownInlineCode?.textContent.trim() || '',
        markdownCodeBlockExists: Boolean(markdownCodeBlock),
        markdownSafeLinkHref: markdownSafeLink?.href || '',
        markdownUnsafeLinkExists: Boolean(markdownUnsafeLink),
        renderedMarkdownInlineCode: renderedFragment.querySelector?.('.uzu-code')?.textContent || '',
        plainBackticksText: plainBackticks.textContent.trim(),
        plainBackticksCodeExists,
        kbdHeight: Math.round(document.querySelector('#consumer-kbd').getBoundingClientRect().height),
        separatorHeight: Math.round(separator.getBoundingClientRect().height),
        separatorBackground: separatorStyle.backgroundColor,
        verticalSeparatorWidth: Math.round(verticalSeparator.getBoundingClientRect().width),
        verticalSeparatorHeight: Math.round(verticalSeparator.getBoundingClientRect().height),
        verticalSeparatorBackground: verticalSeparatorStyle.backgroundColor,
        paginationDisplay: pagination.display,
        paginationPage,
        paginationSecondCurrent,
        paginationSecondPanelHidden,
        paginationFirstPanelHidden,
        nestedPanelHidden,
        paginationNextDisabled,
        disabledPaginationPage,
        disabledPaginationActiveText,
        plainPageButtonColor: plainPageButtonStyle.color,
        plainPageButtonTextDecoration: plainPageButtonStyle.textDecorationLine,
        pageButtonWidth: Math.round(pageButton.getBoundingClientRect().width),
        pageButtonBackground: pageButtonStyle.backgroundColor,
        pageButtonColor: pageButtonStyle.color,
        pagePanelAnimation: pagePanelStyle.animationName,
        dialogClosing,
        dialogHiddenWhileClosing,
        secondDialogOpen: secondDialogOpenBeforeOverlayChecks,
        focusedSecondDialog: focusedSecondDialogBeforeOverlayChecks,
        drawerOpenAnimation,
        drawerOpenTransform,
        drawerWidth,
        alertDialogRole,
        alertDialogBorderLeftWidth,
        alertDialogAccentColor,
        overlayClosing,
        firstDialogHiddenAfterClose: dialog.hidden,
        closeEventsBeforeAnimationEnd,
        closeEventTriggerAfterAnimation: dialogCloseEvents.join(','),
        newEvents,
        events
      };
    })()`;

    const evaluation = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.text);
    const value = evaluation.result.value;
    if (!value.hasApi) throw new Error('Browser consumer page did not expose window.Usuzumi');
    if (!value.rootClass) throw new Error('Browser consumer page did not keep uzu-root');
    if (value.restoredTheme !== 'dark' || !value.themeToggleDark) throw new Error('Browser consumer theme did not restore the saved mode');
    if (!(value.pageWidth > value.pageWidthCustom) || Math.round(value.pageWidthCustom) !== 520) throw new Error('Browser consumer page max-width variable did not apply');
    if (value.tabValue !== 'two' || value.tabSelected !== 'true') throw new Error('Browser consumer tabs did not respond');
    if (value.tabsIndicator !== 'true' || value.tabsIndicatorWidth <= 0) throw new Error('Browser consumer tabs did not expose animated indicator metrics');
    if (value.tabsIndicatorTransform === 'none') throw new Error('Browser consumer tabs indicator did not move');
    if (Math.abs(value.tabsIndicatorWidthAfterLanguage - value.tabsActiveWidthAfterLanguage) > 1) throw new Error('Browser consumer tabs indicator did not refresh after language change');
    if (value.segmentValue !== 'beta' || value.segmentPressed !== 'true') throw new Error('Browser consumer segmented control did not respond');
    if (value.segmentedIndicator !== 'true' || value.segmentedIndicatorWidth <= 0) throw new Error('Browser consumer segmented control did not expose animated indicator metrics');
    if (value.segmentedIndicatorTransform === 'none') throw new Error('Browser consumer segmented indicator did not move');
    if (Math.abs(value.segmentedIndicatorWidthBeforeLanguage - value.segmentedActiveWidthBeforeLanguage) > 1) throw new Error('Browser consumer segmented indicator did not match the active segment before language change');
    if (Math.abs(value.segmentedIndicatorWidthAfterLanguage - value.segmentedActiveWidthAfterLanguage) > 1) throw new Error('Browser consumer segmented indicator did not refresh after language change');
    if (value.selectOpenAnimation !== 'uzu-menu-in' || value.selectCloseAnimation !== 'uzu-menu-out') throw new Error('Browser consumer select did not animate open and close');
    if (value.selectOpenTransform !== 'none') throw new Error('Browser consumer select menu should not shift or scale while opening');
    if (!value.selectClosing || value.selectExpandedAfterClose !== 'false') throw new Error('Browser consumer select did not keep a closing state with collapsed ARIA');
    if (value.comboboxOpenAnimation !== 'uzu-menu-in' || value.comboboxVisibleCount !== 1 || value.comboboxValue !== 'tree' || value.comboboxHiddenValue !== 'tree') throw new Error('Browser consumer combobox did not filter, animate, or sync value');
    if (!value.comboboxClosedAfterSelect) throw new Error('Browser consumer combobox reopened after selecting an option');
    if (value.comboboxListDisplayOpen !== 'grid') throw new Error('Browser consumer combobox list styling is missing');
    if (value.dataGridFirstCellAfterSort !== 'Alpha' || value.dataGridSelectedValue !== 'alpha' || value.dataGridDisplay !== 'table') throw new Error('Browser consumer data grid did not sort/select');
    if (value.plainDataGridFirstValue !== '1' || value.plainDataGridSelectedValue !== '2') throw new Error('Browser consumer data grid did not initialize plain table rows');
    if (!value.treeClosed || !value.treeOpen || value.treeKeyboardFocusValue !== 'docs' || value.treeDisplay !== 'grid') throw new Error('Browser consumer tree did not toggle, focus, or style correctly');
    if (Number(value.splitSize) !== 58 || value.splitAriaValue !== '58' || value.splitPaneDisplay !== 'grid') throw new Error('Browser consumer split pane did not resize');
    if (value.resizableWidth !== 300 || value.resizableHeight !== 150 || value.resizablePosition !== 'relative') throw new Error('Browser consumer resizable panel did not resize');
    if (value.jsonNodeCount < 2 || !value.jsonCollapsed || value.jsonViewerBorderStyle === 'none') throw new Error('Browser consumer JSON viewer did not render collapsible JSON');
    if (value.diffAddRows !== 1 || value.diffRemoveRows !== 1 || value.diffViewerDisplay !== 'block') throw new Error('Browser consumer diff viewer did not classify rows');
    if (value.editorDisplay !== 'grid' || value.markdownEditorDisplay !== 'grid' || value.markdownEditorHeading !== 'Updated' || value.markdownEditorCleared !== '' || !value.markdownEditorCopyInitialized || value.inlineEditorValue !== 'Changed inline') throw new Error('Browser consumer editor helpers did not initialize');
    if (Math.round(value.fieldGap) !== 5) throw new Error('Browser consumer form field should use the default field gap variable');
    if (value.fieldLabelToInputGap < 4) throw new Error('Browser consumer form label should not overlap the input');
    if (value.disclosureOpenAnimation !== 'uzu-disclosure-in' || value.disclosureCloseAnimation !== 'uzu-disclosure-out') throw new Error('Browser consumer disclosure did not animate open and close');
    if (!(value.disclosurePanelTargetHeight > 0)) throw new Error('Browser consumer disclosure did not set a measured panel height');
    if (!value.disclosureClosing || value.disclosureHiddenWhileClosing) throw new Error('Browser consumer disclosure did not stay visible while closing');
    if (value.buttonTransform !== 'none') throw new Error('Browser consumer button hover/base transform should not move the button');
    if (value.calloutBorderStyle === 'none') throw new Error('Browser consumer CSS did not style callouts');
    if (value.calloutBorderColor !== 'rgb(10, 20, 30)' || value.calloutBackground !== 'rgb(240, 241, 242)') throw new Error('Browser consumer callout color variables did not apply');
    if (value.calloutTitleColor !== 'rgb(30, 40, 50)' || value.calloutBodyColor !== 'rgb(60, 70, 80)') throw new Error('Browser consumer callout text color variables did not apply');
    if (value.alertAccentColor !== 'rgb(10, 20, 30)' || value.alertBackground !== 'rgb(240, 241, 242)') throw new Error('Browser consumer alert color variables did not apply');
    if (value.alertTitleColor !== 'rgb(30, 40, 50)' || value.alertBodyColor !== 'rgb(60, 70, 80)') throw new Error('Browser consumer alert text color variables did not apply');
    if (value.alertSuccessAccentColor !== 'rgb(78, 102, 85)') throw new Error('Browser consumer success alert preset did not apply');
    if (value.alertWarningAccentColor !== 'rgb(123, 104, 66)') throw new Error('Browser consumer warning alert preset did not apply');
    if (Math.round(value.alertWidth) !== 420) throw new Error('Browser consumer alert max-width variable did not apply');
    if (Math.round(value.alertSuccessWidth) !== 520) throw new Error('Browser consumer alert default max width did not apply');
    if (value.stackDisplay !== 'flex' || value.flexDisplay !== 'flex') throw new Error('Browser consumer layout primitives did not use flex layout');
    if (!value.aspectRatio.includes('2 / 1') || value.scrollAreaMaxHeight !== '64px') throw new Error('Browser consumer layout primitive variables did not apply');
    if (value.formDisplay !== 'grid' || value.inputGroupDisplay !== 'flex') throw new Error('Browser consumer form primitives did not apply');
    if (value.fileUploadBorderStyle !== 'dashed') throw new Error('Browser consumer file upload styling is missing');
    if (!value.sliderAccentColor || value.sliderValueBefore !== '50%' || value.sliderValueAfter !== '75%') throw new Error('Browser consumer slider styling or value sync is missing');
    if (value.searchClearInitiallyHidden || value.searchValueAfterClear !== '' || !value.searchClearHiddenAfterClear) throw new Error('Browser consumer search clear behavior did not work');
    if (value.passwordTypeAfterToggle !== 'text' || value.passwordPressedAfterToggle !== 'true') throw new Error('Browser consumer password toggle behavior did not work');
    if (value.stepperValueAfterIncrement !== '3' || !value.stepperIncrementDisabledAfterMax || value.stepperInputAppearance === 'auto') throw new Error('Browser consumer stepper behavior or appearance did not work');
    if (value.menuOpenAnimation !== 'uzu-menu-in' || value.menuCloseAnimation !== 'uzu-menu-out' || value.menuExpandedAfterOpen !== 'true') throw new Error('Browser consumer menu behavior did not work');
    if (!value.contextMenuOpen || value.contextMenuLeft < 8) throw new Error('Browser consumer context menu did not open at a clamped position');
    if (value.menubarActiveValue !== 'edit') throw new Error('Browser consumer menubar did not update active item');
    if (value.commandVisibleCount !== 1) throw new Error('Browser consumer command filtering did not narrow results');
    if (value.stepNavValue !== 'review' || value.stepNavReviewCurrent !== 'step') throw new Error('Browser consumer step navigation did not update current step');
    if (value.accordionFirstOpen || !value.accordionSecondOpen) throw new Error('Browser consumer accordion did not keep one panel open');
    if (!value.hoverCardOpen) throw new Error('Browser consumer hover card did not open on focus');
    if (value.tagSelectablePressed !== 'false' || !value.tagCloseableHidden) throw new Error('Browser consumer tag behavior did not work');
    if (value.progressAnimation !== 'uzu-progress-indeterminate') throw new Error('Browser consumer CSS did not animate indeterminate progress');
    if (value.activityAnimation !== 'uzu-activity-dot') throw new Error('Browser consumer CSS did not animate activity dots');
    if (value.processAnimation !== 'uzu-process-pulse') throw new Error('Browser consumer CSS did not animate active process steps');
    if (value.spinnerAnimation !== 'uzu-spin') throw new Error('Browser consumer spinner animation is missing');
    if (value.listBorderStyle === 'none' || value.listItemDisplay !== 'grid') throw new Error('Browser consumer list styling is missing');
    if (value.avatarWidth !== 36 || value.avatarHeight !== 36 || value.avatarDisplay !== 'inline-flex') throw new Error('Browser consumer avatar metrics are wrong');
    if (value.sidebarDisplay !== 'grid' || value.sidebarWidth !== 240) throw new Error('Browser consumer sidebar metrics are wrong');
    if (value.tagStaticDisplay !== 'inline-flex') throw new Error('Browser consumer tag display is wrong');
    if (value.emptyStateDisplay !== 'grid' || !value.errorStateColor) throw new Error('Browser consumer empty/error state styling is missing');
    if (value.dialogOpenAnimation !== 'uzu-dialog-surface-in') throw new Error('Browser consumer dialog did not animate on open');
    if (value.dialogCloseAnimation !== 'uzu-dialog-surface-out') throw new Error('Browser consumer dialog did not animate on close');
    if (value.dialogOpenTransform !== 'none' || value.dialogCloseTransform !== 'none') throw new Error('Browser consumer dialog should not shift or scale while opening or closing');
    if (value.drawerOpenAnimation !== 'uzu-dialog-surface-in' || value.drawerOpenTransform !== 'none' || value.drawerWidth !== 420) throw new Error('Browser consumer drawer behavior or width is wrong');
    if (value.alertDialogRole !== 'alertdialog' || value.alertDialogBorderLeftWidth !== 6 || value.alertDialogAccentColor !== 'rgb(122, 77, 74)') throw new Error('Browser consumer alert dialog semantics or accent styling is wrong');
    if (Math.round(value.toastWidthDefault) !== 360) throw new Error('Browser consumer toast should use the default compact width');
    if (Math.abs(value.toastContentRightDefault - value.toastCloseRightDefault) > 1) throw new Error('Browser consumer toast close button should align to the content boundary');
    if (Math.abs((value.toastContentLeftDefault - value.toastLeftDefault) - (value.toastRightDefault - value.toastContentRightDefault)) > 1) throw new Error('Browser consumer toast should keep balanced left and right padding by default');
    if (Math.abs(value.toastContentRightCustom - value.toastCloseRightCustom) > 1) throw new Error('Browser consumer toast custom boundary should keep the close button aligned');
    if (value.toastContentRightDefault - value.toastContentRightCustom < 7) throw new Error('Browser consumer toast custom boundary variable did not change the content edge');
    if (Math.round(value.toastCloseWidth) !== 28 || value.toastTitlePaddingRight < 40) throw new Error('Browser consumer toast close affordance should keep title text clear');
    if (value.toastOpenTransform !== 'none' || value.toastCloseTransform !== 'none') throw new Error('Browser consumer toast should not shift or scale while opening or closing');
    if (!value.tooltipTransform.startsWith('matrix(1, 0, 0, 1,') || !value.tooltipTransform.endsWith(', 0)')) throw new Error('Browser consumer tooltip should only keep its static centering transform');
    if (!(value.tooltipZhWidth > value.tooltipZhHeight)) throw new Error('Browser consumer Chinese tooltip should render horizontally');
    if (!(value.gridTallCardHeight - value.gridToastHeight > 40)) throw new Error('Browser consumer toast should not stretch to match a tall grid sibling');
    if (value.consumerButtonFontSize !== '13px' || value.consumerButtonHeight !== 40) throw new Error('Browser consumer button size did not return to the default metrics');
    if (value.consumerPrimaryBackground !== 'rgb(47, 47, 44)' || value.consumerPrimaryColor !== 'rgb(247, 246, 241)') throw new Error('Browser consumer primary button colors are wrong');
    if (value.consumerGhostColor !== 'rgb(104, 104, 102)') throw new Error('Browser consumer ghost button link color is wrong');
    if (value.consumerDangerColor !== 'rgb(122, 77, 74)') throw new Error('Browser consumer danger button link color is wrong');
    if (value.breadcrumbDisplay !== 'flex') throw new Error('Browser consumer breadcrumb did not use flex layout');
    if (value.toolbarDisplay !== 'flex') throw new Error('Browser consumer toolbar did not use flex layout');
    if (value.toolbarButtonWidth <= 40 || value.toolbarButtonWidth >= 180) throw new Error('Browser consumer toolbar button width is not stable');
    if (value.toolbarButtonBackground !== 'rgb(47, 47, 44)') throw new Error('Browser consumer toolbar primary button styling is wrong');
    if (value.statDisplay !== 'grid' || value.statValueFontSize !== '34px') throw new Error('Browser consumer stat styles are wrong');
    if (!value.codeFontFamily.toLowerCase().includes('mono')) throw new Error('Browser consumer code should use a monospace stack');
    if (value.codeBlockBorderStyle === 'none') throw new Error('Browser consumer code block styling is missing');
    if (!['Copied', 'Copy'].includes(value.codeBlockCopyText)) throw new Error('Browser consumer code copy button did not initialize');
    if (!value.codeBlockCopyLabelExists) throw new Error('Browser consumer code copy should preserve its label element');
    if (!value.codeBlockCopySvgExists || value.codeBlockCopyDisplay !== 'absolute') throw new Error('Browser consumer code copy should render as an overlay icon button');
    if (value.codeBlockCopyButtonWidth !== 28 || value.codeBlockCopyButtonHeight !== 28) throw new Error('Browser consumer code copy button should use compact icon metrics');
    if (value.codeBlockPaddingTop >= 30) throw new Error('Browser consumer code block should not reserve vertical space for the copy button');
    if (value.panelNavDisplay !== 'grid' || value.panelNavEvent !== '#consumer-panel-two' || value.panelNavSecondPressed !== 'true' || value.panelTwoHidden) throw new Error('Browser consumer panel nav did not switch panels');
    if (value.hashBeforePanelNav !== value.hashAfterPanelNav) throw new Error('Browser consumer panel nav should not update the URL hash unless data-uzu-panel-hash is enabled');
    if (value.secondaryPanelThreeHidden || !value.secondaryPanelFourHidden) throw new Error('Browser consumer panel nav should not hide panels controlled by a different nav');
    if (!value.hashPanelOneHidden || value.hashPanelTwoHidden || value.hashPanelSecondPressed !== 'true') throw new Error('Browser consumer panel nav should honor the initial hash before opening the default panel');
    if (value.markdownHeadingText !== 'Rendered' || value.markdownInlineCodeText !== '.uzu-code' || !value.markdownCodeBlockExists || value.renderedMarkdownInlineCode !== 'api') throw new Error('Browser consumer markdown rendering did not produce Usuzumi elements');
    if (value.markdownSafeLinkHref !== 'https://example.com/' || value.markdownUnsafeLinkExists) throw new Error('Browser consumer markdown should allow safe links and reject unsafe links');
    if (value.plainBackticksText !== 'Plain `raw` text should stay untouched.' || value.plainBackticksCodeExists) throw new Error('Browser consumer markdown should not rewrite ordinary text outside data-uzu-markdown');
    if (value.kbdHeight < 24) throw new Error('Browser consumer keyboard hint height is too small');
    if (value.separatorHeight !== 1 || value.separatorBackground !== 'rgb(229, 228, 224)') throw new Error('Browser consumer separator styling is wrong');
    if (value.verticalSeparatorWidth !== 1 || value.verticalSeparatorHeight !== 24 || value.verticalSeparatorBackground !== 'rgb(229, 228, 224)') throw new Error('Browser consumer vertical separator styling is wrong');
    if (value.paginationDisplay !== 'flex') throw new Error('Browser consumer pagination did not use flex layout');
    if (value.paginationPage !== '2' || value.paginationSecondCurrent !== 'page') throw new Error('Browser consumer pagination did not update active page');
    if (value.paginationSecondPanelHidden || !value.paginationFirstPanelHidden) throw new Error('Browser consumer pagination did not switch panels');
    if (value.nestedPanelHidden) throw new Error('Browser consumer pagination should not hide nested page panels');
    if (value.paginationNextDisabled !== 'true') throw new Error('Browser consumer pagination did not disable next on the final page');
    if (value.disabledPaginationPage !== '3' || value.disabledPaginationActiveText !== '3') throw new Error('Browser consumer pagination did not skip disabled pages');
    if (value.pagePanelAnimation !== 'uzu-page-panel-in') throw new Error('Browser consumer pagination panel animation is missing');
    if (value.plainPageButtonColor !== 'rgb(104, 104, 102)' || value.plainPageButtonTextDecoration !== 'none') throw new Error('Browser consumer plain page links should keep page button styling');
    if (value.pageButtonWidth < 36 || value.pageButtonWidth > 52 || value.pageButtonBackground !== 'rgb(32, 32, 30)' || value.pageButtonColor !== 'rgb(247, 246, 241)') throw new Error('Browser consumer active page button styling is wrong');
    if (!value.dialogClosing || value.dialogHiddenWhileClosing || !value.overlayClosing) throw new Error('Browser consumer dialog did not stay visible while closing');
    if (!value.secondDialogOpen || !value.focusedSecondDialog) throw new Error('Browser consumer second dialog did not remain active while first dialog closed');
    if (value.closeEventsBeforeAnimationEnd !== 0 || value.closeEventTriggerAfterAnimation !== 'first-trigger') throw new Error('Browser consumer dialog close event used the wrong trigger during overlapping dialog animation');
    if (JSON.stringify(value.events) !== JSON.stringify(['two', 'beta', 'page:2', 'password:true', 'stepper:3'])) throw new Error('Browser consumer events did not fire');
    for (const expected of ['menu:rename', 'context:open', 'menubar:edit', 'command:theme', 'combobox:tree', 'grid-sort:ascending', 'grid-select:alpha', 'plain-grid-select:2', 'tree-toggle:false', 'split:58', 'resizable', 'editor:bold', 'editor-change', 'markdown-editor', 'inline-editor', 'accordion:true', 'step-nav:review', 'hover:open', 'tag:false', 'tag-close:filter']) {
      if (!value.newEvents.includes(expected)) throw new Error('Browser consumer new component event did not fire: ' + expected);
    }

    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    const reducedMotionExpression = `(() => {
      const progressBar = document.querySelector('.uzu-progress-indeterminate .uzu-progress-bar');
      const style = getComputedStyle(progressBar);
      return {
        animationName: style.animationName,
        transform: style.transform,
        width: Math.round(progressBar.getBoundingClientRect().width)
      };
    })()`;
    const reducedMotionEvaluation = await cdp.send('Runtime.evaluate', { expression: reducedMotionExpression, returnByValue: true, awaitPromise: true });
    if (reducedMotionEvaluation.exceptionDetails) throw new Error(reducedMotionEvaluation.exceptionDetails.text);
    const reducedMotionValue = reducedMotionEvaluation.result.value;
    if (reducedMotionValue.animationName !== 'none') throw new Error('Reduced-motion progress should not animate');
    if (reducedMotionValue.transform !== 'none') throw new Error('Reduced-motion progress should remain visible without off-track transform');
    if (reducedMotionValue.width <= 0) throw new Error('Reduced-motion progress should keep a visible width');
    cdp.close();
    console.log('Consumer browser smoke passed.');
  } finally {
    child.kill();
    await delay(250);
    rmSync(profile, { recursive: true, force: true });
  }
}

assertInsideRoot(tempRoot);
rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(packDir, { recursive: true });
mkdirSync(appDir, { recursive: true });
mkdirSync(npmCacheDir, { recursive: true });

try {
  const packOutput = runNpm(['pack', '--pack-destination', packDir, '--json']);
  const [packInfo] = JSON.parse(packOutput);
  const tarball = path.join(packDir, packInfo.filename);
  if (!existsSync(tarball)) {
    throw new Error(`npm pack did not create expected tarball: ${tarball}`);
  }

  writeJson(path.join(appDir, 'package.json'), {
    private: true,
    type: 'module'
  });

  runNpm(['install', '--no-audit', '--no-fund', '--ignore-scripts', '--package-lock=false', tarball], {
    cwd: appDir
  });

  createConsumerCheck();
  run(process.execPath, ['consumer-check.mjs'], {
    cwd: appDir,
    stdio: 'inherit'
  });

  await browserSmoke();

  console.log('Consumer package smoke passed.');
} finally {
  if (process.env.USUZUMI_KEEP_CONSUMER_SMOKE !== '1') {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

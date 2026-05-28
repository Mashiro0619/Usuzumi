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
assert(css.includes('.uzu-segment[aria-pressed="true"]'), 'Published CSS is missing segmented ARIA active styles');
assert(css.includes('.uzu-progress-indeterminate'), 'Published CSS is missing indeterminate progress styles');
assert(css.includes('.uzu-activity-dot'), 'Published CSS is missing activity indicator styles');
assert(css.includes('.uzu-process-step.is-active'), 'Published CSS is missing process step styles');

const js = readPackageFile(packageRoot, 'ui/usuzumi.js');
assert(js.includes('window.Usuzumi'), 'Runtime does not expose window.Usuzumi');
assert(js.includes('data-uzu-tabs'), 'Runtime is missing tabs initialization support');
assert(js.includes('data-uzu-segmented'), 'Runtime is missing segmented initialization support');

const dts = readPackageFile(packageRoot, 'ui/usuzumi.d.ts');
assert(dts.includes('interface UsuzumiApi'), 'Types are missing UsuzumiApi');
assert(dts.includes('"uzu-tabs-change"'), 'Types are missing tabs event declarations');
assert(dts.includes('"uzu-segmented-change"'), 'Types are missing segmented event declarations');

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
<html class="uzu-root" lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="./node_modules/usuzumi/ui/usuzumi.css">
  <script src="./node_modules/usuzumi/ui/usuzumi.js" defer></script>
</head>
<body class="uzu-app">
  <main class="uzu-page">
    <button id="consumer-button" class="uzu-button" type="button">Hover target</button>
    <button id="consumer-primary" class="uzu-button uzu-button-primary" type="button">Primary</button>
    <a id="consumer-ghost" class="uzu-button uzu-button-ghost" href="#ghost">Ghost</a>
    <a id="consumer-danger" class="uzu-button uzu-button-danger" href="#danger">Danger</a>
    <button class="uzu-icon-button" type="button" data-uzu-tooltip="Tooltip text" aria-label="Tooltip target">?</button>
    <div class="uzu-tabs" data-uzu-tabs>
      <button class="uzu-tab is-active" type="button" data-uzu-tab-value="one" aria-selected="true">One</button>
      <button class="uzu-tab" type="button" data-uzu-tab-value="two" aria-selected="false">Two</button>
    </div>
    <div class="uzu-segmented" data-uzu-segmented>
      <button class="uzu-segment is-active" type="button" data-uzu-segment-value="alpha" aria-pressed="true">Alpha</button>
      <button class="uzu-segment" type="button" data-uzu-segment-value="beta" aria-pressed="false">Beta</button>
    </div>
    <div class="uzu-select" data-uzu-select data-uzu-select-name="density">
      <button class="uzu-select-trigger" type="button" data-uzu-select-trigger aria-expanded="false">Balanced</button>
      <div class="uzu-select-menu" role="listbox">
        <div class="uzu-select-option is-selected" data-uzu-select-option data-value="balanced" role="option" aria-selected="true">Balanced</div>
        <div class="uzu-select-option" data-uzu-select-option data-value="compact" role="option" aria-selected="false">Compact</div>
      </div>
    </div>
    <section class="uzu-disclosure" data-uzu-disclosure>
      <button class="uzu-disclosure-trigger" type="button" data-uzu-disclosure-trigger aria-expanded="false">Details</button>
      <div class="uzu-disclosure-panel" data-uzu-disclosure-panel hidden>Disclosure content</div>
    </section>
    <aside class="uzu-callout uzu-callout-note">
      <h3 class="uzu-callout-title">Consumer page</h3>
      <p>Loaded from node_modules.</p>
    </aside>
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
    <article class="uzu-toast" data-uzu-toast>
      <div class="uzu-toast-content">
        <div class="uzu-title-pair">
          <h3>Saved</h3>
          <p>Dismissible toast message with a longer body line for wrapping checks.</p>
        </div>
      </div>
      <button class="uzu-icon-button uzu-toast-close" type="button" data-uzu-toast-close aria-label="Dismiss toast">x</button>
    </article>
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
  </main>
</body>
</html>
`, 'utf8');

  const { spawn } = await import('node:child_process');
  const { pathToFileURL } = await import('node:url');
  const profile = path.join(appDir, 'browser-profile');
  const activePortFile = path.join(profile, 'DevToolsActivePort');
  const targetUrl = pathToFileURL(htmlPath).href;

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
      const tabs = document.querySelector('[data-uzu-tabs]');
      const segmented = document.querySelector('[data-uzu-segmented]');
      const select = document.querySelector('[data-uzu-select]');
      const selectTrigger = document.querySelector('[data-uzu-select-trigger]');
      const selectMenu = document.querySelector('.uzu-select-menu');
      const disclosure = document.querySelector('[data-uzu-disclosure]');
      const disclosureTrigger = document.querySelector('[data-uzu-disclosure-trigger]');
      const disclosurePanel = document.querySelector('[data-uzu-disclosure-panel]');
      tabs.addEventListener('uzu-tabs-change', (event) => events.push(event.detail.value));
      segmented.addEventListener('uzu-segmented-change', (event) => events.push(event.detail.value));
      const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      click([...tabs.querySelectorAll('.uzu-tab')].find((tab) => tab.textContent.trim() === 'Two'));
      click([...segmented.querySelectorAll('.uzu-segment')].find((segment) => segment.textContent.trim() === 'Beta'));
      click(selectTrigger);
      const selectOpenAnimation = getComputedStyle(selectMenu).animationName;
      click(selectTrigger);
      const selectCloseAnimation = getComputedStyle(selectMenu).animationName;
      const selectClosing = select.classList.contains('is-closing');
      const selectExpandedAfterClose = selectTrigger.getAttribute('aria-expanded');
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
      const style = getComputedStyle(document.querySelector('.uzu-callout'));
      const consumerButton = getComputedStyle(document.querySelector('#consumer-button'));
      const consumerPrimary = getComputedStyle(document.querySelector('#consumer-primary'));
      const consumerGhost = getComputedStyle(document.querySelector('#consumer-ghost'));
      const consumerDanger = getComputedStyle(document.querySelector('#consumer-danger'));
      const buttonTransform = consumerButton.transform;
      const tabsIndicator = getComputedStyle(tabs, '::after');
      const segmentedIndicator = getComputedStyle(segmented, '::before');
      const progressBar = getComputedStyle(document.querySelector('.uzu-progress-indeterminate .uzu-progress-bar'));
      const activityDot = getComputedStyle(document.querySelector('.uzu-activity-dot'));
      const processStep = getComputedStyle(document.querySelector('.uzu-process-step.is-active'), '::before');
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
      return {
        hasApi: Boolean(window.Usuzumi && window.Usuzumi.init),
        rootClass: document.documentElement.classList.contains('uzu-root'),
        tabValue: tabs.dataset.uzuTabsValue,
        tabSelected: tabs.querySelector('[data-uzu-tab-value="two"]').getAttribute('aria-selected'),
        tabsIndicator: tabs.dataset.uzuTabsIndicator,
        tabsIndicatorWidth: Number.parseFloat(tabsIndicator.width),
        tabsIndicatorTransform: tabsIndicator.transform,
        segmentValue: segmented.dataset.uzuSegmentedValue,
        segmentPressed: segmented.querySelector('[data-uzu-segment-value="beta"]').getAttribute('aria-pressed'),
        segmentedIndicator: segmented.dataset.uzuSegmentedIndicator,
        segmentedIndicatorWidth: Number.parseFloat(segmentedIndicator.width),
        segmentedIndicatorTransform: segmentedIndicator.transform,
        selectOpenAnimation,
        selectCloseAnimation,
        selectOpenTransform,
        selectClosing,
        selectExpandedAfterClose,
        disclosureOpenAnimation,
        disclosureCloseAnimation,
        disclosurePanelTargetHeight,
        disclosureClosing,
        disclosureHiddenWhileClosing,
        buttonTransform,
        calloutBorderStyle: style.borderTopStyle,
        progressAnimation: progressBar.animationName,
        activityAnimation: activityDot.animationName,
        processAnimation: processStep.animationName,
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
        consumerButtonFontSize: consumerButton.fontSize,
        consumerButtonHeight: Math.round(document.querySelector('#consumer-button').getBoundingClientRect().height),
        consumerPrimaryBackground: consumerPrimary.backgroundColor,
        consumerPrimaryColor: consumerPrimary.color,
        consumerGhostColor: consumerGhost.color,
        consumerDangerColor: consumerDanger.color,
        dialogClosing,
        dialogHiddenWhileClosing,
        secondDialogOpen: secondDialog.classList.contains('is-open'),
        focusedSecondDialog: document.activeElement === secondDialog.querySelector('[data-uzu-dialog-close]'),
        overlayClosing,
        firstDialogHiddenAfterClose: dialog.hidden,
        closeEventsBeforeAnimationEnd,
        closeEventTriggerAfterAnimation: dialogCloseEvents.join(','),
        events
      };
    })()`;

    const evaluation = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.text);
    const value = evaluation.result.value;
    if (!value.hasApi) throw new Error('Browser consumer page did not expose window.Usuzumi');
    if (!value.rootClass) throw new Error('Browser consumer page did not keep uzu-root');
    if (value.tabValue !== 'two' || value.tabSelected !== 'true') throw new Error('Browser consumer tabs did not respond');
    if (value.tabsIndicator !== 'true' || value.tabsIndicatorWidth <= 0) throw new Error('Browser consumer tabs did not expose animated indicator metrics');
    if (value.tabsIndicatorTransform === 'none') throw new Error('Browser consumer tabs indicator did not move');
    if (value.segmentValue !== 'beta' || value.segmentPressed !== 'true') throw new Error('Browser consumer segmented control did not respond');
    if (value.segmentedIndicator !== 'true' || value.segmentedIndicatorWidth <= 0) throw new Error('Browser consumer segmented control did not expose animated indicator metrics');
    if (value.segmentedIndicatorTransform === 'none') throw new Error('Browser consumer segmented indicator did not move');
    if (value.selectOpenAnimation !== 'uzu-menu-in' || value.selectCloseAnimation !== 'uzu-menu-out') throw new Error('Browser consumer select did not animate open and close');
    if (value.selectOpenTransform !== 'none') throw new Error('Browser consumer select menu should not shift or scale while opening');
    if (!value.selectClosing || value.selectExpandedAfterClose !== 'false') throw new Error('Browser consumer select did not keep a closing state with collapsed ARIA');
    if (value.disclosureOpenAnimation !== 'uzu-disclosure-in' || value.disclosureCloseAnimation !== 'uzu-disclosure-out') throw new Error('Browser consumer disclosure did not animate open and close');
    if (!(value.disclosurePanelTargetHeight > 0)) throw new Error('Browser consumer disclosure did not set a measured panel height');
    if (!value.disclosureClosing || value.disclosureHiddenWhileClosing) throw new Error('Browser consumer disclosure did not stay visible while closing');
    if (value.buttonTransform !== 'none') throw new Error('Browser consumer button hover/base transform should not move the button');
    if (value.calloutBorderStyle === 'none') throw new Error('Browser consumer CSS did not style callouts');
    if (value.progressAnimation !== 'uzu-progress-indeterminate') throw new Error('Browser consumer CSS did not animate indeterminate progress');
    if (value.activityAnimation !== 'uzu-activity-dot') throw new Error('Browser consumer CSS did not animate activity dots');
    if (value.processAnimation !== 'uzu-process-pulse') throw new Error('Browser consumer CSS did not animate active process steps');
    if (value.dialogOpenAnimation !== 'uzu-dialog-surface-in') throw new Error('Browser consumer dialog did not animate on open');
    if (value.dialogCloseAnimation !== 'uzu-dialog-surface-out') throw new Error('Browser consumer dialog did not animate on close');
    if (value.dialogOpenTransform !== 'none' || value.dialogCloseTransform !== 'none') throw new Error('Browser consumer dialog should not shift or scale while opening or closing');
    if (Math.round(value.toastWidthDefault) !== 360) throw new Error('Browser consumer toast should use the default compact width');
    if (Math.abs(value.toastContentRightDefault - value.toastCloseRightDefault) > 1) throw new Error('Browser consumer toast close button should align to the content boundary');
    if (Math.abs((value.toastContentLeftDefault - value.toastLeftDefault) - (value.toastRightDefault - value.toastContentRightDefault)) > 1) throw new Error('Browser consumer toast should keep balanced left and right padding by default');
    if (Math.abs(value.toastContentRightCustom - value.toastCloseRightCustom) > 1) throw new Error('Browser consumer toast custom boundary should keep the close button aligned');
    if (value.toastContentRightDefault - value.toastContentRightCustom < 7) throw new Error('Browser consumer toast custom boundary variable did not change the content edge');
    if (Math.round(value.toastCloseWidth) !== 28 || value.toastTitlePaddingRight < 40) throw new Error('Browser consumer toast close affordance should keep title text clear');
    if (value.toastOpenTransform !== 'none' || value.toastCloseTransform !== 'none') throw new Error('Browser consumer toast should not shift or scale while opening or closing');
    if (!value.tooltipTransform.startsWith('matrix(1, 0, 0, 1,') || !value.tooltipTransform.endsWith(', 0)')) throw new Error('Browser consumer tooltip should only keep its static centering transform');
    if (value.consumerButtonFontSize !== '13px' || value.consumerButtonHeight !== 40) throw new Error('Browser consumer button size did not return to the default metrics');
    if (value.consumerPrimaryBackground !== 'rgb(47, 47, 44)' || value.consumerPrimaryColor !== 'rgb(247, 246, 241)') throw new Error('Browser consumer primary button colors are wrong');
    if (value.consumerGhostColor !== 'rgb(104, 104, 102)') throw new Error('Browser consumer ghost button link color is wrong');
    if (value.consumerDangerColor !== 'rgb(122, 77, 74)') throw new Error('Browser consumer danger button link color is wrong');
    if (!value.dialogClosing || value.dialogHiddenWhileClosing || !value.overlayClosing) throw new Error('Browser consumer dialog did not stay visible while closing');
    if (!value.secondDialogOpen || !value.focusedSecondDialog) throw new Error('Browser consumer second dialog did not remain active while first dialog closed');
    if (value.closeEventsBeforeAnimationEnd !== 0 || value.closeEventTriggerAfterAnimation !== 'first-trigger') throw new Error('Browser consumer dialog close event used the wrong trigger during overlapping dialog animation');
    if (JSON.stringify(value.events) !== JSON.stringify(['two', 'beta'])) throw new Error('Browser consumer events did not fire');

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

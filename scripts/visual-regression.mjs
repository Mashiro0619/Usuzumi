import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, '.tmp', 'visual-regression');
const componentsUrl = pathToFileURL(path.join(root, 'example', 'components.html')).href;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to touch path outside project root: ${target}`);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function findBrowserExecutable() {
  for (const candidate of getBrowserCandidates()) {
    if (existsSync(candidate)) return candidate;
  }

  const playwrightRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!existsSync(playwrightRoot)) return '';

  const matches = [];
  const walk = (directory) => {
    for (const entry of readdirSyncSafe(directory)) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name === 'chrome.exe') matches.push(fullPath);
    }
  };
  walk(playwrightRoot);
  return matches.sort().at(-1) || '';
}

function readdirSyncSafe(directory) {
  try {
    return readdirSync(directory, { withFileTypes: true });
  } catch (_) {
    return [];
  }
}

function requestJson(port, endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: '127.0.0.1',
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
    request.setTimeout(8000, () => request.destroy(new Error(`${endpoint} timed out`)));
    request.on('error', reject);
    request.end();
  });
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
    const socket = net.createConnection({
      host: url.hostname,
      port: Number(url.port || 80)
    });
    const key = randomBytes(16).toString('base64');
    const accept = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
    const requestPath = `${url.pathname}${url.search}`;
    const pending = new Map();
    let nextId = 0;
    let settled = false;
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

        if (opcode === 0x1) handleMessage(payload.toString('utf8'));
        else if (opcode === 0x8) {
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
        '\r\n'
      ].join('\r\n'));
    });
    socket.on('data', (chunk) => {
      if (!settled) {
        const text = chunk.toString('latin1');
        const headerEnd = text.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;
        const header = text.slice(0, headerEnd);
        if (!header.includes(' 101 ') || !header.toLowerCase().includes(`sec-websocket-accept: ${accept.toLowerCase()}`)) {
          fail(new Error('DevTools WebSocket handshake failed'));
          return;
        }
        settled = true;
        resolve(api);
        const rest = chunk.subarray(Buffer.byteLength(text.slice(0, headerEnd + 4), 'latin1'));
        if (rest.length) {
          buffer = Buffer.concat([buffer, rest]);
          readFrames();
        }
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
      readFrames();
    });
    socket.on('error', fail);
    socket.on('close', () => rejectPending(new Error('DevTools WebSocket closed')));
  });
}

async function connectCdp(wsUrl, retries = 20) {
  let lastError;
  for (let index = 0; index < retries; index += 1) {
    try {
      return await connectCdpWithSocket(wsUrl);
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }
  throw lastError;
}

async function waitForBrowser(profile) {
  const activePortFile = path.join(profile, 'DevToolsActivePort');
  const readBrowserPort = () => {
    if (!existsSync(activePortFile)) return 0;
    const [portText] = readFileSync(activePortFile, 'utf8').split(/\r?\n/);
    return Number.parseInt(portText, 10) || 0;
  };

  for (let index = 0; index < 60; index += 1) {
    const port = readBrowserPort();
    if (!port) {
      await delay(100);
      continue;
    }
    try {
      const browserInfo = await requestJson(port, '/json/version');
      return Number.parseInt(new URL(browserInfo.webSocketDebuggerUrl).port, 10) || port;
    } catch (_) {
      await delay(100);
    }
  }
  throw new Error('Browser did not expose a DevTools endpoint');
}

async function openComponents(cdp, viewport) {
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile
  });
  await cdp.send('Page.navigate', { url: componentsUrl });
  await delay(900);
}

async function evaluate(cdp, expression) {
  const evaluation = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (evaluation.exceptionDetails) {
    throw new Error(evaluation.exceptionDetails.exception?.description || evaluation.exceptionDetails.text);
  }
  return evaluation.result.value;
}

async function capture(cdp, filename) {
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  writeFileSync(path.join(outputDir, filename), Buffer.from(screenshot.data, 'base64'));
}

function checkMetrics(metrics, label) {
  assert(!metrics.hasHorizontalOverflow, `${label}: page has horizontal overflow`);
  assert(metrics.hashNavigationOpenedPanel, `${label}: component hash navigation did not open the requested panel`);
  assert(metrics.toastWidth <= Math.min(362, metrics.viewportWidth - 32), `${label}: toast is too wide`);
  assert(Math.abs(metrics.toastCloseRight - metrics.toastContentRight) <= 1, `${label}: toast close button is not aligned to content`);
  assert(metrics.toastPaddingBalance <= 1, `${label}: toast horizontal padding is unbalanced`);
  assert(metrics.fieldLabelToInputGap >= 4 && metrics.fieldLabelToInputGap <= 8, `${label}: label/input gap is outside the expected range`);
  assert(Math.abs(metrics.segmentedIndicatorWidth - metrics.segmentedActiveWidth) <= 1, `${label}: segmented indicator does not match the active item`);
  assert(Math.abs(metrics.segmentedIndicatorWidthAfterLanguage - metrics.segmentedActiveWidthAfterLanguage) <= 1, `${label}: segmented indicator did not refresh after language change`);
  assert(Math.abs(metrics.tabsIndicatorWidthAfterLanguage - metrics.tabsActiveWidthAfterLanguage) <= 1, `${label}: tabs indicator did not refresh after language change`);
  assert(metrics.footerIconWidth >= 13 && metrics.footerIconHeight >= 13, `${label}: GitHub icon is too small`);
  assert(Math.abs(metrics.footerIconWidth - metrics.footerIconHeight) <= 1, `${label}: GitHub icon is distorted`);
  assert(metrics.docBrandFontSize >= 16 && metrics.docBrandFontSize <= 20, `${label}: component-page brand size is outside the compact override range`);
  assert(metrics.publicInterfaceCount >= 1, `${label}: component details do not expose public interface sections`);
  assert(metrics.buttonInterfaceHasIconButton, `${label}: button detail is missing icon button interface coverage`);
  assert(metrics.pageInterfaceHasWidthVariable, `${label}: page detail is missing page width variables`);
  assert(metrics.disclosureClosedHeight < metrics.disclosureOpenHeight - 16, `${label}: disclosure does not reduce height when collapsed`);
  assert(metrics.disclosurePanelHiddenAfterClose, `${label}: disclosure panel is not hidden after closing`);
  assert(metrics.dialogOpenAnimation === 'uzu-dialog-surface-in', `${label}: dialog open animation is missing`);
  assert(metrics.dialogCloseAnimation === 'uzu-dialog-surface-out', `${label}: dialog close animation is missing`);
  assert(metrics.dialogOpenTransform === 'none' && metrics.dialogCloseTransform === 'none', `${label}: dialog should not shift or scale while animating`);
  assert(metrics.toolbarDisplay === 'flex', `${label}: toolbar layout is not active`);
  assert(metrics.toolbarButtonWidth > 40 && metrics.toolbarButtonWidth < Math.min(180, metrics.viewportWidth - 32), `${label}: toolbar button width is unstable`);
  assert(metrics.paginationDisplay === 'flex', `${label}: pagination layout is not active`);
  assert(metrics.pageButtonWidth >= 36 && metrics.pageButtonWidth < 80, `${label}: page button width is unstable`);
  assert(metrics.paginationPage === '2' && metrics.paginationActiveText === '2', `${label}: pagination did not update active page`);
  assert(metrics.paginationPanelTwoVisible, `${label}: pagination did not show the requested panel`);
  assert(metrics.statDisplay === 'grid' && metrics.statValueFontSize === '34px', `${label}: stat styles are not active`);
  assert(metrics.separatorHeight === 1, `${label}: separator height is wrong`);
  assert(metrics.verticalSeparatorWidth === 1 && metrics.verticalSeparatorHeight === 24, `${label}: vertical separator geometry is wrong`);
  assert(metrics.kbdHeight >= 24, `${label}: keyboard hint height is too small`);
  assert(metrics.codeBlockWidth <= metrics.codePanelWidth + 1, `${label}: code block overflows its panel`);
  assert(metrics.codePanelRight <= metrics.mainRight + 1, `${label}: code panel extends past the content column`);
  assert(metrics.codeSnippetHasRuntimeState === false, `${label}: code snippet leaks runtime-only state`);
}

const visualExpression = `(async () => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rect = (selector) => {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) return null;
    const value = element.getBoundingClientRect();
    return { top: value.top, right: value.right, bottom: value.bottom, left: value.left, width: value.width, height: value.height };
  };
  const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  const showComponent = async (target) => {
    const control = document.querySelector('[data-uzu-panel-target="' + target + '"]');
    if (!control) throw new Error('Missing component control: ' + target);
    click(control);
    await wait(160);
    const panel = document.querySelector(target);
    if (!panel || panel.hidden) throw new Error('Component panel did not open: ' + target);
    return panel;
  };

  window.Usuzumi.applyLanguage(document.documentElement, 'zh');
  await wait(80);

  window.location.hash = '#component-tabs';
  await wait(160);
  const hashPanel = document.querySelector('#component-tabs');
  const hashControl = document.querySelector('[data-uzu-panel-target="#component-tabs"]');
  const hashNavigationOpenedPanel = Boolean(hashPanel && !hashPanel.hidden && hashControl?.getAttribute('aria-pressed') === 'true');

  const toastPanel = await showComponent('#component-toast');
  const toast = toastPanel.querySelector('.uzu-toast[data-uzu-toast]');
  const toastBox = rect(toast);
  const toastContentBox = rect(toast.querySelector('.uzu-toast-content'));
  const toastCloseBox = rect(toast.querySelector('.uzu-toast-close'));

  const fieldPanel = await showComponent('#component-input');
  const field = fieldPanel.querySelector('.uzu-field');
  const fieldLabelBox = rect(field.querySelector('.uzu-label'));
  const fieldInputBox = rect(field.querySelector('.uzu-input'));

  const segmentedPanel = await showComponent('#component-segmented');
  const segmented = segmentedPanel.querySelector('[data-uzu-segmented]');
  const activeSegment = segmented.querySelector('[aria-pressed="true"]');
  const segmentedIndicator = getComputedStyle(segmented, '::before');
  const segmentedIndicatorWidth = Number.parseFloat(segmentedIndicator.width);
  const segmentedActiveWidth = activeSegment.getBoundingClientRect().width;
  const footerIconBox = rect('.uzu-footer svg');
  const docBrandFontSize = Number.parseFloat(getComputedStyle(document.querySelector('.uzu-doc-brand')).fontSize);

  window.Usuzumi.applyLanguage(document.documentElement, 'en');
  await wait(120);
  const segmentedIndicatorAfterLanguage = getComputedStyle(segmented, '::before');
  const segmentedIndicatorWidthAfterLanguage = Number.parseFloat(segmentedIndicatorAfterLanguage.width);
  const segmentedActiveWidthAfterLanguage = activeSegment.getBoundingClientRect().width;

  window.Usuzumi.applyLanguage(document.documentElement, 'zh');
  await wait(80);
  const tabsPanel = await showComponent('#component-tabs');
  const tabs = tabsPanel.querySelector('.uzu-doc-preview [data-uzu-tabs]');
  window.Usuzumi.applyLanguage(document.documentElement, 'en');
  await wait(120);
  const activeTab = tabs.querySelector('[aria-selected="true"]');
  const tabsIndicatorAfterLanguage = getComputedStyle(tabs, '::after');
  const tabsIndicatorWidthAfterLanguage = Number.parseFloat(tabsIndicatorAfterLanguage.width);
  const tabsActiveWidthAfterLanguage = activeTab.getBoundingClientRect().width;
  const tabsCodeControl = tabsPanel.querySelector('[data-uzu-tab-target="#component-tabs-code"]');
  click(tabsCodeControl);
  await wait(160);
  const tabsCodePanel = tabsPanel.querySelector('#component-tabs-code');
  const tabsCodeBlock = tabsCodePanel.querySelector('.uzu-code-block-body');
  const tabsCodeText = tabsCodeBlock.textContent;
  const tabsCodePanelBox = rect(tabsCodePanel);
  const tabsCodeBlockBox = rect(tabsCodeBlock);
  const componentMainBox = rect('.uzu-doc-main');
  const codeSnippetHasRuntimeState = /data-uzu-(tabs|segmented)-(initialized|indicator|value)|role="tab(list)?"|tabindex=/.test(tabsCodeText);
  const buttonPanel = await showComponent('#component-button');
  const buttonInterfaceText = buttonPanel.querySelector('.uzu-doc-interface')?.textContent || '';
  const pagePanelRoot = await showComponent('#component-page');
  const pageInterfaceText = pagePanelRoot.querySelector('.uzu-doc-interface')?.textContent || '';
  const publicInterfaceCount = document.querySelectorAll('.uzu-doc-interface').length;

  const toolbarPanel = await showComponent('#component-toolbar');
  const toolbar = toolbarPanel.querySelector('.uzu-toolbar');
  const toolbarButtonBox = rect(toolbar.querySelector('.uzu-button'));

  const paginationPanel = await showComponent('#component-pagination');
  const pagination = paginationPanel.querySelector('.uzu-pagination');
  const pageButtonBox = rect(pagination.querySelector('.uzu-page-button[aria-current="page"]'));
  const paginationPageTwo = pagination.querySelector('[data-uzu-page="2"]');

  const statPanel = await showComponent('#component-stat');
  const statStyle = getComputedStyle(statPanel.querySelector('.uzu-stat'));
  const statValueStyle = getComputedStyle(statPanel.querySelector('.uzu-stat-value'));

  const separatorPanel = await showComponent('#component-separator');
  const separatorBox = rect(separatorPanel.querySelector('.uzu-separator'));
  const verticalSeparatorBox = rect(separatorPanel.querySelector('.uzu-separator-vertical'));

  const codePanel = await showComponent('#component-code');
  const kbdBox = rect(codePanel.querySelector('.uzu-kbd'));

  const disclosurePanelRoot = await showComponent('#component-disclosure');
  const disclosure = disclosurePanelRoot.querySelector('[data-uzu-disclosure]');
  const disclosureTrigger = disclosure.querySelector('[data-uzu-disclosure-trigger]');
  const disclosurePanel = disclosure.querySelector('[data-uzu-disclosure-panel]');
  const disclosureClosedHeight = rect(disclosure).height;

  click(disclosureTrigger);
  await wait(120);
  const disclosureOpenHeight = rect(disclosure).height;
  click(disclosureTrigger);
  await wait(320);

  click(paginationPageTwo);
  await wait(80);
  const paginationPanelTwo = paginationPanel.querySelector('[data-uzu-page-panel="2"]');
  const paginationEventValue = pagination.dataset.uzuPaginationPage;

  await showComponent('#component-dialog');
  const dialogTrigger = document.querySelector('[data-uzu-dialog-target="#site-dialog"]');
  const dialog = document.querySelector('#site-dialog');
  click(dialogTrigger);
  await wait(80);
  const dialogOpenAnimation = getComputedStyle(dialog).animationName;
  const dialogOpenTransform = getComputedStyle(dialog).transform;
  click(dialog.querySelector('[data-uzu-dialog-close]'));
  await wait(40);
  const dialogCloseAnimation = getComputedStyle(dialog).animationName;
  const dialogCloseTransform = getComputedStyle(dialog).transform;

  return {
    viewportWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth > 1,
    hashNavigationOpenedPanel,
    toastWidth: toastBox.width,
    toastContentRight: toastContentBox.right,
    toastCloseRight: toastCloseBox.right,
    toastPaddingBalance: Math.abs((toastContentBox.left - toastBox.left) - (toastBox.right - toastContentBox.right)),
    fieldLabelToInputGap: fieldInputBox.top - fieldLabelBox.bottom,
    segmentedIndicatorWidth,
    segmentedActiveWidth,
    segmentedIndicatorWidthAfterLanguage,
    segmentedActiveWidthAfterLanguage,
    tabsIndicatorWidthAfterLanguage,
    tabsActiveWidthAfterLanguage,
    codePanelWidth: tabsCodePanelBox.width,
    codePanelRight: tabsCodePanelBox.right,
    codeBlockWidth: tabsCodeBlockBox.width,
    codePanelScrollWidth: tabsCodeBlock.scrollWidth,
    mainRight: componentMainBox.right,
    codeSnippetHasRuntimeState,
    footerIconWidth: footerIconBox.width,
    footerIconHeight: footerIconBox.height,
    docBrandFontSize,
    publicInterfaceCount,
    buttonInterfaceHasIconButton: buttonInterfaceText.includes('.uzu-icon-button'),
    pageInterfaceHasWidthVariable: pageInterfaceText.includes('--uzu-page-max-width') && pageInterfaceText.includes('--uzu-page-narrow-max-width'),
    toolbarDisplay: getComputedStyle(toolbar).display,
    toolbarButtonWidth: toolbarButtonBox.width,
    paginationDisplay: getComputedStyle(pagination).display,
    pageButtonWidth: pageButtonBox.width,
    paginationPage: paginationEventValue,
    paginationPanelTwoVisible: Boolean(paginationPanelTwo && !paginationPanelTwo.hidden),
    paginationActiveText: pagination.querySelector('[aria-current="page"]')?.textContent.trim() || '',
    statDisplay: statStyle.display,
    statValueFontSize: statValueStyle.fontSize,
    separatorHeight: separatorBox.height,
    verticalSeparatorWidth: verticalSeparatorBox.width,
    verticalSeparatorHeight: verticalSeparatorBox.height,
    kbdHeight: kbdBox.height,
    disclosureClosedHeight,
    disclosureOpenHeight,
    disclosurePanelHiddenAfterClose: disclosurePanel.hidden,
    dialogOpenAnimation,
    dialogCloseAnimation,
    dialogOpenTransform,
    dialogCloseTransform
  };
})()`;

const browser = findBrowserExecutable();
if (!browser) {
  console.log('Component visual regression skipped: no Chromium/Chrome/Edge executable found.');
  process.exit(0);
}

assertInsideRoot(outputDir);
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const { spawn } = await import('node:child_process');
const profile = path.join(outputDir, 'browser-profile');
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

try {
  const port = await waitForBrowser(profile);
  for (const viewport of [
    { name: 'desktop', width: 1280, height: 900, mobile: false },
    { name: 'mobile', width: 390, height: 844, mobile: true }
  ]) {
    const target = await requestJson(port, `/json/new?${encodeURIComponent(componentsUrl)}`, 'PUT');
    const cdp = await connectCdp(target.webSocketDebuggerUrl);
    await openComponents(cdp, viewport);
    await capture(cdp, `${viewport.name}.png`);
    const metrics = await evaluate(cdp, visualExpression);
    checkMetrics(metrics, viewport.name);
    cdp.close();
  }
  console.log(`Component visual regression passed. Screenshots: ${path.relative(root, outputDir).replaceAll(path.sep, '/')}`);
} finally {
  child.kill();
  await delay(250);
}

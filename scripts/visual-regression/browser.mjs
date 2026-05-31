import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getBrowserCandidates() {
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

export function findBrowserExecutable() {
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

export function readdirSyncSafe(directory) {
  try {
    return readdirSync(directory, { withFileTypes: true });
  } catch (_) {
    return [];
  }
}

export function requestJson(port, endpoint, method = 'GET') {
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

export function encodeWebSocketFrame(text, opcode = 0x1) {
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

export function connectCdpWithSocket(wsUrl) {
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

export async function connectCdp(wsUrl, retries = 20) {
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

export async function waitForBrowser(profile) {
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

export async function openPage(cdp, viewport, url) {
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile
  });
  await cdp.send('Page.navigate', { url });
  await delay(900);
}

export async function evaluate(cdp, expression) {
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

export async function capture(cdp, filename) {
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  writeFileSync(path.join(outputDir, filename), Buffer.from(screenshot.data, 'base64'));
}

export async function showPanelForScreenshot(cdp, target) {
  await evaluate(cdp, `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const control = document.querySelector('[data-uzu-panel-target="${target}"]');
    if (!control) throw new Error('Missing screenshot control: ${target}');
    control.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    window.scrollTo(0, 0);
    await wait(180);
  })()`);
}

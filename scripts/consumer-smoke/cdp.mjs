import { createHash, randomBytes } from 'node:crypto';
import http from 'node:http';
import net from 'node:net';

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

export function connectCdp(wsUrl) {
  if (typeof WebSocket === 'function' && process.env.USUZUMI_FORCE_SOCKET_FALLBACK !== '1') {
    return connectCdpWithNativeWebSocket(wsUrl);
  }
  return connectCdpWithSocket(wsUrl);
}

export function requestJson(port, endpoint, method = 'GET') {
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

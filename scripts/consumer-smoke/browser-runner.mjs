import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { connectCdp, requestJson } from './cdp.mjs';
import { assertConsumerBrowserResult, assertReducedMotionResult } from './browser-assertions.mjs';
import { consumerBrowserExpression, reducedMotionExpression } from './browser-expressions.mjs';
import { consumerBrowserHtml } from './browser-html.mjs';

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

export async function browserSmoke(appDir) {
  const browser = findBrowserExecutable();
  if (!browser) {
    console.log('Consumer browser smoke skipped: no Chromium/Chrome/Edge executable found.');
    return;
  }

  const htmlPath = path.join(appDir, 'browser-check.html');
  writeFileSync(htmlPath, consumerBrowserHtml, 'utf8');

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


    const evaluation = await cdp.send('Runtime.evaluate', { expression: consumerBrowserExpression, returnByValue: true, awaitPromise: true });
    if (evaluation.exceptionDetails) throw new Error(evaluation.exceptionDetails.text);
    const value = evaluation.result.value;
    assertConsumerBrowserResult(value);

    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });

    const reducedMotionEvaluation = await cdp.send('Runtime.evaluate', { expression: reducedMotionExpression, returnByValue: true, awaitPromise: true });
    if (reducedMotionEvaluation.exceptionDetails) throw new Error(reducedMotionEvaluation.exceptionDetails.text);
    assertReducedMotionResult(reducedMotionEvaluation.result.value);
    cdp.close();
    console.log('Consumer browser smoke passed.');
  } finally {
    child.kill();
    await delay(250);
    rmSync(profile, { recursive: true, force: true });
  }
}

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkEditorIntegrationMetrics, checkMetrics } from './visual-regression/assertions.mjs';
import { connectCdp, delay, evaluate, findBrowserExecutable, openPage, requestJson, waitForBrowser } from './visual-regression/browser.mjs';
import { editorIntegrationExpression, visualExpression } from './visual-regression/expressions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, '.tmp', 'visual-regression');
const componentsUrl = pathToFileURL(path.join(root, 'example', 'components.html')).href;
const editorIntegrationUrl = pathToFileURL(path.join(root, 'example', 'editor-integration.html')).href;

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to touch path outside project root: ${target}`);
  }
}

async function capture(cdp, filename) {
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  writeFileSync(path.join(outputDir, filename), Buffer.from(screenshot.data, 'base64'));
}

async function showPanelForScreenshot(cdp, target) {
  await evaluate(cdp, `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const control = document.querySelector('[data-uzu-panel-target="${target}"]');
    if (!control) throw new Error('Missing screenshot control: ${target}');
    control.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    window.scrollTo(0, 0);
    await wait(180);
  })()`);
}

const browser = findBrowserExecutable();
if (!browser) {
  if (process.env.UZU_SKIP_VISUAL === '1') {
    console.log('Component visual regression skipped by UZU_SKIP_VISUAL=1.');
    process.exit(0);
  }
  console.error('Component visual regression requires Chromium, Chrome, or Edge. Set UZU_SKIP_VISUAL=1 only when intentionally skipping local visual checks.');
  process.exit(1);
}

assertInsideRoot(outputDir);
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

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
    await openPage(cdp, viewport, componentsUrl);
    await capture(cdp, `${viewport.name}.png`);
    for (const target of ['#component-form', '#component-menu', '#component-sidebar', '#component-combobox', '#component-slider', '#component-skeleton', '#component-rich-editor', '#component-markdown-editor', '#component-code-editor', '#component-inline-editor']) {
      await showPanelForScreenshot(cdp, target);
      await capture(cdp, `${viewport.name}-${target.slice('#component-'.length)}.png`);
    }
    const metrics = await evaluate(cdp, visualExpression);
    checkMetrics(metrics, viewport.name);
    await openPage(cdp, viewport, editorIntegrationUrl);
    await capture(cdp, `${viewport.name}-editor-integration.png`);
    const editorIntegrationMetrics = await evaluate(cdp, editorIntegrationExpression);
    checkEditorIntegrationMetrics(editorIntegrationMetrics, viewport.name);
    cdp.close();
  }
  console.log(`Component visual regression passed. Screenshots: ${path.relative(root, outputDir).replaceAll(path.sep, '/')}`);
} finally {
  child.kill();
  await delay(250);
}

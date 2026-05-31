import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.cache', '.tmp']);
const ignoredFiles = new Set(['AGENTS.md', 'REVIEW.md']);
const textExtensions = new Set(['.css', '.html', '.js', '.md', '.json']);
const issues = [];

function toPosix(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      return ignoredDirs.has(entry) ? [] : walk(fullPath);
    }
    return [fullPath];
  });
}

function readText(filePath) {
  return readFileSync(filePath, 'utf8');
}

function report(filePath, message) {
  issues.push(`${toPosix(filePath)}: ${message}`);
}

function isExternalReference(value) {
  return /^(https?:|mailto:|tel:|data:|#)/i.test(value);
}

function cleanReference(value) {
  return value.split('#')[0].split('?')[0].trim();
}

function checkExistingReference(filePath, rawValue, label) {
  if (!rawValue || isExternalReference(rawValue)) return;
  const cleaned = cleanReference(rawValue);
  if (!cleaned || cleaned.startsWith('{') || cleaned.startsWith('var(') || cleaned.includes('${')) return;
  const resolved = path.resolve(path.dirname(filePath), cleaned);
  if (!existsSync(resolved)) {
    report(filePath, `${label} reference does not exist: ${rawValue}`);
  }
}

function checkHtmlReferences(filePath, text) {
  const attrPattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  for (const match of text.matchAll(attrPattern)) {
    checkExistingReference(filePath, match[1], 'HTML');
  }
}

function checkCssReferences(filePath, text) {
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  for (const match of text.matchAll(urlPattern)) {
    checkExistingReference(filePath, match[1], 'CSS');
  }
}

function checkMarkdownReferences(filePath, text) {
  const markdownLinkPattern = /\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of text.matchAll(markdownLinkPattern)) {
    checkExistingReference(filePath, match[1], 'Markdown');
  }
}

function checkGuardrails(filePath, text) {
  if (/href=["']#["']/i.test(text)) {
    report(filePath, 'placeholder href="#" is not allowed');
  }
  if (/(?:href|src)\s*=\s*["']\s*javascript:/i.test(text)) {
    report(filePath, 'javascript: URL is not allowed');
  }
  if (/font-size\s*:[^;]*vw/i.test(text)) {
    report(filePath, 'viewport-width font sizing is not allowed');
  }
  if (/letter-spacing\s*:\s*-/i.test(text)) {
    report(filePath, 'negative letter-spacing is not allowed');
  }
  if (filePath.endsWith('.css') && /border-radius\s*:\s*(?:0|1px|2px|3px)\b/i.test(text)) {
    report(filePath, 'visible border-radius below 4px is not allowed');
  }
  if (filePath.startsWith(path.join(root, 'ui')) && /catalog-body/i.test(text)) {
    report(filePath, 'site-only catalog selectors must not live in ui/ styles');
  }
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function checkComponentPageStructure(filePath, text) {
  if (toPosix(filePath) !== 'example/components.html') return;
  if (!/<aside class="uzu-doc-sidebar[\s\S]*data-uzu-component-nav[\s\S]*?<\/aside>/.test(text)) {
    report(filePath, 'component page is missing the main component sidebar');
  }

  const panelIds = uniqueValues(
    [...text.matchAll(/<section class="uzu-doc-panel" id="([^"]+)"/g)].map((match) => match[1])
  );
  if (panelIds.length < 60) {
    report(filePath, `component page exposes too few component panels: ${panelIds.length}`);
  }
  if (text.includes('id="component-tab-') || text.includes('data-uzu-panel-target="#component-')) {
    report(filePath, 'component page should generate the main sidebar from panels instead of hand-writing component nav buttons');
  }
  const panelMatches = [...text.matchAll(/<section class="uzu-doc-panel" id="([^"]+)"[\s\S]*?(?=<section class="uzu-doc-panel"|<footer class="uzu-footer")/g)];
  for (const [panelText, id] of panelMatches) {
    const hasCategory = /<p class="uzu-section-label">[\s\S]*?<\/p>/.test(panelText);
    const hasLocalizedTitle = /<h2 class="uzu-section-title">[\s\S]*?<span data-lang="zh">[\s\S]*?<span data-lang="en">/.test(panelText);
    if (!hasCategory || !hasLocalizedTitle) {
      report(filePath, `component panel is missing generated navigation metadata: ${id}`);
    }
  }
}

function validateTextFiles() {
  for (const filePath of walk(root)) {
    const extension = path.extname(filePath);
    if (ignoredFiles.has(path.basename(filePath))) continue;
    if (!textExtensions.has(extension)) continue;
    if (extension === '.html' && !filePath.startsWith(path.join(root, 'example'))) continue;
    const text = readText(filePath);
    checkGuardrails(filePath, text);
    checkComponentPageStructure(filePath, text);
    if (extension === '.html') checkHtmlReferences(filePath, text);
    if (extension === '.css') checkCssReferences(filePath, text);
    if (extension === '.md') checkMarkdownReferences(filePath, text);
  }
}

function validateJavaScript() {
  execFileSync(process.execPath, ['--check', path.join(root, 'ui/usuzumi.js')], {
    cwd: root,
    stdio: 'inherit'
  });
}

validateJavaScript();
validateTextFiles();

if (issues.length) {
  console.error(`Validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Validation passed.');

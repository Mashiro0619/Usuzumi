import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssFiles = [
  'ui/css/tokens.css',
  'ui/css/base.css',
  'ui/css/typography.css',
  'ui/css/components.css',
  'ui/css/forms.css',
  'ui/css/menus.css',
  'ui/css/indicators.css',
  'ui/css/code-editors.css',
  'ui/css/feedback.css',
  'ui/css/navigation.css',
  'ui/css/data-layout.css',
  'ui/css/overlays.css',
  'ui/css/status.css',
  'ui/css/motion.css',
  'ui/css/layout.css',
  'ui/css/patterns.css',
  'ui/css/utilities.css',
  'ui/css/forced-colors.css'
];

const jsFiles = [
  'ui/js/core.js',
  'ui/js/control-utils.js',
  'ui/js/select-tabs.js',
  'ui/js/tabs-segmented.js',
  'ui/js/pagination.js',
  'ui/js/switches.js',
  'ui/js/forms.js',
  'ui/js/menus-core.js',
  'ui/js/menubars.js',
  'ui/js/commands.js',
  'ui/js/disclosures.js',
  'ui/js/comboboxes.js',
  'ui/js/data-grids.js',
  'ui/js/trees.js',
  'ui/js/accordions-hover-cards.js',
  'ui/js/tags.js',
  'ui/js/resizable.js',
  'ui/js/editors.js',
  'ui/js/dialogs.js',
  'ui/js/toasts.js',
  'ui/js/panel-navigation.js',
  'ui/js/tooltips.js',
  'ui/js/markdown.js',
  'ui/js/code-copy.js',
  'ui/js/boot.js'
];

const cssBanner = '/* Usuzumi generated CSS. Edit ui/css/*.css, then run npm run build. */';
const minCssBanner = '/* Usuzumi generated minified CSS. Edit ui/css/*.css, then run npm run build. */';
const jsBanner = '/* Usuzumi generated runtime. Edit ui/js/*.js, then run npm run build. */';
const minJsBanner = '/* Usuzumi generated minified JS. Edit ui/js/*.js, then run npm run build. */';

function readText(filePath) {
  return readFileSync(path.join(root, filePath), 'utf8').replace(/^\uFEFF/, '').trim();
}

function wrapLayer(text) {
  return `@layer usuzumi {\n${text.split('\n').map((line) => (line ? `  ${line}` : line)).join('\n')}\n}`;
}

function minifyCss(text) {
  return transformSync(text, {
    loader: 'css',
    minify: true,
    legalComments: 'none'
  }).code.trim();
}

function minifyJs(text) {
  return transformSync(text, {
    loader: 'js',
    minify: true,
    legalComments: 'none',
    target: 'es2020'
  }).code.trim();
}

const cssSource = cssFiles.map((file) => `/* ${file} */\n${readText(file)}`).join('\n\n');
const layeredCss = wrapLayer(cssSource);
const bundledCss = `${cssBanner}\n\n${layeredCss}\n`;
const bundledMinCss = `${minCssBanner}\n${minifyCss(layeredCss)}\n`;
const jsSource = jsFiles.map((file) => `/* ${file} */\n${readText(file)}`).join('\n\n');
const bundledJs = `${jsBanner}\n(function () {\n${jsSource}\n})();\n`;
const bundledMinJs = `${minJsBanner}\n${minifyJs(bundledJs)}\n`;

const outputPath = path.join(root, 'ui/usuzumi.css');
const jsPath = path.join(root, 'ui/usuzumi.js');
const minCssPath = path.join(root, 'ui/usuzumi.min.css');
const minJsPath = path.join(root, 'ui/usuzumi.min.js');

if (process.argv.includes('--check')) {
  const outputs = [
    [outputPath, bundledCss],
    [jsPath, bundledJs],
    [minCssPath, bundledMinCss],
    [minJsPath, bundledMinJs]
  ];
  const drifted = outputs.filter(([filePath, expected]) => readFileSync(filePath, 'utf8') !== expected);
  if (drifted.length) {
    console.error(`${drifted.map(([filePath]) => path.relative(root, filePath).replaceAll(path.sep, '/')).join(', ')} out of date. Run npm run build.`);
    process.exit(1);
  }
  console.log('Generated CSS and JS bundles are in sync.');
  process.exit(0);
}

writeFileSync(outputPath, bundledCss, 'utf8');
writeFileSync(jsPath, bundledJs, 'utf8');
writeFileSync(minCssPath, bundledMinCss, 'utf8');
writeFileSync(minJsPath, bundledMinJs, 'utf8');
console.log('Built ui/usuzumi.css, ui/usuzumi.js, ui/usuzumi.min.css, and ui/usuzumi.min.js');

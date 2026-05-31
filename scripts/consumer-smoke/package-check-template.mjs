export const consumerCheckTemplate = String.raw`
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
const minJsEntry = fileURLToPath(await import.meta.resolve('usuzumi/usuzumi.min.js'));
const minCssEntry = fileURLToPath(await import.meta.resolve('usuzumi/usuzumi.min.css'));
const signatureEntry = fileURLToPath(await import.meta.resolve('usuzumi/usuzumi-signature.css'));
const cdnCssEntry = fileURLToPath(await import.meta.resolve('usuzumi/ui/usuzumi.css'));
const cdnMinCssEntry = fileURLToPath(await import.meta.resolve('usuzumi/ui/usuzumi.min.css'));
const dtsEntry = fileURLToPath(await import.meta.resolve('usuzumi/ui/usuzumi.d.ts'));
const packageRoot = path.resolve(path.dirname(jsEntry), '..');

assert(rootEntry === jsEntry, 'Root package import does not resolve to ui/usuzumi.js');
assert(cssEntry === path.join(packageRoot, 'ui', 'usuzumi.css'), 'CSS export resolves to an unexpected file');
assert(minCssEntry === path.join(packageRoot, 'ui', 'usuzumi.min.css'), 'Minified CSS export resolves to an unexpected file');
assert(minJsEntry === path.join(packageRoot, 'ui', 'usuzumi.min.js'), 'Minified JS export resolves to an unexpected file');
assert(signatureEntry === path.join(packageRoot, 'ui', 'usuzumi-signature.css'), 'Signature CSS export resolves to an unexpected file');
assert(cdnCssEntry === cssEntry, 'CDN-style ui/usuzumi.css path does not resolve to the published CSS file');
assert(cdnMinCssEntry === minCssEntry, 'CDN-style ui/usuzumi.min.css path does not resolve to the published minified CSS file');
assert(dtsEntry === path.join(packageRoot, 'ui', 'usuzumi.d.ts'), 'Type declaration path does not resolve to ui/usuzumi.d.ts');

const packageJson = JSON.parse(readPackageFile(packageRoot, 'package.json'));
assert(packageJson.style === './ui/usuzumi.css', 'package.json style field must point to ui/usuzumi.css');
assert(packageJson.unpkg === './ui/usuzumi.min.css', 'package.json unpkg field must point to ui/usuzumi.min.css');
assert(packageJson.jsdelivr === './ui/usuzumi.min.css', 'package.json jsdelivr field must point to ui/usuzumi.min.css');
assert(packageJson.types === './ui/usuzumi.d.ts', 'package.json types field must point to ui/usuzumi.d.ts');
assert(packageJson.exports['./usuzumi.css'] === './ui/usuzumi.css', 'Missing usuzumi/usuzumi.css export');
assert(packageJson.exports['./usuzumi.min.css'] === './ui/usuzumi.min.css', 'Missing usuzumi/usuzumi.min.css export');
assert(packageJson.exports['./usuzumi.min.js'].default === './ui/usuzumi.min.js', 'Missing usuzumi/usuzumi.min.js export');
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
const minCss = readPackageFile(packageRoot, 'ui/usuzumi.min.css');
const minJs = readPackageFile(packageRoot, 'ui/usuzumi.min.js');
assert(minCss.includes('@layer usuzumi'), 'Minified CSS must keep the public cascade layer');
assert(minCss.length < css.length, 'Minified CSS should be smaller than the readable CSS bundle');
assert(minJs.includes('window.Usuzumi'), 'Minified runtime must expose window.Usuzumi');
assert(minJs.length < js.length, 'Minified JS should be smaller than the readable runtime');
assert(js.includes('window.Usuzumi'), 'Runtime does not expose window.Usuzumi');
assert(js.includes('destroy(root = document)'), 'Runtime is missing destroy API support');
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
assert(dts.includes('destroy(root?: ParentNode): void'), 'Type declarations are missing destroy()');
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
assert(dts.includes('"uzu-markdown-editor-change"'), 'Types are missing markdown editor change event declarations');
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
`;;

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'ui/css/tokens.css',
  'ui/css/base.css',
  'ui/css/typography.css',
  'ui/css/components.css',
  'ui/css/layout.css',
  'ui/css/patterns.css',
  'ui/css/utilities.css',
  'ui/css/forced-colors.css'
];

const banner = '/* Usuzumi generated CSS. Edit ui/css/*.css, then run npm run build:css. */';
const css = files.map((file) => {
  const text = readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '').trim();
  return `/* ${file} */\n${text}`;
}).join('\n\n');

writeFileSync(path.join(root, 'ui/usuzumi.css'), `${banner}\n\n${css}\n`, 'utf8');
console.log('Built ui/usuzumi.css');

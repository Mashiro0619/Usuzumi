import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { consumerCheckTemplate } from './package-check-template.mjs';

export function createConsumerCheck(appDir) {
  writeFileSync(path.join(appDir, 'consumer-check.mjs'), consumerCheckTemplate.trimStart(), 'utf8');
}

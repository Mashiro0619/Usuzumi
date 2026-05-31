import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserSmoke } from './consumer-smoke/browser-runner.mjs';
import { createConsumerCheck } from './consumer-smoke/package-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath || '';
const tempRoot = path.join(root, '.tmp', 'consumer-smoke');
const packDir = path.join(tempRoot, 'pack');
const appDir = path.join(tempRoot, 'app');
const npmCacheDir = path.join(tempRoot, 'npm-cache');

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to touch path outside project root: ${target}`);
  }
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
}

function runNpm(args, options = {}) {
  const npmOptions = {
    ...options,
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
      npm_config_update_notifier: 'false',
      ...(options.env || {})
    }
  };
  if (npmCli && existsSync(npmCli)) {
    return run(process.execPath, [npmCli, ...args], npmOptions);
  }
  return run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, npmOptions);
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

assertInsideRoot(tempRoot);
rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(packDir, { recursive: true });
mkdirSync(appDir, { recursive: true });
mkdirSync(npmCacheDir, { recursive: true });

try {
  const packOutput = runNpm(['pack', '--pack-destination', packDir, '--json']);
  const [packInfo] = JSON.parse(packOutput);
  const tarball = path.join(packDir, packInfo.filename);
  if (!existsSync(tarball)) {
    throw new Error(`npm pack did not create expected tarball: ${tarball}`);
  }

  writeJson(path.join(appDir, 'package.json'), {
    private: true,
    type: 'module'
  });

  runNpm(['install', '--no-audit', '--no-fund', '--ignore-scripts', '--package-lock=false', tarball], {
    cwd: appDir
  });

  createConsumerCheck(appDir);
  run(process.execPath, ['consumer-check.mjs'], {
    cwd: appDir,
    stdio: 'inherit'
  });

  await browserSmoke(appDir);

  console.log('Consumer package smoke passed.');
} finally {
  if (process.env.USUZUMI_KEEP_CONSUMER_SMOKE !== '1') {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

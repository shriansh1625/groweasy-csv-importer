#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rmSync } from 'node:fs';

const targets = ['node_modules/.cache', '.turbo'];

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  }
}

try {
  execSync('pnpm -r exec rimraf dist .next out coverage', { stdio: 'inherit' });
} catch {
  // rimraf may not be installed in all packages yet
}

console.log('Clean complete.');

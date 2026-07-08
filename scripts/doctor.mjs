#!/usr/bin/env node

import { execSync } from 'node:child_process';

const checks = [
  { name: 'Node.js version', cmd: 'node --version' },
  { name: 'pnpm version', cmd: 'pnpm --version' },
  { name: 'Workspace packages', cmd: 'pnpm list -r --depth -1' },
];

let failed = false;

for (const check of checks) {
  try {
    const output = execSync(check.cmd, { encoding: 'utf8' }).trim();
    console.log(`✓ ${check.name}: ${output}`);
  } catch (error) {
    failed = true;
    console.error(`✗ ${check.name} failed`);
    console.error(error instanceof Error ? error.message : error);
  }
}

if (failed) {
  process.exit(1);
}

console.log('\nAll doctor checks passed.');

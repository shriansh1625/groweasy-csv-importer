import { execSync } from 'node:child_process';

if (process.env.HUSKY === '0' || process.env.CI) {
  process.exit(0);
}

try {
  execSync('husky', { stdio: 'inherit' });
} catch {
  // Husky not installed (production-only install) — safe to skip
}

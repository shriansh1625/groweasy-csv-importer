import { describe, expect, it, afterEach } from 'vitest';

describe('CORS origin parsing', () => {
  afterEach(async () => {
    const { resetConfig } = await import('@groweasy/config');
    resetConfig();
  });

  it('supports comma-separated origins via config', async () => {
    process.env.CORS_ORIGIN = 'http://localhost:3000,https://app.vercel.app,*.vercel.app';
    const { resetConfig, loadConfig, config } = await import('@groweasy/config');

    resetConfig();
    loadConfig({ force: true });

    expect(config.server.corsOrigins).toEqual([
      'http://localhost:3000',
      'https://app.vercel.app',
      '*.vercel.app',
    ]);
  });
});

import { APP_NAME } from '@groweasy/shared';
import type { HealthCheckResult } from '@groweasy/shared';

const startTime = Date.now();

export class HealthService {
  async check(): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      version: '0.1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks: {
        app: {
          status: 'pass',
          message: APP_NAME,
        },
      },
    };
  }
}

import type { Request, Response } from 'express';

import type { HealthService } from '@/services/health.service.js';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  check = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.healthService.check();

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId: _req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  };
}

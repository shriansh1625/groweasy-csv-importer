import { Router } from 'express';

import { ExtractionController } from '@/controllers/extraction.controller.js';
import { HealthController } from '@/controllers/health.controller.js';
import { ExtractionService } from '@/services/extraction.service.js';
import { HealthService } from '@/services/health.service.js';
import { asyncHandler } from '@/utils/async-handler.js';

const healthService = new HealthService();
const healthController = new HealthController(healthService);

const extractionService = new ExtractionService();
const extractionController = new ExtractionController(extractionService);

export const healthRouter: Router = Router();
export const extractionRouter: Router = Router();

healthRouter.get('/', healthController.check);

// Legacy synchronous endpoint (backward compatible)
extractionRouter.post('/', asyncHandler(extractionController.extract));

// Production async import workflow
extractionRouter.post('/analyze', asyncHandler(extractionController.analyzeCsv));
extractionRouter.post('/start', asyncHandler(extractionController.startImport));
extractionRouter.get('/:importId/status', asyncHandler(extractionController.getStatus));
extractionRouter.get('/:importId/result', asyncHandler(extractionController.getResult));
extractionRouter.get('/:importId/events', extractionController.streamEvents);
extractionRouter.post('/:importId/retry', asyncHandler(extractionController.retryImport));
extractionRouter.get('/:importId/export', asyncHandler(extractionController.exportResult));

export function createApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/extract', extractionRouter);

  return router;
}

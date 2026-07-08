import type { Request, Response } from 'express';

import { UploadError } from '@groweasy/shared';
import type { ExportFormat } from '@groweasy/shared';

import type { ExtractionService } from '@/services/extraction.service.js';

const VALID_EXPORT_FORMATS: ExportFormat[] = ['crm-csv', 'json', 'skipped-csv', 'warnings-csv', 'report-json'];

function paramId(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value[0]) return value[0];
  throw new UploadError('Import ID is required');
}

export class ExtractionController {
  constructor(private readonly extractionService: ExtractionService) {}

  /** @deprecated Use startImport + SSE for production workflow */
  extract = async (req: Request, res: Response): Promise<void> => {
    const csvContent = this.extractCsvContent(req);
    if (!csvContent || csvContent.trim().length === 0) {
      throw new UploadError('CSV content is required', undefined, req.requestId);
    }

    const result = await this.extractionService.extractFromCsv(csvContent);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        estimatedCostUsd: result.metrics.estimatedCostUsd,
      },
    });
  };

  startImport = async (req: Request, res: Response): Promise<void> => {
    const csvContent = this.extractCsvContent(req);
    if (!csvContent || csvContent.trim().length === 0) {
      throw new UploadError('CSV content is required', undefined, req.requestId);
    }

    const { importId, status } = await this.extractionService.startImport(csvContent);

    res.status(202).json({
      success: true,
      data: { importId, status },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    });
  };

  getStatus = async (req: Request, res: Response): Promise<void> => {
    const importId = paramId(req.params['importId']);

    const progress = this.extractionService.getJobStatus(importId);

    res.status(200).json({
      success: true,
      data: progress,
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    });
  };

  getResult = async (req: Request, res: Response): Promise<void> => {
    const importId = paramId(req.params['importId']);

    const result = this.extractionService.getJobResult(importId);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        estimatedCostUsd: result.metrics.estimatedCostUsd,
      },
    });
  };

  streamEvents = (req: Request, res: Response): void => {
    let importId: string;
    try {
      importId = paramId(req.params['importId']);
    } catch {
      res.status(400).json({ success: false, error: { message: 'Import ID is required' } });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15_000);

    const send = (event: import('@groweasy/shared').ImportProgressEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      if (event.type === 'complete' || event.type === 'error') {
        clearInterval(heartbeat);
        res.end();
      }
    };

    try {
      const unsubscribe = this.extractionService.subscribeToProgress(importId, send);

      req.on('close', () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    } catch (error) {
      clearInterval(heartbeat);
      const message = error instanceof Error ? error.message : 'Subscription failed';
      res.write(`data: ${JSON.stringify({ type: 'error', error: message, timestamp: new Date().toISOString() })}\n\n`);
      res.end();
    }
  };

  retryImport = async (req: Request, res: Response): Promise<void> => {
    const importId = paramId(req.params['importId']);

    const body = req.body as { rowIndices?: number[] } | undefined;
    const result = await this.extractionService.retryFailedRows(importId, body?.rowIndices);

    res.status(202).json({
      success: true,
      data: result,
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    });
  };

  exportResult = async (req: Request, res: Response): Promise<void> => {
    const importId = paramId(req.params['importId']);

    const format = (req.query['format'] as ExportFormat | undefined) ?? 'crm-csv';
    if (!VALID_EXPORT_FORMATS.includes(format)) {
      throw new UploadError(`Invalid export format: ${format}`);
    }

    const { content, mimeType, filename } = this.extractionService.exportImport(importId, format);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(content);
  };

  private extractCsvContent(req: Request): string | null {
    if (typeof req.body === 'object' && req.body !== null && 'csv' in req.body) {
      const csv = (req.body as { csv: unknown }).csv;
      return typeof csv === 'string' ? csv : null;
    }

    if (typeof req.body === 'string') {
      return req.body;
    }

    return null;
  }
}

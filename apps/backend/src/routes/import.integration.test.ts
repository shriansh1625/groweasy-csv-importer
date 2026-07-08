import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';
import { MockLLMProvider } from '../ai/providers/mock.provider.js';
import { ExtractionService } from '../services/extraction.service.js';

const SAMPLE_CSV = `Name,Email,Mobile
John Doe,john@example.com,555-0100
Jane Smith,jane@example.com,555-0101`;

describe('Import API integration', () => {
  it('POST /extract/start returns import ID', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/v1/extract/start')
      .send({ csv: SAMPLE_CSV })
      .expect(202);

    expect(response.body.success).toBe(true);
    expect(response.body.data.importId).toMatch(/^import_/);
  });

  it('GET /extract/:id/status returns progress shape', async () => {
    const service = new ExtractionService();
    const provider = new MockLLMProvider();
    provider.setResponse(
      'default',
      JSON.stringify({
        records: [
          {
            rowIndex: 0,
            fields: { fullName: { value: 'John Doe', confidence: 95 }, email: { value: 'john@example.com', confidence: 98 } },
          },
        ],
        skipped: [],
        warnings: [],
        metadata: {},
      }),
    );

    const { importId } = await service.startImport(SAMPLE_CSV, { llmProvider: provider });

    await new Promise((r) => setTimeout(r, 500));

    const app = createApp();
    const response = await request(app).get(`/api/v1/extract/${importId}/status`);

    expect(response.body.success).toBe(true);
    expect(response.body.data.importId).toBe(importId);
    expect(response.body.data.stage).toBeDefined();
  });

  it('rejects empty CSV upload', async () => {
    const app = createApp();
    const response = await request(app).post('/api/v1/extract/start').send({ csv: '' }).expect(400);

    expect(response.body.success).toBe(false);
  });
});

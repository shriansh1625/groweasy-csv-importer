import { describe, expect, it } from 'vitest';

import { DemoLLMProvider } from './demo.provider.js';

describe('DemoLLMProvider', () => {
  it('extracts typo headers', async () => {
    const provider = new DemoLLMProvider();
    const prompt = JSON.stringify({
      rowsToProcess: [
        { _rowIndex: '0', Nmae: 'John Doe', Emial: 'john@test.com', Phne: '5550300', Compny: 'Acme Inc' },
      ],
      columnSemantics: [],
    });

    const response = await provider.complete({ prompt, temperature: 0 });
    const parsed = JSON.parse(response.content) as { records: unknown[] };

    expect(parsed.records.length).toBe(1);
  });

  it('extracts records from structured prompt payload', async () => {
    const provider = new DemoLLMProvider();
    const prompt = JSON.stringify({
      rowsToProcess: [
        { _rowIndex: '0', Name: 'John Doe', Email: 'john@test.com', Phone: '555-0100' },
      ],
      columnSemantics: [
        { header: 'Name', mapsTo: 'fullName', matchConfidence: 95 },
        { header: 'Email', mapsTo: 'email', matchConfidence: 98 },
        { header: 'Phone', mapsTo: 'phone', matchConfidence: 90 },
      ],
    });

    const response = await provider.complete({ prompt, temperature: 0 });
    const parsed = JSON.parse(response.content) as { records: unknown[] };

    expect(parsed.records).toHaveLength(1);
    expect(provider.model).toBe('demo-heuristic-v1');
  });

  it('skips empty rows', async () => {
    const provider = new DemoLLMProvider();
    const prompt = JSON.stringify({
      rowsToProcess: [{ _rowIndex: '0' }],
      columnSemantics: [],
    });

    const response = await provider.complete({ prompt, temperature: 0 });
    const parsed = JSON.parse(response.content) as { skipped: unknown[] };

    expect(parsed.skipped).toHaveLength(1);
  });
});

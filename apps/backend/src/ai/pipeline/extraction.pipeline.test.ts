import { describe, expect, it } from 'vitest';

import { MockLLMProvider } from '../providers/mock.provider.js';

import { ExtractionPipeline } from './extraction.pipeline.js';

const SAMPLE_CSV = `Name,Email,Mobile,Sales Rep,Status,Project
John Doe,john@example.com,+1-555-0100,Alice Smith,Good Lead - Follow Up,Meridian Tower
Jane Smith,jane@example.com,555-0101,Bob Jones,Did Not Connect,Eden Park`;

describe('ExtractionPipeline', () => {
  it('executes full pipeline with enterprise output format', async () => {
    const provider = new MockLLMProvider();
    provider.setResponse(
      'default',
      JSON.stringify({
        records: [
          {
            rowIndex: 0,
            fields: {
              fullName: { value: 'John Doe', confidence: 95 },
              email: { value: 'john@example.com', confidence: 98 },
              phone: { value: '+15550100', confidence: 90 },
              leadOwner: { value: 'Alice Smith', confidence: 88 },
              crmStatus: { value: 'GOOD_LEAD_FOLLOW_UP', confidence: 90 },
              dataSource: { value: 'meridian_tower', confidence: 92 },
            },
          },
          {
            rowIndex: 1,
            fields: {
              fullName: { value: 'Jane Smith', confidence: 95 },
              email: { value: 'jane@example.com', confidence: 98 },
              phone: { value: '+15550101', confidence: 90 },
              leadOwner: { value: 'Bob Jones', confidence: 88 },
              crmStatus: { value: 'DID_NOT_CONNECT', confidence: 88 },
              dataSource: { value: 'eden_park', confidence: 90 },
            },
          },
        ],
        skipped: [],
        warnings: [],
        metadata: { promptVersion: 'v2', processedRows: 2 },
      }),
    );

    const pipeline = new ExtractionPipeline();
    const result = await pipeline.execute(SAMPLE_CSV, {
      llmProvider: provider,
      promptVersion: 'v2',
      importId: 'import_test',
    });

    expect(result.importId).toBe('import_test');
    expect(result.records).toHaveLength(2);
    expect(result.metrics.totalRows).toBe(2);
    expect(result.headerAnalysis.columns.some((c) => c.semanticType === 'email')).toBe(true);
    expect(result.records[0]?.crmStatus.value).toBe('GOOD_LEAD_FOLLOW_UP');
    expect(result.records[0]?.dataSource.value).toBe('meridian_tower');
  });
});

import { generateId } from '@groweasy/shared';
import type {
  BatchMetadata,
  ColumnSemanticMetadata,
  ExtractionBatch,
  LLMProviderName,
} from '@groweasy/shared';

import { PromptRegistry, type PromptVersion } from '../prompts/PromptRegistry.js';
import type { LLMProvider } from '../../providers/llm/types.js';

import { TokenEstimator } from './token.estimator.js';

export interface BatchBuilderOptions {
  contextWindow: number;
  targetContextRatio: number;
  provider: LLMProviderName;
  model: string;
  promptVersion: PromptVersion;
  llmProvider: LLMProvider;
}

export class BatchBuilder {
  private readonly tokenEstimator = new TokenEstimator();

  buildBatches(
    rows: Record<string, string>[],
    headerContext: ColumnSemanticMetadata[],
    options: BatchBuilderOptions,
  ): ExtractionBatch[] {
    const activeHeaders = headerContext
      .filter((col) => col.semanticType !== 'unknown')
      .map((col) => col.originalHeader);

    const maxTokens = Math.floor(options.contextWindow * options.targetContextRatio);
    const promptTemplate = PromptRegistry.get(options.promptVersion);
    const templateSize = this.tokenEstimator.estimateTokens(
      promptTemplate.buildExtractionPrompt([], headerContext),
    );

    const batches: ExtractionBatch[] = [];
    let currentBatch: Record<string, string>[] = [];
    let currentIndices: number[] = [];
    let batchStartIndex = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) {
        continue;
      }

      const candidateRows = [...currentBatch, row];
      const estimatedTokens = this.tokenEstimator.estimateBatchTokens(
        candidateRows,
        activeHeaders,
        templateSize,
      );

      if (estimatedTokens > maxTokens && currentBatch.length > 0) {
        batches.push(
          this.createBatch(
            currentBatch,
            currentIndices,
            headerContext,
            options,
            templateSize,
          ),
        );
        currentBatch = [row];
        currentIndices = [i];
        batchStartIndex = i;
      } else {
        currentBatch = candidateRows;
        currentIndices.push(i);
        if (currentBatch.length === 1) {
          batchStartIndex = i;
        }
      }

      void batchStartIndex;
    }

    if (currentBatch.length > 0) {
      batches.push(
        this.createBatch(currentBatch, currentIndices, headerContext, options, templateSize),
      );
    }

    return batches;
  }

  private createBatch(
    rows: Record<string, string>[],
    rowIndices: number[],
    headerContext: ColumnSemanticMetadata[],
    options: BatchBuilderOptions,
    templateSize: number,
  ): ExtractionBatch {
    const activeHeaders = headerContext
      .filter((col) => col.semanticType !== 'unknown')
      .map((col) => col.originalHeader);

    const estimatedTokens = this.tokenEstimator.estimateBatchTokens(
      rows,
      activeHeaders,
      templateSize,
    );

    const estimatedCost = options.llmProvider.estimateCost(
      estimatedTokens,
      rows.length * 150,
    );

    const metadata: BatchMetadata = {
      batchId: generateId('batch'),
      rowCount: rows.length,
      estimatedTokens,
      estimatedCost,
      provider: options.provider,
      model: options.model,
      rowIndices,
    };

    return { metadata, rows, headerContext };
  }
}

import { ConfigurationError } from '@groweasy/shared';
import type { ColumnSemanticMetadata } from '@groweasy/shared';

import { PromptBuilder, promptBuilder } from './PromptBuilder.js';
import { buildSystemPrompt, type PromptVersion } from './systemPrompt.js';

export type { PromptVersion };

export interface PromptTemplate {
  version: PromptVersion;
  buildExtractionPrompt: (rows: Record<string, string>[], headerContext: ColumnSemanticMetadata[]) => string;
}

function createTemplate(version: PromptVersion): PromptTemplate {
  return {
    version,
    buildExtractionPrompt: (rows, headerContext) => {
      if (version === 'v1') {
        return promptBuilder.buildLegacy({ rows, headerContext });
      }
      return promptBuilder.build({ rows, headerContext, version });
    },
  };
}

const registry: Record<PromptVersion, PromptTemplate> = {
  v1: createTemplate('v1'),
  v2: createTemplate('v2'),
  experimental: createTemplate('experimental'),
};

export class PromptRegistry {
  static getSystemPrompt(version: PromptVersion = 'v2'): string {
    return buildSystemPrompt(version);
  }

  static get(version: PromptVersion): PromptTemplate {
    const template = registry[version];
    if (!template) {
      throw new ConfigurationError(`Unknown prompt version: ${version}`);
    }
    return template;
  }

  static listVersions(): PromptVersion[] {
    return Object.keys(registry) as PromptVersion[];
  }

  static getBuilder(): PromptBuilder {
    return promptBuilder;
  }
}

export { buildSystemPrompt, PromptBuilder, promptBuilder };

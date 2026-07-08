import { ConfigurationError } from '@groweasy/shared';

import { config } from '@/config/index.js';

import { ClaudeProvider } from './claude.provider.js';
import { DemoLLMProvider } from './demo.provider.js';
import { GeminiProvider } from './gemini.provider.js';
import { OpenAIProvider } from './openai.provider.js';
import { OpenRouterProvider } from './openrouter.provider.js';
import type { LLMProvider } from './types.js';

export function createLLMProvider(): LLMProvider {
  const llmConfig = config.llm;
  const timeoutMs = config.extraction.requestTimeoutMs;
  const maxRetries = config.extraction.maxRetries;

  switch (llmConfig.provider) {
    case 'anthropic': {
      if (!llmConfig.anthropic.apiKey) {
        throw new ConfigurationError('ANTHROPIC_API_KEY is required');
      }
      return new ClaudeProvider({
        apiKey: llmConfig.anthropic.apiKey,
        model: llmConfig.anthropic.model,
        maxRetries,
        timeoutMs,
      });
    }
    case 'openai': {
      if (!llmConfig.openai.apiKey) {
        throw new ConfigurationError('OPENAI_API_KEY is required');
      }
      return new OpenAIProvider({
        apiKey: llmConfig.openai.apiKey,
        model: llmConfig.openai.model,
        maxRetries,
        timeoutMs,
      });
    }
    case 'gemini': {
      if (!llmConfig.gemini.apiKey) {
        throw new ConfigurationError('GEMINI_API_KEY is required');
      }
      return new GeminiProvider({
        apiKey: llmConfig.gemini.apiKey,
        model: llmConfig.gemini.model,
        maxRetries,
        timeoutMs,
      });
    }
    case 'openrouter': {
      if (!llmConfig.openrouter.apiKey) {
        console.warn(
          '[groweasy] OPENROUTER_API_KEY is not set — using demo LLM. Add the key in Render Environment to enable Qwen.',
        );
        return new DemoLLMProvider();
      }
      const openRouterOptions = {
        apiKey: llmConfig.openrouter.apiKey,
        model: llmConfig.openrouter.model,
        baseUrl: llmConfig.openrouter.baseUrl,
        appName: llmConfig.openrouter.appName,
        maxRetries,
        timeoutMs,
      };
      if (llmConfig.openrouter.siteUrl !== undefined) {
        return new OpenRouterProvider({
          ...openRouterOptions,
          siteUrl: llmConfig.openrouter.siteUrl,
        });
      }
      return new OpenRouterProvider(openRouterOptions);
    }
    case 'mock':
      return new DemoLLMProvider();
    default: {
      const _exhaustive: never = llmConfig.provider;
      throw new ConfigurationError(`Unsupported LLM provider: ${String(_exhaustive)}`);
    }
  }
}

export { ClaudeProvider, DemoLLMProvider, OpenAIProvider, GeminiProvider, OpenRouterProvider };
export type { LLMProvider, LLMProviderOptions } from './types.js';

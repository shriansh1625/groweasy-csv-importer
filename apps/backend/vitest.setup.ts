process.env.NODE_ENV = 'test';
process.env.LLM_PROVIDER = 'anthropic';
process.env.ANTHROPIC_API_KEY = 'test-key';
process.env.PROMPT_VERSION = 'v2';

import { loadConfig, resetConfig } from '@groweasy/config';

resetConfig();
loadConfig({ force: true });

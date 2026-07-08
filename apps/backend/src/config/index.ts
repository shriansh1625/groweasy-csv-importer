import { loadConfig } from '@groweasy/config';

export function bootstrapConfig(): void {
  loadConfig();
}

export { config } from '@groweasy/config';

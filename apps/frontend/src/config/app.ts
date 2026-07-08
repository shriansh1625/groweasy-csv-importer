export const APP_NAME = 'GrowEasy CSV Importer';
export const GITHUB_URL = 'https://github.com/groweasy';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const API_ROUTES = {
  health: `${API_BASE_URL}/api/v1/health`,
  extract: `${API_BASE_URL}/api/v1/extract`,
  extractStart: `${API_BASE_URL}/api/v1/extract/start`,
  extractStatus: (importId: string) => `${API_BASE_URL}/api/v1/extract/${importId}/status`,
  extractResult: (importId: string) => `${API_BASE_URL}/api/v1/extract/${importId}/result`,
  extractEvents: (importId: string) => `${API_BASE_URL}/api/v1/extract/${importId}/events`,
  extractRetry: (importId: string) => `${API_BASE_URL}/api/v1/extract/${importId}/retry`,
  extractExport: (importId: string) => `${API_BASE_URL}/api/v1/extract/${importId}/export`,
} as const;

export const PREVIEW_ROW_LIMIT = 50;
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

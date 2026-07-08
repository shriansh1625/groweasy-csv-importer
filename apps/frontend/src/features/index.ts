/** Feature modules are isolated here — business logic added in Phase 2 */

export const FEATURES = {
  CSV_UPLOAD: 'csv-upload',
  AI_PROCESSING: 'ai-processing',
} as const;

export type FeatureName = (typeof FEATURES)[keyof typeof FEATURES];

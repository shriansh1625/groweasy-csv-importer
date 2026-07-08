import type { HealthRepository } from '@/types/repository.js';

export class InMemoryHealthRepository implements HealthRepository {
  async ping(): Promise<boolean> {
    return true;
  }
}

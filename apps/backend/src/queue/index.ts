/** Job queue abstraction — implementation added in Phase 2 */

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  payload: T;
  attempts: number;
  createdAt: string;
}

export interface Queue {
  enqueue<T>(name: string, payload: T): Promise<QueueJob<T>>;
  process<T>(name: string, handler: (job: QueueJob<T>) => Promise<void>): void;
}

export class InMemoryQueue implements Queue {
  private readonly jobs: QueueJob[] = [];

  async enqueue<T>(name: string, payload: T): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: crypto.randomUUID(),
      name,
      payload,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.push(job);
    return job;
  }

  process<T>(_name: string, _handler: (job: QueueJob<T>) => Promise<void>): void {
    // Worker registration — implemented in Phase 2
  }
}

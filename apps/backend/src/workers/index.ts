/** Background workers — implemented in Phase 2 */

export interface Worker {
  name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export class WorkerRegistry {
  private readonly workers = new Map<string, Worker>();

  register(worker: Worker): void {
    this.workers.set(worker.name, worker);
  }

  async startAll(): Promise<void> {
    await Promise.all([...this.workers.values()].map((w) => w.start()));
  }

  async stopAll(): Promise<void> {
    await Promise.all([...this.workers.values()].map((w) => w.stop()));
  }
}

export const workerRegistry = new WorkerRegistry();

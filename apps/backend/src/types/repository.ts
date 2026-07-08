export interface RepositoryResult<T> {
  data: T | null;
  error?: string;
}

export interface BaseRepository<T, CreateInput, UpdateInput = Partial<CreateInput>> {
  findById(id: string): Promise<RepositoryResult<T>>;
  findAll(): Promise<RepositoryResult<T[]>>;
  create(input: CreateInput): Promise<RepositoryResult<T>>;
  update(id: string, input: UpdateInput): Promise<RepositoryResult<T>>;
  delete(id: string): Promise<RepositoryResult<boolean>>;
}

export interface HealthRepository {
  ping(): Promise<boolean>;
}

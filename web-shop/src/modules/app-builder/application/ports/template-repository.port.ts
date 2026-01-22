import type { Result } from '@/shared/result/result';
import type { Template, TemplateSummary } from '../../domain/entities/template.entity';

export interface TemplateSearchFilter {
  readonly query?: string;
}

export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface TemplateRepositoryPort {
  create(template: Template): Promise<Result<Template, Error>>;

  update(template: Template): Promise<Result<Template, Error>>;

  delete(id: string): Promise<Result<void, Error>>;

  findById(id: string): Promise<Result<Template | null, Error>>;

  list(
    filter?: TemplateSearchFilter,
    pagination?: PaginationParams
  ): Promise<Result<TemplateSummary[], Error>>;
}

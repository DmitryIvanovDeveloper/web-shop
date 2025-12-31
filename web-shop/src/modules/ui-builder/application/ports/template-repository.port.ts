import type { Result } from '@/shared/result/result';
import type { Template } from '../../domain/entities/template.entity';

export interface TemplateSearchFilter {
  readonly query?: string;
}

export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface TemplateSummary {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly thumbnailUrl?: string;
  readonly updatedAt?: Date;
}

export interface TemplateRepositoryPort {
  create(template: Template): Promise<Result<Template, Error>>;

  update(template: Template): Promise<Result<Template, Error>>;

  delete(id: string): Promise<Result<void, Error>>;

  findById(id: string): Promise<Result<Template | null, Error>>;

  findByName(name: string): Promise<Result<Template | null, Error>>;

  list(
    filter?: TemplateSearchFilter,
    pagination?: PaginationParams
  ): Promise<Result<TemplateSummary[], Error>>;
}












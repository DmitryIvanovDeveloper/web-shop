import type { Result } from '@/shared/result/result';
import type { TemplateGrape, TemplateGrapeSummary } from '../../domain/entities/template-grape.entity';

export interface TemplateGrapeSearchFilter {
  readonly query?: string;
}

export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface TemplateGrapeRepositoryPort {
  create(template: TemplateGrape): Promise<Result<TemplateGrape, Error>>;

  update(template: TemplateGrape): Promise<Result<TemplateGrape, Error>>;

  delete(id: string): Promise<Result<void, Error>>;

  findById(id: string): Promise<Result<TemplateGrape | null, Error>>;

  list(
    filter?: TemplateGrapeSearchFilter,
    pagination?: PaginationParams
  ): Promise<Result<TemplateGrapeSummary[], Error>>;
}

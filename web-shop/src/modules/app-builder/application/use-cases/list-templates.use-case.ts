import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type {
  TemplateRepositoryPort,
  TemplateSummary,
  TemplateSearchFilter,
  PaginationParams,
} from '../ports/template-repository.port';

export interface ListTemplatesInput extends TemplateSearchFilter {
  pagination?: PaginationParams;
}

@injectable()
export class ListTemplatesUseCase {
  constructor(
    @inject(APP_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort
  ) {}

  public async execute(
    input: ListTemplatesInput = {}
  ): Promise<Result<TemplateSummary[], Error>> {
    try {
      const result = await this.templateRepository.list(
        { query: input.query },
        input.pagination
      );

      return result;
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

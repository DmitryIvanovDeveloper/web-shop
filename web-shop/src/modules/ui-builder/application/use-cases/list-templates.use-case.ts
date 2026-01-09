import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
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
    @inject(UI_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: ListTemplatesInput = {}): Promise<Result<TemplateSummary[], Error>> {
    this.logger.info('[ListTemplatesUseCase] Listing templates', {
      query: input.query,
      pagination: input.pagination,
    });

    try {
      const result = await this.templateRepository.list(
        { query: input.query },
        input.pagination
      );

      if (result.isFailure) {
        this.logger.error('[ListTemplatesUseCase] Failed to list templates', {
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      this.logger.error('[ListTemplatesUseCase] Unexpected error', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}













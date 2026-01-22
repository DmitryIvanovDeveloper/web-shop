import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type {
  TemplateGrapeRepositoryPort,
  TemplateGrapeSummary,
  TemplateGrapeSearchFilter,
  PaginationParams,
} from '../ports/template-grape-repository.port';

export interface ListTemplatesGrapeInput extends TemplateGrapeSearchFilter {
  pagination?: PaginationParams;
}

@injectable()
export class ListTemplatesGrapeUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateGrapeRepository)
    private readonly templateGrapeRepository: TemplateGrapeRepositoryPort
  ) {}

  public async execute(
    input: ListTemplatesGrapeInput = {}
  ): Promise<Result<TemplateGrapeSummary[], Error>> {
    try {
      const result = await this.templateGrapeRepository.list(
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

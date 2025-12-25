import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Template } from '../../domain/entities/template.entity';
import { TemplateNotFoundError } from '../../domain/errors/template.error';
import type { TemplateRepositoryPort } from '../ports/template-repository.port';

export interface GetTemplateDetailsInput {
  id: string;
}

@injectable()
export class GetTemplateDetailsUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: GetTemplateDetailsInput): Promise<Result<Template, Error>> {
    this.logger.info('[GetTemplateDetailsUseCase] Loading template details', { id: input.id });

    if (!input.id) {
      return Result.error(new TemplateNotFoundError(''));
    }

    try {
      const result = await this.templateRepository.findById(input.id);
      if (result.isFailure || !result.value) {
        const error =
          result.error ??
          new TemplateNotFoundError(input.id);
        this.logger.warn('[GetTemplateDetailsUseCase] Template not found', {
          id: input.id,
          error,
        });
        return Result.error(error);
      }

      return Result.ok(result.value);
    } catch (error) {
      this.logger.error('[GetTemplateDetailsUseCase] Unexpected error', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}







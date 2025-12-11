import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import { TemplateNotFoundError } from '../../domain/errors/template.error';
import type { TemplateRepositoryPort } from '../ports/template-repository.port';

export interface DeleteTemplateInput {
  id: string;
}

@injectable()
export class DeleteTemplateUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: DeleteTemplateInput): Promise<Result<void, Error>> {
    this.logger.info('[DeleteTemplateUseCase] Deleting template', { id: input.id });

    if (!input.id) {
      return Result.error(new TemplateNotFoundError(''));
    }

    try {
      const existingResult = await this.templateRepository.findById(input.id);
      if (existingResult.isFailure || !existingResult.value) {
        const error =
          existingResult.error ??
          new TemplateNotFoundError(input.id);
        this.logger.warn('[DeleteTemplateUseCase] Template not found', {
          id: input.id,
          error,
        });
        return Result.error(error);
      }

      const deleteResult = await this.templateRepository.delete(input.id);
      if (deleteResult.isFailure) {
        this.logger.error('[DeleteTemplateUseCase] Failed to delete template', {
          id: input.id,
          error: deleteResult.error,
        });
        return Result.error(deleteResult.error ?? new Error('Failed to delete template'));
      }

      this.logger.info('[DeleteTemplateUseCase] Template deleted', { id: input.id });
      return deleteResult;
    } catch (error) {
      this.logger.error('[DeleteTemplateUseCase] Unexpected error', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}



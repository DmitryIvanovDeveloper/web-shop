import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
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
    private readonly templateRepository: TemplateRepositoryPort
  ) {}

  public async execute(input: DeleteTemplateInput): Promise<Result<void, Error>> {
    if (!input.id) {
      return Result.error(new TemplateNotFoundError(''));
    }

    try {
      const existingResult = await this.templateRepository.findById(input.id);
      if (existingResult.isFailure || !existingResult.value) {
        const error =
          existingResult.error ??
          new TemplateNotFoundError(input.id);
        return Result.error(error);
      }

      const deleteResult = await this.templateRepository.delete(input.id);
      if (deleteResult.isFailure) {
        return Result.error(deleteResult.error ?? new Error('Failed to delete template'));
      }

      return deleteResult;
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}














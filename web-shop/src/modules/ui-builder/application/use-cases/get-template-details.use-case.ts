import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
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
    private readonly templateRepository: TemplateRepositoryPort
  ) {}

  public async execute(input: GetTemplateDetailsInput): Promise<Result<Template, Error>> {
    if (!input.id) {
      return Result.error(new TemplateNotFoundError(''));
    }

    try {
      const result = await this.templateRepository.findById(input.id);
      if (result.isFailure || !result.value) {
        const error =
          result.error ??
          new TemplateNotFoundError(input.id);
        return Result.error(error);
      }

      return Result.ok(result.value);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}


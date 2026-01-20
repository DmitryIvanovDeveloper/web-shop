import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Template } from '../../domain/entities/template.entity';
import { TemplateNotFoundError } from '../../domain/errors/template.error';
import type { TemplateRepositoryPort } from '../ports/template-repository.port';

export interface PublishTemplateInput {
  templateId: string;
}

@injectable()
export class PublishTemplateUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort
  ) {}

  public async execute(input: PublishTemplateInput): Promise<Result<Template, Error>> {
    try {
      const existingResult = await this.templateRepository.findById(input.templateId);
      if (existingResult.isFailure || !existingResult.value) {
        const error =
          existingResult.error ??
          new TemplateNotFoundError(input.templateId);
        return Result.error(error);
      }

      const existing = existingResult.value;
      const updated: Template = {
        ...existing,
        isActive: true,
        published: true,
        updatedAt: new Date(),
      };

      const updateResult = await this.templateRepository.update(updated);
      if (updateResult.isFailure) {
        return Result.error(updateResult.error ?? new Error('Failed to publish template'));
      }

      return updateResult;
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}


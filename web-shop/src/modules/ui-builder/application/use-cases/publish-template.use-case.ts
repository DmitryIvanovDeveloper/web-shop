import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
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
    private readonly templateRepository: TemplateRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: PublishTemplateInput): Promise<Result<Template, Error>> {
    this.logger.info('[PublishTemplateUseCase] Publishing template', {
      templateId: input.templateId,
    });

    try {
      const existingResult = await this.templateRepository.findById(input.templateId);
      if (existingResult.isFailure || !existingResult.value) {
        const error =
          existingResult.error ??
          new TemplateNotFoundError(input.templateId);
        this.logger.warn('[PublishTemplateUseCase] Template not found', {
          templateId: input.templateId,
          error,
        });
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
        this.logger.error('[PublishTemplateUseCase] Failed to mark template as published', {
          templateId: input.templateId,
          error: updateResult.error,
        });
        return Result.error(updateResult.error ?? new Error('Failed to publish template'));
      }

      this.logger.info('[PublishTemplateUseCase] Template published', {
        templateId: updateResult.value?.id,
        name: updateResult.value?.name,
      });
      return updateResult;
    } catch (error) {
      this.logger.error('[PublishTemplateUseCase] Unexpected error', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}



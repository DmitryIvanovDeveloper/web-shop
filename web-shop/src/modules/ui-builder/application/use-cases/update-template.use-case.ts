import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Template } from '../../domain/entities/template.entity';
import {
  TemplateNotFoundError,
  TemplateValidationError,
  TemplateNameAlreadyExistsError,
} from '../../domain/errors/template.error';
import type { TemplateRepositoryPort } from '../ports/template-repository.port';

export interface UpdateTemplateInput {
  id: string;
  name?: string;
  description?: string;
  appConfig?: unknown;
  pages?: Template['pages'];
  createdBy?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

@injectable()
export class UpdateTemplateUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: UpdateTemplateInput): Promise<Result<Template, Error>> {
    this.logger.info('[UpdateTemplateUseCase] Updating template', { id: input.id });

    if (!input.id) {
      return Result.error(new TemplateValidationError('Template id is required'));
    }

    try {
      const existingResult = await this.templateRepository.findById(input.id);
      if (existingResult.isFailure || !existingResult.value) {
        const error =
          existingResult.error ??
          new TemplateNotFoundError(input.id);
        this.logger.warn('[UpdateTemplateUseCase] Template not found', {
          id: input.id,
          error,
        });
        return Result.error(error);
      }

      const existing = existingResult.value;

      // If name changed, ensure uniqueness
      if (input.name && input.name.trim() !== existing.name) {
        const byName = await this.templateRepository.findByName(input.name.trim());
        if (byName.isSuccess && byName.value && byName.value.id !== existing.id) {
          const error = new TemplateNameAlreadyExistsError(input.name.trim());
          this.logger.warn('[UpdateTemplateUseCase] New name already used', {
            id: input.id,
            name: input.name,
          });
          return Result.error(error);
        }
      }

      const updated: Template = {
        ...existing,
        name: input.name?.trim() ?? existing.name,
        appConfig: input.appConfig ?? existing.appConfig,
        pages: input.pages ?? existing.pages,
        isActive: input.isActive ?? existing.isActive,
        metadata: {
          ...(existing.metadata ?? {}),
          description: input.description ?? existing.metadata?.description,
          createdBy: input.createdBy ?? existing.metadata?.createdBy,
          previewImageUrl: input.thumbnailUrl ?? existing.metadata?.previewImageUrl,
          category: input.category ?? existing.metadata?.category,
          tags: input.tags ?? existing.metadata?.tags,
        },
        updatedAt: new Date(),
      };

      const validationError = this.validateTemplate(updated);
      if (validationError) {
        this.logger.warn('[UpdateTemplateUseCase] Validation failed', {
          id: input.id,
          error: validationError,
        });
        return Result.error(validationError);
      }

      const saveResult = await this.templateRepository.update(updated);
      if (saveResult.isFailure) {
        this.logger.error('[UpdateTemplateUseCase] Failed to persist template', {
          id: input.id,
          error: saveResult.error,
        });
        return Result.error(saveResult.error ?? new Error('Failed to update template'));
      }

      this.logger.info('[UpdateTemplateUseCase] Template updated', {
        id: saveResult.value?.id,
        name: saveResult.value?.name,
      });
      return saveResult;
    } catch (error) {
      this.logger.error('[UpdateTemplateUseCase] Unexpected error', { error });
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private validateTemplate(template: Template): TemplateValidationError | null {
    const details: string[] = [];

    if (!template.name || !template.name.trim()) {
      details.push('Name is required');
    }

    if (!template.appConfig) {
      details.push('appConfig is required');
    }

    if (!Array.isArray(template.pages) || template.pages.length === 0) {
      details.push('At least one page is required');
    } else {
      const slugs = new Set<string>();
      for (const page of template.pages) {
        if (!page.pageSlug || !page.pageSlug.trim()) {
          details.push('Each page must have a non-empty pageSlug');
          break;
        }
        if (slugs.has(page.pageSlug)) {
          details.push(`Duplicate pageSlug: ${page.pageSlug}`);
          break;
        }
        slugs.add(page.pageSlug);
      }
    }

    if (details.length > 0) {
      return new TemplateValidationError('Invalid template input', details);
    }

    return null;
  }
}












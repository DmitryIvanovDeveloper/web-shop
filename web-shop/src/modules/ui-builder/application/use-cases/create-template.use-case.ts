import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { Template, TemplatePageSnapshot, TemplateMetadata } from '../../domain/entities/template.entity';
import {
  TemplateNameAlreadyExistsError,
  TemplateValidationError,
} from '../../domain/errors/template.error';
import type { TemplateRepositoryPort } from '../ports/template-repository.port';
import { generateUuid } from '../../shared/utils/id-generator';

export interface CreateTemplateInput {
  name: string;
  description?: string;
  appConfig: unknown;
  pages: TemplatePageSnapshot[];
  createdBy?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
}

@injectable()
export class CreateTemplateUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort
  ) {}

  public async execute(input: CreateTemplateInput): Promise<Result<Template, Error>> {
    const validationError = this.validateInput(input);
    if (validationError) {
      return Result.error(validationError);
    }

    try {
      const existingByName = await this.templateRepository.findByName(input.name);
      if (existingByName.isSuccess && existingByName.value) {
        const error = new TemplateNameAlreadyExistsError(input.name);
        return Result.error(error);
      }

      const metadata: TemplateMetadata = {
        description: input.description,
        createdBy: input.createdBy,
        previewImageUrl: input.thumbnailUrl,
        category: input.category,
        tags: input.tags,
      };

      const template: Template = {
        id: generateUuid(),
        name: input.name.trim(),
        appConfig: input.appConfig,
        pages: input.pages,
        metadata,
        isActive: false,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createResult = await this.templateRepository.create(template);
      if (createResult.isFailure) {
        return Result.error(createResult.error ?? new Error('Failed to create template'));
      }

      return createResult;
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private validateInput(input: CreateTemplateInput): TemplateValidationError | null {
    const details: string[] = [];

    if (!input.name || !input.name.trim()) {
      details.push('Name is required');
    }

    if (!input.appConfig) {
      details.push('appConfig is required');
    }

    if (!Array.isArray(input.pages) || input.pages.length === 0) {
      details.push('At least one page is required');
    } else {
      const slugs = new Set<string>();
      for (const page of input.pages) {
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


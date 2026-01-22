import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { APP_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { TemplateRepositoryPort } from '../ports/template-repository.port';
import type { Template } from '../../domain/entities/template.entity';

export interface GetTemplateDetailsInput {
  id: string;
}

@injectable()
export class GetTemplateDetailsUseCase {
  constructor(
    @inject(APP_BUILDER_TYPES.TemplateRepository)
    private readonly templateRepository: TemplateRepositoryPort
  ) {}

  public async execute(
    input: GetTemplateDetailsInput
  ): Promise<Result<Template | null, Error>> {
    try {
      return await this.templateRepository.findById(input.id);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

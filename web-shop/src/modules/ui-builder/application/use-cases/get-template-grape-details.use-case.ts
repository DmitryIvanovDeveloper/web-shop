import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { TemplateGrapeRepositoryPort } from '../ports/template-grape-repository.port';
import type { TemplateGrape } from '../../domain/entities/template-grape.entity';

export interface GetTemplateGrapeDetailsInput {
  id: string;
}

@injectable()
export class GetTemplateGrapeDetailsUseCase {
  constructor(
    @inject(UI_BUILDER_TYPES.TemplateGrapeRepository)
    private readonly templateGrapeRepository: TemplateGrapeRepositoryPort
  ) {}

  public async execute(
    input: GetTemplateGrapeDetailsInput
  ): Promise<Result<TemplateGrape | null, Error>> {
    try {
      return await this.templateGrapeRepository.findById(input.id);
    } catch (error) {
      return Result.error(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }
}

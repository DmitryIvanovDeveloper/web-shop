import { injectable, inject } from 'inversify';
import type { Result } from '../../../../../../shared/domain/result/result';
import { TYPES } from '../../infrastructure/bootstrap/realtime-dashboard.types';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';
import type { FilterPresetRepositoryPort } from '../ports/filter-preset-repository.port';

@injectable()
export class LoadPresetsUseCase {
  constructor(
    @inject(TYPES.FilterPresetRepository)
    private readonly filterPresetRepository: FilterPresetRepositoryPort
  ) {}

  public async execute(): Promise<Result<FilterPreset[], Error>> {
    return this.filterPresetRepository.findAll();
  }

  public async executeById(presetId: string): Promise<Result<FilterPreset, Error>> {
    return this.filterPresetRepository.findById(presetId);
  }
}


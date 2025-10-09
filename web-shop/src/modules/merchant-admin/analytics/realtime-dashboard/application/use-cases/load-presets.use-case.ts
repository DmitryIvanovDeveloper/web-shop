import { Result } from '../../../../../../shared/domain/result/result';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';
import { FilterPresetRepositoryPort } from '../ports/filter-preset-repository.port';

export class LoadPresetsUseCase {
  constructor(private readonly filterPresetRepository: FilterPresetRepositoryPort) {}

  public async execute(): Promise<Result<FilterPreset[], Error>> {
    return this.filterPresetRepository.findAll();
  }

  public async executeById(presetId: string): Promise<Result<FilterPreset, Error>> {
    return this.filterPresetRepository.findById(presetId);
  }
}



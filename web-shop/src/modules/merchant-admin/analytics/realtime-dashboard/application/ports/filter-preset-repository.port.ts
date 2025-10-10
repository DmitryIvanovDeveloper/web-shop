import { Result } from '../../../../../../shared/domain/result/result';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';

export interface FilterPresetRepositoryPort {
  findAll(): Promise<Result<FilterPreset[], Error>>;
  findById(id: string): Promise<Result<FilterPreset, Error>>;
  save(preset: FilterPreset): Promise<Result<FilterPreset, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}



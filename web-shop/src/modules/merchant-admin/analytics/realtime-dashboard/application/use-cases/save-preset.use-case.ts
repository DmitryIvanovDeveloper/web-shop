import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { FilterPresetRepositoryPort } from '../ports/filter-preset-repository.port';

export interface SavePresetInput {
  id?: string;
  name: string;
  filterSet: FilterSet;
}

export class SavePresetUseCase {
  constructor(private readonly filterPresetRepository: FilterPresetRepositoryPort) {}

  private generateId(): string {
    // Use crypto.randomUUID() in browser, fallback for Node.js
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: generate UUID v4 manually
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public async execute(input: SavePresetInput): Promise<Result<FilterPreset, Error>> {
    if (!input.name || input.name.trim() === '') {
      return new Failure(new InvalidArgumentError('Preset name is required'));
    }

    if (input.name.length > 100) {
      return new Failure(new InvalidArgumentError('Preset name must not exceed 100 characters'));
    }

    const preset = input.id
      ? FilterPreset.restore({
          id: input.id,
          name: input.name,
          filterSet: input.filterSet,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      : FilterPreset.create({
          id: this.generateId(),
          name: input.name,
          filterSet: input.filterSet,
        });

    return this.filterPresetRepository.save(preset);
  }
}


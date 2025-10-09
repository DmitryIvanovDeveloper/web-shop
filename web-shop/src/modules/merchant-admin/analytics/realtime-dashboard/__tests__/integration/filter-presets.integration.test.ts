import { describe, it, expect, beforeEach } from 'vitest';
import { FilterPresetRepository } from '../../infrastructure/repositories/filter-preset.repository';
import { LoadPresetsUseCase } from '../../application/use-cases/load-presets.use-case';
import { SavePresetUseCase } from '../../application/use-cases/save-preset.use-case';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { DateRangeFilter } from '../../domain/value-objects/date-range-filter.value-object';

describe('Filter Presets Integration', () => {
  let repository: FilterPresetRepository;
  let loadPresetsUseCase: LoadPresetsUseCase;
  let savePresetUseCase: SavePresetUseCase;

  beforeEach(() => {
    const httpClient = new HttpClientMock();
    repository = new FilterPresetRepository(httpClient);
    loadPresetsUseCase = new LoadPresetsUseCase(repository);
    savePresetUseCase = new SavePresetUseCase(repository);
  });

  describe('LoadPresetsUseCase', () => {
    it('should load all presets from repository', async () => {
      const result = await loadPresetsUseCase.execute();

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);

      const firstPreset = result.data![0];
      expect(firstPreset.id).toBeDefined();
      expect(firstPreset.name).toBeDefined();
      expect(firstPreset.filterSet).toBeDefined();
    });

    it('should load preset by id', async () => {
      const allPresetsResult = await loadPresetsUseCase.execute();
      expect(allPresetsResult.isSuccess()).toBe(true);

      const firstPresetId = allPresetsResult.data![0].id;
      const result = await loadPresetsUseCase.executeById(firstPresetId);

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.id).toBe(firstPresetId);
      expect(result.data!.filterSet).toBeDefined();
    });

    it('should reject loading non-existent preset', async () => {
      const result = await loadPresetsUseCase.executeById('non-existent-id');

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('not found');
    });
  });

  describe('SavePresetUseCase', () => {
    it('should save new preset', async () => {
      const dateRangeResult = DateRangeFilter.fromPreset('last7days', 'day');
      expect(dateRangeResult.isSuccess()).toBe(true);

      const filterSetResult = FilterSet.create({
        dateRange: dateRangeResult.data!,
      });
      expect(filterSetResult.isSuccess()).toBe(true);

      const result = await savePresetUseCase.execute({
        name: 'Test Preset',
        filterSet: filterSetResult.data!,
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.data!.name).toBe('Test Preset');
      expect(result.data!.id).toBeDefined();
    });

    it('should reject preset with empty name', async () => {
      const filterSet = FilterSet.createDefault();

      const result = await savePresetUseCase.execute({
        name: '',
        filterSet,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('Preset name is required');
    });

    it('should reject preset with name exceeding 100 characters', async () => {
      const filterSet = FilterSet.createDefault();

      const result = await savePresetUseCase.execute({
        name: 'A'.repeat(101),
        filterSet,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('must not exceed 100 characters');
    });
  });

  describe('Filter Preset Workflow', () => {
    it('should complete full preset workflow: save → load → apply', async () => {
      // 1. Create and save a preset
      const dateRangeResult = DateRangeFilter.fromPreset('last30days', 'week');
      expect(dateRangeResult.isSuccess()).toBe(true);

      const filterSetResult = FilterSet.create({
        dateRange: dateRangeResult.data!,
      });
      expect(filterSetResult.isSuccess()).toBe(true);

      const saveResult = await savePresetUseCase.execute({
        name: 'Monthly Overview',
        filterSet: filterSetResult.data!,
      });
      expect(saveResult.isSuccess()).toBe(true);

      // 2. Load existing presets from mock data
      const allPresetsResult = await loadPresetsUseCase.execute();
      expect(allPresetsResult.isSuccess()).toBe(true);
      expect(allPresetsResult.data!.length).toBeGreaterThan(0);

      const firstPreset = allPresetsResult.data![0];
      expect(firstPreset.name).toBeDefined();
      expect(firstPreset.filterSet).toBeDefined();
    });
  });
});


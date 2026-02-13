import { injectable, inject } from 'inversify';
import { Result } from '@/shared/result/result';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';
import { FilterPresetRepositoryPort } from '../../application/ports/filter-preset-repository.port';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { DateRangeFilter } from '../../domain/value-objects/date-range-filter.value-object';
import { GeoFilter } from '../../domain/value-objects/geo-filter.value-object';
import { PaymentFilter } from '../../domain/value-objects/payment-filter.value-object';
import { SourceFilter } from '../../domain/value-objects/source-filter.value-object';
import { CurrencyFilter } from '../../domain/value-objects/currency-filter.value-object';
import type { HttpClient } from '@/application/ports/http-client.port';
import { ROOT_TYPES } from '@/infrastructure/bootstrap/types';

interface PresetDTO {
  id: string;
  name: string;
  filterSet: {
    dateRange: {
      preset: string;
      granularity: string;
      from?: string;
      to?: string;
    };
    geo: {
      countries: string[];
    };
    payment: {
      methods: string[];
    };
    source: {
      sources: string[];
    };
    currency: {
      currency: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export class FilterPresetRepository implements FilterPresetRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  public async findAll(): Promise<Result<FilterPreset[], Error>> {
    const response = await this.httpClient.get<{ presets: PresetDTO[] }>('/api/filters/presets');

    if (response.status !== 200) {
      return Result.error(new Error(`Failed to load presets: ${response.statusText}`));
    }

    try {
      const presets = response.data.presets.map((dto) => this.mapDTOToEntity(dto));
      return Result.ok(presets);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  public async findById(id: string): Promise<Result<FilterPreset, Error>> {
    const allPresetsResult = await this.findAll();

    if (allPresetsResult.isFailure) {
      return Result.error(allPresetsResult.error!);
    }

    const preset = allPresetsResult.value!.find((p) => p.id === id);
    if (!preset) {
      return Result.error(new Error(`Preset with id ${id} not found`));
    }

    return Result.ok(preset);
  }

  public async save(preset: FilterPreset): Promise<Result<FilterPreset, Error>> {

    return Result.ok(preset);
  }

  public async delete(id: string): Promise<Result<void, Error>> {

    return Result.ok(undefined);
  }

  private mapDTOToEntity(dto: any): FilterPreset {
    
    const dateRangeResult = DateRangeFilter.fromQueryParams({
      dateRange: dto.filterSet.dateRange.preset,
      granularity: dto.filterSet.dateRange.granularity,
      from: dto.filterSet.dateRange.from || '',
      to: dto.filterSet.dateRange.to || '',
    });

    if (dateRangeResult.isFailure) {
      throw new Error(`Invalid date range in preset: ${dateRangeResult.error!.message}`);
    }

    const geoResult =
      dto.filterSet.geo.countries.length > 0
        ? GeoFilter.create({ countries: dto.filterSet.geo.countries })
        : Result.ok(GeoFilter.createEmpty());

    if (geoResult.isFailure) {
      throw new Error(`Invalid geo filter in preset: ${geoResult.error!.message}`);
    }

    const paymentResult =
      dto.filterSet.payment.methods.length > 0
        ? PaymentFilter.create({ methods: dto.filterSet.payment.methods as any[] })
        : Result.ok(PaymentFilter.createEmpty());

    if (paymentResult.isFailure) {
      throw new Error(`Invalid payment filter in preset: ${paymentResult.error!.message}`);
    }

    const sourceResult =
      dto.filterSet.source.sources.length > 0
        ? SourceFilter.create({ sources: dto.filterSet.source.sources as any[] })
        : Result.ok(SourceFilter.createEmpty());

    if (sourceResult.isFailure) {
      throw new Error(`Invalid source filter in preset: ${sourceResult.error!.message}`);
    }

    const currencyResult = CurrencyFilter.create({ currency: dto.filterSet.currency.currency as any });

    if (currencyResult.isFailure) {
      throw new Error(`Invalid currency filter in preset: ${currencyResult.error!.message}`);
    }

    const filterSetResult = FilterSet.create({
      dateRange: dateRangeResult.value!,
      geo: geoResult.value!,
      payment: paymentResult.value!,
      source: sourceResult.value!,
      currency: currencyResult.value!,
    });

    if (filterSetResult.isFailure) {
      throw new Error(`Invalid filter set in preset: ${filterSetResult.error!.message}`);
    }

    return FilterPreset.restore({
      id: dto.id,
      name: dto.name,
      filterSet: filterSetResult.value!,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }
}

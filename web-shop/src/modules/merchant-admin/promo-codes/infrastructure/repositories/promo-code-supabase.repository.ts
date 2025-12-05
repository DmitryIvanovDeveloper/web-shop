import { inject, injectable } from 'inversify';
import type { Logger } from '../../../../../application/ports/logger.port';
import type { HttpClient } from '../../../../../application/ports/http-client.port';
import { ROOT_TYPES, TYPES } from '../../../../../infrastructure/bootstrap/types';
import { Result } from '../../../../../shared/domain/result/result';
import type {
  PaginatedResult,
  PaginationParams,
  PromoCodeRepositoryPort,
  PromoCodeSearchFilter,
} from '../../application/ports/promo-code-repository.port';
import { PromoCode } from '../../domain/entities/promo-code.entity';

interface PromoCodeDto {
  id: string;
  appId: string;
  campaignId: string | null;
  code: string;
  name: string;
  description: string | null;
  discountType: 'percent' | 'fixed_amount';
  discountValue: number;
  currency: string | null;
  isFreeShipping: boolean;
  startAt: string | null;
  endAt: string | null;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number | null;
  priority: number;
  isExclusive: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface PromoCodesListResponse {
  items: PromoCodeDto[];
  total: number;
}

interface SavePromoCodeRequest {
  appId: string;
  promoCode: PromoCodeDto;
}

const mapDtoToEntity = (dto: PromoCodeDto): Result<PromoCode, Error> => {
  return PromoCode.create({
    id: dto.id,
    appId: dto.appId,
    campaignId: dto.campaignId,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    discountType: dto.discountType,
    discountValue: dto.discountValue,
    currency: dto.currency,
    isFreeShipping: dto.isFreeShipping,
    startAt: dto.startAt,
    endAt: dto.endAt,
    maxRedemptions: dto.maxRedemptions,
    maxRedemptionsPerUser: dto.maxRedemptionsPerUser,
    priority: dto.priority,
    isExclusive: dto.isExclusive,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  });
};

const mapEntityToDto = (entity: PromoCode): PromoCodeDto => {
  return {
    id: entity.id,
    appId: entity.appId,
    campaignId: entity.campaignId,
    code: entity.code,
    name: entity.name,
    description: entity.description,
    discountType: entity.discountType,
    discountValue: entity.discountValue,
    currency: entity.currency,
    isFreeShipping: entity.isFreeShipping,
    startAt: entity.startAt,
    endAt: entity.endAt,
    maxRedemptions: entity.maxRedemptions,
    maxRedemptionsPerUser: entity.maxRedemptionsPerUser,
    priority: entity.priority,
    isExclusive: entity.isExclusive,
    isActive: entity.isActive,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

@injectable()
export class PromoCodeSupabaseRepository implements PromoCodeRepositoryPort {
  public constructor(
    @inject(TYPES.HttpClient)
    private readonly httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async findById(id: string): Promise<Result<PromoCode | null, Error>> {
    try {
      const response = await this.httpClient.get<PromoCodeDto | null>(
        `/api/merchant-admin/promo-codes/by-id?id=${encodeURIComponent(id)}`
      );

      if (response.status === 404) {
        return Result.ok(null);
      }

      if (response.status !== 200) {
        this.logger.error('[PromoCodeSupabaseRepository] findById error', {
          status: response.status,
          statusText: response.statusText,
          id,
        });
        return Result.error(new Error(`Failed to load promo code: ${response.statusText}`));
      }

      const dto = response.data;
      if (!dto) {
        return Result.ok(null);
      }

      const entityResult = mapDtoToEntity(dto);
      if (entityResult.isFailure()) {
        return Result.error(entityResult.error!);
      }

      return Result.ok(entityResult.data!);
    } catch (error) {
      this.logger.error('[PromoCodeSupabaseRepository] findById unexpected error', { error, id });
      return Result.error(error as Error);
    }
  }

  public async findByCode(appId: string, code: string): Promise<Result<PromoCode | null, Error>> {
    try {
      const normalized = code.trim();
      const response = await this.httpClient.get<PromoCodeDto | null>(
        `/api/merchant-admin/promo-codes/by-code?appId=${encodeURIComponent(
          appId
        )}&code=${encodeURIComponent(normalized)}`
      );

      if (response.status === 404) {
        return Result.ok(null);
      }

      if (response.status !== 200) {
        this.logger.error('[PromoCodeSupabaseRepository] findByCode error', {
          status: response.status,
          statusText: response.statusText,
          appId,
          code: normalized,
        });
        return Result.error(new Error(`Failed to load promo code: ${response.statusText}`));
      }

      const dto = response.data;
      if (!dto) {
        return Result.ok(null);
      }

      const entityResult = mapDtoToEntity(dto);
      if (entityResult.isFailure()) {
        return Result.error(entityResult.error!);
      }

      return Result.ok(entityResult.data!);
    } catch (error) {
      this.logger.error('[PromoCodeSupabaseRepository] findByCode unexpected error', {
        error,
        appId,
        code,
      });
      return Result.error(error as Error);
    }
  }

  public async existsByCode(appId: string, code: string): Promise<Result<boolean, Error>> {
    const foundResult = await this.findByCode(appId, code);
    if (foundResult.isFailure()) {
      return Result.error(foundResult.error!);
    }

    return Result.ok(!!foundResult.data);
  }

  public async search(
    filter: PromoCodeSearchFilter,
    pagination: PaginationParams
  ): Promise<Result<PaginatedResult<PromoCode>, Error>> {
    try {
      const params = new URLSearchParams();
      params.set('appId', filter.appId);
      params.set('page', String(pagination.page));
      params.set('pageSize', String(pagination.pageSize));
      if (filter.campaignId) {
        params.set('campaignId', filter.campaignId);
      }
      if (filter.discountType) {
        params.set('discountType', filter.discountType);
      }
      if (filter.status) {
        params.set('status', filter.status);
      }
      if (filter.query) {
        params.set('query', filter.query);
      }

      const response = await this.httpClient.get<PromoCodesListResponse>(
        `/api/merchant-admin/promo-codes?${params.toString()}`
      );

      if (response.status !== 200) {
        this.logger.error('[PromoCodeSupabaseRepository] search error', {
          status: response.status,
          statusText: response.statusText,
          filter,
          pagination,
        });
        return Result.error(new Error(`Failed to load promo codes: ${response.statusText}`));
      }

      const payload = response.data;
      if (!payload) {
        return Result.ok({
          items: [],
          total: 0,
        });
      }

      const rows = payload.items ?? [];
      const items: PromoCode[] = [];

      for (const row of rows) {
        const entityResult = mapDtoToEntity(row);
        if (entityResult.isFailure()) {
          this.logger.error('[PromoCodeSupabaseRepository] Failed to map promo code DTO', {
            error: entityResult.error,
            row,
          });
          continue;
        }
        items.push(entityResult.data!);
      }

      return Result.ok({
        items,
        total: payload.total ?? items.length,
      });
    } catch (error) {
      this.logger.error('[PromoCodeSupabaseRepository] search unexpected error', {
        error,
        filter,
        pagination,
      });
      return Result.error(error as Error);
    }
  }

  public async save(promoCode: PromoCode): Promise<Result<PromoCode, Error>> {
    try {
      const dto = mapEntityToDto(promoCode);
      const payload: SavePromoCodeRequest = {
        appId: promoCode.appId,
        promoCode: dto,
      };

      const response = await this.httpClient.post<PromoCodeDto>(
        '/api/merchant-admin/promo-codes',
        payload
      );

      if (response.status !== 200 && response.status !== 201) {
        this.logger.error('[PromoCodeSupabaseRepository] save error', {
          status: response.status,
          statusText: response.statusText,
          promoCodeId: promoCode.id,
        });
        return Result.error(new Error(`Failed to create promo code: ${response.statusText}`));
      }

      const createdDto = response.data;
      if (!createdDto) {
        return Result.error(new Error('Invalid promo code API response'));
      }

      const entityResult = mapDtoToEntity(createdDto);
      if (entityResult.isFailure()) {
        return Result.error(entityResult.error!);
      }

      return Result.ok(entityResult.data!);
    } catch (error) {
      this.logger.error('[PromoCodeSupabaseRepository] save unexpected error', { error, promoCodeId: promoCode.id });
      return Result.error(error as Error);
    }
  }

  public async update(promoCode: PromoCode): Promise<Result<PromoCode, Error>> {
    try {
      const dto = mapEntityToDto(promoCode);
      const payload: SavePromoCodeRequest = {
        appId: promoCode.appId,
        promoCode: dto,
      };

      const response = await this.httpClient.put<PromoCodeDto>(
        '/api/merchant-admin/promo-codes',
        payload
      );

      if (response.status !== 200) {
        this.logger.error('[PromoCodeSupabaseRepository] update error', {
          status: response.status,
          statusText: response.statusText,
          promoCodeId: promoCode.id,
        });
        return Result.error(new Error(`Failed to update promo code: ${response.statusText}`));
      }

      const updatedDto = response.data;
      if (!updatedDto) {
        return Result.error(new Error('Invalid promo code API response'));
      }

      const entityResult = mapDtoToEntity(updatedDto);
      if (entityResult.isFailure()) {
        return Result.error(entityResult.error!);
      }

      return Result.ok(entityResult.data!);
    } catch (error) {
      this.logger.error('[PromoCodeSupabaseRepository] update unexpected error', { error, promoCodeId: promoCode.id });
      return Result.error(error as Error);
    }
  }
}



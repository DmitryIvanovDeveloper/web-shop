import type { Result } from '@/shared/result/result';
import type { PromoCode } from '../../domain/entities/promo-code.entity';

export interface PromoCodeSearchFilter {
  readonly appId: string;
  readonly status?: 'active' | 'expired' | 'upcoming';
  readonly campaignId?: string;
  readonly ownerType?: string;
  readonly discountType?: 'percent' | 'fixed_amount';
  readonly query?: string;
}

export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
}

export interface PromoCodeRepositoryPort {
  findById(id: string): Promise<Result<PromoCode | null, Error>>;

  findByCode(appId: string, code: string): Promise<Result<PromoCode | null, Error>>;

  existsByCode(appId: string, code: string): Promise<Result<boolean, Error>>;

  search(
    filter: PromoCodeSearchFilter,
    pagination: PaginationParams
  ): Promise<Result<PaginatedResult<PromoCode>, Error>>;

  save(promoCode: PromoCode): Promise<Result<PromoCode, Error>>;

  update(promoCode: PromoCode): Promise<Result<PromoCode, Error>>;
}






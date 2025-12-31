import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type {
  PaginatedResult,
  PromoCodeRepositoryPort,
  PromoCodeSearchFilter,
  PaginationParams,
} from '../ports/promo-code-repository.port';
import type { PromoCode } from '../../domain/entities/promo-code.entity';
import { PROMO_CODE_TYPES } from '../../infrastructure/bootstrap/promo-codes.types';

export interface ListPromoCodesInput extends Omit<PromoCodeSearchFilter, 'appId'> {
  appId: string;
  pagination: PaginationParams;
}

@injectable()
export class ListPromoCodesUseCase {
  public constructor(
    @inject(PROMO_CODE_TYPES.PromoCodeRepository)
    private readonly promoCodeRepository: PromoCodeRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: ListPromoCodesInput): Promise<Result<PaginatedResult<PromoCode>, Error>> {
    const { appId, pagination, ...filter } = input;

    this.logger.info('[ListPromoCodesUseCase] Listing promo codes', {
      appId,
      filter,
      pagination,
    });

    const result = await this.promoCodeRepository.search(
      { appId, ...filter },
      pagination
    );

    if (result.isFailure()) {
      this.logger.error('[ListPromoCodesUseCase] Failed to load promo codes', {
        appId,
        error: result.error,
      });
    }

    return result;
  }
}


















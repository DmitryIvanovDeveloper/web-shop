import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { PromoCodeRepositoryPort } from '../ports/promo-code-repository.port';
import { PROMO_CODE_TYPES } from '../../infrastructure/bootstrap/promo-codes.types';
import type { PromoCode } from '../../domain/entities/promo-code.entity';

export interface UpdatePromoCodeInput {
  readonly id: string;
  readonly appId: string;
  readonly code?: string;
  readonly name?: string;
  readonly discountType?: 'percent' | 'fixed_amount';
  readonly discountValue?: number;
  readonly isActive?: boolean;
}

@injectable()
export class UpdatePromoCodeUseCase {
  public constructor(
    @inject(PROMO_CODE_TYPES.PromoCodeRepository)
    private readonly promoCodeRepository: PromoCodeRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: UpdatePromoCodeInput): Promise<Result<PromoCode, Error>> {
    this.logger.info('[UpdatePromoCodeUseCase] Updating promo code', {
      id: input.id,
      appId: input.appId,
    });

    const existingResult = await this.promoCodeRepository.findById(input.id);
    if (existingResult.isFailure()) {
      return Result.error(existingResult.error!);
    }

    const existing = existingResult.data;
    if (!existing || existing.appId !== input.appId) {
      return Result.error(new Error('Promo code not found'));
    }

    const updatedResult = existing.withUpdatedProps({
      code: input.code,
      name: input.name,
      discountType: input.discountType,
      discountValue: input.discountValue,
      isActive: input.isActive,
    });

    if (updatedResult.isFailure()) {
      return Result.error(updatedResult.error!);
    }

    const saveResult = await this.promoCodeRepository.update(updatedResult.data!);
    if (saveResult.isFailure()) {
      return Result.error(saveResult.error!);
    }

    return saveResult;
  }
}



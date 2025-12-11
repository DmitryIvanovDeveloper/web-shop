import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { PromoCodeRepositoryPort } from '../ports/promo-code-repository.port';
import { PromoCode } from '../../domain/entities/promo-code.entity';
import { PromoCodeError } from '../../domain/errors/promo-code.error';
import { PROMO_CODE_TYPES } from '../../infrastructure/bootstrap/promo-codes.types';

export interface CreatePromoCodeInput {
  id: string;
  appId: string;
  campaignId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  discountType: 'percent' | 'fixed_amount';
  discountValue: number;
  currency?: string | null;
  isFreeShipping?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  priority?: number;
  isExclusive?: boolean;
}

@injectable()
export class CreatePromoCodeUseCase {
  public constructor(
    @inject(PROMO_CODE_TYPES.PromoCodeRepository)
    private readonly promoCodeRepository: PromoCodeRepositoryPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async execute(input: CreatePromoCodeInput): Promise<Result<PromoCode, Error>> {
    this.logger.info('[CreatePromoCodeUseCase] Creating promo code', {
      appId: input.appId,
      code: input.code,
    });

    const existsResult = await this.promoCodeRepository.existsByCode(input.appId, input.code);
    if (existsResult.isFailure()) {
      return Result.error(existsResult.error!);
    }
    if (existsResult.data) {
      return Result.error(
        new PromoCodeError('CodeAlreadyExists', `Promo code "${input.code}" already exists for this app`)
      );
    }

    const nowIso = new Date().toISOString();

    const promoCodeResult = PromoCode.create({
      id: input.id,
      appId: input.appId,
      campaignId: input.campaignId ?? null,
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      currency: input.currency ?? null,
      isFreeShipping: input.isFreeShipping ?? false,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      maxRedemptions: input.maxRedemptions ?? null,
      maxRedemptionsPerUser: input.maxRedemptionsPerUser ?? null,
      priority: input.priority ?? 0,
      isExclusive: input.isExclusive ?? true,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    if (promoCodeResult.isFailure()) {
      return Result.error(promoCodeResult.error!);
    }

    const saveResult = await this.promoCodeRepository.save(promoCodeResult.data!);
    if (saveResult.isFailure()) {
      return Result.error(saveResult.error!);
    }

    return saveResult;
  }
}









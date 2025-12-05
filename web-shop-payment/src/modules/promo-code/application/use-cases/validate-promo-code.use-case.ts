import { injectable, inject } from 'inversify';
import { PROMO_CODE_TYPES } from '../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { PromoCodeValidationPort } from '../ports/promo-code-validation.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { Result, Failure, isFailure } from '../../../../shared/result/result';
import { AppliedDiscount } from '../../domain/entities/validated-promo-code.entity';
import { PromoCodeError } from '../../domain/errors/promo-code.error';

export interface ValidatePromoCodeRequest {
  code: string;
  appId: string;
  userId?: string;
  orderAmount: number;
  currency: string;
}

/**
 * Validate Promo Code Use Case
 * 
 * Business logic for validating promo codes
 * Coordinates validation through the PromoCodeValidationPort
 */
@injectable()
export class ValidatePromoCodeUseCase {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger,
    @inject(PROMO_CODE_TYPES.PromoCodeValidation)
    private readonly promoCodeValidation: PromoCodeValidationPort
  ) {}

  public async execute(
    request: ValidatePromoCodeRequest
  ): Promise<Result<AppliedDiscount, PromoCodeError>> {
    this.logger.info('[ValidatePromoCodeUseCase] Validating promo code', {
      code: request.code,
      appId: request.appId,
      userId: request.userId,
      orderAmount: request.orderAmount
    });

    // Validate input
    if (!request.code || request.code.trim() === '') {
      return Failure.fail(
        PromoCodeError.validationFailed('Promo code cannot be empty')
      );
    }

    if (!request.appId) {
      return Failure.fail(
        PromoCodeError.validationFailed('App ID is required')
      );
    }

    if (request.orderAmount <= 0) {
      return Failure.fail(
        PromoCodeError.validationFailed('Order amount must be greater than zero')
      );
    }

    // Delegate to validation port
    const result = await this.promoCodeValidation.validate(
      request.code,
      request.appId,
      request.userId,
      request.orderAmount,
      request.currency
    );

    if (isFailure(result)) {
      this.logger.warn('[ValidatePromoCodeUseCase] Promo code validation failed', {
        code: request.code,
        error: result.error.message,
        errorCode: result.error.code
      });
      return result;
    }

    this.logger.info('[ValidatePromoCodeUseCase] Promo code validated successfully', {
      code: request.code,
      discountAmount: result.data.discountAmount,
      finalAmount: result.data.finalAmount
    });

    return result;
  }
}


import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { PromoCodeValidationPort } from '../../application/ports/promo-code-validation.port';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { ValidatedPromoCode, AppliedDiscount, createAppliedDiscount } from '../../domain/entities/validated-promo-code.entity';
import { PromoCodeError } from '../../domain/errors/promo-code.error';

interface ValidatePromoCodeApiRequest {
  code: string;
  appId: string;
  userId?: string;
  orderAmount: number;
  currency: string;
}

interface ValidatePromoCodeApiResponse {
  isValid: boolean;
  promoCode?: {
    id: string;
    code: string;
    discountType: 'percent' | 'fixed_amount';
    discountValue: number;
    currency: string | null;
    isFreeShipping: boolean;
    campaignId: string | null;
  };
  discountAmount: number;
  finalAmount: number;
  error?: string;
}

/**
 * Promo Code HTTP Repository
 * 
 * Infrastructure implementation of PromoCodeValidationPort
 * Uses HttpClient to communicate with API routes (following the pattern: Repository -> HttpClient -> Route -> Supabase)
 */
@injectable()
export class PromoCodeHttpRepository implements PromoCodeValidationPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly httpClient: HttpClient,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public async validate(
    code: string,
    appId: string,
    userId: string | undefined,
    orderAmount: number,
    currency: string
  ): Promise<Result<AppliedDiscount, PromoCodeError>> {
    this.logger.info('[PromoCodeHttpRepository] Validating promo code', {
      code,
      appId,
      userId,
      orderAmount,
      currency
    });

    try {
      const request: ValidatePromoCodeApiRequest = {
        code: code.trim().toUpperCase(),
        appId,
        userId,
        orderAmount,
        currency
      };

      const response = await this.httpClient.post<ValidatePromoCodeApiResponse>(
        '/api/promo-codes/validate',
        request
      );

      if (response.status !== 200) {
        this.logger.error('[PromoCodeHttpRepository] API returned error status', {
          status: response.status,
          data: response.data
        });
        return Failure.fail(
          PromoCodeError.validationFailed(response.data?.error || 'Unknown error')
        );
      }

      const apiResponse = response.data;

      if (!apiResponse.isValid) {
        this.logger.warn('[PromoCodeHttpRepository] Promo code validation failed', {
          code,
          error: apiResponse.error
        });

        // Map API error to domain error
        const errorMessage = apiResponse.error || 'Promo code validation failed';
        if (errorMessage.includes('not found')) {
          return Failure.fail(PromoCodeError.codeNotFound(code));
        } else if (errorMessage.includes('not active')) {
          return Failure.fail(PromoCodeError.codeInactive(code));
        } else if (errorMessage.includes('expired')) {
          return Failure.fail(PromoCodeError.codeExpired(code));
        } else if (errorMessage.includes('not yet active')) {
          return Failure.fail(PromoCodeError.codeNotStarted(code));
        } else if (errorMessage.includes('maximum redemptions')) {
          if (errorMessage.includes('You have reached')) {
            return Failure.fail(PromoCodeError.maxRedemptionsPerUserReached(code));
          }
          return Failure.fail(PromoCodeError.maxRedemptionsReached(code));
        } else {
          return Failure.fail(PromoCodeError.validationFailed(errorMessage));
        }
      }

      if (!apiResponse.promoCode) {
        this.logger.error('[PromoCodeHttpRepository] Valid response but no promo code data', {
          response: apiResponse
        });
        return Failure.fail(PromoCodeError.validationFailed('Invalid response from server'));
      }

      // Map API response to domain entities
      const validatedPromoCode: ValidatedPromoCode = {
        id: apiResponse.promoCode.id,
        code: apiResponse.promoCode.code,
        discountType: apiResponse.promoCode.discountType,
        discountValue: apiResponse.promoCode.discountValue,
        currency: apiResponse.promoCode.currency,
        isFreeShipping: apiResponse.promoCode.isFreeShipping,
        campaignId: apiResponse.promoCode.campaignId
      };

      const appliedDiscount = createAppliedDiscount(
        validatedPromoCode,
        orderAmount,
        currency
      );

      this.logger.info('[PromoCodeHttpRepository] Promo code validated successfully', {
        code,
        discountAmount: appliedDiscount.discountAmount,
        finalAmount: appliedDiscount.finalAmount
      });

      return Success.ok(appliedDiscount);

    } catch (error) {
      this.logger.error('[PromoCodeHttpRepository] Network error validating promo code', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code
      });

      return Failure.fail(
        PromoCodeError.networkError(
          error instanceof Error ? error.message : 'Network request failed'
        )
      );
    }
  }
}


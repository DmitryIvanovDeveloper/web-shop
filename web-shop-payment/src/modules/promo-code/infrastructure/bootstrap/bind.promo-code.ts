import { Container } from 'inversify';
import { PROMO_CODE_TYPES } from './types';
import { PromoCodeValidationPort } from '../../application/ports/promo-code-validation.port';
import { PromoCodeHttpRepository } from '../repositories/promo-code-http.repository';
import { ValidatePromoCodeUseCase } from '../../application/use-cases/validate-promo-code.use-case';

/**
 * Bind Promo Code Module
 * 
 * Registers all promo code module dependencies in the DI container
 */
export function bindPromoCode(container: Container): void {
  // Repository
  container
    .bind<PromoCodeValidationPort>(PROMO_CODE_TYPES.PromoCodeValidation)
    .to(PromoCodeHttpRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind<ValidatePromoCodeUseCase>(PROMO_CODE_TYPES.ValidatePromoCodeUseCase)
    .to(ValidatePromoCodeUseCase)
    .inSingletonScope();
}

















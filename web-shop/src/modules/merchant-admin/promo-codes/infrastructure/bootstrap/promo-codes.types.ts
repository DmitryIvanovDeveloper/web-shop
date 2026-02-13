export const PROMO_CODE_TYPES = {
  PromoCodeRepository: Symbol.for('MerchantAdmin.PromoCodes.PromoCodeRepository'),
  CreatePromoCodeUseCase: Symbol.for('MerchantAdmin.PromoCodes.CreatePromoCodeUseCase'),
  ListPromoCodesUseCase: Symbol.for('MerchantAdmin.PromoCodes.ListPromoCodesUseCase'),
   UpdatePromoCodeUseCase: Symbol.for('MerchantAdmin.PromoCodes.UpdatePromoCodeUseCase'),
  PromoCodesPresenter: Symbol.for('MerchantAdmin.PromoCodes.PromoCodesPresenter'),
} as const;






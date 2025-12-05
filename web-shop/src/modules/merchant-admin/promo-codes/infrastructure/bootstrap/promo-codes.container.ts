import { Container } from 'inversify';
import { PROMO_CODE_TYPES } from './promo-codes.types';
import { PromoCodeSupabaseRepository } from '../repositories/promo-code-supabase.repository';
import type { PromoCodeRepositoryPort } from '../../application/ports/promo-code-repository.port';
import { CreatePromoCodeUseCase } from '../../application/use-cases/create-promo-code.use-case';
import { ListPromoCodesUseCase } from '../../application/use-cases/list-promo-codes.use-case';
import { UpdatePromoCodeUseCase } from '../../application/use-cases/update-promo-code.use-case';
import { PromoCodesPresenter } from '../../interface-adapters/presenters/promo-codes.presenter';

export function bindMerchantAdminPromoCodes(container: Container): void {
  container.bind(PromoCodeSupabaseRepository).toSelf().inSingletonScope();

  container
    .bind<PromoCodeRepositoryPort>(PROMO_CODE_TYPES.PromoCodeRepository)
    .toService(PromoCodeSupabaseRepository);

  container
    .bind<CreatePromoCodeUseCase>(PROMO_CODE_TYPES.CreatePromoCodeUseCase)
    .to(CreatePromoCodeUseCase)
    .inSingletonScope();

  container
    .bind<ListPromoCodesUseCase>(PROMO_CODE_TYPES.ListPromoCodesUseCase)
    .to(ListPromoCodesUseCase)
    .inSingletonScope();

  container
    .bind<UpdatePromoCodeUseCase>(PROMO_CODE_TYPES.UpdatePromoCodeUseCase)
    .to(UpdatePromoCodeUseCase)
    .inSingletonScope();

  container.bind(PromoCodesPresenter).toSelf().inSingletonScope();
  container.bind(PROMO_CODE_TYPES.PromoCodesPresenter).toService(PromoCodesPresenter);
}



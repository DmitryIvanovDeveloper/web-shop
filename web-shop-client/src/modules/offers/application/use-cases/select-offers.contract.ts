import type { Offer } from '../../domain/types';
import type { ComparableValue } from '../../domain/types';
import type { UserOfferContextSnapshot } from '../../../user-offer-context/application/ports/context.types';

export interface SelectOffersInput {
  readonly appId: string;
  readonly userId: string;
  readonly scenarioSlugs?: readonly string[];
  readonly overrides?: Readonly<Record<string, ComparableValue>>;
  readonly contextSnapshot?: UserOfferContextSnapshot;
}

export interface SelectOffersOutput {
  readonly offers: readonly Offer[];
}

export interface SelectOffersUseCase {
  execute(input: SelectOffersInput): Promise<SelectOffersOutput>;
}



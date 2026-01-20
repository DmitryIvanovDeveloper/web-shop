export interface OfferConditionViewModel {
  readonly triggerCode: string;
  readonly label: string; 
  readonly description: string; 
  readonly offerIds: readonly string[];
  readonly productIds: readonly string[];
  readonly productDiscounts: Record<string, string>; 
}

export interface OfferScenarioConfigViewModel {
  readonly offerIds: readonly string[];
  readonly discount?: {
    readonly type: string;
    readonly value: number;
    readonly currency?: string;
    readonly minSpend?: number;
  };
  readonly bonus?: {
    readonly type: string;
    readonly amount?: number;
    readonly unit?: string;
    readonly description?: string;
  };
  readonly items: readonly {
    readonly id: string;
    readonly title: string;
    readonly type: string;
    readonly metadata: Record<string, string | number | boolean>;
  }[];
  readonly metadata: Record<string, string | number | boolean>;
  readonly conditions?: readonly OfferConditionViewModel[];
}

export interface OfferScenarioListItemViewModel {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly categoryTitle: string;
  readonly categoryCode: string;
  readonly triggerCode: string;
  readonly triggerLabel: string;
  readonly conditionDescription?: string;
  readonly priority: number;
  readonly tags: readonly string[];
  readonly offerIds: readonly string[];
}

export interface OfferScenarioDetailViewModel extends OfferScenarioListItemViewModel {
  readonly rulePreview: string;
  readonly config: OfferScenarioConfigViewModel;
}

export interface OfferCategoryGroupViewModel {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly scenarios: readonly OfferScenarioListItemViewModel[];
}

import type { Product } from '../../application/ports/product-query-service.port';

export interface OffersPageViewModel {
  readonly isLoading: boolean;
  readonly isLoadingProducts: boolean;
  readonly errorMessage: string | null;
  readonly totalScenarios: number;
  readonly categories: readonly OfferCategoryGroupViewModel[];
  readonly selectedScenario: OfferScenarioDetailViewModel | null;
  readonly products: readonly Product[];
  readonly lastUpdatedAt: string | null;
  readonly ruleTreeJson: string | null;
}

export const initialOffersPageViewModel: OffersPageViewModel = {
  isLoading: false,
  isLoadingProducts: false,
  errorMessage: null,
  totalScenarios: 0,
  categories: [],
  selectedScenario: null,
  products: [],
  lastUpdatedAt: null,
  ruleTreeJson: null,
};


import type { OfferScenarioConfigurationProps } from '../../domain/entities/offer-scenario-configuration.entity';

export interface OfferScenarioDto {
  readonly slug: string;
  readonly priority: number;
  readonly tags: readonly string[];
  readonly configuration: OfferScenarioConfigurationProps;
}

export interface ListOfferScenariosResponse {
  readonly scenarios: OfferScenarioDto[];
}

export interface UpdateOfferScenarioRequest {
  readonly appId: string;
  readonly scenario: OfferScenarioDto;
}

import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';

export interface PublishRuleTreeRequest {
  readonly appId: string;
  readonly ruleTree?: OfferRuleTree;
}

export interface PublishRuleTreeResponse {
  readonly ruleTree: {
    readonly version: string;
    readonly generatedAt: string;
  };
}












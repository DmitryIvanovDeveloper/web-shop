import { Result } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';
import { OfferScenarioCategory, OfferScenarioCategoryCode } from '../value-objects/offer-scenario-category.value-object';
import { OfferTrigger, OfferTriggerCode } from '../value-objects/offer-trigger.value-object';
import { OfferAction, OfferActionType } from '../value-objects/offer-action.value-object';
import type { OfferItemProps } from '../value-objects/offer-item.value-object';
import type { OfferRuleSet } from '../types/offer-rule-set.type';
import type { OfferScenarioMetrics } from '../types/offer-scenario-metrics.type';
import {
  OfferScenarioConfiguration,
  type OfferScenarioConfigurationProps,
} from './offer-scenario-configuration.entity';
import { OfferScenarioConfigurationError } from '../errors/offer-scenario.error';

export interface OfferScenarioProps {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly categoryCode: OfferScenarioCategoryCode;
  readonly triggerCode: OfferTriggerCode;
  readonly priority: number;
  readonly ruleSet: OfferRuleSet;
  readonly defaultActions?: OfferActionType[];
  readonly defaultTags?: readonly string[];
  readonly defaultItems?: readonly OfferItemProps[];
  readonly tags?: readonly string[];
  readonly metrics?: OfferScenarioMetrics;
  readonly configuration?: OfferScenarioConfigurationProps;
}

export class OfferScenario {
  private constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly description: string,
    public readonly category: OfferScenarioCategory,
    public readonly trigger: OfferTrigger,
    public readonly priority: number,
    public readonly ruleSet: OfferRuleSet,
    public readonly actions: readonly OfferAction[],
    public readonly tags: readonly string[],
    public readonly metrics: OfferScenarioMetrics | undefined,
    public readonly configuration: OfferScenarioConfiguration
  ) {}

  public static create(
    props: OfferScenarioProps
  ): Result<OfferScenario, InvalidArgumentError | OfferScenarioConfigurationError> {
    if (!props.id) {
      return Result.error(new InvalidArgumentError('OfferScenario requires id.'));
    }
    if (!props.slug) {
      return Result.error(new InvalidArgumentError('OfferScenario requires slug.'));
    }
    if (!props.title) {
      return Result.error(new InvalidArgumentError('OfferScenario requires title.'));
    }
    if (!props.description) {
      return Result.error(new InvalidArgumentError('OfferScenario requires description.'));
    }
    if (props.priority < 0) {
      return Result.error(new InvalidArgumentError('OfferScenario priority must be >= 0.'));
    }

    const categoryResult = OfferScenarioCategory.create(props.categoryCode);
    if (categoryResult.isFailure) {
      return Result.error(categoryResult.error!);
    }

    const triggerResult = OfferTrigger.create(props.triggerCode);
    if (triggerResult.isFailure) {
      return Result.error(triggerResult.error!);
    }

    const actionsResult = props.defaultActions
      ? OfferAction.fromMany(props.defaultActions)
      : Result.ok<OfferAction[], InvalidArgumentError>([]);
    if (actionsResult.isFailure) {
      return Result.error(actionsResult.error!);
    }

    const configurationResult = OfferScenarioConfiguration.create(
      props.configuration ?? {
        offerIds: [props.slug],
        items: props.defaultItems,
      }
    );
    if (configurationResult.isFailure) {
      return Result.error(configurationResult.error!);
    }

    return Result.ok(
      new OfferScenario(
        props.id,
        props.slug,
        props.title,
        props.description,
        categoryResult.value!,
        triggerResult.value!,
        props.priority,
        props.ruleSet,
        actionsResult.value ?? [],
        Object.freeze([...(props.tags ?? [])]),
        props.metrics,
        configurationResult.value!
      )
    );
  }

  public withConfiguration(
    configuration: OfferScenarioConfigurationProps
  ): Result<OfferScenario, OfferScenarioConfigurationError> {
    const configurationResult = OfferScenarioConfiguration.create(configuration);
    if (configurationResult.isFailure) {
      return Result.error(configurationResult.error!);
    }

    return Result.ok(
      new OfferScenario(
        this.id,
        this.slug,
        this.title,
        this.description,
        this.category,
        this.trigger,
        this.priority,
        this.ruleSet,
        this.actions,
        this.tags,
        this.metrics,
        configurationResult.value!
      )
    );
  }
}






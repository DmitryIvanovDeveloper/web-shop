import { Result } from '../../../../../shared/domain/result/result';
import { OfferScenarioConfigurationError } from '../errors/offer-scenario.error';
import { Discount, type DiscountProps } from '../value-objects/discount.value-object';
import { Bonus, type BonusProps } from '../value-objects/bonus.value-object';
import { OfferItem, type OfferItemProps } from '../value-objects/offer-item.value-object';
import type { OfferTriggerCode } from '../value-objects/offer-trigger.value-object';

export interface OfferConditionConfig {
  readonly triggerCode: OfferTriggerCode;
  readonly offerIds: readonly string[];
  readonly items?: readonly OfferItemProps[];
}

export interface OfferScenarioConfigurationProps {
  readonly offerIds: readonly string[];
  readonly discount?: DiscountProps;
  readonly bonus?: BonusProps;
  readonly items?: readonly OfferItemProps[];
  readonly metadata?: Record<string, string | number | boolean>;
  readonly conditions?: readonly OfferConditionConfig[];
}

export class OfferScenarioConfiguration {
  private constructor(
    public readonly offerIds: readonly string[],
    public readonly discount?: Discount,
    public readonly bonus?: Bonus,
    public readonly items: readonly OfferItem[] = [],
    public readonly metadata: Record<string, string | number | boolean> = {},
    public readonly conditions: readonly {
      readonly triggerCode: OfferTriggerCode;
      readonly offerIds: readonly string[];
      readonly items: readonly OfferItem[];
    }[] = []
  ) {}

  public static create(
    props: OfferScenarioConfigurationProps
  ): Result<OfferScenarioConfiguration, OfferScenarioConfigurationError> {

    const hasConditions = props.conditions !== undefined;
    const hasOfferIds = props.offerIds && props.offerIds.length > 0;

    if (!hasConditions && !hasOfferIds) {
      return Result.error(
        new OfferScenarioConfigurationError(
          'OfferScenarioConfiguration requires either offerIds or conditions array.'
        )
      );
    }

    let trimmedOfferIds: readonly string[] = [];
    if (hasOfferIds) {
      trimmedOfferIds = props.offerIds.map((id) => id.trim()).filter((id) => id.length > 0);
      if (!trimmedOfferIds.length) {
        return Result.error(
          new OfferScenarioConfigurationError('OfferScenarioConfiguration requires non-empty offerId values.')
        );
      }
    }

    const discountResult = props.discount ? Discount.create(props.discount) : null;
    if (discountResult?.isFailure()) {
      return Result.error(new OfferScenarioConfigurationError(discountResult.error.message));
    }

    const bonusResult = props.bonus ? Bonus.create(props.bonus) : null;
    if (bonusResult?.isFailure()) {
      return Result.error(new OfferScenarioConfigurationError(bonusResult.error.message));
    }

    const items: OfferItem[] = [];
    if (props.items) {
      for (const itemProps of props.items) {
        const itemResult = OfferItem.create(itemProps);
        if (itemResult.isFailure()) {
          return Result.error(new OfferScenarioConfigurationError(itemResult.error.message));
        }
        items.push(itemResult.data!);
      }
    }

    const conditions: {
      readonly triggerCode: OfferTriggerCode;
      readonly offerIds: readonly string[];
      readonly items: readonly OfferItem[];
    }[] = [];

    if (hasConditions && props.conditions!.length > 0) {
      for (const conditionConfig of props.conditions!) {

        if (!conditionConfig.offerIds) {
          return Result.error(
            new OfferScenarioConfigurationError(
              `Condition ${conditionConfig.triggerCode} must have offerIds array (can be empty).`
            )
          );
        }

        const trimmedConditionOfferIds = conditionConfig.offerIds
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        const conditionItems: OfferItem[] = [];
        if (conditionConfig.items) {
          for (const itemProps of conditionConfig.items) {
            const itemResult = OfferItem.create(itemProps);
            if (itemResult.isFailure()) {
              return Result.error(new OfferScenarioConfigurationError(itemResult.error.message));
            }
            conditionItems.push(itemResult.data!);
          }
        }

        conditions.push({
          triggerCode: conditionConfig.triggerCode,
          offerIds: Object.freeze(trimmedConditionOfferIds), 
          items: Object.freeze(conditionItems),
        });
      }
    }

    return Result.ok(
      new OfferScenarioConfiguration(
        Object.freeze(trimmedOfferIds),
        discountResult?.data,
        bonusResult?.data,
        Object.freeze(items),
        Object.freeze({ ...(props.metadata ?? {}) }),
        Object.freeze(conditions)
      )
    );
  }

  public toProps(): OfferScenarioConfigurationProps {
    return {
      offerIds: [...this.offerIds],
      discount: this.discount
        ? {
            type: this.discount.type,
            value: this.discount.value,
            currency: this.discount.currency,
            minSpend: this.discount.minSpend,
          }
        : undefined,
      bonus: this.bonus
        ? {
            type: this.bonus.type,
            amount: this.bonus.amount,
            unit: this.bonus.unit,
            description: this.bonus.description,
          }
        : undefined,
      items: this.items.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        metadata: { ...item.metadata },
      })),
      metadata: { ...this.metadata },
      conditions:
        this.conditions.length > 0
          ? this.conditions.map((condition) => ({
              triggerCode: condition.triggerCode,
              offerIds: [...condition.offerIds],
              items: condition.items.map((item) => ({
                id: item.id,
                title: item.title,
                type: item.type,
                metadata: { ...item.metadata },
              })),
            }))
          : undefined,
    };
  }
}


import { Failure, Result, Success } from '../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export type BonusType = 'currency' | 'loyalty_points' | 'cosmetic' | 'trial_days' | 'coupon';

export interface BonusProps {
  readonly type: BonusType;
  readonly amount?: number;
  readonly unit?: string;
  readonly description?: string;
}

export class Bonus {
  private constructor(
    public readonly type: BonusType,
    public readonly amount?: number,
    public readonly unit?: string,
    public readonly description?: string
  ) {}

  public static create(props: BonusProps): Result<Bonus, InvalidArgumentError> {
    if ((props.type === 'currency' || props.type === 'loyalty_points') && (!props.amount || props.amount <= 0)) {
      return new Failure(new InvalidArgumentError('Bonus amount must be greater than zero for numeric bonuses.'));
    }

    if (props.type === 'coupon' && !props.description) {
      return new Failure(new InvalidArgumentError('Coupon bonuses require a description.'));
    }

    return new Success(new Bonus(props.type, props.amount, props.unit, props.description));
  }
}

import { Failure, Result, Success } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountProps {
  readonly type: DiscountType;
  readonly value: number;
  readonly currency?: string;
  readonly minSpend?: number;
}

export class Discount {
  private constructor(
    public readonly type: DiscountType,
    public readonly value: number,
    public readonly currency?: string,
    public readonly minSpend?: number
  ) {}

  public static create(props: DiscountProps): Result<Discount, InvalidArgumentError> {
    if (props.type === 'percentage') {
      if (props.value <= 0 || props.value > 100) {
        return new Failure(new InvalidArgumentError('Percentage discount must be between 0 and 100.'));
      }
    }

    if (props.type === 'fixed') {
      if (props.value <= 0) {
        return new Failure(new InvalidArgumentError('Fixed discount must be greater than zero.'));
      }
      if (!props.currency) {
        return new Failure(new InvalidArgumentError('Fixed discount requires currency.'));
      }
    }

    if (props.minSpend !== undefined && props.minSpend < 0) {
      return new Failure(new InvalidArgumentError('Minimum spend cannot be negative.'));
    }

    return new Success(new Discount(props.type, props.value, props.currency, props.minSpend));
  }
}






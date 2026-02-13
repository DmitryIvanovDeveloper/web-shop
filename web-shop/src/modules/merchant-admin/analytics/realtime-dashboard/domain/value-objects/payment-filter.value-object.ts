import { Result, Success, Failure } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';

export type PaymentMethod = 'card' | 'paypal' | 'crypto' | 'bank_transfer' | 'apple_pay' | 'google_pay';

export interface PaymentFilterProps {
  methods: PaymentMethod[];
}

export class PaymentFilter {
  private static readonly VALID_METHODS: PaymentMethod[] = [
    'card',
    'paypal',
    'crypto',
    'bank_transfer',
    'apple_pay',
    'google_pay',
  ];

  private constructor(public readonly methods: PaymentMethod[]) {}

  public static create(props: PaymentFilterProps): Result<PaymentFilter, InvalidArgumentError> {
    if (!props.methods || props.methods.length === 0) {
      return Result.error(new InvalidArgumentError('At least one payment method must be selected'));
    }

    const invalidMethods = props.methods.filter((method) => !PaymentFilter.VALID_METHODS.includes(method));
    if (invalidMethods.length > 0) {
      return Result.error(new InvalidArgumentError(`Invalid payment methods: ${invalidMethods.join(', ')}`));
    }

    return Result.ok(new PaymentFilter(props.methods));
  }

  public static createEmpty(): PaymentFilter {
    return new PaymentFilter([]);
  }

  public isEmpty(): boolean {
    return this.methods.length === 0;
  }

  public includes(method: PaymentMethod): boolean {
    return this.methods.includes(method);
  }

  public toQueryParam(): string {
    return this.methods.join(',');
  }

  public static fromQueryParam(param: string): Result<PaymentFilter, InvalidArgumentError> {
    if (!param || param.trim() === '') {
      return new Success(PaymentFilter.createEmpty());
    }

    const methods = param.split(',').map((method) => method.trim() as PaymentMethod);
    return PaymentFilter.create({ methods });
  }
}


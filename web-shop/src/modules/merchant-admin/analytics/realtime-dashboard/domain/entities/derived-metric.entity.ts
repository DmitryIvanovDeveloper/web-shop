import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';

export type MetricOperator = 'divide' | 'multiply' | 'add' | 'subtract' | 'percentage';

export interface DerivedMetricProps {
  id: string;
  name: string;
  numeratorMetricId: string;
  denominatorMetricId?: string; 
  operator: MetricOperator;
  format?: 'number' | 'currency' | 'percentage';
  decimals?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DerivedMetric {
  private constructor(private readonly props: DerivedMetricProps) {}

  public static create(props: Omit<DerivedMetricProps, 'createdAt' | 'updatedAt'>): Result<DerivedMetric, InvalidArgumentError> {
    if (!props.id || props.id.trim() === '') {
      return new Failure(new InvalidArgumentError('Derived metric ID is required'));
    }

    if (!props.name || props.name.trim() === '') {
      return new Failure(new InvalidArgumentError('Derived metric name is required'));
    }

    if (!props.numeratorMetricId || props.numeratorMetricId.trim() === '') {
      return new Failure(new InvalidArgumentError('Numerator metric ID is required'));
    }

    if (['divide', 'percentage'].includes(props.operator) && !props.denominatorMetricId) {
      return new Failure(new InvalidArgumentError(`Denominator is required for ${props.operator} operation`));
    }

    const now = new Date();
    return new Success(new DerivedMetric({
      ...props,
      createdAt: now,
      updatedAt: now,
    }));
  }

  public static restore(props: DerivedMetricProps): DerivedMetric {
    return new DerivedMetric(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get numeratorMetricId(): string {
    return this.props.numeratorMetricId;
  }

  get denominatorMetricId(): string | undefined {
    return this.props.denominatorMetricId;
  }

  get operator(): MetricOperator {
    return this.props.operator;
  }

  get format(): 'number' | 'currency' | 'percentage' {
    return this.props.format || 'number';
  }

  get decimals(): number {
    return this.props.decimals ?? 2;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public calculate(numeratorValue: number, denominatorValue?: number): Result<number, InvalidArgumentError> {
    switch (this.props.operator) {
      case 'divide':
        if (denominatorValue === undefined) {
          return new Failure(new InvalidArgumentError('Denominator value is required for division'));
        }
        if (denominatorValue === 0) {
          return new Failure(new InvalidArgumentError('Cannot divide by zero'));
        }
        return new Success(numeratorValue / denominatorValue);

      case 'multiply':
        if (denominatorValue === undefined) {
          return new Failure(new InvalidArgumentError('Second value is required for multiplication'));
        }
        return new Success(numeratorValue * denominatorValue);

      case 'add':
        if (denominatorValue === undefined) {
          return new Failure(new InvalidArgumentError('Second value is required for addition'));
        }
        return new Success(numeratorValue + denominatorValue);

      case 'subtract':
        if (denominatorValue === undefined) {
          return new Failure(new InvalidArgumentError('Second value is required for subtraction'));
        }
        return new Success(numeratorValue - denominatorValue);

      case 'percentage':
        if (denominatorValue === undefined) {
          return new Failure(new InvalidArgumentError('Denominator value is required for percentage'));
        }
        if (denominatorValue === 0) {
          return new Failure(new InvalidArgumentError('Cannot calculate percentage with zero denominator'));
        }
        return new Success((numeratorValue / denominatorValue) * 100);

      default:
        return new Failure(new InvalidArgumentError(`Unknown operator: ${this.props.operator}`));
    }
  }

  public formatValue(value: number): string {
    const roundedValue = Number(value.toFixed(this.decimals));

    switch (this.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: this.decimals,
          maximumFractionDigits: this.decimals,
        }).format(roundedValue);

      case 'percentage':
        return `${roundedValue.toFixed(this.decimals)}%`;

      case 'number':
      default:
        return roundedValue.toLocaleString('en-US', {
          minimumFractionDigits: this.decimals,
          maximumFractionDigits: this.decimals,
        });
    }
  }

  public update(updates: Partial<Omit<DerivedMetricProps, 'id' | 'createdAt' | 'updatedAt'>>): DerivedMetric {
    return new DerivedMetric({
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }
}


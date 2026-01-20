import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';

export type AcquisitionSource = 'organic' | 'paid' | 'referral' | 'social' | 'email' | 'direct';

export interface SourceFilterProps {
  sources: AcquisitionSource[];
}

export class SourceFilter {
  private static readonly VALID_SOURCES: AcquisitionSource[] = [
    'organic',
    'paid',
    'referral',
    'social',
    'email',
    'direct',
  ];

  private constructor(public readonly sources: AcquisitionSource[]) {}

  public static create(props: SourceFilterProps): Result<SourceFilter, InvalidArgumentError> {
    if (!props.sources || props.sources.length === 0) {
      return new Failure(new InvalidArgumentError('At least one source must be selected'));
    }

    const invalidSources = props.sources.filter((source) => !SourceFilter.VALID_SOURCES.includes(source));
    if (invalidSources.length > 0) {
      return new Failure(new InvalidArgumentError(`Invalid sources: ${invalidSources.join(', ')}`));
    }

    return new Success(new SourceFilter(props.sources));
  }

  public static createEmpty(): SourceFilter {
    return new SourceFilter([]);
  }

  public isEmpty(): boolean {
    return this.sources.length === 0;
  }

  public includes(source: AcquisitionSource): boolean {
    return this.sources.includes(source);
  }

  public toQueryParam(): string {
    return this.sources.join(',');
  }

  public static fromQueryParam(param: string): Result<SourceFilter, InvalidArgumentError> {
    if (!param || param.trim() === '') {
      return new Success(SourceFilter.createEmpty());
    }

    const sources = param.split(',').map((source) => source.trim() as AcquisitionSource);
    return SourceFilter.create({ sources });
  }
}


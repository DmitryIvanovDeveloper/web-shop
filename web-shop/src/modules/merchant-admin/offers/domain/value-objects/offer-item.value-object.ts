import { Failure, Result, Success } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export type OfferItemType = 'product' | 'bundle' | 'currency' | 'cosmetic' | 'service';

export interface OfferItemProps {
  readonly id: string;
  readonly title: string;
  readonly type: OfferItemType;
  readonly metadata?: Record<string, string | number | boolean>;
}

export class OfferItem {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: OfferItemType,
    public readonly metadata: Record<string, string | number | boolean>
  ) {}

  public static create(props: OfferItemProps): Result<OfferItem, InvalidArgumentError> {
    if (!props.id.trim()) {
      return new Failure(new InvalidArgumentError('OfferItem id must not be empty.'));
    }

    if (!props.title.trim()) {
      return new Failure(new InvalidArgumentError('OfferItem title must not be empty.'));
    }

    return new Success(
      new OfferItem(
        props.id,
        props.title,
        props.type,
        props.metadata ?? {}
      )
    );
  }
}







import { Result } from '@/shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';

export type OfferActionType =
  | 'discount'
  | 'bonus_currency'
  | 'trial_extension'
  | 'loyalty_upgrade'
  | 'upsell'
  | 'reminder'
  | 'notification'
  | 'coupon'
  | 'cosmetic_reward'
  | 'content_unlock';

const ACTION_LABELS: Record<OfferActionType, string> = {
  discount: 'Discounted pricing',
  bonus_currency: 'Bonus currency',
  trial_extension: 'Trial extension',
  loyalty_upgrade: 'Loyalty tier upgrade',
  upsell: 'Upsell recommendation',
  reminder: 'Reminder message',
  notification: 'Notification delivery',
  coupon: 'Coupon distribution',
  cosmetic_reward: 'Cosmetic reward',
  content_unlock: 'Content unlock',
};

export class OfferAction {
  private constructor(public readonly type: OfferActionType, public readonly label: string) {}

  public static create(type: OfferActionType): Result<OfferAction, InvalidArgumentError> {
    const label = ACTION_LABELS[type];
    if (!label) {
      return Result.error(new InvalidArgumentError(`Unsupported offer action type: ${type}`));
    }
    return Result.ok(new OfferAction(type, label));
  }

  public static fromMany(types: readonly OfferActionType[]): Result<OfferAction[], InvalidArgumentError> {
    const actions: OfferAction[] = [];
    for (const type of types) {
      const result = OfferAction.create(type);
      if (result.isFailure) {
        return Result.error(result.error ?? new Error('Unknown error'));
      }
      actions.push(result.value!);
    }
    return Result.ok(actions);
  }
}






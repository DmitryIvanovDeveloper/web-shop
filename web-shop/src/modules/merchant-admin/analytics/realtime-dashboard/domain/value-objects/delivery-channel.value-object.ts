import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';

export class DeliveryChannel {
  private constructor(public readonly type: 'email' | 'slack' | 'sms') {}

  static create(type: 'email' | 'slack' | 'sms'): Result<DeliveryChannel, Error> {
    if (!type) return Failure.error(new Error('Invalid channel'));
    return Success.ok(new DeliveryChannel(type));
  }
}


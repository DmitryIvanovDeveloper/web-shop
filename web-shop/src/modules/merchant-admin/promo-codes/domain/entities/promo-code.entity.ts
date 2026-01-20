import { Result } from '../../../../../shared/domain/result/result';
import { PromoCodeError } from '../errors/promo-code.error';

export type PromoDiscountType = 'percent' | 'fixed_amount';

export interface PromoCodeProps {
  id: string;
  appId: string;
  campaignId: string | null;
  code: string;
  name: string;
  description: string | null;
  discountType: PromoDiscountType;
  discountValue: number;
  currency: string | null;
  isFreeShipping: boolean;
  startAt: string | null;
  endAt: string | null;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number | null;
  priority: number;
  isExclusive: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export class PromoCode {
  public readonly id: string;
  public readonly appId: string;
  public readonly campaignId: string | null;
  public readonly code: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly discountType: PromoDiscountType;
  public readonly discountValue: number;
  public readonly currency: string | null;
  public readonly isFreeShipping: boolean;
  public readonly startAt: string | null;
  public readonly endAt: string | null;
  public readonly maxRedemptions: number | null;
  public readonly maxRedemptionsPerUser: number | null;
  public readonly priority: number;
  public readonly isExclusive: boolean;
  public readonly isActive: boolean;
  public readonly createdAt: string | null;
  public readonly updatedAt: string | null;

  private constructor(props: PromoCodeProps) {
    this.id = props.id;
    this.appId = props.appId;
    this.campaignId = props.campaignId;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.discountType = props.discountType;
    this.discountValue = props.discountValue;
    this.currency = props.currency;
    this.isFreeShipping = props.isFreeShipping;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.maxRedemptions = props.maxRedemptions;
    this.maxRedemptionsPerUser = props.maxRedemptionsPerUser;
    this.priority = props.priority;
    this.isExclusive = props.isExclusive;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: PromoCodeProps): Result<PromoCode, Error> {
    const normalizedCode = props.code.trim();
    if (!normalizedCode) {
      return Result.error(new PromoCodeError('InvalidDiscountValue', 'Promo code cannot be empty'));
    }

    if (props.discountType === 'percent') {
      if (props.discountValue <= 0 || props.discountValue > 100) {
        return Result.error(
          new PromoCodeError('InvalidDiscountValue', 'Percent discount value must be in (0, 100]')
        );
      }
    }

    if (props.discountType === 'fixed_amount') {
      if (props.discountValue <= 0) {
        return Result.error(
          new PromoCodeError('InvalidDiscountValue', 'Fixed amount discount must be greater than zero')
        );
      }
      if (!props.currency) {
        return Result.error(
          new PromoCodeError('InvalidDiscountValue', 'Currency is required for fixed amount discount')
        );
      }
    }

    if (props.startAt && props.endAt && props.startAt > props.endAt) {
      return Result.error(
        new PromoCodeError('InvalidDateRange', 'startAt must be before or equal to endAt')
      );
    }

    const entity = new PromoCode({
      ...props,
      code: normalizedCode,
    });

    return Result.ok(entity);
  }

  public withUpdatedStatus(isActive: boolean): PromoCode {
    return new PromoCode({
      ...this,
      isActive,
    });
  }

  public withUpdatedProps(partial: Partial<Omit<PromoCodeProps, 'id' | 'appId'>>): Result<PromoCode, Error> {
    return PromoCode.create({
      id: this.id,
      appId: this.appId,
      campaignId: partial.campaignId ?? this.campaignId,
      code: partial.code ?? this.code,
      name: partial.name ?? this.name,
      description: partial.description ?? this.description,
      discountType: partial.discountType ?? this.discountType,
      discountValue: partial.discountValue ?? this.discountValue,
      currency: partial.currency ?? this.currency,
      isFreeShipping: partial.isFreeShipping ?? this.isFreeShipping,
      startAt: partial.startAt ?? this.startAt,
      endAt: partial.endAt ?? this.endAt,
      maxRedemptions: partial.maxRedemptions ?? this.maxRedemptions,
      maxRedemptionsPerUser: partial.maxRedemptionsPerUser ?? this.maxRedemptionsPerUser,
      priority: partial.priority ?? this.priority,
      isExclusive: partial.isExclusive ?? this.isExclusive,
      isActive: partial.isActive ?? this.isActive,
      createdAt: partial.createdAt ?? this.createdAt,
      updatedAt: partial.updatedAt ?? this.updatedAt,
    });
  }
}


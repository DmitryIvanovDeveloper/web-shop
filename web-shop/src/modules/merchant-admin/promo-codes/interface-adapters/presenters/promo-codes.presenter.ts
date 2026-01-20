import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import { PROMO_CODE_TYPES } from '../../infrastructure/bootstrap/promo-codes.types';
import type { ListPromoCodesUseCase } from '../../application/use-cases/list-promo-codes.use-case';
import { CreatePromoCodeUseCase } from '../../application/use-cases/create-promo-code.use-case';
import { UpdatePromoCodeUseCase } from '../../application/use-cases/update-promo-code.use-case';
import type { PromoCode } from '../../domain/entities/promo-code.entity';

export interface PromoCodesListItemViewModel {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly campaignId: string | null;
  readonly discountType: string;
  readonly discountValue: number;
  readonly currency: string | null;
  readonly isActive: boolean;
}

export interface PromoCodesPageViewModel {
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly items: readonly PromoCodesListItemViewModel[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly isCreating: boolean;
  readonly isSaving: boolean;
  readonly isEditing: boolean;
  readonly editingId: string | null;
  readonly form: {
    readonly code: string;
    readonly name: string;
    readonly discountType: 'percent' | 'fixed_amount';
    readonly discountValue: number;
  };
}

export interface PromoCodesLabels {
  readonly pageTitle: string;
  readonly loading: string;
  readonly empty: string;
  readonly newPromoCode: string;
  readonly formTitle: string;
  readonly fieldCode: string;
  readonly fieldName: string;
  readonly fieldDiscountType: string;
  readonly fieldDiscountValue: string;
  readonly buttonCreate: string;
  readonly buttonCancel: string;
}

type Subscriber = () => void;

@injectable()
export class PromoCodesPresenter {
  private _viewModel: PromoCodesPageViewModel;
  private readonly _subscribers: Subscriber[] = [];
  private _appId: string | null = null;

  public constructor(
    @inject(PROMO_CODE_TYPES.ListPromoCodesUseCase)
    private readonly listPromoCodesUseCase: ListPromoCodesUseCase,
    @inject(PROMO_CODE_TYPES.CreatePromoCodeUseCase)
    private readonly createPromoCodeUseCase: CreatePromoCodeUseCase,
    @inject(PROMO_CODE_TYPES.UpdatePromoCodeUseCase)
    private readonly updatePromoCodeUseCase: UpdatePromoCodeUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {
    this._viewModel = {
      isLoading: false,
      errorMessage: null,
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      isCreating: false,
      isSaving: false,
      isEditing: false,
      editingId: null,
      form: {
        code: '',
        name: '',
        discountType: 'percent',
        discountValue: 10,
      },
    };
  }

  public getViewModel(): PromoCodesPageViewModel {
    return this._viewModel;
  }

  public subscribe(subscriber: Subscriber): () => void {
    this._subscribers.push(subscriber);
    return () => {
      const index = this._subscribers.indexOf(subscriber);
      if (index >= 0) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  private _notify(): void {
    for (const subscriber of this._subscribers) {
      subscriber();
    }
  }

  public async init(appId: string): Promise<void> {
    this._appId = appId;
    await this.loadPage(appId, 1);
  }

  public async loadPage(appId: string, page: number): Promise<void> {
    this._viewModel = {
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
      page,
    };
    this._notify();

    const result = await this.listPromoCodesUseCase.execute({
      appId,
      pagination: {
        page,
        pageSize: this._viewModel.pageSize,
      },
    });

    if (result.isFailure()) {
            this._viewModel = {
        ...this._viewModel,
        isLoading: false,
        errorMessage: 'Failed to load promo codes',
      };
      this._notify();
      return;
    }

    const data = result.data!;

    this._viewModel = {
      ...this._viewModel,
      isLoading: false,
      errorMessage: null,
      items: data.items.map(this._mapEntityToItem),
      total: data.total,
    };
    this._notify();
  }

  private _mapEntityToItem(entity: PromoCode): PromoCodesListItemViewModel {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      campaignId: entity.campaignId,
      discountType: entity.discountType,
      discountValue: entity.discountValue,
      currency: entity.currency,
      isActive: entity.isActive,
    };
  }

  public get labels(): PromoCodesLabels {
    return {
      pageTitle: 'Promo Codes',
      loading: 'Loading promo codes...',
      empty: 'No promo codes yet',
      newPromoCode: 'New promo code',
      formTitle: 'Create promo code',
      fieldCode: 'Code',
      fieldName: 'Name',
      fieldDiscountType: 'Discount type',
      fieldDiscountValue: 'Value',
      buttonCreate: 'Create',
      buttonCancel: 'Cancel',
    };
  }

  public get hasItems(): boolean {
    return this._viewModel.items.length > 0;
  }

  public startCreating(): void {
    this._viewModel = {
      ...this._viewModel,
      isCreating: true,
      isEditing: false,
      editingId: null,
      errorMessage: null,
      form: {
        code: '',
        name: '',
        discountType: 'percent',
        discountValue: 10,
      },
    };
    this._notify();
  }

  public cancelCreating(): void {
    this._viewModel = {
      ...this._viewModel,
      isCreating: false,
      isSaving: false,
      isEditing: false,
      editingId: null,
    };
    this._notify();
  }

  public updateForm(partial: Partial<PromoCodesPageViewModel['form']>): void {
    this._viewModel = {
      ...this._viewModel,
      form: {
        ...this._viewModel.form,
        ...partial,
      },
    };
    this._notify();
  }

  public async createPromoCode(): Promise<Result<void, Error>> {
    if (!this._appId) {
      const error = new Error('App ID is not set');
            return Result.error(error);
    }

    this._viewModel = {
      ...this._viewModel,
      isSaving: true,
      errorMessage: null,
    };
    this._notify();

    const id =
      (globalThis.crypto && 'randomUUID' in globalThis.crypto && globalThis.crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const input = {
      id,
      appId: this._appId,
      code: this._viewModel.form.code,
      name: this._viewModel.form.name,
      description: null,
      discountType: this._viewModel.form.discountType,
      discountValue: this._viewModel.form.discountValue,
      currency: null,
      isFreeShipping: false,
      startAt: null,
      endAt: null,
      maxRedemptions: null,
      maxRedemptionsPerUser: null,
      priority: 0,
      isExclusive: true,
    } as const;

    const result = await this.createPromoCodeUseCase.execute(input);

    if (result.isFailure()) {
            this._viewModel = {
        ...this._viewModel,
        isSaving: false,
        errorMessage: 'Failed to create promo code',
      };
      this._notify();
      return Result.error(result.error!);
    }

    await this.loadPage(this._appId, 1);

    this._viewModel = {
      ...this._viewModel,
      isCreating: false,
      isSaving: false,
    };
    this._notify();

    return Result.ok(undefined);
  }

  public startEditing(item: PromoCodesListItemViewModel): void {
    this._viewModel = {
      ...this._viewModel,
      isCreating: true,
      isEditing: true,
      editingId: item.id,
      errorMessage: null,
      form: {
        code: item.code,
        name: item.name,
        discountType: item.discountType as 'percent' | 'fixed_amount',
        discountValue: item.discountValue,
      },
    };
    this._notify();
  }

  public async updatePromoCode(): Promise<Result<void, Error>> {
    if (!this._appId || !this._viewModel.editingId) {
      const error = new Error('App ID or editingId is not set');
            return Result.error(error);
    }

    this._viewModel = {
      ...this._viewModel,
      isSaving: true,
      errorMessage: null,
    };
    this._notify();

    const result = await this.updatePromoCodeUseCase.execute({
      id: this._viewModel.editingId,
      appId: this._appId,
      code: this._viewModel.form.code,
      name: this._viewModel.form.name,
      discountType: this._viewModel.form.discountType,
      discountValue: this._viewModel.form.discountValue,
    });

    if (result.isFailure()) {
            this._viewModel = {
        ...this._viewModel,
        isSaving: false,
        errorMessage: 'Failed to update promo code',
      };
      this._notify();
      return Result.error(result.error!);
    }

    await this.loadPage(this._appId, this._viewModel.page);

    this._viewModel = {
      ...this._viewModel,
      isCreating: false,
      isSaving: false,
      isEditing: false,
      editingId: null,
    };
    this._notify();

    return Result.ok(undefined);
  }

  public async togglePromoCodeStatus(item: PromoCodesListItemViewModel): Promise<Result<void, Error>> {
    if (!this._appId) {
      const error = new Error('App ID is not set');
            return Result.error(error);
    }

    const result = await this.updatePromoCodeUseCase.execute({
      id: item.id,
      appId: this._appId,
      isActive: !item.isActive,
    });

    if (result.isFailure()) {
            this._viewModel = {
        ...this._viewModel,
        errorMessage: 'Failed to update promo code status',
      };
      this._notify();
      return Result.error(result.error!);
    }

    await this.loadPage(this._appId, this._viewModel.page);

    return Result.ok(undefined);
  }
}


import { Result } from '../../../../shared/result/result';
import { CreateDailyRewardUseCase } from '../../application/use-cases/create-daily-reward.use-case';
import { UpdateDailyRewardUseCase } from '../../application/use-cases/update-daily-reward.use-case';
import { DeleteDailyRewardUseCase } from '../../application/use-cases/delete-daily-reward.use-case';
import { GetDailyRewardsUseCase } from '../../application/use-cases/get-daily-rewards.use-case';
import { GetDailyRewardByIdUseCase } from '../../application/use-cases/get-daily-reward-by-id.use-case';
import { ActivateDailyRewardUseCase } from '../../application/use-cases/activate-daily-reward.use-case';
import { DeactivateDailyRewardUseCase } from '../../application/use-cases/deactivate-daily-reward.use-case';
import type {
  CreateDailyRewardInput,
  UpdateDailyRewardInput,
  DeleteDailyRewardInput,
  GetDailyRewardsInput,
  GetDailyRewardByIdInput,
  ActivateDailyRewardInput,
  DeactivateDailyRewardInput,
  DailyRewardOutput
} from '../../application/types/daily-reward.types';

// View Model для UI
export interface DailyRewardViewModel {
  id: string;
  appId: string;
  type: string;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  typeIcon: string;
  statusBadge: {
    text: string;
    backgroundColor: string;
    color: string;
  };
}

export class DailyRewardsAdminPresenter {
  public readonly labels = { add: 'Add', update: 'Update', delete: 'Delete', list: 'List' } as const;

  // Private state
  private _rewards: DailyRewardOutput[] = [];
  private _isLoading = false;
  private _error: string | null = null;
  private _listeners: Array<() => void> = [];
  private _lastLoadInput: GetDailyRewardsInput | null = null;

  constructor(
    private readonly createDailyRewardUseCase: CreateDailyRewardUseCase,
    private readonly updateDailyRewardUseCase: UpdateDailyRewardUseCase,
    private readonly deleteDailyRewardUseCase: DeleteDailyRewardUseCase,
    private readonly getDailyRewardsUseCase: GetDailyRewardsUseCase,
    private readonly getDailyRewardByIdUseCase: GetDailyRewardByIdUseCase,
    private readonly activateDailyRewardUseCase: ActivateDailyRewardUseCase,
    private readonly deactivateDailyRewardUseCase: DeactivateDailyRewardUseCase
  ) {}

  // View Model getters
  public get rewards(): DailyRewardViewModel[] {
    return this._rewards.map(reward => this.mapToViewModel(reward));
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public get error(): string | null {
    return this._error;
  }

  public get hasRewards(): boolean {
    return this._rewards.length > 0;
  }

  // Observable pattern - подписка на изменения
  public subscribe(listener: () => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index > -1) {
        this._listeners.splice(index, 1);
      }
    };
  }

  // Notify listeners about state changes
  private notifyListeners(): void {
    this._listeners.forEach(listener => listener());
  }

  // Auto-refresh helper
  private async autoRefresh(): Promise<void> {
    if (this._lastLoadInput) {
      await this.loadRewards(this._lastLoadInput);
    }
  }

  // Business logic methods
  public async loadRewards(input: GetDailyRewardsInput): Promise<void> {
    this._lastLoadInput = input; // Store the input for auto-refresh
    this._isLoading = true;
    this._error = null;
    this.notifyListeners();

    try {
      const result = await this.getDailyRewardsUseCase.execute(input);

      if (!result.isSuccess) {
        this._error = String(result.error || 'Failed to load rewards');
      } else {
        this._rewards = result.value || [];
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Unknown error occurred';
    } finally {
      this._isLoading = false;
      this.notifyListeners();
    }
  }

  public async createReward(input: CreateDailyRewardInput): Promise<boolean> {
    this._error = null;
    this.notifyListeners();

    try {
      const result = await this.createDailyRewardUseCase.execute(input);
      if (!result.isSuccess) {
        this._error = String(result.error || 'Failed to create reward');
        this.notifyListeners();
        return false;
      }

      // Auto-refresh rewards to include the new one
      await this.autoRefresh();
      return true;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.notifyListeners();
      return false;
    }
  }

  public async updateReward(input: UpdateDailyRewardInput): Promise<boolean> {
    this._error = null;
    this.notifyListeners();

    try {
      const result = await this.updateDailyRewardUseCase.execute(input);
      if (!result.isSuccess) {
        this._error = String(result.error || 'Failed to update reward');
        this.notifyListeners();
        return false;
      }

      // Auto-refresh rewards to reflect changes
      await this.autoRefresh();
      return true;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.notifyListeners();
      return false;
    }
  }

  public async deleteReward(input: DeleteDailyRewardInput): Promise<boolean> {
    this._error = null;
    this.notifyListeners();

    try {
      const result = await this.deleteDailyRewardUseCase.execute(input);
      if (!result.isSuccess) {
        this._error = String(result.error || 'Failed to delete reward');
        this.notifyListeners();
        return false;
      }

      // Auto-refresh rewards to reflect changes
      await this.autoRefresh();
      return true;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Unknown error occurred';
      this.notifyListeners();
      return false;
    }
  }

  public async activateReward(input: ActivateDailyRewardInput): Promise<boolean> {
    const result = await this.updateReward({ id: input.id, isActive: true });
    return result;
  }

  public async deactivateReward(input: DeactivateDailyRewardInput): Promise<boolean> {
    const result = await this.updateReward({ id: input.id, isActive: false });
    return result;
  }

  // Helper method to map domain object to view model
  private mapToViewModel(reward: DailyRewardOutput): DailyRewardViewModel {
    return {
      id: reward.id,
      appId: reward.appId,
      type: reward.type.value,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      isActive: reward.isActive,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
      typeIcon: this.getTypeIcon(reward.type.value),
      statusBadge: this.getStatusBadge(reward.isActive)
    };
  }

  private getTypeIcon(type: string): string {
    switch (type) {
      case 'points': return '💰';
      case 'currency': return '💎';
      case 'item': return '📦';
      default: return '🎁';
    }
  }

  private getStatusBadge(isActive: boolean) {
    return {
      text: isActive ? 'Active' : 'Inactive',
      backgroundColor: isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
      color: isActive ? '#22C55E' : '#9CA3AF'
    };
  }

  // Legacy methods for backward compatibility (marked as deprecated)
  /** @deprecated Use loadRewards() instead */
  public async onGetDailyRewards(input: GetDailyRewardsInput): Promise<void> {
    await this.loadRewards(input);
  }

  /** @deprecated Use createReward() instead */
  public async onCreateDailyReward(input: CreateDailyRewardInput): Promise<void> {
    await this.createReward(input);
  }

  /** @deprecated Use updateReward() instead */
  public async onUpdateDailyReward(input: UpdateDailyRewardInput): Promise<void> {
    await this.updateReward(input);
  }

  /** @deprecated Use deleteReward() instead */
  public async onDeleteDailyReward(input: DeleteDailyRewardInput): Promise<void> {
    await this.deleteReward(input);
  }

  /** @deprecated Use activateReward() instead */
  public async onActivateDailyReward(input: ActivateDailyRewardInput): Promise<void> {
    await this.activateReward(input);
  }

  /** @deprecated Use deactivateReward() instead */
  public async onDeactivateDailyReward(input: DeactivateDailyRewardInput): Promise<void> {
    await this.deactivateReward(input);
  }

  /** @deprecated Use getDailyRewardByIdUseCase directly instead */
  public async onGetDailyRewardById(input: GetDailyRewardByIdInput): Promise<void> {
    // This method is not commonly used in UI, keeping for API compatibility
    const result = await this.getDailyRewardByIdUseCase.execute(input);
    if (!result.isSuccess) {
      this._error = String(result.error || 'Failed to find reward');
      this.notifyListeners();
    }
  }
}

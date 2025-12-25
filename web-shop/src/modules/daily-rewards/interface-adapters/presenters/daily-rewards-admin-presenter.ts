import { Result, Success, Failure } from '../../../../../shared/result/result';
import { CreateDailyRewardUseCase } from '../../application/use-cases/create-daily-reward-use-case.use-case';
import { UpdateDailyRewardUseCase } from '../../application/use-cases/update-daily-reward-use-case.use-case';
import { DeleteDailyRewardUseCase } from '../../application/use-cases/delete-daily-reward-use-case.use-case';
import { GetDailyRewardsUseCase } from '../../application/use-cases/get-daily-rewards-use-case.use-case';
import { GetDailyRewardByIdUseCase } from '../../application/use-cases/get-daily-reward-by-id-use-case.use-case';
import { ActivateDailyRewardUseCase } from '../../application/use-cases/activate-daily-reward-use-case.use-case';
import { DeactivateDailyRewardUseCase } from '../../application/use-cases/deactivate-daily-reward-use-case.use-case';


export class DailyRewardsAdminPresenter {
  public readonly labels = { add: 'Add', update: 'Update', delete: 'Delete', list: 'List' } as const;
  public state: { loading: boolean; error: string | null; data: unknown } = { loading: false, error: null, data: null };

  constructor(private readonly createDailyRewardUseCase: CreateDailyRewardUseCase, private readonly updateDailyRewardUseCase: UpdateDailyRewardUseCase, private readonly deleteDailyRewardUseCase: DeleteDailyRewardUseCase, private readonly getDailyRewardsUseCase: GetDailyRewardsUseCase, private readonly getDailyRewardByIdUseCase: GetDailyRewardByIdUseCase, private readonly activateDailyRewardUseCase: ActivateDailyRewardUseCase, private readonly deactivateDailyRewardUseCase: DeactivateDailyRewardUseCase) {}

  public async onCreateDailyReward(input: unknown): Promise<void> {
    const result = await this.createDailyRewardUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onUpdateDailyReward(input: unknown): Promise<void> {
    const result = await this.updateDailyRewardUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onDeleteDailyReward(input: unknown): Promise<void> {
    const result = await this.deleteDailyRewardUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onGetDailyRewards(input: unknown): Promise<void> {
    const result = await this.getDailyRewardsUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onGetDailyRewardById(input: unknown): Promise<void> {
    const result = await this.getDailyRewardByIdUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onActivateDailyReward(input: unknown): Promise<void> {
    const result = await this.activateDailyRewardUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }

  public async onDeactivateDailyReward(input: unknown): Promise<void> {
    const result = await this.deactivateDailyRewardUseCase.execute(input);
    if (!result.isSuccess) {
      this.state.error = String(result.error);
      return;
    }
    this.state.data = result.data as any;
  }
}

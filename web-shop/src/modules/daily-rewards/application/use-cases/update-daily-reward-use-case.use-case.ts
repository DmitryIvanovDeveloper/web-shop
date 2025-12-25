import { Result, Success, Failure } from '../../../../../shared/result/result';
import { DailyRewardRepositoryPort } from '../ports/daily-reward-repository-port.port';
import { DailyRewardEntity } from '../../domain/entities/daily-reward-entity';


export class UpdateDailyRewardUseCase {
  constructor(private readonly dailyRewardRepositoryPort: DailyRewardRepositoryPort) {}

  public async execute(input: UpdateDailyRewardUseCaseInput): Promise<Result<DailyRewardEntity, Error>> {
    // Example flow: delegate to repository port
    const result = await this.dailyRewardRepositoryPort.update(input);
    if (!result.isSuccess) return Result.fail(result.error);
    return Result.ok(result.data);
  }
}

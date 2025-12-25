import { Result, Success, Failure } from '../../../../../shared/result/result';
import { DailyRewardRepositoryPort } from '../ports/daily-reward-repository-port.port';
import { DailyRewardEntity } from '../../domain/entities/daily-reward-entity';


export class GetDailyRewardByIdUseCase {
  constructor(private readonly dailyRewardRepositoryPort: DailyRewardRepositoryPort) {}

  public async execute(input: GetDailyRewardByIdUseCaseInput): Promise<Result<DailyRewardEntity, Error>> {
    // Example flow: delegate to repository port
    const result = await this.dailyRewardRepositoryPort.findById(input.id);
    if (!result.isSuccess) return Result.fail(result.error);
    return Result.ok(result.data);
  }
}

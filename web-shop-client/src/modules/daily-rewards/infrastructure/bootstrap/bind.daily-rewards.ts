import type { Container } from 'inversify';
import { DAILY_REWARDS_TYPES } from './types';
import { SupabaseDailyRewardRepository } from '../repositories/supabase-daily-reward.repository';
import { SupabaseRewardClaimRepository } from '../repositories/supabase-reward-claim.repository';
import { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability.use-case';
import { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward.use-case';
import { LoadDailyRewardsUseCase } from '../../application/use-cases/load-daily-rewards.use-case';
import { DailyRewardsPresenter } from '../../interface-adapters/presenters/daily-rewards-presenter';
import { DailyRewardsLocalizationLoadedEventHandler } from '../../interface-adapters/handlers/localization-loaded.handler';
import { DailyRewardsLocalizationChangedEventHandler } from '../../interface-adapters/handlers/localization-changed.handler';
import { LocalizationLoadedEvent } from '../../../localization/domain/events/localization-loaded.event';
import { LocalizationChangedEvent } from '../../../localization/domain/events/localization-changed.event';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';

export function bindDailyRewards(container: Container): void {
    container
    .bind(DAILY_REWARDS_TYPES.DailyRewardRepository)
    .to(SupabaseDailyRewardRepository)
    .inSingletonScope();

  container
    .bind(DAILY_REWARDS_TYPES.RewardClaimRepository)
    .to(SupabaseRewardClaimRepository)
    .inSingletonScope();

    container
    .bind(DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase)
    .to(CheckDailyRewardAvailabilityUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.ClaimDailyRewardUseCase)
    .to(ClaimDailyRewardUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.LoadDailyRewardsUseCase)
    .to(LoadDailyRewardsUseCase);

    container
    .bind(DAILY_REWARDS_TYPES.DailyRewardsPresenter)
    .to(DailyRewardsPresenter)
    .inSingletonScope();

    container
    .bind<IAsyncEventHandler<LocalizationLoadedEvent>>(DAILY_REWARDS_TYPES.LocalizationLoadedEventHandler)
    .to(DailyRewardsLocalizationLoadedEventHandler)
    .inTransientScope();

  container
    .bind<IAsyncEventHandler<LocalizationChangedEvent>>(DAILY_REWARDS_TYPES.LocalizationChangedEventHandler)
    .to(DailyRewardsLocalizationChangedEventHandler)
    .inTransientScope();
}





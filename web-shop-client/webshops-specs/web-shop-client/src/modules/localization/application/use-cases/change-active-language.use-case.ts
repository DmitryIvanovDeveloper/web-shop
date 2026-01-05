import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { LanguageRepositoryPort } from '../ports/language-repository.port';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';

export type ChangeActiveLanguageRequest = {
  languageCode: string;
};

export type ChangeActiveLanguageResponse = {
  success: true;
};

@injectable()
export class ChangeActiveLanguageUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.LanguageRepository)
    private readonly _languageRepository: LanguageRepositoryPort,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(request: ChangeActiveLanguageRequest): Promise<Result<ChangeActiveLanguageResponse, Error>> {
    try {
      this._logger.info('[ChangeActiveLanguageUseCase] Changing active language', { languageCode: request.languageCode });

      const result = await this._languageRepository.setActiveLanguage(request.languageCode);

      if (result.isFailure) {
        this._logger.error('[ChangeActiveLanguageUseCase] Failed to change active language', {
          languageCode: request.languageCode,
          error: result.error
        });
        return Failure.fail(result.error || new Error('Failed to change active language'));
      }

      this._logger.info('[ChangeActiveLanguageUseCase] Active language changed successfully', { languageCode: request.languageCode });

      return Success.ok({ success: true });
    } catch (error) {
      this._logger.error('[ChangeActiveLanguageUseCase] Unexpected error changing active language', {
        languageCode: request.languageCode,
        error
      });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

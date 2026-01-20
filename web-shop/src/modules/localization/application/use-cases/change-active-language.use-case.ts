import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import type { LanguageRepositoryPort } from '../ports/language-repository.port';
import type { ChangeActiveLanguageRequest } from '../input-output/localization.io';
import { LanguageNotFoundError } from '../../domain';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';

export type ChangeActiveLanguageResponse = void;

@injectable()
export class ChangeActiveLanguageUseCase {
  constructor(
    @inject(LOCALIZATION_TYPES.LanguageRepository)
    private readonly _languageRepository: LanguageRepositoryPort
  ) {}

  async execute(
    request: ChangeActiveLanguageRequest
  ): Promise<Result<ChangeActiveLanguageResponse, Error>> {
    try {
      
      const languageResult = await this._languageRepository.getByCode(request.languageCode);
      if (languageResult.isFailure) {
        return Failure.fail(languageResult.error || new Error('Unknown error'));
      }

      const targetLanguage = languageResult.value!;

      const activeLanguageResult = await this._languageRepository.getActiveLanguage();
      if (activeLanguageResult.isFailure) {
        return Failure.fail(activeLanguageResult.error || new Error('Unknown error'));
      }

      const currentActiveLanguage = activeLanguageResult.value!;

      if (currentActiveLanguage.code.value === request.languageCode) {
        return Success.ok(void 0);
      }

      const activateResult = await this._languageRepository.activateLanguage(request.languageCode);
      if (activateResult.isFailure) {
        return Failure.fail(activateResult.error || new Error('Unknown error'));
      }

      return Success.ok(void 0);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

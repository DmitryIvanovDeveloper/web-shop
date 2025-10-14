/**
 * Domain Types для Authentication
 * Чистые бизнес-сущности без внешних зависимостей
 */

/**
 * Пользователь приложения
 */
export interface AppUser {
  readonly userId: string;
  readonly username: string;
  readonly appId: string;
}

/**
 * Запрос на валидацию App ID
 */
export interface ValidateAppLoginRequest {
  readonly appId: string;
}

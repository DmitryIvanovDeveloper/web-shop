import { Event } from '../../application/ports/event-bus.port';

/**
 * Примеры событий для демонстрации правильного использования Event Bus
 * Согласно документации: ТОЛЬКО для межмодульного общения
 */

// Базовый класс для всех событий
export abstract class BaseEvent implements Event {
  public readonly id: string;
  public readonly type: string;
  public readonly timestamp: Date;
  public readonly source: string;
  public readonly payload: any;

  constructor(type: string, payload: any, source: string) {
    this.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type;
    this.timestamp = new Date();
    this.source = source;
    this.payload = payload;
  }
}

// Пример события: Пользователь создан (межмодульное событие)
export class UserCreatedEvent extends BaseEvent {
  constructor(userId: string, email: string, name: string) {
    super('UserCreated', { userId, email, name }, 'user-management');
  }
}

// Пример события: Заказ создан (межмодульное событие)
export class OrderCreatedEvent extends BaseEvent {
  constructor(orderId: string, userId: string, amount: number, currency: string) {
    super('OrderCreated', { orderId, userId, amount, currency }, 'order-management');
  }
}

// Пример события: Данные dashboard обновлены (межмодульное событие)
export class DashboardDataUpdatedEvent extends BaseEvent {
  constructor(dashboardId: string, dataType: 'sales' | 'revenue' | 'geography' | 'conversion') {
    super('DashboardDataUpdated', { dashboardId, dataType, timestamp: new Date() }, 'realtime-dashboard');
  }
}

// Пример обработчика событий
export abstract class EventHandler<T extends BaseEvent> {
  abstract handle(event: T): Promise<void>;
}

/**
 * Пример правильного использования Event Bus в Use Case:
 * 
 * @injectable()
 * export class CreateUserUseCase {
 *   constructor(
 *     @inject(TYPES.UserRepository)
 *     private readonly _userRepository: UserRepositoryPort,
 *     @inject(ROOT_TYPES.EventBus)
 *     private readonly _eventBus: EventBus
 *   ) {}
 * 
 *   public async execute(input: CreateUserInput): Promise<Result<User, Error>> {
 *     // Создание пользователя
 *     const user = await this._userRepository.create(input);
 *     
 *     // Публикация события для других модулей (межмодульное общение)
 *     await this._eventBus.publishSync(new UserCreatedEvent(user.id, user.email, user.name));
 *     
 *     return Result.success(user);
 *   }
 * }
 * 
 * // Обработчик в другом модуле
 * @injectable()
 * export class UserCreatedEventHandler extends EventHandler<UserCreatedEvent> {
 *   constructor(
 *     @inject(TYPES.EmailService)
 *     private readonly _emailService: EmailServicePort
 *   ) {
 *     super();
 *   }
 * 
 *   public async handle(event: UserCreatedEvent): Promise<void> {
 *     // Отправка приветственного email
 *     await this._emailService.sendWelcomeEmail(event.payload.userId, event.payload.email);
 *   }
 * }
 */

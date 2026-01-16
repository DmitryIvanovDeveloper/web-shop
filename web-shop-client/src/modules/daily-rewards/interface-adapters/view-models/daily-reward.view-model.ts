/**
 * ViewModel для отдельной карточки daily reward.
 * Каждый элемент сам знает свое состояние (активный/полученный/не активный).
 */
export type DailyRewardStatus = 'active' | 'claimed' | 'inactive' | 'claiming';

export interface DailyRewardViewModel {
  readonly id: string;
  readonly type: 'points' | 'currency' | 'item';
  readonly title: string;
  readonly description: string;
  readonly points: number;
  readonly dayNumber: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  
  // Состояние награды
  readonly status: DailyRewardStatus;
  readonly isActive: boolean;
  readonly isClaimedToday: boolean;
  readonly isClaiming: boolean;
  
  // UI свойства
  readonly typeIcon: string;
  readonly statusBadge: {
    text: string;
    backgroundColor: string;
    color: string;
  };
  
  // Обратный отсчет
  readonly nextClaimDate: Date | null;
  readonly timeUntilNextClaim: string | null; // Форматированное время "23:45:12"
  
  // Методы для определения состояния
  canClaim(): boolean;
  shouldShowPadlock(): boolean;
  shouldShowClaimed(): boolean;
  shouldShowClaimButton(): boolean;
  getTimeUntilNextClaim(): string | null;
  setNextClaimDate(date: Date | null): void;
}

export class DailyRewardCardViewModelImpl implements DailyRewardViewModel {
  readonly id: string;
  readonly type: 'points' | 'currency' | 'item';
  readonly title: string;
  readonly description: string;
  readonly points: number;
  readonly dayNumber: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  
  private _status: DailyRewardStatus;
  readonly isActive: boolean;
  readonly isClaimedToday: boolean;
  private _isClaiming: boolean;
  
  readonly typeIcon: string;
  private _statusBadge: {
    text: string;
    backgroundColor: string;
    color: string;
  };

  private _nextClaimDate: Date | null = null;
  private _timeUntilNextClaim: string | null = null;
  private _countdownInterval: NodeJS.Timeout | null = null;
  private _onCountdownUpdate?: () => void;

  get status(): DailyRewardStatus {
    return this._status;
  }

  get isClaiming(): boolean {
    return this._isClaiming;
  }

  get statusBadge(): {
    text: string;
    backgroundColor: string;
    color: string;
  } {
    return this._statusBadge;
  }

  get nextClaimDate(): Date | null {
    return this._nextClaimDate;
  }

  get timeUntilNextClaim(): string | null {
    return this._timeUntilNextClaim;
  }

  constructor(data: {
    id: string;
    type: 'points' | 'currency' | 'item';
    title: string;
    description: string;
    points: number;
    dayNumber: number | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isClaimedToday: boolean;
    isClaiming: boolean;
  }) {
    this.id = data.id;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.points = data.points;
    this.dayNumber = data.dayNumber;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isActive = data.isActive;
    this.isClaimedToday = data.isClaimedToday;
    this._isClaiming = data.isClaiming;
    
    // Определяем статус на основе состояния
    this._status = this.determineStatus();
    
    // UI свойства
    this.typeIcon = this.getTypeIcon();
    this._statusBadge = this.getStatusBadge();
  }

  /**
   * Обновляет состояние isClaiming и пересчитывает статус и бейдж
   */
  setIsClaiming(value: boolean): void {
    this._isClaiming = value;
    this._status = this.determineStatus();
    this._statusBadge = this.getStatusBadge();
  }

  /**
   * Устанавливает дату следующего claim'а и запускает обратный отсчет
   */
  setNextClaimDate(date: Date | null): void {
    this._nextClaimDate = date;
    this.updateCountdown();
    
    // Очищаем предыдущий интервал
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
    
    // Запускаем обновление каждую секунду
    if (date) {
      this._countdownInterval = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  /**
   * Устанавливает callback для уведомления об обновлении обратного отсчета
   */
  setOnCountdownUpdate(callback: () => void): void {
    this._onCountdownUpdate = callback;
  }

  /**
   * Обновляет обратный отсчет времени
   */
  private updateCountdown(): void {
    if (!this._nextClaimDate) {
      this._timeUntilNextClaim = null;
      this._onCountdownUpdate?.();
      return;
    }

    const now = new Date();
    const diff = this._nextClaimDate.getTime() - now.getTime();

    if (diff <= 0) {
      this._timeUntilNextClaim = null;
      if (this._countdownInterval) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
      }
      this._onCountdownUpdate?.();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this._timeUntilNextClaim = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    this._onCountdownUpdate?.();
  }

  /**
   * Получает форматированное время до следующего claim'а
   */
  getTimeUntilNextClaim(): string | null {
    return this._timeUntilNextClaim;
  }

  /**
   * Определяет статус награды на основе текущего состояния
   */
  private determineStatus(): DailyRewardStatus {
    if (this._isClaiming) {
      return 'claiming';
    }
    if (this.isClaimedToday) {
      return 'claimed';
    }
    if (this.isActive) {
      return 'active';
    }
    return 'inactive';
  }

  /**
   * Может ли пользователь claimнуть эту награду
   */
  canClaim(): boolean {
    return this.isActive && !this.isClaimedToday && !this._isClaiming;
  }

  /**
   * Нужно ли показывать замок (награда не активна, но еще не получена)
   */
  shouldShowPadlock(): boolean {
    return !this.isActive && !this.isClaimedToday && !this._isClaiming;
  }

  /**
   * Нужно ли показывать статус "Claimed"
   */
  shouldShowClaimed(): boolean {
    return this.isClaimedToday;
  }

  /**
   * Нужно ли показывать кнопку "Claim Reward"
   * Кнопка показывается если награда активна (даже если в процессе claim)
   */
  shouldShowClaimButton(): boolean {
    return this.isActive && !this.isClaimedToday;
  }

  /**
   * Получает иконку типа награды
   */
  private getTypeIcon(): string {
    switch (this.type) {
      case 'points':
        return '💰';
      case 'currency':
        return '🪙';
      case 'item':
        return '🎁';
      default:
        return '🎉';
    }
  }

  /**
   * Получает бейдж статуса
   */
  private getStatusBadge(): {
    text: string;
    backgroundColor: string;
    color: string;
  } {
    switch (this._status) {
      case 'active':
        return {
          text: 'Active',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#34D399'
        };
      case 'claimed':
        return {
          text: 'Claimed',
          backgroundColor: 'rgba(148, 163, 184, 0.12)',
          color: '#CBD5E1'
        };
      case 'claiming':
        return {
          text: 'Claiming...',
          backgroundColor: 'rgba(96, 165, 250, 0.15)',
          color: '#60A5FA'
        };
      case 'inactive':
      default:
        return {
          text: 'Inactive',
          backgroundColor: 'rgba(148, 163, 184, 0.12)',
          color: '#CBD5E1'
        };
    }
  }

  /**
   * Создает ViewModel из данных
   */
  static create(data: {
    id: string;
    type: 'points' | 'currency' | 'item';
    title: string;
    description: string;
    points: number;
    dayNumber: number | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isClaimedToday: boolean;
    isClaiming: boolean;
  }): DailyRewardViewModel {
    return new DailyRewardCardViewModelImpl(data);
  }
}


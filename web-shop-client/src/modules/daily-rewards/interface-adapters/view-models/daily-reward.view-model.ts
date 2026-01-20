
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
  
    readonly status: DailyRewardStatus;
  readonly isActive: boolean;
  readonly isClaimedToday: boolean;
  readonly isClaiming: boolean;
  
    readonly typeIcon: string;
  readonly statusBadge: {
    text: string;
    backgroundColor: string;
    color: string;
  };
  
    readonly nextClaimDate: Date | null;
  readonly timeUntilNextClaim: string | null;   
    canClaim(): boolean;
  shouldShowPadlock(): boolean;
  shouldShowClaimed(): boolean;
  shouldShowClaimButton(): boolean;
  hasTimer(): boolean;
  getTimeUntilNextClaim(): string | null;
  setNextClaimDate(date: Date | null): void;
  setOnCountdownUpdate(callback: () => void): void;
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

    this._status = this.determineStatus();
    
    this.typeIcon = this.getTypeIcon();
    this._statusBadge = this.getStatusBadge();
  }

  
  setIsClaiming(value: boolean): void {
    this._isClaiming = value;
    this._status = this.determineStatus();
    this._statusBadge = this.getStatusBadge();
  }

  
  setNextClaimDate(date: Date | null): void {
    this._nextClaimDate = date;
    this.updateCountdown();
    
        if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
    
        if (date) {
      this._countdownInterval = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  
  setOnCountdownUpdate(callback: () => void): void {
    this._onCountdownUpdate = callback;
  }

  
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

  
  getTimeUntilNextClaim(): string | null {
    return this._timeUntilNextClaim;
  }

  
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

  
  canClaim(): boolean {
    return this.isActive && !this.isClaimedToday && !this._isClaiming;
  }

  
  shouldShowPadlock(): boolean {
    return !this.isActive && !this.isClaimedToday && !this._isClaiming && !this.hasTimer();
  }

  
  hasTimer(): boolean {
    return !!this._nextClaimDate;
  }

  
  shouldShowClaimed(): boolean {
    return this.isClaimedToday;
  }

  
  shouldShowClaimButton(): boolean {
    return this.isActive && !this.isClaimedToday;
  }

  
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


import { Period } from './period.value-object';

export type ComparisonDirection = 'up' | 'down' | 'neutral';

export class ComparisonPeriod {
  public readonly current: Period;
  public readonly previous: Period;
  public readonly changePercent: number;
  public readonly direction: ComparisonDirection;
  public readonly isSignificant: boolean;

  private constructor(
    current: Period,
    previous: Period,
    changePercent: number,
    direction: ComparisonDirection,
    isSignificant: boolean = true
  ) {
    this.current = current;
    this.previous = previous;
    this.changePercent = changePercent;
    this.direction = direction;
    this.isSignificant = isSignificant;
  }

  public static create(
    current: Period,
    previous: Period,
    currentValue: number,
    previousValue: number
  ): ComparisonPeriod {
    if (previousValue === 0 && currentValue === 0) {
      return new ComparisonPeriod(current, previous, 0, 'neutral', false);
    }

    if (previousValue === 0) {
      return new ComparisonPeriod(current, previous, 100, 'up', true);
    }

    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    const direction: ComparisonDirection =
      changePercent > 0 ? 'up' :
      changePercent < 0 ? 'down' : 'neutral';

    const isSignificant = Math.abs(changePercent) > 0.1; // Более 0.1% считается значимым

    return new ComparisonPeriod(current, previous, Math.round(changePercent * 100) / 100, direction, isSignificant);
  }

  public getFormattedChange(): string {
    const prefix = this.direction === 'up' ? '+' : '';
    return `${prefix}${this.changePercent}%`;
  }

  public getDirectionSymbol(): string {
    switch (this.direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
    }
  }

  public isPositive(): boolean {
    return this.direction === 'up';
  }

  public isNegative(): boolean {
    return this.direction === 'down';
  }
}































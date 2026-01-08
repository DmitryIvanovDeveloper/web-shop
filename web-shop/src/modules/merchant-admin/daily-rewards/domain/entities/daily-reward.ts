import type { RewardId } from '../value-objects/reward-id';
import type { RewardType } from '../value-objects/reward-type';

export class DailyReward {
  private constructor(
    public readonly id: RewardId,
    public readonly appId: string,
    public readonly type: RewardType,
    public readonly title: string,
    public readonly description: string,
    public readonly points: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: RewardId,
    appId: string,
    type: RewardType,
    title: string,
    description: string,
    points: number
  ): DailyReward {
    // Business rules validation
    if (!title || title.trim().length === 0) {
      throw new Error('Reward title cannot be empty');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Reward description cannot be empty');
    }

    if (points <= 0) {
      throw new Error('Reward points must be positive');
    }

    if (!appId || appId.trim().length === 0) {
      throw new Error('App ID cannot be empty');
    }

    const now = new Date();
    return new DailyReward(id, appId.trim(), type, title.trim(), description.trim(), points, true, now, now);
  }

  static fromDatabase(
    id: RewardId,
    appId: string,
    type: RewardType,
    title: string,
    description: string,
    points: number,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ): DailyReward {
    return new DailyReward(id, appId, type, title, description, points, isActive, createdAt, updatedAt);
  }

  withTitle(title: string): DailyReward {
    if (!title || title.trim().length === 0) {
      throw new Error('Reward title cannot be empty');
    }
    return new DailyReward(
      this.id,
      this.appId,
      this.type,
      title.trim(),
      this.description,
      this.points,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  withDescription(description: string): DailyReward {
    if (!description || description.trim().length === 0) {
      throw new Error('Reward description cannot be empty');
    }
    return new DailyReward(
      this.id,
      this.appId,
      this.type,
      this.title,
      description.trim(),
      this.points,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  withPoints(points: number): DailyReward {
    if (points <= 0) {
      throw new Error('Reward points must be positive');
    }
    return new DailyReward(
      this.id,
      this.appId,
      this.type,
      this.title,
      this.description,
      points,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  activate(): DailyReward {
    return new DailyReward(
      this.id,
      this.appId,
      this.type,
      this.title,
      this.description,
      this.points,
      true,
      this.createdAt,
      new Date()
    );
  }

  deactivate(): DailyReward {
    return new DailyReward(
      this.id,
      this.appId,
      this.type,
      this.title,
      this.description,
      this.points,
      false,
      this.createdAt,
      new Date()
    );
  }
}

export type ChangeType = 'feature' | 'bugfix' | 'improvement' | 'breaking-change';

export class ChangeItem {
  constructor(
    public readonly type: ChangeType,
    public readonly description: string
  ) {}

  static create(type: ChangeType, description: string): ChangeItem {
    if (!description || description.trim().length === 0) {
      throw new Error('Change description cannot be empty');
    }

    if (!['feature', 'bugfix', 'improvement', 'breaking-change'].includes(type)) {
      throw new Error('Invalid change type');
    }

    return new ChangeItem(type, description.trim());
  }

  toString(): string {
    return `${this.type}: ${this.description}`;
  }
}








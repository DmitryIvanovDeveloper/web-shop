export type ProjectStatusType = 'active' | 'archived' | 'draft';

export class ProjectStatus {
  private constructor(private readonly _value: ProjectStatusType) {}

  static create(value: string): ProjectStatus {
    const validStatuses: ProjectStatusType[] = ['active', 'archived', 'draft'];
    if (!validStatuses.includes(value as ProjectStatusType)) {
      throw new Error(`Invalid project status: ${value}. Must be one of: ${validStatuses.join(', ')}`);
    }
    return new ProjectStatus(value as ProjectStatusType);
  }

  static fromString(value: string): ProjectStatus {
    return new ProjectStatus(value as ProjectStatusType);
  }

  get value(): ProjectStatusType {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: ProjectStatus): boolean {
    return this._value === other._value;
  }

  isActive(): boolean {
    return this._value === 'active';
  }

  isArchived(): boolean {
    return this._value === 'archived';
  }

  isDraft(): boolean {
    return this._value === 'draft';
  }
}
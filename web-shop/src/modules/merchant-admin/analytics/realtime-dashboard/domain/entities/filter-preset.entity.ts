import { FilterSet } from '../value-objects/filter-set.value-object';

export interface FilterPresetProps {
  id: string;
  name: string;
  filterSet: FilterSet;
  createdAt: Date;
  updatedAt: Date;
}

export class FilterPreset {
  private constructor(private readonly props: FilterPresetProps) {}

  public static create(props: Omit<FilterPresetProps, 'createdAt' | 'updatedAt'>): FilterPreset {
    const now = new Date();
    return new FilterPreset({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(props: FilterPresetProps): FilterPreset {
    return new FilterPreset(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get filterSet(): FilterSet {
    return this.props.filterSet;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(name: string, filterSet: FilterSet): FilterPreset {
    return new FilterPreset({
      ...this.props,
      name,
      filterSet,
      updatedAt: new Date(),
    });
  }
}


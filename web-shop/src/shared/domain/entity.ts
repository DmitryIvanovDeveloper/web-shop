export abstract class Entity<T> {
  protected readonly props: T;
  public readonly id?: string;

  protected constructor(props: T, id?: string) {
    this.props = props;
    this.id = id;
  }
}


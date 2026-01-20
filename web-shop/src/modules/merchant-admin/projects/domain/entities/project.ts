import { Result } from '../../../../../shared/result/result';
import { InvalidArgumentError } from '../../../../../shared/domain/errors/invalid-argument.error';
import { ProjectId, AppId, ProjectStatus, MerchantId } from '../index';
import { InvalidProjectDataError } from '../errors/project.error';

export interface ProjectProps {
  readonly id: ProjectId;
  readonly appId: AppId;
  readonly name: string;
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly merchantId: MerchantId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Project {
  private constructor(
    public readonly id: ProjectId,
    public readonly appId: AppId,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly status: ProjectStatus,
    public readonly merchantId: MerchantId,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(props: Omit<ProjectProps, 'id' | 'createdAt' | 'updatedAt'>): Result<Project, InvalidArgumentError | InvalidProjectDataError> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.error(new InvalidProjectDataError('name', 'cannot be empty'));
    }

    if (props.name.trim().length > 100) {
      return Result.error(new InvalidProjectDataError('name', 'cannot be longer than 100 characters'));
    }

    if (props.description && props.description.length > 500) {
      return Result.error(new InvalidProjectDataError('description', 'cannot be longer than 500 characters'));
    }

    const id = ProjectId.create(crypto.randomUUID());
    const now = new Date();

    return Result.ok(new Project(
      id,
      props.appId,
      props.name.trim(),
      props.description?.trim(),
      props.status,
      props.merchantId,
      now,
      now
    ));
  }

  static fromDatabase(props: ProjectProps): Project {
    return new Project(
      props.id,
      props.appId,
      props.name,
      props.description,
      props.status,
      props.merchantId,
      props.createdAt,
      props.updatedAt
    );
  }

  update(details: {
    name?: string;
    description?: string;
    status?: ProjectStatus;
  }): Result<Project, InvalidProjectDataError> {
    let newName = this.name;
    let newDescription = this.description;
    let newStatus = this.status;

    if (details.name !== undefined) {
      if (!details.name || details.name.trim().length === 0) {
        return Result.error(new InvalidProjectDataError('name', 'cannot be empty'));
      }
      if (details.name.trim().length > 100) {
        return Result.error(new InvalidProjectDataError('name', 'cannot be longer than 100 characters'));
      }
      newName = details.name.trim();
    }

    if (details.description !== undefined) {
      if (details.description && details.description.length > 500) {
        return Result.error(new InvalidProjectDataError('description', 'cannot be longer than 500 characters'));
      }
      newDescription = details.description?.trim();
    }

    if (details.status !== undefined) {
      newStatus = details.status;
    }

    return Result.ok(new Project(
      this.id,
      this.appId,
      newName,
      newDescription,
      newStatus,
      this.merchantId,
      this.createdAt,
      new Date() 
    ));
  }

  activate(): Project {
    return new Project(
      this.id,
      this.appId,
      this.name,
      this.description,
      ProjectStatus.create('active'),
      this.merchantId,
      this.createdAt,
      new Date()
    );
  }

  archive(): Project {
    return new Project(
      this.id,
      this.appId,
      this.name,
      this.description,
      ProjectStatus.create('archived'),
      this.merchantId,
      this.createdAt,
      new Date()
    );
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  isArchived(): boolean {
    return this.status.isArchived();
  }

  isDraft(): boolean {
    return this.status.isDraft();
  }
}


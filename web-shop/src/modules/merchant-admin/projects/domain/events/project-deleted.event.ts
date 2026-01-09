import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ProjectDeletedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly merchantId: string,
    public readonly appId: string,
    public readonly projectName: string
  ) {
    super('project.deleted', 'projects');
  }
}


import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly merchantId: string,
    public readonly appId: string,
    public readonly projectName: string
  ) {
    super('project.created', 'projects');
  }
}
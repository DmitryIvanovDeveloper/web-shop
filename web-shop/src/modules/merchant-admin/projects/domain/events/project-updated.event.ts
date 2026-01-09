import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ProjectUpdatedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly merchantId: string,
    public readonly appId: string,
    public readonly projectName: string,
    public readonly changes: Record<string, any>
  ) {
    super('project.updated', 'projects');
  }
}
import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ProjectSelectedEvent extends DomainEvent {
  constructor(
    public readonly merchantId: string,
    public readonly projectId: string,
    public readonly appId: string,
    public readonly projectName: string
  ) {
    super('project.selected', 'projects');
  }
}
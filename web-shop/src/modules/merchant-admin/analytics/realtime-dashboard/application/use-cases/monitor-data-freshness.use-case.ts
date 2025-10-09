import { DataFreshness } from '../../domain/value-objects/data-freshness.value-object';
import { Result } from '../../../../../../shared/domain/result/result';
import { InvalidArgumentError } from '../../../../../../shared/domain/errors/invalid-argument.error';

export interface FreshnessMetrics {
  panelId: string;
  freshness: DataFreshness;
  status: 'fresh' | 'warning' | 'stale';
  lagSeconds: number;
  relativeTime: string;
}

export interface MonitorDataFreshnessInput {
  panelUpdates: Map<string, Date>; // panelId -> lastUpdated
  targetLatencySeconds?: number;
  maxLatencySeconds?: number;
}

export interface MonitorDataFreshnessOutput {
  metrics: FreshnessMetrics[];
  overallStatus: 'fresh' | 'warning' | 'stale';
  stalePanels: string[];
  warningPanels: string[];
}

export class MonitorDataFreshnessUseCase {
  public execute(input: MonitorDataFreshnessInput): Result<MonitorDataFreshnessOutput, InvalidArgumentError> {
    if (!input.panelUpdates || input.panelUpdates.size === 0) {
      return Result.error(new InvalidArgumentError('panelUpdates cannot be empty'));
    }

    const metrics: FreshnessMetrics[] = [];
    const stalePanels: string[] = [];
    const warningPanels: string[] = [];
    const now = new Date();

    for (const [panelId, lastUpdated] of input.panelUpdates.entries()) {
      const freshnessResult = DataFreshness.create({
        lastUpdated,
        targetLatencySeconds: input.targetLatencySeconds,
        maxLatencySeconds: input.maxLatencySeconds,
      });

      if (freshnessResult.isFailure()) {
        return Result.error(freshnessResult.error);
      }

      const freshness = freshnessResult.data!;
      const status = freshness.getStatus(now);
      const lagSeconds = freshness.getLagSeconds(now);
      const relativeTime = freshness.getRelativeTime(now);

      metrics.push({
        panelId,
        freshness,
        status,
        lagSeconds,
        relativeTime,
      });

      if (status === 'stale') {
        stalePanels.push(panelId);
      } else if (status === 'warning') {
        warningPanels.push(panelId);
      }
    }

    // Overall status: stale if any panel is stale, warning if any is warning, otherwise fresh
    const overallStatus = stalePanels.length > 0 ? 'stale' : warningPanels.length > 0 ? 'warning' : 'fresh';

    return Result.ok({
      metrics,
      overallStatus,
      stalePanels,
      warningPanels,
    });
  }

  public getIncidentPlaybook(status: 'fresh' | 'warning' | 'stale'): string[] {
    switch (status) {
      case 'stale':
        return [
          '1. Check backend service health',
          '2. Verify WebSocket connection',
          '3. Review data pipeline logs',
          '4. Check database replication lag',
          '5. Contact on-call engineer if issue persists',
        ];
      case 'warning':
        return [
          '1. Monitor lag metrics closely',
          '2. Check for network issues',
          '3. Review recent deployments',
          '4. Prepare to escalate if lag increases',
        ];
      default:
        return ['Data is fresh - no action needed'];
    }
  }
}



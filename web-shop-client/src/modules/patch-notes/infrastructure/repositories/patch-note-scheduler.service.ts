import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { PatchNoteSchedulerPort } from '../../application/ports/patch-note-scheduler.port';
import type { PatchNoteId } from '../../domain/value-objects/patch-note-id';

@injectable()
export class PatchNoteSchedulerService implements PatchNoteSchedulerPort {
  // Simple in-memory storage for scheduled publications
  // In production, this should be stored in database and processed by cron jobs
  private readonly scheduledPublications = new Map<string, {
    patchNoteId: string;
    publishDate: Date;
    timeoutId?: NodeJS.Timeout;
  }>();

  constructor(
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async schedulePublication(patchNoteId: PatchNoteId, publishDate: Date): Promise<Result<void, Error>> {
    try {
      this._logger.info('[PatchNoteSchedulerService] Scheduling publication', {
        patchNoteId: patchNoteId.value,
        publishDate: publishDate.toISOString()
      });

      // Cancel any existing scheduled publication for this patch note
      await this.cancelScheduledPublication(patchNoteId);

      // Calculate delay until publication
      const now = new Date();
      const delay = publishDate.getTime() - now.getTime();

      if (delay <= 0) {
        return Failure.fail(new Error('Publish date must be in the future'));
      }

      // Schedule the publication
      const timeoutId = setTimeout(async () => {
        try {
          // TODO: Publish the patch note automatically
          // This would typically involve calling PublishPatchNoteUseCase
          this._logger.info('[PatchNoteSchedulerService] Auto-publishing patch note', {
            patchNoteId: patchNoteId.value
          });

          // Remove from scheduled list
          this.scheduledPublications.delete(patchNoteId.value);

        } catch (error) {
          this._logger.error('[PatchNoteSchedulerService] Failed to auto-publish patch note', {
            patchNoteId: patchNoteId.value,
            error
          });
        }
      }, delay);

      // Store the scheduled publication
      this.scheduledPublications.set(patchNoteId.value, {
        patchNoteId: patchNoteId.value,
        publishDate,
        timeoutId
      });

      this._logger.info('[PatchNoteSchedulerService] Publication scheduled successfully');
      return Success.ok(undefined);

    } catch (error) {
      this._logger.error('[PatchNoteSchedulerService] Failed to schedule publication', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async cancelScheduledPublication(patchNoteId: PatchNoteId): Promise<Result<void, Error>> {
    try {
      const scheduled = this.scheduledPublications.get(patchNoteId.value);

      if (scheduled) {
        // Clear the timeout
        if (scheduled.timeoutId) {
          clearTimeout(scheduled.timeoutId);
        }

        // Remove from scheduled list
        this.scheduledPublications.delete(patchNoteId.value);

        this._logger.info('[PatchNoteSchedulerService] Scheduled publication cancelled', {
          patchNoteId: patchNoteId.value
        });
      }

      return Success.ok(undefined);

    } catch (error) {
      this._logger.error('[PatchNoteSchedulerService] Failed to cancel scheduled publication', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  // Utility method to get all scheduled publications (for debugging)
  getScheduledPublications(): Array<{ patchNoteId: string; publishDate: Date }> {
    return Array.from(this.scheduledPublications.values()).map(item => ({
      patchNoteId: item.patchNoteId,
      publishDate: item.publishDate
    }));
  }
}

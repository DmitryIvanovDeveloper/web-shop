import { injectable, inject } from 'inversify';
import type { DatabaseClientPort } from '../../application/ports/database-client.port';
import { ConfigSubscriptionPort, UnsubscribeFn } from '../../application/ports/config-subscription.port';
import type { AppConfig } from '../../shared/config/app-config.types';
import type { Logger } from '../../application/ports/logger.port';
import { ROOT_TYPES } from '../bootstrap/types';

interface AppConfigRow {
	id: string;
	app_id: string;
	merchant_id: string;
	version: number;
	is_active: boolean;
	is_draft?: boolean;
	config: unknown;
	created_at?: string;
	updated_at?: string;
}


@injectable()
export class SupabaseConfigSubscriptionAdapter implements ConfigSubscriptionPort {
	private activeChannel: any = null;
	private activeSubscriptions: Map<string, (config: AppConfig) => void> = new Map();

	constructor(
		@inject(ROOT_TYPES.DatabaseClient)
		private readonly _db: DatabaseClientPort,
		@inject(ROOT_TYPES.Logger)
		private readonly _logger: Logger
	) {}

	public subscribe(appId: string, callback: (config: AppConfig) => void): UnsubscribeFn {
		this._logger.info('[SupabaseConfigSubscriptionAdapter] Subscribing to config updates', { appId });

				this.activeSubscriptions.set(appId, callback);

		try {
			const supabaseClient = this._db.getClient();
			if (!supabaseClient) {
				this._logger.error('[SupabaseConfigSubscriptionAdapter] Supabase client is not available');
				return () => {};
			}
			
						const channelName = `app_configs_grape:${appId}`;

						const channel = supabaseClient
			.channel(channelName)
			.on(
				'postgres_changes',
				{
					event: '*', 					schema: 'public',
					table: 'app_configs_grape',
					filter: `app_id=eq.${appId}`,
				},
				async (payload: any) => {
					this._logger.info('[SupabaseConfigSubscriptionAdapter] Received config change', {
						event: payload.eventType,
						appId,
					});

										const isPreview = this._isPreviewMode();
					
										const shouldProcess = isPreview 
						? payload.new && payload.new.is_draft === true
						: payload.new && payload.new.is_active === true;

					if (shouldProcess) {
						try {
														const config = await (isPreview ? this._loadDraftConfig(appId) : this._loadActiveConfig(appId));
							if (config) {
								callback(config);
							}
						} catch (error) {
							this._logger.error('[SupabaseConfigSubscriptionAdapter] Failed to load updated config', error);
						}
					} else if (payload.eventType === 'DELETE') {
						this._logger.warn('[SupabaseConfigSubscriptionAdapter] Config deleted', { appId });
											}
				}
			)
			.subscribe((status: string) => {
				this._logger.info('[SupabaseConfigSubscriptionAdapter] Realtime status', {
					status,
					channel: channelName,
				});

				if (status === 'SUBSCRIBED') {
					this._logger.info('[SupabaseConfigSubscriptionAdapter] Successfully subscribed to updates');
				} else if (status === 'CLOSED') {
					this._logger.warn('[SupabaseConfigSubscriptionAdapter] Channel closed');
										setTimeout(() => {
						this._logger.info('[SupabaseConfigSubscriptionAdapter] Attempting to resubscribe');
						this.subscribe(appId, callback);
					}, 3000);
				}
			});

			this.activeChannel = channel;

						return () => {
				this._logger.info('[SupabaseConfigSubscriptionAdapter] Unsubscribing', { appId });
				this.activeSubscriptions.delete(appId);
				if (this.activeChannel) {
					supabaseClient.removeChannel(this.activeChannel);
					this.activeChannel = null;
				}
			};
		} catch (error) {
			this._logger.error('[SupabaseConfigSubscriptionAdapter] Failed to subscribe to config updates', error);
						return () => {};
		}
	}

	public unsubscribe(): void {
		this._logger.info('[SupabaseConfigSubscriptionAdapter] Unsubscribing from all config updates');
		
		const supabaseClient = this._db.getClient();
		
		if (this.activeChannel) {
			supabaseClient.removeChannel(this.activeChannel);
			this.activeChannel = null;
		}
		
		this.activeSubscriptions.clear();
	}

	private async _loadActiveConfig(appId: string): Promise<AppConfig | null> {
		const { data, error } = await this._db
			.from('app_configs_grape')
			.select('*')
			.eq('app_id', appId)
			.eq('is_active', true)
			.eq('is_draft', false)
			.order('version', { ascending: false })
			.limit(1);

		if (error) {
			this._logger.error('[SupabaseConfigSubscriptionAdapter] Failed to load active config', error);
			throw error;
		}

		const row = Array.isArray(data) ? (data[0] as AppConfigRow | undefined) : undefined;
		if (!row) {
			this._logger.warn('[SupabaseConfigSubscriptionAdapter] No active config found', { appId });
			return null;
		}

		return row.config as AppConfig;
	}

	private async _loadDraftConfig(appId: string): Promise<AppConfig | null> {
		const { data, error } = await this._db
			.from('app_configs_grape')
			.select('*')
			.eq('app_id', appId)
			.eq('is_draft', true)
			.order('version', { ascending: false })
			.limit(1);

		if (error) {
			this._logger.error('[SupabaseConfigSubscriptionAdapter] Failed to load draft config', error);
			throw error;
		}

		const row = Array.isArray(data) ? (data[0] as AppConfigRow | undefined) : undefined;
		if (!row) {
			this._logger.warn('[SupabaseConfigSubscriptionAdapter] No draft config found', { appId });
			return null;
		}

		return row.config as AppConfig;
	}

	private _isPreviewMode(): boolean {
		if (typeof window !== 'undefined') {
			try {
				const url = new URL(window.location.href);
				return url.searchParams.get('previewMode') === 'true';
			} catch {}
		}
		return false;
	}
}


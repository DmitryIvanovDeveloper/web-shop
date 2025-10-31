import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeClientPort, RealtimeMessage } from '../../application/ports/realtime-client.port';
import { ROOT_TYPES } from '../bootstrap/types';
import type { Logger } from '../../application/ports/logger.port';

/**
 * Supabase Realtime Client Implementation
 * 
 * Infrastructure implementation of RealtimeClientPort using Supabase Realtime
 * Subscribes to database changes in real-time
 */
@injectable()
export class SupabaseRealtimeClient implements RealtimeClientPort {
  private supabase: SupabaseClient | null = null;
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, ((message: RealtimeMessage<any>) => void)[]> = new Map();
  private _isConnected: boolean = false;
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public async connect(): Promise<void> {
    if (this.supabase) {
      this._logger.info('[SupabaseRealtimeClient] Already connected');
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = 'Supabase credentials not found. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY';
      this._logger.error('[SupabaseRealtimeClient] ' + errorMsg);
      throw new Error(errorMsg);
    }

    // Use anon key for client-side with RLS support
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true, // Persist auth session for RLS
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10 // Rate limiting
        }
      }
    });

    this._isConnected = true;
    this._notifyConnectionStatus(true);
    this._logger.info('[SupabaseRealtimeClient] Connected successfully');
  }

  public async disconnect(): Promise<void> {
    if (!this.supabase) {
      this._logger.warn('[SupabaseRealtimeClient] Not connected');
      return;
    }

    // Unsubscribe from all channels
    for (const [channelName, channel] of this.channels.entries()) {
      await this.supabase.removeChannel(channel);
      this._logger.info('[SupabaseRealtimeClient] Unsubscribed from channel', { channelName });
    }

    this.channels.clear();
    this.callbacks.clear();
    this.supabase = null;
    this._isConnected = false;
    this._notifyConnectionStatus(false);
    this._logger.info('[SupabaseRealtimeClient] Disconnected');
  }

  public subscribe<T>(channelName: string, callback: (message: RealtimeMessage<T>) => void): void {
    if (!this.supabase) {
      this._logger.error('[SupabaseRealtimeClient] Cannot subscribe: not connected');
      throw new Error('RealtimeClient not connected. Call connect() first.');
    }

    // Store callback
    const existingCallbacks = this.callbacks.get(channelName) || [];
    existingCallbacks.push(callback);
    this.callbacks.set(channelName, existingCallbacks);

    // If channel already exists, don't create a new one
    if (this.channels.has(channelName)) {
      this._logger.info('[SupabaseRealtimeClient] Channel already exists, callback added', { channelName });
      return;
    }

    // Create channel and subscribe to table changes
    // Format: table:table_name or schema:public:table_name
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: channelName // Assumes channel name matches table name
        },
        (payload) => {
          this._logger.info('[SupabaseRealtimeClient] Received database change', {
            channelName,
            event: payload.eventType,
            table: payload.table
          });

          // Transform Supabase payload to RealtimeMessage
          const message: RealtimeMessage<T> = {
            channel: channelName,
            event: payload.eventType, // INSERT, UPDATE, DELETE
            data: payload.new || payload.old, // new for INSERT/UPDATE, old for DELETE
            timestamp: new Date().toISOString()
          };

          // Notify all callbacks for this channel
          const channelCallbacks = this.callbacks.get(channelName) || [];
          channelCallbacks.forEach(cb => {
            try {
              cb(message);
            } catch (error) {
              this._logger.error('[SupabaseRealtimeClient] Error in callback', { error, channelName });
            }
          });
        }
      )
      .subscribe((status) => {
        this._logger.info('[SupabaseRealtimeClient] Subscription status changed', {
          channelName,
          status
        });

        if (status === 'SUBSCRIBED') {
          this._logger.info('[SupabaseRealtimeClient] Successfully subscribed to channel', { channelName });
        } else if (status === 'CHANNEL_ERROR') {
          this._logger.error('[SupabaseRealtimeClient] Channel subscription error', { channelName });
        }
      });

    this.channels.set(channelName, channel);
    this._logger.info('[SupabaseRealtimeClient] Subscribed to channel', { channelName });
  }

  public unsubscribe(channelName: string): void {
    if (!this.supabase) {
      this._logger.warn('[SupabaseRealtimeClient] Cannot unsubscribe: not connected');
      return;
    }

    const channel = this.channels.get(channelName);
    if (!channel) {
      this._logger.warn('[SupabaseRealtimeClient] Channel not found', { channelName });
      return;
    }

    this.supabase.removeChannel(channel);
    this.channels.delete(channelName);
    this.callbacks.delete(channelName);
    this._logger.info('[SupabaseRealtimeClient] Unsubscribed from channel', { channelName });
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  public onConnectionStatusChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  private _notifyConnectionStatus(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        this._logger.error('[SupabaseRealtimeClient] Error in connection status callback', { error });
      }
    });
  }
}


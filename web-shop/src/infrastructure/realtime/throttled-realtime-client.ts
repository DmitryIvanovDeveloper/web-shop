import { RealtimeClientPort, RealtimeMessage } from '../../application/ports/realtime-client.port';
import { ThrottleConfig } from '../../shared/domain/value-objects/throttle-config.value-object';
import { Logger } from '../../application/ports/logger.port';

export class ThrottledRealtimeClient implements RealtimeClientPort {
  private updateQueue: RealtimeMessage[] = [];
  private lastUpdateTime = 0;
  private burstCount = 0;
  private lastBurstReset = Date.now();
  private isProcessing = false;
  
  // Auto-reconnect state
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000; // 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shouldAutoReconnect = true;
  
  // Heartbeat state
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: Date = new Date();
  private heartbeatTimeoutMs = 30000; // 30 seconds

  constructor(
    private readonly realtimeClient: RealtimeClientPort,
    private readonly throttleConfig: ThrottleConfig,
    private readonly logger: Logger
  ) {}

  async connect(): Promise<void> {
    try {
      await this.realtimeClient.connect();
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.setupConnectionMonitoring();
      this.logger.info('Connected to realtime service');
    } catch (error) {
      this.logger.error('Failed to connect to realtime service', { error });
      if (this.shouldAutoReconnect) {
        this.scheduleReconnect();
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.shouldAutoReconnect = false;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.updateQueue = [];
    this.isProcessing = false;
    return this.realtimeClient.disconnect();
  }
  
  private setupConnectionMonitoring(): void {
    this.realtimeClient.onConnectionStatusChange((connected) => {
      if (!connected && this.shouldAutoReconnect) {
        this.logger.warn('Connection lost, attempting to reconnect...');
        this.stopHeartbeat();
        this.scheduleReconnect();
      } else if (connected) {
        this.logger.info('Connection restored');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      }
    });
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnect attempts reached', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
      return;
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    this.logger.info('Scheduling reconnect', {
      attempt: this.reconnectAttempts,
      delayMs: delay,
    });
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.logger.error('Reconnect failed', { error });
      });
    }, delay);
  }
  
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastHeartbeat = new Date();
    
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeSinceLastHeartbeat = now.getTime() - this.lastHeartbeat.getTime();
      
      if (timeSinceLastHeartbeat > this.heartbeatTimeoutMs) {
        this.logger.warn('Heartbeat timeout detected', {
          timeSinceLastHeartbeat,
          heartbeatTimeoutMs: this.heartbeatTimeoutMs,
        });
        
        if (this.shouldAutoReconnect) {
          this.scheduleReconnect();
        }
      }
      
      // Update heartbeat timestamp when we receive any message
      this.lastHeartbeat = now;
    }, this.heartbeatTimeoutMs / 2); // Check every 15 seconds
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  public getLastHeartbeat(): Date {
    return this.lastHeartbeat;
  }
  
  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
  
  public enableAutoReconnect(): void {
    this.shouldAutoReconnect = true;
  }
  
  public disableAutoReconnect(): void {
    this.shouldAutoReconnect = false;
    this.clearReconnectTimer();
  }

  subscribe<T>(channel: string, callback: (message: RealtimeMessage<T>) => void): void {
    const throttledCallback = (message: RealtimeMessage<T>) => {
      this.handleUpdate(message, callback);
    };

    this.realtimeClient.subscribe(channel, throttledCallback);
  }

  unsubscribe(channel: string): void {
    this.realtimeClient.unsubscribe(channel);
  }

  isConnected(): boolean {
    return this.realtimeClient.isConnected();
  }

  onConnectionStatusChange(callback: (connected: boolean) => void): void {
    this.realtimeClient.onConnectionStatusChange(callback);
  }

  private handleUpdate(message: RealtimeMessage, callback: (message: RealtimeMessage) => void): void {
    const now = Date.now();
    
    // Reset burst counter if cooldown period has passed
    if (now - this.lastBurstReset > this.throttleConfig.cooldownMs) {
      this.burstCount = 0;
      this.lastBurstReset = now;
    }

    // Check burst limit
    if (this.burstCount >= this.throttleConfig.burstLimit) {
      this.logger.warn('Burst limit exceeded, queuing update', {
        channel: message.channel,
        burstCount: this.burstCount,
        burstLimit: this.throttleConfig.burstLimit,
      });
      this.updateQueue.push(message);
      this.processQueue(callback);
      return;
    }

    // Check rate limit
    const minInterval = this.throttleConfig.getMinIntervalMs();
    if (now - this.lastUpdateTime < minInterval) {
      this.logger.warn('Rate limit exceeded, queuing update', {
        channel: message.channel,
        timeSinceLastUpdate: now - this.lastUpdateTime,
        minInterval,
      });
      this.updateQueue.push(message);
      this.processQueue(callback);
      return;
    }

    // Update is allowed
    this.burstCount++;
    this.lastUpdateTime = now;
    callback(message);
  }

  private processQueue(callback: (message: RealtimeMessage) => void): void {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    const processNext = () => {
      if (this.updateQueue.length === 0) {
        this.isProcessing = false;
        return;
      }

      const now = Date.now();
      const minInterval = this.throttleConfig.getMinIntervalMs();

      if (now - this.lastUpdateTime >= minInterval) {
        const message = this.updateQueue.shift()!;
        this.burstCount++;
        this.lastUpdateTime = now;
        callback(message);
      }

      // Schedule next processing
      setTimeout(processNext, minInterval);
    };

    processNext();
  }

  getQueueSize(): number {
    return this.updateQueue.length;
  }

  getBurstCount(): number {
    return this.burstCount;
  }

  clearQueue(): void {
    this.updateQueue = [];
    this.logger.info('Update queue cleared');
  }
}

export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface AgentConfig {
  name: string;
  description: string;
  maxRetries?: number;
  timeout?: number;
}

export abstract class BaseAgent {
  protected status: AgentStatus = AgentStatus.IDLE;
  protected config: AgentConfig;
  protected retryCount: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
    this.status = AgentStatus.IDLE;
  }

  public getStatus(): AgentStatus {
    return this.status;
  }

  public getName(): string {
    return this.config.name;
  }

  public getDescription(): string {
    return this.config.description;
  }

  public async execute(input: any): Promise<any> {
    try {
      this.status = AgentStatus.RUNNING;
      this.retryCount = 0;
      
      const result = await this.run(input);
      
      this.status = AgentStatus.COMPLETED;
      return result;
    } catch (error) {
      this.status = AgentStatus.ERROR;
      throw error;
    }
  }

  protected abstract run(input: any): Promise<any>;

  protected async retry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = this.config.maxRetries || 3;
    
    while (this.retryCount < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        this.retryCount++;
        if (this.retryCount >= maxRetries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.config.name}] [${level.toUpperCase()}] ${message}`);
  }
}

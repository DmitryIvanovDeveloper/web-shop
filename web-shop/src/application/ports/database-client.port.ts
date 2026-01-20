

export interface DatabaseClientPort {
  
  from(table: string): any;

  getClient(): any;
}


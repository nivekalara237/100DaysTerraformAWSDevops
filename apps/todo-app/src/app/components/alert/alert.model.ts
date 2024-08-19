export interface Config {
  message: string;
  type: 'info' | 'success' | 'error' | 'warn';
  time?: number;
  closable?: string;
}

export interface Alert {
  config: Config,
  id: string
}

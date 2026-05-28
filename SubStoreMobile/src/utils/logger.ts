import storageService from '../services/storage';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = __DEV__;

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  info(message: string, ...args: any[]): void {
    const formatted = this.formatMessage('info', message, ...args);
    if (this.isDevelopment) {
      console.log(formatted);
    }
    this.saveLog('info', message);
  }

  warn(message: string, ...args: any[]): void {
    const formatted = this.formatMessage('warn', message, ...args);
    if (this.isDevelopment) {
      console.warn(formatted);
    }
    this.saveLog('warn', message);
  }

  error(message: string, ...args: any[]): void {
    const formatted = this.formatMessage('error', message, ...args);
    if (this.isDevelopment) {
      console.error(formatted);
    }
    this.saveLog('error', message);
  }

  debug(message: string, ...args: any[]): void {
    const formatted = this.formatMessage('debug', message, ...args);
    if (this.isDevelopment) {
      console.debug(formatted);
    }
  }

  private async saveLog(level: LogLevel, message: string): Promise<void> {
    try {
      await storageService.addLog(level as 'info' | 'warn' | 'error', message);
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }
}

export const logger = new Logger();
export default logger;

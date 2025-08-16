/**
 * Environment-aware logging utility
 * Auto-disabled in production with different log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private isProduction: boolean;
  private minLogLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep last 1000 logs in memory

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.minLogLevel = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLogLevel;
  }

  private createLogEntry(level: LogLevel, category: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };
  }

  private storeLog(entry: LogEntry): void {
    if (this.logs.length >= this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
    this.logs.push(entry);
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const levelName = LogLevel[entry.level];
    return `[${timestamp}] ${levelName} [${entry.category}] ${entry.message}`;
  }

  debug(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, data);
    this.storeLog(entry);
    
    if (typeof window !== 'undefined') {
      console.debug(this.formatMessage(entry), data || '');
    }
  }

  info(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, category, message, data);
    this.storeLog(entry);
    
    if (typeof window !== 'undefined') {
      console.info(this.formatMessage(entry), data || '');
    }
  }

  warn(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, category, message, data);
    this.storeLog(entry);
    
    if (typeof window !== 'undefined') {
      console.warn(this.formatMessage(entry), data || '');
    }
  }

  error(category: string, message: string, error?: Error | any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    const entry = this.createLogEntry(LogLevel.ERROR, category, message, errorData);
    this.storeLog(entry);
    
    if (typeof window !== 'undefined') {
      console.error(this.formatMessage(entry), errorData || '');
    }
  }

  // Authentication-specific logging methods
  authDebug(message: string, data?: any): void {
    this.debug('AUTH', message, data);
  }

  authInfo(message: string, data?: any): void {
    this.info('AUTH', message, data);
  }

  authWarn(message: string, data?: any): void {
    this.warn('AUTH', message, data);
  }

  authError(message: string, error?: Error | any): void {
    this.error('AUTH', message, error);
  }

  // Firebase-specific logging methods
  firebaseDebug(message: string, data?: any): void {
    this.debug('FIREBASE', message, data);
  }

  firebaseInfo(message: string, data?: any): void {
    this.info('FIREBASE', message, data);
  }

  firebaseWarn(message: string, data?: any): void {
    this.warn('FIREBASE', message, data);
  }

  firebaseError(message: string, error?: Error | any): void {
    this.error('FIREBASE', message, error);
  }

  // Security-specific logging methods
  securityDebug(message: string, data?: any): void {
    this.debug('SECURITY', message, data);
  }

  securityInfo(message: string, data?: any): void {
    this.info('SECURITY', message, data);
  }

  securityWarn(message: string, data?: any): void {
    this.warn('SECURITY', message, data);
  }

  securityError(message: string, error?: Error | any): void {
    this.error('SECURITY', message, error);
  }

  // Payment-specific logging methods
  paymentDebug(message: string, data?: any): void {
    this.debug('PAYMENT', message, data);
  }

  paymentInfo(message: string, data?: any): void {
    this.info('PAYMENT', message, data);
  }

  paymentWarn(message: string, data?: any): void {
    this.warn('PAYMENT', message, data);
  }

  paymentError(message: string, error?: Error | any): void {
    this.error('PAYMENT', message, error);
  }

  // Get recent logs (for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by category
  getLogsByCategory(category: string, count: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel, count: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.level >= level)
      .slice(-count);
  }

  // Clear stored logs
  clearLogs(): void {
    this.logs = [];
  }

  // Performance timing utility
  time(label: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    if (typeof window !== 'undefined' && console.time) {
      console.time(`[PERF] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    if (typeof window !== 'undefined' && console.timeEnd) {
      console.timeEnd(`[PERF] ${label}`);
    }
  }

  // Group logging for related operations
  group(label: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    if (typeof window !== 'undefined' && console.group) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    if (typeof window !== 'undefined' && console.groupEnd) {
      console.groupEnd();
    }
  }

  // Development-only assertions
  assert(condition: boolean, message: string): void {
    if (this.isProduction) return;
    if (typeof window !== 'undefined' && console.assert) {
      console.assert(condition, message);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export logger for easy access
export default logger;

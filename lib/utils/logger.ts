/**
 * 统一日志管理系统
 * 提供一致的日志格式和级别管理
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    // 生产环境只记录warn和error
    return level === 'warn' || level === 'error';
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context, data);

    const logMessage = `[${logEntry.timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      case 'info':
        console.info(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        break;
    }
  }

  public debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  public info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  public warn(message: string, context?: string, data?: unknown): void;
  public warn(message: string, error: unknown): void;
  public warn(message: string, contextOrError?: string | unknown, data?: unknown): void {
    if (typeof contextOrError === 'string') {
      this.log('warn', message, contextOrError, data);
    } else {
      this.log('warn', message, undefined, contextOrError);
    }
  }

  public error(message: string, context?: string, data?: unknown): void;
  public error(message: string, error: unknown): void;
  public error(message: string, contextOrError?: string | unknown, data?: unknown): void {
    if (typeof contextOrError === 'string') {
      this.log('error', message, contextOrError, data);
    } else {
      this.log('error', message, undefined, contextOrError);
    }
  }

  // 聊天相关日志
  public chatWarn(message: string, data?: unknown): void {
    this.warn(message, 'CHAT', data);
  }

  // 聊天相关日志
  public chatInfo(message: string, data?: unknown): void {
    this.info(message, 'CHAT', data);
  }

  public chatError(message: string, data?: unknown): void {
    this.error(message, 'CHAT', data);
  }

  public chatDebug(message: string, data?: unknown): void {
    this.debug(message, 'CHAT', data);
  }

  // 智能体相关日志
  public agentInfo(message: string, data?: unknown): void {
    this.info(message, 'AGENT', data);
  }

  public agentError(message: string, data?: unknown): void {
    this.error(message, 'AGENT', data);
  }

  // API相关日志
  public apiInfo(message: string, data?: unknown): void {
    this.info(message, 'API', data);
  }

  public apiError(message: string, data?: unknown): void {
    this.error(message, 'API', data);
  }
}

// 导出单例实例
export const logger = Logger.getInstance();

// 向后兼容的导出
export const log = logger;

/**
 * 统一日志管理工具
 * 根据环境变量控制日志输出级别
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level}]`
    
    if (args.length > 0) {
      return `${prefix} ${message} ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`
    }
    
    return `${prefix} ${message}`
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, ...args))
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, ...args))
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, ...args))
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, ...args))
    }
  }

  // 生产环境始终记录的错误日志
  errorAlways(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, ...args))
  }

  // 开发环境调试日志
  devDebug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[DEV] ${message}`, ...args)
    }
  }

  // 性能监控日志
  performance(operation: string, duration: number, details?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const message = `Performance: ${operation} took ${duration}ms`
      if (details) {
        console.info(this.formatMessage('PERF', message, details))
      } else {
        console.info(this.formatMessage('PERF', message))
      }
    }
  }

  // API请求日志
  apiRequest(method: string, url: string, status: number, duration?: number): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const message = `API ${method} ${url} - ${status}`
      if (duration) {
        console.info(this.formatMessage('API', `${message} (${duration}ms)`))
      } else {
        console.info(this.formatMessage('API', message))
      }
    }
  }

  // 数据库操作日志
  database(operation: string, table: string, duration?: number): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const message = `DB ${operation} on ${table}`
      if (duration) {
        console.debug(this.formatMessage('DB', `${message} (${duration}ms)`))
      } else {
        console.debug(this.formatMessage('DB', message))
      }
    }
  }
}

// 导出单例实例
export const logger = new Logger()

// 导出便捷方法
export const { debug, info, warn, error, errorAlways, devDebug, performance, apiRequest, database } = logger

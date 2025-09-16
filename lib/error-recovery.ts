import type { Message } from '../types/message';

// 错误类型
export enum ErrorType {
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// 错误信息
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

// 错误恢复状态
export interface ErrorRecoveryState {
  errors: ErrorInfo[];
  lastRecoveryAttempt: Date | null;
  recoveryAttempts: number;
}

// 初始化错误恢复状态
export function initErrorRecoveryState(): ErrorRecoveryState {
  return {
    errors: [],
    lastRecoveryAttempt: null,
    recoveryAttempts: 0,
  };
}

// 添加错误
export function addError(
  state: ErrorRecoveryState,
  error: ErrorInfo
): ErrorRecoveryState {
  return {
    ...state,
    errors: [...state.errors, error],
  };
}

// 尝试恢复
export function attemptRecovery(state: ErrorRecoveryState): ErrorRecoveryState {
  return {
    ...state,
    lastRecoveryAttempt: new Date(),
    recoveryAttempts: state.recoveryAttempts + 1,
  };
}

// 清除错误
export function clearErrors(state: ErrorRecoveryState): ErrorRecoveryState {
  return {
    ...state,
    errors: [],
    recoveryAttempts: 0,
  };
}

// 检查是否可以恢复
export function canAttemptRecovery(state: ErrorRecoveryState): boolean {
  // 如果没有错误，不需要恢复
  if (state.errors.length === 0) return false;

  // 如果有不可恢复的错误，不能恢复
  if (state.errors.some(error => !error.recoverable)) return false;

  // 如果尝试次数过多，不能恢复
  if (state.recoveryAttempts >= 3) return false;

  // 如果上次尝试时间太近，不能恢复
  if (state.lastRecoveryAttempt) {
    const timeSinceLastAttempt =
      Date.now() - state.lastRecoveryAttempt.getTime();
    if (timeSinceLastAttempt < 5000) return false; // 至少间隔5秒
  }

  return true;
}

// 从错误中恢复消息
export function recoverMessagesFromError(
  messages: Message[],
  errorIndex: number
): Message[] {
  // 移除错误消息及之后的所有消息
  return messages.slice(0, errorIndex);
}

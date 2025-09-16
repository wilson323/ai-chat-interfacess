#!/usr/bin/env node

/**
 * 类型定义文档生成器
 * 自动生成和维护类型定义文档
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 生成 API 类型文档
function generateApiTypesDoc() {
  log('📝 生成 API 类型文档...', 'blue');

  const apiTypes = `
# API 类型定义

## 请求/响应类型

### 基础响应类型
\`\`\`typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId: string;
}
\`\`\`

### 分页响应类型
\`\`\`typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
\`\`\`

### 错误响应类型
\`\`\`typescript
interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}
\`\`\`

## 聊天相关类型

### 消息类型
\`\`\`typescript
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
\`\`\`

### 智能体类型
\`\`\`typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  config: AgentConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

## 数据库相关类型

### 用户类型
\`\`\`typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### 会话类型
\`\`\`typescript
interface ChatSession {
  id: string;
  userId: number;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`
`;

  const outputPath = 'docs/types/api-types.md';
  fs.writeFileSync(outputPath, apiTypes);
  log(`✅ API 类型文档已生成: ${outputPath}`, 'green');
}

// 生成数据库类型文档
function generateDatabaseTypesDoc() {
  log('📝 生成数据库类型文档...', 'blue');

  const dbTypes = `
# 数据库类型定义

## 模型类型

### AgentUsage 模型
\`\`\`typescript
interface AgentUsageAttributes {
  id: number;
  sessionId: string;
  userId?: number;
  agentId: number;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'mixed';
  messageCount: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  responseTime?: number;
  tokenUsage?: number;
  userSatisfaction?: 'positive' | 'negative' | 'neutral';
  geoLocationId?: number;
  deviceInfo?: DeviceInfo;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### User 模型
\`\`\`typescript
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### UserGeo 模型
\`\`\`typescript
interface UserGeoAttributes {
  id: number;
  userId?: number;
  sessionId?: string;
  ipAddress: string;
  country: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

## 服务类类型

### AgentUsageService
\`\`\`typescript
class AgentUsageService {
  static startSession(
    sessionId: string,
    userId: number | undefined,
    agentId: number,
    messageType: 'text' | 'image' | 'file' | 'voice' | 'mixed',
    geoLocationId?: number,
    deviceInfo?: DeviceInfo
  ): Promise<AgentUsage>;

  static endSession(
    sessionId: string,
    tokenUsage?: number,
    userSatisfaction?: 'positive' | 'negative' | 'neutral'
  ): Promise<AgentUsage | null>;

  static updateMessageCount(
    sessionId: string,
    increment?: number
  ): Promise<void>;

  static updateResponseTime(
    sessionId: string,
    responseTime: number
  ): Promise<void>;

  static getUsageStatistics(params?: {
    startDate?: Date;
    endDate?: Date;
    agentId?: number;
    userId?: number;
    messageType?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<Array<Record<string, unknown>>>;

  static getTopAgents(
    limit?: number,
    timeRange?: { start: Date; end: Date }
  ): Promise<Array<{ agentId: number; usageCount: number }>>;

  static getCleanupCandidates(
    daysToKeep?: number
  ): Promise<AgentUsage[]>;

  static cleanupOldData(
    daysToKeep?: number
  ): Promise<number>;
}
\`\`\`
`;

  const outputPath = 'docs/types/database-types.md';
  fs.writeFileSync(outputPath, dbTypes);
  log(`✅ 数据库类型文档已生成: ${outputPath}`, 'green');
}

// 生成错误类型文档
function generateErrorTypesDoc() {
  log('📝 生成错误类型文档...', 'blue');

  const errorTypes = `
# 错误类型定义

## 错误类型枚举
\`\`\`typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
\`\`\`

## 错误严重级别
\`\`\`typescript
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
\`\`\`

## 基础错误类
\`\`\`typescript
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly severity: ErrorSeverity;
  readonly timestamp: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(message: string, details?: unknown);
}
\`\`\`

## 具体错误类

### ValidationError
\`\`\`typescript
class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly severity = ErrorSeverity.MEDIUM;
}
\`\`\`

### AuthenticationError
\`\`\`typescript
class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;
  readonly severity = ErrorSeverity.HIGH;
}
\`\`\`

### AuthorizationError
\`\`\`typescript
class AuthorizationError extends AppError {
  readonly code = 'AUTHORIZATION_ERROR';
  readonly statusCode = 403;
  readonly severity = ErrorSeverity.HIGH;
}
\`\`\`

### NotFoundError
\`\`\`typescript
class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND_ERROR';
  readonly statusCode = 404;
  readonly severity = ErrorSeverity.MEDIUM;
}
\`\`\`

### ConflictError
\`\`\`typescript
class ConflictError extends AppError {
  readonly code = 'CONFLICT_ERROR';
  readonly statusCode = 409;
  readonly severity = ErrorSeverity.MEDIUM;
}
\`\`\`

### RateLimitError
\`\`\`typescript
class RateLimitError extends AppError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;
  readonly severity = ErrorSeverity.MEDIUM;
}
\`\`\`

### DatabaseError
\`\`\`typescript
class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;
  readonly severity = ErrorSeverity.HIGH;
}
\`\`\`

### NetworkError
\`\`\`typescript
class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;
  readonly severity = ErrorSeverity.HIGH;
}
\`\`\`

### ExternalApiError
\`\`\`typescript
class ExternalApiError extends AppError {
  readonly code = 'EXTERNAL_API_ERROR';
  readonly statusCode = 502;
  readonly severity = ErrorSeverity.HIGH;
}
\`\`\`

### InternalError
\`\`\`typescript
class InternalError extends AppError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  readonly statusCode = 500;
  readonly severity = ErrorSeverity.CRITICAL;
}
\`\`\`

## 错误工厂类
\`\`\`typescript
class ErrorFactory {
  static validation(message: string, details?: unknown): ValidationError;
  static authentication(message?: string, details?: unknown): AuthenticationError;
  static authorization(message?: string, details?: unknown): AuthorizationError;
  static notFound(resource: string, id?: string): NotFoundError;
  static conflict(message: string, details?: unknown): ConflictError;
  static rateLimit(message?: string, details?: unknown): RateLimitError;
  static database(message: string, details?: unknown): DatabaseError;
  static network(message: string, details?: unknown): NetworkError;
  static externalApi(message: string, details?: unknown): ExternalApiError;
  static internal(message: string, details?: unknown): InternalError;
}
\`\`\`

## 错误处理工具
\`\`\`typescript
class ErrorHandler {
  static safeExecute<T>(
    fn: () => Promise<T>,
    errorType?: ErrorType,
    context?: string
  ): Promise<{ data?: T; error?: AppError }>;

  static safeExecuteSync<T>(
    fn: () => T,
    errorType?: ErrorType,
    context?: string
  ): { data?: T; error?: AppError };

  static withRetry<T>(
    fn: () => Promise<T>,
    maxRetries?: number,
    context?: string
  ): Promise<T>;

  static withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    context?: string
  ): Promise<T>;

  static normalizeError(
    error: unknown,
    type?: ErrorType,
    context?: string
  ): AppError;
}
\`\`\`
`;

  const outputPath = 'docs/types/error-types.md';
  fs.writeFileSync(outputPath, errorTypes);
  log(`✅ 错误类型文档已生成: ${outputPath}`, 'green');
}

// 生成组件类型文档
function generateComponentTypesDoc() {
  log('📝 生成组件类型文档...', 'blue');

  const componentTypes = `
# 组件类型定义

## 基础组件 Props

### Button Props
\`\`\`typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
\`\`\`

### Input Props
\`\`\`typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}
\`\`\`

## 聊天组件类型

### ChatMessage Props
\`\`\`typescript
interface ChatMessageProps {
  message: ChatMessage;
  isUser: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  className?: string;
}
\`\`\`

### ChatInput Props
\`\`\`typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  onVoiceRecord?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}
\`\`\`

### AgentSelector Props
\`\`\`typescript
interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId?: string;
  onSelect: (agentId: string) => void;
  className?: string;
}
\`\`\`

## 管理组件类型

### UserTable Props
\`\`\`typescript
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onToggleStatus: (userId: number) => void;
  loading?: boolean;
  className?: string;
}
\`\`\`

### AnalyticsChart Props
\`\`\`typescript
interface AnalyticsChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  className?: string;
}
\`\`\`

## 表单组件类型

### FormField Props
\`\`\`typescript
interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}
\`\`\`

### FormProps
\`\`\`typescript
interface FormProps<T = Record<string, unknown>> {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validationSchema?: any; // Zod schema
  children: React.ReactNode;
  className?: string;
}
\`\`\`

## 模态框组件类型

### Modal Props
\`\`\`typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
\`\`\`

### ConfirmDialog Props
\`\`\`typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}
\`\`\`
`;

  const outputPath = 'docs/types/component-types.md';
  fs.writeFileSync(outputPath, componentTypes);
  log(`✅ 组件类型文档已生成: ${outputPath}`, 'green');
}

// 生成类型变更日志
function generateTypeChangeLog() {
  log('📝 生成类型变更日志...', 'blue');

  const changeLog = `
# 类型变更日志

## 版本 1.0.0 (2024-12-XX)

### 新增类型
- \`AgentUsageService\` 服务类
- \`ErrorFactory\` 错误工厂类
- \`ErrorHandler\` 错误处理工具类
- 完整的错误类型体系
- 缓存管理器类型定义

### 修改类型
- 重构 Sequelize 模型静态方法为服务类
- 优化泛型类型约束
- 统一错误处理类型定义

### 移除类型
- 移除了不安全的 \`any\` 类型使用
- 移除了过时的类型定义

### 破坏性变更
- \`AgentUsage\` 静态方法已移至 \`AgentUsageService\`
- 错误类构造函数参数调整
- 缓存方法类型约束加强

## 版本 0.9.0 (2024-11-XX)

### 新增类型
- 基础 API 响应类型
- 聊天消息类型
- 用户管理类型

### 修改类型
- 优化数据库模型类型
- 改进组件 Props 类型定义

## 版本 0.8.0 (2024-10-XX)

### 新增类型
- 基础组件类型定义
- 表单组件类型
- 模态框组件类型

### 修改类型
- 统一命名规范
- 优化类型约束
`;

  const outputPath = 'docs/types/type-changes.md';
  fs.writeFileSync(outputPath, changeLog);
  log(`✅ 类型变更日志已生成: ${outputPath}`, 'green');
}

// 主函数
function main() {
  log('🚀 开始生成类型定义文档...', 'bold');
  log('=' .repeat(50), 'blue');

  // 创建文档目录
  const docsDir = 'docs/types';
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 生成各种类型文档
  generateApiTypesDoc();
  generateDatabaseTypesDoc();
  generateErrorTypesDoc();
  generateComponentTypesDoc();
  generateTypeChangeLog();

  log('\n' + '=' .repeat(50), 'blue');
  log('🎉 类型定义文档生成完成！', 'green');
  log(`📁 文档位置: ${docsDir}/`, 'blue');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  generateApiTypesDoc,
  generateDatabaseTypesDoc,
  generateErrorTypesDoc,
  generateComponentTypesDoc,
  generateTypeChangeLog
};

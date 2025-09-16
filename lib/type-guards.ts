/**
 * TypeScript 类型守卫函数
 * 用于安全地处理 unknown 类型和类型断言
 */

// Recharts 相关类型守卫
export interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Record<string, unknown>;
    value: unknown;
    name?: string;
    dataKey?: string;
    color?: string;
  }>;
  label?: unknown;
}

export interface RechartsPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Record<string, unknown>;
    value: unknown;
    name?: string;
    dataKey?: string;
    color?: string;
    fill?: string;
  }>;
}

export interface RechartsRadarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Record<string, unknown>;
    value: unknown;
    name?: string;
    dataKey?: string;
    color?: string;
  }>;
}

// 类型守卫函数
export function isRechartsTooltipProps(
  value: unknown
): value is RechartsTooltipProps {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    (obj.active === undefined || typeof obj.active === 'boolean') &&
    (obj.payload === undefined || Array.isArray(obj.payload))
  );
}

export function isRechartsPieTooltipProps(
  value: unknown
): value is RechartsPieTooltipProps {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    (obj.active === undefined || typeof obj.active === 'boolean') &&
    (obj.payload === undefined || Array.isArray(obj.payload))
  );
}

export function isRechartsRadarTooltipProps(
  value: unknown
): value is RechartsRadarTooltipProps {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    (obj.active === undefined || typeof obj.active === 'boolean') &&
    (obj.payload === undefined || Array.isArray(obj.payload))
  );
}

// 数据验证函数
export function isValidPayload(
  payload: unknown
): payload is Record<string, unknown> {
  return typeof payload === 'object' && payload !== null;
}

export function isValidArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isValidString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isValidBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// 安全访问函数
export function safeGetString(
  obj: Record<string, unknown>,
  key: string,
  defaultValue = ''
): string {
  const value = obj[key];
  return isValidString(value) ? value : defaultValue;
}

export function safeGetNumber(
  obj: Record<string, unknown>,
  key: string,
  defaultValue = 0
): number {
  const value = obj[key];
  return isValidNumber(value) ? value : defaultValue;
}

export function safeGetBoolean(
  obj: Record<string, unknown>,
  key: string,
  defaultValue = false
): boolean {
  const value = obj[key];
  return isValidBoolean(value) ? value : defaultValue;
}

// Agent 相关类型守卫
export function isValidAgent(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    typeof (value as Record<string, unknown>).name === 'string'
  );
}

// 分析数据相关类型守卫
export function isValidAnalyticsData(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// 元数据相关类型守卫
export function isValidMetadata(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

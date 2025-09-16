/**
 * 全局变量类型定义 - 统一版本
 * 整合了 agent.ts 和 global-variable.ts 的字段，提供向后兼容性
 */

/**
 * 基础全局变量接口 - 通用字段
 */
export interface GlobalVariableBase {
  key: string;
  name: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'custom' | 'select' | 'text';
}

/**
 * 验证规则接口
 */
export interface GlobalVariableValidation {
  pattern?: string;
  min?: number;
  max?: number;
  options?: string[];
}

/**
 * 枚举选项接口
 */
export interface GlobalVariableOption {
  value: string;
  label?: string;
}

/**
 * 完整的全局变量接口 - Agent 配置使用
 * 包含所有字段，用于数据库存储和复杂配置
 */
export interface GlobalVariableFull extends GlobalVariableBase {
  id: string;
  label: string;
  type: 'custom' | 'select' | 'text' | 'number' | 'boolean'; // 更严格的类型限制
  required: boolean;
  valueType: 'any' | 'string' | 'number' | 'boolean';
  value?: unknown;
  maxLen?: number;
  icon?: string;
  enums?: GlobalVariableOption[];
  list?: GlobalVariableOption[];
  validation?: GlobalVariableValidation;
}

/**
 * 简化的全局变量接口 - 运行时使用
 * 用于聊天界面和轻量级配置
 */
export interface GlobalVariableSimple extends GlobalVariableBase {
  validation?: GlobalVariableValidation;
}

/**
 * 全局变量统一接口 - 主要导出类型
 * 向后兼容，支持所有使用场景
 */
export interface GlobalVariable extends GlobalVariableFull {
  isActive?: boolean; // 添加激活状态字段
}

/**
 * 全局变量值接口
 */
export interface GlobalVariableValue {
  key: string;
  value: unknown;
}

/**
 * 全局变量配置接口
 */
export interface GlobalVariableConfig {
  variables: GlobalVariable[];
  values: Record<string, unknown>;
}

/**
 * 类型守卫 - 检查是否为完整全局变量
 */
export function isGlobalVariableFull(obj: unknown): obj is GlobalVariableFull {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'label' in obj;
}

/**
 * 类型守卫 - 检查是否为简化全局变量
 */
export function isGlobalVariableSimple(obj: unknown): obj is GlobalVariableSimple {
  return typeof obj === 'object' && obj !== null && 'key' in obj && 'name' in obj;
}

/**
 * 全局变量值类型
 */
export type GlobalVariableValueType = string | number | boolean | unknown;

/**
 * 全局变量类型枚举
 */
export enum GlobalVariableTypeEnum {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  CUSTOM = 'custom',
  SELECT = 'select',
  TEXT = 'text'
}

/**
 * 向后兼容的类型别名
 * @deprecated 请直接使用 GlobalVariable
 */
export type AgentGlobalVariable = GlobalVariable;

/**
 * 向后兼容的类型别名
 * @deprecated 请直接使用 GlobalVariableSimple
 */
export type SimpleGlobalVariable = GlobalVariableSimple;

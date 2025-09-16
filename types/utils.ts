/**
 * 通用工具类型定义
 */

// 通用的Record类型
export type Record<K extends keyof any, T> = {
  [P in K]: T;
};

// 通用的Partial类型
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 通用的Pick类型
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 通用的Omit类型
export type Omit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};
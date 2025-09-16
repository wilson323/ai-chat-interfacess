/**
 * 统一的User相关类型定义
 * 整合了分散在各个文件中的User类型
 */

// 基础用户接口
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// 用户角色
export type UserRole = 'admin' | 'user' | 'moderator';

// 用户角色映射
export interface UserRoleMapping {
  userId: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
}

// 用户行为数据
export interface UserBehaviorData {
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

// 用户类型比较数据
export interface UserTypeComparisonData {
  userType: string;
  totalUsers: number;
  activeUsers: number;
  averageSessionDuration: number;
  retentionRate: number;
}

// 用户数据（API用）
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// 批量用户更新
export interface BulkUserUpdate {
  userIds: string[];
  updates: Partial<UserData>;
}

// 用户地理位置属性（数据库）
export interface UserGeoAttributes {
  id: number;
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用户地理位置创建属性
export interface UserGeoCreationAttributes {
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

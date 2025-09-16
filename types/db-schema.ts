/**
 * 数据库模式相关类型定义
 */

export interface TableColumn {
  name: string;
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
}

/**
 * 数据库架构比较专用类型
 * 用于表结构对比和差异显示
 */
export interface DbSchemaComparisonTable {
  table: TableInfo;
  modelTable?: TableInfo;
  title: string;
  isModelView: boolean;
}

export interface ModelField {
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
}

export interface DatabaseField {
  type: string;
  allowNull: boolean;
  defaultValue: unknown;
}

export interface SchemaDiff {
  tableName: string;
  fieldName: string;
  fieldType: string;
  diffType: 'new' | 'missing' | 'diff';
  details: string;
}

export interface HealthStatus {
  db?: string;
  api?: string;
  agent?: string;
}

export interface PerformanceStatus {
  cpu?: string[];
  memory?: { heapUsed?: string };
}

export interface DbSchemaState {
  tables: TableInfo[];
  modelTables: TableInfo[];
  syncNeeded: boolean;
  loading: boolean;
  syncing: boolean;
  error: string;
  success: string;
  diffs: SchemaDiff[];
  confirmOpen: boolean;
  exporting: boolean;
  logs: string[];
  logTotal: number;
  logPage: number;
  health: HealthStatus | null;
  perf: PerformanceStatus | null;
  backups: string[];
}

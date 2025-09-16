/**
 * 数据库schema接口定义
 * 用于处理数据库结构相关的类型安全
 */

export interface DatabaseTableSchema {
  /** 表名 */
  tableName: string;
  /** 列定义 */
  columns: Array<{
    /** 列名 */
    name: string;
    /** 数据类型 */
    type: string;
    /** 是否允许为空 */
    nullable: boolean;
    /** 默认值 */
    defaultValue?: string | number | boolean | null;
    /** 是否为主键 */
    isPrimaryKey: boolean;
    /** 是否为外键 */
    isForeignKey: boolean;
    /** 外键引用信息 */
    foreignKey?: {
      table: string;
      column: string;
    };
    /** 注释说明 */
    comment?: string;
  }>;
  /** 索引信息 */
  indexes?: Array<{
    /** 索引名 */
    name: string;
    /** 索引列 */
    columns: string[];
    /** 索引类型 */
    type: 'primary' | 'unique' | 'index' | 'fulltext';
    /** 是否唯一 */
    unique: boolean;
  }>;
  /** 表注释 */
  comment?: string;
  /** 引擎类型 */
  engine?: string;
  /** 字符集 */
  charset?: string;
  /** 排序规则 */
  collation?: string;
}

/** 数据库schema响应 */
export interface DatabaseSchemaResponse {
  /** 数据库名称 */
  databaseName: string;
  /** 表结构列表 */
  tables: DatabaseTableSchema[];
  /** 视图列表 */
  views?: Array<{
    name: string;
    definition: string;
    comment?: string;
  }>;
  /** 存储过程列表 */
  procedures?: Array<{
    name: string;
    definition: string;
    comment?: string;
  }>;
  /** 版本信息 */
  version?: string;
}

/** 数据库操作日志详情 */
export interface DatabaseOperationDetails {
  /** 操作类型 */
  operation: 'create' | 'alter' | 'drop' | 'truncate' | 'rename';
  /** 受影响的对象 */
  object: string;
  /** 对象类型 */
  objectType: 'table' | 'view' | 'index' | 'procedure' | 'function';
  /** 变更详情 */
  changes?: Record<string, any>;
  /** SQL语句 */
  sql?: string;
  /** 执行时间 */
  executionTime?: number;
}

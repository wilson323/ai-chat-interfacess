/**
 * 数据库查询优化工具
 * 提供查询优化、索引建议、性能分析等功能
 */

import { Sequelize, QueryTypes } from 'sequelize';

interface QueryAnalysis {
  query: string;
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexUsed: string[];
  suggestions: string[];
  score: number;
}

interface IndexSuggestion {
  table: string;
  columns: string[];
  type: 'index' | 'unique' | 'composite';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  improvements: string[];
  expectedGain: number;
}

class DatabaseQueryOptimizer {
  private sequelize: Sequelize;
  private queryCache = new Map<string, QueryAnalysis>();
  private maxCacheSize = 1000;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * 分析查询性能
   */
  async analyzeQuery(
    query: string,
    params: unknown[] = []
  ): Promise<QueryAnalysis> {
    const cacheKey = `${query}:${JSON.stringify(params)}`;

    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    const startTime = Date.now();

    try {
      // 执行查询并获取执行计划
      const explainResult = await this.sequelize.query(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`,
        {
          type: QueryTypes.SELECT,
          replacements: params,
        }
      );

      const executionTime = Date.now() - startTime;
      const plan = explainResult[0] as Record<string, unknown>;

      // 分析执行计划
      const analysis = this.analyzeExecutionPlan(query, plan, executionTime);

      // 缓存结果
      if (this.queryCache.size >= this.maxCacheSize) {
        const firstKey = this.queryCache.keys().next().value;
        if (firstKey) {
          this.queryCache.delete(firstKey);
        }
      }
      this.queryCache.set(cacheKey, analysis);

      return analysis;
    } catch (error) {
      console.error('查询分析失败:', error);
      return {
        query,
        executionTime: Date.now() - startTime,
        rowsExamined: 0,
        rowsReturned: 0,
        indexUsed: [],
        suggestions: ['查询执行失败，请检查语法'],
        score: 0,
      };
    }
  }

  /**
   * 分析执行计划
   */
  private analyzeExecutionPlan(
    query: string,
    plan: Record<string, unknown>,
    executionTime: number
  ): QueryAnalysis {
    const suggestions: string[] = [];
    let score = 100;
    let rowsExamined = 0;
    let rowsReturned = 0;
    const indexUsed: string[] = [];

    // 递归分析执行计划节点
    const analyzeNode = (node: Record<string, unknown>) => {
      if (node['Node Type']) {
        const nodeType = node['Node Type'];

        // 分析扫描类型
        if (nodeType === 'Seq Scan') {
          suggestions.push('考虑添加索引以避免全表扫描');
          score -= 20;
        } else if (
          nodeType === 'Index Scan' ||
          nodeType === 'Index Only Scan'
        ) {
          if (node['Index Name']) {
            indexUsed.push(String(node['Index Name']));
          }
        }

        // 分析连接类型
        if (nodeType === 'Nested Loop') {
          suggestions.push('考虑优化连接条件或添加索引');
          score -= 10;
        } else if (nodeType === 'Hash Join') {
          suggestions.push('考虑调整连接顺序或添加索引');
          score -= 5;
        }

        // 分析排序
        if (nodeType === 'Sort') {
          suggestions.push('考虑添加排序索引');
          score -= 15;
        }

        // 分析聚合
        if (nodeType === 'Aggregate') {
          suggestions.push('考虑添加分组索引');
          score -= 10;
        }

        // 统计行数
        if (node['Actual Rows']) {
          rowsReturned += Number(node['Actual Rows']) || 0;
        }
        if (node['Actual Rows']) {
          rowsExamined += Number(node['Actual Rows']) || 0;
        }
      }

      // 递归分析子节点
      if (node['Plans'] && Array.isArray(node['Plans'])) {
        for (const childNode of node['Plans']) {
          analyzeNode(childNode as Record<string, unknown>);
        }
      }
    };

    if (Array.isArray(plan) && plan[0] && plan[0]['Plan']) {
      analyzeNode(plan[0]['Plan'] as Record<string, unknown>);
    }

    // 分析执行时间
    if (executionTime > 1000) {
      suggestions.push('查询执行时间过长，考虑优化');
      score -= 25;
    } else if (executionTime > 500) {
      suggestions.push('查询执行时间较长，建议优化');
      score -= 10;
    }

    // 分析行数比例
    if (rowsExamined > 0 && rowsReturned > 0) {
      const ratio = rowsReturned / rowsExamined;
      if (ratio < 0.1) {
        suggestions.push('查询返回的行数较少，考虑添加更精确的过滤条件');
        score -= 15;
      }
    }

    return {
      query,
      executionTime,
      rowsExamined,
      rowsReturned,
      indexUsed,
      suggestions,
      score: Math.max(0, score),
    };
  }

  /**
   * 生成索引建议
   */
  async generateIndexSuggestions(): Promise<IndexSuggestion[]> {
    const suggestions: IndexSuggestion[] = [];

    try {
      // 获取所有表
      const tables = await this.sequelize.query(
        `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `,
        { type: QueryTypes.SELECT }
      );

      for (const table of tables as Array<{ table_name: string }>) {
        const tableName = table.table_name;

        // 分析表结构
        const columns = await this.sequelize.query(
          `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = '${tableName}'
          ORDER BY ordinal_position
        `,
          { type: QueryTypes.SELECT }
        );

        // 分析现有索引
        const indexes = await this.sequelize.query(
          `
          SELECT indexname, indexdef
          FROM pg_indexes
          WHERE tablename = '${tableName}'
        `,
          { type: QueryTypes.SELECT }
        );

        // 生成索引建议
        const tableSuggestions = this.analyzeTableForIndexes(
          tableName,
          columns as Array<{
            column_name: string;
            data_type: string;
            is_nullable: string;
          }>,
          indexes as Array<{ indexname: string; column_name: string }>
        );
        suggestions.push(...tableSuggestions);
      }
    } catch (error) {
      console.error('生成索引建议失败:', error);
    }

    return suggestions;
  }

  /**
   * 分析表结构生成索引建议
   */
  private analyzeTableForIndexes(
    tableName: string,
    columns: Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
    }>,
    indexes: Array<{ indexname: string; column_name: string }>
  ): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];
    const existingIndexes = new Set(indexes.map(idx => idx.indexname));

    // 分析主键
    const primaryKey = columns.find(col => col.column_name === 'id');
    if (primaryKey && !existingIndexes.has(`${tableName}_pkey`)) {
      suggestions.push({
        table: tableName,
        columns: ['id'],
        type: 'unique',
        reason: '主键索引',
        priority: 'high',
      });
    }

    // 分析外键
    const foreignKeys = columns.filter(
      col => col.column_name.endsWith('_id') || col.column_name.endsWith('Id')
    );

    for (const fk of foreignKeys) {
      const indexName = `idx_${tableName}_${fk.column_name}`;
      if (!existingIndexes.has(indexName)) {
        suggestions.push({
          table: tableName,
          columns: [fk.column_name],
          type: 'index',
          reason: '外键索引，提升连接性能',
          priority: 'high',
        });
      }
    }

    // 分析时间字段
    const timeFields = columns.filter(
      col =>
        col.column_name.includes('time') ||
        col.column_name.includes('date') ||
        col.column_name.includes('created') ||
        col.column_name.includes('updated')
    );

    for (const timeField of timeFields) {
      const indexName = `idx_${tableName}_${timeField.column_name}`;
      if (!existingIndexes.has(indexName)) {
        suggestions.push({
          table: tableName,
          columns: [timeField.column_name],
          type: 'index',
          reason: '时间字段索引，提升排序和范围查询性能',
          priority: 'medium',
        });
      }
    }

    // 分析状态字段
    const statusFields = columns.filter(
      col =>
        col.column_name.includes('status') ||
        col.column_name.includes('state') ||
        col.column_name.includes('type') ||
        col.column_name.includes('is_')
    );

    for (const statusField of statusFields) {
      const indexName = `idx_${tableName}_${statusField.column_name}`;
      if (!existingIndexes.has(indexName)) {
        suggestions.push({
          table: tableName,
          columns: [statusField.column_name],
          type: 'index',
          reason: '状态字段索引，提升过滤性能',
          priority: 'medium',
        });
      }
    }

    return suggestions;
  }

  /**
   * 优化查询
   */
  async optimizeQuery(
    query: string,
    params: unknown[] = []
  ): Promise<QueryOptimization> {
    const analysis = await this.analyzeQuery(query, params);
    const improvements: string[] = [];
    let optimizedQuery = query;
    let expectedGain = 0;

    // 基于分析结果优化查询
    if (analysis.suggestions.includes('考虑添加索引以避免全表扫描')) {
      improvements.push('添加适当的索引');
      expectedGain += 20;
    }

    if (analysis.suggestions.includes('考虑优化连接条件或添加索引')) {
      improvements.push('优化连接条件');
      expectedGain += 15;
    }

    if (analysis.suggestions.includes('考虑添加排序索引')) {
      improvements.push('添加排序索引');
      expectedGain += 10;
    }

    if (analysis.suggestions.includes('查询执行时间过长，考虑优化')) {
      improvements.push('优化查询逻辑');
      expectedGain += 25;
    }

    // 简单的查询优化规则
    if (query.includes('SELECT *')) {
      optimizedQuery = query.replace('SELECT *', 'SELECT specific_columns');
      improvements.push('避免使用SELECT *，只选择需要的列');
      expectedGain += 5;
    }

    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {
      improvements.push('考虑添加LIMIT限制结果集大小');
      expectedGain += 10;
    }

    return {
      originalQuery: query,
      optimizedQuery,
      improvements,
      expectedGain,
    };
  }

  /**
   * 获取慢查询
   */
  async getSlowQueries(threshold: number = 1000): Promise<QueryAnalysis[]> {
    const slowQueries: QueryAnalysis[] = [];

    for (const analysis of this.queryCache.values()) {
      if (analysis.executionTime > threshold) {
        slowQueries.push(analysis);
      }
    }

    return slowQueries.sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * 获取查询统计
   */
  getQueryStats(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    failedQueries: number;
    topQueries: QueryAnalysis[];
  } {
    const analyses = Array.from(this.queryCache.values());

    const totalQueries = analyses.length;
    const averageExecutionTime =
      analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.executionTime, 0) /
          analyses.length
        : 0;
    const slowQueries = analyses.filter(a => a.executionTime > 1000).length;
    const failedQueries = analyses.filter(a => a.score === 0).length;
    const topQueries = analyses
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      failedQueries,
      topQueries,
    };
  }

  /**
   * 清理缓存
   */
  cleanup(): void {
    this.queryCache.clear();
  }

  /**
   * 生成优化报告
   */
  async generateOptimizationReport(): Promise<string> {
    const stats = this.getQueryStats();
    const suggestions = await this.generateIndexSuggestions();

    return `
# 数据库查询优化报告

## 查询统计
- 总查询数: ${stats.totalQueries}
- 平均执行时间: ${stats.averageExecutionTime.toFixed(2)}ms
- 慢查询数: ${stats.slowQueries}
- 失败查询数: ${stats.failedQueries}

## 索引建议
${suggestions
  .map(
    (s: IndexSuggestion) => `
### ${s.table} 表
- 列: ${s.columns.join(', ')}
- 类型: ${s.type}
- 原因: ${s.reason}
- 优先级: ${s.priority}
`
  )
  .join('')}

## 优化建议
1. 定期分析慢查询并优化
2. 根据索引建议添加必要的索引
3. 避免使用SELECT *查询
4. 合理使用LIMIT限制结果集
5. 优化连接条件和顺序
`;
  }
}

// 创建全局优化器实例
let globalOptimizer: DatabaseQueryOptimizer | null = null;

/**
 * 获取查询优化器实例
 */
export function getQueryOptimizer(
  sequelize: Sequelize
): DatabaseQueryOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new DatabaseQueryOptimizer(sequelize);
  }
  return globalOptimizer;
}

/**
 * 分析查询性能
 */
export async function analyzeQuery(
  query: string,
  params: unknown[] = [],
  sequelize: Sequelize
): Promise<QueryAnalysis> {
  const optimizer = getQueryOptimizer(sequelize);
  return optimizer.analyzeQuery(query, params);
}

/**
 * 生成索引建议
 */
export async function generateIndexSuggestions(
  sequelize: Sequelize
): Promise<IndexSuggestion[]> {
  const optimizer = getQueryOptimizer(sequelize);
  return optimizer.generateIndexSuggestions();
}

/**
 * 优化查询
 */
export async function optimizeQuery(
  query: string,
  params: unknown[] = [],
  sequelize: Sequelize
): Promise<QueryOptimization> {
  const optimizer = getQueryOptimizer(sequelize);
  return optimizer.optimizeQuery(query, params);
}

// 默认导出
export default DatabaseQueryOptimizer;

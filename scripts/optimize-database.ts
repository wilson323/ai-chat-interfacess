#!/usr/bin/env tsx

/**
 * 数据库优化脚本
 * 提供数据库性能优化、索引管理、查询分析等功能
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { appConfig } from '../lib/config';
import {
  getDatabaseMonitor,
  startDatabaseMonitoring,
} from '../lib/db/monitoring';
import {
  getQueryOptimizer,
  generateIndexSuggestions,
} from '../lib/db/query-optimizer';
import { getBackupManager, createFullBackup } from '../lib/db/backup';
import { getMigrationManager, runMigrations } from '../lib/db/migration';
import { createClient } from 'redis';

interface OptimizationOptions {
  // 优化类型
  analyze: boolean;
  optimize: boolean;
  index: boolean;
  backup: boolean;
  migrate: boolean;
  monitor: boolean;

  // 优化选项
  createIndexes: boolean;
  dropUnusedIndexes: boolean;
  analyzeTables: boolean;
  vacuumTables: boolean;

  // 监控选项
  startMonitoring: boolean;
  monitoringInterval: number;

  // 备份选项
  createBackup: boolean;
  backupType: 'full' | 'incremental';

  // 输出选项
  verbose: boolean;
  outputFile?: string;
}

class DatabaseOptimizer {
  private sequelize: Sequelize;
  private redis: ReturnType<typeof createClient>;
  private options: OptimizationOptions;

  constructor(options: Partial<OptimizationOptions> = {}) {
    this.options = {
      analyze: false,
      optimize: false,
      index: false,
      backup: false,
      migrate: false,
      monitor: false,
      createIndexes: false,
      dropUnusedIndexes: false,
      analyzeTables: false,
      vacuumTables: false,
      startMonitoring: false,
      monitoringInterval: 5000,
      createBackup: false,
      backupType: 'full',
      verbose: false,
      ...options,
    };

    this.sequelize = new Sequelize(
      appConfig.database.database,
      appConfig.database.username,
      appConfig.database.password,
      {
        host: appConfig.database.host,
        port: appConfig.database.port,
        dialect: 'postgres',
        logging: this.options.verbose ? console.log : false,
      }
    );

    this.redis = createClient({
      url: `redis://${appConfig.redis.host}:${appConfig.redis.port}`,
    });
  }

  /**
   * 执行数据库优化
   */
  async optimize(): Promise<void> {
    console.log('🚀 开始数据库优化...');

    try {
      // 连接数据库
      await this.sequelize.authenticate();
      console.log('✅ 数据库连接成功');

      // 连接Redis
      await this.redis.connect();
      console.log('✅ Redis连接成功');

      // 执行优化步骤
      if (this.options.analyze) {
        await this.analyzeDatabase();
      }

      if (this.options.optimize) {
        await this.optimizeDatabase();
      }

      if (this.options.index) {
        await this.optimizeIndexes();
      }

      if (this.options.backup) {
        await this.createBackup();
      }

      if (this.options.migrate) {
        await this.runMigrations();
      }

      if (this.options.monitor) {
        await this.startMonitoring();
      }

      console.log('✅ 数据库优化完成');
    } catch (error) {
      console.error('❌ 数据库优化失败:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 分析数据库
   */
  private async analyzeDatabase(): Promise<void> {
    console.log('📊 分析数据库性能...');

    try {
      // 获取查询优化器
      const optimizer = getQueryOptimizer(this.sequelize);

      // 生成索引建议
      const indexSuggestions = await generateIndexSuggestions(this.sequelize);
      console.log(`发现 ${indexSuggestions.length} 个索引建议`);

      // 分析表统计信息
      if (this.options.analyzeTables) {
        await this.analyzeTables();
      }

      // 生成分析报告
      const report = optimizer.generateOptimizationReport();
      console.log(report);
    } catch (error) {
      console.error('数据库分析失败:', error);
    }
  }

  /**
   * 优化数据库
   */
  private async optimizeDatabase(): Promise<void> {
    console.log('⚡ 优化数据库性能...');

    try {
      // 执行VACUUM
      if (this.options.vacuumTables) {
        await this.vacuumTables();
      }

      // 更新表统计信息
      if (this.options.analyzeTables) {
        await this.analyzeTables();
      }

      // 优化查询缓存
      await this.optimizeQueryCache();
    } catch (error) {
      console.error('数据库优化失败:', error);
    }
  }

  /**
   * 优化索引
   */
  private async optimizeIndexes(): Promise<void> {
    console.log('🔍 优化数据库索引...');

    try {
      const optimizer = getQueryOptimizer(this.sequelize);
      const suggestions = await generateIndexSuggestions(this.sequelize);

      // 创建索引
      if (this.options.createIndexes) {
        await this.createIndexes(suggestions);
      }

      // 删除未使用的索引
      if (this.options.dropUnusedIndexes) {
        await this.dropUnusedIndexes();
      }
    } catch (error) {
      console.error('索引优化失败:', error);
    }
  }

  /**
   * 创建备份
   */
  private async createBackup(): Promise<void> {
    console.log('💾 创建数据库备份...');

    try {
      const backupManager = getBackupManager();

      if (this.options.backupType === 'full') {
        await createFullBackup();
        console.log('✅ 全量备份完成');
      } else {
        await backupManager.createIncrementalBackup();
        console.log('✅ 增量备份完成');
      }
    } catch (error) {
      console.error('备份创建失败:', error);
    }
  }

  /**
   * 运行迁移
   */
  private async runMigrations(): Promise<void> {
    console.log('🔄 运行数据库迁移...');

    try {
      const migrations = await runMigrations(this.sequelize);
      console.log(`✅ 执行了 ${migrations.length} 个迁移`);
    } catch (error) {
      console.error('迁移执行失败:', error);
    }
  }

  /**
   * 启动监控
   */
  private async startMonitoring(): Promise<void> {
    console.log('📈 启动数据库监控...');

    try {
      startDatabaseMonitoring(
        this.sequelize,
        this.redis,
        this.options.monitoringInterval
      );
      console.log('✅ 数据库监控已启动');
    } catch (error) {
      console.error('监控启动失败:', error);
    }
  }

  /**
   * 分析表统计信息
   */
  private async analyzeTables(): Promise<void> {
    console.log('📊 更新表统计信息...');

    try {
      // 获取所有表
      const tables = await this.sequelize.query(
        `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `,
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const table of tables as any[]) {
        const tableName = table.table_name;
        await this.sequelize.query(`ANALYZE ${tableName}`);
        console.log(`✅ 分析表: ${tableName}`);
      }
    } catch (error) {
      console.error('表分析失败:', error);
    }
  }

  /**
   * 执行VACUUM
   */
  private async vacuumTables(): Promise<void> {
    console.log('🧹 执行VACUUM优化...');

    try {
      // 获取所有表
      const tables = await this.sequelize.query(
        `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `,
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const table of tables as any[]) {
        const tableName = table.table_name;
        await this.sequelize.query(`VACUUM ANALYZE ${tableName}`);
        console.log(`✅ VACUUM表: ${tableName}`);
      }
    } catch (error) {
      console.error('VACUUM执行失败:', error);
    }
  }

  /**
   * 优化查询缓存
   */
  private async optimizeQueryCache(): Promise<void> {
    console.log('💾 优化查询缓存...');

    try {
      // 清理Redis缓存
      await this.redis.flushAll();
      console.log('✅ Redis缓存已清理');

      // 重置查询缓存
      await this.sequelize.query('DISCARD PLANS');
      console.log('✅ 查询计划缓存已重置');
    } catch (error) {
      console.error('查询缓存优化失败:', error);
    }
  }

  /**
   * 创建索引
   */
  private async createIndexes(suggestions: any[]): Promise<void> {
    console.log(`🔍 创建 ${suggestions.length} 个索引...`);

    for (const suggestion of suggestions) {
      try {
        const indexName = `idx_${suggestion.table}_${suggestion.columns.join('_')}`;
        const columns = suggestion.columns.join(', ');

        let indexSQL = `CREATE INDEX ${indexName} ON ${suggestion.table} (${columns})`;

        if (suggestion.type === 'unique') {
          indexSQL = `CREATE UNIQUE INDEX ${indexName} ON ${suggestion.table} (${columns})`;
        }

        await this.sequelize.query(indexSQL);
        console.log(`✅ 创建索引: ${indexName}`);
      } catch (error) {
        console.error(`索引创建失败: ${suggestion.table}`, error);
      }
    }
  }

  /**
   * 删除未使用的索引
   */
  private async dropUnusedIndexes(): Promise<void> {
    console.log('🗑️ 删除未使用的索引...');

    try {
      // 查找未使用的索引
      const unusedIndexes = await this.sequelize.query(
        `
        SELECT schemaname, tablename, indexname
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND schemaname = 'public'
      `,
        { type: Sequelize.QueryTypes.SELECT }
      );

      for (const index of unusedIndexes as any[]) {
        try {
          await this.sequelize.query(`DROP INDEX ${index.indexname}`);
          console.log(`✅ 删除未使用索引: ${index.indexname}`);
        } catch (error) {
          console.error(`删除索引失败: ${index.indexname}`, error);
        }
      }
    } catch (error) {
      console.error('删除未使用索引失败:', error);
    }
  }

  /**
   * 生成优化报告
   */
  async generateReport(): Promise<string> {
    const report = [];

    report.push('# 数据库优化报告');
    report.push(`生成时间: ${new Date().toISOString()}`);
    report.push('');

    // 数据库连接信息
    report.push('## 数据库连接信息');
    report.push(`- 主机: ${appConfig.database.host}`);
    report.push(`- 端口: ${appConfig.database.port}`);
    report.push(`- 数据库: ${appConfig.database.database}`);
    report.push(`- 用户: ${appConfig.database.username}`);
    report.push('');

    // 优化选项
    report.push('## 优化选项');
    report.push(`- 分析: ${this.options.analyze ? '是' : '否'}`);
    report.push(`- 优化: ${this.options.optimize ? '是' : '否'}`);
    report.push(`- 索引: ${this.options.index ? '是' : '否'}`);
    report.push(`- 备份: ${this.options.backup ? '是' : '否'}`);
    report.push(`- 迁移: ${this.options.migrate ? '是' : '否'}`);
    report.push(`- 监控: ${this.options.monitor ? '是' : '否'}`);
    report.push('');

    // 性能指标
    try {
      const monitor = getDatabaseMonitor(this.sequelize, this.redis);
      const metrics = monitor.getMetrics();

      report.push('## 性能指标');
      report.push(`- 总连接数: ${metrics.connectionPool.total}`);
      report.push(`- 活跃连接: ${metrics.connectionPool.active}`);
      report.push(
        `- 平均查询时间: ${metrics.queryPerformance.averageQueryTime.toFixed(2)}ms`
      );
      report.push(`- 慢查询数: ${metrics.queryPerformance.slowQueries}`);
      report.push(`- 缓存命中率: ${metrics.cacheMetrics.hitRate.toFixed(2)}%`);
      report.push('');
    } catch (error) {
      report.push('## 性能指标');
      report.push('无法获取性能指标');
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    try {
      await this.sequelize.close();
      await this.redis.quit();
    } catch (error) {
      console.error('清理资源失败:', error);
    }
  }
}

// 命令行参数解析
function parseArgs(): Partial<OptimizationOptions> {
  const args = process.argv.slice(2);
  const options: Partial<OptimizationOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--analyze':
        options.analyze = true;
        break;
      case '--optimize':
        options.optimize = true;
        break;
      case '--index':
        options.index = true;
        break;
      case '--backup':
        options.backup = true;
        break;
      case '--migrate':
        options.migrate = true;
        break;
      case '--monitor':
        options.monitor = true;
        break;
      case '--create-indexes':
        options.createIndexes = true;
        break;
      case '--drop-unused-indexes':
        options.dropUnusedIndexes = true;
        break;
      case '--analyze-tables':
        options.analyzeTables = true;
        break;
      case '--vacuum-tables':
        options.vacuumTables = true;
        break;
      case '--start-monitoring':
        options.startMonitoring = true;
        break;
      case '--monitoring-interval':
        options.monitoringInterval = parseInt(args[++i]);
        break;
      case '--create-backup':
        options.createBackup = true;
        break;
      case '--backup-type':
        options.backupType = args[++i] as 'full' | 'incremental';
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--help':
        console.log(`
数据库优化脚本

用法: tsx scripts/optimize-database.ts [选项]

选项:
  --analyze                   分析数据库性能
  --optimize                  优化数据库性能
  --index                     优化索引
  --backup                    创建备份
  --migrate                   运行迁移
  --monitor                   启动监控
  --create-indexes            创建建议的索引
  --drop-unused-indexes       删除未使用的索引
  --analyze-tables            分析表统计信息
  --vacuum-tables             执行VACUUM优化
  --start-monitoring          启动数据库监控
  --monitoring-interval <ms>  监控间隔（毫秒）
  --create-backup             创建备份
  --backup-type <type>        备份类型（full|incremental）
  --verbose                   详细输出
  --output <file>             输出报告到文件
  --help                      显示帮助信息

示例:
  tsx scripts/optimize-database.ts --analyze --optimize --index
  tsx scripts/optimize-database.ts --backup --migrate --monitor
  tsx scripts/optimize-database.ts --create-indexes --vacuum-tables
`);
        process.exit(0);
        break;
    }
  }

  return options;
}

// 主函数
async function main() {
  const options = parseArgs();

  // 如果没有指定任何选项，默认执行分析
  if (Object.keys(options).length === 0) {
    options.analyze = true;
    options.optimize = true;
    options.index = true;
  }

  const optimizer = new DatabaseOptimizer(options);

  try {
    await optimizer.optimize();

    // 生成报告
    const report = await optimizer.generateReport();
    console.log(report);

    // 输出到文件
    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, report);
      console.log(`报告已保存到: ${options.outputFile}`);
    }
  } catch (error) {
    console.error('优化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export default DatabaseOptimizer;

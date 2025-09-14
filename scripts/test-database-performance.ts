/**
 * 数据库性能测试脚本
 * 测试数据库连接、查询性能、连接池等关键指标
 */

import { Sequelize } from 'sequelize';
import { appConfig } from '../lib/config';

interface PerformanceMetrics {
  connectionTime: number;
  queryTime: number;
  connectionPoolStats: {
    total: number;
    used: number;
    idle: number;
  };
  queryPerformance: {
    simpleQuery: number;
    complexQuery: number;
    insertQuery: number;
    updateQuery: number;
    deleteQuery: number;
  };
  errorRate: number;
  throughput: number;
}

class DatabasePerformanceTester {
  private sequelize: Sequelize;
  private metrics: PerformanceMetrics;

  constructor() {
    const { database: dbConfig } = appConfig;
    
    this.sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: dbConfig.pool.max,
          min: dbConfig.pool.min,
          acquire: dbConfig.pool.acquire,
          idle: dbConfig.pool.idle,
        },
        benchmark: true,
        define: {
          freezeTableName: true,
          underscored: true,
          timestamps: true,
        },
      }
    );

    this.metrics = {
      connectionTime: 0,
      queryTime: 0,
      connectionPoolStats: { total: 0, used: 0, idle: 0 },
      queryPerformance: {
        simpleQuery: 0,
        complexQuery: 0,
        insertQuery: 0,
        updateQuery: 0,
        deleteQuery: 0,
      },
      errorRate: 0,
      throughput: 0,
    };
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<void> {
    console.log('🔌 测试数据库连接...');
    
    const startTime = Date.now();
    
    try {
      await this.sequelize.authenticate();
      this.metrics.connectionTime = Date.now() - startTime;
      console.log(`✅ 连接成功 (${this.metrics.connectionTime}ms)`);
    } catch (error) {
      console.error('❌ 连接失败:', error);
      throw error;
    }
  }

  /**
   * 测试连接池性能
   */
  async testConnectionPool(): Promise<void> {
    console.log('🏊 测试连接池性能...');
    
    try {
      const pool = this.sequelize.connectionManager.pool;
      this.metrics.connectionPoolStats = {
        total: pool.size,
        used: pool.used,
        idle: pool.available,
      };
      
      console.log(`📊 连接池状态: 总数=${pool.size}, 使用中=${pool.used}, 空闲=${pool.available}`);
    } catch (error) {
      console.error('❌ 连接池测试失败:', error);
    }
  }

  /**
   * 测试简单查询性能
   */
  async testSimpleQuery(): Promise<void> {
    console.log('🔍 测试简单查询性能...');
    
    const startTime = Date.now();
    
    try {
      await this.sequelize.query('SELECT 1 as test');
      this.metrics.queryPerformance.simpleQuery = Date.now() - startTime;
      console.log(`✅ 简单查询完成 (${this.metrics.queryPerformance.simpleQuery}ms)`);
    } catch (error) {
      console.error('❌ 简单查询失败:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * 测试复杂查询性能
   */
  async testComplexQuery(): Promise<void> {
    console.log('🔍 测试复杂查询性能...');
    
    const startTime = Date.now();
    
    try {
      // 测试系统表查询
      await this.sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          tableowner,
          hasindexes,
          hasrules,
          hastriggers
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
        LIMIT 10
      `);
      
      this.metrics.queryPerformance.complexQuery = Date.now() - startTime;
      console.log(`✅ 复杂查询完成 (${this.metrics.queryPerformance.complexQuery}ms)`);
    } catch (error) {
      console.error('❌ 复杂查询失败:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * 测试插入性能
   */
  async testInsertPerformance(): Promise<void> {
    console.log('📝 测试插入性能...');
    
    const startTime = Date.now();
    
    try {
      // 创建临时表进行测试
      await this.sequelize.query(`
        CREATE TEMP TABLE IF NOT EXISTS perf_test (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          value INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // 插入测试数据
      await this.sequelize.query(`
        INSERT INTO perf_test (name, value) 
        VALUES ('test', 123), ('test2', 456), ('test3', 789)
      `);
      
      this.metrics.queryPerformance.insertQuery = Date.now() - startTime;
      console.log(`✅ 插入查询完成 (${this.metrics.queryPerformance.insertQuery}ms)`);
    } catch (error) {
      console.error('❌ 插入查询失败:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * 测试更新性能
   */
  async testUpdatePerformance(): Promise<void> {
    console.log('🔄 测试更新性能...');
    
    const startTime = Date.now();
    
    try {
      await this.sequelize.query(`
        UPDATE perf_test 
        SET value = value + 1 
        WHERE name = 'test'
      `);
      
      this.metrics.queryPerformance.updateQuery = Date.now() - startTime;
      console.log(`✅ 更新查询完成 (${this.metrics.queryPerformance.updateQuery}ms)`);
    } catch (error) {
      console.error('❌ 更新查询失败:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * 测试删除性能
   */
  async testDeletePerformance(): Promise<void> {
    console.log('🗑️ 测试删除性能...');
    
    const startTime = Date.now();
    
    try {
      await this.sequelize.query(`
        DELETE FROM perf_test WHERE name = 'test3'
      `);
      
      this.metrics.queryPerformance.deleteQuery = Date.now() - startTime;
      console.log(`✅ 删除查询完成 (${this.metrics.queryPerformance.deleteQuery}ms)`);
    } catch (error) {
      console.error('❌ 删除查询失败:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * 测试并发性能
   */
  async testConcurrentPerformance(): Promise<void> {
    console.log('⚡ 测试并发性能...');
    
    const concurrentRequests = 10;
    const startTime = Date.now();
    
    try {
      const promises = Array(concurrentRequests).fill(0).map(() => 
        this.sequelize.query('SELECT COUNT(*) FROM perf_test')
      );
      
      await Promise.all(promises);
      
      const totalTime = Date.now() - startTime;
      this.metrics.throughput = (concurrentRequests / totalTime) * 1000; // 每秒请求数
      
      console.log(`✅ 并发测试完成 (${concurrentRequests}个请求, ${totalTime}ms, ${this.metrics.throughput.toFixed(2)} req/s)`);
    } catch (error) {
      console.error('❌ 并发测试失败:', error);
      this.metrics.errorRate++;
    }
  }

  /**
   * 测试数据库配置
   */
  async testDatabaseConfiguration(): Promise<void> {
    console.log('⚙️ 测试数据库配置...');
    
    try {
      // 检查数据库版本
      const versionResult = await this.sequelize.query('SELECT version()');
      console.log(`📊 数据库版本: ${versionResult[0][0].version.split(',')[0]}`);
      
      // 检查当前连接数
      const connectionsResult = await this.sequelize.query(`
        SELECT count(*) as connection_count 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);
      console.log(`🔗 当前活跃连接数: ${connectionsResult[0][0].connection_count}`);
      
      // 检查数据库大小
      const sizeResult = await this.sequelize.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
      `);
      console.log(`💾 数据库大小: ${sizeResult[0][0].db_size}`);
      
    } catch (error) {
      console.error('❌ 配置测试失败:', error);
    }
  }

  /**
   * 运行完整的性能测试
   */
  async runFullTest(): Promise<PerformanceMetrics> {
    console.log('🚀 开始数据库性能测试...\n');
    
    try {
      // 基础连接测试
      await this.testConnection();
      await this.testConnectionPool();
      
      // 查询性能测试
      await this.testSimpleQuery();
      await this.testComplexQuery();
      await this.testInsertPerformance();
      await this.testUpdatePerformance();
      await this.testDeletePerformance();
      
      // 并发性能测试
      await this.testConcurrentPerformance();
      
      // 配置测试
      await this.testDatabaseConfiguration();
      
      // 生成报告
      this.generateReport();
      
      return this.metrics;
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }

  /**
   * 生成性能报告
   */
  private generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 数据库性能测试报告');
    console.log('='.repeat(60));
    
    console.log('\n🔌 连接性能:');
    console.log(`   连接时间: ${this.metrics.connectionTime}ms`);
    
    console.log('\n🏊 连接池状态:');
    console.log(`   总连接数: ${this.metrics.connectionPoolStats.total}`);
    console.log(`   使用中: ${this.metrics.connectionPoolStats.used}`);
    console.log(`   空闲: ${this.metrics.connectionPoolStats.idle}`);
    
    console.log('\n⚡ 查询性能:');
    console.log(`   简单查询: ${this.metrics.queryPerformance.simpleQuery}ms`);
    console.log(`   复杂查询: ${this.metrics.queryPerformance.complexQuery}ms`);
    console.log(`   插入查询: ${this.metrics.queryPerformance.insertQuery}ms`);
    console.log(`   更新查询: ${this.metrics.queryPerformance.updateQuery}ms`);
    console.log(`   删除查询: ${this.metrics.queryPerformance.deleteQuery}ms`);
    
    console.log('\n🚀 并发性能:');
    console.log(`   吞吐量: ${this.metrics.throughput.toFixed(2)} req/s`);
    console.log(`   错误率: ${this.metrics.errorRate}%`);
    
    // 性能评估
    const avgQueryTime = Object.values(this.metrics.queryPerformance).reduce((a, b) => a + b, 0) / 5;
    let performanceGrade = 'A';
    
    if (avgQueryTime > 100) performanceGrade = 'B';
    if (avgQueryTime > 500) performanceGrade = 'C';
    if (avgQueryTime > 1000) performanceGrade = 'D';
    if (avgQueryTime > 2000) performanceGrade = 'F';
    
    console.log(`\n🏆 性能等级: ${performanceGrade}`);
    console.log(`📈 平均查询时间: ${avgQueryTime.toFixed(2)}ms`);
    
    // 建议
    console.log('\n💡 优化建议:');
    if (avgQueryTime > 100) {
      console.log('   - 考虑添加数据库索引');
    }
    if (this.metrics.throughput < 100) {
      console.log('   - 考虑优化连接池配置');
    }
    if (this.metrics.errorRate > 0) {
      console.log('   - 检查数据库连接稳定性');
    }
    if (this.metrics.connectionPoolStats.used / this.metrics.connectionPoolStats.total > 0.8) {
      console.log('   - 考虑增加连接池大小');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// 运行测试
async function main() {
  const tester = new DatabasePerformanceTester();
  
  try {
    await tester.runFullTest();
    console.log('\n✅ 数据库性能测试完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库性能测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { DatabasePerformanceTester };

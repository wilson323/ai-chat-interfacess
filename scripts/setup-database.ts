#!/usr/bin/env tsx

/**
 * 数据库设置和迁移脚本
 * 用于初始化数据库、运行迁移、验证表结构
 */

import { Sequelize } from 'sequelize';
import { appConfig } from '@/lib/config';
import { runMigrations, getMigrationManager } from '@/lib/db/migration';
import fs from 'fs';
import path from 'path';

interface DatabaseSetupOptions {
  force?: boolean;
  validate?: boolean;
  backup?: boolean;
  verbose?: boolean;
}

class DatabaseSetup {
  private sequelize: Sequelize;
  private options: DatabaseSetupOptions;

  constructor(options: DatabaseSetupOptions = {}) {
    this.options = {
      force: false,
      validate: true,
      backup: true,
      verbose: false,
      ...options,
    };

    // 创建数据库连接
    this.sequelize = new Sequelize({
      host: appConfig.database.host,
      port: appConfig.database.port,
      database: appConfig.database.database,
      username: appConfig.database.username,
      password: appConfig.database.password,
      dialect: 'postgres',
      logging: this.options.verbose ? console.log : false,
      pool: appConfig.database.pool,
    });
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      console.log('✅ 数据库连接成功');
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      return false;
    }
  }

  /**
   * 检查数据库是否存在
   */
  async checkDatabaseExists(): Promise<boolean> {
    try {
      const result = await this.sequelize.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' LIMIT 1",
        { type: Sequelize.QueryTypes.SELECT }
      );
      return result.length > 0;
    } catch (error) {
      console.error('检查数据库失败:', error);
      return false;
    }
  }

  /**
   * 创建必要的表
   */
  async createTables(): Promise<void> {
    console.log('📋 创建数据库表...');

    try {
      // 创建 agent_config 表
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS agent_config (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(255) NOT NULL,
          api_key VARCHAR(255) NOT NULL,
          app_id VARCHAR(255) NOT NULL,
          api_url VARCHAR(255) DEFAULT 'https://zktecoaihub.com/api/v1/chat/completions',
          system_prompt TEXT NOT NULL,
          temperature FLOAT DEFAULT 0.7,
          max_tokens INTEGER DEFAULT 2000,
          multimodal_model VARCHAR(255),
          is_published BOOLEAN DEFAULT true,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT,
          "order" INTEGER DEFAULT 100
        )
      `);

      // 创建 cad_histories 表
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS cad_histories (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255),
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER,
          analysis_result JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建 migrations 表
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          version VARCHAR(50) NOT NULL,
          description TEXT,
          checksum VARCHAR(32) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          rollback_at TIMESTAMP NULL,
          status VARCHAR(20) DEFAULT 'pending',
          error TEXT NULL
        )
      `);

      console.log('✅ 数据库表创建完成');
    } catch (error) {
      console.error('❌ 创建表失败:', error);
      throw error;
    }
  }

  /**
   * 创建索引
   */
  async createIndexes(): Promise<void> {
    console.log('📊 创建数据库索引...');

    try {
      // agent_config 表索引
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_agent_config_type ON agent_config(type)
      `);
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_agent_config_published ON agent_config(is_published)
      `);

      // cad_histories 表索引
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_cad_histories_user_id ON cad_histories(user_id)
      `);
      await this.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_cad_histories_created_at ON cad_histories(created_at)
      `);

      console.log('✅ 数据库索引创建完成');
    } catch (error) {
      console.error('❌ 创建索引失败:', error);
      throw error;
    }
  }

  /**
   * 运行数据库迁移
   */
  async runMigrations(): Promise<void> {
    console.log('🔄 运行数据库迁移...');

    try {
      const migrationManager = getMigrationManager(this.sequelize, {
        migrationsDir: './migrations',
        tableName: 'migrations',
      });

      const executedMigrations = await migrationManager.runMigrations();

      if (executedMigrations.length > 0) {
        console.log(`✅ 成功执行 ${executedMigrations.length} 个迁移`);
        executedMigrations.forEach(migration => {
          console.log(`  - ${migration.name} (${migration.version})`);
        });
      } else {
        console.log('ℹ️ 没有待执行的迁移');
      }
    } catch (error) {
      console.error('❌ 迁移执行失败:', error);
      throw error;
    }
  }

  /**
   * 验证表结构
   */
  async validateTables(): Promise<boolean> {
    console.log('🔍 验证表结构...');

    try {
      const requiredTables = ['agent_config', 'cad_histories', 'migrations'];
      const existingTables = await this.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
        { type: Sequelize.QueryTypes.SELECT }
      );

      const tableNames = existingTables.map((row: any) => row.table_name);
      const missingTables = requiredTables.filter(
        table => !tableNames.includes(table)
      );

      if (missingTables.length > 0) {
        console.error('❌ 缺少必需的表:', missingTables.join(', '));
        return false;
      }

      // 验证表结构
      for (const table of requiredTables) {
        const columns = await this.sequelize.query(
          `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        console.log(`  ✅ ${table} 表结构正常 (${columns.length} 列)`);
      }

      console.log('✅ 表结构验证通过');
      return true;
    } catch (error) {
      console.error('❌ 表结构验证失败:', error);
      return false;
    }
  }

  /**
   * 创建备份
   */
  async createBackup(): Promise<void> {
    if (!this.options.backup) return;

    console.log('💾 创建数据库备份...');

    try {
      const { createFullBackup } = await import('@/lib/db/backup');
      const backup = await createFullBackup();

      if (backup.status === 'success') {
        console.log(`✅ 备份创建成功: ${backup.id}`);
      } else {
        console.error('❌ 备份创建失败:', backup.error);
      }
    } catch (error) {
      console.error('❌ 备份创建失败:', error);
    }
  }

  /**
   * 执行完整的数据库设置
   */
  async setup(): Promise<void> {
    console.log('🚀 开始数据库设置...');

    try {
      // 1. 测试连接
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('数据库连接失败');
      }

      // 2. 检查数据库是否存在
      const dbExists = await this.checkDatabaseExists();
      if (!dbExists) {
        console.log('ℹ️ 数据库为空，将创建表结构');
      }

      // 3. 创建备份（如果需要）
      if (this.options.backup && dbExists) {
        await this.createBackup();
      }

      // 4. 创建表
      await this.createTables();

      // 5. 创建索引
      await this.createIndexes();

      // 6. 运行迁移
      await this.runMigrations();

      // 7. 验证表结构
      if (this.options.validate) {
        const valid = await this.validateTables();
        if (!valid) {
          throw new Error('表结构验证失败');
        }
      }

      console.log('🎉 数据库设置完成!');
    } catch (error) {
      console.error('❌ 数据库设置失败:', error);
      throw error;
    } finally {
      await this.sequelize.close();
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options: DatabaseSetupOptions = {
    force: args.includes('--force'),
    validate: !args.includes('--no-validate'),
    backup: !args.includes('--no-backup'),
    verbose: args.includes('--verbose'),
  };

  try {
    const setup = new DatabaseSetup(options);
    await setup.setup();
    process.exit(0);
  } catch (error) {
    console.error('设置失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { DatabaseSetup };

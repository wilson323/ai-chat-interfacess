/**
 * 数据库迁移管理工具
 * 提供数据库结构迁移、数据迁移、版本管理等功能
 */
import { logger } from '../utils/logger';
import { ErrorFactory } from '../utils/error-utils';
import { Sequelize, QueryTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface MigrationInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  up: string;
  down: string;
  checksum: string;
  appliedAt?: Date;
  rollbackAt?: Date;
  status: 'pending' | 'applied' | 'rolled_back' | 'failed';
  error?: string;
}

interface MigrationConfig {
  migrationsDir: string;
  tableName: string;
  backupBeforeMigration: boolean;
  rollbackOnError: boolean;
  validateChecksum: boolean;
}

class DatabaseMigrationManager {
  private sequelize: Sequelize;
  private config: MigrationConfig;
  private migrations: Map<string, MigrationInfo> = new Map();

  constructor(sequelize: Sequelize, config: Partial<MigrationConfig> = {}) {
    this.sequelize = sequelize;
    this.config = {
      migrationsDir: config.migrationsDir || './migrations',
      tableName: config.tableName || 'migrations',
      backupBeforeMigration: config.backupBeforeMigration ?? true,
      rollbackOnError: config.rollbackOnError ?? true,
      validateChecksum: config.validateChecksum ?? true,
    };

    this.ensureMigrationsDirectory();
    this.loadMigrations();
  }

  /**
   * 确保迁移目录存在
   */
  private ensureMigrationsDirectory(): void {
    if (!fs.existsSync(this.config.migrationsDir)) {
      fs.mkdirSync(this.config.migrationsDir, { recursive: true });
    }
  }

  /**
   * 加载迁移文件
   */
  private loadMigrations(): void {
    if (!fs.existsSync(this.config.migrationsDir)) {
      return;
    }

    const files = fs
      .readdirSync(this.config.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(this.config.migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 解析迁移文件
      const migration = this.parseMigrationFile(file, content);
      if (migration) {
        this.migrations.set(migration.id, migration);
      }
    }
  }

  /**
   * 解析迁移文件
   */
  private parseMigrationFile(
    fileName: string,
    content: string
  ): MigrationInfo | null {
    try {
      // 提取版本号
      const versionMatch = fileName.match(/^(\d+)_/);
      if (!versionMatch) {
        logger.warn(`无效的迁移文件名: ${fileName}`);
        return null;
      }

      const version = versionMatch[1];
      const name = fileName.replace(/^\d+_/, '').replace(/\.sql$/, '');

      // 解析SQL内容
      const sections = content.split('-- DOWN');
      const up = sections[0].replace('-- UP', '').trim();
      const down = sections[1] ? sections[1].trim() : '';

      // 计算校验和
      const checksum = crypto.createHash('md5').update(content).digest('hex');

      return {
        id: `${version}_${name}`,
        name,
        version,
        description: this.extractDescription(content),
        up,
        down,
        checksum,
        status: 'pending',
      };
    } catch (error) {
      logger.error(`解析迁移文件失败: ${fileName}`, error);
      return null;
    }
  }

  /**
   * 提取描述信息
   */
  private extractDescription(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('-- Description:')) {
        return line.replace('-- Description:', '').trim();
      }
    }
    return 'No description';
  }

  /**
   * 创建迁移表
   */
  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
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
    `;

    await this.sequelize.query(createTableSQL);
  }

  /**
   * 获取已应用的迁移
   */
  private async getAppliedMigrations(): Promise<Map<string, MigrationInfo>> {
    await this.createMigrationsTable();

    const appliedMigrations = new Map<string, MigrationInfo>();

    try {
      const results = await this.sequelize.query(
        `SELECT * FROM ${this.config.tableName} ORDER BY version`,
        { type: QueryTypes.SELECT }
      );

      for (const row of results as Array<{
        id: string;
        name: string;
        version: string;
        description: string;
        checksum: string;
        appliedAt: Date;
      }>) {
        appliedMigrations.set(row.id, {
          id: row.id,
          name: row.name,
          version: row.version,
          description: row.description,
          up: '',
          down: '',
          checksum: row.checksum,
          appliedAt: row.appliedAt,
          rollbackAt: (row as any).rollback_at,
          status: (row as any).status,
          error: (row as any).error,
        });
      }
    } catch (error) {
      logger.error('获取已应用迁移失败:', error);
    }

    return appliedMigrations;
  }

  /**
   * 执行迁移
   */
  async runMigrations(): Promise<MigrationInfo[]> {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations: MigrationInfo[] = [];

    // 找出待执行的迁移
    for (const [id, migration] of Array.from(this.migrations.entries())) {
      if (!appliedMigrations.has(id)) {
        pendingMigrations.push(migration);
      }
    }

    // 按版本号排序
    pendingMigrations.sort((a, b) => a.version.localeCompare(b.version));

    const executedMigrations: MigrationInfo[] = [];

    for (const migration of pendingMigrations) {
      try {
        logger.debug(`执行迁移: ${migration.name} (${migration.version})`);

        // 验证校验和
        if (this.config.validateChecksum) {
          const currentChecksum = this.calculateMigrationChecksum(migration);
          if (currentChecksum !== migration.checksum) {
            throw ErrorFactory.database(`迁移校验和不匹配: ${migration.name}`);
          }
        }

        // 执行迁移
        await this.executeMigration(migration, 'up');

        // 记录迁移
        await this.recordMigration(migration, 'applied');

        migration.status = 'applied';
        migration.appliedAt = new Date();
        executedMigrations.push(migration);

        logger.debug(`迁移完成: ${migration.name}`);
      } catch (error) {
        logger.error(`迁移失败: ${migration.name}`, error);

        migration.status = 'failed';
        migration.error =
          error instanceof Error ? error.message : String(error);

        // 记录失败
        await this.recordMigration(migration, 'failed', error instanceof Error ? error.message : String(error));

        if (this.config.rollbackOnError) {
          // 回滚已执行的迁移
          await this.rollbackMigrations(executedMigrations.reverse());
        }

        throw error;
      }
    }

    return executedMigrations;
  }

  /**
   * 执行迁移SQL
   */
  private async executeMigration(
    migration: MigrationInfo,
    direction: 'up' | 'down'
  ): Promise<void> {
    const sql = direction === 'up' ? migration.up : migration.down;

    if (!sql.trim()) {
      logger.warn(`迁移 ${migration.name} 没有 ${direction} SQL`);
      return;
    }

    // 分割SQL语句
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await this.sequelize.query(statement.trim());
      }
    }
  }

  /**
   * 记录迁移
   */
  private async recordMigration(
    migration: MigrationInfo,
    status: string,
    error?: Error | string
  ): Promise<void> {
    const sql = `
      INSERT INTO ${this.config.tableName}
      (id, name, version, description, checksum, status, error)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      error = EXCLUDED.error,
      ${status === 'applied' ? 'applied_at = CURRENT_TIMESTAMP' : ''}
      ${status === 'rolled_back' ? 'rollback_at = CURRENT_TIMESTAMP' : ''}
    `;

    await this.sequelize.query(sql, {
      replacements: [
        migration.id,
        migration.name,
        migration.version,
        migration.description,
        migration.checksum,
        status,
        error ? (error instanceof Error ? error.message : String(error)) : null,
      ],
    });
  }

  /**
   * 回滚迁移
   */
  async rollbackMigrations(migrations: MigrationInfo[]): Promise<void> {
    logger.debug(`开始回滚 ${migrations.length} 个迁移`);

    for (const migration of migrations) {
      try {
        logger.debug(`回滚迁移: ${migration.name}`);

        // 执行回滚SQL
        await this.executeMigration(migration, 'down');

        // 更新状态
        await this.sequelize.query(
          `UPDATE ${this.config.tableName} SET status = 'rolled_back', rollback_at = CURRENT_TIMESTAMP WHERE id = ?`,
          { replacements: [migration.id] }
        );

        migration.status = 'rolled_back';
        migration.rollbackAt = new Date();

        logger.debug(`回滚完成: ${migration.name}`);
      } catch (error) {
        logger.error(`回滚失败: ${migration.name}`, error);
        throw error;
      }
    }
  }

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(version: string): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations();
    const migrationsToRollback: MigrationInfo[] = [];

    // 找出需要回滚的迁移
    for (const [id, migration] of Array.from(this.migrations.entries())) {
      if (appliedMigrations.has(id) && migration.version > version) {
        migrationsToRollback.push(migration);
      }
    }

    // 按版本号倒序排列
    migrationsToRollback.sort((a, b) => b.version.localeCompare(a.version));

    await this.rollbackMigrations(migrationsToRollback);
  }

  /**
   * 计算迁移校验和
   */
  private calculateMigrationChecksum(migration: MigrationInfo): string {
    const content = `-- UP\n${migration.up}\n-- DOWN\n${migration.down}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 创建迁移文件
   */
  async createMigration(name: string, description: string): Promise<string> {
    const timestamp = Date.now();
    const version = Math.floor(timestamp / 1000);
    const fileName = `${version}_${name}.sql`;
    const filePath = path.join(this.config.migrationsDir, fileName);

    const content = `-- Description: ${description}

-- UP
-- 在这里编写迁移SQL

-- DOWN
-- 在这里编写回滚SQL
`;

    fs.writeFileSync(filePath, content);

    logger.debug(`创建迁移文件: ${fileName}`);
    return filePath;
  }

  /**
   * 获取迁移状态
   */
  async getMigrationStatus(): Promise<{
    total: number;
    applied: number;
    pending: number;
    failed: number;
    rolledBack: number;
    migrations: MigrationInfo[];
  }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = Array.from(this.migrations.values());

    let applied = 0;
    let pending = 0;
    let failed = 0;
    let rolledBack = 0;

    const migrations: MigrationInfo[] = [];

    for (const migration of allMigrations) {
      const appliedMigration = appliedMigrations.get(migration.id);

      if (appliedMigration) {
        migration.status = appliedMigration.status;
        migration.appliedAt = appliedMigration.appliedAt;
        migration.rollbackAt = appliedMigration.rollbackAt;
        migration.error = appliedMigration.error;

        switch (appliedMigration.status) {
          case 'applied':
            applied++;
            break;
          case 'failed':
            failed++;
            break;
          case 'rolled_back':
            rolledBack++;
            break;
        }
      } else {
        migration.status = 'pending';
        pending++;
      }

      migrations.push(migration);
    }

    return {
      total: allMigrations.length,
      applied,
      pending,
      failed,
      rolledBack,
      migrations: migrations.sort((a, b) => a.version.localeCompare(b.version)),
    };
  }

  /**
   * 验证迁移完整性
   */
  async validateMigrations(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    for (const [, migration] of Array.from(this.migrations.entries())) {
      // 验证校验和
      const currentChecksum = this.calculateMigrationChecksum(migration);
      if (currentChecksum !== migration.checksum) {
        errors.push(`迁移 ${migration.name} 校验和不匹配`);
      }

      // 验证SQL语法
      try {
        if (migration.up.trim()) {
          await this.sequelize.query(`EXPLAIN ${migration.up}`);
        }
        if (migration.down.trim()) {
          await this.sequelize.query(`EXPLAIN ${migration.down}`);
        }
      } catch (error) {
        errors.push(`迁移 ${migration.name} SQL语法错误: ${error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 生成迁移报告
   */
  async generateMigrationReport(): Promise<string> {
    const status = await this.getMigrationStatus();
    const validation = await this.validateMigrations();

    return `
# 数据库迁移报告

## 迁移状态
- 总迁移数: ${status.total}
- 已应用: ${status.applied}
- 待执行: ${status.pending}
- 失败: ${status.failed}
- 已回滚: ${status.rolledBack}

## 验证结果
- 完整性: ${validation.valid ? '通过' : '失败'}
- 错误数: ${validation.errors.length}

## 错误详情
${validation.errors.map(error => `- ${error}`).join('\n')}

## 迁移列表
${status.migrations
  .map(
    migration => `
- ${migration.name} (${migration.version}) - ${migration.status}
  - 描述: ${migration.description}
  - 应用时间: ${migration.appliedAt ? migration.appliedAt.toISOString() : '未应用'}
  - 回滚时间: ${migration.rollbackAt ? migration.rollbackAt.toISOString() : '未回滚'}
  ${migration.error ? `- 错误: ${migration.error}` : ''}
`
  )
  .join('')}
`;
  }
}

// 创建全局迁移管理器实例
let globalMigrationManager: DatabaseMigrationManager | null = null;

/**
 * 获取迁移管理器实例
 */
export function getMigrationManager(
  sequelize: Sequelize,
  config?: Partial<MigrationConfig>
): DatabaseMigrationManager {
  if (!globalMigrationManager) {
    globalMigrationManager = new DatabaseMigrationManager(sequelize, config);
  }
  return globalMigrationManager;
}

/**
 * 执行迁移
 */
export async function runMigrations(
  sequelize: Sequelize,
  config?: Partial<MigrationConfig>
): Promise<MigrationInfo[]> {
  const manager = getMigrationManager(sequelize, config);
  return manager.runMigrations();
}

/**
 * 回滚迁移
 */
export async function rollbackMigrations(
  migrations: MigrationInfo[],
  sequelize: Sequelize,
  config?: Partial<MigrationConfig>
): Promise<void> {
  const manager = getMigrationManager(sequelize, config);
  return manager.rollbackMigrations(migrations);
}

/**
 * 创建迁移文件
 */
export async function createMigration(
  name: string,
  description: string,
  sequelize: Sequelize,
  config?: Partial<MigrationConfig>
): Promise<string> {
  const manager = getMigrationManager(sequelize, config);
  return manager.createMigration(name, description);
}

// 默认导出
export default DatabaseMigrationManager;

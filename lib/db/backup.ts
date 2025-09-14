/**
 * 数据库备份和恢复工具
 * 提供数据库备份、恢复、迁移管理等功能
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { appConfig } from '@/lib/config';

interface BackupConfig {
  // 备份配置
  backupDir: string;
  maxBackups: number;
  compression: boolean;
  encryption: boolean;

  // 数据库配置
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;

  // 备份策略
  fullBackupInterval: number; // 小时
  incrementalBackupInterval: number; // 小时
  retentionDays: number;
}

interface BackupInfo {
  id: string;
  type: 'full' | 'incremental';
  timestamp: Date;
  size: number;
  path: string;
  status: 'success' | 'failed' | 'in_progress';
  error?: string;
}

interface RestoreOptions {
  backupId: string;
  targetDatabase?: string;
  createDatabase: boolean;
  dropExisting: boolean;
  restoreData: boolean;
  restoreSchema: boolean;
}

class DatabaseBackupManager {
  private config: BackupConfig;
  private backups: Map<string, BackupInfo> = new Map();

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      backupDir: config.backupDir || './backups',
      maxBackups: config.maxBackups || 10,
      compression: config.compression ?? true,
      encryption: config.encryption ?? false,
      host: config.host || appConfig.database.host,
      port: config.port || appConfig.database.port,
      database: config.database || appConfig.database.database,
      username: config.username || appConfig.database.username,
      password: config.password || appConfig.database.password,
      fullBackupInterval: config.fullBackupInterval || 24,
      incrementalBackupInterval: config.incrementalBackupInterval || 6,
      retentionDays: config.retentionDays || 30,
    };

    this.ensureBackupDirectory();
    this.loadBackupHistory();
  }

  /**
   * 确保备份目录存在
   */
  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * 加载备份历史
   */
  private loadBackupHistory(): void {
    const historyFile = path.join(this.config.backupDir, 'backup-history.json');

    if (fs.existsSync(historyFile)) {
      try {
        const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        for (const backup of history) {
          this.backups.set(backup.id, {
            ...backup,
            timestamp: new Date(backup.timestamp),
          });
        }
      } catch (error) {
        console.error('加载备份历史失败:', error);
      }
    }
  }

  /**
   * 保存备份历史
   */
  private saveBackupHistory(): void {
    const historyFile = path.join(this.config.backupDir, 'backup-history.json');
    const history = Array.from(this.backups.values());

    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * 创建全量备份
   */
  async createFullBackup(): Promise<BackupInfo> {
    const backupId = `full_${Date.now()}`;
    const timestamp = new Date();
    const fileName = `${backupId}.sql`;
    const filePath = path.join(this.config.backupDir, fileName);

    const backupInfo: BackupInfo = {
      id: backupId,
      type: 'full',
      timestamp,
      size: 0,
      path: filePath,
      status: 'in_progress',
    };

    this.backups.set(backupId, backupInfo);

    try {
      // 构建pg_dump命令
      const command = this.buildDumpCommand(fileName, true);

      // 执行备份
      await this.executeBackupCommand(command, backupInfo);

      // 更新备份信息
      backupInfo.status = 'success';
      backupInfo.size = fs.statSync(filePath).size;

      console.log(`全量备份完成: ${backupId}`);
    } catch (error) {
      backupInfo.status = 'failed';
      backupInfo.error = error instanceof Error ? error.message : String(error);
      console.error(`全量备份失败: ${backupId}`, error);
    }

    this.saveBackupHistory();
    return backupInfo;
  }

  /**
   * 创建增量备份
   */
  async createIncrementalBackup(): Promise<BackupInfo> {
    const backupId = `inc_${Date.now()}`;
    const timestamp = new Date();
    const fileName = `${backupId}.sql`;
    const filePath = path.join(this.config.backupDir, fileName);

    const backupInfo: BackupInfo = {
      id: backupId,
      type: 'incremental',
      timestamp,
      size: 0,
      path: filePath,
      status: 'in_progress',
    };

    this.backups.set(backupId, backupInfo);

    try {
      // 构建增量备份命令（只备份变更的数据）
      const command = this.buildDumpCommand(fileName, false);

      // 执行备份
      await this.executeBackupCommand(command, backupInfo);

      // 更新备份信息
      backupInfo.status = 'success';
      backupInfo.size = fs.statSync(filePath).size;

      console.log(`增量备份完成: ${backupId}`);
    } catch (error) {
      backupInfo.status = 'failed';
      backupInfo.error = error instanceof Error ? error.message : String(error);
      console.error(`增量备份失败: ${backupId}`, error);
    }

    this.saveBackupHistory();
    return backupInfo;
  }

  /**
   * 构建备份命令
   */
  private buildDumpCommand(fileName: string, isFull: boolean): string {
    const { host, port, database, username, password } = this.config;

    let command = `pg_dump`;
    command += ` -h ${host}`;
    command += ` -p ${port}`;
    command += ` -U ${username}`;
    command += ` -d ${database}`;

    if (isFull) {
      command += ` --schema-only --data-only`;
    } else {
      command += ` --data-only --where="updated_at > NOW() - INTERVAL '1 hour'"`;
    }

    if (this.config.compression) {
      command += ` --compress=9`;
    }

    command += ` -f ${path.join(this.config.backupDir, fileName)}`;

    // 设置密码环境变量
    process.env.PGPASSWORD = password;

    return command;
  }

  /**
   * 执行备份命令
   */
  private async executeBackupCommand(
    command: string,
    backupInfo: BackupInfo
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        stdio: 'pipe',
      });

      let errorOutput = '';

      child.stderr.on('data', data => {
        errorOutput += data.toString();
      });

      child.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`备份命令执行失败: ${errorOutput}`));
        }
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  /**
   * 恢复数据库
   */
  async restoreDatabase(options: RestoreOptions): Promise<void> {
    const backup = this.backups.get(options.backupId);
    if (!backup) {
      throw new Error(`备份不存在: ${options.backupId}`);
    }

    if (backup.status !== 'success') {
      throw new Error(`备份状态异常: ${backup.status}`);
    }

    if (!fs.existsSync(backup.path)) {
      throw new Error(`备份文件不存在: ${backup.path}`);
    }

    try {
      // 如果需要创建数据库
      if (options.createDatabase) {
        await this.createDatabase(
          options.targetDatabase || this.config.database
        );
      }

      // 如果需要删除现有数据
      if (options.dropExisting) {
        await this.dropDatabase(options.targetDatabase || this.config.database);
        await this.createDatabase(
          options.targetDatabase || this.config.database
        );
      }

      // 执行恢复
      await this.executeRestoreCommand(
        backup.path,
        options.targetDatabase || this.config.database
      );

      console.log(`数据库恢复完成: ${options.backupId}`);
    } catch (error) {
      console.error(`数据库恢复失败: ${options.backupId}`, error);
      throw error;
    }
  }

  /**
   * 创建数据库
   */
  private async createDatabase(databaseName: string): Promise<void> {
    const command = `createdb -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} ${databaseName}`;

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], { stdio: 'pipe' });

      child.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`创建数据库失败: ${databaseName}`));
        }
      });
    });
  }

  /**
   * 删除数据库
   */
  private async dropDatabase(databaseName: string): Promise<void> {
    const command = `dropdb -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} ${databaseName}`;

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], { stdio: 'pipe' });

      child.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`删除数据库失败: ${databaseName}`));
        }
      });
    });
  }

  /**
   * 执行恢复命令
   */
  private async executeRestoreCommand(
    backupPath: string,
    databaseName: string
  ): Promise<void> {
    const command = `psql -h ${this.config.host} -p ${this.config.port} -U ${this.config.username} -d ${databaseName} -f ${backupPath}`;

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], { stdio: 'pipe' });

      let errorOutput = '';

      child.stderr.on('data', data => {
        errorOutput += data.toString();
      });

      child.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`恢复命令执行失败: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * 清理过期备份
   */
  async cleanupExpiredBackups(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const expiredBackups: string[] = [];

    for (const [id, backup] of this.backups) {
      if (backup.timestamp < cutoffDate) {
        expiredBackups.push(id);
      }
    }

    for (const id of expiredBackups) {
      const backup = this.backups.get(id);
      if (backup) {
        // 删除备份文件
        if (fs.existsSync(backup.path)) {
          fs.unlinkSync(backup.path);
        }

        // 从备份历史中移除
        this.backups.delete(id);
      }
    }

    this.saveBackupHistory();
    console.log(`清理了 ${expiredBackups.length} 个过期备份`);
  }

  /**
   * 获取备份列表
   */
  getBackups(): BackupInfo[] {
    return Array.from(this.backups.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * 获取备份统计
   */
  getBackupStats(): {
    totalBackups: number;
    fullBackups: number;
    incrementalBackups: number;
    totalSize: number;
    lastBackup: Date | null;
    successRate: number;
  } {
    const backups = Array.from(this.backups.values());

    const totalBackups = backups.length;
    const fullBackups = backups.filter(b => b.type === 'full').length;
    const incrementalBackups = backups.filter(
      b => b.type === 'incremental'
    ).length;
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    const lastBackup = backups.length > 0 ? backups[0].timestamp : null;
    const successRate =
      backups.length > 0
        ? backups.filter(b => b.status === 'success').length / backups.length
        : 0;

    return {
      totalBackups,
      fullBackups,
      incrementalBackups,
      totalSize,
      lastBackup,
      successRate,
    };
  }

  /**
   * 验证备份完整性
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      return false;
    }

    if (!fs.existsSync(backup.path)) {
      return false;
    }

    try {
      // 检查文件大小
      const stats = fs.statSync(backup.path);
      if (stats.size === 0) {
        return false;
      }

      // 检查文件内容（简单检查）
      const content = fs.readFileSync(backup.path, 'utf8');
      if (content.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('验证备份失败:', error);
      return false;
    }
  }

  /**
   * 生成备份报告
   */
  generateBackupReport(): string {
    const stats = this.getBackupStats();
    const backups = this.getBackups();

    return `
# 数据库备份报告

## 备份统计
- 总备份数: ${stats.totalBackups}
- 全量备份: ${stats.fullBackups}
- 增量备份: ${stats.incrementalBackups}
- 总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB
- 最后备份: ${stats.lastBackup ? stats.lastBackup.toISOString() : '无'}
- 成功率: ${(stats.successRate * 100).toFixed(2)}%

## 最近备份
${backups
  .slice(0, 10)
  .map(
    backup => `
- ${backup.id} (${backup.type}) - ${backup.timestamp.toISOString()} - ${(backup.size / 1024).toFixed(2)}KB - ${backup.status}
`
  )
  .join('')}

## 配置信息
- 备份目录: ${this.config.backupDir}
- 最大备份数: ${this.config.maxBackups}
- 保留天数: ${this.config.retentionDays}
- 压缩: ${this.config.compression ? '是' : '否'}
- 加密: ${this.config.encryption ? '是' : '否'}
`;
  }
}

// 创建全局备份管理器实例
let globalBackupManager: DatabaseBackupManager | null = null;

/**
 * 获取备份管理器实例
 */
export function getBackupManager(
  config?: Partial<BackupConfig>
): DatabaseBackupManager {
  if (!globalBackupManager) {
    globalBackupManager = new DatabaseBackupManager(config);
  }
  return globalBackupManager;
}

/**
 * 创建全量备份
 */
export async function createFullBackup(
  config?: Partial<BackupConfig>
): Promise<BackupInfo> {
  const manager = getBackupManager(config);
  return manager.createFullBackup();
}

/**
 * 创建增量备份
 */
export async function createIncrementalBackup(
  config?: Partial<BackupConfig>
): Promise<BackupInfo> {
  const manager = getBackupManager(config);
  return manager.createIncrementalBackup();
}

/**
 * 恢复数据库
 */
export async function restoreDatabase(
  options: RestoreOptions,
  config?: Partial<BackupConfig>
): Promise<void> {
  const manager = getBackupManager(config);
  return manager.restoreDatabase(options);
}

/**
 * 清理过期备份
 */
export async function cleanupExpiredBackups(
  config?: Partial<BackupConfig>
): Promise<void> {
  const manager = getBackupManager(config);
  return manager.cleanupExpiredBackups();
}

// 默认导出
export default DatabaseBackupManager;

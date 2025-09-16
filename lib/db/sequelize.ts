import { Sequelize, Op } from 'sequelize';
import { Client } from 'pg';
import * as pg from 'pg';
import { appConfig, validateConfig } from '../config';

console.log('Sequelize loaded, cwd:', process.cwd());
// pg is already imported at the top

// 验证配置
try {
  validateConfig();
} catch (error) {
  console.error('配置验证失败:', error);
  throw error;
}

// 从统一配置获取数据库配置
const { database: dbConfig } = appConfig;
const DB_NAME = dbConfig.database;
const DB_USER = dbConfig.username;
const DB_PASSWORD = dbConfig.password;
const DB_HOST = dbConfig.host;
const DB_PORT = dbConfig.port;

async function ensureDatabaseExists() {
  const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres', // 先连默认库
  });
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`数据库 ${DB_NAME} 已自动创建`);
    }
  } catch (err) {
    console.error('自动检测/创建数据库失败:', err);
    throw err;
  } finally {
    await client.end();
  }
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  // 使用统一配置的连接池设置
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
    evict: 1000, // 清理间隔
    // handleDisconnects: true, // 处理断开连接 - 移除不存在的属性
  },

  // 添加重试机制
  retry: {
    max: 3, // 最大重试次数
    timeout: 60000, // 重试超时
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
  },

  // 性能监控
  benchmark: true,

  // 查询优化
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true,
    paranoid: false, // 软删除
  },

  // 查询优化配置
  query: {
    raw: false,
    nest: true,
    plain: false,
  },
});

// 初始化数据的函数，避免循环依赖
async function initializeDefaultData() {
  try {
    // 动态导入模型以避免循环依赖
    const { default: AgentConfig } = await import('./models/agent-config');

    const agentCount = await AgentConfig.count();
    if (agentCount === 0) {
      await AgentConfig.bulkCreate([
        {
          name: '默认智能体',
          type: 'fastgpt',
          apiKey: 'demo-key',
          appId: 'demo-appid',
          apiUrl: 'https://zktecoaihub.com/api/v1/chat/completions',
          systemPrompt: '你是一个专业的AI助手。',
          temperature: 0.7,
          maxTokens: 2000,
          multimodalModel: '',
          isPublished: true,
          description: '系统内置默认智能体',
          order: 1,
          supportsStream: true,
          supportsDetail: true,
        },
      ]);
      console.log('已自动初始化默认智能体数据');
    }
  } catch (err) {
    console.error('初始化默认数据失败:', err);
  }
}

export const sequelizeInitPromise = (async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 生产环境：不自动同步表结构，只验证连接
    // 表结构同步请使用管理员界面手动操作
    console.log('数据库连接验证完成（生产环境模式）');

    // 延迟初始化数据，避免循环依赖
    await initializeDefaultData();
    return true;
  } catch (err) {
    console.warn('数据库连接失败，启用内存存储模式:', (err as Error).message);
    console.warn('连接信息:', {
      database: DB_NAME,
      user: DB_USER,
      host: DB_HOST,
      port: DB_PORT,
    });
    console.log('🔄 应用将在内存存储模式下运行，数据不会持久化');

    // 不抛出错误，允许应用继续运行
    return { fallback: true };
  }
})();

export default sequelize;
export { sequelize, Op };

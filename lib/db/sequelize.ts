import { Sequelize } from 'sequelize';
import { Client } from 'pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

console.log('Sequelize loaded, cwd:', process.cwd());
try {
  require('pg');
  console.log('pg loaded successfully');
} catch (e) {
  console.error('pg load failed', e);
}

// 优先用环境变量 CONFIG_PATH，否则用项目根目录 config/config.json
const configPath = process.env.CONFIG_PATH || path.join(process.cwd(), 'config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

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
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`);
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
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    freezeTableName: true,
    underscored: true,
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
        },
      ]);
      console.log('已自动初始化默认智能体数据');
    }
  } catch (err) {
    console.error('初始化默认数据失败:', err);
  }
}

export const sequelizeInitPromise = (async () => {
  await ensureDatabaseExists();
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 生产环境：不自动同步表结构，只验证连接
    // 表结构同步请使用管理员界面手动操作
    console.log('数据库连接验证完成（生产环境模式）');

    // 延迟初始化数据，避免循环依赖
    await initializeDefaultData();
  } catch (err) {
    console.error('数据库连接失败:', err);
    console.error('连接信息:', {
      database: DB_NAME,
      user: DB_USER,
      host: DB_HOST,
      port: DB_PORT,
    });
    throw err;
  }
})();

export default sequelize;
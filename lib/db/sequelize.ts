import { Sequelize } from 'sequelize';
import { Client } from 'pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import AgentConfig from './models/agent-config';

console.log('Sequelize loaded, cwd:', process.cwd());
try {
  require('pg');
  console.log('pg loaded successfully');
} catch (e) {
  console.error('pg load failed', e);
}

// 从环境变量获取数据库配置
const dbUser = process.env.POSTGRES_USER || 'root';
const dbPassword = process.env.POSTGRES_PASSWORD || 'ZKTeco##123';
const dbName = process.env.POSTGRES_DB || 'agent_config';
const dbHost = process.env.POSTGRES_HOST || 'localhost';
const dbPort = parseInt(process.env.POSTGRES_PORT || '5432', 10);

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
});

export const sequelizeInitPromise = (async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ alter: true });
    console.log('所有表结构已自动同步');

    // 自动初始化数据
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
    console.error('数据库连接失败:', err);
    console.error('连接信息:', {
      database: dbName,
      user: dbUser,
      host: dbHost,
      port: dbPort,
    });
    throw err;
  }
})();

export default sequelize;

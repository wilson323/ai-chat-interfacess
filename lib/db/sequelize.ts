import { Sequelize } from 'sequelize';
import { Client } from 'pg';
import pg from 'pg';

console.log('Sequelize loaded, cwd:', process.cwd());
try {
  require('pg');
  console.log('pg loaded successfully');
} catch (e) {
  console.error('pg load failed', e);
}

const DB_NAME = 'zkteco-agent';
const DB_USER = process.env.POSTGRES_USER || 'root';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || 'ZKTeco##123';
const DB_HOST = process.env.POSTGRES_HOST || '192.168.10.111';
const DB_PORT = Number(process.env.POSTGRES_PORT) || 5442;

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

export const sequelizeInitPromise = (async () => {
  await ensureDatabaseExists();
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ alter: true });
    console.log('所有表结构已自动同步');
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
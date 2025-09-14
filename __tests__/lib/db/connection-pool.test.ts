/**
 * 数据库连接池测试
 * 测试数据库连接池的管理和性能
 */

import {
  createConnectionPool,
  getConnection,
  releaseConnection,
  closeConnectionPool,
  getPoolStatus,
  executeQuery,
  executeTransaction
} from '@/lib/db/connection-pool';

// Mock数据库连接
const mockConnection = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
  destroy: jest.fn()
};

const mockPool = {
  getConnection: jest.fn(),
  releaseConnection: jest.fn(),
  end: jest.fn(),
  _allConnections: [],
  _acquiringConnections: [],
  _freeConnections: []
};

// Mock mysql2
jest.mock('mysql2', () => ({
  createPool: jest.fn(() => mockPool)
}));

describe('数据库连接池测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPool.getConnection.mockClear();
    mockConnection.query.mockClear();
    mockPool._allConnections = [];
    mockPool._acquiringConnections = [];
    mockPool._freeConnections = [];
  });

  describe('连接池创建和配置测试', () => {
    it('应该创建数据库连接池', async () => {
      const config = {
        host: 'localhost',
        port: 3306,
        user: 'test',
        password: 'password',
        database: 'testdb',
        connectionLimit: 10
      };

      await createConnectionPool(config);

      expect(mockPool.getConnection).toBeDefined();
      expect(mockPool.releaseConnection).toBeDefined();
    });

    it('应该使用默认配置创建连接池', async () => {
      await createConnectionPool({});

      expect(mockPool.getConnection).toBeDefined();
    });

    it('应该处理连接池创建失败', async () => {
      const mysql2 = require('mysql2');
      mysql2.createPool.mockImplementationOnce(() => {
        throw new Error('Connection failed');
      });

      await expect(createConnectionPool({})).rejects.toThrow('Connection failed');
    });
  });

  describe('连接获取和释放测试', () => {
    beforeEach(async () => {
      await createConnectionPool({});
    });

    it('应该获取数据库连接', async () => {
      mockPool.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });

      const connection = await getConnection();

      expect(mockPool.getConnection).toHaveBeenCalled();
      expect(connection).toBe(mockConnection);
    });

    it('应该处理连接获取失败', async () => {
      mockPool.getConnection.mockImplementation((callback) => {
        callback(new Error('Connection timeout'), null);
      });

      await expect(getConnection()).rejects.toThrow('Connection timeout');
    });

    it('应该释放数据库连接', async () => {
      await releaseConnection(mockConnection);

      expect(mockPool.releaseConnection).toHaveBeenCalledWith(mockConnection);
    });

    it('应该处理连接释放错误', async () => {
      mockPool.releaseConnection.mockImplementation(() => {
        throw new Error('Release failed');
      });

      await expect(releaseConnection(mockConnection)).rejects.toThrow('Release failed');
    });
  });

  describe('查询执行测试', () => {
    beforeEach(async () => {
      await createConnectionPool({});
      mockPool.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });
    });

    it('应该执行简单查询', async () => {
      const mockResult = [{ id: 1, name: 'Test' }];
      mockConnection.query.mockImplementation((sql, callback) => {
        callback(null, mockResult);
      });

      const result = await executeQuery('SELECT * FROM users');

      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
      expect(result).toEqual(mockResult);
    });

    it('应该执行带参数的查询', async () => {
      const mockResult = [{ id: 1, name: 'John' }];
      mockConnection.query.mockImplementation((sql, params, callback) => {
        callback(null, mockResult);
      });

      const result = await executeQuery('SELECT * FROM users WHERE id = ?', [1]);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });

    it('应该处理查询错误', async () => {
      mockConnection.query.mockImplementation((sql, callback) => {
        callback(new Error('SQL syntax error'), null);
      });

      await expect(executeQuery('INVALID SQL')).rejects.toThrow('SQL syntax error');
    });

    it('应该处理连接获取失败', async () => {
      mockPool.getConnection.mockImplementation((callback) => {
        callback(new Error('Pool exhausted'), null);
      });

      await expect(executeQuery('SELECT 1')).rejects.toThrow('Pool exhausted');
    });
  });

  describe('事务处理测试', () => {
    beforeEach(async () => {
      await createConnectionPool({});
      mockPool.getConnection.mockImplementation((callback) => {
        callback(null, mockConnection);
      });
    });

    it('应该执行成功的事务', async () => {
      mockConnection.beginTransaction.mockImplementation((callback) => {
        callback(null);
      });
      mockConnection.commit.mockImplementation((callback) => {
        callback(null);
      });
      mockConnection.query.mockImplementation((sql, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const result = await executeTransaction(async (connection) => {
        await new Promise((resolve, reject) => {
          connection.query('INSERT INTO users SET ?', [{ name: 'John' }], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        return { success: true };
      });

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('应该回滚失败的事务', async () => {
      mockConnection.beginTransaction.mockImplementation((callback) => {
        callback(null);
      });
      mockConnection.rollback.mockImplementation((callback) => {
        callback(null);
      });
      mockConnection.query.mockImplementation((sql, callback) => {
        callback(new Error('Insert failed'), null);
      });

      await expect(executeTransaction(async (connection) => {
        await new Promise((resolve, reject) => {
          connection.query('INSERT INTO users SET ?', [{ name: 'John' }], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      })).rejects.toThrow('Insert failed');

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it('应该处理事务开始失败', async () => {
      mockConnection.beginTransaction.mockImplementation((callback) => {
        callback(new Error('Transaction failed'));
      });

      await expect(executeTransaction(async () => {
        return { success: true };
      })).rejects.toThrow('Transaction failed');
    });

    it('应该处理提交失败', async () => {
      mockConnection.beginTransaction.mockImplementation((callback) => {
        callback(null);
      });
      mockConnection.commit.mockImplementation((callback) => {
        callback(new Error('Commit failed'));
      });

      await expect(executeTransaction(async () => {
        return { success: true };
      })).rejects.toThrow('Commit failed');
    });
  });

  describe('连接池状态监控测试', () => {
    beforeEach(async () => {
      await createConnectionPool({});
    });

    it('应该获取连接池状态', () => {
      mockPool._allConnections = [mockConnection, mockConnection];
      mockPool._acquiringConnections = [mockConnection];
      mockPool._freeConnections = [mockConnection];

      const status = getPoolStatus();

      expect(status).toEqual({
        total: 2,
        acquiring: 1,
        free: 1,
        used: 0
      });
    });

    it('应该处理连接池未初始化', () => {
      // 重置连接池
      jest.clearAllMocks();
      
      const status = getPoolStatus();
      
      expect(status).toEqual({
        total: 0,
        acquiring: 0,
        free: 0,
        used: 0
      });
    });
  });

  describe('连接池关闭测试', () => {
    beforeEach(async () => {
      await createConnectionPool({});
    });

    it('应该关闭连接池', async () => {
      mockPool.end.mockImplementation((callback) => {
        callback(null);
      });

      await closeConnectionPool();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('应该处理关闭失败', async () => {
      mockPool.end.mockImplementation((callback) => {
        callback(new Error('Close failed'));
      });

      await expect(closeConnectionPool()).rejects.toThrow('Close failed');
    });
  });

  describe('性能测试', () => {
    beforeEach(async () => {
      await createConnectionPool({ connectionLimit: 5 });
    });

    it('应该处理并发连接请求', async () => {
      const connections = [];
      mockPool.getConnection.mockImplementation((callback) => {
        callback(null, { ...mockConnection, id: Math.random() });
      });

      // 创建多个并发连接请求
      const promises = Array(10).fill(0).map(() => getConnection());
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(mockPool.getConnection).toHaveBeenCalledTimes(10);
    });

    it('应该限制最大连接数', async () => {
      let connectionCount = 0;
      mockPool.getConnection.mockImplementation((callback) => {
        if (connectionCount >= 5) {
          callback(new Error('Pool exhausted'), null);
        } else {
          connectionCount++;
          callback(null, { ...mockConnection, id: connectionCount });
        }
      });

      // 尝试获取超过限制的连接数
      const promises = Array(7).fill(0).map(() => getConnection());
      const results = await Promise.allSettled(promises);

      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      expect(fulfilled).toHaveLength(5);
      expect(rejected).toHaveLength(2);
    });

    it('应该处理连接超时', async () => {
      jest.useFakeTimers();
      
      mockPool.getConnection.mockImplementation((callback) => {
        // 模拟连接获取延迟
        setTimeout(() => {
          callback(null, mockConnection);
        }, 10000);
      });

      const promise = getConnection();
      
      // 快进时间超过超时时间
      jest.advanceTimersByTime(15000);
      
      await expect(promise).rejects.toThrow();
      
      jest.useRealTimers();
    });
  });

  describe('错误恢复测试', () => {
    beforeEach(async () => {
      await createConnectionPool({});
    });

    it('应该自动重连断开的连接', async () => {
      let connectionAttempts = 0;
      mockPool.getConnection.mockImplementation((callback) => {
        connectionAttempts++;
        if (connectionAttempts === 1) {
          callback(new Error('Connection lost'), null);
        } else {
          callback(null, mockConnection);
        }
      });

      const connection = await getConnection();
      expect(connection).toBe(mockConnection);
      expect(connectionAttempts).toBe(2);
    });

    it('应该处理连接池完全失效', async () => {
      mockPool.getConnection.mockImplementation((callback) => {
        callback(new Error('Pool destroyed'), null);
      });

      await expect(getConnection()).rejects.toThrow('Pool destroyed');
    });
  });
});


'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建用户表
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          notEmpty: true,
        },
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 255],
          notEmpty: true,
        },
      },
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'operator', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建操作日志表
    await queryInterface.createTable('operation_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '操作类型，如: CREATE_USER, UPDATE_USER, DELETE_USER',
      },
      resourceType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '资源类型，如: USER, ROLE, PERMISSION',
      },
      resourceId: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '资源ID',
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: '操作详情，如修改前后的值',
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: '客户端IP地址',
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '客户端User-Agent',
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'success',
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '错误信息',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建索引
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['createdAt']);

    await queryInterface.addIndex('operation_logs', ['userId']);
    await queryInterface.addIndex('operation_logs', ['action']);
    await queryInterface.addIndex('operation_logs', ['resourceType']);
    await queryInterface.addIndex('operation_logs', ['status']);
    await queryInterface.addIndex('operation_logs', ['createdAt']);

    // 创建默认超级管理员用户
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123456', saltRounds);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'super_admin',
        status: 'active',
        permissions: [
          'agent:manage',
          'system:config',
          'user:manage',
          'data:export',
          'system:monitor',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('用户管理表创建完成，默认管理员账户: admin/admin123456');
  },

  async down(queryInterface, Sequelize) {
    // 删除索引
    await queryInterface.removeIndex('users', ['username']);
    await queryInterface.removeIndex('users', ['email']);
    await queryInterface.removeIndex('users', ['role']);
    await queryInterface.removeIndex('users', ['status']);
    await queryInterface.removeIndex('users', ['createdAt']);

    await queryInterface.removeIndex('operation_logs', ['userId']);
    await queryInterface.removeIndex('operation_logs', ['action']);
    await queryInterface.removeIndex('operation_logs', ['resourceType']);
    await queryInterface.removeIndex('operation_logs', ['status']);
    await queryInterface.removeIndex('operation_logs', ['createdAt']);

    // 删除表
    await queryInterface.dropTable('operation_logs');
    await queryInterface.dropTable('users');
  },
};

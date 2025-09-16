'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建用户表
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建角色权限表
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建用户角色关联表
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assigned_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      assigned_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建系统配置表
    await queryInterface.createTable('system_configs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      config_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      config_value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      config_type: {
        type: Sequelize.ENUM(
          'string',
          'number',
          'boolean',
          'json',
          'encrypted'
        ),
        allowNull: false,
        defaultValue: 'string',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_sensitive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建操作日志表
    await queryInterface.createTable('operation_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      resource_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      resource_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'success',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建模型配置表
    await queryInterface.createTable('model_configs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('llm', 'vision', 'speech', 'embedding'),
        allowNull: false,
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      api_endpoint: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      api_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      max_tokens: {
        type: Sequelize.INTEGER,
        defaultValue: 2000,
      },
      temperature: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.7,
      },
      status: {
        type: Sequelize.ENUM('online', 'offline', 'upgrading', 'error'),
        defaultValue: 'offline',
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建模型性能监控表
    await queryInterface.createTable('model_metrics', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      model_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'model_configs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      metric_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      metric_value: {
        type: Sequelize.DECIMAL(15, 6),
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    });

    // 创建模型使用统计表
    await queryInterface.createTable('model_usage_stats', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      model_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'model_configs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      request_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      token_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      error_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_cost: {
        type: Sequelize.DECIMAL(15, 6),
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 创建智能体使用统计表
    await queryInterface.createTable('agent_usage_stats', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      agent_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'agent_config',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      request_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      session_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 扩展现有的智能体配置表
    await queryInterface.addColumn('agent_config', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'maintenance', 'deprecated'),
      defaultValue: 'active',
    });

    await queryInterface.addColumn('agent_config', 'version', {
      type: Sequelize.STRING(20),
      defaultValue: '1.0.0',
    });

    await queryInterface.addColumn('agent_config', 'created_by', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    });

    await queryInterface.addColumn('agent_config', 'tags', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('agent_config', 'config', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('agent_config', 'performance_metrics', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('agent_config', 'last_used', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('agent_config', 'usage_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    // 创建索引
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['role', 'status']);
    await queryInterface.addIndex('operation_logs', ['user_id', 'created_at']);
    await queryInterface.addIndex('operation_logs', [
      'action',
      'resource_type',
    ]);
    await queryInterface.addIndex('model_metrics', [
      'model_id',
      'metric_type',
      'timestamp',
    ]);
    await queryInterface.addIndex('model_usage_stats', ['model_id', 'date']);
    await queryInterface.addIndex('agent_usage_stats', ['agent_id', 'date']);
    await queryInterface.addIndex('agent_usage_stats', ['user_id', 'date']);

    // 创建复合索引
    await queryInterface.addIndex('operation_logs', ['created_at', 'status']);
    await queryInterface.addIndex('model_metrics', [
      'timestamp',
      'metric_type',
    ]);
    await queryInterface.addIndex('system_configs', ['config_key', 'version']);

    // 创建默认角色
    const roles = [
      {
        name: 'super_admin',
        description: '超级管理员',
        permissions: [
          'agent:manage',
          'system:config',
          'user:manage',
          'data:export',
          'system:monitor',
        ],
      },
      {
        name: 'admin',
        description: '管理员',
        permissions: ['agent:manage', 'system:monitor', 'data:export'],
      },
      {
        name: 'operator',
        description: '操作员',
        permissions: ['agent:manage', 'system:monitor'],
      },
      {
        name: 'viewer',
        description: '查看者',
        permissions: ['system:monitor'],
      },
    ];

    for (const role of roles) {
      await queryInterface.bulkInsert('roles', [
        {
          name: role.name,
          description: role.description,
          permissions: JSON.stringify(role.permissions),
          created_at: new Date(),
        },
      ]);
    }

    // 创建默认超级管理员用户
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password_hash: '$2b$10$YourHashedPasswordHere', // 需要替换为实际的哈希值
        role: 'super_admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 为超级管理员分配角色
    const [adminUser] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      {
        replacements: ['admin'],
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    const [superAdminRole] = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE name = ? LIMIT 1',
      {
        replacements: ['super_admin'],
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    if (adminUser && superAdminRole) {
      await queryInterface.bulkInsert('user_roles', [
        {
          user_id: adminUser.id,
          role_id: superAdminRole.id,
          assigned_by: adminUser.id,
          assigned_at: new Date(),
        },
      ]);
    }

    // 创建默认系统配置
    const defaultConfigs = [
      {
        config_key: 'system.name',
        config_value: 'NeuroGlass AI Chat Interface',
        config_type: 'string',
        description: '系统名称',
      },
      {
        config_key: 'system.description',
        config_value: '智能对话平台',
        config_type: 'string',
        description: '系统描述',
      },
      {
        config_key: 'system.logo_url',
        config_value: '/logo.png',
        config_type: 'string',
        description: '系统Logo URL',
      },
      {
        config_key: 'system.enable_registration',
        config_value: 'false',
        config_type: 'boolean',
        description: '是否允许用户注册',
      },
      {
        config_key: 'system.session_timeout',
        config_value: '3600',
        config_type: 'number',
        description: '会话超时时间（秒）',
      },
      {
        config_key: 'system.max_upload_size',
        config_value: '10485760',
        config_type: 'number',
        description: '最大上传文件大小（字节）',
      },
    ];

    for (const config of defaultConfigs) {
      await queryInterface.bulkInsert('system_configs', [
        {
          config_key: config.config_key,
          config_value: config.config_value,
          config_type: config.config_type,
          description: config.description,
          version: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    // 删除表（按依赖关系反向删除）
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('agent_usage_stats');
    await queryInterface.dropTable('model_usage_stats');
    await queryInterface.dropTable('model_metrics');
    await queryInterface.dropTable('operation_logs');
    await queryInterface.dropTable('system_configs');
    await queryInterface.dropTable('model_configs');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('users');

    // 删除agent_config表的新增字段
    await queryInterface.removeColumn('agent_config', 'status');
    await queryInterface.removeColumn('agent_config', 'version');
    await queryInterface.removeColumn('agent_config', 'created_by');
    await queryInterface.removeColumn('agent_config', 'tags');
    await queryInterface.removeColumn('agent_config', 'config');
    await queryInterface.removeColumn('agent_config', 'performance_metrics');
    await queryInterface.removeColumn('agent_config', 'last_used');
    await queryInterface.removeColumn('agent_config', 'usage_count');
  },
};

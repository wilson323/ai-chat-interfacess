'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 创建用户地理位置表
    await queryInterface.createTable('user_geo', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '关联用户ID，匿名用户为null',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      sessionId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: '会话ID，用于匿名用户追踪',
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: 'IP地址，支持IPv4和IPv6',
        validate: {
          isIP: true,
        },
      },
      location: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: '地理位置信息（国家、城市、经纬度等）',
      },
      lastSeen: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: '最后活跃时间',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 创建用户地理位置表的索引
    await queryInterface.addIndex('user_geo', ['userId', 'ipAddress'], {
      unique: true,
      name: 'user_ip_unique',
    });

    await queryInterface.addIndex('user_geo', ['sessionId'], {
      name: 'session_index',
    });

    await queryInterface.addIndex('user_geo', ['lastSeen'], {
      name: 'last_seen_index',
    });

    // 创建智能体使用统计表
    await queryInterface.createTable('agent_usage', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      sessionId: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: '关联ChatSession的sessionId',
        references: {
          model: 'chat_sessions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '关联用户ID，匿名用户为null',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      agentId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '关联AgentConfig的id',
        references: {
          model: 'agent_config',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      messageType: {
        type: Sequelize.ENUM('text', 'image', 'file', 'voice', 'mixed'),
        allowNull: false,
        comment: '消息类型',
      },
      messageCount: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
        comment: '消息数量',
      },
      tokenUsage: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Token使用量',
      },
      responseTime: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '响应时间（毫秒）',
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '会话开始时间',
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '会话结束时间',
      },
      duration: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '会话持续时间（秒）',
      },
      isCompleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否完成',
      },
      userSatisfaction: {
        type: Sequelize.ENUM('positive', 'negative', 'neutral'),
        allowNull: true,
        comment: '用户满意度',
      },
      geoLocationId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '关联的地理位置ID',
        references: {
          model: 'user_geo',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      deviceInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: '设备信息',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 创建智能体使用统计表的索引
    await queryInterface.addIndex('agent_usage', ['sessionId'], {
      name: 'session_usage_index',
    });

    await queryInterface.addIndex('agent_usage', ['userId'], {
      name: 'user_usage_index',
    });

    await queryInterface.addIndex('agent_usage', ['agentId'], {
      name: 'agent_usage_index',
    });

    await queryInterface.addIndex('agent_usage', ['messageType'], {
      name: 'message_type_index',
    });

    await queryInterface.addIndex('agent_usage', ['geoLocationId'], {
      name: 'geo_usage_index',
    });

    await queryInterface.addIndex('agent_usage', ['startTime'], {
      name: 'start_time_index',
    });

    await queryInterface.addIndex('agent_usage', ['createdAt'], {
      name: 'created_at_index',
    });

    await queryInterface.addIndex('agent_usage', ['isCompleted'], {
      name: 'completed_index',
    });

    await queryInterface.addIndex('agent_usage', ['userSatisfaction'], {
      name: 'satisfaction_index',
    });

    // 创建复合索引以优化查询性能
    await queryInterface.addIndex(
      'agent_usage',
      ['userId', 'agentId', 'startTime'],
      {
        name: 'user_agent_time_index',
      }
    );

    await queryInterface.addIndex(
      'agent_usage',
      ['geoLocationId', 'startTime'],
      {
        name: 'geo_time_index',
      }
    );

    await queryInterface.addIndex('agent_usage', ['messageType', 'startTime'], {
      name: 'message_type_time_index',
    });

    // 创建触发器函数和触发器来自动更新duration字段
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_session_duration()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
          NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER agent_usage_before_insert_or_update
      BEFORE INSERT OR UPDATE ON agent_usage
      FOR EACH ROW
      EXECUTE FUNCTION update_session_duration();
    `);

    // 创建数据清理函数
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_geo_data()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM user_geo
        WHERE last_seen < NOW() - INTERVAL '90 days';
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_usage_data()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM agent_usage
        WHERE created_at < NOW() - INTERVAL '365 days';
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 创建视图：用户活跃度统计
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW user_activity_stats AS
      SELECT
        u.id as user_id,
        u.username,
        u.email,
        COUNT(DISTINCT au.session_id) as total_sessions,
        COUNT(DISTINCT au.agent_id) as agents_used,
        SUM(au.message_count) as total_messages,
        AVG(au.duration) as avg_session_duration,
        MAX(au.start_time) as last_activity,
        COUNT(CASE WHEN au.user_satisfaction = 'positive' THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN au.user_satisfaction = 'negative' THEN 1 END) as negative_feedback
      FROM users u
      LEFT JOIN agent_usage au ON u.id = au.user_id
      GROUP BY u.id, u.username, u.email;
    `);

    // 创建视图：智能体使用统计
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW agent_usage_stats AS
      SELECT
        ac.id as agent_id,
        ac.name as agent_name,
        ac.type as agent_type,
        COUNT(DISTINCT au.session_id) as total_sessions,
        COUNT(DISTINCT au.user_id) as unique_users,
        SUM(au.message_count) as total_messages,
        SUM(au.token_usage) as total_tokens,
        AVG(au.response_time) as avg_response_time,
        AVG(au.duration) as avg_session_duration,
        MAX(au.start_time) as last_used,
        COUNT(CASE WHEN au.user_satisfaction = 'positive' THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN au.user_satisfaction = 'negative' THEN 1 END) as negative_feedback
      FROM agent_config ac
      LEFT JOIN agent_usage au ON ac.id = au.agent_id
      GROUP BY ac.id, ac.name, ac.type;
    `);

    // 创建视图：地理位置活跃度统计
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW geo_activity_stats AS
      SELECT
        ug.id as geo_id,
        ug.location->>'country' as country,
        ug.location->>'region' as region,
        ug.location->>'city' as city,
        COUNT(DISTINCT au.session_id) as total_sessions,
        COUNT(DISTINCT au.user_id) as unique_users,
        SUM(au.message_count) as total_messages,
        MAX(au.start_time) as last_activity,
        COUNT(DISTINCT ug.user_id) as total_users_in_location
      FROM user_geo ug
      LEFT JOIN agent_usage au ON ug.id = au.geo_location_id
      GROUP BY ug.id, country, region, city;
    `);
  },

  async down(queryInterface, Sequelize) {
    // 删除视图
    await queryInterface.sequelize.query(
      `DROP VIEW IF EXISTS geo_activity_stats`
    );
    await queryInterface.sequelize.query(
      `DROP VIEW IF EXISTS agent_usage_stats`
    );
    await queryInterface.sequelize.query(
      `DROP VIEW IF EXISTS user_activity_stats`
    );

    // 删除触发器和函数
    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS agent_usage_before_insert_or_update ON agent_usage`
    );
    await queryInterface.sequelize.query(
      `DROP FUNCTION IF EXISTS update_session_duration`
    );
    await queryInterface.sequelize.query(
      `DROP FUNCTION IF EXISTS cleanup_old_usage_data`
    );
    await queryInterface.sequelize.query(
      `DROP FUNCTION IF EXISTS cleanup_old_geo_data`
    );

    // 删除表
    await queryInterface.dropTable('agent_usage');
    await queryInterface.dropTable('user_geo');
  },
};

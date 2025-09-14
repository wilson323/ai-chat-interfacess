import { DataTypes, Model, Optional } from 'sequelize';
import sequelize, { Op } from '../sequelize';
import { AgentUsageAttributes, AgentUsageCreationAttributes, DeviceInfo } from '@/types/heatmap';

export class AgentUsage
  extends Model<AgentUsageAttributes, AgentUsageCreationAttributes>
  implements AgentUsageAttributes
{
  public id!: number;
  public sessionId!: string;
  public userId?: number;
  public agentId!: number;
  public messageType!: 'text' | 'image' | 'file' | 'voice' | 'mixed';
  public messageCount!: number;
  public tokenUsage?: number;
  public responseTime?: number;
  public startTime!: Date;
  public endTime?: Date;
  public duration?: number;
  public isCompleted!: boolean;
  public userSatisfaction?: 'positive' | 'negative' | 'neutral';
  public geoLocationId?: number;
  public deviceInfo?: DeviceInfo;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AgentUsage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '关联ChatSession的sessionId',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: '关联用户ID，匿名用户为null',
    },
    agentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'agent_config',
        key: 'id',
      },
      comment: '关联AgentConfig的id',
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'file', 'voice', 'mixed'),
      allowNull: false,
      comment: '消息类型',
    },
    messageCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '消息数量',
    },
    tokenUsage: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Token使用量',
    },
    responseTime: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '响应时间（毫秒）',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '会话开始时间',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '会话结束时间',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '会话持续时间（秒）',
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否完成',
    },
    userSatisfaction: {
      type: DataTypes.ENUM('positive', 'negative', 'neutral'),
      allowNull: true,
      comment: '用户满意度',
    },
    geoLocationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'user_geo',
        key: 'id',
      },
      comment: '关联的地理位置ID',
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: '设备信息',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AgentUsage',
    tableName: 'agent_usage',
    timestamps: true,
    indexes: [
      // 会话ID索引
      {
        fields: ['sessionId'],
        name: 'session_usage_index',
      },
      // 用户ID索引
      {
        fields: ['userId'],
        name: 'user_usage_index',
      },
      // 智能体ID索引
      {
        fields: ['agentId'],
        name: 'agent_usage_index',
      },
      // 消息类型索引
      {
        fields: ['messageType'],
        name: 'message_type_index',
      },
      // 地理位置索引
      {
        fields: ['geoLocationId'],
        name: 'geo_usage_index',
      },
      // 时间索引
      {
        fields: ['startTime'],
        name: 'start_time_index',
      },
      {
        fields: ['createdAt'],
        name: 'created_at_index',
      },
      // 完成状态索引
      {
        fields: ['isCompleted'],
        name: 'completed_index',
      },
      // 用户满意度索引
      {
        fields: ['userSatisfaction'],
        name: 'satisfaction_index',
      },
      // 复合索引：用户+智能体+时间
      {
        fields: ['userId', 'agentId', 'startTime'],
        name: 'user_agent_time_index',
      },
      // 复合索引：地理位置+时间
      {
        fields: ['geoLocationId', 'startTime'],
        name: 'geo_time_index',
      },
      // 复合索引：消息类型+时间
      {
        fields: ['messageType', 'startTime'],
        name: 'message_type_time_index',
      },
    ],
    hooks: {
      beforeCreate: async (agentUsage: AgentUsage) => {
        // 自动计算持续时间
        if (agentUsage.endTime && agentUsage.startTime) {
          agentUsage.duration = Math.floor(
            (agentUsage.endTime.getTime() - agentUsage.startTime.getTime()) / 1000
          );
        }
      },
      beforeUpdate: async (agentUsage: AgentUsage) => {
        // 如果结束时间有变化，重新计算持续时间
        if (agentUsage.changed('endTime') && agentUsage.endTime && agentUsage.startTime) {
          agentUsage.duration = Math.floor(
            (agentUsage.endTime.getTime() - agentUsage.startTime.getTime()) / 1000
          );
        }
      },
    },
  }
);

// 实例方法
AgentUsage.prototype.toJSON = function(): object {
  const values = Object.assign({}, this.get());
  // 隐藏敏感信息
  if (values.deviceInfo) {
    delete values.deviceInfo.userAgent;
  }
  return values;
};

// 静态方法
AgentUsage.startSession = async function(
  sessionId: string,
  userId: number | undefined,
  agentId: number,
  messageType: 'text' | 'image' | 'file' | 'voice' | 'mixed',
  geoLocationId?: number,
  deviceInfo?: DeviceInfo
): Promise<AgentUsage> {
  return await AgentUsage.create({
    sessionId,
    userId,
    agentId,
    messageType,
    messageCount: 0,
    startTime: new Date(),
    isCompleted: false,
    geoLocationId,
    deviceInfo,
  });
};

AgentUsage.endSession = async function(
  sessionId: string,
  tokenUsage?: number,
  userSatisfaction?: 'positive' | 'negative' | 'neutral'
): Promise<AgentUsage | null> {
  const session = await AgentUsage.findOne({
    where: {
      sessionId,
      isCompleted: false,
    },
    order: [['startTime', 'DESC']],
  });

  if (session) {
    const endTime = new Date();
    await session.update({
      endTime,
      isCompleted: true,
      tokenUsage,
      userSatisfaction,
    });
  }

  return session;
};

AgentUsage.updateMessageCount = async function(
  sessionId: string,
  increment: number = 1
): Promise<void> {
  await AgentUsage.increment('messageCount', {
    where: {
      sessionId,
      isCompleted: false,
    },
  });
};

AgentUsage.updateResponseTime = async function(
  sessionId: string,
  responseTime: number
): Promise<void> {
  await AgentUsage.update(
    { responseTime },
    {
      where: {
        sessionId,
        isCompleted: false,
      },
    }
  );
};

AgentUsage.getUsageStatistics = async function(
  params: {
    startDate?: Date;
    endDate?: Date;
    agentId?: number;
    userId?: number;
    messageType?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  } = {}
): Promise<any[]> {
  const {
    startDate,
    endDate,
    agentId,
    userId,
    messageType,
    groupBy = 'day',
  } = params;

  const where: any = {};
  if (startDate) where.startTime = { [sequelize.Op.gte]: startDate };
  if (endDate) where.startTime = { ...where.startTime, [sequelize.Op.lte]: endDate };
  if (agentId) where.agentId = agentId;
  if (userId) where.userId = userId;
  if (messageType) where.messageType = messageType;

  let dateFormat: string;
  switch (groupBy) {
    case 'hour':
      dateFormat = 'YYYY-MM-DD HH24:00:00';
      break;
    case 'week':
      dateFormat = 'YYYY-"W"WW';
      break;
    case 'month':
      dateFormat = 'YYYY-MM';
      break;
    default:
      dateFormat = 'YYYY-MM-DD';
  }

  return await AgentUsage.findAll({
    where,
    attributes: [
      [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('startTime')), 'time_period'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'session_count'],
      [sequelize.fn('SUM', sequelize.col('messageCount')), 'total_messages'],
      [sequelize.fn('AVG', sequelize.col('duration')), 'avg_duration'],
      [sequelize.fn('AVG', sequelize.col('responseTime')), 'avg_response_time'],
      [sequelize.fn('SUM', sequelize.col('tokenUsage')), 'total_tokens'],
    ],
    group: [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('startTime'))],
    order: [[sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('startTime')), 'ASC']],
    raw: true,
  });
};

AgentUsage.getTopAgents = async function(
  limit: number = 10,
  timeRange?: { start: Date; end: Date }
): Promise<Array<{ agentId: number; usageCount: number }>> {
  const where: any = {};
  if (timeRange) {
    where.startTime = {
      [sequelize.Op.between]: [timeRange.start, timeRange.end],
    };
  }

  return await AgentUsage.findAll({
    where,
    attributes: [
      'agentId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'usageCount'],
    ],
    group: ['agentId'],
    order: [[sequelize.literal('usageCount'), 'DESC']],
    limit,
    raw: true,
  });
};

AgentUsage.getCleanupCandidates = async function(daysToKeep: number = 365): Promise<AgentUsage[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  return await AgentUsage.findAll({
    where: {
      createdAt: {
        [sequelize.Op.lt]: cutoffDate,
      },
    },
    order: [['createdAt', 'ASC']],
    limit: 1000,
  });
};

AgentUsage.cleanupOldData = async function(daysToKeep: number = 365): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await AgentUsage.destroy({
    where: {
      createdAt: {
        [sequelize.Op.lt]: cutoffDate,
      },
    },
  });

  return result;
};

export default AgentUsage;
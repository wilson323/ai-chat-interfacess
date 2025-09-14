import ChatSession from './ChatSession';
import ChatMessage from './ChatMessage';
import User from './user';
import OperationLog from './operation-log';
import AgentConfig from './agent-config';
import UserGeo from './user-geo';
import AgentUsage from './agent-usage';

// 关联：一个会话有多个消息
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });

// 用户和操作日志的关联
User.hasMany(OperationLog, { foreignKey: 'userId', as: 'operationLogs' });
OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 用户自引用关联：创建者
User.hasMany(User, { foreignKey: 'createdBy', as: 'createdUsers' });
User.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// 用户地理位置关联
User.hasMany(UserGeo, { foreignKey: 'userId', as: 'geoLocations' });
UserGeo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 用户智能体使用统计关联
User.hasMany(AgentUsage, { foreignKey: 'userId', as: 'agentUsages' });
AgentUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 智能体配置关联使用统计
AgentConfig.hasMany(AgentUsage, { foreignKey: 'agentId', as: 'usages' });
AgentUsage.belongsTo(AgentConfig, { foreignKey: 'agentId', as: 'agent' });

// 用户地理位置关联使用统计
UserGeo.hasMany(AgentUsage, { foreignKey: 'geoLocationId', as: 'usages' });
AgentUsage.belongsTo(UserGeo, { foreignKey: 'geoLocationId', as: 'geoLocation' });

// 聊天会话关联使用统计
ChatSession.hasMany(AgentUsage, { foreignKey: 'sessionId', as: 'agentUsages' });
AgentUsage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });

export {
  ChatSession,
  ChatMessage,
  User,
  OperationLog,
  AgentConfig,
  UserGeo,
  AgentUsage,
  // 导出枚举类型
  UserRole,
  UserStatus,
  OperationStatus,
};

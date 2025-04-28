import ChatSession from './ChatSession';
import ChatMessage from './ChatMessage';

// 关联：一个会话有多个消息
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });

export { ChatSession, ChatMessage }; 
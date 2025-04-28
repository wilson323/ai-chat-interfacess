import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

export interface ChatMessageAttributes {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: object;
}

export interface ChatMessageCreationAttributes extends Optional<ChatMessageAttributes, 'id'> {}

export class ChatMessage extends Model<ChatMessageAttributes, ChatMessageCreationAttributes> implements ChatMessageAttributes {
  public id!: string;
  public sessionId!: string;
  public userId!: string;
  public role!: 'user' | 'assistant' | 'system';
  public content!: string;
  public timestamp!: Date;
  public metadata?: object;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    indexes: [
      { fields: ['sessionId'] },
      { fields: ['userId'] },
      { fields: ['timestamp'] },
    ],
  }
);

export default ChatMessage; 
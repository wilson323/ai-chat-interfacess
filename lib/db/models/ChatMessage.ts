import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

export interface ChatMessageAttributes {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
  parentId?: string | null;
  meta?: Record<string, unknown>;
}

export type ChatMessageCreationAttributes = Optional<
  ChatMessageAttributes,
  'id'
>;

export class ChatMessage
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
  implements ChatMessageAttributes
{
  public id!: string;
  public sessionId!: string;
  public userId!: string;
  public role!: 'user' | 'assistant' | 'system';
  public content!: string;
  public timestamp!: Date;
  public metadata?: Record<string, unknown>;
  public parentId?: string | null;
  public meta?: Record<string, unknown>;
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
      defaultValue: null,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    indexes: [
      { fields: ['sessionId'] },
      { fields: ['userId'] },
      { fields: ['timestamp'] },
      { fields: ['parentId'] },
    ],
  }
);

export default ChatMessage;

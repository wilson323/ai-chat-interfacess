import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

export interface ChatSessionAttributes {
  id: string;
  userId: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastMessagePreview?: string;
  isArchived?: boolean;
}

export interface ChatSessionCreationAttributes
  extends Optional<ChatSessionAttributes, 'id'> {}

export class ChatSession
  extends Model<ChatSessionAttributes, ChatSessionCreationAttributes>
  implements ChatSessionAttributes
{
  public id!: string;
  public userId!: string;
  public title!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public lastMessagePreview!: string;
  public isArchived!: boolean;
}

ChatSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    lastMessagePreview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'chat_sessions',
    indexes: [{ fields: ['userId'] }, { fields: ['updatedAt'] }],
  }
);

export default ChatSession;

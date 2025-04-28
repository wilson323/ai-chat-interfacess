import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

export interface ChatHistoryAttributes {
  id: number;
  chatId: string;
  userId: string;
  agentId: number;
  messages: object;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatHistoryCreationAttributes extends Optional<ChatHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ChatHistory extends Model<ChatHistoryAttributes, ChatHistoryCreationAttributes> implements ChatHistoryAttributes {
  public id!: number;
  public chatId!: string;
  public userId!: string;
  public agentId!: number;
  public messages!: object;
  public createdAt?: Date;
  public updatedAt?: Date;
}

ChatHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    messages: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'chat_history',
    timestamps: true,
  }
);

export default ChatHistory; 
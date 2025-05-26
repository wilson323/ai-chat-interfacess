import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';
import { encrypt, decrypt } from '@/lib/security'

export interface AgentConfigAttributes {
  id: number;
  name: string;
  /**
   * 智能体类型：fastgpt | cad-analyzer | image-editor | ...
   * fastgpt 类型数据源为 FastGPT API，自研类型数据本地存储
   */
  type: string;
  apiKey: string;
  appId: string;
  /**
   * API端点URL，默认为https://zktecoaihub.com/api/v1/chat/completions
   * 可以为每个智能体单独配置不同的API端点
   */
  apiUrl?: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  multimodalModel?: string;
  isPublished: boolean;
  updatedAt?: Date;
  description?: string;
  order: number;
  supportsStream: boolean;
  supportsDetail: boolean;
  globalVariables?: string; // JSON字符串存储全局变量
  welcomeText?: string; // 欢迎语
}

export interface AgentConfigCreationAttributes extends Optional<AgentConfigAttributes, 'id' | 'multimodalModel' | 'updatedAt'> {}

export class AgentConfig extends Model<AgentConfigAttributes, AgentConfigCreationAttributes> implements AgentConfigAttributes {
  public id!: number;
  public name!: string;
  public type!: string;
  public apiKey!: string;
  public appId!: string;
  public apiUrl?: string;
  public systemPrompt!: string;
  public temperature!: number;
  public maxTokens!: number;
  public multimodalModel?: string;
  public isPublished!: boolean;
  public updatedAt?: Date;
  public description?: string;
  public order!: number;
  public supportsStream!: boolean;
  public supportsDetail!: boolean;
  public globalVariables?: string;
  public welcomeText?: string;
}

AgentConfig.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * 智能体类型 fastgpt/cad-analyzer/image-editor/...
     */
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'https://zktecoaihub.com/api/v1/chat/completions',
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.7,
    },
    maxTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2000,
    },
    multimodalModel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    supportsStream: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    supportsDetail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    globalVariables: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    welcomeText: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'agent_config',
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: false
  }
);

export default AgentConfig;
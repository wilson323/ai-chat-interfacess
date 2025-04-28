import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

/**
 * CAD 智能体历史记录表
 * 存储自研智能体（如 CAD 分析器）业务数据，所有数据本地可控
 * agentId: 智能体ID
 * userId: 用户ID
 * fileName: CAD 文件名
 * fileUrl: CAD 文件存储路径
 * analysisResult: 分析结果（JSON 或文本）
 * createdAt: 创建时间
 */
export interface CadHistoryAttributes {
  id: number;
  agentId: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  analysisResult: string;
  createdAt?: Date;
}

export interface CadHistoryCreationAttributes extends Optional<CadHistoryAttributes, 'id' | 'createdAt'> {}

export class CadHistory extends Model<CadHistoryAttributes, CadHistoryCreationAttributes> implements CadHistoryAttributes {
  public id!: number;
  public agentId!: number;
  public userId!: number;
  public fileName!: string;
  public fileUrl!: string;
  public analysisResult!: string;
  public createdAt?: Date;
}

CadHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    analysisResult: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'cad_history',
    timestamps: false,
  }
);

export default CadHistory; 
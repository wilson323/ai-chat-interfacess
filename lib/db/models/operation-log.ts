import { DataTypes, Model, Optional } from 'sequelize';
// Record is a built-in TypeScript utility type
import sequelize from '../sequelize';

// 操作日志属性接口
interface OperationLogAttributes {
  id: number;
  userId?: number;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: OperationStatus;
  errorMessage?: string;
  createdAt: Date;
}

// 创建操作日志时的可选属性
type OperationLogCreationAttributes = Optional<
  OperationLogAttributes,
  'id' | 'createdAt'
>;

// 操作状态枚举
export enum OperationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

// 操作日志模型类
class OperationLog
  extends Model<OperationLogAttributes, OperationLogCreationAttributes>
  implements OperationLogAttributes
{
  public id!: number;
  public userId?: number;
  public action!: string;
  public resourceType?: string;
  public resourceId?: string;
  public details?: Record<string, unknown>;
  public ipAddress?: string;
  public userAgent?: string;
  public status!: OperationStatus;
  public errorMessage?: string;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作类型，如: CREATE_USER, UPDATE_USER, DELETE_USER',
    },
    resourceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '资源类型，如: USER, ROLE, PERMISSION',
    },
    resourceId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '资源ID',
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: '操作详情，如修改前后的值',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: '客户端IP地址',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '客户端User-Agent',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OperationStatus)),
      allowNull: false,
      defaultValue: OperationStatus.SUCCESS,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: false,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['resourceType'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default OperationLog;
export type { OperationLogAttributes, OperationLogCreationAttributes };

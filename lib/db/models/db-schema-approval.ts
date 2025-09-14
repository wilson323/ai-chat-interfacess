import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

export interface DbSchemaApprovalAttributes {
  id: number;
  action: string; // sync/rollback
  sql: string;
  status: 'pending' | 'approved' | 'rejected';
  requester: string;
  approver: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSchemaApprovalCreationAttributes
  extends Optional<
    DbSchemaApprovalAttributes,
    'id' | 'approver' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class DbSchemaApproval
  extends Model<DbSchemaApprovalAttributes, DbSchemaApprovalCreationAttributes>
  implements DbSchemaApprovalAttributes
{
  public id!: number;
  public action!: string;
  public sql!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public requester!: string;
  public approver!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

DbSchemaApproval.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    action: { type: DataTypes.STRING, allowNull: false },
    sql: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    requester: { type: DataTypes.STRING, allowNull: false },
    approver: { type: DataTypes.STRING, allowNull: true },
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
    tableName: 'db_schema_approvals',
    timestamps: false,
  }
);

export default DbSchemaApproval;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize';

// 用户属性接口
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  avatar?: string;
  phone?: string;
  department?: string;
  permissions: string[];
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户时的可选属性
type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

// 用户角色枚举
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// 用户模型类
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public lastLogin?: Date;
  public avatar?: string;
  public phone?: string;
  public department?: string;
  public permissions!: string[];
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 实例方法
  public toJSON(): Record<string, unknown> {
    const values = Object.assign({}, this.get()) as unknown as Record<string, unknown>;
    // 不返回密码
    if ('password' in values) {
      delete values.password;
    }
    return values;
  }

  // 检查用户是否有特定权限
  public hasPermission(permission: string): boolean {
    return (
      this.permissions.includes(permission) ||
      this.role === UserRole.SUPER_ADMIN
    );
  }

  // 检查用户是否为管理员
  public isAdmin(): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(this.role);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.VIEWER,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
    hooks: {
      beforeCreate: async () => {
        // 在实际应用中，这里应该对密码进行加密
        // user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user: User) => {
        // 如果密码被修改，则重新加密
        if (user.changed('password')) {
          // user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default User;
export type { UserAttributes, UserCreationAttributes };

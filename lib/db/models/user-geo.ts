import { DataTypes, Model } from 'sequelize';
import sequelize, { Op } from '../sequelize';
import {
  UserGeoAttributes,
  UserGeoCreationAttributes,
  GeoLocationInfo,
} from '@/types/heatmap';

export class UserGeo
  extends Model<UserGeoAttributes, UserGeoCreationAttributes>
  implements UserGeoAttributes
{
  // 静态方法声明
  static upsertUserGeo: (
    userId: number | undefined,
    sessionId: string | undefined,
    ipAddress: string,
    location: GeoLocationInfo
  ) => Promise<UserGeo>;

  static getUserLocations: (
    userId: number,
    limit?: number
  ) => Promise<UserGeo[]>;

  static getActiveUsersByLocation: (
    timeRange: Date
  ) => Promise<Array<{ location: string; count: number }>>;

  static cleanupOldData: (
    daysToKeep: number
  ) => Promise<number>;
  public id!: number;
  public userId?: number;
  public sessionId?: string;
  public ipAddress!: string;
  public location!: GeoLocationInfo;
  public lastSeen!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserGeo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: '关联用户ID，匿名用户为null',
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '会话ID，用于匿名用户追踪',
    },
    ipAddress: {
      type: DataTypes.STRING(45), // 支持IPv6
      allowNull: false,
      validate: {
        isIP: true,
      },
      comment: 'IP地址，支持IPv4和IPv6',
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: '地理位置信息（国家、城市、经纬度等）',
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '最后活跃时间',
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
    modelName: 'UserGeo',
    tableName: 'user_geo',
    timestamps: true,
    indexes: [
      // 复合索引：用户ID和IP地址
      {
        unique: true,
        fields: ['userId', 'ipAddress'],
        name: 'user_ip_unique',
      },
      // 会话ID索引
      {
        fields: ['sessionId'],
        name: 'session_index',
      },
      // 地理位置查询索引（支持GEO查询）
      {
        fields: [
          sequelize.literal('(location->>"country")'),
          sequelize.literal('(location->>"region")'),
          sequelize.literal('(location->>"city")'),
        ],
        name: 'geo_location_index',
      },
      // 时间索引
      {
        fields: ['lastSeen'],
        name: 'last_seen_index',
      },
      // 经纬度索引（用于地图查询）
      {
        fields: [
          sequelize.literal('(location->>"latitude")'),
          sequelize.literal('(location->>"longitude")'),
        ],
        name: 'coordinates_index',
      },
    ],
    hooks: {
      beforeCreate: async (userGeo: UserGeo) => {
        // 自动更新最后活跃时间
        userGeo.lastSeen = new Date();
      },
      beforeUpdate: async (userGeo: UserGeo) => {
        // 如果位置信息有变化，更新最后活跃时间
        if (userGeo.changed('location') || userGeo.changed('ipAddress')) {
          userGeo.lastSeen = new Date();
        }
      },
    },
  }
);

// 实例方法
UserGeo.prototype.toJSON = function (): object {
  const values = Object.assign({}, this.get());
  // 隐藏敏感信息
  if ('ipAddress' in values) {
    const { ipAddress, ...rest } = values as any;
    return rest;
  }
  return values;
};

// 静态方法
(UserGeo as any).upsertUserGeo = async function (
  userId: number | undefined,
  sessionId: string | undefined,
  ipAddress: string,
  location: GeoLocationInfo
): Promise<UserGeo> {
  const [userGeo, created] = await UserGeo.findOrCreate({
    where: {
      userId,
      ipAddress,
    },
    defaults: {
      userId,
      sessionId,
      ipAddress,
      location,
      lastSeen: new Date(),
    },
  });

  if (!created) {
    // 更新位置信息和最后活跃时间
    await userGeo.update({
      location,
      lastSeen: new Date(),
    });
  }

  return userGeo;
};

(UserGeo as any).getUserLocations = async function (
  userId?: number,
  limit: number = 100
): Promise<UserGeo[]> {
  const where: any = {};
  if (userId) {
    where.userId = userId;
  }

  return await UserGeo.findAll({
    where,
    order: [['lastSeen', 'DESC']],
    limit,
  });
};

(UserGeo as any).getActiveUsersByLocation = async function (
  timeRange: Date,
  groupBy: 'country' | 'region' | 'city' = 'country'
): Promise<Array<{ location: string; count: number }>> {
  const where: any = {
    lastSeen: {
      [Op.gte]: timeRange,
    },
  };

  const groupColumn =
    groupBy === 'country'
      ? sequelize.literal('(location->>"country")')
      : groupBy === 'region'
        ? sequelize.literal('(location->>"region")')
        : sequelize.literal('(location->>"city")');

  const results = await UserGeo.findAll({
    where,
    attributes: [
      [groupColumn, 'location'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: [groupColumn as any],
    order: [[sequelize.literal('count'), 'DESC']],
    raw: true,
  });

  return results.map((result: any) => ({
    location: result.location || 'Unknown',
    count: parseInt(result.count) || 0,
  }));
};

(UserGeo as any).cleanupOldData = async function (
  daysToKeep: number = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await UserGeo.destroy({
    where: {
      lastSeen: {
        [Op.lt]: cutoffDate,
      },
    },
  });

  return result;
};

export default UserGeo;

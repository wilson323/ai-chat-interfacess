import { DataTypes, Model, Optional } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '../sequelize';

export interface UserGeoAttributes {
  id: number;
  ipAddress: string;
  country: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  usageCount: number;
  lastSeenAt: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export type UserGeoCreationAttributes = Optional<
  UserGeoAttributes,
  'id' | 'usageCount' | 'lastSeenAt'
>;

export class UserGeo
  extends Model<UserGeoAttributes, UserGeoCreationAttributes>
  implements UserGeoAttributes
{
  public id!: number;
  public ipAddress!: string;
  public country!: string;
  public region?: string;
  public city?: string;
  public latitude?: number;
  public longitude?: number;
  public timezone?: string;
  public isp?: string;
  public usageCount!: number;
  public lastSeenAt!: Date;
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
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
      validate: {
        isIP: true,
        notEmpty: true,
      },
      comment: 'IP地址，支持IPv4和IPv6',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      comment: '国家',
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '地区/省',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '城市',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90,
      },
      comment: '纬度',
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180,
      },
      comment: '经度',
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '时区',
    },
    isp: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'ISP信息',
    },
    usageCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '使用次数',
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '最后使用时间',
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
      {
        fields: ['ipAddress'],
        unique: true,
        name: 'ip_address_unique',
      },
      {
        fields: ['country'],
        name: 'country_index',
      },
      {
        fields: ['region'],
        name: 'region_index',
      },
      {
        fields: ['city'],
        name: 'city_index',
      },
      {
        fields: ['usageCount'],
        name: 'usage_count_index',
      },
      {
        fields: ['lastSeenAt'],
        name: 'last_seen_index',
      },
      {
        fields: ['latitude', 'longitude'],
        name: 'location_index',
      },
    ],
    hooks: {
      beforeValidate: (userGeo: UserGeo) => {
        // 标准化IP地址
        if (userGeo.ipAddress) {
          userGeo.ipAddress = userGeo.ipAddress.trim().toLowerCase();
        }
      },
    },
  }
);

// 静态方法
(UserGeo as any).createOrUpdate = async function (geoData: {
  ipAddress: string;
  country: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}): Promise<UserGeo> {
  const [userGeo, created] = await UserGeo.findOrCreate({
    where: { ipAddress: geoData.ipAddress },
    defaults: {
      ipAddress: geoData.ipAddress,
      country: geoData.country,
      region: geoData.region,
      city: geoData.city,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      timezone: geoData.timezone,
      isp: geoData.isp,
    },
  });

  if (!created) {
    // 更新使用次数和最后使用时间
    await userGeo.update({
      usageCount: userGeo.usageCount + 1,
      lastSeenAt: new Date(),
    });
  }

  return userGeo;
};

(UserGeo as any).getTopLocations = async function (
  limit: number = 10,
  timeRange?: { start: Date; end: Date }
): Promise<
  Array<{ id: number; country: string; city: string; usageCount: number }>
> {
  const where: Record<string, unknown> = {};
  if (timeRange) {
    where.lastSeenAt = {
      [Op.between]: [timeRange.start, timeRange.end],
    };
  }

  const results = await UserGeo.findAll({
    where,
    attributes: ['id', 'country', 'city', 'usageCount'],
    order: [['usageCount', 'DESC']],
    limit,
    raw: true,
  });

  return results.map(result => ({
    id: result.id,
    country: result.country || '',
    city: result.city || '',
    usageCount: result.usageCount,
  }));
};

(UserGeo as any).getLocationStats = async function (
  params: {
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'country' | 'region' | 'city';
  } = {}
): Promise<Array<Record<string, unknown>>> {
  const { startDate, endDate, groupBy = 'country' } = params;

  const where: Record<string, unknown> = {};
  if (startDate) where.lastSeenAt = { [Op.gte]: startDate };
  if (endDate)
    where.lastSeenAt = { ...(where.lastSeenAt as Record<string, unknown>), [Op.lte]: endDate };

  const results = await UserGeo.findAll({
    where,
    attributes: [
      groupBy,
      [sequelize.fn('SUM', sequelize.col('usageCount')), 'total_usage'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'unique_users'],
      [sequelize.fn('AVG', sequelize.col('usageCount')), 'avg_usage_per_user'],
    ],
    group: [groupBy],
    order: [[sequelize.fn('SUM', sequelize.col('usageCount')), 'DESC']],
    raw: true,
  });

  return results as unknown as Array<Record<string, unknown>>;
};

(UserGeo as any).getCleanupCandidates = async function (
  daysToKeep: number = 365
): Promise<UserGeo[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  return await UserGeo.findAll({
    where: {
      lastSeenAt: {
        [Op.lt]: cutoffDate,
      },
    },
    order: [['lastSeenAt', 'ASC']],
    limit: 1000,
  });
};

(UserGeo as any).cleanupOldData = async function (
  daysToKeep: number = 365
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await UserGeo.destroy({
    where: {
      lastSeenAt: {
        [Op.lt]: cutoffDate,
      },
    },
  });

  return result;
};

export default UserGeo;
